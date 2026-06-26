import { useState } from "react";
import { Link } from "react-router-dom";
import { logout } from "../utils/auth";

function Header() {
  const isLoggedIn = localStorage.getItem("token");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-blue-600">
          <Link to="/">MyBlog</Link>
        </h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-6">
          <li>
            <Link to="/" className="hover:text-blue-600">
              Home
            </Link>
          </li>

          <li>
            <Link to="/about" className="hover:text-blue-600">
              About
            </Link>
          </li>

          <li>
            <Link to="/blog" className="hover:text-blue-600">
              Blog
            </Link>
          </li>

          <li>
            <Link to="/contact" className="hover:text-blue-600">
              Contact
            </Link>
          </li>

          {isLoggedIn ? (
            <li>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </li>
          ) : (
            <li>
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Login
              </Link>
            </li>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <ul className="flex flex-col p-4 space-y-4">
            <li>
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="block hover:text-blue-600"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                to="/about"
                onClick={() => setIsOpen(false)}
                className="block hover:text-blue-600"
              >
                About
              </Link>
            </li>

            <li>
              <Link
                to="/blog"
                onClick={() => setIsOpen(false)}
                className="block hover:text-blue-600"
              >
                Blog
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="block hover:text-blue-600"
              >
                Contact
              </Link>
            </li>

            {isLoggedIn ? (
              <li>
                <button
                  onClick={logout}
                  className="w-full bg-red-500 text-white py-2 rounded-lg"
                >
                  Logout
                </button>
              </li>
            ) : (
              <li>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center bg-blue-600 text-white py-2 rounded-lg"
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Header;