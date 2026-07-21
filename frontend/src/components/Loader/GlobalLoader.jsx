export default function GlobalLoader({ message = "Carregando..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 transition-opacity duration-300 ease-out">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

      <p className="mt-4 text-sm font-medium tracking-tight text-slate-500">
        {message}
      </p>
    </div>
  );
}
