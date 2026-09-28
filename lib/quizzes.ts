import type { Lesson } from "@/lib/courses";
import { findLesson, lessons } from "@/lib/courses";

export type QuizType = "pre" | "post";

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  objective: string;
};

export type PublicQuizQuestion = Omit<QuizQuestion, "correctIndex" | "explanation">;

export type LessonQuiz = {
  objectives: string[];
  pre: QuizQuestion[];
  post: QuizQuestion[];
  sourceNote: string;
};

const notebookLmQuizOverrides: Record<string, LessonQuiz> = {
  "v2N4Be96-eg": {
    objectives: [
      "能說明模型與 Harness 在 Agent 中的不同責任",
      "能辨識 Harness 六個架構層的用途",
      "能用獨立評估與恢復機制診斷 Agent 失敗",
    ],
    sourceNote: "依 NotebookLM 匯入的影片逐字稿建立，題目與答案已按來源內容整理。",
    pre: [
      { id: "AI-04-17-pre-1", prompt: "當 AI Agent 偶爾成功、偶爾失敗時，最值得先檢查的是什麼？", options: ["只把模型換成更昂貴的版本", "任務流程、工具與錯誤處理是否清楚", "讓 Agent 自己判定每次都成功", "增加無關背景資料"], correctIndex: 1, explanation: "穩定性不只取決於模型，也取決於外圍流程、工具與恢復機制。", objective: "能說明模型與 Harness 在 Agent 中的不同責任" },
      { id: "AI-04-17-pre-2", prompt: "下列哪一項最接近『執行編排』？", options: ["替模型購買更多運算資源", "把所有資料一次交給模型", "規定理解、檢查、輸出與驗證的步驟", "刪除所有執行紀錄"], correctIndex: 2, explanation: "執行編排像替 Agent 鋪設軌道，讓任務依明確步驟進行。", objective: "能辨識 Harness 六個架構層的用途" },
      { id: "AI-04-17-pre-3", prompt: "讓 Agent 自己替自己的答案打分，最可能出現哪個問題？", options: ["評估一定更客觀", "執行速度一定變慢", "資料一定會遺失", "容易過度樂觀而忽略錯誤"], correctIndex: 3, explanation: "生成者與評估者若沒有分離，Agent 可能高估自己的成果。", objective: "能用獨立評估與恢復機制診斷 Agent 失敗" },
    ],
    post: [
      { id: "AI-04-17-post-1", prompt: "影片中的 Harness 方程式，如何描述一個完整的 Agent？", options: ["模型 + Harness 外圍系統", "提示詞 + 更長的提示詞", "資料庫 + 網頁介面", "模型 + 人工逐題代答"], correctIndex: 0, explanation: "模型負責思考，Harness 負責讓想法穩定轉化成可執行的成果。", objective: "能說明模型與 Harness 在 Agent 中的不同責任" },
      { id: "AI-04-17-post-2", prompt: "下列哪一項不是影片所列的 Harness 六個架構層？", options: ["資訊邊界", "工具系統", "模型定價", "約束與恢復"], correctIndex: 2, explanation: "六層包含資訊邊界、工具系統、執行編排、記憶管理、評估觀測、約束恢復；模型定價不在其中。", objective: "能辨識 Harness 六個架構層的用途" },
      { id: "AI-04-17-post-3", prompt: "某 Agent 常在未確認資料前直接輸出。依影片觀念，哪個改善最合適？", options: ["增加更多無關資料", "建立先理解目標、再檢查資訊、最後驗證的 SOP", "讓 Agent 自行宣告任務成功", "取消所有限制以增加自由度"], correctIndex: 1, explanation: "執行編排用硬性 SOP 約束步驟，避免 Agent 跳過必要檢查。", objective: "能辨識 Harness 六個架構層的用途" },
      { id: "AI-04-17-post-4", prompt: "客服 Agent 每次都替自己打滿分，但顧客滿意度很低。應優先採取哪個做法？", options: ["改成讓同一 Agent 多評一次", "刪除負面顧客回饋", "只增加提示詞長度", "把生成與評估分離，由獨立 QA 機制檢查"], correctIndex: 3, explanation: "影片強調不能讓 AI 自己改自己的考卷，應把生成與評估機制分離。", objective: "能用獨立評估與恢復機制診斷 Agent 失敗" },
      { id: "AI-04-17-post-5", prompt: "當外部 API 失敗時，哪一項最符合『約束與恢復』的設計？", options: ["自動回滾到安全步驟並改走替代路徑", "忽略錯誤並假裝完成", "無限重複相同請求", "刪除所有執行紀錄"], correctIndex: 0, explanation: "約束與恢復層要能在失敗時停止、回滾，並選擇可控的替代路徑。", objective: "能用獨立評估與恢復機制診斷 Agent 失敗" },
    ],
  },
};

