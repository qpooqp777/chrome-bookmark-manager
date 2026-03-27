// tags.js - 標籤系統

var BM_tags = {};
var BM_allTags = [];

function BM_loadTags() {
  try {
    var saved = localStorage.getItem('bookmarkTags');
    if (saved) {
      BM_tags = JSON.parse(saved);
    } else {
      BM_tags = {};
    }
  } catch (e) {
    BM_tags = {};
  }
  BM_updateAllTags();
  return BM_tags;
}

function BM_saveTags() {
  localStorage.setItem('bookmarkTags', JSON.stringify(BM_tags));
}

function BM_updateAllTags() {
  BM_allTags = [];
  var tagMap = {};
  for (var url in BM_tags) {
    var tags = BM_tags[url];
    if (tags && Array.isArray(tags)) {
      for (var i = 0; i < tags.length; i++) {
        var tag = tags[i].toLowerCase().trim();
        if (tag && !tagMap[tag]) {
          BM_allTags.push(tag);
          tagMap[tag] = true;
        }
      }
    }
  }
  BM_allTags.sort();
}

function BM_addTag(url, tag) {
  if (!BM_tags[url]) {
    BM_tags[url] = [];
  }
  var tagLower = tag.toLowerCase().trim();
  if (BM_tags[url].indexOf(tagLower) === -1 && tagLower) {
    BM_tags[url].push(tagLower);
    BM_saveTags();
    BM_updateAllTags();
    return true;
  }
  return false;
}

function BM_removeTag(url, tag) {
  if (!BM_tags[url]) return false;
  var tagLower = tag.toLowerCase().trim();
  var idx = BM_tags[url].indexOf(tagLower);
  if (idx !== -1) {
    BM_tags[url].splice(idx, 1);
    if (BM_tags[url].length === 0) {
      delete BM_tags[url];
    }
    BM_saveTags();
    BM_updateAllTags();
    return true;
  }
  return false;
}

function BM_getTags(url) {
  return BM_tags[url] || [];
}

function BM_searchByTag(tag) {
  var results = [];
  var tagLower = tag.toLowerCase().trim();
  for (var url in BM_tags) {
    if (BM_tags[url].indexOf(tagLower) !== -1) {
      results.push(url);
    }
  }
  return results;
}

