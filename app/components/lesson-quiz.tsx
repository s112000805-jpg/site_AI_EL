"use client";

import { useMemo, useState } from "react";
import type { PublicQuizQuestion, QuizType } from "@/lib/quizzes";

type AttemptSummary = { score: number; maxScore: number; wrongCount: number } | null;
type QuizResult = { score: number; maxScore: number; wrongQuestionIds: string[]; details: Array<{ id: string; selectedIndex: number; correctIndex: number; correct: boolean; explanation: string }> };

export function LessonQuiz({ lessonId, lessonCode, questions, sourceNote, signedIn, signInHref, initialAttempts }: { lessonId: string; lessonCode: string; questions: Record<QuizType, PublicQuizQuestion[]>; sourceNote: string; signedIn: boolean; signInHref: string; initialAttempts: Record<QuizType, AttemptSummary> }) {
  const [activeType, setActiveType] = useState<QuizType>("pre");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const activeQuestions = questions[activeType];
  const completed = useMemo(() => activeQuestions.every((item) => Number.isInteger(answers[item.id])), [activeQuestions, answers]);

  const changeType = (type: QuizType) => { setActiveType(type); setAnswers({}); setResult(null); setState("idle"); };
  const submit = async () => {
    if (!signedIn || !completed) return;
    setState("saving");
    try {
      const response = await fetch("/api/quizzes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lessonId, quizType: activeType, answers }) });
      const payload = await response.json() as QuizResult & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "提交失敗");
      setResult(payload);
      setAttempts((current) => ({ ...current, [activeType]: { score: payload.score, maxScore: payload.maxScore, wrongCount: payload.wrongQuestionIds.length } }));
      setState("idle");
    } catch { setState("error"); }
  };

  return <details className="lesson-quiz">
    <summary><span><b>課前／課後複習題</b><small>{sourceNote}</small></span><strong>開始作答</strong></summary>
    <div className="quiz-body">
      <div className="quiz-tabs" role="tablist" aria-label={`${lessonCode} 題組`}>
        {(["pre", "post"] as const).map((type) => { const attempt = attempts[type]; return <button key={type} type="button" role="tab" aria-selected={activeType === type} className={activeType === type ? "is-active" : ""} onClick={() => changeType(type)}>{type === "pre" ? "課前診斷（3 題）" : "課後複習（5 題）"}{attempt && <small>最近 {attempt.score}/{attempt.maxScore} · 錯 {attempt.wrongCount} 題</small>}</button>; })}
      </div>
      <div className="quiz-questions">
        {activeQuestions.map((question, questionIndex) => { const detail = result?.details.find((item) => item.id === question.id); return <fieldset className={detail ? (detail.correct ? "is-correct" : "is-wrong") : ""} key={question.id}>
          <legend><span>{questionIndex + 1}</span>{question.prompt}</legend>
          {question.options.map((option, optionIndex) => <label key={option}><input type="radio" name={question.id} value={optionIndex} checked={answers[question.id] === optionIndex} disabled={Boolean(result)} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} /><span>{String.fromCharCode(65 + optionIndex)}. {option}</span></label>)}
          {detail && <div className="quiz-explanation"><b>{detail.correct ? "答對了" : `正確答案：${String.fromCharCode(65 + detail.correctIndex)}`}</b><p>{detail.explanation}</p><small>學習目標：{question.objective}</small></div>}
        </fieldset>; })}
      </div>
      {result ? <div className="quiz-result" aria-live="polite"><b>本次得分 {result.score} / {result.maxScore}</b><span>{result.wrongQuestionIds.length ? `需複習 ${result.wrongQuestionIds.length} 題，錯題已保存。` : "全部答對，成績已保存。"}</span><button type="button" onClick={() => { setAnswers({}); setResult(null); }}>再測一次</button></div>
        : signedIn ? <div className="quiz-submit"><button type="button" disabled={!completed || state === "saving"} onClick={submit}>{state === "saving" ? "正在批改…" : "提交並保存成績"}</button>{!completed && <span>請完成所有題目後提交</span>}{state === "error" && <span role="alert">暫時無法保存，請稍後再試。</span>}</div>
          : <div className="quiz-signin"><span>登入後即可提交、保存分數與錯題。</span><a href={signInHref} target="_top">登入並作答</a></div>}
    </div>
  </details>;
}
