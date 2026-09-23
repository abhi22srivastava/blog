import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import {
  ChevronDown,
  Bookmark,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Search,
  X,
  UserRound,
} from "lucide-react";

function Header() {
  const isLoggedIn = localStorage.getItem("token");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const userName = user?.name || "My Account";
  const avatar = user?.avatar || user?.image || user?.profile_image;
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();

    if (search.trim()) {
      navigate(`/articles?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">

        {/* Logo */}
        <Link to="/" className="group flex shrink-0 items-center gap-2.5" onClick={() => setIsOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white shadow-lg shadow-blue-100 transition group-hover:bg-blue-600">B<span className="text-cyan-300">S</span></span>
          <span className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Blog<span className="text-blue-600">Sphere</span></span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-1 md:flex">

          <Link to="/" className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700">
            Home
          </Link>

          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
          >
            About
          </Link>

          <Link
            to="/articles"
            onClick={() => setIsOpen(false)}
            className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
          >
            Articles
          </Link>

          <Link
            to="/authors"
            onClick={() => setIsOpen(false)}
            className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
          >
            Authors
          </Link>

          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
          >
            Contact
          </Link>

        </nav>

        {/* Search */}
        <form
  onSubmit={handleSearch}
  className="hidden items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 lg:flex"
>
  <input
    type="text"
    placeholder="Search articles..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-56 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-slate-400"
  />

  <button
    type="submit"
    aria-label="Search articles"
    className="m-1 rounded-lg bg-blue-600 p-2.5 text-white transition duration-300 hover:bg-blue-700"
  >
    <Search size={18} />
  </button>
</form>

        {/* Login / Logout */}
        {isLoggedIn ? (
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
              aria-expanded={isAccountMenuOpen}
              aria-haspopup="menu"
            >
              {avatar ? (
                <img src={avatar} alt={userName} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {initials || <UserRound size={16} />}
                </span>
              )}
              <span className="hidden max-w-28 truncate sm:block">{userName}</span>
              <ChevronDown size={16} className={`transition ${isAccountMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isAccountMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl" role="menu">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="font-semibold text-slate-900">{userName}</p>
                  {user?.email && <p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p>}
                </div>
                <Link to="/dashboard" onClick={() => setIsAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700" role="menuitem">
                  <LayoutDashboard size={17} /> Dashboard
                </Link>
                <Link to="/my-profile" onClick={() => setIsAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700" role="menuitem">
                  <UserRound size={17} /> My Profile
                </Link>
                <Link to="/my-articles" onClick={() => setIsAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700" role="menuitem">
                  <FileText size={17} /> My Articles
                </Link>
                <Link to="/bookmarks" onClick={() => setIsAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700" role="menuitem">
                  <Bookmark size={17} /> Bookmarks
                </Link>
                <Link to="/add-article" onClick={() => setIsAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700" role="menuitem">
                  <PlusCircle size={17} /> Add Article
                </Link>
                <div className="my-2 border-t border-slate-100" />
                <button type="button" onClick={logout} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50" role="menuitem">
                  <LogOut size={17} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="hidden rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:bg-blue-600 sm:block">
            Start writing
          </Link>
        )}

        <button type="button" onClick={() => setIsOpen((open) => !open)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 md:hidden" aria-label={isOpen ? "Close menu" : "Open menu"} aria-expanded={isOpen}>
          {isOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

      </div>

      {isOpen && <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 md:hidden">
        <nav className="space-y-1">
          {[['/', 'Home'], ['/about', 'About'], ['/articles', 'Articles'], ['/authors', 'Authors'], ['/contact', 'Contact']].map(([to, label]) => <Link key={to} to={to} onClick={() => setIsOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700">{label}</Link>)}
        </nav>
        <form onSubmit={handleSearch} className="mt-3 flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
          <input type="text" placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none" />
          <button type="submit" aria-label="Search articles" className="rounded-lg bg-blue-600 p-2.5 text-white"><Search size={17} /></button>
        </form>
        {!isLoggedIn && <Link to="/login" onClick={() => setIsOpen(false)} className="mt-3 block rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white">Start writing</Link>}
      </div>}
    </header>
  );
}

export default Header;
