import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { QuizBank } from "@/app/components/quiz-bank";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { getUserQuizAttempts, latestFullQuizAttemptMap, latestQuizAttemptMap, parseWrongQuestionIds } from "@/db/progress";
import { courseStages } from "@/lib/courses";
import { buildLessonQuiz, toPublicQuestions } from "@/lib/quizzes";

export const dynamic = "force-dynamic";

export default async function QuizzesPage() {
  const user = await getChatGPTUser();
  const attempts = user ? await getUserQuizAttempts(user) : [];
  const fullAttempts = latestFullQuizAttemptMap(attempts);
  const latestAttempts = latestQuizAttemptMap(attempts);
  const lessonChoices = courseStages.flatMap((stage) => stage.lessons.map((lesson) => {
    const quiz = buildLessonQuiz(lesson);
    const attempt = fullAttempts.get(`${lesson.id}:post`);
    return {
      id: lesson.id,
      code: lesson.code,
      title: lesson.title,
      stageId: stage.id,
      stageLabel: `${stage.className}｜${stage.title}`,
      sourceNote: quiz.sourceNote,
      questions: toPublicQuestions(quiz.post),
      attempt: attempt ? { score: Number(attempt.score), maxScore: Number(attempt.max_score), wrongQuestionIds: parseWrongQuestionIds(latestAttempts.get(`${lesson.id}:post`)) } : null,
    };
  }));

  return <main className="quiz-bank-page">
    <header className="quiz-bank-header"><Link href="/"><ArrowLeft aria-hidden="true" />返回課程首頁</Link><div><span className="quiz-bank-mark"><ClipboardCheck aria-hidden="true" /></span><div><p className="eyebrow">QUIZ LIBRARY</p><h1>課程測驗題庫</h1><p>選擇階段與課程，完成單選題並保存成績與錯題。</p></div></div><Link className="secondary-action" href="/progress">查看學習成果</Link></header>
    <QuizBank lessons={lessonChoices} signedIn={Boolean(user)} signInHref={chatGPTSignInPath("/quizzes")} />
  </main>;
}
