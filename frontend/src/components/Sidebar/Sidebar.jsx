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
  ShoppingCart
} from "lucide-react";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const { user } = useContext(AuthContext);

  const roles = ["admin"];

  function toggleSidebar() {
    setCollapsed(!collapsed);
  }

  // Classes base para os links para evitar repetição
  const linkBaseClass = `
    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 
    group hover:bg-slate-800 text-slate-400 hover:text-white
  `;

  const activeLinkClass = "bg-blue-600 !text-white shadow-lg shadow-blue-900/20";

  return (
    <aside 
      className={`
        sticky top-0 h-screen bg-slate-900 transition-all duration-300 ease-in-out border-r border-slate-800
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Header da Sidebar */}
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

      {/* Menu de Navegação */}
      <nav className="flex flex-col gap-2 px-3">
        
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

        {user.role in roles && (
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

        {/* Divisor Visual */}
        <div className="my-4 border-t border-slate-800 mx-2" />

        <NavLink 
          to="/settings" 
          className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : ""}`}
        >
          <Settings size={20} className={collapsed ? "mx-auto" : ""} />
          {!collapsed && <span className="font-medium">Configurações</span>}
        </NavLink>

      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-800/50">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Versão</p>
          <p className="text-xs text-slate-300">v2.0.26 - Pro</p>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;