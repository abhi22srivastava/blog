import Header from "../components/Header";
import { useState, useEffect } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import ArticlePerformanceChart from "../components/ArticlePerformanceChart";
import {
  FileText,
  CircleCheck,
  Hourglass,
  Clock3,
  Users,
  CheckCircle2,
  BadgeCheck,
  UserMinus,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

function Dashboard() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const [user, setUser] = useState(storedUser || {});
  const userid = user?.id;
  const token = localStorage.getItem("token");

  const [articles, setArticles] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    fetchArticles();
    fetchFollowing();
  }, [userid]);

  const fetchFollowing = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/following`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
      if (response.ok) setFollowing((await response.json()).data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const unfollow = async (slug) => {
    const response = await fetch(`${API_BASE_URL}/api/authors/${encodeURIComponent(slug)}/follow`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ following: false }),
    });
    if (response.ok) setFollowing((authors) => authors.filter((author) => author.slug !== slug));
  };

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

      if (response.ok) {
        setArticles(data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const completionPercent = (() => {
    const fields = [user?.name, user?.email, user?.phone, user?.address, user?.bio, user?.profile_picture];
    const filled = fields.filter((value) => value && String(value).trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  })();
  const profileStatus = completionPercent === 100
    ? "Complete"
    : completionPercent > 0
      ? "In progress"
      : "Not started";

  const totalPosts = articles.length;
  const published = articles.filter((article) => String(article.status) === '1').length;
  const pending = articles.filter((article) => String(article.status) === '0').length;
  const sumMetric = (fields) => {
    if (!articles.length) return 0;
    const values = articles.map((article) =>
      fields.map((field) => article[field]).find((value) => value != null)
    );
    return values.every((value) => value !== undefined && Number.isFinite(Number(value)))
      ? values.reduce((total, value) => total + Number(value), 0)
      : null;
  };
  const totalReaders = sumMetric(["views_count", "views"]);
  const totalReadTime = sumMetric(["view_time_minutes", "reading_time", "read_time"]);
  const totalFollowers = user?.followers_count ?? user?.total_followers ?? null;
  const formatCount = (value) => value == null ? "—" : Number(value).toLocaleString();
  const stats = [
    { label: "Total Posts", value: formatCount(totalPosts), icon: FileText, colors: "from-blue-50 to-indigo-100 border-blue-200 text-blue-950", iconColors: "bg-blue-600 text-white" },
    { label: "Published Posts", value: formatCount(published), icon: CircleCheck, colors: "from-emerald-50 to-teal-100 border-emerald-200 text-emerald-950", iconColors: "bg-emerald-600 text-white" },
    { label: "Pending Posts", value: formatCount(pending), icon: Hourglass, colors: "from-amber-50 to-orange-100 border-amber-200 text-amber-950", iconColors: "bg-amber-600 text-white" },
    { label: "Total Read Time", value: totalReadTime == null ? "—" : `${formatCount(totalReadTime)} min`, icon: Clock3, colors: "from-rose-50 to-pink-100 border-rose-200 text-rose-950", iconColors: "bg-rose-600 text-white" },
    { label: "Total Users Reading", value: formatCount(totalReaders), icon: Users, colors: "from-cyan-50 to-sky-100 border-cyan-200 text-cyan-950", iconColors: "bg-cyan-600 text-white" },
    { label: "Total Followers", value: formatCount(totalFollowers), icon: Users, colors: "from-red-50 to-red-100 border-red-200 text-red-950", iconColors: "bg-red-500 text-white", shadow: "shadow-lg shadow-red-200/40" },
  ];

  return (
    <>
      <Header />

      <div className="flex min-h-screen flex-col bg-gray-100 lg:flex-row">
        <DashboardSidebar user={user} completionPercent={completionPercent} />

        <div className="min-w-0 flex-1 p-4 sm:p-8">
          <div className="mb-8 rounded-3xl border border-sky-100 bg-linear-to-r from-sky-50 via-indigo-50 to-violet-50 p-6 text-slate-900 shadow-xl shadow-indigo-100/60">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Welcome back, {user?.name || "Writer"}</h2>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                  <BadgeCheck size={15} aria-hidden="true" /> Professional
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-sm">
                <div
                  className="relative flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: `conic-gradient(#10b981 ${completionPercent}%, #e2e8f0 ${completionPercent}% 100%)` }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-extrabold text-slate-800">
                    {completionPercent}%
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Profile completion</div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                    <CheckCircle2 size={16} />
                    {profileStatus}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-white/80">
              <div className="h-full rounded-full bg-linear-to-r from-emerald-400 via-cyan-400 to-indigo-500" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-5 mt-8 md:grid-cols-2 xl:grid-cols-3">
            {stats.map(({ label, value, icon: Icon, colors, iconColors, shadow = "shadow-sm" }) => (
              <div key={label} className={`rounded-2xl border bg-linear-to-br p-6 ${shadow} ${colors}`}>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-sm font-semibold">{label}</dt>
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${iconColors}`}>
                    <Icon size={22} aria-hidden="true" />
                  </span>
                </div>
                <dd className="mt-4 text-3xl font-bold tracking-tight tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>

          <ArticlePerformanceChart articles={articles} />

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="following-heading">
            <div className="flex items-center justify-between gap-4"><div><h2 id="following-heading" className="text-xl font-bold text-slate-900">Authors you follow</h2><p className="mt-1 text-sm text-slate-500">Manage the writers in your reading list.</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">{following.length}</span></div>
            {following.length ? <div className="mt-5 divide-y divide-slate-100">{following.map((author) => <div key={author.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{author.name}</p><p className="truncate text-sm text-slate-500">@{author.slug}</p></div><button type="button" onClick={() => unfollow(author.slug)} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:text-red-600"><UserMinus size={16} aria-hidden="true" />Unfollow</button></div>)}</div> : <p className="mt-5 text-sm text-slate-500">You are not following any authors yet.</p>}
          </section>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
