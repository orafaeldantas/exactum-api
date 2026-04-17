import { useState } from "react";
import { createAdmin } from "../services/adminService";

export default function AdminStep({ data, updateData, next, back, tenantId }) {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const newErrors = {};

    if (!data.firstName) newErrors.firstName = "Nome obrigatório";
    if (!data.lastName) newErrors.lastName = "Sobrenome obrigatório";
    if (!data.email) newErrors.email = "Email obrigatório";

    if (!data.password) {
      newErrors.password = "Senha obrigatória";
    } else if (data.password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    }

    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem";
    }

    return newErrors;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    updateData({ [name]: value });
  }

  function handleNext(){
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      next();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  /*async function handleNext() {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      await createAdmin(tenantId, {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
      });

      next();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }*/

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold mb-6">
        Criar administrador
      </h2>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="grid grid-cols-2 gap-4">

          {/* Nome */}
          <div>
            <label className="text-sm text-gray-600">Nome *</label>
            <input
              name="firstName"
              value={data.firstName || ""}
              onChange={handleChange}
              className={`w-full mt-1 p-2 border rounded-md ${
                errors.firstName && "border-red-500"
              }`}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500">{errors.firstName}</p>
            )}
          </div>

          {/* Sobrenome */}
          <div>
            <label className="text-sm text-gray-600">Sobrenome *</label>
            <input
              name="lastName"
              value={data.lastName || ""}
              onChange={handleChange}
              className={`w-full mt-1 p-2 border rounded-md ${
                errors.lastName && "border-red-500"
              }`}
            />
          </div>

          {/* Email */}
          <div className="col-span-2">
            <label className="text-sm text-gray-600">Email *</label>
            <input
              type="email"
              name="email"
              value={data.email || ""}
              onChange={handleChange}
              className={`w-full mt-1 p-2 border rounded-md ${
                errors.email && "border-red-500"
              }`}
            />
          </div>

          {/* Senha */}
          <div>
            <label className="text-sm text-gray-600">Senha *</label>
            <input
              type="password"
              name="password"
              value={data.password || ""}
              onChange={handleChange}
              className={`w-full mt-1 p-2 border rounded-md ${
                errors.password && "border-red-500"
              }`}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirmar senha */}
          <div>
            <label className="text-sm text-gray-600">
              Confirmar senha *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={data.confirmPassword || ""}
              onChange={handleChange}
              className={`w-full mt-1 p-2 border rounded-md ${
                errors.confirmPassword && "border-red-500"
              }`}
            />
          </div>

        </div>
      </div>

      {/* Botões */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={back}
          className="px-4 py-2 border rounded-md"
        >
          Voltar
        </button>

        <button
          onClick={handleNext}
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md"
        >
          {loading ? "Criando..." : "Próximo"}
        </button>
      </div>
    </div>
  );
}