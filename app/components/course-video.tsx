"use client";

import { useEffect, useId, useRef, useState } from "react";

type Player = { getCurrentTime(): number; destroy(): void };
declare global { interface Window { YT?: { Player: new (id: string, options: Record<string, unknown>) => Player; PlayerState: { PLAYING: number; PAUSED: number; ENDED: number } }; onYouTubeIframeAPIReady?: () => void } }

let apiPromise: Promise<void> | null = null;
function loadYouTubeApi() {
  if (typeof window === "undefined" || window.YT?.Player) return Promise.resolve();
  if (!apiPromise) apiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { previous?.(); resolve(); };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script"); script.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(script);
    }
  });
  return apiPromise;
}

export function CourseVideo({ lessonId, title, startAt = 0, signedIn }: { lessonId: string; title: string; startAt?: number; signedIn: boolean }) {
  const elementId = `yt-${useId().replace(/:/g, "")}`;
  const playerRef = useRef<Player | null>(null);
  const secondsRef = useRef(0);
  const playingRef = useRef(false);
  const lastTickRef = useRef(0);
  const [state, setState] = useState(signedIn ? "觀看進度會自動儲存" : "登入後自動記錄學習進度");

  useEffect(() => {
    let alive = true;
    const flush = async () => {
      if (!signedIn || secondsRef.current <= 0 || !playerRef.current) return;
      const delta = Math.min(30, Math.round(secondsRef.current)); secondsRef.current = 0;
      try {
        await fetch("/api/progress", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lessonId, positionSeconds: playerRef.current.getCurrentTime(), watchedDeltaSeconds: delta }), keepalive: true });
        if (alive) setState("進度已儲存");
      } catch { if (alive) setState("暫時無法儲存，稍後會再試"); }
    };
    const timer = window.setInterval(() => {
      if (!playingRef.current) return;
      const now = Date.now(); secondsRef.current += Math.min(2, (now - lastTickRef.current) / 1000); lastTickRef.current = now;
      if (secondsRef.current >= 12) void flush();
    }, 1000);
    void loadYouTubeApi().then(() => {
      if (!alive || !window.YT) return;
      playerRef.current = new window.YT.Player(elementId, { videoId: lessonId, playerVars: { rel: 0, modestbranding: 1, start: startAt, playsinline: 1 }, events: { onStateChange: (event: { data: number }) => {
        if (!window.YT) return;
        if (event.data === window.YT.PlayerState.PLAYING) { playingRef.current = true; lastTickRef.current = Date.now(); setState(signedIn ? "正在記錄實際觀看時間" : "登入後自動記錄學習進度"); }
        else { playingRef.current = false; if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) void flush(); }
      } } });
    });
    return () => { alive = false; window.clearInterval(timer); void flush(); playerRef.current?.destroy(); };
  }, [elementId, lessonId, signedIn, startAt]);

  return <div className="video-wrap"><div className="video-frame"><div id={elementId} title={title} /></div><p className="video-state"><span aria-hidden="true">●</span>{state}</p></div>;
}
