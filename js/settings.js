// settings.js - 設定管理

var BM_currentLang = 'zh_TW';
var BM_currentSettings = {
  windowSize: 'medium',
  fontSize: 'medium',
  language: 'zh_TW'
};

function BM_loadSettings() {
  try {
    var saved = localStorage.getItem('bookmarkManagerSettings');
    if (saved) {
      var parsed = JSON.parse(saved);
      BM_currentSettings = {
        windowSize: parsed.windowSize || 'medium',
        customWidth: parsed.customWidth || '',
        customHeight: parsed.customHeight || '',
        language: parsed.language || BM_detectSystemLang()
      };
      BM_currentLang = BM_currentSettings.language;
    } else {
      BM_currentLang = BM_detectSystemLang();
      BM_currentSettings = {
        windowSize: 'medium',
        customWidth: '',
        customHeight: '',
        language: BM_currentLang
      };
    }
  } catch (e) {
    BM_currentLang = BM_detectSystemLang();
    BM_currentSettings = {
      windowSize: 'medium',
      customWidth: '',
      customHeight: '',
      language: BM_currentLang
    };
  }
  return BM_currentSettings;
}

function BM_saveSettings(settings) {
  try {
    localStorage.setItem('bookmarkManagerSettings', JSON.stringify(settings));
    BM_currentSettings = settings;
    BM_currentLang = settings.language || 'zh_TW';
    return true;
  } catch (e) {
    return false;
  }
}

function BM_applySettings() {
  var settings = BM_currentSettings;
  
  var sizes = {
    small: { width: '380px', minHeight: '680px' },
    medium: { width: '480px', minHeight: '800px' },
    large: { width: '600px', minHeight: '900px' },
    xlarge: { width: '750px', minHeight: '1000px' },
    xxlarge: { width: '900px', minHeight: '1100px' },
    custom: { width: (settings.customWidth || '500') + 'px', minHeight: (settings.customHeight || '700') + 'px' },
    fullscreen: { width: '100%', minHeight: '100vh' }
  };
  
  var size;
  if (settings.windowSize === 'custom') {
    size = sizes.custom;
  } else if (settings.windowSize === 'fullscreen') {
    size = sizes.fullscreen;
  } else {
    size = sizes[settings.windowSize] || sizes.medium;
  }
  
  if (document.body) {
    document.body.style.width = size.width;
    document.body.style.minHeight = size.minHeight;
  }
}

function BM_showSettings() {
  var settings = BM_loadSettings();
  var langSel = document.getElementById('langSelect');
  var winSel = document.getElementById('windowSizeSelect');
  var fontSel = document.getElementById('fontSizeSelect');
  
  if (langSel) langSel.value = settings.language;
  if (winSel) winSel.value = settings.windowSize;
  if (fontSel) fontSel.value = settings.fontSize;
  
  var modal = document.getElementById('settingsModal');
  if (modal) modal.style.display = 'flex';
}

function BM_hideSettings() {
  var modal = document.getElementById('settingsModal');
  if (modal) modal.style.display = 'none';
}

function BM_doSaveSettings() {
  var langSel = document.getElementById('langSelect');
  var winSel = document.getElementById('windowSizeSelect');
  var customW = document.getElementById('customWidth');
  var customH = document.getElementById('customHeight');
  
  var settings = {
    windowSize: winSel ? winSel.value : 'medium',
    customWidth: customW ? customW.value : '',
    customHeight: customH ? customH.value : '',
    language: langSel ? langSel.value : 'zh_TW'
  };
  
  var saved = BM_saveSettings(settings);
  if (saved) {
    BM_applySettings();
    BM_updateAllTexts();
    BM_hideSettings();
    BM_showToast(BM_T('saved'));
  } else {
    BM_showToast('Save failed', true);
  }
}

function BM_showCustomInputs() {
  var winSel = document.getElementById('windowSizeSelect');
  var customGroup = document.getElementById('customSizeGroup');
  if (!winSel || !customGroup) return;
  
  if (winSel.value === 'custom') {
    customGroup.style.display = 'block';
  } else {
    customGroup.style.display = 'none';
  }
}

function BM_showSettings() {
  var settings = BM_loadSettings();
  var langSel = document.getElementById('langSelect');
  var winSel = document.getElementById('windowSizeSelect');
  var fontSel = document.getElementById('fontSizeSelect');
  var customW = document.getElementById('customWidth');
  var customH = document.getElementById('customHeight');
  
  if (langSel) langSel.value = settings.language;
  if (winSel) winSel.value = settings.windowSize;
  if (customW) customW.value = settings.customWidth || '';
  if (customH) customH.value = settings.customHeight || '';
  
  BM_showCustomInputs();
  
  var modal = document.getElementById('settingsModal');
  if (modal) modal.style.display = 'flex';
}
