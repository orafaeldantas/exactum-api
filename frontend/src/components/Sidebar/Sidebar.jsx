import { NavLink } from "react-router-dom";
import { useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import {
  LayoutDashboard,
  Users,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Box,
  CircleDot,
  ShoppingCart,
  Building2,
  ShieldCheck,
  Activity,
  Terminal,
  LogOut // Import for the exit icon
} from "lucide-react";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  // Added stopImpersonating from context
  const { user, stopImpersonating } = useContext(AuthContext);

  const roles = ["admin", 'super-admin'];

  function toggleSidebar() {
    setCollapsed(!collapsed);
  }

  const linkBaseClass = `
    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 
    group hover:bg-slate-800 text-slate-400 hover:text-white
  `;

  const activeLinkClass = "bg-blue-600 !text-white shadow-lg shadow-blue-900/20";

  const isImpersonating = !!sessionStorage.getItem("super_token");

  return (
    <aside 
      className={`
        sticky top-0 h-screen bg-slate-900 transition-all duration-300 ease-in-out border-r border-slate-800
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      <div className={`flex items-center h-16 px-4 mb-4 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Box className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-white tracking-tight">Exactum</h2>
          </div>
        )}
        <button 
          onClick={toggleSidebar} 
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          {collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
        </button>
      </div>

      <nav className="flex flex-col gap-2 px-3 overflow-y-auto max-h-[calc(100vh-200px)]">
        
        {/* Return to Admin Button - Highlighted at the top when active */}
        {isImpersonating && (
          <button
            onClick={stopImpersonating}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white mb-2"
          >
            <LogOut size={20} className={collapsed ? "mx-auto" : ""} />
            {!collapsed && <span className="font-bold text-xs uppercase tracking-wider">Back to Super</span>}
          </button>
        )}

        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : ""}`}
        >
          <LayoutDashboard size={20} className={collapsed ? "mx-auto" : ""} />
          {!collapsed && <span className="font-medium">Dashboard</span>}
        </NavLink>

        <NavLink 
          to="/products" 
          className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : ""}`}
        >
          <Box size={20} className={collapsed ? "mx-auto" : ""} />
          {!collapsed && <span className="font-medium">Produtos</span>}
        </NavLink>
        
        {roles.includes(user?.role) && (
          <NavLink 
            to="/users" 
            className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : ""}`}
          >
            <Users size={20} className={collapsed ? "mx-auto" : ""} />
            {!collapsed && <span className="font-medium">Usuários</span>}
          </NavLink>
        )}

        {user?.role in roles && (
          <NavLink 
            to="/logs" 
            className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : ""}`}
          >
            <ScrollText size={20} className={collapsed ? "mx-auto" : ""} />
            {!collapsed && <span className="font-medium">Logs</span>}
          </NavLink>
        )}

        <NavLink 
          to="/checkout" 
          className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : ""}`}
        >
          <ShoppingCart size={20} className={collapsed ? "mx-auto" : ""} />
          {!collapsed && <span className="font-medium">PDV</span>}
        </NavLink>

        {user?.role === 'super-admin' && (
          <>
            <div className="mt-6 mb-2 px-4">
              {!collapsed && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Management</p>}
              {collapsed && <div className="border-t border-slate-800 mx-2" />}
            </div>

            <NavLink 
              to="/manage-companies" 
              className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : ""}`}
            >
              <Building2 size={20} className={collapsed ? "mx-auto" : ""} />
              {!collapsed && <span className="font-medium">Tenants</span>}
            </NavLink>

            <NavLink 
              to="/superadmin/health" 
              className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : ""}`}
            >
              <Activity size={20} className={collapsed ? "mx-auto" : ""} />
              {!collapsed && <span className="font-medium">Infra Health</span>}
            </NavLink>

            <NavLink 
              to="/superadmin/system-logs" 
              className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : ""}`}
            >
              <Terminal size={20} className={collapsed ? "mx-auto" : ""} />
              {!collapsed && <span className="font-medium">System Logs</span>}
            </NavLink>
          </>
        )}

        <div className="my-4 border-t border-slate-800 mx-2" />

        <NavLink 
          to="/settings" 
          className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : ""}`}
        >
          <Settings size={20} className={collapsed ? "mx-auto" : ""} />
          {!collapsed && <span className="font-medium">Configurações</span>}
        </NavLink>

      </nav>

      {!collapsed && (
        <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
          {isImpersonating && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-amber-500">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-bold uppercase tracking-tight">Impersonate Mode</span>
            </div>
          )}
          <div className="p-4 rounded-2xl bg-slate-800/50">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Versão</p>
            <p className="text-xs text-slate-300">v2.0.26 - Pro</p>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;