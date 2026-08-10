import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../../services/api";

export function useCompanyForm(tenantData, bootstrap) {
  const [form, setForm] = useState({
    companyName: "",
    companyEmail: "",
    monthlyGoal: 0,
    minimumStock: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tenantData) return;
    setForm({
      companyName: tenantData.name ?? "",
      companyEmail: tenantData.corporate_email ?? "",
      minimumStock: tenantData.global_min_stock ?? 0,
      monthlyGoal: tenantData.goal ? parseInt(tenantData.goal) : 0,
    });
  }, [tenantData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMonthlyGoalChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, monthlyGoal: onlyDigits }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataTenant = {
      companyName: form.companyName,
      companyEmail: form.companyEmail.trim() === "" ? null : form.companyEmail,
      minimumStock: form.minimumStock,
      monthlyGoal: form.monthlyGoal,
    };

    setSaving(true);
    try {
      const response = await apiFetch("/tenants", {
        method: "PATCH",
        body: JSON.stringify(dataTenant),
      });
      if (response.ok) {
        toast.success("Dados da empresa atualizados com sucesso");
        if (bootstrap) bootstrap();
      } else {
        toast.error("Erro ao atualizar os dados da empresa");
      }
    } catch (error) {
      toast.error("Erro de conexão");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return { form, saving, handleChange, handleMonthlyGoalChange, handleSubmit };
}
