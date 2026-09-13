import { CourseVideo } from "@/app/components/course-video";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { courseStages, lessons } from "@/lib/courses";
import { isAdminUser } from "@/lib/authz";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();
  const totalMinutes = Math.round(lessons.reduce((sum, lesson) => sum + lesson.durationSeconds, 0) / 60);
  return <>
    <header className="topbar">
      <a className="brand" href="#top"><span>F</span><b>FLOW AI 學院</b></a>
      <nav aria-label="主要導覽">
        <a href="#program">課程地圖</a><a href="#method">學習方法</a><a href="/progress">學習成果</a>
        {isAdminUser(user) && <a href="/admin">管理後台</a>}
        {user ? <a className="nav-button" href={chatGPTSignOutPath("/")} target="_top">登出</a> : <a className="nav-button" href={chatGPTSignInPath("/")} target="_top">登入</a>}
      </nav>
    </header>
    <main id="top">
      <section className="course-hero"><div className="hero-inner">
        <div className="hero-copy"><p className="eyebrow">成人 AI 基礎學習路徑</p><h1>從會問，到能管理<br /><em>AI 工作系統</em></h1><p className="hero-lead">四階段循序學習，從生成式 AI 概念、日常應用、工作流，到 Agent 與治理。每一階段都用真實任務驗證成果。</p>
          <div className="hero-actions"><a className="primary-action" href="#program">開始學習</a><a className="secondary-action" href="/progress">查看學習成果</a></div>
          <div className="hero-facts"><span><b>4</b> 個階段</span><span><b>{lessons.length}</b> 部影片</span><span><b>{totalMinutes}</b> 分鐘影片</span></div>
        </div>
        <div className="hero-visual"><Image src="/ai-course-hero.png" width={1024} height={1024} priority alt="成人使用筆記型電腦學習 AI 的課程情境" /><div className="hero-note"><b>你的學習紀錄</b><span>登入後自動累積實際觀看時間</span></div></div>
      </div></section>

      <section id="method" className="method-section content-shell"><p className="eyebrow">LEARNING METHOD</p><h2>每個階段，都有看得見的成果</h2>
        <div className="method-grid">{[["01","理解","用生活化語言理解核心概念。"],["02","練習","跟著影片完成可重複的小任務。"],["03","產出","交付一份能在工作中使用的成果。"],["04","追蹤","登入後自動記錄進度與觀看時間。"]].map(([n,t,d]) => <article key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>

      <section id="program" className="program-section"><div className="content-shell"><p className="eyebrow">COURSE ROADMAP</p><h2>四階段 AI 學習地圖</h2><p className="section-lead">建議依序完成。影片觀看達 80% 即標記為已完成。</p>
        <div className="stage-list">{courseStages.map((stage, index) => <details className="course-stage" key={stage.id} open={index === 0}>
          <summary><span className="stage-number">{stage.number}</span><span><small>{stage.className}</small><b>{stage.title}</b><em>{stage.subtitle}</em></span><strong>{stage.hours}</strong></summary>
          <div className="stage-body"><div className="stage-intro"><p>{stage.objective}</p><div className="topic-grid">{stage.topics.map((topic) => <article key={topic.title}><b>{topic.title}</b><span>{topic.detail}</span></article>)}</div><p className="project"><b>階段成果</b>{stage.project}</p></div>
            <div className="lesson-list">{stage.lessons.length ? stage.lessons.map((lesson) => <article className="lesson-card" id={`lesson-${lesson.id}`} key={lesson.id}><div className="lesson-heading"><span>{lesson.code} · {lesson.kind} · {lesson.durationLabel}</span><h3>{lesson.title}</h3><p>{lesson.description}</p></div><CourseVideo lessonId={lesson.id} title={lesson.title} startAt={lesson.startAt} signedIn={Boolean(user)} /></article>) : <div className="coming-soon"><b>實作課程準備中</b><p>本階段將加入提示設計、辦公應用與多模態練習。</p></div>}</div>
          </div>
        </details>)}</div>
      </div></section>
      <section className="cta-section"><div><p className="eyebrow">YOUR NEXT STEP</p><h2>從第一部影片開始，建立自己的 AI 能力地圖。</h2></div><a className="primary-action light" href={user ? "/progress" : chatGPTSignInPath("/progress")} target="_top">{user ? "查看我的成果" : "登入並開始記錄"}</a></section>
    </main>
    <footer><b>FLOW AI 學院</b><span>讓每一步學習，都累積成可見的能力。</span></footer>
  </>;
}
