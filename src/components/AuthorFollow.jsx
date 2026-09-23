import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

export default function AuthorFollow({ slug, onChange }) {
  const token = localStorage.getItem("token");
  const endpoint = `${API_BASE_URL}/api/authors/${encodeURIComponent(slug)}/follow`;
  const [following, setFollowing] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(Boolean(token));
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !slug) return;
    let cancelled = false;
    fetch(endpoint, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (response.status === 401) throw new Error("Your session has expired. Please sign in again.");
          if (response.status === 404) throw new Error("Author follow service was not found. Refresh the page and try again.");
          throw new Error(result.message || `Unable to load follow status (${response.status}).`);
        }
        if (!cancelled) { setFollowing(Boolean(result.data.following)); setReady(true); }
      })
      .catch((error) => { if (!cancelled) setMessage(error.message); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [endpoint, slug, token]);

  async function toggle() {
    if (!ready) return;
    setBusy(true);
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ following: !following }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to update follow status.");
      setFollowing(Boolean(result.data.following));
      setMessage("");
      onChange?.(result.data);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  const classes = "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60";
  if (!token) return <Link to="/login" className={`${classes} border-blue-600 bg-blue-600 text-white hover:bg-slate-950`}><UserPlus size={17} aria-hidden="true" />Sign in to follow</Link>;
  return <div>
    <button type="button" onClick={toggle} disabled={busy || !ready} aria-pressed={following} className={`${classes} ${following ? "border-slate-300 bg-white text-slate-700 hover:border-red-200 hover:text-red-600" : "border-blue-600 bg-blue-600 text-white hover:bg-slate-950"}`}>
      <UserPlus size={17} aria-hidden="true" />{busy ? "Please wait..." : following ? "Following" : "Follow author"}
    </button>
    {message && <p role="status" className="mt-2 text-xs text-red-600">{message}</p>}
  </div>;
}