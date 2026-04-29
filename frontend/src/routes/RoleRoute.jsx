import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

export default function RoleRoute({ children, requiredRole }) {

  const { user, loading } = useContext(AuthContext)


  if (loading) {
    return <p></p>
  }

  if (!user) {
    return <Navigate to="/" replace />
  }
  
  if (user?.password_reset === true && window.location.pathname !== "/reset-password") {
    return <Navigate to="/reset-password" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }



  return children
}