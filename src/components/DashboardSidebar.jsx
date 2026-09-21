import { NavLink } from "react-router-dom";
import { ArrowUpRight, FileText, LayoutDashboard, PlusCircle, UserRound } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

const getProfileImageUrl = (profilePicture) => {
  if (!profilePicture) return `${API_BASE_URL}/frontend/images/largeimg.jpg`;
  if (/^https?:\/\//i.test(profilePicture)) return profilePicture;
  return `${API_BASE_URL}/storage/${String(profilePicture).replace(/^storage\//i, "")}`;
};

const navigation = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/my-articles", label: "My Articles", icon: FileText },
  { to: "/my-profile", label: "My Profile", icon: UserRound },
];

export default function DashboardSidebar({ user, completionPercent = 0 }) {
  return (
    <aside className="w-full shrink-0 border-b border-slate-200 bg-white shadow-sm lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r" aria-label="Dashboard navigation">
      <div className="border-b border-slate-100 px-5 py-6 sm:px-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Writer workspace</p>
        <div className="mt-5 flex items-center gap-3">
          <img src={getProfileImageUrl(user?.profile_picture)} alt="" className="h-14 w-14 rounded-2xl border border-slate-200 object-cover" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{user?.name || "Writer"}</p>
            <p className="truncate text-xs text-slate-500">{user?.email || "Your account"}</p>
          </div>
        </div>
        <div className="mt-5 rounded-xl bg-slate-50 px-3 py-3">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Profile completion</span>
            <span className="font-bold text-slate-900">{completionPercent}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Profile completion" aria-valuenow={completionPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-indigo-600" style={{ width: `${completionPercent}%` }} />
          </div>
        </div>
      </div>

      <nav className="px-3 py-5 sm:px-5" aria-label="Workspace">
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
        <div className="flex gap-2 overflow-x-auto lg:flex-col">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
              <Icon size={19} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </div>
        <NavLink to="/add-article" className="mt-5 flex items-center justify-between rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          <span className="flex items-center gap-2"><PlusCircle size={19} aria-hidden="true" /> Write an article</span>
          <ArrowUpRight size={17} aria-hidden="true" />
        </NavLink>
      </nav>
    </aside>
  );
}
