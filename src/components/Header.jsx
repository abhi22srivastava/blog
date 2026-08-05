import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import { Search } from "lucide-react";

function Header() {
  const isLoggedIn = localStorage.getItem("token");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

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
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            onClick={logout}
          >
            Logout
          </button>
        ) : (
          <Link to="/login">
            <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
              Login
            </button>
          </Link>
        )}

      </div>
    </header>
  );
}

export default Header;