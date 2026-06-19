import { Link } from "react-router-dom";
function Header(){
     return (
      <>
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">MyBlog</h1>
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
          </ul>
        </div>
      </nav>
      </>
     )
}
export default Header;