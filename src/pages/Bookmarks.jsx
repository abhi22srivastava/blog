import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Bookmark } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config/api";
import { articlePath } from "../utils/articlePath";

export default function Bookmarks() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/bookmarks`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, Accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load bookmarks. Please try again.");
        const result = await response.json();
        setArticles(Array.isArray(result.data) ? result.data : []);
      } catch (loadError) {
        if (loadError.name !== "AbortError") setError(loadError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-[70vh] bg-slate-50 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><Bookmark size={24} aria-hidden="true" /></span>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Bookmarks</h1>
              <p className="mt-1 text-sm text-slate-500">Articles you saved to read again.</p>
            </div>
          </div>

          {loading ? <p role="status" className="text-slate-600">Loading bookmarks...</p> : error ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</p>
          ) : articles.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {articles.map((article) => (
                <Link key={article.id} to={articlePath(article)} className="group flex min-h-36 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                  <h2 className="line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-blue-700">{article.title}</h2>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">Read article <ArrowUpRight size={16} aria-hidden="true" /></span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <Bookmark size={30} className="mx-auto text-slate-400" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-bold text-slate-900">No bookmarks yet</h2>
              <p className="mt-2 text-sm text-slate-500">Save an article to find it here later.</p>
              <Link to="/blog" className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Browse articles</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
