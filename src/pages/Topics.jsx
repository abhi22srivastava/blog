import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, Hash, Search, Sparkles, Users, UserRound, UserPlus, Check } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config/api";

const palettes = [
  "from-blue-600 to-indigo-700",
  "from-violet-600 to-fuchsia-700",
  "from-emerald-600 to-teal-700",
  "from-orange-500 to-rose-600",
  "from-cyan-600 to-blue-700",
];

function TopicCard({ topic, index }) {
  const token = localStorage.getItem("token");
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(Number(topic.followers_count || 0));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const slug = topic.slug || String(topic.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const endpoint = `${API_BASE_URL}/api/topics/${encodeURIComponent(slug)}/follow`;

  useEffect(() => {
    if (!token) return;
    let active = true;
    fetch(endpoint, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "Unable to load follow status.");
        if (active) {
          setFollowing(Boolean(result.data?.following));
          setFollowers(Number(result.data?.followers_count ?? topic.followers_count ?? 0));
        }
      })
      .catch((error) => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [endpoint, token, topic.followers_count]);

  async function toggleFollow() {
    if (!token || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ following: !following }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Unable to update follow status.");
      setFollowing(Boolean(result.data.following));
      setFollowers(Number(result.data.followers_count || 0));
    } catch (error) {
      setMessage(error.message || "Unable to update follow status.");
    } finally {
      setBusy(false);
    }
  }

  return <article className="group flex min-h-[290px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/60">
    <div className={`relative flex h-28 items-end overflow-hidden bg-gradient-to-br ${palettes[index % palettes.length]} p-6`}>
      <div className="absolute -right-5 -top-12 h-40 w-40 rounded-full border-[24px] border-white/10" />
      <div className="absolute right-10 top-5 h-16 w-16 rounded-2xl border border-white/20 bg-white/10 rotate-12" />
      <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white backdrop-blur"><Hash size={24} /></span>
      <span className="relative ml-auto rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">Topic</span>
    </div>
    <div className="flex flex-1 flex-col p-6">
      <h2 className="text-xl font-bold tracking-tight text-slate-900">{topic.name}</h2>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">Discover thoughtful stories and writers exploring {topic.name.toLowerCase()}.</p>
      <div className="mt-5 grid grid-cols-3 gap-2 border-y border-slate-100 py-4">
        <div><p className="flex items-center gap-1.5 text-lg font-bold text-slate-900"><Users size={15} className="text-indigo-500" />{followers.toLocaleString()}</p><p className="mt-1 text-[11px] font-medium text-slate-500">Followers</p></div>
        <div><p className="flex items-center gap-1.5 text-lg font-bold text-slate-900"><BookOpen size={15} className="text-indigo-500" />{Number(topic.stories_count || 0).toLocaleString()}</p><p className="mt-1 text-[11px] font-medium text-slate-500">Stories</p></div>
        <div><p className="flex items-center gap-1.5 text-lg font-bold text-slate-900"><UserRound size={15} className="text-indigo-500" />{Number(topic.writers_count || 0).toLocaleString()}</p><p className="mt-1 text-[11px] font-medium text-slate-500">Writers</p></div>
      </div>
      {message && <p role="status" className="mt-2 text-xs text-rose-600">{message}</p>}
      <div className="mt-auto flex items-center gap-3 pt-4">
        {token ? <button type="button" onClick={toggleFollow} disabled={busy} aria-pressed={following} className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:opacity-60 ${following ? "border border-slate-200 bg-slate-50 text-slate-700 hover:border-rose-200 hover:text-rose-600" : "bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700"}`}>
          {following ? <Check size={17} /> : <UserPlus size={17} />}{busy ? "Saving..." : following ? "Following" : "Follow topic"}
        </button> : <Link to="/login" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"><UserPlus size={17} />Sign in to follow</Link>}
        <Link aria-label={`Explore ${topic.name} stories`} to={`/topics/${encodeURIComponent(slug)}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"><ArrowUpRight size={19} /></Link>
      </div>
    </div>
  </article>;
}

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/topics`, { signal: controller.signal, headers: { Accept: "application/json" } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load topics.");
        setTopics(Array.isArray(result.data) ? result.data : []);
      })
      .catch((requestError) => { if (requestError.name !== "AbortError") setError(requestError.message || "Unable to load topics."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const filteredTopics = useMemo(() => topics.filter((topic) => topic.name.toLowerCase().includes(query.trim().toLowerCase())), [topics, query]);

  return <>
    <Header />
    <main className="min-h-screen bg-[#f7f8fc]">
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.35),_transparent_55%)]" />
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-indigo-200"><Sparkles size={14} /> Ideas worth exploring</span><h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Find your next <span className="text-indigo-300">favorite topic.</span></h1><p className="mt-4 max-w-xl text-base leading-7 text-slate-300">Follow the subjects you care about and discover new stories from writers across the community.</p></div>
          <label className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 text-slate-300 backdrop-blur focus-within:border-indigo-300"><Search size={19} /><span className="sr-only">Search topics</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search topics..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400" /></label>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">The community</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Explore topics</h2></div><p className="text-sm font-medium text-slate-500">{topics.length} {topics.length === 1 ? "topic" : "topics"}</p></div>
        {loading && <div role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">Loading topics...</div>}
        {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-white p-8 text-rose-700">{error}</div>}
        {!loading && !error && filteredTopics.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">{query ? "No topics match your search." : "Topics will appear here as they are added."}</div>}
        {!loading && !error && filteredTopics.length > 0 && <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filteredTopics.map((topic, index) => <TopicCard key={topic.id} topic={topic} index={index} />)}</div>}
      </section>
    </main>
    <Footer />
  </>;
}
