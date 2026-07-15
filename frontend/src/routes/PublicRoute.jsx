import { useContext } from "react"
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"
import GlobalLoader from "../components/Loader/GlobalLoader";

export default function PublicRoute({ children }) {

    const { user, loading } = useContext(AuthContext);

    if (loading) return <GlobalLoader message="Carregando..." />;

    if (user) return <Navigate to="/dashboard" replace />;

    return children ? children : <Outlet />;
  }