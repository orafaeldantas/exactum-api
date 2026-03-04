import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Carregando...</p>;

  if (!user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}