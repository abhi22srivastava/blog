import Header from "../components/Header";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Pencil,
  Eye,
  Trash2,
} from "lucide-react";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userid = user?.id;
  const token = localStorage.getItem("token");

  const [articles, setArticles] = useState([]);
  const [archivingId, setArchivingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/article/${userid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setArticles(data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

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
        `http://127.0.0.1:8000/api/article/archivearticle/${article.id}`,
        requestOptions
      );

      if (response.status === 404) {
        response = await fetch(
          `http://127.0.0.1:8000/api/article/deletearticle/${article.id}`,
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

  const totalPosts = articles.length;
  const published = articles.filter(
    (a) => a.status === "Published"
  ).length;
  const drafts = articles.filter(
    (a) => a.status !== "Published"
  ).length;

  return (
    <>
      <Header />

      <div className="flex min-h-screen bg-gray-100">

        {/* Sidebar */}

        <div className="w-64 bg-white shadow-lg">

          <div className="p-6 border-b">
       
        <img
  src="http://127.0.0.1:8000/frontend/images/largeimg.jpg"
  alt={user.name}
  className="w-24 h-24 rounded-full object-cover border-4 border-white"
/>

      

            <p className="text-gray-500">
              {user.name}
            </p>

          </div>

          <ul className="mt-5">

            <li>
              <Link
                to="/dashboard"
                className="flex items-center gap-3 p-4 hover:bg-blue-50"
              >
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                to="/add-article"
                className="flex items-center gap-3 p-4 hover:bg-blue-50"
              >
                <PlusCircle size={20} />
                Add Article
              </Link>
            </li>

            <li>
              <Link
                to="/my-articles"
                className="flex items-center gap-3 p-4 hover:bg-blue-50"
              >
                <FileText size={20} />
                My Articles
              </Link>
            </li>

          </ul>

        </div>

        {/* Main */}

        <div className="flex-1 p-8">

          {/* Welcome */}

       

          {/* Stats */}

          <div className="grid md:grid-cols-3 gap-5 mt-8">

            <div className="bg-white rounded-xl shadow p-6">
              <h3>Total Posts</h3>
              <h2 className="text-3xl font-bold">
                {totalPosts}
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3>Published</h3>
              <h2 className="text-3xl font-bold text-green-600">
                {published}
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3>Draft</h3>
              <h2 className="text-3xl font-bold text-yellow-600">
                {drafts}
              </h2>
            </div>

          </div>

          {/* Recent Articles */}

          <div className="bg-white rounded-xl shadow mt-8">

            {actionMessage && (
              <div className="mx-6 mt-6 rounded-lg bg-blue-50 px-4 py-3 text-md text-blue-700">
                {actionMessage}
              </div>
            )}

            <div className="flex justify-between items-center p-6 border-b">

              <h2 className="text-2xl font-bold">
                Recent Articles
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

                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            article.status === "Published"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                      {article.status == 1
                        ? "Published"
                        : article.status == 0
                        ? "Unpublished"
                        : article.status == 2
                        ? "Drafted"
                        : ""}

                        </span>

                      </td>

                      <td className="p-4">

                        <div className="flex justify-center gap-3">

                          <Link
                            to={`/blog/${article.slug || article.id}`}
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
                      colSpan="4"
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

export default Dashboard;
