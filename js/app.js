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
    // Auto search with current folder filter
    var folderSel = document.getElementById('searchFolderSelect');
    var folder = folderSel ? folderSel.value : '';
    BM_search('', folder).then(BM_displaySearchResults);
  } else if (tabName === 'duplicates') {
    BM_displayDuplicates();
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
  
  // Load bookmarks and auto search
  BM_loadBookmarks().then(function() {
    BM_search('', '').then(BM_displaySearchResults);
  });
  
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
  BM_loadCache('lastResults').then(function(results) {
    if (results && results.length > 0) {
      BM_lastResults = results;
      BM_displaySearchResults(results);
    }
  });
}

// Start when DOM ready
document.addEventListener('DOMContentLoaded', BM_init);
