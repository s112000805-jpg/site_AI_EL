import { BarChart3, BookOpen, Home } from "lucide-react";

/** 手機固定導覽列只保留最常使用的三個學習入口。 */
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
      <a href="/progress">
        <BarChart3 aria-hidden="true" />
        <span>學習成果</span>
      </a>
    </nav>
  );
}
