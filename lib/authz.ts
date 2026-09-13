import { env } from "cloudflare:workers";
import type { ChatGPTUser } from "@/app/chatgpt-auth";

export function isAdminUser(user: ChatGPTUser | null) {
  if (!user) return false;
  const configuredEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (configuredEmail && user.email.toLowerCase() === configuredEmail) return true;
  return process.env.NODE_ENV !== "production" && user.email === "seedy@sites.test";
}
