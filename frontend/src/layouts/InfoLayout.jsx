import { Link, Outlet, useLocation } from "react-router-dom";
import { Box } from "lucide-react";

export default function InfoLayout() {
  const location = useLocation();

  const tabs = [
    {
      label: "Quem Somos",
      path: "/about",
    },
    {
      label: "Privacidade",
      path: "/privacy",
    },
    {
      label: "Termos",
      path: "/terms",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="border-b border-gray-200 bg-white">

        <div className="mx-auto max-w-5xl px-8 py-8">

          <Link to="/" className="flex items-center gap-3 mb-8">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Box className="w-5 h-5" />
            </div>

            <div>
              <h1 className="font-bold text-xl">
                Exactum
              </h1>

              <p className="text-xs text-gray-500">
                Informações da Plataforma
              </p>
            </div>

          </Link>

          {/* Tabs */}
          <nav className="flex gap-2">

            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`
                  rounded-xl px-5 py-2 text-sm font-semibold transition
                  ${
                    location.pathname === tab.path
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }
                `}
              >
                {tab.label}
              </Link>
            ))}

          </nav>

        </div>

      </header>

      
      <main className="mx-auto max-w-5xl px-8 py-10">
        <Outlet />
      </main>

    </div>
  );
}