function BM_displayTags() {
  var container = document.getElementById('tagsContent');
  if (!container) return;
  
  var html = '';
  
  // Tag cloud
  if (BM_allTags.length > 0) {
    html += '<div class="section-title"><span class="material-icons">label</span> ' + BM_T('allTags') + ' (' + BM_allTags.length + ')</div>';
    html += '<div class="tag-cloud">';
    for (var i = 0; i < BM_allTags.length; i++) {
      var tag = BM_allTags[i];
      var count = BM_countTagUsage(tag);
      html += '<button class="tag-chip" onclick="BM_searchTag(\'' + BM_escapeHtml(tag) + '\')">' + BM_escapeHtml(tag) + ' <span class="tag-count">' + count + '</span></button>';
    }
    html += '</div>';
  } else {
    html += '<div class="empty-state"><span class="material-icons">label</span><p>' + BM_T('noTags') + '</p></div>';
  }
  
  // Add tag input
  html += '<div class="add-tag-section">';
  html += '<div class="section-title"><span class="material-icons">add</span> ' + BM_T('addTag') + '</div>';
  html += '<div class="tag-input-group">';
  html += '<input type="text" id="tagUrlInput" class="tag-input" placeholder="' + BM_T('enterUrl') + '">';
  html += '<input type="text" id="tagNameInput" class="tag-input" placeholder="' + BM_T('enterTagName') + '">';
  html += '<button class="btn btn-contained" onclick="BM_doAddTag()">' + BM_T('add') + '</button>';
  html += '</div>';
  html += '</div>';
  
  // Recent tagged
  html += '<div class="section-title"><span class="material-icons">history</span> ' + BM_T('recentTagged') + '</div>';
  html += '<div id="taggedList">';
  var urls = Object.keys(BM_tags).slice(0, 10);
  if (urls.length === 0) {
    html += '<p style="color:#888;font-size:13px;text-align:center;padding:20px;">' + BM_T('noTaggedItems') + '</p>';
  } else {
    for (var j = 0; j < urls.length; j++) {
      var url = urls[j];
      var tags = BM_tags[url];
      html += '<div class="bookmark-item">';
      html += '<div class="bookmark-info">';
      html += '<div class="bookmark-title">' + BM_escapeHtml(url.split('/')[2] || url) + '</div>';
      html += '<div class="bookmark-url" style="font-size:11px;">' + BM_escapeHtml(url.substring(0, 50)) + '...</div>';
      html += '<div class="tag-list">';
      for (var k = 0; k < tags.length; k++) {
        html += '<span class="tag-chip-mini">' + BM_escapeHtml(tags[k]) + '</span>';
      }
      html += '</div>';
      html += '</div>';
      html += '<button class="btn btn-small btn-text" onclick="BM_openTagUrl(\'' + BM_escapeHtml(url).replace(/'/g, "\\'") + '\')"><span class="material-icons">open_in_new</span></button>';
      html += '</div>';
    }
  }
  html += '</div>';
  
  container.innerHTML = html;
}

function BM_countTagUsage(tag) {
  var count = 0;
  var tagLower = tag.toLowerCase().trim();
  for (var url in BM_tags) {
    if (BM_tags[url].indexOf(tagLower) !== -1) {
      count++;
    }
  }
  return count;
}

function BM_doAddTag() {
  var urlInput = document.getElementById('tagUrlInput');
  var nameInput = document.getElementById('tagNameInput');
  
  if (!urlInput || !nameInput) return;
  
  var url = urlInput.value.trim();
  var tag = nameInput.value.trim();
  
  if (!url || !tag) {
    BM_showToast(BM_T('enterUrlAndTag'), true);
    return;
  }
  
  // Auto-add http:// if missing
  if (url.indexOf('://') === -1) {
    url = 'https://' + url;
  }
  
  if (BM_addTag(url, tag)) {
    BM_showToast(BM_T('tagAdded'));
    nameInput.value = '';
    BM_displayTags();
  } else {
    BM_showToast(BM_T('tagExists'), true);
  }
}

function BM_searchTag(tag) {
  var urls = BM_searchByTag(tag);
  var container = document.getElementById('tagsContent');
  if (!container) return;
  
  BM_loadBookmarks().then(function(data) {
    var results = data.bookmarks.filter(function(b) {
      return urls.indexOf(b.url) !== -1;
    });
    
    var html = '<div class="section-title"><span class="material-icons">label</span> ' + BM_T('tagResults', { t: tag, n: results.length }) + '</div>';
    
    if (results.length === 0) {
      html += '<div class="empty-state"><span class="material-icons">search_off</span><p>' + BM_T('noResults') + '</p></div>';
    } else {
      for (var i = 0; i < results.length; i++) {
        var b = results[i];
        html += '<div class="bookmark-item">';
        html += '<div class="bookmark-info">';
        html += '<div class="bookmark-title">' + BM_escapeHtml(b.title) + '</div>';
        html += '<div class="bookmark-url">' + BM_escapeHtml(b.url) + '</div>';
        html += '</div>';
        html += '<button class="btn btn-small btn-contained ripple open-btn" data-url="' + BM_escapeHtml(b.url) + '"><span class="material-icons" style="font-size:18px;">open_in_new</span></button>';
        html += '</div>';
      }
    }
    
    html += '<button class="btn btn-outlined" onclick="BM_displayTags()" style="margin-top:16px;">' + BM_T('backToTags') + '</button>';
    
    container.innerHTML = html;
    
    // Bind open buttons
    var openBtns = container.querySelectorAll('.open-btn');
    for (var j = 0; j < openBtns.length; j++) {
      openBtns[j].addEventListener('click', function(e) {
        e.stopPropagation();
        var url = this.dataset.url;
        if (url) {
          chrome.tabs.create({ url: url, active: true });
          window.close();
        }
      });
    }
  });
}

function BM_openTagUrl(url) {
  chrome.tabs.create({ url: url, active: true });
  window.close();
}
