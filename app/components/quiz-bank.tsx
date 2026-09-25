"use client";

import { useMemo, useState } from "react";
import type { PublicQuizQuestion } from "@/lib/quizzes";

type LessonChoice = {
  id: string;
  code: string;
  title: string;
  stageId: string;
  stageLabel: string;
  sourceNote: string;
  questions: PublicQuizQuestion[];
  attempt: { score: number; maxScore: number; wrongQuestionIds: string[] } | null;
};

type QuizResult = {
  score: number;
  maxScore: number;
  wrongQuestionIds: string[];
  details: Array<{ id: string; correctIndex: number; correct: boolean; explanation: string }>;
};

export function QuizBank({ lessons, signedIn, signInHref }: { lessons: LessonChoice[]; signedIn: boolean; signInHref: string }) {
  const [stageId, setStageId] = useState("all");
  const [lessonId, setLessonId] = useState(lessons[0]?.id ?? "");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const stages = useMemo(() => Array.from(new Map(lessons.map((lesson) => [lesson.stageId, lesson.stageLabel]))), [lessons]);
  const visibleLessons = stageId === "all" ? lessons : lessons.filter((lesson) => lesson.stageId === stageId);
  const activeLesson = lessons.find((lesson) => lesson.id === lessonId) ?? visibleLessons[0];
  const completed = Boolean(activeLesson?.questions.every((question) => Number.isInteger(answers[question.id])));

  const reset = () => { setAnswers({}); setResult(null); setState("idle"); };
  const selectStage = (value: string) => {
    setStageId(value);
    const first = value === "all" ? lessons[0] : lessons.find((lesson) => lesson.stageId === value);
    setLessonId(first?.id ?? "");
    reset();
  };
  const selectLesson = (value: string) => { setLessonId(value); reset(); };

  const submit = async () => {
    if (!activeLesson || !signedIn || !completed) return;
    setState("saving");
    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lessonId: activeLesson.id, quizType: "post", answers }),
      });
      const payload = await response.json() as QuizResult & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "提交失敗");
      setResult(payload);
      setState("idle");
    } catch {
      setState("error");
    }
  };

  if (!activeLesson) return <p className="quiz-bank-empty">目前尚無可作答的課程。</p>;

  return <div className="quiz-bank-layout">
    <aside className="quiz-bank-picker" aria-label="選擇測驗科目">
      <div className="quiz-bank-field"><label htmlFor="quiz-stage">課程階段</label><select id="quiz-stage" value={stageId} onChange={(event) => selectStage(event.target.value)}><option value="all">全部階段</option>{stages.map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></div>
      <div className="quiz-bank-field"><label htmlFor="quiz-lesson">測驗科目</label><select id="quiz-lesson" value={activeLesson.id} onChange={(event) => selectLesson(event.target.value)}>{visibleLessons.map((lesson) => <option value={lesson.id} key={lesson.id}>{lesson.code}｜{lesson.title}</option>)}</select></div>
      <div className="quiz-bank-course-card"><span>{activeLesson.stageLabel}</span><h2>{activeLesson.title}</h2><p>{activeLesson.sourceNote}</p><b>{activeLesson.questions.length} 題單選題</b>{activeLesson.attempt && <small>上次成績 {activeLesson.attempt.score}/{activeLesson.attempt.maxScore} · 錯題 {activeLesson.attempt.wrongQuestionIds.length}</small>}</div>
    </aside>
    <section className="quiz-bank-paper" aria-live="polite">
      <div className="quiz-bank-paper-heading"><div><span>{activeLesson.code}</span><h1>{activeLesson.title}</h1></div><b>{result ? `${result.score} / ${result.maxScore}` : `${activeLesson.questions.length} 題`}</b></div>
      <div className="quiz-questions">{activeLesson.questions.map((question, index) => {
        const detail = result?.details.find((item) => item.id === question.id);
        return <fieldset className={detail ? (detail.correct ? "is-correct" : "is-wrong") : ""} key={question.id}><legend><span>{index + 1}</span>{question.prompt}</legend>{question.options.map((option, optionIndex) => <label key={`${question.id}-${optionIndex}`}><input type="radio" name={question.id} checked={answers[question.id] === optionIndex} disabled={Boolean(result)} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} /><span>{String.fromCharCode(65 + optionIndex)}. {option}</span></label>)}{detail && <div className="quiz-explanation"><b>{detail.correct ? "答對了" : `正確答案：${String.fromCharCode(65 + detail.correctIndex)}`}</b><p>{detail.explanation}</p><small>學習目標：{question.objective}</small></div>}</fieldset>;
      })}</div>
      {result ? <div className="quiz-result"><b>本次得分 {result.score} / {result.maxScore}</b><span>{result.wrongQuestionIds.length ? `有 ${result.wrongQuestionIds.length} 題需要再複習，已記錄到學習成果。` : "全部答對，做得很好。"}</span><button type="button" onClick={reset}>再做一次</button></div>
        : signedIn ? <div className="quiz-submit"><button type="button" disabled={!completed || state === "saving"} onClick={submit}>{state === "saving" ? "正在批改…" : "提交並保存成績"}</button><span>{completed ? "完成後會記錄分數與錯題。" : "請完成所有題目後提交。"}</span>{state === "error" && <span role="alert">暫時無法保存，請稍後再試。</span>}</div>
          : <div className="quiz-signin"><span>登入後即可作答並保存成績與錯題。</span><a href={signInHref} target="_top">登入並開始測驗</a></div>}
    </section>
  </div>;
}
