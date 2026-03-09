import { NavLink } from "react-router-dom"
import { useState } from "react"

import {
  LayoutDashboard,
  Users,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

import styles from "./Sidebar.module.css"

function Sidebar() {

  const [collapsed, setCollapsed] = useState(false)

  function toggleSidebar() {
    setCollapsed(!collapsed)  
  }

  return (

    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>

      <div className={styles.header}>
        {!collapsed && <h2>Exactum</h2>}

        <button onClick={toggleSidebar} className={styles.toggle}>
          {collapsed ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
        </button>
      </div>


      <nav className={styles.menu}>

        <NavLink to="/dashboard" className={styles.link}>
          <LayoutDashboard size={20}/>
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink to="/users" className={styles.link}>
          <Users size={20}/>
          {!collapsed && <span>Usuários</span>}
        </NavLink>

        <NavLink to="/logs" className={styles.link}>
          <ScrollText size={20}/>
          {!collapsed && <span>Logs</span>}
        </NavLink>

        <NavLink to="/settings" className={styles.link}>
          <Settings size={20}/>
          {!collapsed && <span>Config</span>}
        </NavLink>

      </nav>

    </aside>
  )
}

export default Sidebar