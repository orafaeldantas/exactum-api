import { useContext } from "react"
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"
import GlobalLoader from "../components/Loader/GlobalLoader";
import { useLocation } from "react-router-dom";
import { SuperAdminContext } from "../context/SuperAdminContext";



export default function RoleRoute({ children, requiredRole }) {

  const { user, loading, impersonateMode, permissions } = useContext(AuthContext)
  const { superAdmin } = useContext(SuperAdminContext)
  const location = useLocation();

  if (loading) {
    return <GlobalLoader message="Carregando..." />;
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  
  if (user?.password_reset === true && location.pathname !== "/reset-password" 
      && !superAdmin && impersonateMode !== true) {
    return <Navigate to="/reset-password" replace />;
  }

  if (requiredRole && !permissions.includes(requiredRole)) { 

    if (superAdmin) return <Navigate to="/platform/dashboard" replace />

    return <Navigate to="/dashboard" replace />
  }





  return children ? children : <Outlet />;
}