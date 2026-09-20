export type Lesson = {
  id: string;
  code: string;
  title: string;
  description: string;
  durationSeconds: number;
  durationLabel: string;
  startAt?: number;
  kind: string;
};

export type CourseStage = {
  id: string;
  number: string;
  className: string;
  title: string;
  subtitle: string;
  hours: string;
  objective: string;
  topics: Array<{ title: string; detail: string }>;
  project: string;
  lessons: Lesson[];
};

type LessonSeed = Omit<Lesson, "durationLabel">;

/** 統一由秒數產生顯示時間，避免影片長度與標籤不同步。 */
function createLesson(seed: LessonSeed): Lesson {
  const minutes = Math.floor(seed.durationSeconds / 60);
  const seconds = seed.durationSeconds % 60;
  return {
    ...seed,
    durationLabel: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
  };
}

const foundationLessons = [
  createLesson({ id: "THzgMMpIREM", code: "AI-01-01", title: "什麼是生成式 AI", description: "從人工智慧、資料與模型開始，建立生成式 AI 的基礎概念。", durationSeconds: 887, startAt: 176, kind: "教學影片" }),
  createLesson({ id: "MAY4An8D7yE", code: "AI-01-02", title: "揭開 AI 的神秘面紗", description: "用生活化案例理解 AI 的能力、限制與常見應用，建立完整的入門地圖。", durationSeconds: 796, kind: "觀念影片" }),
  createLesson({ id: "cYmzYoEJreU", code: "AI-01-03", title: "數位大幻象：從開關到 AI", description: "從電腦的基本運作一路理解資料、程式與 AI，補足數位科技的核心背景。", durationSeconds: 902, kind: "觀念影片" }),
  createLesson({ id: "rsdk0wmoSBM", code: "AI-01-04", title: "提示詞的奇幻漂流：解密 LLM 文字生成", description: "理解大型語言模型如何根據提示預測與生成文字，建立正確的提示設計觀念。", durationSeconds: 796, kind: "教學影片" }),
  createLesson({ id: "dfQLHBAIXlU", code: "AI-01-05", title: "AI 思考方式", description: "建立使用 AI 時的基本思考框架，為後續提問、追問與人機協作打好基礎。", durationSeconds: 513, kind: "教學影片" }),
  createLesson({ id: "xOIpOneOx44", code: "AI-01-06", title: "第 1 課：ChatGPT 是什麼？", description: "認識 ChatGPT 的用途與基本操作，完成第一次生成式 AI 對話。", durationSeconds: 342, kind: "入門實作" }),
  createLesson({ id: "fvErigVhE9E", code: "AI-01-07", title: "如何使用 ChatGPT", description: "從輸入問題、補充背景到修正答案，掌握 ChatGPT 的基本使用流程。", durationSeconds: 241, kind: "入門實作" }),
  createLesson({ id: "RpkLAulaMc0", code: "AI-01-08", title: "2 分鐘了解 ChatGPT", description: "快速掌握 ChatGPT 的運作概念、適用任務與使用時應注意的限制。", durationSeconds: 136, kind: "快速導讀" }),
  createLesson({ id: "hvLbKydeHkw", code: "AI-01-09", title: "2026 AI 職缺市場：現實與金礦", description: "理解 AI 對職務與技能需求的影響，建立務實的學習方向與職涯判斷。", durationSeconds: 455, kind: "趨勢影片" }),
];

