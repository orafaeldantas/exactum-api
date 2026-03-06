import { Outlet } from "react-router-dom"

import Navbar from "../components/Navbar/Navbar"
import Sidebar from "../components/Sidebar/Sidebar"

function Layout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>

      <Sidebar />

      <div style={{ flex: 1 }}>

        <Navbar />

        <main style={{ padding: "20px" }}>
          <Outlet />
        </main>

      </div>

    </div>
  )
}

export default Layout