import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar, // ← ADICIONADO
  CheckCircle2,
  Key,
  Mail,
  Pencil,
  Shield,
  User,
  X,
} from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { humanize } from "../../../pages/settings/utils/humanize";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <div className="mt-0.5 text-sm font-semibold text-slate-800">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function UserDetailsModal({ user, isOpen, onClose, onEdit }) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (typeof document === "undefined") return null;

  const isActive = user?.is_active ?? true;
  const extraPermissions = [];

  return createPortal(
    <AnimatePresence>
      {isOpen && user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-16px_rgba(15,23,42,0.25)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="user-modal-title"
                    className="truncate text-lg font-bold tracking-tight text-slate-900"
                  >
                    {user.username || "Usuário sem nome"}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        isActive
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-slate-500"
                      }`}
                    >
                      {isActive ? "Ativo" : "Inativo"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-600">
                      {humanize(user.role) || "Sem função"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors duration-200 hover:bg-gray-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[65vh] space-y-6 overflow-y-auto px-6 py-6">
              {/* Key information cards */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InfoRow icon={Mail} label="E-mail">
                  {user.email || "—"}
                </InfoRow>

                <InfoRow icon={Calendar} label="Criado em">
                  {user.created_at ? formatDate(user.created_at) : "—"}
                </InfoRow>

                <InfoRow icon={Shield} label="Cargo">
                  <div className="flex items-center gap-1.5">
                    <span>{humanize(user.role) || "—"}</span>
                  </div>
                </InfoRow>
              </div>

              {/* Detailed status */}
              <div className="rounded-xl bg-slate-50/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Status da conta
                </p>
                <div className="mt-1 flex items-center gap-2">
                  {isActive ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-slate-400" />
                  )}
                  <span className="text-sm font-semibold text-slate-700">
                    {isActive ? "Conta ativa" : "Conta inativa"}
                  </span>
                </div>
              </div>

              {/* Extra permissions */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-blue-500" />
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Permissões extras
                  </p>
                </div>
                <div className="mt-2">
                  {extraPermissions.length === 0 ? (
                    <p className="text-sm font-medium text-slate-400">
                      Nenhuma permissão extra atribuída
                    </p>
                  ) : (
                    <ul className="flex flex-wrap gap-1.5">
                      {extraPermissions.map((perm, idx) => (
                        <li
                          key={idx}
                          className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                        >
                          {perm}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition-colors duration-200 hover:bg-gray-100 hover:text-slate-700"
              >
                Fechar
              </button>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(user)}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)] transition-all duration-200 hover:bg-blue-700 active:scale-[0.98]"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