const applicationLessons = [
  createLesson({ id: "rWKhewf4iKw", code: "AI-02-01", title: "AI 作為你的思維夥伴", description: "透過提問、追問與觀點比較，讓 AI 協助釐清想法並改善決策。", durationSeconds: 430, kind: "教學影片" }),
  createLesson({ id: "LNMHoCnoudU", code: "AI-02-02", title: "DeepSeek 七大提問技巧", description: "練習七種實用提問方法，改善需求表達、答案結構與結果品質。", durationSeconds: 166, kind: "提示實作" }),
  createLesson({ id: "sOfvkU2wf-M", code: "AI-02-03", title: "DeepSeek R1 實用技巧", description: "認識推理模型的使用方式，學會為複雜問題補充條件並檢查推理結果。", durationSeconds: 198, kind: "工具實作" }),
  createLesson({ id: "XpiwDd0pa5s", code: "AI-02-04", title: "ChatGPT 進階實戰：五大關鍵功能", description: "整合 ChatGPT 的進階能力，提升研究、整理、寫作與多模態任務效率。", durationSeconds: 943, kind: "進階實作" }),
  createLesson({ id: "UhdPD5bTZ0E", code: "AI-02-05", title: "AI 電子郵件大師指南", description: "運用 AI 撰寫、改寫與檢查電子郵件，兼顧語氣、目的與收件者情境。", durationSeconds: 450, kind: "辦公實作" }),
  createLesson({ id: "VmcqbM4S6g4", code: "AI-02-06", title: "AI 時代的簡報煉金術", description: "從內容架構到視覺表達，運用 AI 提升簡報規劃與製作效率。", durationSeconds: 385, kind: "辦公實作" }),
  createLesson({ id: "ziOoo0aw8VM", code: "AI-02-07", title: "Canva 2026 五大神技", description: "掌握 Canva 的 AI 設計與內容功能，快速完成工作與報告所需視覺素材。", durationSeconds: 1011, kind: "設計實作" }),
  createLesson({ id: "wq0ROlvLHZQ", code: "AI-02-08", title: "Canva 更新：從混亂到清晰", description: "整理新版 Canva 的介面與功能變化，建立更清楚的設計操作流程。", durationSeconds: 1143, kind: "設計實作" }),
  createLesson({ id: "-Pi4tzmMQU0", code: "AI-02-09", title: "第 2 課：讓 AI 幫你輕鬆做影片", description: "認識 AI 影片製作的基礎步驟，從文字構想到可觀看的影像內容。", durationSeconds: 152, kind: "影音入門" }),
  createLesson({ id: "5vuZqm8RBwo", code: "AI-02-10", title: "第 3 課：AI 幫助製作電影", description: "從故事、畫面到剪輯，理解 AI 如何參與簡易電影製作流程。", durationSeconds: 366, kind: "影音實作" }),
  createLesson({ id: "S2V-Zvm7CK4", code: "AI-02-11", title: "蘇格拉底私人學習教練", description: "用追問與反思設計個人化 AI 學習教練，強化理解而非只取得答案。", durationSeconds: 725, kind: "學習實作" }),
  createLesson({ id: "kRmJXErE5Bk", code: "AI-02-12", title: "拆解『留言 666 免費送文件』內容策略", description: "分析社群內容的引導與轉換設計，建立對 AI 行銷話術的判讀能力。", durationSeconds: 252, kind: "案例分析" }),
];

