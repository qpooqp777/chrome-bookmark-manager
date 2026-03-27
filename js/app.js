// app.js - 主程式初始化

function BM_updateTabIndicator(tabEl) {
  var indicator = document.getElementById('tabIndicator');
  if (!indicator || !tabEl) return;
  var rect = tabEl.getBoundingClientRect();
  var parentRect = tabEl.parentElement.getBoundingClientRect();
  indicator.style.left = (rect.left - parentRect.left) + 'px';
  indicator.style.width = rect.width + 'px';
}

function BM_updateMenuIndicator(menuEl) {
  var indicator = document.getElementById('menuIndicator');
  if (!indicator || !menuEl) return;
  var rect = menuEl.getBoundingClientRect();
  var parentRect = menuEl.parentElement.getBoundingClientRect();
  indicator.style.left = (rect.left - parentRect.left) + 'px';
  indicator.style.width = rect.width + 'px';
}

function BM_switchTab(tabName) {
  var contents = document.querySelectorAll('.tab-content');
  for (var i = 0; i < contents.length; i++) {
    contents[i].classList.remove('active');
  }
  var menus = document.querySelectorAll('.menu-btn');
  for (var j = 0; j < menus.length; j++) {
    menus[j].classList.remove('active');
  }
  
  var targetMenu = document.querySelector('.menu-btn[data-tab="' + tabName + '"]');
  if (targetMenu) {
    targetMenu.classList.add('active');
    BM_updateMenuIndicator(targetMenu);
  }
  
  var targetContent = document.getElementById(tabName + '-tab');
  if (targetContent) {
    targetContent.classList.add('active');
  }
  
  // Show/hide search bar
  var searchBar = document.getElementById('searchBar');
  if (searchBar) {
    searchBar.style.display = (tabName === 'search') ? 'block' : 'none';
  }
  
  // Load data for specific tabs
  if (tabName === 'search') {
    // Don't auto-search, keep existing results or empty
  } else if (tabName === 'duplicates') {
    BM_displayDuplicates();
  } else if (tabName === 'stats') {
    BM_showStats();
  } else if (tabName === 'batch') {
    BM_displayBatchList('', '');
  }
  
  BM_updateAllTexts();
}

