import {
  ArrowRight,
  Ban,
  Building2,
  ChevronDown,
  Clock,
  Info,
  LogIn,
  LogOut,
  Pencil,
  RotateCcw,
  Search,
  Terminal,
  UserCheck,
  UserCog,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import LoadingOverlay from "../../components/Loader/LoadingOverlay";
import { getPlatformEvents } from "../../services/platformService";

const EVENT_META = {
  user_login: { label: "Login de usuário", icon: LogIn, tone: "blue" },
  user_logout: { label: "Logout de usuário", icon: LogOut, tone: "slate" },
  tenant_created: { label: "Empresa criada", icon: Building2, tone: "emerald" },
  tenant_updated: { label: "Empresa atualizada", icon: Pencil, tone: "blue" },
  tenant_suspended: { label: "Empresa suspensa", icon: Ban, tone: "red" },
  tenant_reactivated: {
    label: "Empresa reativada",
    icon: RotateCcw,
    tone: "emerald",
  },
  impersonation_started: {
    label: "Impersonação iniciada",
    icon: UserCog,
    tone: "amber",
  },
  impersonation_finished: {
    label: "Impersonação finalizada",
    icon: UserCheck,
    tone: "amber",
  },
};

const EVENT_TYPES = Object.keys(EVENT_META);

const TONE_CLASSES = {
  blue: { badge: "bg-blue-50 text-blue-600", icon: "bg-blue-50 text-blue-600" },
  emerald: {
    badge: "bg-emerald-50 text-emerald-700",
    icon: "bg-emerald-50 text-emerald-600",
  },
  red: { badge: "bg-red-50 text-red-600", icon: "bg-red-50 text-red-500" },
  amber: {
    badge: "bg-amber-50 text-amber-700",
    icon: "bg-amber-50 text-amber-600",
  },
  slate: {
    badge: "bg-gray-100 text-slate-600",
    icon: "bg-gray-100 text-slate-500",
  },
};

function extractTimestampFromUUIDv7(uuid) {
  if (!uuid || typeof uuid !== "string") return null;
  const hex = uuid.replace(/-/g, "").slice(0, 12);
  if (hex.length < 12) return null;

  const ms = parseInt(hex, 16);
  if (!Number.isFinite(ms)) return null;

  const date = new Date(ms);
  const year = date.getFullYear();
  if (year < 2020 || year > 2035) return null;

  return date;
}

function resolveEventDate(log) {
  if (log.createdAt) {
    const parsed = new Date(log.createdAt);
    if (!Number.isNaN(parsed.getTime())) {
      return { date: parsed, estimated: false };
    }
  }
  const fallback = extractTimestampFromUUIDv7(log.payload?.request_id);
  return fallback
    ? { date: fallback, estimated: true }
    : { date: null, estimated: false };
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function DiffPair({ oldValue, newValue }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="rounded bg-red-50 px-1.5 py-0.5 font-mono text-red-600 line-through">
        {formatValue(oldValue)}
      </span>
      <ArrowRight className="h-3 w-3 shrink-0 text-slate-300" />
      <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-emerald-700">
        {formatValue(newValue)}
      </span>
    </div>
  );
}

function ChangesBlock({ payload }) {
  const changes = payload?.changes;
  if (changes && typeof changes === "object") {
    const entries = Object.entries(changes);
    if (entries.length === 0) {
      return (
        <p className="text-xs text-slate-400">Nenhuma alteração registrada.</p>
      );
    }
    return (
      <div className="space-y-2">
        {entries.map(([field, diff]) => (
          <div key={field} className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-600">
              {field}
            </span>
            <DiffPair oldValue={diff?.old} newValue={diff?.new} />
          </div>
        ))}
      </div>
    );
  }

  if ("old_values" in (payload || {}) || "new_values" in (payload || {})) {
    const oldV = payload.old_values;
    const newV = payload.new_values;
    const isObj = (v) => v !== null && typeof v === "object";

    if (isObj(oldV) || isObj(newV)) {
      const keys = new Set([
        ...Object.keys(isObj(oldV) ? oldV : {}),
        ...Object.keys(isObj(newV) ? newV : {}),
      ]);
      return (
        <div className="space-y-2">
          {[...keys].map((key) => (
            <div key={key} className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-slate-600">
                {key}
              </span>
              <DiffPair
                oldValue={isObj(oldV) ? oldV[key] : undefined}
                newValue={isObj(newV) ? newV[key] : undefined}
              />
            </div>
          ))}
        </div>
      );
    }

    return <DiffPair oldValue={oldV} newValue={newV} />;
  }

  return null;
}

function summarize(log) {
  const p = log.payload || {};
  switch (log.event) {
    case "user_login":
    case "user_logout":
      return p.email
        ? `${p.email}${p.account_type ? ` · ${p.account_type}` : ""}`
        : "Usuário não identificado";
    case "tenant_created":
      return `${p.tenant_name ?? "Empresa"}${
        p.tenant_plan ? ` · plano ${p.tenant_plan}` : ""
      }`;
    case "tenant_updated": {
      const count =
        p.changes && typeof p.changes === "object"
          ? Object.keys(p.changes).length
          : 0;
      return count > 0
        ? `${p.tenant_name} · ${count} ${
            count === 1 ? "campo alterado" : "campos alterados"
          }`
        : "Sem alterações registradas";
    }
    case "tenant_suspended":
      return p.tenant_name ?? "Empresa suspensa";
    case "tenant_reactivated":
      return p.tenant_name ?? "Empresa reativada";
    case "impersonation_started":
      return (
        `${p.target_user_email} · ${p.target_tenant_name}` ??
        "Usuário alvo não identificado"
      );
    case "impersonation_finished":
      return (
        `${p.email} · ${p.tenant_name}` ??
        (p.account_type ? `Sessão de ${p.account_type} encerrada` : "—")
      );
    default:
      return "—";
  }
}

function StatCard({ icon: Icon, label, value, tone = "blue" }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONE_CLASSES[tone].icon}`}
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

function EventRow({ log, index }) {
  const [open, setOpen] = useState(false);
  const meta = EVENT_META[log.event] ?? {
    label: log.event,
    icon: Info,
    tone: "slate",
  };
  const Icon = meta.icon;
  const tone = TONE_CLASSES[meta.tone] ?? TONE_CLASSES.slate;

  const p = log.payload || {};
  const ip = p.ip_address ?? p.ip ?? null;
  const requestId = p.request_id ?? null;
  const { date: eventDate, estimated } = resolveEventDate(log);

  return (
    <div className="border-t border-gray-100 first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors duration-150 hover:bg-gray-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone.badge}`}
            >
              {meta.label}
            </span>
            {eventDate && (
              <span
                className="flex items-center gap-1 text-[11px] text-slate-400"
                title={
                  estimated
                    ? "Estimado a partir do request_id (UUIDv7) — sem createdAt registrado"
                    : undefined
                }
              >
                <Clock className="h-3 w-3" />
                {eventDate.toLocaleString("pt-BR")}
                {estimated && (
                  <span className="italic text-slate-300">(estimado)</span>
                )}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm font-medium text-slate-700">
            {summarize(log)}
          </p>
        </div>

        {ip && (
          <span className="hidden shrink-0 font-mono text-xs text-slate-400 sm:block">
            {ip}
          </span>
        )}

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4">
          <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Tenant UUID
              </p>
              <p className="font-mono text-xs text-slate-600">
                {log.tenantUuid ?? "—"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                User UUID
              </p>
              <p className="font-mono text-xs text-slate-600">
                {log.userUuid ?? "—"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Request ID
              </p>
              <p className="font-mono text-xs text-slate-600">
                {requestId ?? "—"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                User agent
              </p>
              <p
                className="truncate text-xs text-slate-500"
                title={p.user_agent}
              >
                {p.user_agent ?? "—"}
              </p>
            </div>
          </div>

          <ChangesBlock payload={p} />

          <details className="mt-3 group/raw">
            <summary className="cursor-pointer text-[11px] font-semibold text-slate-400 hover:text-slate-600">
              Ver payload completo
            </summary>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-200">
              {JSON.stringify(log, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

const EVENTS_PER_PAGE = 8;

export default function PlatformEvents() {
  const { events = [], loadEvents, loading } = getPlatformEvents();

  const [activeFilters, setActiveFilters] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      loadEvents();
      hasLoaded.current = true;
    }
  }, []);

  function toggleFilter(type) {
    setPage(1);
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  const filteredEvents = useMemo(() => {
    const seen = new Set();
    const uniqueEvents = events.filter((log) => {
      const id = log.payload?.request_id;
      const key =
        id ?? `${log.event}-${log.createdAt}-${log.tenantUuid}-${log.userUuid}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const query = search.trim().toLowerCase();
    return uniqueEvents.filter((log) => {
      if (activeFilters.length > 0 && !activeFilters.includes(log.event))
        return false;
      if (!query) return true;
      const haystack = JSON.stringify(log).toLowerCase();
      return haystack.includes(query);
    });
  }, [events, activeFilters, search]);

  const startIndex = (page - 1) * EVENTS_PER_PAGE;
  const endIndex = startIndex + EVENTS_PER_PAGE;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);

  const counts = useMemo(() => {
    const loginCount = events.filter((e) => e.event === "user_login").length;
    const tenantCount = events.filter((e) =>
      [
        "tenant_created",
        "tenant_updated",
        "tenant_suspended",
        "tenant_reactivated",
      ].includes(e.event)
    ).length;
    const impersonationCount = events.filter((e) =>
      ["impersonation_started", "impersonation_finished"].includes(e.event)
    ).length;
    return {
      total: events.length,
      loginCount,
      tenantCount,
      impersonationCount,
    };
  }, [events]);

  return (
    <LoadingOverlay
      loading={loading}
      minDuration={250}
      message="Buscando eventos..."
    >
      <div className="bg-gray-50 p-6 h-full min-h-0 overflow-y-auto pr-3 custom-scroll">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
              <Terminal className="text-blue-600" /> Eventos da Plataforma
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Trilha de auditoria de ações realizadas no sistema
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Terminal}
            label="Eventos registrados"
            value={counts.total}
            tone="blue"
          />
          <StatCard
            icon={LogIn}
            label="Logins"
            value={counts.loginCount}
            tone="slate"
          />
          <StatCard
            icon={Building2}
            label="Ações em empresas"
            value={counts.tenantCount}
            tone="emerald"
          />
          <StatCard
            icon={UserCog}
            label="Impersonações"
            value={counts.impersonationCount}
            tone="amber"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
          <div className="mb-3 relative max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por e-mail, tenant, IP..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {EVENT_TYPES.map((type) => {
              const meta = EVENT_META[type];
              const isActive = activeFilters.includes(type);
              const Icon = meta.icon;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleFilter(type)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-gray-200 bg-white text-slate-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {meta.label}
                </button>
              );
            })}
            {activeFilters.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setActiveFilters([]);
                  setPage(1);
                }}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-400 transition-colors duration-150 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Events feed */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
          {paginatedEvents.map((log, index) => (
            <EventRow
              key={
                log.payload?.request_id ?? `${log.event}-${startIndex + index}`
              }
              log={log}
              index={startIndex + index}
            />
          ))}

          {!loading && filteredEvents.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-slate-400">
                <Terminal className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">
                {search || activeFilters.length > 0
                  ? "Nenhum evento encontrado para esse filtro."
                  : "Nenhum evento registrado ainda."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredEvents.length > 0 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-slate-500">
              Mostrando{" "}
              <span className="font-semibold text-slate-700">
                {startIndex + 1}–{Math.min(endIndex, filteredEvents.length)}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-slate-700">
                {filteredEvents.length}
              </span>{" "}
              eventos
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
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
                onClick={() => setPage(page + 1)}
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
