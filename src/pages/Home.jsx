import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { API_BASE_URL } from "../config/api";
import { articlePath } from "../utils/articlePath";
import { ArrowUpRight, Award, BookOpen, PenLine, Quote } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function getArticleImage(article) {
  const image = article.featured_image || article.banner_image || article.image || article.thumbnail;
  const imageMatch = String(article.long_description || "").match(/<img[^>]+src=["']([^"']+)["']/i);
  const imagePath = image || imageMatch?.[1];

  if (imagePath) {
    if (/^(?:https?:)?\/\//i.test(imagePath) || /^data:/i.test(imagePath)) return imagePath;

    const path = String(imagePath).replace(/^\/+/, "").replace(/^storage\//i, "");
    return `${API_BASE_URL}/storage/${path}`;
  }

  return `https://picsum.photos/900/700?random=${article.id}`;
}

function getArticleText(article) {
  return String(article.long_description || "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatMetric(value) {
  const number = Number(value || 0);
  return number >= 1000 ? `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}K` : number.toLocaleString("en-IN");
}

function getReadingTime(article) {
  const wordCount = getArticleText(article).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function Home() {
  const [blogs, setBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [authorsLoading, setAuthorsLoading] = useState(true);

  const popularBlogs = [...blogs]
    .sort((first, second) => {
      const viewDifference = Number(second.views_count || 0) - Number(first.views_count || 0);
      if (viewDifference !== 0) return viewDifference;
      return new Date(second.created_at || 0) - new Date(first.created_at || 0);
    })
    .slice(0, 8);

  const popularTopics = Object.values(
    blogs.reduce((topicTotals, blog) => {
      const name = blog.topic_name || blog.topic_slug?.replace(/-/g, " ");
      if (!name) return topicTotals;

      const key = String(name).toLowerCase();
      topicTotals[key] = {
        name: topicTotals[key]?.name || name,
        slug: blog.topic_slug || key.replace(/\s+/g, "-"),
        total: (topicTotals[key]?.total || 0) + 1,
      };
      return topicTotals;
    }, {})
  )
    .sort((first, second) => second.total - first.total || first.name.localeCompare(second.name))
    .slice(0, 6);


  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/top-authors`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load authors");
        return response.json();
      })
      .then((response) => setAuthors(Array.isArray(response.data) ? response.data : []))
      .catch((error) => { if (error.name !== "AbortError") setAuthors([]); })
      .finally(() => { if (!controller.signal.aborted) setAuthorsLoading(false); });
    return () => controller.abort();
  }, []);



  // useEffect(() => {
  //   fetch("https://jsonplaceholder.typicode.com/posts?_limit=10")
  //     .then((res) => res.json())
  //      .then((response) => {
  //      console.log(response); 
  //      setBlogs(response.data);
  //    })
  //     .catch((err) => console.log(err));
  // }, []);

 

  

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/blog/`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/api/featured-articles`).then((res) => res.json()),
    ])
      .then(([allArticles, featuredArticles]) => {
        setBlogs(Array.isArray(allArticles.data) ? allArticles.data : []);
        setFeaturedBlogs(Array.isArray(featuredArticles.data) ? featuredArticles.data : []);
      })
      .catch((err) => console.log(err));
  }, []);

 

  

  return (
    <>
    <Header/>

    <section aria-labelledby="home-banner-heading" className="bg-slate-950 px-4 py-12 text-white sm:px-6 sm:py-16 lg:py-20">
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 px-7 py-12 shadow-2xl shadow-slate-950/30 sm:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-16 lg:py-20">
        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-36 left-1/3 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />

        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
            <BookOpen size={16} aria-hidden="true" /> A place for curious minds
          </p>
          <h1 id="home-banner-heading" className="mt-7 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Read something new. <span className="text-sky-300">Write what matters.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            Every great idea begins with a story. Explore thoughtful writing, find a fresh perspective, and share the one only you can tell.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/blog" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-sky-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Explore stories <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <Link to={localStorage.getItem("token") ? "/add-article" : "/login"} className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              <PenLine size={18} aria-hidden="true" /> Start writing
            </Link>
          </div>
        </div>

        <div className="relative z-10 hidden min-h-96 items-center justify-center lg:flex" aria-hidden="true">
          <div className="absolute h-72 w-72 rounded-full border border-white/10 bg-white/5" />
          <div className="absolute h-96 w-96 rounded-full border border-white/5" />
          <div className="relative w-80 rotate-[-6deg] rounded-3xl border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-md">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-300 text-slate-900"><Quote size={25} /></span>
            <div className="mt-8 space-y-3"><div className="h-2 w-4/5 rounded-full bg-white/70" /><div className="h-2 w-full rounded-full bg-white/30" /><div className="h-2 w-5/6 rounded-full bg-white/30" /></div>
            <p className="mt-8 text-xl font-semibold leading-relaxed text-white">The next story that inspires someone could be yours.</p>
            <div className="mt-8 flex items-center gap-3 border-t border-white/15 pt-5"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-300 text-indigo-950"><PenLine size={19} /></span><span className="text-sm font-semibold text-sky-100">Your voice belongs here</span></div>
          </div>
        </div>
      </div>
    </section>

<section className="bg-gray-100 py-10">
  <div className="max-w-7xl mx-auto px-6">
    {featuredBlogs.length > 0 ? <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
      }}
      className="rounded-2xl overflow-hidden shadow-xl"
    >
      {featuredBlogs.map((blog) => (
        <SwiperSlide key={blog.id}>
          <div className="grid lg:grid-cols-2 bg-white">

            {/* Left Image */}
            <div className="relative">
              <img
                src={getArticleImage(blog)}
                alt={blog.title}
                className="w-full h-[550px] object-cover"
              />

              <span className="absolute top-6 left-6 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                ⭐ Featured
              </span>
            </div>

            {/* Right Content */}
            <div className="flex items-center p-10">
              <div>

                <span className="text-blue-600 font-semibold uppercase">
                  Featured article
                </span>

                <h1 className="text-5xl font-bold mt-4 leading-tight">
                  {blog.title}
                </h1>

                <div
                  className="article-content mt-6 max-h-48 overflow-hidden text-lg text-gray-600"
                  dangerouslySetInnerHTML={{ __html: blog.long_description || "" }}
                />

                <div className="flex items-center gap-6 mt-8 text-gray-500">
                  <span>👤 {blog.author?.name || "BlogSphere writer"}</span>
                  <span>📅 {new Date(blog.created_at || Date.now()).toLocaleDateString()}</span>
                  <span>⏱ 8 min read</span>
                </div>

                <Link
                  to={articlePath(blog)}
                  className="inline-block mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition"
                >
                  Read Full Article →
                </Link>

              </div>
            </div>

          </div>
        </SwiperSlide>
      ))}
    </Swiper> : <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-xl"><h2 className="text-2xl font-bold text-slate-900">Featured stories are coming soon</h2><p className="mt-2 text-slate-500">Check back when our editors select the next story for the home page.</p></div>}
  </div>
</section>

<section className="py-20 bg-gray-50">
  <div className="max-w-7xl mx-auto px-6">

    <div className="flex justify-between items-center mb-10">
      <div>
        <h2 className="text-4xl font-bold">🔥 Trending Articles</h2>
        <p className="text-gray-500 mt-2">
          Most read articles this week.
        </p>
      </div>

      <Link
        to="/blog"
        className="text-blue-600 font-semibold hover:underline"
      >
        View All →
      </Link>
    </div>

    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={25}
      navigation
      pagination={{ clickable: true }}
      autoplay={{
        delay: 3500,
        disableOnInteraction: false,
      }}
      breakpoints={{
        320: {
          slidesPerView: 1,
        },
        640: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        },
        1280: {
          slidesPerView: 4,
        },
      }}
    >
      {[...blogs]
        .sort((first, second) => Number(second.views_count || 0) - Number(first.views_count || 0))
        .slice(0, 8)
        .map((blog, index) => (
        <SwiperSlide key={blog.id} className="h-auto">
          <Link to={articlePath(blog)}>

            <div className="flex h-full min-h-[500px] flex-col overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl">

              <div className="relative">

                <img
                  src={getArticleImage(blog)}
                  alt={blog.title}
                  className="w-full h-56 object-cover"
                />

                <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  🔥 #{index + 1}
                </span>

              </div>

              <div className="flex flex-1 flex-col p-5">

                <span className="text-blue-600 text-sm font-semibold">
                  {blog.topic_name || blog.topic_slug?.replace(/-/g, " ") || "Latest"}
                </span>

                <h3 className="font-bold text-xl mt-2 line-clamp-2">
                  {blog.title}
                </h3>

                <p className="mt-3 line-clamp-3 flex-1 text-gray-500">
                  {getArticleText(blog)}
                </p>

                <div className="flex justify-between mt-5 text-sm text-gray-400">
                  <span>👁 {formatMetric(blog.views_count)} Views</span>
                  <span>⏱ {getReadingTime(blog)} min read</span>
                </div>

              </div>

            </div>

          </Link>
        </SwiperSlide>
      ))}
    </Swiper>

  </div>
</section>

 <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold mb-6">
              🔥 Popular Stories
            </h2>

            <Swiper
              direction="vertical"
              slidesPerView={3}
              spaceBetween={20}
              loop={true}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              modules={[Autoplay]}
              className="h-[430px]"
            >
              {popularBlogs.map((blog, index) => (
                <SwiperSlide key={blog.id}>
                  <Link to={articlePath(blog)}>
                    <div className="flex gap-4 border rounded-lg p-3 hover:shadow-md transition">

                      <img
                        src={getArticleImage(blog)}
                        className="w-36 h-24 rounded-lg object-cover"
                        alt={blog.title}
                      />

                      <div>

                        <span className="text-sm text-blue-600 font-semibold">
                          #{index + 1} {blog.topic_name || blog.topic_slug?.replace(/-/g, " ") || "Latest"}
                        </span>

                        <h3 className="font-bold text-lg mt-2 hover:text-blue-600">
                          {blog.title}
                        </h3>

                        <p className="text-gray-500 text-sm mt-2">
                          {new Date(blog.created_at || blog.publishDate || Date.now()).toLocaleDateString()} · {formatMetric(blog.views_count)} views · {getReadingTime(blog)} min read
                        </p>

                      </div>
                      
                      

                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

          </div>

          {/* Right */}
          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold mb-6">
              📂 Popular Topics
            </h2>

            <div className="space-y-4">

              {popularTopics.length > 0 ? popularTopics.map((topic) => (
                <Link
                  key={topic.slug}
                  to="/blog"
                >
                 <div className="flex justify-between items-center border rounded-xl px-5 py-4 mb-2 hover:bg-blue-50 hover:shadow-md transition-all duration-300">

                    <span className="font-semibold">
                      {topic.name}
                    </span>

                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      {topic.total} {topic.total === 1 ? "article" : "articles"}
                    </span>

                  </div>
                </Link>
              )) : <p className="text-sm text-slate-500">Topics will appear as articles are published.</p>}

            </div>

          </div>

        </div>

      </div>
    </section>

<section className="bg-gradient-to-b from-blue-50 via-white to-slate-100 py-16 sm:py-20">
  <div className="mx-auto max-w-7xl px-4">

    <div className="mb-10 flex items-end justify-between gap-6">
      <div>
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
          <Award size={16} aria-hidden="true" /> The people behind the stories
        </p>
        <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Top Authors
        </h2>
        <p className="mt-3 max-w-xl text-slate-500">
          Meet the writers behind our published articles.
        </p>
      </div>

    </div>

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

      {authorsLoading ? <p className="text-slate-500" role="status">Loading authors...</p> : authors.length === 0 ? <p className="text-slate-500">No authors with published articles yet.</p> : authors.map((author) => (
        <div
          key={author.id}
          className="group relative flex h-full min-h-[390px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-7 text-center shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-cyan-950/40"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600" />
          <span className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-500">{String(authors.indexOf(author) + 1).padStart(2, "0")}</span>
          {author.profile_picture ? <img
            src={/^https?:\/\//i.test(author.profile_picture) ? author.profile_picture : `${API_BASE_URL}/storage/${String(author.profile_picture).replace(/^\/?(?:storage\/)?/, "")}`}
            alt=""
            className="mx-auto h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg ring-2 ring-blue-100"
          /> : <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-blue-50 text-3xl font-black text-blue-700 shadow-lg ring-2 ring-blue-100">{author.name?.charAt(0)?.toUpperCase()}</div>}

          <h3 className="mt-5 text-xl font-black tracking-tight text-slate-950">
            {author.name}
          </h3>

          <p className="mt-1 text-sm font-medium text-blue-600">@{author.slug}</p>
          <div className="mx-auto mt-6 flex w-full max-w-[180px] items-center justify-center gap-2.5 rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-left shadow-sm shadow-blue-100">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <BookOpen size={15} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-black leading-none text-slate-950">{author.articles_count}</p>
              <span className="text-xs font-semibold text-slate-500">Published articles</span>
            </div>
          </div>

          <Link to={`/authors/${encodeURIComponent(author.slug)}`} className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-slate-950">
            View Profile <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      ))}

    </div>

  </div>
</section>

  <Footer/>
    </>
  );
}

export default Home;
