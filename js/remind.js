// remind.js - 閱讀提醒系統

var BM_reminders = {};

function BM_loadReminders() {
  try {
    var saved = localStorage.getItem('bookmarkReminders');
    if (saved) {
      BM_reminders = JSON.parse(saved);
    } else {
      BM_reminders = {};
    }
  } catch (e) {
    BM_reminders = {};
  }
  BM_cleanupExpiredReminders();
  return BM_reminders;
}

function BM_saveReminders() {
  localStorage.setItem('bookmarkReminders', JSON.stringify(BM_reminders));
}

function BM_cleanupExpiredReminders() {
  var now = Date.now();
  var changed = false;
  for (var id in BM_reminders) {
    var r = BM_reminders[id];
    if (r.remindAt && r.remindAt < now) {
      r.expired = true;
      changed = true;
    }
  }
  if (changed) {
    BM_saveReminders();
  }
}

function BM_addReminder(id, title, url, days) {
  var reminder = {
    id: id,
    title: title,
    url: url,
    remindAt: Date.now() + (days * 24 * 60 * 60 * 1000),
    days: days,
    createdAt: Date.now(),
    expired: false,
    notified: false
  };
  BM_reminders[id] = reminder;
  BM_saveReminders();
  return reminder;
}

function BM_removeReminder(id) {
  if (BM_reminders[id]) {
    delete BM_reminders[id];
    BM_saveReminders();
    return true;
  }
  return false;
}

function BM_getActiveReminders() {
  var active = [];
  var now = Date.now();
  for (var id in BM_reminders) {
    var r = BM_reminders[id];
    if (!r.notified) {
      active.push(r);
    }
  }
  return active.sort(function(a, b) { return (a.remindAt || 0) - (b.remindAt || 0); });
}

function BM_getExpiredReminders() {
  var expired = [];
  for (var id in BM_reminders) {
    var r = BM_reminders[id];
    if (r.expired && !r.notified) {
      expired.push(r);
    }
  }
  return expired;
}

function BM_markAsNotified(id) {
  if (BM_reminders[id]) {
    BM_reminders[id].notified = true;
    BM_saveReminders();
  }
}

