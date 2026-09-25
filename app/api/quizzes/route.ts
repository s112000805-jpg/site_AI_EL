import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getLatestQuizAttempt, parseWrongQuestionIds, recordQuizAttempt } from "@/db/progress";
import { getQuizQuestions, type QuizType } from "@/lib/quizzes";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "請先登入" }, { status: 401 });
  try {
    const body = await request.json() as Record<string, unknown>;
    if (typeof body.lessonId !== "string") throw new Error("缺少課程編號");
    if (body.quizType !== "pre" && body.quizType !== "post") throw new Error("題組類型不正確");
    if (!body.answers || typeof body.answers !== "object" || Array.isArray(body.answers)) throw new Error("作答資料不完整");
    const quizType = body.quizType as QuizType;
    const allQuestions = getQuizQuestions(body.lessonId, quizType);
    const isWrongOnly = body.questionIds !== undefined;
    const requestedIds = Array.isArray(body.questionIds) ? body.questionIds.filter((item): item is string => typeof item === "string") : allQuestions.map((item) => item.id);
    if (!requestedIds.length || requestedIds.some((id) => !allQuestions.some((question) => question.id === id))) throw new Error("錯題範圍不正確");
    if (isWrongOnly && requestedIds.length !== allQuestions.length) {
      const previous = await getLatestQuizAttempt(user.userId, body.lessonId, quizType);
      const wrongIds = parseWrongQuestionIds(previous);
      if (requestedIds.length !== wrongIds.length || !requestedIds.every((id) => wrongIds.includes(id))) throw new Error("錯題範圍已變更，請重新整理頁面");
    }
    const questions = allQuestions.filter((question) => requestedIds.includes(question.id));
    const submitted = body.answers as Record<string, unknown>;
    if (questions.some((question) => !Number.isInteger(submitted[question.id]))) throw new Error("請完成所有題目後再提交");
    const details = questions.map((question) => {
      const selectedIndex = Number(submitted[question.id]);
      if (selectedIndex < 0 || selectedIndex >= question.options.length) throw new Error("選項資料不正確");
      return { id: question.id, selectedIndex, correctIndex: question.correctIndex, correct: selectedIndex === question.correctIndex, explanation: question.explanation };
    });
    const score = details.filter((detail) => detail.correct).length;
    const wrongQuestionIds = details.filter((detail) => !detail.correct).map((detail) => detail.id);
    await recordQuizAttempt(user, body.lessonId, quizType, score, questions.length, wrongQuestionIds, submitted);
    return Response.json({ score, maxScore: questions.length, wrongQuestionIds, details });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "批改失敗" }, { status: 400 });
  }
}