const workflowLessons = [
  createLesson({ id: "USIpkEKYPTY", code: "AI-03-01", title: "掌握 AI 協作：從對話框到自動化看板", description: "將單次 AI 對話整理成可追蹤、可重複執行的自動化工作流程。", durationSeconds: 487, kind: "教學影片" }),
  createLesson({ id: "1xyrq7azpmQ", code: "AI-03-02", title: "ChatGPT 工作分頁：自動化你的工作流程", description: "利用工作分頁整理任務、資料與輸出，建立可持續操作的 AI 工作空間。", durationSeconds: 635, kind: "工作流實作" }),
  createLesson({ id: "wUI-IpQnLGE", code: "AI-03-03", title: "精通你的 AI 程式碼助理", description: "從權限控制、開發伺服器到格式化與自動化，將 AI 助理納入安全的開發工作流。", durationSeconds: 614, kind: "開發實作" }),
  createLesson({ id: "6AM5pvx3ngI", code: "AI-03-04", title: "Codex AI 保姆級教學", description: "從專案理解、修改程式到驗證成果，循序掌握 AI 編碼代理的工作方式。", durationSeconds: 514, kind: "開發實作" }),
  createLesson({ id: "4-lAJTvPbs8", code: "AI-03-05", title: "Vibe Coding 全圖解教學", description: "理解需求描述、AI 產碼、測試與修正的完整循環，建立可控的 Vibe Coding 流程。", durationSeconds: 620, kind: "開發實作" }),
  createLesson({ id: "SUMg-5mh4ls", code: "AI-03-06", title: "解鎖技術堆疊：App 實際上如何運作", description: "理解前端、後端、資料庫與部署之間的關係，補足 AI 開發所需的系統觀。", durationSeconds: 546, kind: "技術基礎" }),
  createLesson({ id: "XQdck8qopXM", code: "AI-03-07", title: "從 0 到 1：AI 雙向同步待辦清單", description: "以短篇實作展示資料同步與任務狀態更新，建立自動化應用的基本概念。", durationSeconds: 51, kind: "快速實作" }),
  createLesson({ id: "FcI0VM8J0gQ", code: "AI-03-08", title: "從零打造一人 AI 公司", description: "整合 AI 工具、任務分工與可重複流程，建立個人化的 AI 營運工作流。", durationSeconds: 382, kind: "專題影片" }),
  createLesson({ id: "D_kJKtdiHsc", code: "AI-03-09", title: "Hedra + Clipchamp 影片工作流", description: "串接 AI 角色生成與影片剪輯工具，完成可重複的內容生產流程。", durationSeconds: 422, kind: "影音工作流" }),
  createLesson({ id: "JKqIJz8go1I", code: "AI-03-10", title: "AI 旅遊影片大師班：從零打造虛擬實境", description: "拆解角色、場景、旁白與影像生成，完成一套可重複的 AI 旅遊影片流程。", durationSeconds: 492, kind: "影音工作流" }),
  createLesson({ id: "DrZELLmq3EY", code: "AI-03-11", title: "Seedance 2.0 實戰", description: "掌握提示設計、鏡頭規劃與生成迭代，建立 AI 影片製作的系統化流程。", durationSeconds: 1250, kind: "影音工作流" }),
  createLesson({ id: "WWK94o_uwsg", code: "AI-03-12", title: "從鍵盤奴隸到語音指揮官：AI 語音轉化系統", description: "理解語音輸入、轉換與自動處理的組合方式，設計更自然的操作工作流。", durationSeconds: 890, kind: "語音工作流" }),
  createLesson({ id: "1WX3aZ_1fWg", code: "AI-03-13", title: "拯救手動跟進：一步步實現銷售自動化", description: "把名單、跟進與狀態更新串成自動化流程，降低重複操作與遺漏。", durationSeconds: 543, kind: "商務工作流" }),
  createLesson({ id: "ezHAgTET-lk", code: "AI-03-14", title: "部署 Flask App", description: "理解 Flask 應用從本機開發到上線服務的部署流程與常見檢查點。", durationSeconds: 449, kind: "部署實作" }),
  createLesson({ id: "Tx2De59szqM", code: "AI-03-15", title: "DNS 解密：CNAME 紀錄的重要性", description: "理解網域解析與 CNAME 的角色，補足網站部署與服務串接所需的網路知識。", durationSeconds: 404, kind: "系統基礎" }),
];

