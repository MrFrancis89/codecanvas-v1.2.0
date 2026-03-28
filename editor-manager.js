/* ========== EDITOR MANAGER ==========
   Inicializa e gerencia a instância do CodeMirror.
   Inclui autosave com debounce e pinch-to-zoom corrigido para iOS Safari.
   ==================================== */

const EditorManager = (() => {
  let _cm = null;

  // Estado do pinch-to-zoom
  let _pinchActive = false;
  let _initialDistance = 0;
  let _initialFontSize = 0;
  let _currentFontSize = 16;

  const _updateStatus = () => {
    if (!_cm) return;
    const cursor = _cm.getCursor();
    const sel = _cm.getSelection();
    const content = _cm.getValue();
    document.getElementById('status-line').textContent = cursor.line + 1;
    document.getElementById('status-col').textContent = cursor.ch + 1;
    document.getElementById('status-sel').textContent = sel.length;
    const bytes = new Blob([content]).size;
    const size = bytes < 1024 ? bytes + ' B'
      : bytes < 1048576 ? (bytes / 1024).toFixed(1) + ' KB'
      : (bytes / 1048576).toFixed(2) + ' MB';
    document.getElementById('status-size').textContent = size;
  };

  const _setFontSize = (size) => {
    if (!_cm) return;
    _currentFontSize = Math.min(Math.max(size, 10), 40);
    _cm.getWrapperElement().style.fontSize = _currentFontSize + 'px';
    _cm.refresh();
  };

  const _getCurrentFontSize = () => {
    if (!_cm) return _currentFontSize;
    return parseFloat(getComputedStyle(_cm.getWrapperElement()).fontSize) || _currentFontSize;
  };

  // Converte nomes de modo internos para objetos de modo aceitos pelo CodeMirror 5.
  // 'typescript' e 'json' nao existem como modos independentes no CM5 —
  // ambos sao sub-modos do modo javascript.
  const _resolveMode = (mode) => {
    if (mode === 'typescript') return { name: 'javascript', typescript: true };
    if (mode === 'json')       return { name: 'javascript', json: true };
    return mode;
  };

  // Forca syntax highlighting — necessario no iOS Safari onde o tema
  // nao e aplicado no primeiro render.
  const _forceHighlight = () => {
    if (!_cm) return;
    _cm.setOption('mode', _resolveMode(LangManager.current()));
    _cm.setOption('theme', ThemeManager.current() === 'dark' ? 'one-dark' : 'default');
    _cm.refresh();
  };

  const init = (initialContent) => {
    const textarea = document.getElementById('cm-editor');
    const theme = ThemeManager.current() === 'dark' ? 'one-dark' : 'default';

    if (initialContent !== null && initialContent !== undefined) {
      textarea.value = initialContent;
    }

    _cm = CodeMirror.fromTextArea(textarea, {
      mode: _resolveMode(LangManager.current()),
      theme: theme,
      lineNumbers: true,
      lineWrapping: false,
      indentUnit: AppConfig.INDENT_SIZE,
      tabSize: AppConfig.INDENT_SIZE,
      indentWithTabs: false,
      smartIndent: true,
      electricChars: true,
      autoCloseBrackets: true,
      autoCloseTags: true,
      matchBrackets: true,
      styleActiveLine: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      extraKeys: {
        'Tab': (cm) => {
          if (cm.somethingSelected()) {
            cm.indentSelection('add');
          } else {
            cm.replaceSelection(' '.repeat(AppConfig.INDENT_SIZE), 'end');
          }
        },
        'Shift-Tab': (cm) => cm.indentSelection('subtract'),
        'Ctrl-Z':  (cm) => cm.undo(),
        'Ctrl-Y':  (cm) => cm.redo(),
        'Cmd-Z':   (cm) => cm.undo(),
        'Cmd-Shift-Z': (cm) => cm.redo(),
        'Ctrl-S': () => FileManager.exportFile(),
        'Cmd-S':  () => FileManager.exportFile(),
        'Ctrl-H': () => FindReplaceManager.toggle(),
        'Cmd-H':  () => FindReplaceManager.toggle(),
        'Ctrl-O': () => FileManager.importFile(),
        'Cmd-O':  () => FileManager.importFile(),
        'Escape': () => FindReplaceManager.close(),
      },
      // viewportMargin: Infinity causava travamento do parser de highlighting
      // em arquivos grandes no mobile — renderizava todo o DOM de uma vez,
      // esgotando o budget de CPU antes do highlight terminar (texto branco).
      viewportMargin: 10,
      scrollbarStyle: 'native',
      inputStyle: 'textarea',
    });

    window._cmEditor = _cm;
    _cm.setSize(null, '100%');
    _cm.on('cursorActivity', _updateStatus);

    // Retry em intervalos crescentes ate 5 s: garante que CSS/JS do CDN
    // estejam prontos antes de aplicar tema e modo — critico em mobile.
    [100, 300, 600, 1000, 1800, 3000, 5000].forEach(ms =>
      setTimeout(_forceHighlight, ms)
    );

    // Autosave com debounce
    let _saveTimer = null;
    _cm.on('change', () => {
      FileManager.setDirty(true);
      clearTimeout(_saveTimer);
      _saveTimer = setTimeout(() => {
        StorageManager.set(AppConfig.IDB_KEYS.CONTENT, _cm.getValue());
      }, 600);
    });

    _updateStatus();

    // ── Pinch-to-zoom corrigido para iOS Safari ──────────────────────
    // O viewport NAO deve ter maximum-scale=1.0 para este gesto funcionar.
    // Capturamos touchmove com passive:false para poder chamar preventDefault
    // e bloquear o zoom nativo do Safari apenas durante o gesto de 2 dedos.
    const getDistance = (a, b) =>
      Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);

    const wrapper = _cm.getWrapperElement();

    wrapper.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        _pinchActive = true;
        _initialDistance = getDistance(e.touches[0], e.touches[1]);
        _initialFontSize = _getCurrentFontSize();
      }
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
      if (!_pinchActive || e.touches.length !== 2) return;
      e.preventDefault(); // bloqueia zoom nativo so durante pinça
      const dist  = getDistance(e.touches[0], e.touches[1]);
      const ratio = dist / _initialDistance;
      _setFontSize(_initialFontSize * ratio);
    }, { passive: false });

    const endPinch = (e) => {
      if (e.touches.length < 2) _pinchActive = false;
    };
    wrapper.addEventListener('touchend',    endPinch, { passive: true });
    wrapper.addEventListener('touchcancel', endPinch, { passive: true });
  };

  const getValue     = () => _cm ? _cm.getValue() : '';
  const setValue     = (v) => { if (_cm) { _cm.setValue(v); _cm.clearHistory(); } };
  const getSelection = () => _cm ? _cm.getSelection() : '';
  const focus        = () => _cm && _cm.focus();
  const getCM        = () => _cm;
  const resolveMode  = _resolveMode;
  const refreshHighlight = _forceHighlight;

  return { init, getValue, setValue, getSelection, focus, getCM, resolveMode, refreshHighlight };
})();
