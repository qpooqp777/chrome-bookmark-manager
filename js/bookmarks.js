// bookmarks.js - 書籤操作

var BM_allBookmarks = [];
var BM_allFolders = [];
var BM_selectedIds = {};
var BM_currentQuery = '';
var BM_foldersLoaded = false;
var BM_lastResults = [];
var BM_editingBookmark = null;

// IndexedDB for caching
function BM_initDB() {
  return new Promise(function(resolve, reject) {
    var request = indexedDB.open('BookmarkManager', 1);
    request.onerror = function() { reject(); };
    request.onsuccess = function(e) { resolve(e.target.result); };
    request.onupgradeneeded = function(e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
    };
  });
}

var BM_dbPromise = BM_initDB();

async function BM_saveCache(key, data) {
  try {
    var db = await BM_dbPromise;
    var tx = db.transaction('cache', 'readwrite');
    var store = tx.objectStore('cache');
    store.put({ key: key, data: data, time: Date.now() });
  } catch (e) {}
}

async function BM_loadCache(key) {
  try {
    var db = await BM_dbPromise;
    var tx = db.transaction('cache', 'readonly');
    var store = tx.objectStore('cache');
    return new Promise(function(resolve) {
      var req = store.get(key);
      req.onsuccess = function() { resolve(req.result ? req.result.data : null); };
      req.onerror = function() { resolve(null); };
    });
  } catch (e) { return null; }
}

async function BM_loadBookmarks() {
  try {
    var tree = await chrome.bookmarks.getTree();
    BM_allBookmarks = [];
    BM_allFolders = [];
    BM_parseTree(tree[0], '', BM_allBookmarks, BM_allFolders);
    BM_foldersLoaded = true;
    
    // Populate folder selects
    BM_populateAllFolderSelects();
    
    return { bookmarks: BM_allBookmarks, folders: BM_allFolders };
  } catch (e) {
    BM_foldersLoaded = true;
    return { bookmarks: [], folders: [] };
  }
}

function BM_parseTree(node, parentPath, bookmarks, folders) {
  if (node.url) {
    var folderName = parentPath || BM_T('allFolders');
    bookmarks.push({
      id: node.id,
      title: node.title,
      url: node.url,
      folder: folderName,
      dateAdded: node.dateAdded
    });
  }
  if (node.children) {
    var path = parentPath ? parentPath + ' > ' + node.title : node.title;
    if (!node.url) {
      folders.push({ id: node.id, title: node.title, path: path });
    }
    for (var i = 0; i < node.children.length; i++) {
      BM_parseTree(node.children[i], path, bookmarks, folders);
    }
  }
}

function BM_populateAllFolderSelects() {
  var folders = BM_allFolders;
  
  // Search folder select
  var searchSelect = document.getElementById('searchFolderSelect');
  if (searchSelect) {
    searchSelect.innerHTML = '<option value="">所有資料夾</option>';
    for (var i = 0; i < folders.length; i++) {
      var opt = document.createElement('option');
      opt.value = folders[i].path;
      opt.textContent = folders[i].path;
      searchSelect.appendChild(opt);
    }
    searchSelect.disabled = false;
  }
  
  // Batch folder select
  var batchSelect = document.getElementById('folderSelect');
  if (batchSelect) {
    batchSelect.innerHTML = '<option value="">所有資料夾</option>';
    for (var j = 0; j < folders.length; j++) {
      var opt2 = document.createElement('option');
      opt2.value = folders[j].path;
      opt2.textContent = folders[j].path;
      batchSelect.appendChild(opt2);
    }
    batchSelect.disabled = false;
  }
}

async function BM_search(query, folderFilter) {
  var data = await BM_loadBookmarks();
  if (!query.trim() && !folderFilter) return [];
  var q = query.toLowerCase();
  
  return data.bookmarks.filter(function(b) {
    var matchQ = !q || b.title.toLowerCase().indexOf(q) !== -1 || b.url.toLowerCase().indexOf(q) !== -1;
    var matchF = !folderFilter || b.folder.indexOf(folderFilter) !== -1;
    return matchQ && matchF;
  });
}

