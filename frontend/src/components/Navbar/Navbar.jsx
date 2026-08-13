import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { SuperAdminContext } from "../../context/SuperAdminContext";
import { UserContext } from "../../context/UserContext";
import { humanize } from "../../pages/settings/utils/humanize";

import { AnimatePresence, motion } from "framer-motion";

import {
  Box,
  ChevronDown,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const show_role = (role) => {
  if (role === "super_admin") return "Administrador do Sistema";
  return humanize(role);
};

//super_admin: "Administrador do Sistema"

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { profile } = useContext(UserContext);
  const { superAdmin } = useContext(SuperAdminContext);

  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function closeMenu() {
    setOpenMenu(false);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeMenu();
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const userInitial = profile?.username?.charAt(0)?.toUpperCase() || "U";

  const isAdmin = user?.role?.name === "administrador";
  const isSuperAdmin = superAdmin ?? false;

  const roleBadgeClass = isSuperAdmin
    ? "border-slate-300 bg-slate-100 text-slate-800 shadow-sm shadow-slate-200/50"
    : isAdmin
    ? "border-purple-200 bg-purple-50 text-purple-700 shadow-sm shadow-purple-100/50"
    : "border-blue-100 bg-blue-50 text-blue-700";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/70 backdrop-blur-xl transition-all duration-300 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-gradient-to-r after:from-transparent after:via-blue-200/50 after:to-transparent">
      <div className="mx-auto max-[1844px]:mx-8 max-w-screen-2xl px-4 sm:px-6 lg:px-1">
        <div className="flex h-16 items-center justify-between">
          {/* Left side */}
          <Link to="/dashboard" className="flex items-center gap-2 select-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/20">
              <Box className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Exactum
            </span>
            <span className="hidden items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 sm:inline-flex">
              Alpha
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {profile && (
              <div className="relative" ref={menuRef}>
                <button
                  ref={triggerRef}
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={openMenu}
                  onClick={() => setOpenMenu(!openMenu)}
                  className="flex items-center gap-2 rounded-full transition-all duration-200 ease-out hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  {/* Avatar */}
                  <div className="relative transition-transform duration-200 group-hover:scale-105">
                    {profile?.avatar && !avatarError ? (
                      <img
                        src={profile.avatar}
                        alt={profile.username}
                        onError={() => setAvatarError(true)}
                        className="h-11 w-11 rounded-full border border-gray-200 object-cover shadow-[0_0_0_3px_rgba(59,130,246,0.10)]"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-[0_0_0_3px_rgba(59,130,246,0.10)]">
                        {userInitial}
                      </div>
                    )}

                    {/* Status online */}
                    <div
                      className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm"
                      title="Online"
                    />
                  </div>

                  <ChevronDown
                    className={`hidden h-4 w-4 text-slate-500 transition-transform duration-200 sm:block ${
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
                      role="menu"
                      className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-16px_rgba(15,23,42,0.18)]"
                    >
                      {/* Workspace */}
                      <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
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
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {profile.username}
                          </p>
                          <p
                            className="mt-0.5 truncate text-xs text-slate-500"
                            title={profile.email}
                          >
                            {profile.email || "Sem email"}
                          </p>
                        </div>

                        <div className="flex">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleBadgeClass}`}
                          >
                            {(isAdmin || isSuperAdmin) && (
                              <ShieldCheck className="h-3 w-3" />
                            )}
                            {show_role(user?.role?.name) || "Usuário"}
                          </span>
                        </div>
                      </div>

                      <div className="border-b border-gray-100 p-2">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            closeMenu();
                            navigate("/settings");
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          <Settings className="h-4 w-4 text-slate-400" />
                          <span>Configurações</span>
                        </button>
                      </div>

                      {/* Footer / Logout */}
                      <div className="p-2">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
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
