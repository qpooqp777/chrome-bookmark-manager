// utils.js - 工具函數

function BM_escapeHtml(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function BM_escapeReg(str) {
  if (!str) return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function BM_highlightText(text, query) {
  if (!query || !text) return BM_escapeHtml(text || '');
  var esc = BM_escapeReg(query);
  var regex = new RegExp('(' + esc + ')', 'gi');
  return BM_escapeHtml(text).replace(regex, '<span class="highlight">$1</span>');
}

function BM_openBookmark(url) {
  if (!url) return;
  chrome.tabs.create({ url: url, active: true });
  window.close();
}

function BM_showToast(msg, isError) {
  var toast = document.getElementById('bm-toast');
  if (!toast) return;
  toast.textContent = msg;
  var cls = 'toast show';
  if (isError) cls += ' error';
  toast.className = cls;
  setTimeout(function() {
    toast.className = 'toast';
  }, 2500);
}

function BM_updateAllTexts() {
  // App title
  var appTitle = document.getElementById('appTitle');
  if (appTitle) appTitle.textContent = BM_T('title');
  
  // Search placeholder
  var searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.placeholder = BM_T('searchPlaceholder');
  
  // Tabs
  var tabSearch = document.getElementById('tabSearch');
  var tabDup = document.getElementById('tabDup');
  var tabBatch = document.getElementById('tabBatch');
  var tabExport = document.getElementById('tabExport');
  
  if (tabSearch) tabSearch.textContent = BM_T('searchTab');
  if (tabDup) tabDup.textContent = BM_T('duplicatesTab');
  if (tabBatch) tabBatch.textContent = BM_T('batchTab');
  if (tabExport) tabExport.textContent = BM_T('exportTab');
  
  // Folder selects
  var searchFolderOpt = document.querySelector('#searchFolderSelect option');
  if (searchFolderOpt) searchFolderOpt.textContent = BM_T('selectFolderSearch');
  
  var folderOpt = document.querySelector('#folderSelect option');
  if (folderOpt) folderOpt.textContent = BM_T('allFolders');
  
  // Select all
  var selectAllLabel = document.getElementById('selectAllLabel');
  if (selectAllLabel) selectAllLabel.textContent = BM_T('selectAll');
  
  // Buttons
  var delBtn = document.getElementById('deleteBtn');
  var movBtn = document.getElementById('moveBtn');
  if (delBtn) delBtn.textContent = BM_T('delete');
  if (movBtn) movBtn.textContent = BM_T('move');
  
  // Modal
  var settingsTitle = document.getElementById('settingsTitle');
  var langLabel = document.getElementById('langLabel');
  var winLabel = document.getElementById('winLabel');
  var cancelBtn = document.getElementById('cancelBtn');
  var saveBtn = document.getElementById('saveBtn');
  
  if (settingsTitle) settingsTitle.textContent = BM_T('settingsTitle');
  if (langLabel) langLabel.textContent = BM_T('lang');
  if (winLabel) winLabel.textContent = BM_T('windowSize');
  if (cancelBtn) cancelBtn.textContent = BM_T('cancel');
  if (saveBtn) saveBtn.textContent = BM_T('save');
  
  // Export
  var expHtmlT = document.getElementById('expHtmlT');
  var expHtmlD = document.getElementById('expHtmlD');
  var expJsonT = document.getElementById('expJsonT');
  var expJsonD = document.getElementById('expJsonD');
  var expMdT = document.getElementById('expMdT');
  var expMdD = document.getElementById('expMdD');
  
  if (expHtmlT) expHtmlT.textContent = BM_T('exportHtml');
  if (expHtmlD) expHtmlD.textContent = BM_T('exportHtmlDesc');
  if (expJsonT) expJsonT.textContent = BM_T('exportJson');
  if (expJsonD) expJsonD.textContent = BM_T('exportJsonDesc');
  if (expMdT) expMdT.textContent = BM_T('exportMd');
  if (expMdD) expMdD.textContent = BM_T('exportMdDesc');
}
