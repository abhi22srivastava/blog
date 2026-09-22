import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, BookOpen, CalendarDays, UserRound } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config/api";
import { articlePath } from "../utils/articlePath";

const imageUrl = (path) => !path ? null : /^https?:\/\//i.test(path)
  ? path : `${API_BASE_URL}/storage/${String(path).replace(/^\/?(?:storage\/)?/, "")}`;

const excerpt = (article) => String(article.long_description || article.description || "")
  .replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();

export default function AuthorProfile() {
  const { slug } = useParams();
  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [profileResponse, articlesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/profile/${encodeURIComponent(slug)}`, { signal: controller.signal }),
          fetch(`${API_BASE_URL}/api/blog`, { signal: controller.signal }),
        ]);
        if (!profileResponse.ok || !articlesResponse.ok) throw new Error("Unable to load this author.");
        const [profile, articleData] = await Promise.all([profileResponse.json(), articlesResponse.json()]);
        if (controller.signal.aborted) return;
        setAuthor(profile.profile);
        setArticles((Array.isArray(articleData.data) ? articleData.data : [])
          .filter((article) => String(article.created_by) === String(profile.profile.id)));
      } catch (loadError) {
        if (loadError.name !== "AbortError") setError(loadError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [slug]);

  return <>
    <Header />
    <main className="min-h-[70vh] bg-slate-50 pb-20">
      <div className="h-44 bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-800 sm:h-56" />
      <div className="mx-auto -mt-24 max-w-6xl px-4 sm:px-6">
        {loading ? <div role="status" className="rounded-3xl bg-white p-10 text-slate-600 shadow-lg">Loading author...</div> : error ? <div role="alert" className="rounded-3xl border border-red-200 bg-white p-10 text-red-700 shadow-lg">{error}</div> : author && <>
          <section aria-labelledby="author-name" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-10">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
              {imageUrl(author.profile_picture) ? <img src={imageUrl(author.profile_picture)} alt="" className="h-28 w-28 shrink-0 rounded-3xl object-cover shadow-lg sm:h-36 sm:w-36" /> : <span className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-700 sm:h-36 sm:w-36"><UserRound size={56} aria-hidden="true" /></span>}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Author profile</p>
                <h1 id="author-name" className="mt-2 break-words text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{author.name}</h1>
                <p className="mt-1 text-sm font-medium text-slate-500">@{author.slug}</p>
                <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-7 text-slate-600">{author.bio || "Stories and perspectives from this writer."}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-indigo-50 px-5 py-4 text-indigo-800">
                <BookOpen size={24} aria-hidden="true" />
                <div><p className="text-2xl font-bold leading-none">{articles.length}</p><p className="mt-1 text-xs font-semibold">Published {articles.length === 1 ? "article" : "articles"}</p></div>
              </div>
            </div>
          </section>
          <section aria-labelledby="author-articles" className="mt-12">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">The collection</p><h2 id="author-articles" className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Articles by {author.name}</h2></div>
              <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"><ArrowLeft size={16} aria-hidden="true" /> All articles</Link>
            </div>
            {articles.length ? <div className="grid gap-5 md:grid-cols-2">{articles.map((article) => {
              const published = article.publishDate || article.created_at;
              const date = published && !Number.isNaN(new Date(published).getTime()) ? new Date(published).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;
              return <article key={article.id} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-lg">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                  {article.topic_slug && <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{article.topic_slug.replace(/-/g, " ")}</span>}
                  {date && <span className="inline-flex items-center gap-1"><CalendarDays size={14} aria-hidden="true" />{date}</span>}
                </div>
                <h3 className="mt-4 line-clamp-2 text-xl font-bold leading-snug text-slate-900 group-hover:text-indigo-700">{article.title}</h3>
                {excerpt(article) && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{excerpt(article)}</p>}
                <Link to={articlePath(article)} className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-bold text-indigo-700 hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Read article <ArrowUpRight size={17} aria-hidden="true" /></Link>
              </article>;
            })}</div> : <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">No published articles yet.</div>}
          </section>
        </>}
      </div>
    </main>
    <Footer />
  </>;
}
