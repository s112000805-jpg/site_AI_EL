import "server-only";
import { getD1 } from "./index";

export type MessageStatus = "pending" | "approved" | "rejected" | "hidden";

export type GuestMessage = {
  id: number;
  nickname: string;
  body: string;
  lesson_id: string | null;
  status: MessageStatus;
  admin_reply: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export async function getPublicMessages(page: number) {
  const result = await getD1().prepare(`
    SELECT id, nickname, body, lesson_id, status, admin_reply, created_at, reviewed_at
    FROM guest_messages WHERE status = 'approved'
    ORDER BY created_at DESC, id DESC LIMIT 11 OFFSET ?
  `).bind((page - 1) * 10).all<GuestMessage>();
  const rows = result.results ?? [];
  return { messages: rows.slice(0, 10), hasMore: rows.length > 10 };
}

export async function getAdminMessages(status: MessageStatus, page: number) {
  const [list, counts] = await Promise.all([
    getD1().prepare(`
      SELECT id, nickname, body, lesson_id, status, admin_reply, created_at, reviewed_at
      FROM guest_messages WHERE status = ?
      ORDER BY created_at DESC, id DESC LIMIT 21 OFFSET ?
    `).bind(status, (page - 1) * 20).all<GuestMessage>(),
    getD1().prepare(`SELECT status, COUNT(*) AS total FROM guest_messages GROUP BY status`)
      .all<{ status: MessageStatus; total: number }>(),
  ]);
  const rows = list.results ?? [];
  return {
    messages: rows.slice(0, 20),
    hasMore: rows.length > 20,
    counts: Object.fromEntries((counts.results ?? []).map((row) => [row.status, Number(row.total)])) as Partial<Record<MessageStatus, number>>,
  };
}

/** 同一裝置最多每天三則，且兩則至少間隔十分鐘；審核前一律不公開。 */
export async function createGuestMessage(input: {
  guestKey: string;
  nickname: string;
  body: string;
  lessonId: string | null;
}) {
  const result = await getD1().prepare(`
    INSERT INTO guest_messages (guest_key, nickname, body, lesson_id)
    SELECT ?, ?, ?, ?
    WHERE (SELECT COUNT(*) FROM guest_messages
           WHERE guest_key = ? AND created_at >= datetime('now', '-1 day')) < 3
      AND NOT EXISTS (SELECT 1 FROM guest_messages
                      WHERE guest_key = ? AND created_at >= datetime('now', '-10 minutes'))
  `).bind(
    input.guestKey, input.nickname, input.body, input.lessonId,
    input.guestKey, input.guestKey,
  ).run();
  return Number(result.meta.changes ?? 0) === 1;
}

export async function moderateGuestMessage(input: {
  id: number;
  action: "approve" | "reject" | "hide" | "reply";
  reply: string | null;
  reviewerId: string;
}) {
  if (input.action === "reply") {
    const result = await getD1().prepare(`
      UPDATE guest_messages SET admin_reply = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?
      WHERE id = ? AND status = 'approved'
    `).bind(input.reply, input.reviewerId, input.id).run();
    return Number(result.meta.changes ?? 0) === 1;
  }
  const nextStatus = input.action === "approve" ? "approved" : input.action === "hide" ? "hidden" : "rejected";
  const result = await getD1().prepare(`
    UPDATE guest_messages
    SET status = ?, admin_reply = COALESCE(?, admin_reply), reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?
    WHERE id = ? AND (
      (? = 'approve' AND status IN ('pending', 'rejected', 'hidden')) OR
      (? = 'hide' AND status = 'approved') OR
      (? = 'reject' AND status = 'pending')
    )
  `).bind(nextStatus, input.reply, input.reviewerId, input.id, input.action, input.action, input.action).run();
  return Number(result.meta.changes ?? 0) === 1;
}
