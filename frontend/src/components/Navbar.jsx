import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/")
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <strong>Exactum</strong>
      </div>

      <div style={styles.right}>
        {user && (
          <>
            <span>
              {user.is_admin ? "👑 Admin" : "👤 Usuário"}
            </span>

            <button onClick={handleLogout} style={styles.button}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    background: "#111",
    color: "#fff"
  },
  right: {
    display: "flex",
    gap: "1rem",
    alignItems: "center"
  },
  left: {
    fontSize: "1.2rem"
  },
  button: {
    padding: "0.4rem 0.8rem",
    cursor: "pointer"
  }
}

export default Navbar