function BM_displaySearchResults(results) {
  var container = document.getElementById('searchResults');
  if (!container) return;
  
  BM_currentQuery = document.getElementById('searchInput') ? document.getElementById('searchInput').value : '';
  BM_lastResults = results;
  
  // Save to IndexedDB including scroll position and folder
  var scrollTop = container.scrollTop;
  var folderSelect = document.getElementById('searchFolderSelect');
  var selectedFolder = folderSelect ? folderSelect.value : '';
  BM_saveCache('lastResults', { 
    results: results, 
    scrollTop: scrollTop,
    folder: selectedFolder,
    query: BM_currentQuery
  });
  
  if (results.length === 0) {
    container.innerHTML = '<div class="empty-state"><span class="material-icons">search_off</span><p>' + 
      (BM_currentQuery ? BM_T('noResults') : BM_T('inputKeyword')) + '</p></div>';
    return;
  }
  
  var html = '';
  var max = Math.min(results.length, 50);
  for (var i = 0; i < max; i++) {
    var b = results[i];
    html += '<div class="bookmark-item">' +
      '<div class="bookmark-info">' +
      '<div class="bookmark-title">' + BM_highlightText(b.title, BM_currentQuery) + '</div>' +
      '<div class="bookmark-url">' + BM_highlightText(b.url, BM_currentQuery) + '</div>' +
      '<span class="chip" style="margin-top:4px;">' + BM_escapeHtml(b.folder) + '</span>' +
      '</div>' +
      '<div class="bookmark-actions">' +
      '<button class="action-btn open" data-url="' + BM_escapeHtml(b.url) + '" title="開啟"><span class="material-icons" style="font-size:18px;">open_in_new</span></button>' +
      '<button class="action-btn edit" data-id="' + b.id + '" data-title="' + BM_escapeHtml(b.title) + '" data-url="' + BM_escapeHtml(b.url) + '" data-folder="' + BM_escapeHtml(b.folder) + '" title="編輯"><span class="material-icons" style="font-size:18px;">edit</span></button>' +
      '<button class="action-btn delete" data-id="' + b.id + '" title="刪除"><span class="material-icons" style="font-size:18px;">delete</span></button>' +
      '</div>' +
      '</div>';
  }
  container.innerHTML = html;
  
  // Bind open buttons
  var openBtns = container.querySelectorAll('.action-btn.open');
  for (var k = 0; k < openBtns.length; k++) {
    openBtns[k].addEventListener('click', function(e) {
      e.stopPropagation();
      var url = this.dataset.url;
      if (url) {
        chrome.tabs.create({ url: url, active: true });
        window.close();
      }
    });
  }
  
  // Bind edit buttons
  var editBtns = container.querySelectorAll('.action-btn.edit');
  for (var m = 0; m < editBtns.length; m++) {
    editBtns[m].addEventListener('click', function(e) {
      e.stopPropagation();
      BM_showEditModal({
        id: this.dataset.id,
        title: this.dataset.title,
        url: this.dataset.url,
        folder: this.dataset.folder
      });
    });
  }
  
  // Bind delete buttons
  var delBtns = container.querySelectorAll('.action-btn.delete');
  for (var n = 0; n < delBtns.length; n++) {
    delBtns[n].addEventListener('click', function(e) {
      e.stopPropagation();
      var id = this.dataset.id;
      if (confirm('確定刪除此書籤？')) {
        chrome.bookmarks.remove(id).then(function() {
          BM_showToast(BM_T('deleted'));
          var query = document.getElementById('searchInput') ? document.getElementById('searchInput').value : '';
          var folder = document.getElementById('searchFolderSelect') ? document.getElementById('searchFolderSelect').value : '';
          BM_search(query, folder).then(BM_displaySearchResults);
        }).catch(function() {
          BM_showToast(BM_T('deleteFailed'), true);
        });
      }
    });
  }
  
  BM_applySettings();
}

// Edit Modal Functions
function BM_showEditModal(bookmark) {
  BM_editingBookmark = bookmark;
  var modal = document.getElementById('editModal');
  var titleInput = document.getElementById('editTitleInput');
  var urlInput = document.getElementById('editUrlInput');
  var folderPath = document.getElementById('editFolderPath');
  
  if (titleInput) titleInput.value = bookmark.title || '';
  if (urlInput) urlInput.value = bookmark.url || '';
  if (folderPath) folderPath.textContent = bookmark.folder || '';
  
  if (modal) modal.style.display = 'flex';
}

