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

/** 依課程目標產生固定題組；答案只在伺服器端批改後回傳。 */
export function buildLessonQuiz(lesson: Lesson): LessonQuiz {
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
  return { id: `${lesson.code}-${type}-${number}`, prompt, options, correctIndex, explanation, objective };
}

function distractors(lesson: Lesson, select: (item: Lesson) => string): string[] {
  const start = lesson.code.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % lessons.length;
  return [...lessons.slice(start), ...lessons.slice(0, start)]
    .filter((item) => item.id !== lesson.id)
    .map(select)
    .filter((value, index, values) => value !== select(lesson) && values.indexOf(value) === index)
    .slice(0, 3);
}
