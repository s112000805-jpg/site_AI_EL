# AGENTS.md

本文件適用於此目錄及所有子目錄。目標是讓後續開發代理延續已驗證的做法，安全維護 AI 課程網站，並以可重現的證據回報結果。課程網站專案的工作目錄是：
C:\Users\chen quan fu\Documents\ChatGPT\test\ai-course-site

## 專案基準

- 專案：繁體中文 AI 課程學習網站。
- 技術：Vinext、Next.js、React、TypeScript、Tailwind CSS、Cloudflare Workers、D1、Drizzle。
- Node.js：必須使用 `22.13.0` 以上版本。
- 正式 Sites 專案：`appgprj_6aa4a9a7f1688191a429a3aaee543dab`。
- 正式網址：`https://ai-workflow-course-tw.b0963118770.chatgpt.site`。
- 網站部署設定以 `.openai/hosting.json` 為準，不建立替代 Sites 專案。
- 課程主資料位於 `lib/courses.ts`；不要在元件中複製另一份課程資料。

開始工作前必須重新檢查檔案、Git 狀態、分支、遠端、部署設定與目前資料結構。既有未提交修改屬於使用者，不得覆蓋、重設或順手整理無關內容。

## 回應與工作方式

1. 使用繁體中文說明思路、結果與風險。
2. 先確認需求對應到目前專案中的真實頁面和元件，再動手修改。
3. 若截圖、按鈕文字或功能名稱在此專案完全找不到，停止修改並請使用者提供正確專案或網址；不得猜測實作。
4. 優先做最小、可驗證的變更，延續現有資訊架構、視覺節奏與元件模式。
5. 參考其他網站時，只借用資訊架構與互動概念，不複製品牌文字、圖片或受保護素材。
6. 先解釋核心原理，再提供必要的程式細節；關鍵邊界條件要明確指出。

## 重要檔案

- `lib/courses.ts`：課程階段、課程編號、影片 ID、時長、標籤等單一資料來源。
- `app/components/course-catalog.tsx`：課程搜尋、主題篩選與課程地圖。
- `app/components/course-video.tsx`：YouTube 影片播放與學習進度行為。
- `app/progress/page.tsx`：學習成果頁。
- `app/api/progress/route.ts`：學習進度 API。
- `app/api/admin/export/route.ts`：管理者 CSV 匯出。
- `db/` 與 `drizzle/`：正式資料結構與 migration。
- `scripts/local-db-init.sql`：只供本機 D1 初始化，不取代正式 migration。
- `scripts/start-site-windows.ps1` 與 `啟動網站.cmd`：Windows 一鍵啟動流程。
- `app/globals.css`：全站樣式、響應式與深色模式。

## 實作規則

### 課程資料

- 每堂課必須有穩定且不重複的課程編號，例如 `AI-02-13`。
- 新課程使用該階段下一個尚未占用的編號；不得重排或覆蓋既有編號。
- 影片以 YouTube ID 去重，即使標題不同也不能新增第二份。
- 新增影片前先判斷適合的階段，完成回報要包含分類依據與加入位置。
- Canva、簡報設計、投影片生成或簡報工作流課程使用 `Canva／簡報` 標籤。
- ChatGPT 功能、提示設計、GPTs 或 ChatGPT 實務工作流使用 `ChatGPT` 標籤；只有順帶提及時不加標籤。
- 影片生成、剪輯、分鏡、字幕、配音、數位人、發布或後製課程使用 `影片製作` 標籤。
- 可重複工作流、代理、觸發器、排程、系統整合、腳本或無程式碼流程使用 `自動化` 標籤。
- 一堂課可以有多個標籤，但每個標籤都必須代表主要教學內容，且名稱必須完全一致。
- 標籤篩選必須由課程資料動態產生，並能與文字搜尋同時生效。

### YouTube

- 使用 `https://www.youtube-nocookie.com/embed/VIDEO_ID` 嵌入，不下載或複製影片檔。
- iframe 必須具備有意義的 `title`、響應式比例與必要的播放權限。
- 自動同步頻道時，先讀取網站全部既有影片 ID，再同時檢查頻道的 Videos 與 Shorts 分頁，合併後按發布時間由新到舊處理。
- 影片 ID 出現在 Shorts 分頁或正式網址為 Shorts URL 時，分流為 `Shorts／短影音`；不得只用時長判斷。
- Shorts 與一般長影片仍依教學主題分配課程階段；影片形式只影響內容類型篩選，不取代課程階段。
- 資料模型可擴充時，優先使用 `contentType: "short" | "long"`；尚未擴充前，以 `Shorts／短影音` 標籤作為相容分流訊號。
- 同一影片若同時出現在 Videos 與 Shorts 結果，只能保留一筆課程資料。
- 只新增「第一支已知影片之前」的影片；如果整個清單都找不到已知影片，停止批次匯入並回報基準遺失。
- 不得自行變更影片公開狀態、刪除課程或補入頻道中的歷史缺口。

