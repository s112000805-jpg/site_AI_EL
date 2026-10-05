import { BarChart3, BookOpen, ClipboardCheck, Home, MessageCircle } from "lucide-react";
import Link from "next/link";

/** 手機固定導覽列只保留最常使用的三個學習入口。 */
export function MobileNavigation() {
  return (
    <nav className="mobile-navigation" aria-label="手機快速導覽">
      <Link href="/">
        <Home aria-hidden="true" />
        <span>首頁</span>
      </Link>
      <Link href="/#course-map">
        <BookOpen aria-hidden="true" />
        <span>課程</span>
      </Link>
      <Link href="/quizzes">
        <ClipboardCheck aria-hidden="true" />
        <span>題庫</span>
      </Link>
      <Link href="/progress">
        <BarChart3 aria-hidden="true" />
        <span>成果</span>
      </Link>
      <Link href="/messages">
        <MessageCircle aria-hidden="true" />
        <span>留言</span>
      </Link>
    </nav>
  );
}
