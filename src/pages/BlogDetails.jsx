import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  Timer,
  UserRound,
  Tag,
  ArrowUpRight,
  Compass,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ArticleShare from "../components/ArticleShare";
import RelatedArticles from "../components/RelatedArticles";
import { API_BASE_URL } from "../config/api";
import useArticleView from "../hooks/useArticleView";

function BlogDetails() {
  const { slug } = useParams();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [topicList, setTopicList] = useState([]);
  useArticleView(slug, !loading && !error && blog?.slug === slug ? blog.id : null, setBlog);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/article/gettopicsList`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        });
        const data = await response.json();
        if (response.ok) setTopicList(data.data || []);
      } catch {
        // Topic navigation is optional, so the article page remains usable if it fails.
      }
    };

    fetchTopics();
  }, []);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/blog/${encodeURIComponent(slug)}`
        );

        const details = await response.json();

        if (!response.ok) {
          throw new Error(
            details.message || "Unable to load this article."
          );
        }

        setBlog(details.data);
      } catch (fetchError) {
        setError(
          fetchError.message || "Unable to load this article."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop;

      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      setScrollProgress(
        height > 0 ? Math.min((scrollTop / height) * 100, 100) : 0
      );
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const topics = useMemo(() => {
    if (!blog) return [];

    const source =
      blog.topics ||
      blog.article_topics ||
      blog.topic_list ||
      blog.topic ||
      [];

    return (Array.isArray(source) ? source : [source])
      .map((item) => {
        if (typeof item === "string") {
          return {
            name: item,
            slug: item
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, ""),
          };
        }

        const topic = item.topic || item.topic_detail || item;

        return {
          id: topic.id || item.topic_id || item.id,
          name:
            topic.name ||
            topic.title ||
            item.topic_name ||
            "",
          slug:
            topic.slug ||
            item.topic_slug ||
            topic.name
              ?.toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, ""),
        };
      })
      .filter((topic) => topic.name);
  }, [blog]);

  const otherTopics = useMemo(() => {
    const currentTopicIds = new Set(topics.map((topic) => String(topic.id)));
    const currentTopicNames = new Set(topics.map((topic) => topic.name.toLowerCase()));

    return topicList
      .filter((topic) => !currentTopicIds.has(String(topic.id)))
      .filter((topic) => !currentTopicNames.has((topic.name || "").toLowerCase()))
      .slice(0, 10);
  }, [topicList, topics]);

  if (loading) {
    return (
      <>
        <Header />

        <div className="flex min-h-[75vh] items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading article...
            </p>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  if (error || !blog) {
    return (
      <>
        <Header />

        <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl shadow-slate-200/50">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Tag size={28} />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Article unavailable
            </h1>

            <p className="mt-3 leading-7 text-slate-600">
              {error || "This article could not be found."}
            </p>

            <Link
              to="/blog"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              <ArrowLeft size={18} />
              Back to articles
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const content =
    blog.content ||
    blog.long_description ||
    blog.description ||
    "";

  const formatMetric = (value) => {
    if (value == null || String(value).trim() === "" || !Number.isFinite(Number(value)) || Number(value) < 0) return "Not available";
    return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 1 });
  };
  const viewTime = formatMetric(blog.view_time_minutes ?? blog.view_time);
  const articleStats = [
    { label: "Page visits", value: formatMetric(blog.views_count ?? blog.views), icon: Eye, color: "bg-blue-50 text-blue-600", caption: "Total article views" },
    { label: "Total time read", value: viewTime === "Not available" ? viewTime : `${viewTime} min`, icon: Timer, color: "bg-teal-50 text-teal-600", caption: "Time spent by all readers" },
  ];

  const author =
    blog.author ||
    blog.user ||
    blog.created_by ||
    {};

  const authorName =
    author.name ||
    blog.author_name ||
    blog.user_name ||
    "Editorial Team";

  const authorImage =
    author.profile_picture ||
    author.avatar ||
    author.image ||
    author.profile_image ||
    blog.author_image;

  const authorImageUrl = authorImage
    ? /^https?:\/\//i.test(authorImage)
      ? authorImage
      : `${API_BASE_URL}/${String(authorImage).replace(/^\/+/, "").replace(/^(?!storage\/)/, "storage/")}`
    : null;

  const authorSlug = author.slug || blog.author_slug;

  const authorBio =
    author.bio ||
    author.description ||
    blog.author_bio ||
    "Sharing ideas, insights and useful information with our readers.";

  const publishedDate =
    blog.published_at || blog.created_at;

  const heroImage =
    blog.featured_image ||
    blog.banner_image ||
    blog.image ||
    blog.thumbnail;

  const currentTopicSlug =
    blog.topic?.slug ||
    blog.topic_slug ||
    blog.primary_topic?.slug ||
    topics[0]?.slug;

  const isCurrentTopic = (topic) => {
    if (!topic) return false;

    return (
      topic.slug === currentTopicSlug ||
      topic.slug === slug ||
      topic.name?.toLowerCase() ===
        blog.topic_name?.toLowerCase()
    );
  };

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : "";

  return (
    <>
      <Header />

      {/* Reading Progress */}
      <div className="fixed left-0 top-0 z-[100] h-1 w-full bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-blue-600 to-violet-600 transition-all duration-150"
          style={{
            width: `${scrollProgress}%`,
          }}
        />
      </div>

      <main className="min-h-screen bg-[#f7f9fc] pb-20">

        {/* HERO */}
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0">
            <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
          </div>

          {heroImage && (
            <>
              <img
                src={heroImage}
                alt={blog.title}
                className="absolute inset-0 h-full w-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-900/75" />
            </>
          )}

          <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">

            <div className="flex flex-wrap items-start justify-between gap-4">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 backdrop-blur transition hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft size={17} />
                Back to articles
              </Link>
            </div>

            {/* Topics */}
            {topics.length > 0 && (
              <div className="mt-9 flex flex-wrap gap-2">
                {topics.map((topic) => {
                  const active = isCurrentTopic(topic);

                  return (
                    <Link
                      key={topic.id || topic.slug || topic.name}
                      to={
                        topic.slug
                          ? `/blog/topic/${topic.slug}`
                          : "#"
                      }
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-300/40"
                          : "border border-white/10 bg-white/10 text-slate-200 backdrop-blur hover:bg-white/20"
                      }`}
                    >
                      {active && (
                        <span className="mr-1.5">
                          •
                        </span>
                      )}

                      {topic.name}
                    </Link>
                  );
                })}
              </div>
            )}

            <h1 className="mt-7 max-w-5xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {blog.title}
            </h1>

            {blog.short_description && (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
                {blog.short_description}
              </p>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4 text-sm font-medium text-slate-300">

             
              <span className="hidden h-8 w-px bg-white/10 sm:block" />

              {publishedDate && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={17} />

                  {new Date(
                    publishedDate
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}

            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-10 lg:py-14">

          {/* ARTICLE */}
          <article className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40">

            {heroImage && (
              <div className="relative aspect-[16/8] overflow-hidden">
                <img
                  src={heroImage}
                  alt={blog.title}
                  className="h-full w-full object-cover transition duration-700 hover:scale-[1.02]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}

            <div className="flex flex-col p-6 sm:p-10 lg:p-12">
              <section aria-label="Article statistics" className="mb-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-violet-50/80 p-3 shadow-sm">
                <div role="region" aria-label="Article activity; scroll for more" tabIndex={0} className="overflow-x-auto rounded-xl focus-visible:outline-2 focus-visible:outline-blue-600">
                  <div className="flex min-w-max items-center gap-5">
                    <dl className="flex items-center divide-x divide-slate-200">
                      {articleStats.map(({ label, value, icon: Icon, color, caption }) => (
                        <div key={label} title={`${label}: ${value}. ${caption}`} className="flex items-center gap-2 whitespace-nowrap px-3 first:pl-1">
                          <dt className="flex items-center">
                            <span className={`rounded-full p-2 ${color}`}><Icon size={16} aria-hidden="true" /></span>
                            <span className="sr-only">{label}</span>
                          </dt>
                          <dd className="text-sm font-bold tabular-nums text-slate-800">
                            {value} <span className="text-xs font-medium text-slate-500">{label === "Page visits" ? "visits" : "total read"}</span>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </section>

              <div
                className="article-content min-w-0 w-full
                  prose
                  prose-slate
                  max-w-none

                  prose-headings:scroll-mt-24
                  prose-headings:font-black
                  prose-headings:tracking-tight
                  prose-headings:text-slate-900

                  prose-h2:mt-12
                  prose-h2:text-3xl

                  prose-h3:mt-9
                  prose-h3:text-2xl

                  prose-p:text-[17px]
                  prose-p:leading-8
                  prose-p:text-slate-600

                  prose-a:font-semibold
                  prose-a:text-blue-600
                  prose-a:no-underline
                  hover:prose-a:text-blue-700

                  prose-strong:text-slate-900

                  prose-blockquote:rounded-r-xl
                  prose-blockquote:border-l-4
                  prose-blockquote:border-blue-500
                  prose-blockquote:bg-blue-50
                  prose-blockquote:px-6
                  prose-blockquote:py-2
                  prose-blockquote:not-italic
                  prose-blockquote:text-slate-700

                  prose-img:rounded-2xl
                  prose-img:shadow-lg

                  prose-li:text-slate-600

                  prose-table:overflow-hidden
                  prose-table:rounded-xl
                  prose-table:border
                  prose-table:border-slate-200
                "
                dangerouslySetInnerHTML={{
                  __html: content,
                }}
              />

              <footer className="mt-10 border-t border-slate-100 pt-6">
                <ArticleShare key={slug} slug={slug} title={blog.title} url={shareUrl} />
              </footer>

            </div>
          </article>

          {/* SIDEBAR */}
          <aside className="space-y-6 lg:sticky lg:top-8 lg:h-fit">

            {/* AUTHOR CARD */}
            <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-7 shadow-lg shadow-slate-200/40">

              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-100/70 blur-3xl" />

              <div className="relative">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                  About the author
                </p>

                <div className="mt-6">
                  {authorImageUrl ? (
                    <img
                      src={authorImageUrl}
                      alt={authorName}
                      className="h-20 w-20 rounded-2xl object-cover shadow-lg ring-4 ring-blue-50"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 ring-4 ring-blue-50">
                      <UserRound size={34} />
                    </div>
                  )}

                  <h3 className="mt-5 text-xl font-black text-slate-900">
                    {authorName}
                  </h3>

                  {authorSlug && <p className="mt-1 text-sm text-slate-500">@{authorSlug}</p>}

                  <p className="mt-1 text-sm font-medium text-blue-600">
                    Article Author
                  </p>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {authorBio}
                  </p>
                </div>

              </div>
            </div>

            {/* TOPICS */}
            {topics.length > 0 && (
              <section aria-labelledby="article-topics-heading" className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
                <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50/70 px-7 py-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100"><Tag size={18} aria-hidden="true" /></span>
                    <div>
                      <h2 id="article-topics-heading" className="font-bold text-slate-900">Related topics</h2>
                      <p className="mt-0.5 text-xs text-slate-500">Explore this article's subjects</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  {topics.map((topic) => {
                    const active =
                      isCurrentTopic(topic);

                    return (
                      <Link
                        key={
                          topic.id ||
                          topic.slug ||
                          topic.name
                        }
                        to={
                          topic.slug
                            ? `/blog/topic/${topic.slug}`
                            : "#"
                        }
                        className={`group flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                          active
                            ? "border-blue-200 bg-blue-50 text-blue-800"
                            : "border-transparent bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${active ? "bg-blue-600" : "bg-slate-300 group-hover:bg-blue-500"}`} />
                          <span className="truncate">{topic.name}</span>
                        </span>
                        <ArrowUpRight size={16} className="shrink-0 opacity-50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" aria-hidden="true" />
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* OTHER TOPICS */}
            <RelatedArticles article={blog} />

            <section aria-labelledby="explore-topics-heading" className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40 sm:p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Compass size={19} aria-hidden="true" /></span>
                <div>
                  <h2 id="explore-topics-heading" className="font-bold text-slate-900">Explore other topics</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Find something new to read</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                {otherTopics.length > 0 ? otherTopics.map((topic) => (
                  <Link
                    key={topic.id}
                    to={`/blog?topic=${encodeURIComponent(topic.slug || topic.name)}`}
                    className="group flex min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <span className="truncate">{topic.name}</span>
                    <ArrowUpRight size={15} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-600" aria-hidden="true" />
                  </Link>
                )) : (
                  <span className="col-span-2 text-sm text-slate-500">No other topics available.</span>
                )}
              </div>
            </section>

          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default BlogDetails;