function BM_hideEditModal() {
  var modal = document.getElementById('editModal');
  if (modal) modal.style.display = 'none';
  BM_editingBookmark = null;
}

function BM_testUrl() {
  var urlInput = document.getElementById('editUrlInput');
  if (!urlInput || !urlInput.value) return;
  var url = urlInput.value.trim();
  if (url.indexOf('://') === -1) url = 'https://' + url;
  chrome.tabs.create({ url: url, active: true });
}

async function BM_saveEdit() {
  if (!BM_editingBookmark) return;
  
  var titleInput = document.getElementById('editTitleInput');
  var urlInput = document.getElementById('editUrlInput');
  
  var newTitle = titleInput ? titleInput.value.trim() : '';
  var newUrl = urlInput ? urlInput.value.trim() : '';
  
  if (!newTitle || !newUrl) {
    BM_showToast('請填寫名稱和網址', true);
    return;
  }
  
  try {
    await chrome.bookmarks.update(BM_editingBookmark.id, {
      title: newTitle,
      url: newUrl
    });
    BM_hideEditModal();
    BM_showToast('已儲存');
    
    // Refresh results
    var query = document.getElementById('searchInput') ? document.getElementById('searchInput').value : '';
    var folder = document.getElementById('searchFolderSelect') ? document.getElementById('searchFolderSelect').value : '';
    BM_search(query, folder).then(BM_displaySearchResults);
  } catch (e) {
    BM_showToast('儲存失敗', true);
  }
}

async function BM_findDuplicates() {
  var data = await BM_loadBookmarks();
  var urlMap = {};
  for (var i = 0; i < data.bookmarks.length; i++) {
    var b = data.bookmarks[i];
    if (urlMap[b.url]) {
      urlMap[b.url].push(b);
    } else {
      urlMap[b.url] = [b];
    }
  }
  var result = [];
  var keys = Object.keys(urlMap);
  for (var j = 0; j < keys.length; j++) {
    if (urlMap[keys[j]].length > 1) {
      result.push(urlMap[keys[j]]);
    }
  }
  return result;
}

async function BM_displayDuplicates() {
  var container = document.getElementById('duplicatesContent');
  if (!container) return;
  
  var duplicates = await BM_findDuplicates();
  
  if (duplicates.length === 0) {
    container.innerHTML = '<div class="empty-state"><span class="material-icons">check_circle</span><p>' + BM_T('noDuplicates') + '</p></div>';
    return;
  }
  
  var html = '';
  for (var i = 0; i < duplicates.length; i++) {
    var group = duplicates[i];
    html += '<div class="duplicate-group"><div class="duplicate-header"><span class="material-icons" style="font-size:18px;">content_copy</span> ' +
      BM_T('duplicates', { n: group.length }) + '</div>';
    for (var j = 0; j < group.length; j++) {
      var b = group[j];
      html += '<div class="bookmark-item">' +
        '<div class="bookmark-info"><div class="bookmark-title">' + BM_escapeHtml(b.title) + '</div>' +
        '<div class="bookmark-url">' + BM_escapeHtml(b.url) + '</div></div>' +
        '<span class="chip">' + BM_escapeHtml(b.folder) + '</span>' +
        (j > 0 ? '<button class="btn btn-small btn-danger ripple" data-id="' + b.id + '">' +
         '<span class="material-icons" style="font-size:18px;">delete</span></button>' :
         '<span class="keep-badge"><span class="material-icons" style="font-size:18px;color:#4caf50;">check</span></span>') +
        '</div>';
    }
    html += '</div>';
  }
  container.innerHTML = html;
  
  var btns = container.querySelectorAll('.btn-danger');
  for (var k = 0; k < btns.length; k++) {
    btns[k].addEventListener('click', function() {
      var id = this.dataset.id;
      chrome.bookmarks.remove(id).then(function() {
        BM_showToast(BM_T('deleted'));
        BM_displayDuplicates();
      }).catch(function() {
        BM_showToast(BM_T('deleteFailed'), true);
      });
    });
  }
  BM_applySettings();
}

