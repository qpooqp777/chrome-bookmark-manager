// links.js - 失效連結檢測

var BM_checkedLinks = {};
var BM_totalLinks = 0;
var BM_checkedCount = 0;

async function BM_checkBookmark(url, id) {
  return new Promise(function(resolve) {
    var xhr = new XMLHttpRequest();
    xhr.timeout = 5000;
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status >= 400) {
          resolve({ id: id, url: url, status: xhr.status, valid: false });
        } else {
          resolve({ id: id, url: url, status: xhr.status, valid: true });
        }
      }
    };
    xhr.onerror = function() {
      resolve({ id: id, url: url, status: 0, valid: false });
    };
    xhr.ontimeout = function() {
      resolve({ id: id, url: url, status: 0, valid: false });
    };
    try {
      xhr.open('HEAD', url, true);
      xhr.send();
    } catch (e) {
      resolve({ id: id, url: url, status: 0, valid: false });
    }
    
    // Timeout fallback
    setTimeout(function() {
      xhr.abort();
      resolve({ id: id, url: url, status: 0, valid: false });
    }, 5000);
  });
}

async function BM_scanDeadLinks(progressCallback) {
  var data = await BM_loadBookmarks();
  var bookmarks = data.bookmarks;
  var deadLinks = [];
  var checkedLinks = [];
  var total = bookmarks.length;
  var checked = 0;
  
  BM_totalLinks = total;
  BM_checkedCount = 0;
  
  // Check in batches of 5
  var batchSize = 5;
  for (var i = 0; i < bookmarks.length; i += batchSize) {
    var batch = bookmarks.slice(i, i + batchSize);
    var promises = [];
    
    for (var j = 0; j < batch.length; j++) {
      var b = batch[j];
      if (b.url) {
        promises.push(BM_checkBookmark(b.url, b.id).then(function(result) {
          checked++;
          BM_checkedCount = checked;
          checkedLinks.push({
            id: result.id,
            url: result.url,
            status: result.status,
            valid: result.valid,
            bookmark: b
          });
          if (!result.valid) {
            deadLinks.push(result);
          }
          if (progressCallback) {
            progressCallback(checked, total, deadLinks.length);
          }
        }));
      }
    }
    
    await Promise.all(promises);
  }
  
  BM_checkedLinks = checkedLinks;
  return deadLinks;
}

function BM_displayDeadLinks(deadLinks, checked, total) {
  var container = document.getElementById('linksContent');
  if (!container) return;
  
  if (deadLinks.length === 0) {
    container.innerHTML = '<div class="empty-state success"><span class="material-icons">check_circle</span><p>' + BM_T('noDeadLinks') + '</p><p style="font-size:12px;color:#888;">' + BM_T('checkedLinks', { n: total }) + '</p></div>';
    return;
  }
  
  var html = '<div class="links-summary"><span class="material-icons" style="color:#ffc107;">warning</span> ' + BM_T('deadLinksFound', { n: deadLinks.length, t: total }) + '</div>';
  
  for (var i = 0; i < deadLinks.length; i++) {
    var link = deadLinks[i];
    html += '<div class="bookmark-item dead-link">';
    html += '<div class="bookmark-info">';
    html += '<div class="bookmark-title">' + BM_escapeHtml(link.bookmark ? link.bookmark.title : 'Unknown') + '</div>';
    html += '<div class="bookmark-url error">' + BM_escapeHtml(link.url) + ' <span class="status-badge">HTTP ' + link.status + '</span></div>';
    html += '<div class="bookmark-folder">' + BM_escapeHtml(link.bookmark ? link.bookmark.folder : '') + '</div>';
    html += '</div>';
    html += '<button class="btn btn-small btn-danger ripple delete-dead-btn" data-id="' + link.id + '"><span class="material-icons" style="font-size:18px;">delete</span></button>';
    html += '</div>';
  }
  
  container.innerHTML = html;
  
  // Bind delete buttons
  var deleteBtns = container.querySelectorAll('.delete-dead-btn');
  for (var j = 0; j < deleteBtns.length; j++) {
    deleteBtns[j].addEventListener('click', function() {
      var id = this.dataset.id;
      chrome.bookmarks.remove(id).then(function() {
        BM_showToast(BM_T('deleted'));
        BM_scanDeadLinksWithUI();
      }).catch(function() {
        BM_showToast(BM_T('deleteFailed'), true);
      });
    });
  }
}

async function BM_scanDeadLinksWithUI() {
  var container = document.getElementById('linksContent');
  if (!container) return;
  
  container.innerHTML = '<div class="loading"><div class="spinner"></div><div class="loading-text"><span>' + BM_T('scanning') + '</span><span id="scanProgress">0 / 0</span></div></div>';
  
  var deadLinks = await BM_scanDeadLinks(function(checked, total, deadCount) {
    var progress = document.getElementById('scanProgress');
    if (progress) {
      progress.textContent = checked + ' / ' + total + ' (' + deadCount + ' ' + BM_T('dead') + ')';
    }
  });
  
  BM_displayDeadLinks(deadLinks, BM_checkedCount, BM_totalLinks);
}

async function BM_deleteAllDeadLinks() {
  if (!confirm(BM_T('confirmDeleteAllDead'))) return;
  
  var deadIds = [];
  var links = document.querySelectorAll('.delete-dead-btn');
  for (var i = 0; i < links.length; i++) {
    deadIds.push(links[i].dataset.id);
  }
  
  try {
    for (var j = 0; j < deadIds.length; j++) {
      await chrome.bookmarks.remove(deadIds[j]);
    }
    BM_showToast(BM_T('deletedAllDead', { n: deadIds.length }));
    BM_scanDeadLinksWithUI();
  } catch (e) {
    BM_showToast(BM_T('deleteFailed'), true);
  }
}