const systemLessons = [
  createLesson({ id: "BuASLtkWPdc", code: "AI-04-01", title: "新的疆界：理解 AI 代理", description: "認識 AI Agent 如何接收目標、使用工具並執行多步驟任務。", durationSeconds: 418, kind: "教學影片" }),
  createLesson({ id: "xfljiHXrD6E", code: "AI-04-02", title: "OpenClaw 打造你的 AI 團隊", description: "理解多個 AI Agent 的角色、分工與協作，組織成可管理的 AI 團隊。", durationSeconds: 395, kind: "實作影片" }),
  createLesson({ id: "n_4ZscuDQNc", code: "AI-04-03", title: "OpenClaw 2.0 五大更新全解析", description: "從記憶、技能、自動化、使用介面與安全更新，理解 Agent 系統的維護與治理。", durationSeconds: 359, kind: "延伸影片" }),
  createLesson({ id: "VmNKDbd_vsI", code: "AI-04-04", title: "用 Claude Code 打造自動化 AI 公司", description: "以多代理分工、任務委派與程式自動化，設計可營運的一人 AI 公司系統。", durationSeconds: 443, kind: "系統實作" }),
  createLesson({ id: "2__6tBXjyJ8", code: "AI-04-05", title: "AI Agent 如何自己接管你的滑鼠", description: "快速理解電腦操作型 Agent 如何觀察介面、規劃動作並控制滑鼠完成任務。", durationSeconds: 66, kind: "快速導讀" }),
  createLesson({ id: "zSHJBsuliE8", code: "AI-04-06", title: "為什麼 AI 智能體會說謊？", description: "認識 Agent 產生錯誤敘述的原因，以及驗證、限制與人工審核的重要性。", durationSeconds: 79, kind: "風險導讀" }),
  createLesson({ id: "S4l10bgniCQ", code: "AI-04-07", title: "搜尋智能體的一天：一個簡單 AI 的思考方式", description: "透過搜尋智能體的流程，理解目標拆解、搜尋、評估與修正的 Agent 決策迴圈。", durationSeconds: 513, kind: "Agent 專題" }),
  createLesson({ id: "0gOzGcMUEqM", code: "AI-04-08", title: "OpenClaw 安全必備指南", description: "建立權限、機密資料、工具存取與人工關卡的安全觀念，降低 Agent 執行風險。", durationSeconds: 366, kind: "安全治理" }),
  createLesson({ id: "HRxJsYYYFKQ", code: "AI-04-09", title: "口袋裡的隱形員工：解密 Grok Bot", description: "理解 Bot 與 Agent 的角色、能力邊界及其在工作場景中的自動化應用。", durationSeconds: 952, kind: "Agent 專題" }),
  createLesson({ id: "SnAR3MEX19c", code: "AI-04-10", title: "企業資料處理：解析與分塊實戰", description: "理解企業文件進入 AI 系統前的解析、分塊與品質控制，建立可靠的知識輸入流程。", durationSeconds: 388, kind: "資料工程" }),
  createLesson({ id: "QCPs3dVfcO4", code: "AI-04-11", title: "知識蒸餾：讓 AI 更小、更聰明、更快", description: "理解如何把大型模型能力轉移到較小模型，兼顧效能、速度與部署成本。", durationSeconds: 451, kind: "模型專題" }),
  createLesson({ id: "mevav8qZhiE", code: "AI-04-12", title: "終極 AI 藍圖：解構吳恩達機器學習課程", description: "整理機器學習的重要概念與學習路線，建立由應用走向模型技術的全貌。", durationSeconds: 460, kind: "模型專題" }),
  createLesson({ id: "k93Z0kulyJg", code: "AI-04-13", title: "YOLO 的演進：從想法到框架", description: "從即時物件偵測理解資料增強、注意力機制，以及模型如何演進為可部署框架。", durationSeconds: 702, kind: "視覺模型" }),
  createLesson({ id: "lxzRCwRr6Wk", code: "AI-04-14", title: "SayCan：教導機器人理解現實世界", description: "理解語言模型如何結合機器人技能與環境限制，把指令轉換成可執行行動。", durationSeconds: 421, kind: "機器人專題" }),
  createLesson({ id: "BO03wg4ynDo", code: "AI-04-15", title: "自主移動機器人 AMR：原理與未來", description: "從定位、導航、感測到任務調度，理解自主移動機器人的系統架構與應用。", durationSeconds: 1103, kind: "機器人專題" }),
];

