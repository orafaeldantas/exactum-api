import {
  Activity,
  Box,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  DatabaseZap,
  LayoutDashboard,
  LogOut,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Terminal,
  Users,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { SuperAdminContext } from "../../context/SuperAdminContext";
import { apiFetch } from "../../services/api";

const COLLAPSE_STORAGE_KEY = "exactum:sidebar-collapsed";

const linkBaseClass = `
  group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
  hover:bg-slate-800 text-slate-400 hover:text-white
`;

const activeLinkClass =
  "bg-blue-600 !text-white shadow-[0_4px_12px_-2px_rgba(37,99,235,0.5)]";

/** A single nav entry. Kept as one component so every link stays visually and behaviorally consistent. */
function NavItem({ to, icon: Icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `${linkBaseClass} ${isActive ? activeLinkClass : ""}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-blue-400"
              aria-hidden="true"
            />
          )}
          <Icon
            size={20}
            className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
              collapsed ? "mx-auto" : ""
            }`}
          />
          {!collapsed && <span className="font-medium">{label}</span>}
        </>
      )}
    </NavLink>
  );
}

function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true";
  });
  const { user, impersonateMode, permissions } = useContext(AuthContext);
  const { superAdmin } = useContext(SuperAdminContext);
  const roles = permissions;

  useEffect(() => {
    localStorage.setItem(COLLAPSE_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  function toggleSidebar() {
    setCollapsed(!collapsed);
  }

  const isImpersonating = impersonateMode ?? false;
  const isSuperAdmin = superAdmin ?? false;

  async function handleImpersonate() {
    try {
      const response = await apiFetch("/auth/stop-impersonate", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Erro ao finalizar acesso");

      window.location.href = "/platform/manage-companies";
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <aside
      className={`
        sticky top-0 h-screen bg-slate-900 transition-all duration-300 ease-in-out border-r border-slate-800
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Thin, dark scrollbar for the nav — default browser scrollbars look out of place here */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 6px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 9999px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>

      {/* Logo — brand mark always visible, even collapsed. Stacks vertically when collapsed so it never fights the toggle button for space. */}
      <div
        className={`flex mb-4 ${
          collapsed
            ? "flex-col items-center gap-3 py-4"
            : "h-16 items-center justify-between px-4"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-[0_2px_8px_-2px_rgba(37,99,235,0.5)]">
            <Box className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Exactum
              </h2>
              <span className="inline-flex shrink-0 items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-400">
                Alpha
              </span>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className="shrink-0 rounded-lg bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-scroll flex flex-col gap-2 px-3 overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* Return to Admin Button */}
        {isImpersonating && (
          <button
            onClick={handleImpersonate}
            title={collapsed ? "Voltar ao Super Admin" : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white mb-2"
          >
            <LogOut size={20} className={collapsed ? "mx-auto" : ""} />
            {!collapsed && (
              <span className="font-bold text-xs uppercase tracking-wider">
                Back to Super
              </span>
            )}
          </button>
        )}

        {!isSuperAdmin && (
          <>
            <NavItem
              to="/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              collapsed={collapsed}
            />
            <NavItem
              to="/products"
              icon={Box}
              label="Produtos"
              collapsed={collapsed}
            />
            <NavItem
              to="/low-stock"
              icon={CircleDot}
              label="Estoque Baixo"
              collapsed={collapsed}
            />

            {roles.includes("user:view") && (
              <NavItem
                to="/users"
                icon={Users}
                label="Usuários"
                collapsed={collapsed}
              />
            )}

            <NavItem
              to="/checkout"
              icon={ShoppingCart}
              label="PDV"
              collapsed={collapsed}
            />
            <NavItem
              to="/sales"
              icon={Receipt}
              label="Histórico de Vendas"
              collapsed={collapsed}
            />

            {roles.includes("analytics:view") && (
              <NavItem
                to="/logs"
                icon={ScrollText}
                label="Logs"
                collapsed={collapsed}
              />
            )}
          </>
        )}

        {isSuperAdmin && (
          <>
            <div className="mt-6 mb-2 px-4">
              {!collapsed && (
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Gerenciamento do Sistema
                </p>
              )}
              {collapsed && <div className="border-t border-slate-800 mx-2" />}
            </div>

            <NavItem
              to="/platform/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              collapsed={collapsed}
            />
            <NavItem
              to="/platform/manage-companies"
              icon={Building2}
              label="Empresas"
              collapsed={collapsed}
            />
            <NavItem
              to="/platform/infra-health"
              icon={Activity}
              label="Status do Sistema"
              collapsed={collapsed}
            />
            <NavItem
              to="/platform/logs"
              icon={Terminal}
              label="Logs de Requisições"
              collapsed={collapsed}
            />
            <NavItem
              to="/platform/events"
              icon={DatabaseZap}
              label="Eventos da Plataforma"
              collapsed={collapsed}
            />
          </>
        )}

        <div className="my-4 border-t border-slate-800 mx-2" />

        <NavItem
          to={"/settings"}
          icon={Settings}
          label="Configurações"
          collapsed={collapsed}
        />
      </nav>

      {!collapsed && !isSuperAdmin && (
        <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
          {isImpersonating && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-amber-500">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-bold uppercase tracking-tight">
                Impersonate Mode
              </span>
            </div>
          )}
          <div className="rounded-2xl bg-slate-800/50 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Versão
              </p>
              <p className="text-xs text-slate-300">v0.1.0-alpha</p>
            </div>
            <div className="flex items-center justify-between pt-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Plano
              </p>
              <p className="text-xs text-blue-300">Starter</p>
            </div>
            <button
              disabled
              title="Disponível em breve"
              className="mt-3 w-full cursor-not-allowed rounded-lg border border-slate-700 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500"
            >
              Fazer upgrade · Em breve
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
