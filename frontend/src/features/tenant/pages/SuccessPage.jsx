import { useNavigate } from "react-router-dom";

export default function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      
      <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">

        <div className="mb-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl">
            ✓
          </div>
        </div>

        <h1 className="text-2xl font-semibold mb-2">
          Tenant criado com sucesso!
        </h1>

        <p className="text-gray-600 mb-6">
          Seu ambiente já está pronto. Agora você pode acessar o sistema com o usuário administrador criado.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Ir para o login
        </button>

      </div>
    </div>
  );
}