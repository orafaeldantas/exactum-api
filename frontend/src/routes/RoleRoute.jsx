import { useContext } from "react"
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"
import Loader from "../components/Loader/Loader";
import { useLocation } from "react-router-dom";



export default function RoleRoute({ children, requiredRole }) {

  const { user, loading, impersonateMode } = useContext(AuthContext)
  const location = useLocation();

  if (loading) {
    return <Loader message="Carregando..." />;
  }

  if (!user) {
    return <Navigate to="/" replace />
  }
  
  if (user?.password_reset === true && location.pathname !== "/reset-password" 
      && user?.role !== "super-admin" && impersonateMode !== true) {
    return <Navigate to="/reset-password" replace />;
  }

  if (requiredRole && !requiredRole?.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }



  return children ? children : <Outlet />;
}