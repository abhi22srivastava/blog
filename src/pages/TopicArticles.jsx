import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, CalendarDays, Check, Hash, Sparkles, Tag, UserPlus, UserRound, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TrustedAuthorBadge from "../components/TrustedAuthorBadge";
import { API_BASE_URL } from "../config/api";
import { articlePath } from "../utils/articlePath";

const normalizeSlug = (value) => String(value || "")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const getArticleTopics = (article) => {
  const source = article.topics || article.article_topics || article.topic_list || article.topic || [];
  const topics = (Array.isArray(source) ? source : [source]).map((item) => {
    if (typeof item === "string") return { name: item, slug: normalizeSlug(item) };
    const topic = item?.topic || item?.topic_detail || item || {};
    const name = topic.name || topic.title || item?.topic_name || "";
    return { name, slug: topic.slug || item?.topic_slug || normalizeSlug(name) };
  });

  if (article.topic_name || article.topic_slug) {
    topics.push({ name: article.topic_name || "", slug: article.topic_slug || normalizeSlug(article.topic_name) });
  }
  return topics;
};

const excerpt = (article) => String(article.long_description || article.description || article.body || "")
  .replace(/<[^>]*>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/\s+/g, " ")
  .trim();

const formattedDate = (article) => {
  const value = article.publishDate || article.published_at || article.created_at;
  if (!value || Number.isNaN(new Date(value).getTime())) return "Date unavailable";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export default function TopicArticles() {
  const { topicSlug = "" } = useParams();
  const [articles, setArticles] = useState([]);
  const [topicInfo, setTopicInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followBusy, setFollowBusy] = useState(false);
  const [followError, setFollowError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/blog`, { signal: controller.signal, headers: { Accept: "application/json" } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load articles.");
        setArticles(Array.isArray(result.data) ? result.data : []);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message || "Unable to load articles.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/topics`, { signal: controller.signal, headers: { Accept: "application/json" } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load topic details.");
        const topic = (Array.isArray(result.data) ? result.data : []).find((item) => normalizeSlug(item.slug || item.name) === normalizeSlug(topicSlug));
        if (topic) setTopicInfo(topic);
      })
      .catch((requestError) => { if (requestError.name !== "AbortError") setFollowError(requestError.message || "Unable to load topic details."); });
    return () => controller.abort();
  }, [topicSlug]);

  useEffect(() => {
    setFollowersCount(Number(topicInfo?.followers_count || 0));
    if (!token || !topicInfo?.slug) {
      setFollowing(false);
      return;
    }
    const controller = new AbortController();
    const endpoint = `${API_BASE_URL}/api/topics/${encodeURIComponent(topicInfo.slug)}/follow`;
    fetch(endpoint, { signal: controller.signal, headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load follow status.");
        if (!controller.signal.aborted) {
          setFollowing(Boolean(result.data?.following));
          setFollowersCount(Number(result.data?.followers_count ?? topicInfo.followers_count ?? 0));
        }
      })
      .catch((requestError) => { if (requestError.name !== "AbortError") setFollowError(requestError.message || "Unable to load follow status."); });
    return () => controller.abort();
  }, [topicInfo, token]);

  const handleFollow = async () => {
    if (!token || !topicInfo?.slug || followBusy) return;
    setFollowBusy(true);
    setFollowError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/topics/${encodeURIComponent(topicInfo.slug)}/follow`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ following: !following }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to update follow status.");
      setFollowing(Boolean(result.data.following));
      setFollowersCount(Number(result.data.followers_count || 0));
    } catch (requestError) {
      setFollowError(requestError.message || "Unable to update follow status.");
    } finally {
      setFollowBusy(false);
    }
  };

  const matchingArticles = useMemo(() => articles.filter((article) =>
    getArticleTopics(article).some((topic) => normalizeSlug(topic.slug || topic.name) === normalizeSlug(topicSlug))
  ), [articles, topicSlug]);
  const topicName = matchingArticles.flatMap(getArticleTopics).find((topic) =>
    normalizeSlug(topic.slug || topic.name) === normalizeSlug(topicSlug)
  )?.name || decodeURIComponent(topicSlug).replace(/-/g, " ");

  const storiesCount = Number(topicInfo?.stories_count ?? matchingArticles.length);
  const writersCount = Number(topicInfo?.writers_count ?? new Set(matchingArticles.map((article) => article.author?.id || article.user?.id || article.author_name).filter(Boolean)).size);

  return <>
    <Header />
    <main className="min-h-screen bg-[#f7f8fc]">
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.38),_transparent_55%)]" />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Link to="/topics" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"><ArrowUpRight className="rotate-[-135deg]" size={16} /> All topics</Link>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-indigo-200"><Sparkles size={14} /> Topic community</span>
              <h1 className="mt-5 flex items-center gap-3 text-4xl font-black capitalize tracking-tight sm:text-5xl"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-indigo-200"><Hash size={25} /></span>{topicName}</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">Explore perspectives, ideas, and new stories from writers covering {topicName}.</p>
            </div>
            {token ? <button type="button" onClick={handleFollow} disabled={followBusy || !topicInfo} aria-pressed={following} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition disabled:opacity-60 ${following ? "border border-white/20 bg-white/10 text-white hover:border-rose-300/40 hover:bg-rose-400/10 hover:text-rose-100" : "bg-white text-slate-950 shadow-lg hover:bg-indigo-50"}`}>
              {following ? <Check size={18} /> : <UserPlus size={18} />}{followBusy ? "Updating..." : following ? "Following topic" : "Follow topic"}
            </button> : <Link to="/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-indigo-50"><UserPlus size={18} />Sign in to follow</Link>}
          </div>
          <div className="mt-9 grid max-w-2xl grid-cols-3 gap-3 sm:gap-4">
            {[[Users, followersCount, "Followers"], [BookOpen, storiesCount, "Stories"], [UserRound, writersCount, "Writers"]].map(([Icon, count, label]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 backdrop-blur"><p className="flex items-center gap-2 text-xl font-bold sm:text-2xl"><Icon size={18} className="text-indigo-300" />{Number(count || 0).toLocaleString()}</p><p className="mt-1 text-xs font-medium text-slate-400">{label}</p></div>)}
          </div>
          {followError && <p role="status" className="mt-3 text-sm text-rose-200">{followError}</p>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Fresh perspectives</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Stories about {topicName}</h2></div><span className="text-sm font-medium text-slate-500">{storiesCount.toLocaleString()} {storiesCount === 1 ? "story" : "stories"}</span></div>
        {loading && <div role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">Loading articles...</div>}
        {error && <div role="alert" className="rounded-2xl border border-red-200 bg-white p-8 text-red-700">{error}</div>}
        {!loading && !error && matchingArticles.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">No articles found in this topic yet.</div>}

        {!loading && !error && matchingArticles.length > 0 && <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {matchingArticles.map((article) => {
            const author = article.author || article.user || {};
            const summary = excerpt(article);
            return <article key={article.id} className="group flex min-h-80 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-indigo-700"><Tag size={13} aria-hidden="true" />{topicName}</span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} aria-hidden="true" />{formattedDate(article)}</span>
              </div>
              <h2 className="mt-5 line-clamp-2 text-2xl font-bold leading-tight tracking-tight text-slate-900">{article.title}</h2>
              {summary && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{summary}</p>}
              <div className="mt-auto flex flex-col gap-5 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"><UserRound size={18} aria-hidden="true" /></span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Written by</p><p className="flex min-w-0 items-center gap-1.5 text-sm font-bold text-slate-800"><span className="truncate">{author.name || article.author_name || "BlogSphere Author"}</span><TrustedAuthorBadge isTrusted={author.is_trusted || article.is_trusted} size={17} /></p></div></div>
                <Link to={articlePath(article)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700">Read story <ArrowUpRight size={16} aria-hidden="true" /></Link>
              </div>
            </article>;
          })}
        </div>}
      </section>
    </main>
    <Footer />
  </>;
}
