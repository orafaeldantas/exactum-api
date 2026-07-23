import { LogOut, ShieldAlert } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../../services/api";
import ConfirmModal from "./ConfirmModal";
import SectionCard from "./SectionCard";

export default function SessionsTab({ logout, navigate, isAdmin }) {
  const [confirmMine, setConfirmMine] = useState(false);
  const [confirmTenant, setConfirmTenant] = useState(false);
  const [savingMine, setSavingMine] = useState(false);
  const [savingTenant, setSavingTenant] = useState(false);

  async function handleRevokeMine() {
    setConfirmMine(false);
    setSavingMine(true);
    try {
      const response = await apiFetch("/auth/sessions/revoke-all", {
        method: "POST",
      });
      if (!response.ok) throw new Error();
      toast.success("Sessões encerradas. Você será desconectado.");
      logout();
      navigate("/login");
    } catch (err) {
      toast.error("Erro ao encerrar suas sessões");
    } finally {
      setSavingMine(false);
    }
  }

  async function handleRevokeTenant() {
    setConfirmTenant(false);
    setSavingTenant(true);
    try {
      const response = await apiFetch("/tenants/sessions/revoke-all", {
        method: "POST",
      });
      if (!response.ok) throw new Error();
      toast.success("Todas as sessões da empresa foram encerradas.");
    } catch (err) {
      toast.error("Erro ao encerrar as sessões da empresa");
    } finally {
      setSavingTenant(false);
    }
  }

  return (
    <div className="space-y-8">
      <SectionCard
        icon={LogOut}
        iconTone="bg-blue-100 text-blue-600"
        title="Minha Sessão"
        description="Encerre seu próprio acesso em todos os dispositivos"
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="max-w-md text-sm text-slate-600">
            Isso desconecta sua conta de qualquer dispositivo onde você esteja
            logado, incluindo este. Você precisará entrar novamente.
          </p>
          <button
            type="button"
            onClick={() => setConfirmMine(true)}
            disabled={savingMine}
            className="shrink-0 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingMine ? "Encerrando..." : "Encerrar minhas sessões"}
          </button>
        </div>
      </SectionCard>

      {isAdmin && (
        <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50/40">
          <div className="border-b border-red-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-100 p-2">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-red-800">
                  Zona de Risco
                </h2>
                <p className="text-sm text-red-600/80">
                  Ações que afetam todos os usuários da empresa
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <p className="max-w-md text-sm text-red-700">
                Encerra a sessão de <strong>todos os usuários</strong> desta
                empresa imediatamente. Use após um incidente de segurança ou
                desligamento de um funcionário.
              </p>
              <button
                type="button"
                onClick={() => setConfirmTenant(true)}
                disabled={savingTenant}
                className="shrink-0 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingTenant ? "Encerrando..." : "Encerrar todas as sessões"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmMine && (
        <ConfirmModal
          icon={LogOut}
          iconTone="bg-amber-100 text-amber-600"
          title="Encerrar minhas sessões"
          description="Você será desconectado de todos os dispositivos, incluindo este. Deseja continuar?"
          confirmLabel="Sim, encerrar"
          confirmTone="bg-amber-500 hover:bg-amber-600"
          onCancel={() => setConfirmMine(false)}
          onConfirm={handleRevokeMine}
        />
      )}

      {confirmTenant && (
        <ConfirmModal
          icon={ShieldAlert}
          iconTone="bg-red-100 text-red-600"
          title="Encerrar todas as sessões da empresa"
          description="Isso vai desconectar imediatamente TODOS os usuários desta empresa, sem aviso prévio. Essa ação não pode ser desfeita."
          confirmLabel="Sim, encerrar todas"
          confirmTone="bg-red-600 hover:bg-red-700"
          onCancel={() => setConfirmTenant(false)}
          onConfirm={handleRevokeTenant}
        />
      )}
    </div>
  );
}
