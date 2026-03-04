import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <strong>Exactum</strong>
      </div>

      <div className="navbar-right">
        {user && (
          <>
            <span className="navbar-role">
              {user.role === "admin" ? "👑 Admin" : "👤 Usuário"}
            </span>

            <button onClick={handleLogout} className="navbar-button">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;