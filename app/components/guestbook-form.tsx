"use client";

import { useState, type FormEvent } from "react";

type LessonOption = { id: string; label: string };

export function GuestbookForm({ lessons }: { lessons: LessonOption[] }) {
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      let guestKey = crypto.randomUUID();
      try {
        const saved = localStorage.getItem("flow-ai-message-key");
        if (saved) guestKey = saved;
        else localStorage.setItem("flow-ai-message-key", guestKey);
      } catch { /* 儲存空間不可用時仍可留言。 */ }
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ nickname, message, lessonId, consent, website, guestKey }),
      });
      const result = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "送出失敗，請稍後再試");
      setMessage("");
      setLessonId("");
      setConsent(false);
      setFeedback({ text: result.message ?? "留言已送出，審核後公開", error: false });
    } catch (error) {
      setFeedback({ text: error instanceof Error ? error.message : "送出失敗，請稍後再試", error: true });
    } finally {
      setBusy(false);
    }
  }

  return <form className="guestbook-form" onSubmit={submit}>
    <label>暱稱<span>公開顯示，2–30 字</span><input value={nickname} onChange={(event) => setNickname(event.target.value)} minLength={2} maxLength={30} required autoComplete="nickname" /></label>
    <label>相關課程<span>選填</span><select value={lessonId} onChange={(event) => setLessonId(event.target.value)}><option value="">一般留言</option>{lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.label}</option>)}</select></label>
    <label>留言內容<span>10–500 字；請勿填入個資或網址</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} minLength={10} maxLength={500} rows={6} required /></label>
    <div className="guestbook-honeypot" aria-hidden="true"><label>網站<input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" /></label></div>
    <label className="guestbook-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required /><span>我同意暱稱與留言在審核通過後公開顯示。</span></label>
    <button type="submit" disabled={busy}>{busy ? "送出中…" : "送出留言"}</button>
    <p className={`guestbook-feedback${feedback?.error ? " is-error" : ""}`} role="status" aria-live="polite">{feedback?.text ?? "留言不會立即公開；管理員審核後才會顯示。"}</p>
  </form>;
}