async function BM_displayBatchList(folderFilter, searchQuery) {
  var data = await BM_loadBookmarks();
  var container = document.getElementById('batchList');
  
  if (!container) return;
  
  var filtered = data.bookmarks;
  
  // Filter by folder
  if (folderFilter) {
    var temp = [];
    for (var k = 0; k < filtered.length; k++) {
      if (filtered[k].folder.indexOf(folderFilter) !== -1) {
        temp.push(filtered[k]);
      }
    }
    filtered = temp;
  }
  
  // Filter by search
  if (searchQuery) {
    var q = searchQuery.toLowerCase();
    var temp2 = [];
    for (var m = 0; m < filtered.length; m++) {
      if (filtered[m].title.toLowerCase().indexOf(q) !== -1 || filtered[m].url.toLowerCase().indexOf(q) !== -1) {
        temp2.push(filtered[m]);
      }
    }
    filtered = temp2;
  }
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state"><span class="material-icons">folder_open</span><p>' + BM_T('emptyFolder') + '</p></div>';
    BM_updateSelectedCount();
    return;
  }
  
  var html = '';
  var max = Math.min(filtered.length, 100);
  for (var n = 0; n < max; n++) {
    var b = filtered[n];
    html += '<div class="bookmark-item">' +
      '<input type="checkbox" class="batch-check" data-id="' + b.id + '">' +
      '<div class="bookmark-info"><div class="bookmark-title">' + BM_escapeHtml(b.title) + '</div>' +
      '<div class="bookmark-url">' + BM_escapeHtml(b.url) + '</div></div>' +
      '<span class="chip">' + BM_escapeHtml(b.folder) + '</span>' +
      '<button class="btn btn-small btn-contained ripple open-btn" data-url="' + BM_escapeHtml(b.url) + '">' +
      '<span class="material-icons" style="font-size:18px;">open_in_new</span></button>' +
      '</div>';
  }
  container.innerHTML = html;
  
  // Bind checkboxes
  var checks = container.querySelectorAll('.batch-check');
  for (var p = 0; p < checks.length; p++) {
    checks[p].addEventListener('change', BM_updateSelectedCount);
  }
  
  // Bind open buttons
  var openBtns = container.querySelectorAll('.open-btn');
  for (var r = 0; r < openBtns.length; r++) {
    openBtns[r].addEventListener('click', function(e) {
      e.stopPropagation();
      var url = this.dataset.url;
      if (url) {
        chrome.tabs.create({ url: url, active: true });
        window.close();
      }
    });
  }
  
  BM_updateSelectedCount();
  BM_applySettings();
}

function BM_updateSelectedCount() {
  var checks = document.querySelectorAll('.batch-check:checked');
  var count = checks.length;
  var countEl = document.getElementById('selectedCount');
  var delBtn = document.getElementById('deleteBtn');
  var movBtn = document.getElementById('moveBtn');
  
  if (countEl) countEl.textContent = BM_T('selected', { n: count });
  if (delBtn) delBtn.disabled = count === 0;
  if (movBtn) movBtn.disabled = count === 0;
  
  BM_selectedIds = {};
  for (var i = 0; i < checks.length; i++) {
    BM_selectedIds[checks[i].dataset.id] = true;
  }
}

function BM_toggleSelectAll() {
  var selectAll = document.getElementById('selectAllCheck');
  var checks = document.querySelectorAll('.batch-check');
  for (var i = 0; i < checks.length; i++) {
    checks[i].checked = selectAll ? selectAll.checked : false;
  }
  BM_updateSelectedCount();
}

async function BM_deleteSelected() {
  var ids = Object.keys(BM_selectedIds);
  if (ids.length === 0) return;
  if (!confirm(BM_T('confirmDelete', { n: ids.length }))) return;
  
  try {
    for (var i = 0; i < ids.length; i++) {
      await chrome.bookmarks.remove(ids[i]);
    }
    BM_showToast(BM_T('deleted'));
    var selectAll = document.getElementById('selectAllCheck');
    if (selectAll) selectAll.checked = false;
    var folderSel = document.getElementById('folderSelect');
    var searchInput = document.getElementById('batchSearchInput');
    BM_displayBatchList(folderSel ? folderSel.value : '', searchInput ? searchInput.value : '');
  } catch (e) {
    BM_showToast(BM_T('deleteFailed'), true);
  }
}

var BM_selectedTargetFolder = null;

