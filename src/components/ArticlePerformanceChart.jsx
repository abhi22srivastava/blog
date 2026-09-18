import { BarChart3, Clock3, Eye } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Temporary sample data until the article analytics table is available.
const SAMPLE_ARTICLES = [
  { title: "React Basics", views: 1250, view_time_minutes: 320 },
  { title: "JavaScript Tips", views: 980, view_time_minutes: 245 },
  { title: "CSS Layouts", views: 1640, view_time_minutes: 410 },
  { title: "Web Design", views: 1120, view_time_minutes: 290 },
  { title: "API Integration", views: 2100, view_time_minutes: 560 },
  { title: "React Hooks", views: 1780, view_time_minutes: 475 },
];

function metric(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function ArticleTooltip({ active, payload }) {
  const article = payload?.[0]?.payload;
  if (!active || !article) return null;

  return (
    <div className="max-w-xs rounded-xl border border-indigo-100 bg-white p-4 shadow-xl">
      <p className="mb-3 break-words font-semibold text-slate-800">{article.title}</p>
      <p className="text-sm text-indigo-700">Views: {article.views?.toLocaleString() ?? "Not available"}</p>
      <p className="mt-1 text-sm text-teal-700">
        View time: {article.viewTime == null ? "Not available" : `${article.viewTime.toLocaleString()} min`}
      </p>
    </div>
  );
}

export default function ArticlePerformanceChart({ articles = SAMPLE_ARTICLES }) {
  const data = articles.map((article) => ({
    title: article.title || "Untitled article",
    views: metric(article.views_count ?? article.views),
    // Explicit minute values take priority; view_time is expected in minutes.
    viewTime: metric(article.view_time_minutes ?? article.view_time),
  }));
  const hasMetrics = data.some((article) => article.views != null || article.viewTime != null);
  const hasMissingMetrics = data.some((article) => article.views == null || article.viewTime == null);

  return (
    <section aria-labelledby="article-performance-title" className="mt-8 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-teal-50 p-6">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-indigo-600 p-3 text-white"><BarChart3 size={24} aria-hidden="true" /></span>
          <div>
            <h2 id="article-performance-title" className="text-xl font-bold text-slate-900">Article Performance</h2>
            <p className="mt-1 text-sm text-slate-600">Views and time spent viewing each article</p>
            {articles === SAMPLE_ARTICLES && <span className="mt-2 inline-block rounded-full bg-white px-2 py-1 text-xs font-medium text-indigo-600">Sample data</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-medium">
          <span className="flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-2 text-indigo-700"><Eye size={16} aria-hidden="true" /> Views</span>
          <span className="flex items-center gap-2 rounded-full bg-teal-100 px-3 py-2 text-teal-700"><Clock3 size={16} aria-hidden="true" /> View time (min)</span>
        </div>
      </div>

      {hasMetrics ? (
        <div className="p-4 sm:p-6">
          <div className="mb-3 flex justify-between gap-4 text-xs font-semibold">
            <span className="text-indigo-700">Number of views</span>
            <span className="text-teal-700">View time · minutes</span>
          </div>
          <div className="overflow-x-auto" role="region" aria-label="Article views and view time chart; scroll horizontally for more articles" tabIndex={0}>
            <div style={{ width: "100%", minWidth: Math.max(560, data.length * 120), height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 12, bottom: 20, left: 0 }} accessibilityLayer>
                  <defs>
                    <linearGradient id="article-views-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="title" interval={0} tickLine={false} axisLine={false} height={65} tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={14} tickFormatter={(title) => title.length > 16 ? `${title.slice(0, 16)}…` : title} />
                  <YAxis yAxisId="views" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#6366f1", fontSize: 12 }} width={50} />
                  <YAxis yAxisId="time" orientation="right" tickLine={false} axisLine={false} tick={{ fill: "#0d9488", fontSize: 12 }} width={50} />
                  <Tooltip content={<ArticleTooltip />} cursor={{ fill: "#eef2ff", fillOpacity: 0.6 }} />
                  <Bar yAxisId="views" dataKey="views" name="Views" fill="url(#article-views-gradient)" radius={[8, 8, 0, 0]} maxBarSize={48} />
                  <Line yAxisId="time" dataKey="viewTime" name="View time" type="monotone" stroke="#0d9488" strokeWidth={3} dot={{ r: 5, fill: "#14b8a6", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7 }} connectNulls={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          {hasMissingMetrics && <p className="mt-2 text-xs text-slate-500">Some articles do not have view or view-time data yet. Missing values are left blank.</p>}
        </div>
      ) : (
        <div className="px-6 py-16 text-center">
          <BarChart3 className="mx-auto mb-4 text-indigo-300" size={40} aria-hidden="true" />
          <p className="font-semibold text-slate-700">{articles.length ? "Article analytics are not available yet" : "Your article performance starts here"}</p>
          <p className="mt-2 text-sm text-slate-500">{articles.length ? "Views and view time will appear when analytics data is available." : "Add an article to start tracking its views and view time."}</p>
        </div>
      )}
    </section>
  );
}
