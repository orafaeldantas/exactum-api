import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../../services/api";

export function useProfileForm(profile, tenantData, bootstrap) {
  const [form, setForm] = useState({
    username: "",
    loginEmail: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm((prev) => ({
      ...prev,
      username: profile.username ?? "",
      loginEmail: profile.email ?? "",
    }));
  }, [profile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    const dataUser = {
      username: form.username,
      email: form.loginEmail,
      ...(form.newPassword && {
        password: form.newPassword,
        confirmPassword: form.confirmPassword,
        currentPassword: form.currentPassword,
      }),
    };

    setSaving(true);
    try {
      const response = await apiFetch(`/users/profile/${profile.uuid}`, {
        method: "PATCH",
        body: JSON.stringify(dataUser),
      });
      if (response.ok) {
        toast.success("Perfil atualizado com sucesso");
        if (bootstrap) bootstrap();
      } else {
        toast.error("Erro ao atualizar o perfil");
      }
    } catch (error) {
      toast.error("Erro de conexão");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return { form, saving, handleChange, handleSubmit };
}
