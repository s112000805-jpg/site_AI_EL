import { BarChart3, BookOpen, ClipboardCheck, Home, MessageCircle } from "lucide-react";
/* eslint-disable @next/next/no-html-link-for-pages */

/** Vinext 的 Link 在正式站會攔截點擊並報錯；手機導覽改用完整載入。 */
export function MobileNavigation() {
  return (
    <nav className="mobile-navigation" aria-label="手機快速導覽">
      <a href="/">
        <Home aria-hidden="true" />
        <span>首頁</span>
      </a>
      <a href="/#course-map">
        <BookOpen aria-hidden="true" />
        <span>課程</span>
      </a>
      <a href="/quizzes">
        <ClipboardCheck aria-hidden="true" />
        <span>題庫</span>
      </a>
      <a href="/progress">
        <BarChart3 aria-hidden="true" />
        <span>成果</span>
      </a>
      <a href="/messages">
        <MessageCircle aria-hidden="true" />
        <span>留言</span>
      </a>
    </nav>
  );
}
