// i18n.js - 國際化翻譯

var BM_i18n = {
  'zh_TW': {
    title: '書籤管理',
    searchPlaceholder: '搜尋書籤標題或網址...',
    searchTab: '搜尋',
    duplicatesTab: '重複',
    batchTab: '批量',
    exportTab: '匯出',
    customSize: '自訂尺寸',
    customWidth: '寬度',
    customHeight: '高度',
    fullscreen: '全螢幕',
    noResults: '找不到符合的書籤',
    noDuplicates: '沒有發現重複書籤！',
    emptyFolder: '此資料夾沒有書籤',
    inputKeyword: '輸入關鍵字搜尋書籤',
    scanTip: '點擊此頁面掃描重複',
    selectFolderSearch: '選擇資料夾搜尋',
    allFolders: '所有資料夾',
    selectAll: '全選',
    selected: '已選 {n} 項',
    delete: '刪除',
    move: '移動',
    exportHtml: 'HTML 格式',
    exportJson: 'JSON 格式',
    exportMd: 'Markdown',
    exportHtmlDesc: '標準書籤格式',
    exportJsonDesc: '完整備份含元數據',
    exportMdDesc: '適合閱讀整理',
    settingsTitle: '設定',
    lang: '語言',
    windowSize: '視窗大小',
    fontSize: '字體大小',
    cancel: '取消',
    save: '儲存',
    saved: '設定已儲存',
    confirmDelete: '確定刪除 {n} 個書籤？',
    deleted: '已刪除',
    deleteFailed: '刪除失敗',
    moveFailed: '移動失敗',
    exported: '已匯出',
    duplicates: '重複 {n} 次',
    keep: '保留'
  },
  'zh_CN': {
    title: '书签管理',
    searchPlaceholder: '搜索书签标题或网址...',
    searchTab: '搜索',
    duplicatesTab: '重复',
    batchTab: '批量',
    exportTab: '导出',
    customSize: '自定义尺寸',
    customWidth: '宽度',
    customHeight: '高度',
    fullscreen: '全屏幕',
    noResults: '找不到符合的书签',
    noDuplicates: '没有发现重复书签！',
    emptyFolder: '此文件夹没有书签',
    inputKeyword: '输入关键字搜索',
    scanTip: '点击此页面扫描重复',
    selectFolderSearch: '选择文件夹搜索',
    allFolders: '所有文件夹',
    selectAll: '全选',
    selected: '已选 {n} 项',
    delete: '删除',
    move: '移动',
    exportHtml: 'HTML 格式',
    exportJson: 'JSON 格式',
    exportMd: 'Markdown',
    exportHtmlDesc: '标准书签格式',
    exportJsonDesc: '完整备份含元数据',
    exportMdDesc: '适合阅读整理',
    settingsTitle: '设置',
    lang: '语言',
    windowSize: '窗口大小',
    fontSize: '字体大小',
    cancel: '取消',
    save: '保存',
    saved: '设置已保存',
    confirmDelete: '确定删除 {n} 个书签？',
    deleted: '已删除',
    deleteFailed: '删除失败',
    moveFailed: '移动失败',
    exported: '已导出',
    duplicates: '重复 {n} 次',
    keep: '保留'
  },
  'en': {
    title: 'Bookmark Manager',
    searchPlaceholder: 'Search by title or URL...',
    searchTab: 'Search',
    duplicatesTab: 'Duplicates',
    batchTab: 'Batch',
    exportTab: 'Export',
    customSize: 'Custom Size',
    customWidth: 'Width',
    customHeight: 'Height',
    fullscreen: 'Fullscreen',
    noResults: 'No bookmarks found',
    noDuplicates: 'No duplicate bookmarks!',
    emptyFolder: 'No bookmarks in folder',
    inputKeyword: 'Enter keyword to search',
    scanTip: 'Click to scan duplicates',
    selectFolderSearch: 'Filter by folder',
    allFolders: 'All Folders',
    selectAll: 'Select All',
    selected: '{n} selected',
    delete: 'Delete',
    move: 'Move',
    exportHtml: 'HTML Format',
    exportJson: 'JSON Format',
    exportMd: 'Markdown',
    exportHtmlDesc: 'Standard bookmark format',
    exportJsonDesc: 'Full backup with metadata',
    exportMdDesc: 'Great for reading',
    settingsTitle: 'Settings',
    lang: 'Language',
    windowSize: 'Window Size',
    fontSize: 'Font Size',
    cancel: 'Cancel',
    save: 'Save',
    saved: 'Settings saved',
    confirmDelete: 'Delete {n} bookmarks?',
    deleted: 'Deleted',
    deleteFailed: 'Delete failed',
    moveFailed: 'Move failed',
    exported: 'Exported',
    duplicates: 'Duplicated {n}x',
    keep: 'Keep'
  }
};

function BM_T(key, params) {
  var lang = BM_currentLang || 'zh_TW';
  var txt = BM_i18n[lang][key] || BM_i18n['zh_TW'][key] || key;
  if (params) {
    var result = txt;
    for (var k in params) {
      result = result.split('{' + k + '}').join(params[k]);
    }
    return result;
  }
  return txt;
}

function BM_detectSystemLang() {
  var nav = navigator.language || navigator.userLanguage || 'zh-TW';
  if (nav.indexOf('zh-TW') !== -1 || nav.indexOf('zh-Hant') !== -1) return 'zh_TW';
  if (nav.indexOf('zh') !== -1) return 'zh_CN';
  return 'en';
}
