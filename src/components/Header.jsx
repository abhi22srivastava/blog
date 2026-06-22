import { Link } from "react-router-dom";
import { logout } from "../utils/auth";
function Header(){
    const isLoggedIn = localStorage.getItem("token");
    

     return (
      <>
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600"> <Link to="/">MyBlog</Link></h1>
          <ul className="flex gap-6">
            <li>
               <Link to="/">Home</Link>
            </li>
           
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>

            <li>
               <Link to="/contact">Contact</Link>
            </li>
           
            

            {isLoggedIn ? (
              <li>
                <a
          onClick={logout}
          className="bg-red-500 px-4 py-2 rounded hover:bg-sky-700"
        >
          Logout
        </a>
              </li>
) : (
   <li>
               <Link to="/login">Login</Link>
            </li>
)}




          </ul>
        </div>
      </nav>
      </>
     )
}
export default Header;