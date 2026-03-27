# 🌸 Chrome Bookmark Manager

[English](#english) | [繁體中文](#繁體中文) | [简体中文](#简体中文)

---

## English

### Overview

**Chrome Bookmark Manager** is a powerful Chrome extension that helps you efficiently manage your bookmarks with features like quick search, analytics, duplicate detection, batch operations, and more.

### Features

- **🔍 Quick Search** - Search bookmarks by title or URL with keyword highlighting
- **📁 Folder Filter** - Filter bookmarks by specific folders
- **📊 Analytics** - View bookmark statistics by domain and folder, click to quick search
- **📋 Duplicate Detection** - Find and remove duplicate bookmarks
- **✏️ Edit Bookmarks** - Edit bookmark names and URLs directly
- **🔗 URL Testing** - Test if bookmark URLs are working
- **🗂️ Batch Operations** - Select multiple bookmarks and batch delete/move
- **💾 Persistent Storage** - Search results saved to IndexedDB, never lost on close
- **🌐 Multi-language** - Support for Traditional Chinese, Simplified Chinese, and English
- **📤 Export** - Export bookmarks to HTML, JSON, or Markdown format
- **📱 Responsive Design** - Custom window sizes, scroll position auto-saved
- **🔒 Privacy First** - All data stored locally, never uploaded to server

### Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `chrome-bookmark-manager` folder

### Usage

1. Click the bookmark icon in Chrome toolbar
2. Use the **Search** tab to find bookmarks
3. Select a folder from the dropdown to filter results
4. Click **Edit** (pencil icon) to modify bookmark details
5. Click the **Link** button to test if the URL works
6. Use **Analytics** tab to view statistics by domain and folder
7. Click any count number to jump to search results for that domain/folder
8. Use **Batch** tab for multi-select operations
9. Use **Duplicates** tab to find duplicate bookmarks
10. Use **Export** tab to export bookmarks

### Interface

```
┌─ Search ─┬─ Duplicates ─┬─ Batch ─┬─ Analytics ─┬─ Export ─┐
├─ Search... ──────────────────────────────────────────────┤
├─ Folder ▼ ─────────────────────────────────────────────┤
│ 🌸 Bookmark Name          [Open][Edit][🗑️] │
│    https://example.com                    │
│    📁 Folder Name                       │
└──────────────────────────────────────────────────────────┘
```

---

## 繁體中文

### 概覽

**書籤管理助手**是一款強大的 Chrome 擴充功能，幫助您高效管理書籤，支援快速搜尋、分析統計、重複偵測、批次操作等功能。

### 功能特色

- **🔍 快速搜尋** - 按標題或網址搜尋書籤，關鍵字高亮顯示
- **📁 資料夾篩選** - 按指定資料夾過濾書籤
- **📊 分析統計** - 網域/資料夾書籤數量統計，點擊可快速檢索
- **📋 重複偵測** - 找出並移除重複的書籤
- **✏️ 編輯書籤** - 直接編輯書籤名稱和網址
- **🔗 測試連結** - 測試書籤網址是否正常
- **🗂️ 批次操作** - 選取多個書籤，批次刪除或移動
- **💾 持久化儲存** - 搜尋結果存入 IndexedDB，關閉視窗不消失
- **🌐 多語言** - 支援繁體中文、簡體中文、英文
- **📤 匯出功能** - 匯出書籤為 HTML、JSON 或 Markdown 格式
- **📱 響應式設計** - 自訂視窗大小，滾動位置自動保留
- **🔒 隱私優先** - 所有資料本地儲存，不上傳伺服器

### 安裝方式

1. 開啟 Chrome，前往 `chrome://extensions/`
2. 啟用**開發人員模式**（右上角開關）
3. 點擊**載入未封裝項目**
4. 選擇 `chrome-bookmark-manager` 資料夾

### 使用說明

1. 點擊 Chrome 工具列的書籤圖示
2. 使用**搜尋**分頁尋找書籤
3. 從下拉選單選擇資料夾以過濾結果
4. 點擊**編輯**（鉛筆圖示）修改書籤詳情
5. 點擊**連結**按鈕測試網址是否正常
6. 使用**分析**分頁查看網域和資料夾統計
7. 點擊任意數量數字可跳轉到該網域/資料夾的搜尋結果
8. 使用**批量**分頁進行多選操作
9. 使用**重複**分頁找出重複書籤
10. 使用**匯出**分頁匯出書籤

### 介面预览

```
┌─ 搜尋 ─┬─ 重複 ─┬─ 批量 ─┬─ 分析 ─┬─ 匯出 ─┐
├─ 搜尋... ─────────────────────────────────────┤
├─ 資料夾 ▼ ────────────────────────────────────┤
│ 🌸 書籤名稱              [開啟][編輯][🗑️] │
│    https://example.com                  │
│    📁 資料夾名稱                      │
└──────────────────────────────────────────────┘
```

---

## 简体中文

### 概览

**书签管理助手**是一款强大的 Chrome 扩展程序，帮助您高效管理书签，支持快速搜索、分析统计、重复检测、批量操作等功能。

### 功能特色

- **🔍 快速搜索** - 按标题或网址搜索书签，关键字高亮显示
- **📁 文件夹筛选** - 按指定文件夹过滤书签
- **📊 分析统计** - 网域/文件夹书签数量统计，点击可快速检索
- **📋 重复检测** - 找出并移除重复的书签
- **✏️ 编辑书签** - 直接编辑书签名称和网址
- **🔗 测试链接** - 测试书签网址是否正常
- **🗂️ 批量操作** - 选取多个书签，批量删除或移动
- **💾 持久化存储** - 搜索结果存入 IndexedDB，关闭窗口不消失
- **🌐 多语言** - 支持繁体中文、简体中文、英文
- **📤 导出功能** - 导出书签为 HTML、JSON 或 Markdown 格式
- **📱 响应式设计** - 自定义窗口大小，滚动位置自动保留
- **🔒 隐私优先** - 所有数据本地存储，不上传服务器

### 安装方式

1. 打开 Chrome，访问 `chrome://extensions/`
2. 启用**开发者模式**（右上角开关）
3. 点击**加载未打包项目**
4. 选择 `chrome-bookmark-manager` 文件夹

### 使用说明

1. 点击 Chrome 工具栏的书签图标
2. 使用**搜索**标签页查找书签
3. 从下拉菜单选择文件夹以过滤结果
4. 点击**编辑**（铅笔图标）修改书签详情
5. 点击**链接**按钮测试网址是否正常
6. 使用**分析**标签页查看网域和文件夹统计
7. 点击任意数量数字可跳转到该网域/文件夹的搜索结果
8. 使用**批量**标签页进行多选操作
9. 使用**重复**标签页找出重复书签
10. 使用**导出**标签页导出书签

### 界面预览

```
┌─ 搜索 ─┬─ 重复 ─┬─ 批量 ─┬─ 分析 ─┬─ 导出 ─┐
├─ 搜索... ─────────────────────────────────────┤
├─ 文件夹 ▼ ────────────────────────────────────┤
│ 🌸 书签名称              [打开][编辑][🗑️] │
│    https://example.com                  │
│    📁 文件夹名称                      │
└──────────────────────────────────────────────┘
```

---

## 技术栈 | Tech Stack

- **Chrome Extension API** (Manifest V3)
- **IndexedDB** - 本地数据持久化
- **JavaScript (ES5)** - 兼容性优先
- **Material Design Icons**

## 版本历史 | Changelog

### v1.03 (2026-03-27)
- 新增批量書籤排序功能（A→Z / Z→A）
- 支援勾選框和拖曳把手顯示/隱藏
- 新增批量書籤拖曳交換排序
- 新增重複書籤拖曳交換保留位置
- 新增「非保留」一鍵選中功能
- 優化重複書籤介面（保留書籤無勾選框）
- 持續優化用戶體驗

### v1.02 (2026-03-27)
- 新增分析統計功能（網域/資料夾 TOP10）
- 統計數量可點擊快速檢索
- 更新功能簡介和隱私政策
- 優化代碼結構和用戶體驗

### v1.01 (2026-03-27)
- 新增說明頁面（隱私政策、關於）
- 修復多項 Bug
- 優化介面設計

### v1.00 (2026-03-27)
- 初始版本發布
- 基本搜尋、批次管理、匯出功能

## 许可证 | License

MIT License

## 作者 | Author

Created with ❤️
