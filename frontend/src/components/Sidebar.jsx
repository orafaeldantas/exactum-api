import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  function isActive(path) {
    return location.pathname === path ? "active" : "";
  }

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.title}>Sistema</h2>

      <nav style={styles.nav}>
        <Link style={{ ...styles.link }} className={isActive("/dashboard")} to="/dashboard">
          Dashboard
        </Link>

        {user?.role === "admin" && (
          <Link style={{ ...styles.link }} className={isActive("/users")} to="/users">
            Usuários
          </Link>
        )}
      </nav>

      <div style={styles.footer}>
        <p style={styles.username}>{user?.username}</p>
        <button style={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    height: "100vh",
    backgroundColor: "#1e1e2f",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "20px",
  },
  title: {
    marginBottom: "30px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
  },
  footer: {
    borderTop: "1px solid #444",
    paddingTop: "15px",
  },
  username: {
    marginBottom: "10px",
  },
  logoutBtn: {
    padding: "8px",
    cursor: "pointer",
  },
};