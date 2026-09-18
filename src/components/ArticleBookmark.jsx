import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

export default function ArticleBookmark({ slug }) {
  const token = localStorage.getItem("token");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(Boolean(token));
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const endpoint = `${API_BASE_URL}/api/blog/${encodeURIComponent(slug)}/bookmark`;

  useEffect(() => {
    if (!token) return;
    let ignore = false;
    fetch(endpoint, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load bookmark. Please retry.");
        const result = await response.json();
        if (!ignore) { setSaved(result.data.bookmarked); setReady(true); setMessage(""); }
      })
      .catch((error) => { if (!ignore) setMessage(error.message); })
      .finally(() => { if (!ignore) setBusy(false); });
    return () => { ignore = true; };
  }, [endpoint, token, attempt]);

  async function toggle() {
    setBusy(true);
    if (!ready) { setAttempt((value) => value + 1); return; }
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarked: !saved }),
      });
      if (!response.ok) throw new Error("Unable to save bookmark. Please try again.");
      const result = await response.json();
      setSaved(result.data.bookmarked);
      setMessage(result.data.bookmarked ? "Article bookmarked." : "Bookmark removed.");
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  const buttonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60";
  return (
    <div className="flex flex-wrap items-center gap-3">
      {token ? (
        <button type="button" onClick={toggle} disabled={busy} aria-pressed={saved} className={buttonClass}>
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
          {busy ? "Please wait…" : !ready ? "Retry bookmark" : saved ? "Bookmarked" : "Bookmark article"}
        </button>
      ) : (
        <Link to="/login" className={buttonClass}><Bookmark size={18} aria-hidden="true" />Sign in to bookmark</Link>
      )}
      <p role="status" className={message ? "text-xs text-slate-600" : "sr-only"}>{message}</p>
    </div>
  );
}
