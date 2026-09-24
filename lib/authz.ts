import { env } from "cloudflare:workers";
import type { ChatGPTUser } from "@/app/chatgpt-auth";

function parseAdminEmails(...configuredValues: Array<string | undefined>) {
  return new Set(
    configuredValues
      .flatMap((value) => value?.split(/[,;\n]/) ?? [])
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminUser(user: ChatGPTUser | null) {
  if (!user) return false;

  // ADMIN_EMAILS 是主要名單；ADMIN_EMAIL 保留為舊版設定的相容入口。
  const adminEmails = parseAdminEmails(env.ADMIN_EMAILS, env.ADMIN_EMAIL);
  const normalizedUserEmail = user.email.trim().toLowerCase();

  if (adminEmails.has(normalizedUserEmail)) return true;
  return process.env.NODE_ENV !== "production" && normalizedUserEmail === "seedy@sites.test";
}
