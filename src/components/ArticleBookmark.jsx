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
    if (!token) return undefined;
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
    if (!ready) { setAttempt((value) => value + 1); return; }
    setBusy(true);
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

  const buttonClass = "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-wait disabled:opacity-60";
  return (
    <div className="flex items-center">
      {token ? (
        <button type="button" onClick={toggle} disabled={busy} aria-pressed={saved} aria-label={busy ? "Updating bookmark" : !ready ? "Retry bookmark" : saved ? "Remove bookmark" : "Bookmark article"} title={saved ? "Bookmarked" : "Bookmark article"} className={`${buttonClass} ${saved ? "border-amber-300 bg-amber-50 text-amber-600" : ""}`}>
          <Bookmark size={18} strokeWidth={2} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
        </button>
      ) : (
        <Link to="/login" aria-label="Sign in to bookmark article" title="Sign in to bookmark" className={buttonClass}><Bookmark size={18} strokeWidth={2} aria-hidden="true" /></Link>
      )}
      <p role="status" className="sr-only">{message}</p>
    </div>
  );
}
