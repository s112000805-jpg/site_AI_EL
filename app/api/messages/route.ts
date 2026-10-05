import { createGuestMessage } from "@/db/guest-messages";
import { findLesson } from "@/lib/courses";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "請從本站留言頁送出" }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json({ error: "留言格式不正確" }, { status: 415 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 4000) {
    return Response.json({ error: "留言內容過長" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 4000) return Response.json({ error: "留言內容過長" }, { status: 413 });
    body = JSON.parse(raw) as Record<string, unknown>;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid body");
  } catch {
    return Response.json({ error: "留言格式不正確" }, { status: 400 });
  }

  // 隱藏欄位由一般訪客留空；機器人填入時不寫入資料庫。
  if (body.website) return Response.json({ message: "留言已送出，審核後公開" }, { status: 202 });

  const nickname = typeof body.nickname === "string" ? body.nickname.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const guestKey = typeof body.guestKey === "string" ? body.guestKey : "";
  const lessonId = body.lessonId === "" || body.lessonId == null ? null : body.lessonId;
  if (
    nickname.length < 2 || nickname.length > 30 ||
    message.length < 10 || message.length > 500 ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(guestKey) ||
    (lessonId !== null && (typeof lessonId !== "string" || !findLesson(lessonId))) ||
    body.consent !== true
  ) {
    return Response.json({ error: "請檢查暱稱、留言字數與同意公開選項" }, { status: 400 });
  }
  if (/https?:\/\/|www\.|<[^>]*>/i.test(`${nickname} ${message}`)) {
    return Response.json({ error: "留言請勿包含網址或 HTML 標籤" }, { status: 400 });
  }

  try {
    const created = await createGuestMessage({ guestKey, nickname, body: message, lessonId: lessonId as string | null });
    if (!created) return Response.json({ error: "留言太頻繁，請稍後再試；同一裝置每天最多三則" }, { status: 429 });
    return Response.json({ message: "留言已送出，審核後公開" }, { status: 202 });
  } catch (error) {
    console.error("Guest message submission failed", error);
    return Response.json({ error: "目前無法送出留言，請稍後再試" }, { status: 503 });
  }
}
