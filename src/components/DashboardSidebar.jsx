import { Link } from "react-router-dom";
import { LayoutDashboard, PlusCircle, FileText } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export default function DashboardSidebar({ user }) {
  return (
<div className="w-64 bg-white shadow-lg">

          <div className="p-6 border-b">
       
        <img
  src={`${API_BASE_URL}/frontend/images/largeimg.jpg`}
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
  );
}
