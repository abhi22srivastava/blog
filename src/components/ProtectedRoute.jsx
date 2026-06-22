import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
 // const isLoggedIn = localStorage.getItem("isLoggedIn");
  const token = localStorage.getItem("token");


  return token  ? children : <Navigate to="/login" />;



}

export default ProtectedRoute;