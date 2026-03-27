// stats.js - 統計分析

async function BM_loadStats() {
  var data = await BM_loadBookmarks();
  var bookmarks = data.bookmarks;
  var folders = data.folders;
  
  var stats = {
    totalBookmarks: bookmarks.length,
    totalFolders: folders.length,
    topDomains: [],
    folderStats: [],
    recentBookmarks: [],
    oldestBookmark: null,
    newestBookmark: null
  };
  
  // Domain analysis
  var domainMap = {};
  for (var i = 0; i < bookmarks.length; i++) {
    var b = bookmarks[i];
    try {
      var url = new URL(b.url);
      var domain = url.hostname.replace('www.', '');
      if (!domainMap[domain]) {
        domainMap[domain] = 0;
      }
      domainMap[domain]++;
    } catch (e) {}
  }
  
  var domains = Object.keys(domainMap);
  domains.sort(function(a, b) { return domainMap[b] - domainMap[a]; });
  stats.topDomains = domains.slice(0, 10).map(function(d) {
    return { domain: d, count: domainMap[d] };
  });
  
  // Folder stats
  var folderCountMap = {};
  for (var j = 0; j < bookmarks.length; j++) {
    var folder = bookmarks[j].folder;
    if (!folderCountMap[folder]) {
      folderCountMap[folder] = 0;
    }
    folderCountMap[folder]++;
  }
  
  var folderNames = Object.keys(folderCountMap);
  folderNames.sort(function(a, b) { return folderCountMap[b] - folderCountMap[a]; });
  stats.folderStats = folderNames.slice(0, 10).map(function(f) {
    return { folder: f, count: folderCountMap[f] };
  });
  
  // Sort by date
  bookmarks.sort(function(a, b) { return (b.dateAdded || 0) - (a.dateAdded || 0); });
  stats.newestBookmark = bookmarks[0] || null;
  stats.oldestBookmark = bookmarks[bookmarks.length - 1] || null;
  stats.recentBookmarks = bookmarks.slice(0, 5);
  
  return stats;
}

function BM_formatDate(timestamp) {
  if (!timestamp) return '-';
  var date = new Date(parseInt(timestamp) / 1000);
  return date.toLocaleDateString();
}

function BM_displayStats(stats) {
  var container = document.getElementById('statsContent');
  if (!container) return;
  
  var html = '';
  
  // Summary cards
  html += '<div class="stats-grid">';
  html += '<div class="stat-card"><div class="stat-label">' + BM_T('totalBookmarks') + '</div><div class="stat-value">' + stats.totalBookmarks + '</div></div>';
  html += '<div class="stat-card"><div class="stat-label">' + BM_T('totalFolders') + '</div><div class="stat-value">' + stats.totalFolders + '</div></div>';
  html += '</div>';
  
  // Top domains
  html += '<div class="section-title"><span class="material-icons">language</span> ' + BM_T('topDomains') + '</div>';
  html += '<div class="stats-list">';
  for (var i = 0; i < stats.topDomains.length; i++) {
    var d = stats.topDomains[i];
    var percent = Math.round(d.count / stats.totalBookmarks * 100);
    html += '<div class="stat-item">';
    html += '<div class="stat-item-info"><span class="stat-item-name">' + d.domain + '</span><span class="stat-item-count">' + d.count + '</span></div>';
    html += '<div class="stat-bar"><div class="stat-bar-fill" style="width:' + percent + '%;"></div></div>';
    html += '</div>';
  }
  html += '</div>';
  
  // Folder distribution
  html += '<div class="section-title"><span class="material-icons">folder</span> ' + BM_T('folderDist') + '</div>';
  html += '<div class="stats-list">';
  for (var j = 0; j < stats.folderStats.length; j++) {
    var f = stats.folderStats[j];
    var pct = Math.round(f.count / stats.totalBookmarks * 100);
    html += '<div class="stat-item">';
    html += '<div class="stat-item-info"><span class="stat-item-name" style="font-size:12px;">' + f.folder + '</span><span class="stat-item-count">' + f.count + '</span></div>';
    html += '<div class="stat-bar"><div class="stat-bar-fill" style="width:' + pct + '%;"></div></div>';
    html += '</div>';
  }
  html += '</div>';
  
  // Recent bookmarks
  if (stats.recentBookmarks.length > 0) {
    html += '<div class="section-title"><span class="material-icons">schedule</span> ' + BM_T('recentBookmarks') + '</div>';
    for (var k = 0; k < stats.recentBookmarks.length; k++) {
      var b = stats.recentBookmarks[k];
      html += '<div class="bookmark-item">';
      html += '<div class="bookmark-info">';
      html += '<div class="bookmark-title">' + BM_escapeHtml(b.title) + '</div>';
      html += '<div class="bookmark-url">' + BM_escapeHtml(b.url) + '</div>';
      html += '</div>';
      html += '<button class="btn btn-small btn-contained ripple open-btn" data-url="' + BM_escapeHtml(b.url) + '"><span class="material-icons" style="font-size:18px;">open_in_new</span></button>';
      html += '</div>';
    }
  }
  
  container.innerHTML = html;
  
  // Bind open buttons
  var openBtns = container.querySelectorAll('.open-btn');
  for (var m = 0; m < openBtns.length; m++) {
    openBtns[m].addEventListener('click', function(e) {
      e.stopPropagation();
      var url = this.dataset.url;
      if (url) {
        chrome.tabs.create({ url: url, active: true });
        window.close();
      }
    });
  }
  
  BM_applySettings();
}

async function BM_showStats() {
  var container = document.getElementById('statsContent');
  if (!container) return;
  
  container.innerHTML = '<div class="loading"><div class="spinner"></div><span>' + BM_T('loading') + '</span></div>';
  
  var stats = await BM_loadStats();
  BM_displayStats(stats);
}
