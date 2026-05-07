import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import { AnimatePresence, motion } from "framer-motion";

import {
  LogOut,
  User,
  ShieldCheck,
  Box,
  ChevronDown,
  Mail,
  Activity,
  Sparkles,
} from "lucide-react";

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);

  const menuRef = useRef(null);

  function handleLogout() {
    logout();
    navigate("/");
  }

  // Fecha o menu ao clicar fora
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

  // Avatar fallback
  const userInitial =
    user?.username?.charAt(0)?.toUpperCase() || "U";

  const isAdmin =
    user?.role === "admin" || user?.role === "super-admin";

  return (
    <nav
      className="
        sticky
        top-0
        z-50
        w-full
        border-b
        border-gray-200/80
        bg-white/70
        backdrop-blur-xl
        transition-all
        duration-300
        after:absolute
        after:bottom-0
        after:left-0
        after:h-px
        after:w-full
        after:bg-gradient-to-r
        after:from-transparent
        after:via-blue-200/50
        after:to-transparent
      "
    >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-1">
        <div className="flex h-16 items-center justify-between">

          {/* Lado Esquerdo */}
          <div className="flex items-center gap-2">
            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-gradient-to-br
                from-blue-600
                to-indigo-600
                text-white
                shadow-sm
                shadow-blue-500/20
              "
            >
              <Box className="h-5 w-5" />
            </div>

            <span className="text-xl font-bold tracking-tight text-gray-900">
              Exactum
            </span>
          </div>

          {/* Lado Direito */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpenMenu(!openMenu)}
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-full
                    transition-all
                    duration-200
                    ease-out
                    hover:bg-gray-50
                  "
                >
                  {/* Avatar */}
                  <div className="relative">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="
                          h-11
                          w-11
                          rounded-full
                          border
                          border-gray-200
                          object-cover
                          shadow-sm
                          shadow-[0_0_0_3px_rgba(59,130,246,0.10)]
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-full
                          bg-gradient-to-br
                          from-blue-600
                          to-indigo-600
                          text-sm
                          font-bold
                          text-white
                          shadow-sm
                          shadow-[0_0_0_3px_rgba(59,130,246,0.10)]
                        "
                      >
                        {userInitial}
                      </div>
                    )}

                    {/* Status online */}
                    <div
                      className="
                        absolute
                        bottom-0
                        right-0
                        h-3
                        w-3
                        rounded-full
                        border-2
                        border-white
                        bg-emerald-500
                        shadow-sm
                      "
                    ></div>
                  </div>

                  <ChevronDown
                    className={`
                      hidden
                      h-4
                      w-4
                      text-gray-500
                      transition-transform
                      duration-200
                      sm:block
                      ${openMenu ? "rotate-180" : ""}
                    `}
                  />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {openMenu && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -8,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -8,
                        scale: 0.98,
                      }}
                      transition={{
                        duration: 0.18,
                        ease: "easeOut",
                      }}
                      className="
                        absolute
                        right-0
                        mt-3
                        w-72
                        overflow-hidden
                        rounded-2xl
                        border
                        border-gray-200/80
                        bg-white/90
                        backdrop-blur-xl
                        shadow-2xl
                        shadow-black/5
                      "
                    >
                      {/* Workspace */}
                      <div
                        className="
                          border-b
                          border-gray-100
                          bg-gradient-to-r
                          from-blue-50/70
                          to-indigo-50/40
                          px-5
                          py-3
                        "
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-blue-600" />

                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Exactum Workspace
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                          Production Environment
                        </p>
                      </div>

                      {/* Header */}
                      <div className="border-b border-gray-100 px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {user?.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.username}
                                className="
                                  h-14
                                  w-14
                                  rounded-full
                                  border
                                  border-gray-200
                                  object-cover
                                  shadow-sm
                                "
                              />
                            ) : (
                              <div
                                className="
                                  flex
                                  h-14
                                  w-14
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-gradient-to-br
                                  from-blue-600
                                  to-indigo-600
                                  text-base
                                  font-bold
                                  text-white
                                "
                              >
                                {userInitial}
                              </div>
                            )}

                            <div
                              className="
                                absolute
                                bottom-0
                                right-0
                                h-3
                                w-3
                                rounded-full
                                border-2
                                border-white
                                bg-emerald-500
                              "
                            ></div>
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {user.username}
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {user.email || "Sem email"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Informações */}
                      <div className="space-y-4 px-5 py-4">

                        {/* Email */}
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />

                          <span className="truncate">
                            {user.email || "Sem email"}
                          </span>
                        </div>

                        {/* Role */}
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          {isAdmin ? (
                            <ShieldCheck className="h-4 w-4 text-purple-600" />
                          ) : (
                            <User className="h-4 w-4 text-blue-600" />
                          )}

                          <span
                            className={`
                              rounded-full
                              border
                              px-2.5
                              py-1
                              text-xs
                              font-semibold
                              capitalize

                              ${
                                isAdmin
                                  ? "border-purple-100 bg-purple-50 text-purple-700"
                                  : "border-blue-100 bg-blue-50 text-blue-700"
                              }
                            `}
                          >
                            {user.role}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Activity className="h-4 w-4 text-emerald-500" />

                          <span>Sistema sincronizado</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="border-t border-gray-100 p-2">
                        <button
                          onClick={handleLogout}
                          className="
                            flex
                            w-full
                            items-center
                            gap-2
                            rounded-xl
                            px-3
                            py-2.5
                            text-sm
                            font-medium
                            text-gray-600
                            transition-all
                            duration-200
                            hover:bg-red-50
                            hover:text-red-600
                          "
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