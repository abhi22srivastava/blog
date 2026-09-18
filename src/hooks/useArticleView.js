import { useEffect, useRef } from "react";
import { API_BASE_URL } from "../config/api";

export default function useArticleView(slug, articleId, setBlog) {
  const visit = useRef(null);

  useEffect(() => {
    if (!articleId) return;
    if (visit.current?.slug !== slug || visit.current?.articleId !== articleId) {
      visit.current = { slug, articleId, id: crypto.randomUUID(), milliseconds: 0 };
    }
    const current = visit.current;
    const token = localStorage.getItem("token");
    let disposed = false;
    let lastTick = performance.now();
    let active = document.visibilityState === "visible" && document.hasFocus();

    const tick = () => {
      const now = performance.now();
      if (active) current.milliseconds += Math.min(now - lastTick, 5000);
      lastTick = now;
    };
    const save = () => {
      tick();
      fetch(`${API_BASE_URL}/api/blog/${encodeURIComponent(slug)}/views`, {
        method: "POST",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          session_id: current.id,
          reading_seconds: Math.min(86400, Math.floor(current.milliseconds / 1000)),
        }),
      }).then(async (response) => {
        if (!response.ok) return;
        const result = await response.json();
        if (!disposed && result.data) {
          setBlog((blog) => blog?.id === articleId && blog?.slug === slug
            ? { ...blog, ...result.data }
            : blog);
        }
      }).catch(() => {
        // The next cumulative save retries without interrupting the article.
      });
    };
    const updateActivity = () => {
      tick();
      active = document.visibilityState === "visible" && document.hasFocus();
      if (!active) save();
    };
    const leave = () => { save(); active = false; };
    save();
    const ticker = window.setInterval(tick, 1000);
    const heartbeat = window.setInterval(() => { if (active) save(); }, 15000);
    document.addEventListener("visibilitychange", updateActivity);
    window.addEventListener("focus", updateActivity);
    window.addEventListener("blur", updateActivity);
    window.addEventListener("pagehide", leave);
    window.addEventListener("pageshow", updateActivity);
    return () => {
      disposed = true;
      save();
      window.clearInterval(ticker);
      window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", updateActivity);
      window.removeEventListener("focus", updateActivity);
      window.removeEventListener("blur", updateActivity);
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("pageshow", updateActivity);
    };
  }, [slug, articleId, setBlog]);
}