function BM_formatRemindDate(reminder) {
  if (!reminder.remindAt) return '-';
  var date = new Date(reminder.remindAt);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function BM_displayReminders() {
  var container = document.getElementById('remindContent');
  if (!container) return;
  
  var html = '';
  
  // Active reminders
  var active = BM_getActiveReminders();
  var expired = BM_getExpiredReminders();
  
  if (active.length === 0 && expired.length === 0) {
    html += '<div class="empty-state"><span class="material-icons">alarm</span><p>' + BM_T('noReminders') + '</p></div>';
    container.innerHTML = html;
    return;
  }
  
  // Expired
  if (expired.length > 0) {
    html += '<div class="section-title" style="color:#ffc107;"><span class="material-icons">notification_important</span> ' + BM_T('remindersDue') + ' (' + expired.length + ')</div>';
    for (var i = 0; i < expired.length; i++) {
      var r = expired[i];
      html += '<div class="bookmark-item reminder-item due">';
      html += '<div class="reminder-date">' + BM_formatRemindDate(r) + '</div>';
      html += '<div class="bookmark-info">';
      html += '<div class="bookmark-title">' + BM_escapeHtml(r.title || BM_T('untitled')) + '</div>';
      html += '<div class="bookmark-url">' + BM_escapeHtml(r.url || '') + '</div>';
      html += '</div>';
      html += '<div class="reminder-actions">';
      html += '<button class="btn btn-small btn-contained ripple open-btn" data-url="' + BM_escapeHtml(r.url || '') + '"><span class="material-icons" style="font-size:18px;">open_in_new</span></button>';
      html += '<button class="btn btn-small btn-danger ripple" onclick="BM_dismissReminder(\'' + r.id + '\')"><span class="material-icons" style="font-size:18px;">done</span></button>';
      html += '</div>';
      html += '</div>';
    }
  }
  
  // Upcoming
  if (active.length > 0) {
    html += '<div class="section-title"><span class="material-icons">schedule</span> ' + BM_T('upcomingReminders') + ' (' + active.length + ')</div>';
    for (var j = 0; j < active.length; j++) {
      var r2 = active[j];
      var daysLeft = Math.ceil((r2.remindAt - Date.now()) / (24 * 60 * 60 * 1000));
      var daysText = daysLeft > 0 ? BM_T('daysLeft', { n: daysLeft }) : BM_T('dueToday');
      html += '<div class="bookmark-item reminder-item">';
      html += '<div class="reminder-date ' + (daysLeft <= 1 ? 'urgent' : '') + '">' + daysText + '</div>';
      html += '<div class="bookmark-info">';
      html += '<div class="bookmark-title">' + BM_escapeHtml(r2.title || BM_T('untitled')) + '</div>';
      html += '<div class="bookmark-url">' + BM_escapeHtml(r2.url || '') + '</div>';
      html += '<div class="reminder-time">' + BM_formatRemindDate(r2) + '</div>';
      html += '</div>';
      html += '<div class="reminder-actions">';
      html += '<button class="btn btn-small btn-outlined ripple" onclick="BM_editReminder(\'' + r2.id + '\')"><span class="material-icons" style="font-size:18px;">edit</span></button>';
      html += '<button class="btn btn-small btn-text" onclick="BM_deleteReminder(\'' + r2.id + '\')"><span class="material-icons" style="font-size:18px;">delete</span></button>';
      html += '</div>';
      html += '</div>';
    }
  }
  
  // Add new reminder
  html += '<div class="add-reminder-section">';
  html += '<div class="section-title"><span class="material-icons">add_alarm</span> ' + BM_T('addReminder') + '</div>';
  html += '<div class="reminder-form">';
  html += '<input type="text" id="remindUrlInput" class="reminder-input" placeholder="' + BM_T('enterUrl') + '">';
  html += '<div class="reminder-days">';
  html += '<label>' + BM_T('remindIn') + '</label>';
  html += '<select id="remindDaysSelect">';
  html += '<option value="1">1 ' + BM_T('day') + '</option>';
  html += '<option value="3">3 ' + BM_T('days') + '</option>';
  html += '<option value="7" selected>7 ' + BM_T('days') + '</option>';
  html += '<option value="14">14 ' + BM_T('days') + '</option>';
  html += '<option value="30">30 ' + BM_T('days') + '</option>';
  html += '<option value="90">90 ' + BM_T('days') + '</option>';
  html += '</select>';
  html += '</div>';
  html += '<button class="btn btn-contained" onclick="BM_doAddReminder()">' + BM_T('addReminder') + '</button>';
  html += '</div>';
  html += '</div>';
  
  container.innerHTML = html;
  
  // Bind open buttons
  var openBtns = container.querySelectorAll('.open-btn');
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
}

function BM_doAddReminder() {
  var urlInput = document.getElementById('remindUrlInput');
  var daysSelect = document.getElementById('remindDaysSelect');
  
  if (!urlInput || !daysSelect) return;
  
  var url = urlInput.value.trim();
  var days = parseInt(daysSelect.value) || 7;
  
  if (!url) {
    BM_showToast(BM_T('enterUrl'), true);
    return;
  }
  
  if (url.indexOf('://') === -1) {
    url = 'https://' + url;
  }
  
  var id = 'reminder_' + Date.now();
  var title = url.split('/')[2] || url;
  
  BM_addReminder(id, title, url, days);
  urlInput.value = '';
  BM_displayReminders();
  BM_showToast(BM_T('reminderAdded', { d: days }));
}

function BM_dismissReminder(id) {
  BM_markAsNotified(id);
  BM_displayReminders();
  BM_showToast(BM_T('reminderDismissed'));
}

function BM_deleteReminder(id) {
  BM_removeReminder(id);
  BM_displayReminders();
  BM_showToast(BM_T('reminderDeleted'));
}

function BM_editReminder(id) {
  var r = BM_reminders[id];
  if (!r) return;
  
  var days = prompt(BM_T('enterNewDays'), r.days || 7);
  if (days === null) return;
  
  days = parseInt(days);
  if (isNaN(days) || days < 1) {
    BM_showToast(BM_T('invalidDays'), true);
    return;
  }
  
  r.days = days;
  r.remindAt = Date.now() + (days * 24 * 60 * 60 * 1000);
  r.expired = false;
  r.notified = false;
  BM_saveReminders();
  BM_displayReminders();
  BM_showToast(BM_T('reminderUpdated'));
}
