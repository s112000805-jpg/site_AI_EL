import { getChatGPTUser } from "@/app/chatgpt-auth";
import { recordVisit, type RecentVisit } from "@/db/visitors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const visitorId = normalizeAnonymousId(body.visitorId);
    const sessionId = normalizeAnonymousId(body.sessionId);
    const path = normalizePath(body.path);
    if (!visitorId || !sessionId || !path) {
      return Response.json({ error: "訪客紀錄格式不正確" }, { status: 400 });
    }

    const user = await getChatGPTUser();
    await recordVisit({
      visitorId,
      sessionId,
      path,
      referrerHost: normalizeReferrerHost(body.referrer),
      deviceType: detectDeviceType(request.headers.get("user-agent") ?? ""),
      isAuthenticated: Boolean(user),
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Visitor tracking failed", error);
    return Response.json({ error: "暫時無法記錄造訪" }, { status: 500 });
  }
}

function normalizeAnonymousId(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return /^[a-zA-Z0-9-]{8,80}$/.test(normalized) ? normalized : null;
}

function normalizePath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return null;
  try {
    const url = new URL(value, "https://site.local");
    if (url.origin !== "https://site.local") return null;
    return url.pathname.slice(0, 300);
  } catch {
    return null;
  }
}

function normalizeReferrerHost(value: unknown) {
  if (typeof value !== "string" || !value) return null;
  try {
    return new URL(value).hostname.toLowerCase().slice(0, 255) || null;
  } catch {
    return null;
  }
}

function detectDeviceType(userAgent: string): RecentVisit["device_type"] {
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|ipod|android/i.test(userAgent)) return "mobile";
  return "desktop";
}
