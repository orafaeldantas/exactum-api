import { NavLink } from "react-router-dom"
import styles from "./Sidebar.module.css"

function Sidebar() {
  return (
    <aside className={styles.sidebar}>

      <h2 className={styles.logo}>
        Exactum
      </h2>

      <nav className={styles.menu}>

      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          isActive ? styles.active : styles.link
        }
      >
        📊 Dashboard
      </NavLink>

      <NavLink
        to="/users"
        className={({ isActive }) =>
          isActive ? styles.active : styles.link
        }
      >
          👥 Usuários
        </NavLink>

        <NavLink to="/logs" className={styles.link}>
          📜 Logs
        </NavLink>

        <NavLink to="/settings" className={styles.link}>
          ⚙ Configurações
        </NavLink>

      </nav>

    </aside>
  )
}

export default Sidebar