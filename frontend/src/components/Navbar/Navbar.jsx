import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, User, ShieldCheck, Box } from "lucide-react";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Lado Esquerdo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Box className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Exactum
            </span>
          </div>

          {/* Lado Direito */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="hidden items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 md:flex">
                  {user.role === "admin" ? (
                    <ShieldCheck className="h-4 w-4 text-purple-600" />
                  ) : (
                    <User className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                    {user.role === "admin" ? "Administrador" : "Usuário"}
                  </span>
                </div>

                <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>

                <button
                  onClick={handleLogout}
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    px-3
                    py-2
                    text-sm
                    font-medium
                    text-gray-600
                    transition-all
                    hover:bg-red-50
                    hover:text-red-600
                  "
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;