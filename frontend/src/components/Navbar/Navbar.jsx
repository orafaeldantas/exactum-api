import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { UserContext } from "../../context/UserContext";
import { SuperAdminContext } from "../../context/SuperAdminContext";
import { useNavigate, Link } from "react-router-dom";

import { AnimatePresence, motion } from "framer-motion";

import { LogOut, ShieldCheck, Box, ChevronDown, Sparkles, Settings } from "lucide-react";

const ROLES = {
  administrator: "Administrador",
  sales_manager: "Gerente de Vendas",
  seller: "Vendedor",
  stock_clerk: "Estoquista",
  super_admin: "Administrador do Sistema"
};

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { profile } = useContext(UserContext);
  const { superAdmin } = useContext(SuperAdminContext);

  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);

  const menuRef = useRef(null);

  function handleLogout() {
    logout();
    navigate("/");
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const userInitial = profile?.username?.charAt(0)?.toUpperCase() || "U";

  const isAdmin = user?.role?.name === "administrator";
  const isSuperAdmin = superAdmin ?? false

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/70 backdrop-blur-xl transition-all duration-300 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-gradient-to-r after:from-transparent after:via-blue-200/50 after:to-transparent"
    >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-1">
        <div className="flex h-16 items-center justify-between">
          {/* Left side */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20">
              <Box className="h-5 w-5" />
            </div>

            <span className="text-xl font-bold tracking-tight text-gray-900">
              Exactum
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {profile && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={openMenu}
                  onClick={() => setOpenMenu(!openMenu)}
                  className="flex items-center gap-2 rounded-full transition-all duration-200 ease-out hover:bg-gray-50"
                >
                  {/* Avatar */}
                  <div className="relative">
                    {profile?.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.username}
                        className="h-11 w-11 rounded-full border border-gray-200 object-cover shadow-sm shadow-[0_0_0_3px_rgba(59,130,246,0.10)]"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-sm shadow-[0_0_0_3px_rgba(59,130,246,0.10)]">
                        {userInitial}
                      </div>
                    )}

                    {/* Status online */}
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                  </div>

                  <ChevronDown
                    className={`hidden h-4 w-4 text-gray-500 transition-transform duration-200 sm:block ${
                      openMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {openMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl shadow-black/5"
                    >
                      {/* Workspace */}
                      <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Exactum Workspace
                          </span>
                        </div>
                        <span
                          className="flex h-2 w-2 rounded-full bg-emerald-500"
                          title="Sistema sincronizado"
                        />
                      </div>

                      {/* Header / Perfil */}
                      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4">
                        <div className="w-full min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {profile.username}
                          </p>
                          <p
                            className="mt-0.5 truncate text-xs text-gray-500"
                            title={profile.email}
                          >
                            {profile.email || "Sem email"}
                          </p>
                        </div>

                        <div className="flex">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              isSuperAdmin
                                ? "border-slate-300 bg-slate-100 text-slate-800 shadow-sm shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                : isAdmin
                                  ? "border-purple-200 bg-purple-50 text-purple-700 shadow-sm shadow-purple-100/50"
                                  : "border-blue-100 bg-blue-50 text-blue-700"
                            }`}
                          >
                            {isAdmin && (
                              <ShieldCheck className="h-3 w-3 text-purple-500" />
                            )}
                            {isSuperAdmin && (
                              <ShieldCheck className="h-3 w-3 text-slate-700 dark:text-slate-300" />
                            )}
                            {ROLES[user?.role?.name] || "Usuário"}
                          </span>
                        </div>
                      </div>

                      <div className="border-b border-gray-100 p-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(isAdmin ? "/admin-settings" : "/user-settings")
                          }
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50"
                        >
                          <Settings className="h-4 w-4 text-gray-400" />
                          <span>Configurações</span>
                        </button>
                      </div>

                      {/* Footer / Logout */}
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sair</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;