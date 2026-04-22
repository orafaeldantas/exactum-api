import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar/Navbar"
import Sidebar from "../components/Sidebar/Sidebar"

function Layout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          
          <div className="mx-auto max-w-screen-2xl">
            <Outlet />
          </div>

        </main>
      </div>

    </div>
  )
}

export default Layout