export const courseStages: CourseStage[] = [
  {
    id: "ai-foundations",
    number: "01",
    className: "幼幼班",
    title: "AI 啟蒙",
    subtitle: "建立正確期待與安全使用習慣",
    hours: "4–6 小時",
    objective: "理解 AI、生成式 AI 與搜尋的差異，能安全完成第一個任務，並知道重要資訊必須查證。",
    lessons: foundationLessons,
    topics: [
      { title: "什麼是生成式 AI", detail: "人工智慧、生成式 AI、資料與模型" },
      { title: "第一次與 AI 協作", detail: "提問、追問、改寫與基本操作" },
      { title: "AI 也會說錯話", detail: "幻覺、過時資訊與來源查證" },
      { title: "AI 安全使用守則", detail: "個資、機密、著作權與偏見" },
    ],
    project: "使用 AI 完成一項真實任務，附上人工查證紀錄。",
  },
  {
    id: "ai-applications",
    number: "02",
    className: "小班",
    title: "AI 應用",
    subtitle: "從隨便問問，進步到穩定產出",
    hours: "8–12 小時",
    objective: "掌握目標、背景、輸出與邊界，讓 AI 協助摘要、寫作、規劃、比較與日常辦公。",
    lessons: applicationLessons,
    topics: [
      { title: "好提示的核心元素", detail: "任務、背景、資料、格式與邊界" },
      { title: "追問與反覆改善", detail: "澄清問題、範例與多輪協作" },
      { title: "AI 職場生產力", detail: "Email、摘要、企劃與決策輔助" },
      { title: "文件與多模態應用", detail: "PDF、圖片、表格與內容比較" },
    ],
    project: "建立摘要、寫作、分析、規劃和檢查五種提示模板。",
  },
  {
    id: "ai-workflows",
    number: "03",
    className: "中班",
    title: "AI 工作流",
    subtitle: "把單次問答串成可重複流程",
    hours: "12–18 小時",
    objective: "整合研究、文件與資料分析，將大型工作拆成輸入、處理、審核及輸出。",
    lessons: workflowLessons,
    topics: [
      { title: "AI 搜尋與研究", detail: "研究問題、來源層級與交叉查證" },
      { title: "資料整理與分析", detail: "分類、趨勢、異常與洞察呈現" },
      { title: "多步驟工作流設計", detail: "任務拆解、完成條件與人工審核" },
      { title: "模板與知識管理", detail: "背景資料、範例、版本與品質標準" },
    ],
    project: "完成一套研究、分析、產出與審核的可重複流程。",
  },
  {
    id: "ai-systems",
    number: "04",
    className: "大班",
    title: "AI 系統管理",
    subtitle: "讓流程可測試、可交接、可持續改善",
    hours: "18–24 小時",
    objective: "理解 Agent 與自動化，設計權限、測試、例外處理、團隊治理及成效指標。",
    lessons: systemLessons,
    topics: [
      { title: "Agent 與自動化基礎", detail: "觸發、工具、狀態與適用情境" },
      { title: "權限與人工關卡", detail: "最小權限、批准、停止與升級條件" },
      { title: "AI 系統測試", detail: "正常、缺資料、例外與高風險案例" },
      { title: "治理與成效管理", detail: "負責人、版本、品質、時間與返工率" },
    ],
    project: "建立含權限、測試案例與人工審核點的 AI 工作系統。",
  },
];

export const lessons = courseStages.flatMap((stage) =>
  stage.lessons.map((lesson) => ({
    ...lesson,
    stageId: stage.id,
    stageTitle: `${stage.className}｜${stage.title}`,
  })),
);

export function findLesson(id: string) {
  return lessons.find((lesson) => lesson.id === id);
}

export function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  if (hours > 0) return `${hours} 小時 ${minutes} 分`;
  return `${minutes} 分鐘`;
}
