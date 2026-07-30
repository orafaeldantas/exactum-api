export default function ConfirmModal({
  icon: Icon,
  iconTone,
  title,
  description,
  confirmLabel,
  confirmTone,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconTone}`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{title}</h3>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all active:scale-95 ${confirmTone}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
