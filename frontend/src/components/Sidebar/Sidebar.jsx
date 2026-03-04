import "./Sidebar.css";
import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Sistema</h2>

      <nav className="sidebar-nav">
        <Link
          to="/dashboard"
          className={location.pathname === "/dashboard" ? "active" : ""}
        >
          Dashboard
        </Link>

        {user?.role === "admin" && (
          <Link
            to="/users"
            className={location.pathname === "/users" ? "active" : ""}
          >
            Usuários
          </Link>
        )}
      </nav>

      <div className="sidebar-footer">
        <p>{user?.username}</p>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}