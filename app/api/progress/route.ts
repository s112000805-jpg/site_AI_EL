import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getUserProgress, recordProgress } from "@/db/progress";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "請先登入" }, { status: 401 });
  return Response.json({ progress: await getUserProgress(user) });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "請先登入" }, { status: 401 });
  try {
    const body = await request.json() as Record<string, unknown>;
    if (typeof body.lessonId !== "string") throw new Error("缺少課程編號");
    const result = await recordProgress(
      user,
      body.lessonId,
      Number(body.positionSeconds ?? 0),
      Number(body.watchedDeltaSeconds ?? 0),
    );
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "記錄失敗" }, { status: 400 });
  }
}
