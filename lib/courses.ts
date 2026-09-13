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

export const courseStages: CourseStage[] = [
  {
    id: "ai-foundations",
    number: "01",
    className: "幼幼班",
    title: "AI 啟蒙",
    subtitle: "建立正確期待與安全使用習慣",
    hours: "4–6 小時",
    objective: "理解 AI、生成式 AI 與搜尋的差異，能安全完成第一個任務，並知道重要資訊必須查證。",
    lessons: [
      {
        id: "THzgMMpIREM",
        code: "AI-01-01",
        title: "什麼是生成式 AI",
        description: "從人工智慧、資料與模型開始，建立生成式 AI 的基礎概念。",
        durationSeconds: 886,
        durationLabel: "14:46",
        startAt: 176,
        kind: "教學影片",
      },
      {
        id: "dfQLHBAIXlU",
        code: "AI-01-02",
        title: "AI 思考方式",
        description: "建立使用 AI 時的基本思考框架，為後續提問、追問與人機協作打好基礎。",
        durationSeconds: 540,
        durationLabel: "09:00",
        kind: "教學影片",
      },
    ],
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
    lessons: [],
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
    lessons: [
      {
        id: "USIpkEKYPTY",
        code: "AI-03-01",
        title: "掌握 AI 協作：從對話框到自動化看板",
        description: "理解如何將單次 AI 對話整理成可追蹤、可重複執行的自動化工作流程。",
        durationSeconds: 480,
        durationLabel: "08:00",
        kind: "教學影片",
      },
      {
        id: "wUI-IpQnLGE",
        code: "AI-03-02",
        title: "精通你的 AI 程式碼助理",
        description: "從權限控制、開發伺服器到格式化與自動化，學會把 AI 程式碼助理納入安全、可重複的開發工作流。",
        durationSeconds: 613,
        durationLabel: "10:13",
        kind: "實作影片",
      },
      {
        id: "JKqIJz8go1I",
        code: "AI-03-03",
        title: "AI 旅遊影片大師班：從零打造虛擬實境",
        description: "拆解角色、場景、環境變數、旁白與影像生成，完成一套可重複的 AI 旅遊影片製作流程。",
        durationSeconds: 491,
        durationLabel: "08:11",
        kind: "專題影片",
      },
    ],
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
    lessons: [
      {
        id: "BuASLtkWPdc",
        code: "AI-04-01",
        title: "新的疆界：理解 AI 代理",
        description: "認識 AI Agent 如何接收目標、使用工具並執行多步驟任務。",
        durationSeconds: 420,
        durationLabel: "07:00",
        kind: "教學影片",
      },
      {
        id: "xfljiHXrD6E",
        code: "AI-04-02",
        title: "OpenClaw 打造你的 AI 團隊",
        description: "理解多個 AI Agent 的角色、分工與協作，組織成可管理的 AI 團隊。",
        durationSeconds: 394,
        durationLabel: "06:34",
        kind: "實作影片",
      },
      {
        id: "n_4ZscuDQNc",
        code: "AI-04-03",
        title: "OpenClaw 2.0 五大更新全解析",
        description: "從記憶、技能、自動化、使用介面與安全更新，理解 AI Agent 系統的維護與治理。",
        durationSeconds: 360,
        durationLabel: "06:00",
        kind: "延伸影片",
      },
      {
        id: "k93Z0kulyJg",
        code: "AI-04-04",
        title: "YOLO 的演進：從想法到框架",
        description: "從即時物件偵測概念一路理解資料增強、注意力機制與產品級工具，認識 AI 模型如何演進為可部署框架。",
        durationSeconds: 701,
        durationLabel: "11:41",
        kind: "延伸影片",
      },
      {
        id: "S4l10bgniCQ",
        code: "AI-04-05",
        title: "搜尋智能體的一天：一個簡單 AI 的思考方式",
        description: "透過搜尋智能體的一日流程，理解目標拆解、資訊搜尋、結果評估與修正，建立 Agent 決策迴圈的概念。",
        durationSeconds: 513,
        durationLabel: "08:33",
        kind: "延伸影片",
      },
    ],
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
  stage.lessons.map((lesson) => ({ ...lesson, stageId: stage.id, stageTitle: `${stage.className}｜${stage.title}` })),
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