function BM_showMoveModal() {
  var ids = Object.keys(BM_selectedIds);
  if (ids.length === 0) return;
  
  var modal = document.getElementById('moveModal');
  var list = document.getElementById('folderList');
  if (!modal || !list) return;
  
  BM_selectedTargetFolder = null;
  
  // Build folder list
  var html = '';
  for (var i = 0; i < BM_allFolders.length; i++) {
    var f = BM_allFolders[i];
    html += '<div class="folder-list-item" data-id="' + f.id + '">' +
      '<span class="material-icons" style="font-size:20px;">folder</span>' +
      '<span>' + BM_escapeHtml(f.path) + '</span></div>';
  }
  list.innerHTML = html;
  
  // Bind click events
  var items = list.querySelectorAll('.folder-list-item');
  for (var j = 0; j < items.length; j++) {
    items[j].addEventListener('click', function() {
      var prev = list.querySelector('.selected');
      if (prev) prev.classList.remove('selected');
      this.classList.add('selected');
      BM_selectedTargetFolder = this.dataset.id;
    });
  }
  
  modal.style.display = 'flex';
}

function BM_hideMoveModal() {
  var modal = document.getElementById('moveModal');
  if (modal) modal.style.display = 'none';
  BM_selectedTargetFolder = null;
}

async function BM_confirmMove() {
  if (!BM_selectedTargetFolder) {
    BM_showToast('請選擇目標資料夾', true);
    return;
  }
  
  var ids = Object.keys(BM_selectedIds);
  
  try {
    for (var i = 0; i < ids.length; i++) {
      await chrome.bookmarks.move(ids[i], { parentId: BM_selectedTargetFolder });
    }
    BM_hideMoveModal();
    BM_showToast('已移動 ' + ids.length + ' 個書籤');
    BM_displayBatchList('', '');
  } catch (e) {
    BM_showToast(BM_T('moveFailed'), true);
  }
}

function BM_moveSelected() {
  BM_showMoveModal();
}

async function BM_export(format) {
  var data = await BM_loadBookmarks();
  var content, filename, type;
  
  if (format === 'json') {
    content = JSON.stringify(data.bookmarks, null, 2);
    filename = 'bookmarks.json';
    type = 'application/json';
  } else if (format === 'markdown') {
    content = '# Bookmarks\n\n';
    for (var i = 0; i < data.bookmarks.length; i++) {
      var b = data.bookmarks[i];
      content += '- [' + b.title + '](' + b.url + ')\n';
    }
    filename = 'bookmarks.md';
    type = 'text/markdown';
  } else {
    content = '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL><p>\n';
    for (var k = 0; k < data.bookmarks.length; k++) {
      var bm = data.bookmarks[k];
      content += '    <DT><A HREF="' + BM_escapeHtml(bm.url) + '">' + BM_escapeHtml(bm.title) + '</A>\n';
    }
    content += '</DL><p>';
    filename = 'bookmarks.html';
    type = 'text/html';
  }
  
  var blob = new Blob([content], { type: type });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  BM_showToast(BM_T('exported') + ' ' + filename);
}

