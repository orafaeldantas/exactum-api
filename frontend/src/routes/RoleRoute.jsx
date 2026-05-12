import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import Loader from "../components/Loader/Loader";

export default function RoleRoute({ children, requiredRole }) {

  const { user, loading } = useContext(AuthContext)


  if (loading) {
    return <Loader message="Carregando..." />;
  }

  if (!user) {
    return <Navigate to="/" replace />
  }
  
  if (user?.password_reset === true && window.location.pathname !== "/reset-password") {
    return <Navigate to="/reset-password" replace />;
  }

  if (requiredRole && !requiredRole?.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }



  return children
}