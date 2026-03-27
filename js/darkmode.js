// darkmode.js - 深色模式管理

var BM_isDarkMode = false;

function BM_detectDarkMode() {
  var saved = localStorage.getItem('bookmarkDarkMode');
  if (saved !== null) {
    return saved === 'true';
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function BM_applyDarkMode(isDark) {
  BM_isDarkMode = isDark;
  var body = document.body;
  if (!body) return;
  
  if (isDark) {
    body.setAttribute('data-theme', 'dark');
    body.style.background = '#1a1a2e';
    body.style.color = '#e0e0e0';
  } else {
    body.setAttribute('data-theme', 'light');
    body.style.background = '#fafafa';
    body.style.color = 'rgba(0,0,0,0.87)';
  }
  
  localStorage.setItem('bookmarkDarkMode', isDark ? 'true' : 'false');
  BM_updateDarkModeUI();
}

function BM_toggleDarkMode() {
  BM_applyDarkMode(!BM_isDarkMode);
  BM_showToast(BM_isDarkMode ? BM_T('darkModeOn') : BM_T('darkModeOff'));
}

function BM_updateDarkModeUI() {
  var toggleBtn = document.getElementById('darkModeBtn');
  if (toggleBtn) {
    toggleBtn.textContent = BM_isDarkMode ? 'light_mode' : 'dark_mode';
    toggleBtn.title = BM_isDarkMode ? BM_T('lightMode') : BM_T('darkMode');
  }
}

function BM_addDarkModeStyles() {
  var style = document.getElementById('darkModeStyle');
  if (!style) {
    style = document.createElement('style');
    style.id = 'darkModeStyle';
    document.head.appendChild(style);
  }
  
  style.textContent = [
    '[data-theme="dark"] .app-bar { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important; }',
    '[data-theme="dark"] .search-container { background: #16213e !important; }',
    '[data-theme="dark"] .search-field { background: #0f3460 !important; }',
    '[data-theme="dark"] .search-field:focus-within { background: #1a1a2e !important; box-shadow: 0 0 0 2px #9c27b0 !important; }',
    '[data-theme="dark"] .search-field input { color: #e0e0e0 !important; }',
    '[data-theme="dark"] .tabs-container { background: #16213e !important; }',
    '[data-theme="dark"] .tab-btn { color: #888 !important; }',
    '[data-theme="dark"] .tab-btn:hover { color: #e0e0e0 !important; background: rgba(156,39,176,0.2) !important; }',
    '[data-theme="dark"] .tab-btn.active { color: #e0e0e0 !important; }',
    '[data-theme="dark"] .tab-indicator { background: #9c27b0 !important; }',
    '[data-theme="dark"] .content { background: #1a1a2e !important; }',
    '[data-theme="dark"] .bookmark-item { background: #16213e !important; border-color: #0f3460 !important; }',
    '[data-theme="dark"] .bookmark-item:hover { border-color: #9c27b0 !important; box-shadow: 0 3px 8px rgba(0,0,0,0.4) !important; }',
    '[data-theme="dark"] .bookmark-title { color: #e0e0e0 !important; }',
    '[data-theme="dark"] .bookmark-url { color: #bb86fc !important; }',
    '[data-theme="dark"] .chip { background: rgba(156,39,176,0.3) !important; color: #e0e0e0 !important; }',
    '[data-theme="dark"] .empty-state { background: #16213e !important; }',
    '[data-theme="dark"] .empty-state .material-icons { color: #666 !important; }',
    '[data-theme="dark"] .empty-state p { color: #888 !important; }',
    '[data-theme="dark"] .batch-header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important; }',
    '[data-theme="dark"] .export-card { background: #16213e !important; border-color: #0f3460 !important; }',
    '[data-theme="dark"] .export-card:hover { border-color: #9c27b0 !important; }',
    '[data-theme="dark"] .export-title { color: #e0e0e0 !important; }',
    '[data-theme="dark"] .export-desc { color: #888 !important; }',
    '[data-theme="dark"] .duplicate-group { background: #16213e !important; }',
    '[data-theme="dark"] .folder-select { background: #16213e !important; border-color: #0f3460 !important; color: #e0e0e0 !important; }',
    '[data-theme="dark"] .form-label { color: #888 !important; }',
    '[data-theme="dark"] input[type="number"].form-select { background: #16213e !important; border-color: #0f3460 !important; color: #e0e0e0 !important; }',
    '[data-theme="dark"] ::-webkit-scrollbar-track { background: #1a1a2e !important; }',
    '[data-theme="dark"] ::-webkit-scrollbar-thumb { background: #0f3460 !important; }'
  ].join('\n');
}