/** 依課程目標產生固定題組；答案只在伺服器端批改後回傳。 */
export function buildLessonQuiz(lesson: Lesson): LessonQuiz {
  if (lesson.quizStatus === "pending") {
    throw new Error("這門課程的測驗正在準備中");
  }
  const notebookLmQuiz = notebookLmQuizOverrides[lesson.id];
  if (notebookLmQuiz) return notebookLmQuiz;
  const tag = lesson.tags?.[0] ?? "AI 應用";
  const otherTitles = distractors(lesson, (item) => item.title);
  const otherDescriptions = distractors(lesson, (item) => item.description);
  const objectives = [
    `能用自己的話說明「${lesson.title}」的核心概念`,
    `能判斷「${lesson.description}」適合運用的情境`,
    `能把 ${tag} 的觀念轉化成一個可執行的小練習`,
  ];

  return {
    objectives,
    sourceNote: "依課程名稱、目標與影片說明建立的概念級題組，建議搭配影片內容作答。",
    pre: [
      question(lesson, "pre", 1, "這部課程最主要會帶你認識哪個主題？", [lesson.title, ...otherTitles], 0, `課程名稱直接指出本課的核心主題是「${lesson.title}」。`, objectives[0]),
      question(lesson, "pre", 2, `開始學習「${lesson.title}」前，哪一種準備最有助於理解？`, [`先寫下自己對「${tag}」的理解與一個疑問`, "先背下所有工具名稱，不需要理解用途", "只看影片標題，跳過實際內容", "等到完全熟悉後才開始學習"], 0, "先整理既有理解與疑問，可以幫助你在觀看時主動比對並修正觀念。", objectives[0]),
      question(lesson, "pre", 3, "如果遇到不熟悉的 AI 名詞，較合適的學習方式是什麼？", ["先用生活化例子確認意思，再回到課程情境", "直接忽略名詞，避免影響觀看速度", "只記英文拼法，不確認實際用途", "一次搜尋大量資料，不整理重點"], 0, "先建立簡單、可驗證的理解，再回到課程案例，較能避免只背名詞卻不會使用。", objectives[1]),
    ],
    post: [
      question(lesson, "post", 1, "下列哪一項最符合這部課程的主要學習目標？", [objectives[0], `能完整背誦所有 ${tag} 產品名稱`, "能在不確認需求時交由 AI 自動決定", "能用單一答案處理所有工作情境"], 0, "本課首先要求能理解並說明核心概念，而不是背誦工具或放棄人的判斷。", objectives[0]),
      question(lesson, "post", 2, "哪一項最接近本課影片說明所描述的重點？", [lesson.description, ...otherDescriptions], 0, `課程說明指出本課重點是：${lesson.description}`, objectives[1]),
      question(lesson, "post", 3, `學完「${lesson.title}」後，哪一種做法最能把知識轉成能力？`, [`選一個真實小任務，實際運用 ${tag} 的觀念並記錄結果`, "只收藏影片，不進行任何練習", "直接複製別人的成果，不檢查是否符合需求", "同時更換多種工具，避免比較前後差異"], 0, "以小型真實任務練習並留下結果，才能檢查是否真正理解與會用。", objectives[2]),
      question(lesson, "post", 4, "實作結果與預期不同時，哪一個處理順序較合理？", ["回看關鍵段落、確認需求與條件，再修改一項設定重試", "立即放棄，認定工具完全無法使用", "一次修改所有條件，讓問題更難追蹤", "只保留成功結果，不記錄失敗原因"], 0, "逐步確認需求並一次調整一個變因，較容易找出錯誤來源並累積可重複的方法。", objectives[2]),
      question(lesson, "post", 5, "哪一種表現最能證明你已掌握本課內容？", [`能說明「${lesson.title}」、完成一個小應用，並指出適用範圍或限制`, "能說出影片長度與上架日期", "能快速播放完整部影片", "能記住畫面中出現的所有文字"], 0, "真正掌握包含理解、應用與判斷限制，不只是看完或記住表面資訊。", objectives[0]),
    ],
  };
}

export function getQuizQuestions(lessonId: string, quizType: QuizType) {
  const lesson = findLesson(lessonId);
  if (!lesson) throw new Error("找不到指定的課程影片");
  if (lesson.quizStatus === "pending") throw new Error("這門課程的測驗正在準備中");
  return buildLessonQuiz(lesson)[quizType];
}

export function toPublicQuestions(questions: QuizQuestion[]): PublicQuizQuestion[] {
  return questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    options: question.options,
    objective: question.objective,
  }));
}

function question(lesson: Lesson, type: QuizType, number: number, prompt: string, options: string[], correctIndex: number, explanation: string, objective: string): QuizQuestion {
  // 依題號旋轉選項，避免學員只靠固定答案位置猜題。
  const offset = (number + (type === "post" ? 1 : 0)) % options.length;
  const rotatedOptions = [...options.slice(offset), ...options.slice(0, offset)];
  const rotatedCorrectIndex = (correctIndex - offset + options.length) % options.length;
  return { id: `${lesson.code}-${type}-${number}`, prompt, options: rotatedOptions, correctIndex: rotatedCorrectIndex, explanation, objective };
}

function distractors(lesson: Lesson, select: (item: Lesson) => string): string[] {
  const start = lesson.code.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % lessons.length;
  return [...lessons.slice(start), ...lessons.slice(0, start)]
    .filter((item) => item.id !== lesson.id)
    .map(select)
    .filter((value, index, values) => value !== select(lesson) && values.indexOf(value) === index)
    .slice(0, 3);
}
