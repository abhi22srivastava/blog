import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { API_BASE_URL } from "../config/api";

function topicKeys(article) {
  const ids = String(article.topicid ?? "").split(",").map((id) => id.trim()).filter(Boolean).map((id) => `id:${id}`);
  const source = article.topics || article.article_topics || article.topic_list || article.topic || [];
  for (const item of Array.isArray(source) ? source : [source]) {
    if (!item) continue;
    if (typeof item === "string") { ids.push(`name:${item.toLowerCase()}`); continue; }
    const topic = item.topic || item.topic_detail || item;
    const id = topic.id ?? item.topic_id;
    const name = topic.name || topic.title || item.topic_name;
    const slug = topic.slug || item.topic_slug;
    if (id != null) ids.push(`id:${id}`);
    if (name) ids.push(`name:${name.toLowerCase()}`);
    if (slug) ids.push(`slug:${slug}`);
  }
  return new Set(ids);
}

export default function RelatedArticles({ article }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/blog`, { signal: controller.signal, headers: { Accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load related articles");
        const result = await response.json();
        if (!controller.signal.aborted) setArticles(Array.isArray(result.data) ? result.data : []);
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const currentTopics = topicKeys(article);
  const related = articles
    .filter((item) => item.slug && item.slug !== article.slug && String(item.id) !== String(article.id))
    .filter((item) => ["1", "published", "active"].includes(String(item.status).toLowerCase()))
    .map((item) => ({ ...item, matches: [...topicKeys(item)].filter((key) => currentTopics.has(key)).length }))
    .filter((item) => item.matches > 0)
    .sort((a, b) => b.matches - a.matches)
    .slice(0, 3);

  return (
    <section aria-labelledby="related-articles-heading" className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-lg shadow-slate-200/40">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><BookOpen size={20} aria-hidden="true" /></span>
        <h2 id="related-articles-heading" className="font-black text-slate-900">Related articles</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">More stories on similar topics.</p>
      {loading ? <p role="status" className="mt-5 text-sm text-slate-500">Loading related articles…</p> : error ? (
        <p className="mt-5 text-sm text-slate-500">Related articles are unavailable right now.</p>
      ) : related.length ? (
        <ul className="mt-5 space-y-3">
          {related.map((item) => {
            const thumbnail = item.featured_image || item.banner_image || item.image || item.thumbnail;
            return (
              <li key={item.id || item.slug}>
                <Link to={`/blog/${encodeURIComponent(item.slug)}`} className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 transition hover:border-indigo-200 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  {thumbnail ? <img src={thumbnail} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-xl object-cover" /> : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-400"><BookOpen size={22} aria-hidden="true" /></span>}
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-3 text-sm font-bold leading-5 text-slate-800 group-hover:text-indigo-700">{item.title || "Untitled article"}</span>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">Read article <ArrowUpRight size={13} aria-hidden="true" /></span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : <p className="mt-5 text-sm text-slate-500">No related articles yet.</p>}
    </section>
  );
}
