import { useState, useEffect } from "react";
import { User, ShieldCheck, Activity } from "lucide-react";

export default function UserForm({ initialData = {}, onSubmit, submitText }) {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("user");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username || username);
      setRole(initialData.role || role);
      setIsActive(initialData.is_active ?? isActive);
    }
  }, [initialData]);

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
      username,
      role,
      is_active: isActive,
    });
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <form
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {submitText === "Criar Usuário" ? "Novo Usuário" : "Editar Usuário"}
          </h2>
          <p className="text-sm text-gray-500">Preencha as informações abaixo</p>
        </div>

        {/* Campo Usuário */}
        <div className="mb-5">
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <User className="w-4 h-4 text-slate-400" />
            Usuário
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Ex: joao_silva"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {/* Campo Role */}
        <div className="mb-5">
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            Tipo de usuário
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="user">Usuário Comum</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {/* Campo Status */}
        <div className="mb-8">
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Activity className="w-4 h-4 text-slate-400" />
            Status
          </label>
          <select
            value={isActive}
            onChange={(e) => setIsActive(e.target.value === "true")}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>

        {/* Botão de Envio */}
        <button
          type="submit"
          className="
            w-full
            rounded-xl
            bg-blue-600
            px-5
            py-3.5
            text-sm
            font-bold
            text-white
            shadow-md
            transition-all
            duration-200
            hover:bg-blue-700
            hover:shadow-lg
            active:scale-[0.98]
          "
        >
          {submitText}
        </button>
      </form>
    </div>
  );
}