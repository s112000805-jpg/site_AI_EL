import Link from "next/link";
import { redirect } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { FontSizeControl } from "@/app/components/font-size-control";
import { getAdminMessages, type MessageStatus } from "@/db/guest-messages";
import { findLesson } from "@/lib/courses";
import { isAdminUser } from "@/lib/authz";

export const dynamic = "force-dynamic";

const filters: Array<{ status: MessageStatus; label: string }> = [
  { status: "pending", label: "待審核" },
  { status: "approved", label: "已公開" },
  { status: "rejected", label: "已拒絕" },
  { status: "hidden", label: "已隱藏" },
];

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const user = await requireChatGPTUser("/admin/messages");
  if (!isAdminUser(user)) redirect("/progress");
  const params = await searchParams;
  const status = filters.find((filter) => filter.status === params.status)?.status ?? "pending";
  const requestedPage = Number(params.page ?? 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage >= 1 && requestedPage <= 100 ? requestedPage : 1;
  let data: Awaited<ReturnType<typeof getAdminMessages>> | null = null;
  try { data = await getAdminMessages(status, page); } catch (error) { console.error("Admin guestbook unavailable", error); }

  return <main className="dashboard-shell">
    <header className="dashboard-header"><Link className="brand" href="/"><span>F</span><b>FLOW AI 學院</b></Link><nav><Link href="/admin">學習管理</Link><Link href="/messages">公開留言</Link><FontSizeControl /></nav></header>
    <section className="dashboard-title"><div><p className="eyebrow">GUESTBOOK MODERATION</p><h1>訪客留言審核</h1><p>訪客留言在核准前不會公開；管理員可回覆、拒絕或隱藏。</p></div></section>
    <section className="guestbook-admin-shell">
      <nav className="guestbook-filters" aria-label="留言狀態篩選">{filters.map((filter) => <Link key={filter.status} className={status === filter.status ? "is-active" : ""} href={`/admin/messages?status=${filter.status}`}>{filter.label}<span>{data?.counts[filter.status] ?? 0}</span></Link>)}</nav>
      {!data ? <p className="guestbook-empty" role="status">留言暫時無法載入，請稍後再試。</p> : data.messages.length ? <div className="guestbook-admin-list">{data.messages.map((item) => {
        const lesson = item.lesson_id ? findLesson(item.lesson_id) : null;
        return <article className="guestbook-admin-item" key={item.id}>
          <div className="guestbook-message-meta"><b>{item.nickname}</b><time dateTime={`${item.created_at}Z`}>{formatTaipeiDate(item.created_at)}</time></div>
          {lesson && <p className="guestbook-lesson">{lesson.code}｜{lesson.title}</p>}
          <p className="guestbook-admin-body">{item.body}</p>
          <form method="post" action="/api/admin/messages" className="guestbook-review-form">
            <input type="hidden" name="id" value={item.id} />
            {(status === "pending" || status === "approved") && <label>學堂回覆（選填）<textarea name="reply" defaultValue={item.admin_reply ?? ""} maxLength={500} rows={3} /></label>}
            <div className="guestbook-review-actions">
              {status === "pending" && <><button type="submit" name="action" value="approve">核准公開</button><button type="submit" name="action" value="reject" className="secondary">拒絕</button></>}
              {status === "approved" && <><button type="submit" name="action" value="reply">儲存回覆</button><button type="submit" name="action" value="hide" className="secondary">隱藏留言</button></>}
              {(status === "rejected" || status === "hidden") && <button type="submit" name="action" value="approve">重新公開</button>}
            </div>
          </form>
        </article>;
      })}</div> : <p className="guestbook-empty">這個分類目前沒有留言。</p>}
      {data && <nav className="guestbook-pagination" aria-label="審核分頁">{page > 1 && <Link href={`/admin/messages?status=${status}&page=${page - 1}`}>上一頁</Link>}{data.hasMore && <Link href={`/admin/messages?status=${status}&page=${page + 1}`}>下一頁</Link>}</nav>}
    </section>
  </main>;
}

function formatTaipeiDate(value: string) {
  return new Date(`${value}Z`).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
}