function BM_showStats() {
  var data = BM_allBookmarks;
  var folders = BM_allFolders;
  
  // Update totals
  var totalEl = document.getElementById('totalBookmarks');
  var foldersEl = document.getElementById('totalFolders');
  if (totalEl) totalEl.textContent = data.length;
  if (foldersEl) foldersEl.textContent = folders.length;
  
  // Count by domain
  var domainCounts = {};
  for (var i = 0; i < data.length; i++) {
    var url = data[i].url || '';
    var domain = url;
    try {
      domain = url.split('/')[2] || url;
    } catch (e) {}
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
  }
  
  // Sort domains by count
  var sortedDomains = [];
  var domainKeys = Object.keys(domainCounts);
  for (var j = 0; j < domainKeys.length; j++) {
    sortedDomains.push({ domain: domainKeys[j], count: domainCounts[domainKeys[j]] });
  }
  sortedDomains.sort(function(a, b) { return b.count - a.count; });
  
  // Display domain stats
  var domainList = document.getElementById('domainStatsList');
  if (domainList) {
    var html = '';
    for (var k = 0; k < Math.min(sortedDomains.length, 10); k++) {
      html += '<div class="stats-item domain-item" data-domain="' + BM_escapeHtml(sortedDomains[k].domain) + '">' +
        '<span class="stats-item-name">' + BM_escapeHtml(sortedDomains[k].domain) + '</span>' +
        '<span class="stats-item-count clickable">' + sortedDomains[k].count + '</span>' +
        '</div>';
    }
    domainList.innerHTML = html || '<div class="empty-state"><span class="material-icons">language</span><p>無網域資料</p></div>';
    
    // Bind click events for domain
    var domainItems = domainList.querySelectorAll('.domain-item');
    for (var m = 0; m < domainItems.length; m++) {
      domainItems[m].addEventListener('click', function() {
        var domain = this.dataset.domain;
        BM_switchToSearchWithDomain(domain);
      });
    }
  }
  
  // Count by folder
  var folderCounts = {};
  for (var n = 0; n < data.length; n++) {
    var folder = data[n].folder || 'Other';
    folderCounts[folder] = (folderCounts[folder] || 0) + 1;
  }
  
  // Sort folders by count
  var sortedFolders = [];
  var folderKeys = Object.keys(folderCounts);
  for (var p = 0; p < folderKeys.length; p++) {
    sortedFolders.push({ name: folderKeys[p], count: folderCounts[folderKeys[p]] });
  }
  sortedFolders.sort(function(a, b) { return b.count - a.count; });
  
  // Display folder stats
  var folderStatsList = document.getElementById('folderStatsList');
  if (folderStatsList) {
    var html2 = '';
    for (var q = 0; q < Math.min(sortedFolders.length, 20); q++) {
      html2 += '<div class="stats-item folder-item" data-folder="' + BM_escapeHtml(sortedFolders[q].name) + '">' +
        '<span class="stats-item-name">' + BM_escapeHtml(sortedFolders[q].name) + '</span>' +
        '<span class="stats-item-count clickable">' + sortedFolders[q].count + '</span>' +
        '</div>';
    }
    folderStatsList.innerHTML = html2 || '<div class="empty-state"><span class="material-icons">folder</span><p>無資料</p></div>';
    
    // Bind click events for folder
    var folderItems = folderStatsList.querySelectorAll('.folder-item');
    for (var r = 0; r < folderItems.length; r++) {
      folderItems[r].addEventListener('click', function() {
        var folder = this.dataset.folder;
        BM_switchToSearchWithFolder(folder);
      });
    }
  }
}

function BM_switchToSearchWithDomain(domain) {
  // Switch to search tab
  var searchTab = document.getElementById('search-tab');
  var menuBtns = document.querySelectorAll('.menu-btn');
  var contents = document.querySelectorAll('.tab-content');
  
  for (var i = 0; i < contents.length; i++) {
    contents[i].classList.remove('active');
  }
  for (var j = 0; j < menuBtns.length; j++) {
    menuBtns[j].classList.remove('active');
  }
  
  var searchMenu = document.querySelector('.menu-btn[data-tab="search"]');
  if (searchMenu) {
    searchMenu.classList.add('active');
    BM_updateMenuIndicator(searchMenu);
  }
  if (searchTab) searchTab.classList.add('active');
  
  // Show search bar
  var searchBar = document.getElementById('searchBar');
  if (searchBar) searchBar.style.display = 'block';
  
  // Set search query to domain
  var searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = domain;
    var folderSel = document.getElementById('searchFolderSelect');
    BM_search(domain, folderSel ? folderSel.value : '').then(BM_displaySearchResults);
  }
}

function BM_switchToSearchWithFolder(folder) {
  // Switch to search tab
  var searchTab = document.getElementById('search-tab');
  var menuBtns = document.querySelectorAll('.menu-btn');
  var contents = document.querySelectorAll('.tab-content');
  
  for (var i = 0; i < contents.length; i++) {
    contents[i].classList.remove('active');
  }
  for (var j = 0; j < menuBtns.length; j++) {
    menuBtns[j].classList.remove('active');
  }
  
  var searchMenu = document.querySelector('.menu-btn[data-tab="search"]');
  if (searchMenu) {
    searchMenu.classList.add('active');
    BM_updateMenuIndicator(searchMenu);
  }
  if (searchTab) searchTab.classList.add('active');
  
  // Show search bar
  var searchBar = document.getElementById('searchBar');
  if (searchBar) searchBar.style.display = 'block';
  
  // Set folder filter
  var folderSel = document.getElementById('searchFolderSelect');
  if (folderSel) folderSel.value = folder;
  var searchInput = document.getElementById('searchInput');
  BM_search(searchInput ? searchInput.value : '', folder).then(BM_displaySearchResults);
}
