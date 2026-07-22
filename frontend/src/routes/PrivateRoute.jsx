import { useContext, useEffect } from "react";
import toast from "react-hot-toast";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import GlobalLoader from "../components/Loader/GlobalLoader";
import { AuthContext } from "../context/AuthContext";
import { SuperAdminContext } from "../context/SuperAdminContext";

export default function PrivateRoute({ children, requiredRole }) {
  const { user, loading, impersonateMode, permissions, clearLocalSession } =
    useContext(AuthContext);
  const { superAdmin } = useContext(SuperAdminContext);
  const location = useLocation();

  useEffect(() => {
    const handleSessionExpired = () => {
      toast.dismiss();
      toast.error("Sua sessão expirou. Faça login novamente.");

      if (clearLocalSession) {
        clearLocalSession();
      }
      //navigate("/login", { replace: true });
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  if (loading) {
    return <GlobalLoader message="Carregando..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    user?.password_reset === true &&
    location.pathname !== "/reset-password" &&
    !superAdmin &&
    impersonateMode !== true
  ) {
    return <Navigate to="/reset-password" replace />;
  }

  if (requiredRole && !permissions.includes(requiredRole)) {
    if (superAdmin) return <Navigate to="/platform/dashboard" replace />;

    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}
