import { useEffect, useState } from "react";
import { ArrowUpRight, Users, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config/api";

const imageUrl = (path) => !path ? null : /^https?:\/\//i.test(path)
  ? path
  : `${API_BASE_URL}/storage/${String(path).replace(/^\/?(?:storage\/)?/, "")}`;

export default function Authors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/top-authors`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load authors.");
        setAuthors(Array.isArray(result.data) ? result.data : []);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return <>
    <Header />
    <main className="min-h-[70vh] bg-slate-50 pb-20">
      <section className="border-b border-slate-200 bg-slate-950 px-4 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">The people behind the stories</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Meet our authors</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">Explore the writers shaping thoughtful conversations across technology, business, and everyday life.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        {loading && <p role="status" className="text-slate-500">Loading authors...</p>}
        {error && <p role="alert" className="rounded-2xl border border-red-200 bg-white p-6 text-red-700">{error}</p>}
        {!loading && !error && !authors.length && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">No authors with published articles yet.</p>}
        {!loading && !error && authors.length > 0 && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {authors.map((author) => <article key={author.id} className="group flex min-h-87.5 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
            <div className="flex items-center gap-4">
              {imageUrl(author.profile_picture) ? <img src={imageUrl(author.profile_picture)} alt="" className="h-20 w-20 rounded-2xl object-cover shadow-md ring-4 ring-blue-50" /> : <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-4 ring-blue-50"><UserRound size={34} aria-hidden="true" /></div>}
              <div className="min-w-0"><h2 className="truncate text-xl font-black text-slate-950">{author.name}</h2><p className="truncate text-sm text-slate-500">@{author.slug}</p></div>
            </div>
            <p className="mt-6 min-h-12 text-sm font-semibold leading-6 text-blue-700">{author.expertise || "Writer and storyteller"}</p>
            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5 text-slate-600"><Users size={18} className="text-blue-600" aria-hidden="true" /><span className="text-sm font-semibold">{Number(author.followers_count || 0).toLocaleString()} followers</span></div>
            <Link to={`/authors/${encodeURIComponent(author.slug)}`} className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-slate-950">View Profile <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </article>)}
        </div>}
      </section>
    </main>
    <Footer />
  </>;
}