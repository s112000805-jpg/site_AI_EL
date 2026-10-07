import { getChatGPTUser } from "@/app/chatgpt-auth";
import { moderateGuestMessage } from "@/db/guest-messages";
import { isAdminUser } from "@/lib/authz";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "請先登入" }, { status: 401 });
  if (!isAdminUser(user)) return Response.json({ error: "沒有管理者權限" }, { status: 403 });
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "請從管理頁操作" }, { status: 403 });
  }

  let form: FormData;
  try { form = await request.formData(); } catch { return Response.json({ error: "操作格式不正確" }, { status: 400 }); }
  const id = Number(form.get("id"));
  const action = form.get("action");
  const reply = String(form.get("reply") ?? "").trim();
  if (!Number.isSafeInteger(id) || id < 1 || !["approve", "reject", "hide", "reply"].includes(String(action)) || reply.length > 500) {
    return Response.json({ error: "操作內容不正確" }, { status: 400 });
  }

  try {
    const changed = await moderateGuestMessage({
      id,
      action: action as "approve" | "reject" | "hide" | "reply",
      reply: reply || null,
      reviewerId: user.userId,
    });
    if (!changed) return Response.json({ error: "留言狀態已變更，請重新整理" }, { status: 409 });
    const status = action === "approve" ? "approved" : action === "reject" ? "rejected" : action === "hide" ? "hidden" : "approved";
    return Response.redirect(new URL(`/admin/messages?status=${status}`, request.url), 303);
  } catch (error) {
    console.error("Guest message moderation failed", error);
    return Response.json({ error: "暫時無法處理留言" }, { status: 503 });
  }
}
