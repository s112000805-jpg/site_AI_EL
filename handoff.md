# AI 課程網站交接

更新日期：2026-10-07（Asia/Taipei）

## 目前狀態

- 專案：`C:\Users\chen quan fu\Documents\ChatGPT\test\ai-course-site`
- 正式 Sites 專案：`appgprj_6aa4a9a7f1688191a429a3aaee543dab`
- 正式網址：<https://ai-workflow-course-tw.b0963118770.chatgpt.site>
- 已以 merge commit `c788f14` 合併本機訪客報表與當時正式版第 37 版來源，沒有覆蓋任一邊的修改。
- 首頁資訊架構已改為「找課程、測驗題庫、認識講師、常見問題、我的學習」；手機快速導覽為「首頁、找課程、測驗、我的學習」。
- 已新增講師介紹與 FAQ；既有課程地圖、訪客留言、管理員審核、匿名訪客統計、日期篩選、CSV 與 90 天保留規則均保留。
- 本次修改已通過 `npm.cmd run lint`、`npm.cmd run build`，本機首頁、測驗題庫、訪客留言頁皆回傳 HTTP 200。
- 發布狀態：資訊架構修改已由 commit `37305f5` 建立 Sites 第 38 版並部署為 `succeeded`；正式首頁回傳 HTTP 200，且可找到「找課程、認識講師、常見問題、我的學習」。

## 已確認決策

- 「找課程」沿用既有課程地圖與搜尋，不另建重複頁面。
- 「認識講師」採首頁區塊；不使用「找師傅」，避免暗示多位講師或預約媒合。
- 「常見問題」採原生 `details/summary`，保留鍵盤操作與行動版可讀性。
- 「AI 學習文章」暫不加入主導覽；等有實際文章內容後再建立，避免出現空入口。
- 訪客留言繼續採先提交、後審核；只有附可核對來源並經管理員確認的內容，才能標示為「真實學員見證」。
- Vinext 正式站的 `next/link` 會觸發 `RSC prefetch setup error`，導致測驗頁連結與互動失效；`app/quizzes/page.tsx` 與手機導覽均應使用一般 `<a>` 做完整頁面載入。後續新增跨頁入口時沿用此做法。

## 後續工作

1. 若要新增「AI 學習文章」，先確定至少 3 篇正式內容、分類與文章資料來源，再加入首頁導覽。
2. 「真實學員見證」尚需取得學員授權與可核對來源；在此之前不得製造示範姓名、星級或成果數據。

## 參考資料

- 專案規則：[AGENTS.md](./AGENTS.md)
- 部署設定：[.openai/hosting.json](./.openai/hosting.json)
- 首頁：[app/page.tsx](./app/page.tsx)
- 手機導覽：[app/components/mobile-navigation.tsx](./app/components/mobile-navigation.tsx)
- 全站樣式：[app/globals.css](./app/globals.css)
- 訪客留言：[app/messages/page.tsx](./app/messages/page.tsx)
- 訪客統計：[db/visitors.ts](./db/visitors.ts)

## Suggested skills

- `sites:sites`：同步、修改、驗證與發布既有 Sites 網站。
- `handoff`：後續實質修改完成時，更新本文件再回報。
