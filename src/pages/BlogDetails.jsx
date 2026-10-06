import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Timer,
  UserRound,
  Tag,
  ArrowUpRight,
  Compass,
  MessageCircle,
  Send,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ArticleShare from "../components/ArticleShare";
import ArticleListen from "../components/ArticleListen";
import TrustedAuthorBadge from "../components/TrustedAuthorBadge";
import AuthorFollow from "../components/AuthorFollow";
import { API_BASE_URL } from "../config/api";
import useArticleView from "../hooks/useArticleView";
import { articlePath } from "../utils/articlePath";

const readJsonResponse = async (response, fallbackMessage) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(response.ok ? fallbackMessage : "The server returned an invalid response.");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }
  return data;
};

function BlogDetails() {
  const { slug, topicSlug } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [topicList, setTopicList] = useState([]);
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [otherTopicsLoading, setOtherTopicsLoading] = useState(true);
  const [reaction, setReaction] = useState(null);
  const [reactionCounts, setReactionCounts] = useState({ likes_count: 0, dislikes_count: 0 });
  const [reactionLoading, setReactionLoading] = useState(false);
  const [reactionError, setReactionError] = useState("");
  const [questionState, setQuestionState] = useState(null);
  const [questionDraft, setQuestionDraft] = useState("");
  const [questionReplyDrafts, setQuestionReplyDrafts] = useState({});
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [savingReplyId, setSavingReplyId] = useState(null);
  const [questionActionError, setQuestionActionError] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("copied_content");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [reportError, setReportError] = useState("");
  useArticleView(slug, !loading && !error && blog?.slug === slug && (!blog.topic_slug || topicSlug === blog.topic_slug) ? blog.id : null, setBlog);

  const hasCurrentQuestionState = Boolean(blog?.slug && questionState?.slug === blog.slug);
  const questions = hasCurrentQuestionState ? questionState.questions : [];
  const questionsLoading = Boolean(blog?.slug && !hasCurrentQuestionState);
  const isArticleAuthor = hasCurrentQuestionState && questionState.isAuthor;
  const questionsError = hasCurrentQuestionState ? questionState.error : "";

  useEffect(() => {
    if (!blog?.slug) return undefined;

    const controller = new AbortController();
    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/api/blog/${encodeURIComponent(blog.slug)}/questions`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: "application/json",
      },
      signal: controller.signal,
    })
      .then((response) => readJsonResponse(response, "Unable to load questions."))
      .then((data) => {
        if (controller.signal.aborted) return;
        setQuestionState({
          slug: blog.slug,
          questions: Array.isArray(data.data) ? data.data : [],
          isAuthor: Boolean(data.is_author),
          error: "",
        });
        setQuestionReplyDrafts({});
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setQuestionState({ slug: blog.slug, questions: [], isAuthor: false, error: loadError.message || "Unable to load questions." });
        }
      });

    return () => controller.abort();
  }, [blog?.slug]);

  const submitQuestion = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: pathname } });
      return;
    }
    const question = questionDraft.trim();
    if (!question) return;

    setSubmittingQuestion(true);
    setQuestionActionError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/${encodeURIComponent(blog.slug)}/questions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });
      const data = await readJsonResponse(response, "Unable to submit your question.");
      setQuestionState((current) => current?.slug === blog.slug
        ? { ...current, questions: [...current.questions, data.data] }
        : current);
      setQuestionDraft("");
    } catch (submitError) {
      setQuestionActionError(submitError.message || "Unable to submit your question.");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const submitAnswer = async (event, questionId) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: pathname } });
      return;
    }
    const answer = (questionReplyDrafts[questionId] || "").trim();
    if (!answer) return;

    setSavingReplyId(questionId);
    setQuestionActionError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/${encodeURIComponent(blog.slug)}/questions/${questionId}/answer`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answer }),
      });
      const data = await readJsonResponse(response, "Unable to save your reply.");
      setQuestionState((current) => current?.slug === blog.slug
        ? {
            ...current,
            questions: current.questions.map((question) => question.id === questionId ? data.data : question),
          }
        : current);
    } catch (answerError) {
      setQuestionActionError(answerError.message || "Unable to save your reply.");
    } finally {
      setSavingReplyId(null);
    }
  };

  useEffect(() => {
    if (!blog?.slug) return undefined;

    const controller = new AbortController();
    const token = localStorage.getItem("token");

    fetch(`${API_BASE_URL}/api/blog/${encodeURIComponent(blog.slug)}/reaction`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: "application/json",
      },
      signal: controller.signal,
    })
      .then((response) => readJsonResponse(response, "Unable to load article reactions."))
      .then((data) => {
        if (controller.signal.aborted) return;
        setReaction(data.data?.reaction || null);
        setReactionError("");
        setReactionCounts({
          likes_count: Number(data.data?.likes_count || 0),
          dislikes_count: Number(data.data?.dislikes_count || 0),
        });
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setReactionError(loadError.message || "Unable to load article reactions.");
        }
      });

    return () => controller.abort();
  }, [blog?.slug]);

  const handleReaction = async (nextReaction) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: pathname } });
      return;
    }

    const previousReaction = reaction;
    const previousCounts = reactionCounts;
    const selectedReaction = previousReaction === nextReaction ? null : nextReaction;
    setReaction(selectedReaction);
    setReactionCounts((current) => ({
      ...current,
      likes_count: current.likes_count + (selectedReaction === "like" ? 1 : 0) - (previousReaction === "like" ? 1 : 0),
      dislikes_count: current.dislikes_count + (selectedReaction === "dislike" ? 1 : 0) - (previousReaction === "dislike" ? 1 : 0),
    }));
    setReactionLoading(true);
    setReactionError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/${encodeURIComponent(blog.slug)}/reaction`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reaction: nextReaction }),
      });
      const data = await readJsonResponse(response, "Unable to save your reaction.");
      setReaction(data.data?.reaction || null);
      setReactionCounts({
        likes_count: Number(data.data?.likes_count || 0),
        dislikes_count: Number(data.data?.dislikes_count || 0),
      });
    } catch (saveError) {
      setReaction(previousReaction);
      setReactionCounts(previousCounts);
      setReactionError(saveError.message || "Unable to save your reaction.");
    } finally {
      setReactionLoading(false);
    }
  };

  const submitReport = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: pathname } });
      return;
    }
    setReportSubmitting(true);
    setReportError("");
    setReportMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/${encodeURIComponent(blog.slug)}/reports`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason, details: reportDetails.trim() }),
      });
      await readJsonResponse(response, "Unable to submit your report.");
      setReportMessage("Thanks. Your report has been sent for review.");
      setReportDetails("");
      setReportOpen(false);
    } catch (submitError) {
      setReportError(submitError.message || "Unable to submit your report.");
    } finally {
      setReportSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/article/gettopicsList`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        });
        const data = await readJsonResponse(response, "Unable to load topics.");
        if (response.ok) setTopicList(data.data || []);
      } catch {
        // Topic navigation is optional, so the article page remains usable if it fails.
      }
    };

    fetchTopics();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPublishedArticles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/blog`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load articles");
        const data = await readJsonResponse(response, "Unable to load articles.");
        if (!controller.signal.aborted) setPublishedArticles(Array.isArray(data.data) ? data.data : []);
      } catch {
        // Other topics are optional if the article list is unavailable.
      } finally {
        if (!controller.signal.aborted) setOtherTopicsLoading(false);
      }
    };
    fetchPublishedArticles();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/blog/${encodeURIComponent(slug)}`
        );

        const details = await readJsonResponse(response, "Unable to load this article.");

        setBlog(details.data);
        if (details.data?.topic_slug && pathname !== articlePath(details.data)) {
          navigate(articlePath(details.data), { replace: true });
        }
      } catch (fetchError) {
        setError(
          fetchError.message || "Unable to load this article."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug, pathname, navigate]);

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
    if (!blog?.created_by) return [];

    const currentTopicIds = new Set(String(blog.topicid ?? "").split(",").map((id) => id.trim()).filter(Boolean));
    const authorTopicArticles = new Map();

    publishedArticles
      .filter((article) => String(article.created_by) === String(blog.created_by) && String(article.id) !== String(blog.id))
      .forEach((article) => {
        String(article.topicid ?? "").split(",").map((id) => id.trim()).filter(Boolean).forEach((id) => {
          if (!currentTopicIds.has(id) && !authorTopicArticles.has(id)) authorTopicArticles.set(id, article);
        });
      });

    return topicList
      .filter((topic) => authorTopicArticles.has(String(topic.id)))
      .map((topic) => ({
        ...topic,
        slug: topic.slug || topic.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      }))
      .slice(0, 10);
  }, [blog, topicList, publishedArticles]);

  const sameAuthorArticles = useMemo(() => {
    if (!blog) return [];
    const author = blog.author || blog.user || {};
    const getKeys = (article) => {
      const nestedAuthor = article.author || article.user || {};
      const createdBy = typeof article.created_by === "object" ? article.created_by?.id : article.created_by;
      const id = article.author_id ?? nestedAuthor.id ?? createdBy;
      const slugValue = article.author_slug || nestedAuthor.slug;
      const name = article.author_name || nestedAuthor.name || article.user_name;
      return [
        id != null ? `id:${String(id)}` : null,
        slugValue ? `slug:${String(slugValue).toLowerCase()}` : null,
        name ? `name:${String(name).trim().toLowerCase()}` : null,
      ].filter(Boolean);
    };
    const currentKeys = new Set(getKeys(blog));
    if (currentKeys.size === 0 && author.name) currentKeys.add(`name:${String(author.name).trim().toLowerCase()}`);
    if (currentKeys.size === 0) return [];

    return publishedArticles
      .filter((article) => article.slug && String(article.id) !== String(blog.id) && article.slug !== blog.slug)
      .filter((article) => ["1", "published", "active"].includes(String(article.status ?? "published").toLowerCase()))
      .filter((article) => getKeys(article).some((key) => currentKeys.has(key)))
      .sort((first, second) => new Date(second.published_at || second.created_at || 0) - new Date(first.published_at || first.created_at || 0))
      .slice(0, 4);
  }, [blog, publishedArticles]);

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

        <main className="relative isolate flex min-h-[75vh] items-center justify-center overflow-hidden bg-slate-950 px-4 py-16">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/70 via-slate-950 to-slate-950" />
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl shadow-black/30 backdrop-blur sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-300/20 bg-rose-400/10 text-rose-300">
              <Tag size={27} aria-hidden="true" />
            </div>
            <p className="mt-7 text-sm font-bold uppercase tracking-[0.28em] text-indigo-300">404 · Article not found</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">This story isn’t here</h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-300">
              {error || "The article may have been removed, moved, or the link may be incorrect."}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/articles" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 font-bold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-400">
                <ArrowLeft size={18} aria-hidden="true" /> Browse all articles
              </Link>
              <Link to="/" className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/10">
                Return home
              </Link>
            </div>
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
  const readerTime = formatMetric(blog.reader_view_time_minutes);

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

              {readerTime !== "Not available" && (
                <span className="inline-flex items-center gap-2" aria-live="polite">
                  <Timer size={17} aria-hidden="true" />
                  Total read time: {readerTime} min
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
              {reactionError && <p role="status" className="mb-4 text-sm text-rose-600">{reactionError}</p>}

              <ArticleListen key={slug} title={blog.title} description={blog.short_description} content={content} />

              <div
                className={`article-content min-w-0 w-full rounded-2xl bg-white p-5 text-slate-800 sm:p-8
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
                `}
                dangerouslySetInnerHTML={{
                  __html: content,
                }}
              />

              <footer className="mt-10 border-t border-slate-100 pt-6">
                <ArticleShare key={slug} slug={slug} title={blog.title} url={shareUrl} onReact={handleReaction} reaction={reaction} reactionCounts={reactionCounts} reactionLoading={reactionLoading}
                  reportOpen={reportOpen} setReportOpen={(isOpen) => { setReportOpen(isOpen); if (isOpen) setReportError(""); }} reportReason={reportReason} setReportReason={setReportReason}
                  reportDetails={reportDetails} setReportDetails={setReportDetails} reportSubmitting={reportSubmitting} reportError={reportError} submitReport={submitReport} />
                {reportMessage && <p role="status" className="mt-3 text-right text-sm text-emerald-700">{reportMessage}</p>}
              </footer>

              <section aria-labelledby="questions-heading" className="mt-12 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><MessageCircle size={20} aria-hidden="true" /></span>
                  <div>
                    <h2 id="questions-heading" className="text-2xl font-bold tracking-tight text-slate-900">Questions &amp; Answers</h2>
                    <p className="mt-1 text-sm text-slate-500">Ask the author about this article.</p>
                  </div>
                </div>

                {questionsError && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{questionsError}</p>}
                {questionActionError && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{questionActionError}</p>}

                {localStorage.getItem("token") ? (
                  <form onSubmit={submitQuestion} className="mt-6">
                    <label htmlFor="article-question" className="mb-2 block text-sm font-semibold text-slate-700">Your question</label>
                    <textarea id="article-question" required maxLength={2000} rows={3} value={questionDraft} onChange={(event) => setQuestionDraft(event.target.value)} placeholder="What would you like to ask the author?" className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">{questionDraft.length}/2000 characters</span>
                      <button type="submit" disabled={submittingQuestion || !questionDraft.trim()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                        <Send size={16} aria-hidden="true" /> {submittingQuestion ? "Sending..." : "Ask question"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    <Link to="/login" state={{ from: pathname }} className="font-semibold text-blue-600 hover:text-blue-700">Sign in</Link> to ask the author a question.
                  </p>
                )}

                <div className="mt-7 space-y-4">
                  {questionsLoading ? (
                    <p className="text-sm text-slate-500">Loading questions...</p>
                  ) : questions.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">No questions yet. Start the conversation.</p>
                  ) : questions.map((question) => (
                    <article key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <MessageCircle size={17} className="mt-0.5 shrink-0 text-blue-600" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">{question.question}</p>
                          <p className="mt-2 text-xs text-slate-500">Asked by {question.asker_name}</p>
                          {question.answer && (
                            <div className="mt-4 rounded-xl border-l-2 border-blue-500 bg-white px-4 py-3">
                              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{question.answer}</p>
                              <p className="mt-2 text-xs font-medium text-slate-500">Reply from {question.responder_name || authorName}</p>
                            </div>
                          )}
                          {isArticleAuthor && (
                            <form onSubmit={(event) => submitAnswer(event, question.id)} className="mt-4">
                              <label htmlFor={`answer-${question.id}`} className="mb-2 block text-sm font-semibold text-slate-700">{question.answer ? "Edit your reply" : "Your reply"}</label>
                              <textarea id={`answer-${question.id}`} required maxLength={5000} rows={2} value={questionReplyDrafts[question.id] ?? question.answer ?? ""} onChange={(event) => setQuestionReplyDrafts((current) => ({ ...current, [question.id]: event.target.value }))} className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                              <button type="submit" disabled={savingReplyId === question.id || !(questionReplyDrafts[question.id] ?? question.answer ?? "").trim()} className="mt-2 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60">
                                <Send size={15} aria-hidden="true" /> {savingReplyId === question.id ? "Saving..." : question.answer ? "Update reply" : "Reply"}
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

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
                  <div className="flex items-center justify-between gap-4">
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

                    {authorSlug && <AuthorFollow slug={authorSlug} />}
                  </div>

                  <div className="mt-5 flex items-center gap-1.5">
                    <h3 className="text-xl font-black text-slate-900">{authorName}</h3>
                    <TrustedAuthorBadge isTrusted={author.is_trusted || blog.is_trusted} />
                  </div>

                  {authorSlug && <p className="mt-1 text-sm text-slate-500">@{authorSlug}</p>}

                  <p className="mt-1 text-sm font-medium text-blue-600">
                    Article Author
                  </p>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {authorBio}
                  </p>
                </div>

                {authorSlug && (
                  <div className="mt-6">
                    <Link to={`/authors/${encodeURIComponent(authorSlug)}`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                      View author profile <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                )}

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

            <section aria-labelledby="same-author-articles-heading" className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40 sm:p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><ArrowUpRight size={19} aria-hidden="true" /></span>
                <div>
                  <h2 id="same-author-articles-heading" className="font-bold text-slate-900">More from {authorName}</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Other articles by this author</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {otherTopicsLoading ? (
                  <p role="status" className="text-sm text-slate-500">Loading articles...</p>
                ) : sameAuthorArticles.length > 0 ? sameAuthorArticles.map((article) => {
                  const thumbnail = article.featured_image || article.banner_image || article.image || article.thumbnail;
                  return (
                    <Link key={article.id || article.slug} to={articlePath(article)} className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                      {thumbnail ? <img src={thumbnail} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-xl object-cover" /> : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-blue-500"><Tag size={20} aria-hidden="true" /></span>}
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-sm font-bold leading-5 text-slate-800 group-hover:text-blue-700">{article.title || "Untitled article"}</span>
                        <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600">Read article <ArrowUpRight size={13} aria-hidden="true" /></span>
                      </span>
                    </Link>
                  );
                }) : (
                  <p className="text-sm text-slate-500">No other articles from this author yet.</p>
                )}
              </div>
            </section>

            <section aria-labelledby="explore-topics-heading" className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40 sm:p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Compass size={19} aria-hidden="true" /></span>
                <div>
                  <h2 id="explore-topics-heading" className="font-bold text-slate-900">Explore other topics</h2>
                  <p className="mt-0.5 text-xs text-slate-500">More subjects from this author</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                {otherTopicsLoading ? (
                  <span className="col-span-2 text-sm text-slate-500">Loading topics...</span>
                ) : otherTopics.length > 0 ? otherTopics.map((topic) => (
                  <Link
                    key={topic.id}
                    to={`/topics/${encodeURIComponent(topic.slug)}`}
                    className="group flex min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <span className="truncate">{topic.name}</span>
                    <ArrowUpRight size={15} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-600" aria-hidden="true" />
                  </Link>
                )) : (
                  <span className="col-span-2 text-sm text-slate-500">No other topics from this author yet.</span>
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
