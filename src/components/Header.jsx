import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import {
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Search,
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
      navigate(`/search?q=${encodeURIComponent(search)}`);
      setSearch("");
    }
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-5">

        {/* Logo */}
        <h1 className="text-3xl font-bold text-blue-600">
          BlogSphere
        </h1>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">

          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>

          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className="hover:text-blue-600"
          >
            About
          </Link>

          <Link
            to="/blog"
            onClick={() => setIsOpen(false)}
            className="hover:text-blue-600"
          >
            Blog
          </Link>

          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="hover:text-blue-600"
          >
            Contact
          </Link>

        </nav>

        {/* Search */}
        <form
  onSubmit={handleSearch}
  className="hidden lg:flex items-center bg-gray-100 rounded-full overflow-hidden border border-gray-200 shadow-sm"
>
  <input
    type="text"
    placeholder="Search articles..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="bg-transparent px-5 py-2 w-64 outline-none"
  />

  <button
    type="submit"
    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full m-1 transition duration-300"
  >
    <Search size={18} />
  </button>
</form>

        {/* Login / Logout */}
        {isLoggedIn ? (
          <div className="relative">
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
          <Link to="/login">
            <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
              Get started
            </button>
          </Link>
        )}

      </div>
    </header>
  );
}

export default Header;
