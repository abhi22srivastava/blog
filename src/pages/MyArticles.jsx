import Header from "../components/Header";
import DashboardSidebar from "../components/DashboardSidebar";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { articlePath } from "../utils/articlePath";
import { calculateProfileCompletion } from "../utils/profileCompletion";
import {
  Clock3,
  Pencil,
  Eye,
  Trash2,
  CircleCheck,
  Hourglass,
  Archive,
  CircleHelp,
} from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function formatMetric(value) {
  if (value == null || String(value).trim() === "" || !Number.isFinite(Number(value)) || Number(value) < 0) return "Not available";
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 1 });
}

function ArticleStatus({ status }) {
  const { icon: Icon, label, color } = {
    "1": { icon: CircleCheck, label: "Published", color: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
    "0": { icon: Hourglass, label: "Draft", color: "bg-amber-50 text-amber-600 ring-amber-100" },
    "2": { icon: Archive, label: "Deactivated", color: "bg-slate-100 text-slate-500 ring-slate-200" },
  }[String(status)] || { icon: CircleHelp, label: "Unknown status", color: "bg-slate-100 text-slate-500 ring-slate-200" };

  return (
    <span title={label} role="img" aria-label={label} className={`inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ${color}`}>
      <Icon size={18} aria-hidden="true" />
    </span>
  );
}

function MyArticles() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userid = user?.id;
  const token = localStorage.getItem("token");
  const completionPercent = calculateProfileCompletion(user);

  const [articles, setArticles] = useState([]);
  const [archivingId, setArchivingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
  const fetchArticles = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/article/${userid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && !cancelled) {
        setArticles(data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };
    fetchArticles();
    return () => { cancelled = true; };
  }, [userid, token]);

  const handleArchive = async (article) => {
    const shouldArchive = window.confirm(
      `Archive “${article.title}”? It will no longer appear in your active articles.`
    );

    if (!shouldArchive) return;

    setArchivingId(article.id);
    setActionMessage("");

    try {
      const requestOptions = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userid }),
      };

      // Support the archive action and the legacy delete action, where delete means archive.
      let response = await fetch(
        `${API_BASE_URL}/api/article/archivearticle/${article.id}`,
        requestOptions
      );

      if (response.status === 404) {
        response = await fetch(
          `${API_BASE_URL}/api/article/deletearticle/${article.id}`,
          requestOptions
        );
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Unable to archive the article.");
      }

      setArticles((currentArticles) =>
        currentArticles.filter((item) => item.id !== article.id)
      );
      setActionMessage("Article archived successfully.");
    } catch (error) {
      setActionMessage(error.message || "Unable to archive the article.");
    } finally {
      setArchivingId(null);
    }
  };

  return (
    <>
      <Header />

      <div className="flex min-h-screen flex-col bg-gray-100 lg:flex-row">

        <DashboardSidebar user={user} completionPercent={completionPercent} />

        {/* Main */}

        <div className="min-w-0 flex-1 p-4 sm:p-8">

          {/* My Articles */}

          <div className="overflow-x-auto bg-white rounded-xl shadow mt-8">

            {actionMessage && (
              <div className="mx-6 mt-6 rounded-lg bg-blue-50 px-4 py-3 text-md text-blue-700">
                {actionMessage}
              </div>
            )}

            <div className="flex justify-between items-center p-6 border-b">

              <h2 className="text-2xl font-bold">
                My Articles
              </h2>

              <Link
                to="/add-article"
                className="bg-blue-600 text-white px-5 py-2 rounded"
              >
                Add Article
              </Link>

            </div>

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="p-4 text-left">
                    Title
                  </th>
                  <th scope="col" className="p-4 text-left">Categories</th>
                  <th scope="col" className="whitespace-nowrap p-4 text-left">Article views</th>
                  <th scope="col" className="whitespace-nowrap p-4 text-left" title="Total time spent by all readers">Total reading time</th>

                  <th className="p-4 text-left">
                    Date
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                  <th className="p-4 text-center">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {articles.length > 0 ? (
                  articles.map((article) => (
                    <tr
                      key={article.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-4">
                        {article.title}
                      </td>
                      <td className="p-4">
                        <div className="flex min-w-36 flex-wrap gap-1.5">
                          {article.category_names?.length ? article.category_names.map((name) => (
                            <span key={name} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{name}</span>
                          )) : <span className="text-sm text-slate-400">Uncategorized</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold tabular-nums text-blue-700">
                          <Eye size={16} aria-hidden="true" />{formatMetric(article.views_count ?? article.views)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold tabular-nums text-teal-700">
                          <Clock3 size={16} aria-hidden="true" />
                          {formatMetric(article.view_time_minutes)}{formatMetric(article.view_time_minutes) !== "Not available" ? " min" : ""}
                        </span>
                      </td>

                          <td className="p-4">
                            {new Date(article.created_at).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>

                      <td className="p-4">

                        <ArticleStatus status={article.status} />

                      </td>

                      <td className="p-4">

                        <div className="flex justify-center gap-3">

                          <Link
                            to={articlePath(article)}
                            className="text-blue-600"
                            aria-label={`View ${article.title}`}
                          >
                            <Eye size={18} />
                          </Link>

                          <Link
                            to={`/edit-article/${article.id}`}
                            state={{ article }}
                            className="text-indigo-600"
                            aria-label={`Edit ${article.title}`}
                          >
                            <Pencil size={18} />
                          </Link>

                         

                          <button
                            type="button"
                            onClick={() => handleArchive(article)}
                            disabled={archivingId === article.id}
                            aria-label={`Archive ${article.title}`}
                            className="text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {archivingId === article.id ? "Archiving..." : <Trash2 size={18} />}
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>

                    <td
                      colSpan="7"
                      className="text-center p-8"
                    >
                      No Articles Found
                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </>
  );
}

export default MyArticles;
