import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import GlobalLoader from "../components/Loader/GlobalLoader";
import { AuthContext } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <GlobalLoader message="Carregando..." />;

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}
