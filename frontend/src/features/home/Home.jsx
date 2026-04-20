import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
        <header className="w-full bg-white shadow-sm">
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

                <h1 className="text-xl font-semibold text-indigo-600">
                Exactum
                </h1>

                <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate("/login")}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
                >
                    Login
                </button>

                <button
                    onClick={() => navigate("/create-tenant")}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
                >
                    Começar
                </button>
                </div>

            </div>
        </header>

      {/* HERO */}
      <section className="text-center py-20 px-6">
        <h2 className="text-4xl font-bold mb-4">
          Controle seu estoque com inteligência
        </h2>

        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          Preveja demanda, evite rupturas e maximize seu lucro com análise preditiva.
        </p>
        <div className="px-200">
            <button
                onClick={() => navigate("/create-tenant")}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-md text-base hover:bg-indigo-700"
                >
                Criar minha empresa
            </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid md:grid-cols-3 gap-6 px-8 py-12 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-2">Previsão de demanda</h3>
          <p className="text-sm text-gray-600">
            Antecipe necessidades com base em histórico.
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-2">Alertas inteligentes</h3>
          <p className="text-sm text-gray-600">
            Saiba quando agir antes que seja tarde.
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-2">Gestão centralizada</h3>
          <p className="text-sm text-gray-600">
            Tudo em um só lugar.
          </p>
        </div>
      </section>

    </div>
  );
}