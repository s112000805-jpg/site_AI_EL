import Link from "next/link";
import { FontSizeControl } from "@/app/components/font-size-control";
import { GuestbookForm } from "@/app/components/guestbook-form";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { getPublicMessages } from "@/db/guest-messages";
import { findLesson, lessons } from "@/lib/courses";

export const dynamic = "force-dynamic";

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const requestedPage = Number((await searchParams).page ?? 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage >= 1 && requestedPage <= 100 ? requestedPage : 1;
  let messageData: Awaited<ReturnType<typeof getPublicMessages>> | null = null;
  try { messageData = await getPublicMessages(page); } catch (error) { console.error("Public guestbook unavailable", error); }

  return <>
    <header className="topbar"><Link className="brand" href="/"><span>F</span><b>FLOW AI 學院</b></Link><nav aria-label="主要導覽"><Link href="/">返回課程</Link><FontSizeControl /><ThemeToggle /></nav></header>
    <main className="guestbook-page">
      <div className="content-shell">
        <div className="guestbook-heading"><p className="eyebrow">LEARNING COMMUNITY</p><h1>訪客留言</h1><p>分享學習心得、提出課程問題，或告訴我們下一步想學什麼。</p></div>
        <div className="guestbook-layout">
          <section className="guestbook-card" aria-labelledby="leave-message"><h2 id="leave-message">留下你的想法</h2><p>免登入即可送出。請不要留下電話、地址、密碼等私人資料。</p><GuestbookForm lessons={lessons.map((lesson) => ({ id: lesson.id, label: `${lesson.code}｜${lesson.title}` }))} /></section>
          <section className="guestbook-list" aria-labelledby="approved-messages"><div className="guestbook-list-title"><h2 id="approved-messages">公開留言</h2><span>僅顯示已審核內容</span></div>
            {!messageData ? <p className="guestbook-empty" role="status">留言暫時無法載入，請稍後再試。</p> : messageData.messages.length ? messageData.messages.map((item) => {
              const lesson = item.lesson_id ? findLesson(item.lesson_id) : null;
              return <article className="guestbook-message" key={item.id}><div className="guestbook-message-meta"><b>{item.nickname}</b><time dateTime={`${item.created_at}Z`}>{formatTaipeiDate(item.created_at)}</time></div>{lesson && <Link className="guestbook-lesson" href={`/#lesson-${lesson.id}`}>{lesson.code}｜{lesson.title}</Link>}<p>{item.body}</p>{item.admin_reply && <div className="guestbook-reply"><b>學堂回覆</b><p>{item.admin_reply}</p></div>}</article>;
            }) : <p className="guestbook-empty">目前還沒有公開留言。歡迎留下第一則！</p>}
            {messageData && <nav className="guestbook-pagination" aria-label="留言分頁">{page > 1 && <Link href={`/messages?page=${page - 1}`}>上一頁</Link>}{messageData.hasMore && <Link href={`/messages?page=${page + 1}`}>下一頁</Link>}</nav>}
          </section>
        </div>
      </div>
    </main>
  </>;
}

function formatTaipeiDate(value: string) {
  return new Date(`${value}Z`).toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei", year: "numeric", month: "short", day: "numeric" });
}
