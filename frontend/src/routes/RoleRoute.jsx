import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

export default function RoleRoute({ children, requiredRole }) {

  const { user, loading, token } = useContext(AuthContext)

  if (loading) {
    return <p>Carregando...</p>
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}