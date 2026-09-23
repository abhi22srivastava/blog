import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, Tag, UserRound } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config/api";
import { articlePath } from "../utils/articlePath";

const excerpt = (article) => String(article.long_description || article.description || article.body || "")
  .replace(/<[^>]*>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/\s+/g, " ")
  .trim();

const publishedDate = (article) => {
  const value = article.publishDate || article.published_at || article.created_at;
  if (!value || Number.isNaN(new Date(value).getTime())) return "Date unavailable";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export default function Articles() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim() || "";
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/blog`, { signal: controller.signal, headers: { Accept: "application/json" } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load articles.");
        setArticles(Array.isArray(result.data) ? result.data : []);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const normalizedQuery = searchQuery.toLowerCase();
  const filteredArticles = normalizedQuery
    ? articles.filter((article) => {
      const author = article.author || article.user || {};
      const topic = article.topic_name || article.topic_slug || "";
      const searchableText = [
        article.title,
        article.long_description,
        article.description,
        article.body,
        author.name,
        article.author_name,
        topic,
      ].join(" ").toLowerCase();
      return searchableText.includes(normalizedQuery);
    })
    : articles;

  return <>
    <Header />
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">The BlogSphere journal</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{searchQuery ? `Search results for “${searchQuery}”` : "All articles"}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{searchQuery ? "Articles matching your search." : "Ideas, insights, and practical perspectives from our community of authors."}</p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">{filteredArticles.length} {searchQuery ? "result" : "published article"}{filteredArticles.length === 1 ? "" : "s"}</span>
        </div>
        {loading && <div role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">Loading articles...</div>}
        {error && <div role="alert" className="rounded-2xl border border-red-200 bg-white p-8 text-red-700">{error}</div>}
        {!loading && !error && !filteredArticles.length && <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">{searchQuery ? `No articles matched “${searchQuery}”.` : "No published articles yet."}</div>}
        {!loading && !error && filteredArticles.length > 0 && <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredArticles.map((article) => {
            const author = article.author || article.user || {};
            const topic = article.topic_name || article.topic_slug?.replace(/-/g, " ") || "General";
            const summary = excerpt(article);
            return <article key={article.id} className="group flex min-h-80 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700"><Tag size={13} aria-hidden="true" />{topic}</span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} aria-hidden="true" />{publishedDate(article)}</span>
              </div>
              <h2 className="mt-5 line-clamp-2 text-2xl font-bold leading-tight tracking-tight text-slate-700">{article.title}</h2>
              {summary && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{summary}</p>}
              <div className="mt-auto flex flex-col gap-5 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"><UserRound size={18} aria-hidden="true" /></span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Written by</p><p className="truncate text-sm font-bold text-slate-800">{author.name || article.author_name || "BlogSphere Author"}</p></div></div>
                <Link to={articlePath(article)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800">Read More <ArrowUpRight size={16} aria-hidden="true" /></Link>
              </div>
            </article>;
          })}
        </div>}
      </section>
    </main>
    <Footer />
  </>;
}
