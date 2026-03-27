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
    BM_loadStatsNavTarget(); // Refresh nav target setting
    // Restore scroll position when returning to stats
    var scrollWrapper = document.getElementById('statsScrollWrapper');
    if (scrollWrapper) {
      setTimeout(function() {
        scrollWrapper.scrollTop = BM_statsScrollTop;
      }, 0);
    }
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
  
  // Load stats nav target setting
  BM_loadStatsNavTarget();
  
  // Show search bar by default
  var searchBar = document.getElementById('searchBar');
  if (searchBar) {
    searchBar.style.display = 'block';
  }
  
  // Load bookmarks for folder selects (don't auto-search)
  BM_loadBookmarks();
  
  // Update all texts
  BM_updateAllTexts();
  
  // Bind stats expand buttons
  var expandDomainBtn = document.getElementById('expandDomainStats');
  if (expandDomainBtn) {
    expandDomainBtn.addEventListener('click', BM_expandDomainStats);
  }
  
  var expandFolderBtn = document.getElementById('expandFolderStats');
  if (expandFolderBtn) {
    expandFolderBtn.addEventListener('click', BM_expandFolderStats);
  }
  
  // Bind stats nav target change
  var statsNavSelect = document.getElementById('statsNavTarget');
  if (statsNavSelect) {
    statsNavSelect.addEventListener('change', BM_saveStatsNavTarget);
  }
  
  // Bind refresh stats button
  var refreshStatsBtn = document.getElementById('refreshStatsBtn');
  if (refreshStatsBtn) {
    refreshStatsBtn.addEventListener('click', function() {
      // Store current expanded state
      var domainWasExpanded = BM_statsDomainExpanded;
      var folderWasExpanded = BM_statsFolderExpanded;
      
      // Reset and reload
      BM_statsLoaded = false;
      BM_loadBookmarks().then(function() {
        BM_showStats();
        
        // Re-apply expand if needed
        if (domainWasExpanded) {
          setTimeout(BM_expandDomainStats, 0);
        }
        if (folderWasExpanded) {
          setTimeout(BM_expandFolderStats, 0);
        }
        
        // Restore scroll position
        var scrollWrapper = document.getElementById('statsScrollWrapper');
        if (scrollWrapper) scrollWrapper.scrollTop = BM_statsScrollTop;
        
        BM_showToast('已重新統計');
      });
    });
  }
  
  // Bind stats scroll and back to top
  var statsScrollWrapper = document.getElementById('statsScrollWrapper');
  var statsBackToTop = document.getElementById('statsBackToTop');
  if (statsScrollWrapper && statsBackToTop) {
    // Save scroll position on scroll
    statsScrollWrapper.addEventListener('scroll', function() {
      BM_statsScrollTop = this.scrollTop;
      // Show/hide back to top button
      if (this.scrollTop > 600) {
        statsBackToTop.style.display = 'flex';
      } else {
        statsBackToTop.style.display = 'none';
      }
    });
    
    // Back to top click
    statsBackToTop.addEventListener('click', function() {
      statsScrollWrapper.scrollTop = 0;
    });
  }
  
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
  
  var sortBtn = document.getElementById('sortBtn');
  if (sortBtn) {
    sortBtn.addEventListener('click', BM_showSortModal);
  }
  
  var cancelSort = document.getElementById('cancelSort');
  if (cancelSort) {
    cancelSort.addEventListener('click', BM_hideSortModal);
  }
  
  var confirmSort = document.getElementById('confirmSort');
  if (confirmSort) {
    confirmSort.addEventListener('click', BM_applySort);
  }
  
  var sortAZ = document.getElementById('sortAZ');
  if (sortAZ) {
    sortAZ.addEventListener('click', function() {
      document.querySelectorAll('.sort-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
    });
  }
  
  var sortZA = document.getElementById('sortZA');
  if (sortZA) {
    sortZA.addEventListener('click', function() {
      document.querySelectorAll('.sort-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
    });
  }
  
  var sortModal = document.getElementById('sortModal');
  if (sortModal) {
    sortModal.addEventListener('click', function(e) {
      if (e.target === sortModal) {
        BM_hideSortModal();
      }
    });
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

// Sort Modal Functions
function BM_showSortModal() {
  var modal = document.getElementById('sortModal');
  if (modal) modal.style.display = 'flex';
}

function BM_hideSortModal() {
  var modal = document.getElementById('sortModal');
  if (modal) modal.style.display = 'none';
}

function BM_applySort() {
  var sortType = 'az';
  var activeSort = document.querySelector('.sort-btn.active');
  if (activeSort) sortType = activeSort.dataset.sort;
  
  var showCheckboxes = document.getElementById('sortShowCheckboxes') ? document.getElementById('sortShowCheckboxes').checked : true;
  var showDrag = document.getElementById('sortShowDrag') ? document.getElementById('sortShowDrag').checked : true;
  
  BM_hideSortModal();
  BM_sortBatchList(sortType, showCheckboxes, showDrag);
}

function BM_sortBatchList(sortType, showCheckboxes, showDrag) {
  var container = document.getElementById('batchList');
  if (!container) return;
  
  var items = container.querySelectorAll('.batch-bookmark-item');
  var itemsArray = [];
  for (var i = 0; i < items.length; i++) {
    itemsArray.push({
      el: items[i],
      id: items[i].dataset.id,
      title: items[i].dataset.title || '',
      folder: items[i].querySelector('.chip') ? items[i].querySelector('.chip').textContent : ''
    });
  }
  
  // Sort
  itemsArray.sort(function(a, b) {
    if (sortType === 'az') {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });
  
  // Update visibility first (for UI responsiveness)
  for (var k = 0; k < itemsArray.length; k++) {
    var item = itemsArray[k].el;
    var check = item.querySelector('.batch-item-check');
    var handle = item.querySelector('.batch-drag-handle');
    if (check) check.style.display = showCheckboxes ? 'inline-block' : 'none';
    if (handle) handle.style.display = showDrag ? 'inline-block' : 'none';
    container.appendChild(item);
  }
  
  // Now apply the sort to actual Chrome bookmarks
  BM_applyBookmarkSort(itemsArray).then(function() {
    BM_showToast('已排序並同步');
  }).catch(function(err) {
    console.error('Sort error:', err);
    BM_showToast('已排序 (同步失敗)');
  });
}

async function BM_applyBookmarkSort(itemsArray) {
  // Group bookmarks by folder
  var folderGroups = {};
  for (var i = 0; i < itemsArray.length; i++) {
    var folder = itemsArray[i].folder;
    if (!folderGroups[folder]) {
      folderGroups[folder] = [];
    }
    folderGroups[folder].push({
      id: itemsArray[i].id,
      title: itemsArray[i].title
    });
  }
  
  // Find parent folder IDs
  for (var f = 0; f < BM_allFolders.length; f++) {
    var folderPath = BM_allFolders[f].path;
    if (folderGroups[folderPath]) {
      var folderId = BM_allFolders[f].id;
      var bookmarksInFolder = folderGroups[folderPath];
      
      // Move each bookmark to its new position
      for (var j = 0; j < bookmarksInFolder.length; j++) {
        try {
          await chrome.bookmarks.move(bookmarksInFolder[j].id, {
            parentId: folderId,
            index: j
          });
        } catch (err) {
          console.error('Failed to move bookmark:', bookmarksInFolder[j].id, err);
        }
      }
    }
  }
  
  // Reload bookmarks to sync
  await BM_loadBookmarks();
}
