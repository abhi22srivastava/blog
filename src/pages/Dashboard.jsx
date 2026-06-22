import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
     localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
       <Header/>
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-4 flex justify-between">
        <h1 className="text-2xl font-bold">
          Dashboard
        </h1>

    
      </div>

      <div className="p-8">
        <h2 className="text-3xl font-bold">
          Welcome to Dashboard
        </h2>

        <p className="mt-3 text-gray-600">
          Login successful.
        </p>
      </div>
    </div>
    </>
  );
}

export default Dashboard;