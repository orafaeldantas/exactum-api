import { Outlet, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PrivateRoutes() {
  const { token } = AuthContext();

  if (!token) {
    return <Navigate to="/create-tenant" />;
  }

  return <Outlet />;
}