### 身分、管理與資料庫

- 正式資料使用 D1 binding `DB`。
- 管理者授權使用執行環境的 `ADMIN_EMAIL`，不得把真實管理員信箱寫死在程式碼。
- ChatGPT workspace 身分標頭與一般頁面渲染要分開驗證；沒有正確身分時，管理 API 回傳 `401` 是合理結果。
- 功能擴充順序維持：身分與角色 → 固定課程 ID/時長 → 影片進度 → 學習成果 → 管理報表 → 篩選與下載。
- 本機出現 `D1_ERROR: no such table: learners` 時，先初始化本機 D1，不要修改正式 migration 來掩蓋問題。

## 本機執行與驗證

在 PowerShell 中執行，避免複雜中文路徑與 `%` 經過多層 `cmd.exe` 展開：

```powershell
node --version
& 'C:\Program Files\nodejs\npm.cmd' run build
& 'C:\Program Files\nodejs\npm.cmd' run lint
& 'C:\Program Files\nodejs\npm.cmd' run start
```

如果系統 npm 路徑不同，先解析目前可用的 `npm.cmd`，不可盲目固定路徑。若專案內 npm shim 缺少 `npm-prefix.js`，改用已確認可用的系統 `npm.cmd`。

最低驗證標準：

1. TypeScript／正式建置成功。
2. 與變更相關的 lint 或檢查成功。
3. 首頁、目標頁面與靜態資源回傳 HTTP 200。
4. 在實際渲染結果確認新增文字、課程編號、影片 ID、標籤與互動。
5. 深色模式、行動版與鍵盤／ARIA 狀態沒有明顯退化。
6. API 或資料庫變更需涵蓋未登入、非管理者、空資料、重複資料與錯誤輸入。

若 `dist` 因 `EPERM` 無法清除，先停止仍占用它的 Wrangler／Node 程序再建置；不得刪除整個專案或重設 Git。

## 本機 D1 初始化

僅在本機資料表尚未建立時執行：

```powershell
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file scripts/local-db-init.sql
```

Windows 的 Node `--import` 使用相對路徑；絕對 Windows 路徑可能觸發 `ERR_UNSUPPORTED_ESM_URL_SCHEME`。

## Sites 發布規則

1. 修改前讀取 Sites building 與 hosting 的現行操作規範。
2. 核對 `.openai/hosting.json`、Sites 專案、目前版本、受眾與部署狀態。
3. 本機建置及頁面驗證通過後才可發布。
4. 使用短效 source repository credential，僅透過標準輸入傳遞；不得寫入檔案、命令參數、日誌或提交紀錄。
5. 使用官方 Sites 工作流提交來源，並保存精確的 commit SHA。
6. Windows 若已推送來源、但官方包裝流程因 `/bin/bash` 無法解析 `C:\...` 路徑而失敗，使用 Git for Windows Bash 搭配 `/c/...` 路徑執行同一份官方 `package-site.sh`；先解析目前安裝版本，不能固定舊版外掛路徑。
7. 使用精確 commit SHA 與官方產生的 archive 儲存版本，再部署該版本。
8. 只有部署狀態為 `succeeded`，且正式網址可驗證時，才能回報「已上線」。

以下狀態必須分開表達：

- 已修改：檔案已變更，但尚未驗證。
- 已驗證：本機建置與頁面檢查通過，但尚未發布。
- 已儲存版本：Sites 已建立版本，但未必部署成功。
- 已上線：部署為 `succeeded`，正式網址也已確認。

不得因本機 build 成功、Git push 成功或版本儲存成功，就宣稱正式網站已更新。

## Git 與安全邊界

- 不使用 `git reset --hard`、`git checkout --` 或其他會覆蓋使用者工作的命令。
- 不提交密碼、短效憑證、登入標頭、管理員信箱或本機狀態資料。
- 不推送 GitHub mirror，除非使用者明確要求；Sites deployment remote 與 GitHub remote 必須分開處理。
- 不建立新的 Sites 專案來規避部署問題。
- 不修改無關檔案；大量格式化前先確認範圍。

## 完成回報

回報必須包含：

- 修改了什麼，以及影響哪些頁面或資料。
- 執行過哪些驗證，以及實際結果。
- 若新增課程：課程編號、階段、分類理由、影片 ID 與標籤。
- 是否完成發布；若已發布，提供 Sites 版本與正式網址。
- 尚未完成或無法驗證的部分要明確列出，不使用模糊的成功描述。
