import { CourseVideo } from "@/app/components/course-video";
import { LessonQuiz } from "@/app/components/lesson-quiz";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { courseStages, lessons } from "@/lib/courses";
import { buildLessonQuiz, toPublicQuestions } from "@/lib/quizzes";
import { getUserQuizAttempts, latestFullQuizAttemptMap, latestQuizAttemptMap, parseWrongQuestionIds } from "@/db/progress";
import { isAdminUser } from "@/lib/authz";
import Image from "next/image";
import { CourseCatalog } from "@/app/components/course-catalog";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { FontSizeControl } from "@/app/components/font-size-control";
import {
  BrainCircuit,
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
  MessageCircle,
  Wrench,
  Video,
} from "lucide-react";

const learningMethods = [
  { number: "01", title: "理解", description: "用生活化語言理解核心概念。", icon: BrainCircuit },
  { number: "02", title: "練習", description: "跟著影片完成可重複的小任務。", icon: Wrench },
  { number: "03", title: "產出", description: "交付一份能在工作中使用的成果。", icon: BriefcaseBusiness },
  { number: "04", title: "追蹤", description: "登入後自動記錄進度與觀看時間。", icon: ChartNoAxesColumnIncreasing },
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();
  const quizAttempts = user ? await getUserQuizAttempts(user) : [];
  const latestAttempts = latestQuizAttemptMap(quizAttempts);
  const latestFullAttempts = latestFullQuizAttemptMap(quizAttempts);
  const totalMinutes = Math.round(lessons.reduce((sum, lesson) => sum + lesson.durationSeconds, 0) / 60);
  return <>
    <header className="topbar">
      <a className="brand" href="#top"><span>F</span><b>FLOW AI 學院</b></a>
      <nav aria-label="主要導覽">
        <a href="#course-map">課程地圖</a><a href="#method">學習方法</a><a href="/quizzes">測驗題庫</a><a href="/progress">學習成果</a>
        {isAdminUser(user) && <a href="/admin">管理後台</a>}
        <FontSizeControl />
        <ThemeToggle />
        {user ? <a className="nav-button" href={chatGPTSignOutPath("/")} target="_top">登出</a> : <a className="nav-button" href={chatGPTSignInPath("/")} target="_top">登入</a>}
      </nav>
    </header>
    <main id="top">
      <section className="course-hero"><div className="hero-inner">
        <div className="hero-copy"><p className="eyebrow">成人 AI 基礎學習路徑</p><h1>從會問，到能管理<br /><em>AI 工作系統</em></h1><p className="hero-lead">四階段循序學習，從生成式 AI 概念、日常應用、工作流，到 Agent 與治理。每一階段都用真實任務驗證成果。</p>
          <div className="hero-actions"><a className="primary-action" href="#course-map">查看課程地圖</a><a className="secondary-action" href="/quizzes">進入測驗題庫</a><a className="secondary-action" href="/progress">查看學習成果</a></div>
          <div className="hero-facts"><span><b>4</b> 個階段</span><span><b>{lessons.length}</b> 部影片</span><span><b>{totalMinutes}</b> 分鐘影片</span></div>
        </div>
        <div className="hero-visual"><Image src="/ai-course-hero.png" width={1024} height={1024} sizes="(max-width: 850px) 100vw, 50vw" priority alt="成人使用筆記型電腦學習 AI 的課程情境" /><div className="hero-note"><b>你的學習紀錄</b><span>登入後自動累積實際觀看時間</span></div></div>
      </div></section>

      <section id="method" className="method-section content-shell">
        <div className="method-heading">
          <div><p className="eyebrow">LEARNING METHOD</p><h2>每個階段，都有看得見的成果</h2></div>
          <p>不是只看完影片，而是把理解一步步轉化成能使用、能追蹤的工作成果。</p>
        </div>
        <div className="method-grid">
          {learningMethods.map(({ number, title, description, icon: Icon }) => (
            <article className={`method-card method-card-${number}`} key={number}>
              <div className="method-card-top">
                <span className="method-icon"><Icon aria-hidden="true" /></span>
                <b>{number}</b>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className="method-step" aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <div className="content-shell"><CourseCatalog /></div>

      <section id="program" className="program-section"><div className="content-shell"><p className="eyebrow">COURSE ROADMAP</p><h2>四階段 AI 學習地圖</h2><p className="section-lead">建議依序完成。影片觀看達 80% 即標記為已完成。</p>
        <div className="stage-list">{courseStages.map((stage, index) => <details className={`course-stage stage-tone-${index + 1}`} key={stage.id} open={index === 0}>
          <summary><span className="stage-number">{stage.number}</span><span><small>{stage.className}</small><b>{stage.title}</b><em>{stage.subtitle}</em></span><strong>{stage.hours}</strong></summary>
          <div className="stage-body"><div className="stage-intro"><p>{stage.objective}</p><div className="topic-grid">{stage.topics.map((topic) => <article key={topic.title}><b>{topic.title}</b><span>{topic.detail}</span></article>)}</div><p className="project"><b>階段成果</b>{stage.project}</p></div>
            <div className="lesson-list">{stage.lessons.length ? stage.lessons.map((lesson) => {
              const quiz = lesson.quizStatus === "pending" ? null : buildLessonQuiz(lesson);
              const attemptSummary = (type: "pre" | "post") => {
                const fullAttempt = latestFullAttempts.get(`${lesson.id}:${type}`);
                const latestAttempt = latestAttempts.get(`${lesson.id}:${type}`);
                return fullAttempt ? { score: Number(fullAttempt.score), maxScore: Number(fullAttempt.max_score), wrongQuestionIds: parseWrongQuestionIds(latestAttempt) } : null;
              };
              return <article className="lesson-card" id={`lesson-${lesson.id}`} key={lesson.id}><div className="lesson-heading"><span>{lesson.code} · {lesson.kind} · {lesson.durationLabel}</span><h3>{lesson.title}</h3><p>{lesson.description}</p>{lesson.quizStatus === "pending" && <b className="quiz-pending-badge">測驗準備中</b>}</div><CourseVideo lessonId={lesson.id} title={lesson.title} startAt={lesson.startAt} signedIn={Boolean(user)} />{quiz ? <LessonQuiz lessonId={lesson.id} lessonCode={lesson.code} questions={{ pre: toPublicQuestions(quiz.pre), post: toPublicQuestions(quiz.post) }} sourceNote={quiz.sourceNote} signedIn={Boolean(user)} signInHref={chatGPTSignInPath(`/#lesson-${lesson.id}`)} initialAttempts={{ pre: attemptSummary("pre"), post: attemptSummary("post") }} /> : <section className="lesson-quiz-pending" aria-label="測驗準備中"><b>測驗準備中</b><p>{lesson.quizPendingReason ?? "正在等待影片字幕，完成內容核對後就會開放作答。"}</p></section>}</article>;
            }) : <div className="coming-soon"><b>實作課程準備中</b><p>本階段將加入提示設計、辦公應用與多模態練習。</p></div>}</div>
          </div>
        </details>)}</div>
      </div></section>
      <section className="cta-section"><div><p className="eyebrow">YOUR NEXT STEP</p><h2>從第一部影片開始，建立自己的 AI 能力地圖。</h2></div><a className="primary-action light" href={user ? "/progress" : chatGPTSignInPath("/progress")} target="_top">{user ? "查看我的成果" : "登入並開始記錄"}</a></section>
    </main>
    <footer className="site-footer"><div className="footer-brand"><b>FLOW AI 學院</b><span>AI 樂高學堂｜讓每一步學習，都累積成可見的能力。</span><small>本站使用匿名訪客統計改善課程體驗，不保存完整 IP、姓名、Email 或查詢內容；紀錄最多保留 90 天。</small></div><div className="footer-contact"><a href="https://www.youtube.com/@AI%E6%A8%82%E9%AB%98%E5%AD%B8%E5%A0%82-p5j" target="_blank" rel="noreferrer"><Video aria-hidden="true" /><span><b>YouTube 頻道</b><small>AI 樂高學堂</small></span></a><div><MessageCircle aria-hidden="true" /><span><b>LINE 官方帳號</b><small>@AI樂高學堂</small></span></div></div></footer>
  </>;
}
