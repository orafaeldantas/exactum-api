import {
  AlertOctagon,
  ChevronDown,
  FileText,
  Gauge,
  Search,
  ShieldCheck,
  Terminal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import LoadingOverlay from "../../components/Loader/LoadingOverlay";
import { getInfraLogs } from "../../services/platformService";

const PAGE_SIZE = 13;

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const METHOD_TONE = {
  GET: "bg-blue-50 text-blue-600",
  POST: "bg-emerald-50 text-emerald-700",
  PUT: "bg-purple-50 text-purple-600",
  PATCH: "bg-amber-50 text-amber-700",
  DELETE: "bg-red-50 text-red-600",
};

const STATUS_CLASSES = [
  {
    key: "2xx",
    label: "2xx",
    test: (s) => s >= 200 && s < 300,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    key: "3xx",
    label: "3xx",
    test: (s) => s >= 300 && s < 400,
    tone: "bg-blue-50 text-blue-600",
  },
  {
    key: "4xx",
    label: "4xx",
    test: (s) => s >= 400 && s < 500,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    key: "5xx",
    label: "5xx",
    test: (s) => s >= 500,
    tone: "bg-red-50 text-red-600",
  },
];

const DURATION_OPTIONS = [
  { value: "", label: "Qualquer duração" },
  { value: "100", label: "Acima de 100ms" },
  { value: "500", label: "Acima de 500ms" },
  { value: "1000", label: "Acima de 1s" },
];

function getStatusTone(status) {
  return (
    STATUS_CLASSES.find((c) => c.test(status))?.tone ??
    "bg-gray-100 text-slate-600"
  );
}

function getDurationTone(ms) {
  if (ms >= 1000) return "text-red-600";
  if (ms >= 300) return "text-amber-600";
  return "text-slate-700";
}

function StatCard({ icon: Icon, label, value, tone = "blue" }) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p
          className="text-2xl font-black tracking-tight text-slate-900"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {value}
        </p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function LogRow({ log }) {
  const [open, setOpen] = useState(false);
  const isError = log.status >= 400;

  return (
    <>
      <tr
        className={`cursor-pointer border-t border-gray-100 transition-colors duration-150 hover:bg-gray-50/80 ${
          isError ? "bg-red-50/30" : ""
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getStatusTone(
              log.status
            )}`}
          >
            {log.status}
          </span>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
              METHOD_TONE[log.method] ?? "bg-gray-100 text-slate-600"
            }`}
          >
            {log.method}
          </span>
        </td>
        <td className="max-w-[280px] px-4 py-3">
          <span
            className="truncate font-mono text-xs text-slate-700"
            title={log.path}
          >
            {log.path}
          </span>
        </td>
        <td
          className={`px-4 py-3 text-right text-sm font-semibold ${getDurationTone(
            log.duration_ms
          )}`}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {Number(log.duration_ms).toFixed(2)}ms
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs text-slate-600">{log.user_id ?? "—"}</span>
            {log.is_super_admin && (
              <span
                title="Super Admin"
                className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <ShieldCheck className="h-3 w-3" />
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-xs text-slate-500">
          {log.timestamp
            ? new Date(log.timestamp).toLocaleString("pt-BR")
            : "—"}
        </td>
        <td className="px-2 py-3">
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </td>
      </tr>

      {open && (
        <tr className="border-t border-gray-100 bg-gray-50/60">
          <td colSpan={7} className="px-6 py-4">
            <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Request ID
                </p>
                <p className="font-mono text-xs text-slate-600">
                  {log.request_id ?? "—"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  IP
                </p>
                <p className="font-mono text-xs text-slate-600">
                  {log.ip ?? "—"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Tenant ID
                </p>
                <p className="font-mono text-xs text-slate-600">
                  {log.tenant_id ?? "—"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Caminho completo
                </p>
                <p className="break-all font-mono text-xs text-slate-600">
                  {log.path}
                </p>
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  User agent
                </p>
                <p className="break-all text-xs text-slate-500">
                  {log.user_agent ?? "—"}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function InfraLogs() {
  const { dataLogs, loadInfraLogs, loading } = getInfraLogs();
  const count = dataLogs?.count ?? 0;
  const file = dataLogs?.file ?? "";
  const logs = dataLogs?.logs ?? [];

  useEffect(() => {
    loadInfraLogs();
  }, []);

  const [page, setPage] = useState(1);
  const [methodFilters, setMethodFilters] = useState([]);
  const [statusFilters, setStatusFilters] = useState([]);
  const [minDuration, setMinDuration] = useState("");
  const [onlySuperAdmin, setOnlySuperAdmin] = useState(false);
  const [search, setSearch] = useState("");

  // Everything below is client-side now: the API hands us the whole batch
  // in one shot (up to whatever limit is configured server-side), so we
  // filter/paginate over what's already in memory instead of refetching.
  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const minMs = minDuration ? Number(minDuration) : null;

    return logs.filter((log) => {
      if (methodFilters.length && !methodFilters.includes(log.method))
        return false;
      if (statusFilters.length) {
        const matchesClass = statusFilters.some((key) =>
          STATUS_CLASSES.find((c) => c.key === key)?.test(log.status)
        );
        if (!matchesClass) return false;
      }
      if (minMs !== null && Number(log.duration_ms) < minMs) return false;
      if (onlySuperAdmin && !log.is_super_admin) return false;
      if (query) {
        const haystack = `${log.path ?? ""} ${log.request_id ?? ""} ${
          log.ip ?? ""
        } ${log.user_id ?? ""}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [logs, methodFilters, statusFilters, minDuration, onlySuperAdmin, search]);

  useEffect(() => {
    setPage(1);
  }, [methodFilters, statusFilters, minDuration, onlySuperAdmin, search]);

  function toggleMethod(method) {
    setMethodFilters((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  }

  function toggleStatusClass(key) {
    setStatusFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function clearFilters() {
    setMethodFilters([]);
    setStatusFilters([]);
    setMinDuration("");
    setOnlySuperAdmin(false);
    setSearch("");
  }

  const hasActiveFilters =
    methodFilters.length > 0 ||
    statusFilters.length > 0 ||
    minDuration ||
    onlySuperAdmin ||
    search;

  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + PAGE_SIZE);
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);

  // Genuinely global now (computed over the whole in-memory batch, not a
  // single page), since the API no longer paginates server-side.
  const errorCount = logs.filter((l) => l.status >= 400).length;
  const avgDuration = logs.length
    ? (
        logs.reduce((acc, l) => acc + Number(l.duration_ms || 0), 0) /
        logs.length
      ).toFixed(1)
    : "0";

  return (
    <LoadingOverlay
      loading={loading}
      minDuration={250}
      message="Buscando logs..."
    >
      <div className="animate-in fade-in duration-500 pb-10 h-full min-h-0 overflow-y-auto pr-3 custom-scroll">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
              <Terminal className="text-blue-600" /> Logs de Requisições
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              Histórico de requisições HTTP processadas pela infraestrutura
              {file && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <FileText className="h-3 w-3" /> {file}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Cap notice — only shown if the delivered batch is smaller than the reported total */}
        {logs.length > 0 && logs.length < count && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
            Exibindo os {logs.length.toLocaleString("pt-BR")} registros mais
            recentes de {count.toLocaleString("pt-BR")} no total — o backend
            limita a quantidade retornada por requisição.
          </div>
        )}

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={Terminal}
            label="Requisições carregadas"
            value={count.toLocaleString("pt-BR")}
            tone="blue"
          />
          <StatCard
            icon={Gauge}
            label="Duração média"
            value={`${avgDuration}ms`}
            tone="amber"
          />
          <StatCard
            icon={AlertOctagon}
            label="Erros (4xx/5xx)"
            value={errorCount}
            tone="red"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por rota, request ID, IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={minDuration}
                onChange={(e) => setMinDuration(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-colors duration-200 focus:border-blue-500"
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">
                <input
                  type="checkbox"
                  checked={onlySuperAdmin}
                  onChange={(e) => setOnlySuperAdmin(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Apenas Super Admin
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Método
            </span>
            {METHODS.map((method) => {
              const isActive = methodFilters.includes(method);
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => toggleMethod(method)}
                  className={`rounded-full border px-3 py-1 text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-gray-200 bg-white text-slate-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {method}
                </button>
              );
            })}

            <span className="ml-3 mr-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Status
            </span>
            {STATUS_CLASSES.map((cls) => {
              const isActive = statusFilters.includes(cls.key);
              return (
                <button
                  key={cls.key}
                  type="button"
                  onClick={() => toggleStatusClass(cls.key)}
                  className={`rounded-full border px-3 py-1 text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-gray-200 bg-white text-slate-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {cls.label}
                </button>
              );
            })}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-2 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-slate-400 transition-colors duration-150 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Método
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Rota
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Duração
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    Usuário
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Horário
                  </th>
                  <th className="px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => (
                  <LogRow
                    key={log.request_id ?? `${log.path}-${log.timestamp}`}
                    log={log}
                  />
                ))}

                {!loading && paginatedLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-slate-400">
                          <Terminal className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                          {hasActiveFilters
                            ? "Nenhuma requisição encontrada para esse filtro."
                            : "Nenhuma requisição registrada."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && filteredLogs.length > 0 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-slate-500">
              Mostrando{" "}
              <span className="font-semibold text-slate-700">
                {startIndex + 1}–
                {Math.min(startIndex + PAGE_SIZE, filteredLogs.length)}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-slate-700">
                {filteredLogs.length.toLocaleString("pt-BR")}
              </span>{" "}
              requisições
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                <span className="text-blue-600">{page}</span>
                <span className="mx-1 text-slate-400">/</span>
                <span>{totalPages || 1}</span>
              </div>
              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>
    </LoadingOverlay>
  );
}