function BM_init() {
  // Load settings
  BM_loadSettings();
  
  // Apply settings
  BM_applySettings();
  
  // Show search bar by default
  var searchBar = document.getElementById('searchBar');
  if (searchBar) {
    searchBar.style.display = 'block';
  }
  
  // Load bookmarks for folder selects (don't auto-search)
  BM_loadBookmarks();
  
  // Update all texts
  BM_updateAllTexts();
  
  // Menu switching
  var menus = document.querySelectorAll('.menu-btn');
  for (var i = 0; i < menus.length; i++) {
    menus[i].addEventListener('click', function() {
      BM_switchTab(this.dataset.tab);
    });
  }
  
  // Initialize menu indicator
  var activeMenu = document.querySelector('.menu-btn.active');
  if (activeMenu) BM_updateMenuIndicator(activeMenu);
  
  // Search
  var searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      var query = document.getElementById('searchInput').value;
      var folder = document.getElementById('searchFolderSelect').value;
      BM_search(query, folder).then(BM_displaySearchResults);
    });
  }
  
  var searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        var query = searchInput.value;
        var folder = document.getElementById('searchFolderSelect').value;
        BM_search(query, folder).then(BM_displaySearchResults);
      }
    });
  }
  
  var searchFolderSel = document.getElementById('searchFolderSelect');
  if (searchFolderSel) {
    searchFolderSel.addEventListener('change', function() {
      var query = document.getElementById('searchInput') ? document.getElementById('searchInput').value : '';
      var folder = searchFolderSel.value;
      BM_search(query, folder).then(BM_displaySearchResults);
    });
  }
  
  // Save scroll position before closing
  window.addEventListener('unload', function() {
    var container = document.getElementById('searchResults');
    if (container) {
      var scrollTop = container.scrollTop;
      var folderSel = document.getElementById('searchFolderSelect');
      var searchInput = document.getElementById('searchInput');
      BM_saveCache('lastScroll', { 
        scrollTop: scrollTop,
        folder: folderSel ? folderSel.value : '',
        query: searchInput ? searchInput.value : ''
      });
    }
  });
  
  // Batch
  var folderSel = document.getElementById('folderSelect');
  if (folderSel) {
    folderSel.addEventListener('change', function() {
      var searchInput = document.getElementById('batchSearchInput');
      BM_displayBatchList(folderSel.value, searchInput ? searchInput.value : '');
    });
  }
  
  var batchSearchInput = document.getElementById('batchSearchInput');
  if (batchSearchInput) {
    batchSearchInput.addEventListener('input', function() {
      var folderSel2 = document.getElementById('folderSelect');
      BM_displayBatchList(folderSel2 ? folderSel2.value : '', batchSearchInput.value);
    });
  }
  
  var selectAllCheck = document.getElementById('selectAllCheck');
  if (selectAllCheck) {
    selectAllCheck.addEventListener('change', BM_toggleSelectAll);
  }
  
  var deleteBtn = document.getElementById('deleteBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', BM_deleteSelected);
  }
  
  var moveBtn = document.getElementById('moveBtn');
  if (moveBtn) {
    moveBtn.addEventListener('click', BM_moveSelected);
  }
  
  // Settings
  var settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', BM_showSettings);
  }
  
  // Help
  var helpBtn = document.getElementById('helpBtn');
  if (helpBtn) {
    helpBtn.addEventListener('click', BM_showHelp);
  }
  
  var closeHelp = document.getElementById('closeHelp');
  if (closeHelp) {
    closeHelp.addEventListener('click', BM_hideHelp);
  }
  
  var helpTabs = document.querySelectorAll('.help-tab');
  for (var hti = 0; hti < helpTabs.length; hti++) {
    helpTabs[hti].addEventListener('click', function() {
      var tab = this.dataset.tab;
      document.querySelectorAll('.help-tab').forEach(function(t) { t.classList.remove('active'); });
      document.querySelectorAll('.help-content').forEach(function(c) { c.style.display = 'none'; });
      this.classList.add('active');
      document.getElementById(tab + '-content').style.display = 'block';
    });
  }
  
  var closeSettings = document.getElementById('closeSettings');
  if (closeSettings) {
    closeSettings.addEventListener('click', BM_hideSettings);
  }
  
  var cancelBtn = document.getElementById('cancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', BM_hideSettings);
  }
  
  var saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', BM_doSaveSettings);
  }
  
  // Export buttons
  var exportHtmlBtn = document.getElementById('exportHtmlBtn');
  if (exportHtmlBtn) {
    exportHtmlBtn.addEventListener('click', function() { BM_export('html'); });
  }
  var exportJsonBtn = document.getElementById('exportJsonBtn');
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', function() { BM_export('json'); });
  }
  var exportMdBtn = document.getElementById('exportMdBtn');
  if (exportMdBtn) {
    exportMdBtn.addEventListener('click', function() { BM_export('markdown'); });
  }
  
  // Close modal on overlay click
  var modal = document.getElementById('settingsModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        BM_hideSettings();
      }
    });
  }
  
  // Move modal
  var cancelMove = document.getElementById('cancelMove');
  if (cancelMove) {
    cancelMove.addEventListener('click', BM_hideMoveModal);
  }
  
  var confirmMove = document.getElementById('confirmMove');
  if (confirmMove) {
    confirmMove.addEventListener('click', BM_confirmMove);
  }
  
  var moveModal = document.getElementById('moveModal');
  if (moveModal) {
    moveModal.addEventListener('click', function(e) {
      if (e.target === moveModal) {
        BM_hideMoveModal();
      }
    });
  }
  
  // Edit modal
  var cancelEdit = document.getElementById('cancelEdit');
  if (cancelEdit) {
    cancelEdit.addEventListener('click', BM_hideEditModal);
  }
  
  var saveEdit = document.getElementById('saveEdit');
  if (saveEdit) {
    saveEdit.addEventListener('click', BM_saveEdit);
  }
  
  var testUrlBtn = document.getElementById('testUrlBtn');
  if (testUrlBtn) {
    testUrlBtn.addEventListener('click', BM_testUrl);
  }
  
  var editModal = document.getElementById('editModal');
  if (editModal) {
    editModal.addEventListener('click', function(e) {
      if (e.target === editModal) {
        BM_hideEditModal();
      }
    });
  }
  
  // Load bookmarks for folder selects
  BM_loadBookmarks();
  
  // Restore last search results from IndexedDB
  BM_loadCache('lastResults').then(function(cached) {
    if (cached && cached.results && cached.results.length > 0) {
      // Restore folder selection
      var folderSel = document.getElementById('searchFolderSelect');
      if (folderSel && cached.folder) {
        folderSel.value = cached.folder;
      }
      // Restore search query
      var searchInput = document.getElementById('searchInput');
      if (searchInput && cached.query !== undefined) {
        searchInput.value = cached.query;
      }
      // Display results
      BM_lastResults = cached.results;
      BM_displaySearchResults(cached.results);
      // Restore scroll position after render
      setTimeout(function() {
        var container = document.getElementById('searchResults');
        if (container && cached.scrollTop) {
          container.scrollTop = cached.scrollTop;
        }
      }, 100);
    }
    // No auto-search if no cache, show empty state
  });
}

// Start when DOM ready
document.addEventListener('DOMContentLoaded', BM_init);

// Help Modal Functions
function BM_showHelp() {
  var modal = document.getElementById('helpModal');
  if (modal) modal.style.display = 'flex';
}

function BM_hideHelp() {
  var modal = document.getElementById('helpModal');
  if (modal) modal.style.display = 'none';
}
