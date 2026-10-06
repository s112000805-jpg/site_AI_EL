# AI 課程網站交接

更新日期：2026-10-07（Asia/Taipei）

## 目前狀態

- 專案：`C:\Users\chen quan fu\Documents\ChatGPT\test\ai-course-site`
- 正式 Sites 專案：`appgprj_6aa4a9a7f1688191a429a3aaee543dab`
- 正式網址：<https://ai-workflow-course-tw.b0963118770.chatgpt.site>
- Sites 查詢顯示正式站最新版本為 37；本機尚未重新同步該版本的來源。
- 本機 `main` 已建立 commit `0246f95`（訪客日期篩選、每日趨勢、CSV 與 90 天保留機制），已通過 lint 與 build，但尚未推送或發布。
- 使用者後續要求新增「訪客留言」及其下方的「真實學員見證」。目前尚未實作，也沒有可合法發布的真實見證內容。

## 已確認決策

- 訪客留言採先提交、後審核；不得未經審核直接公開。
- 只有附可核對來源並經管理員確認的內容，才能標示為「真實學員見證」。
- 沒有已核准見證時，使用誠實的待收集狀態，不製造示範姓名、星級或學員成果。
- 留言與見證應使用 D1 migration 建立正式資料表，不在請求處理期間動態修改 migration 管理的 schema。
- 首頁導覽改版已另開 fork 聊天規劃，尚未授權在此工作區直接修改導覽。

## 下一步

1. 使用 Sites source workflow 取得並核對正式站版本 37 的最新來源，再整合本機 commit `0246f95`；不得直接覆蓋遠端較新的修改。
2. 為訪客留言／學員見證設計 D1 schema、migration、公開送出 API、管理員審核流程與首頁卡片。
3. 補上垃圾訊息限制、欄位長度、URL 驗證、同源檢查、HTML 轉義與空資料狀態。
4. 執行 migration、本機 API／權限測試、行動版與深色模式檢查、lint、build。
5. 只有 Sites 部署狀態為 `succeeded` 且正式網址可驗證後，才能回報已上線。

## 參考資料

- 專案規則：[AGENTS.md](./AGENTS.md)
- 部署設定：[.openai/hosting.json](./.openai/hosting.json)
- 訪客統計：[db/visitors.ts](./db/visitors.ts)
- 管理後台：[app/admin/page.tsx](./app/admin/page.tsx)
- 首頁：[app/page.tsx](./app/page.tsx)
- 尚未發布的訪客報表提交：`0246f95`

## Suggested skills

- `sites:sites`：同步、修改、驗證與發布既有 Sites 網站。
- `handoff`：在後續任務結束時壓縮仍需延續的工作脈絡，更新本文件。
- `skill-installer`：只有在需要安裝或更新第三方技能時使用。
