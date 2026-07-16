import {
  ArrowRight,
  ChevronDown,
  MinusCircle,
  Package,
  PackagePlus,
  Pencil,
  PlusCircle,
  RefreshCcw,
  ScrollText,
  Search,
  ShoppingCart,
  Trash2,
  UserCog,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import LoadingOverlay from "../../components/Loader/LoadingOverlay";
import { getAuditLogs } from "../../services/logService";

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
  violet: {
    badge: "bg-violet-50 text-violet-700",
    icon: "bg-violet-50 text-violet-600",
  },
  slate: {
    badge: "bg-gray-100 text-slate-600",
    icon: "bg-gray-100 text-slate-500",
  },
};

const ENTITY_META = {
  sale: { label: "Venda", icon: ShoppingCart, tone: "emerald" },
  product: { label: "Produto", icon: Package, tone: "blue" },
  user: { label: "Usuário", icon: Users, tone: "violet" },
};

const EVENT_META = {
  sale_created: {
    label: "Venda registrada",
    icon: ShoppingCart,
    tone: "emerald",
    action: "created",
  },
  product_created: {
    label: "Produto criado",
    icon: PackagePlus,
    tone: "emerald",
    action: "created",
  },
  product_updated: {
    label: "Produto atualizado",
    icon: Pencil,
    tone: "blue",
    action: "updated",
  },
  product_deleted: {
    label: "Produto excluído",
    icon: Trash2,
    tone: "red",
    action: "deleted",
  },
  user_created: {
    label: "Usuário criado",
    icon: UserPlus,
    tone: "emerald",
    action: "created",
  },
  user_updated: {
    label: "Usuário atualizado",
    icon: Pencil,
    tone: "blue",
    action: "updated",
  },
  user_deleted: {
    label: "Usuário excluído",
    icon: UserMinus,
    tone: "red",
    action: "deleted",
  },
  profile_updated: {
    label: "Perfil atualizado",
    icon: UserCog,
    tone: "amber",
    action: "updated",
  },
};

const ENTITY_FILTERS = Object.keys(ENTITY_META);
const ACTION_FILTERS = [
  { key: "created", label: "Criações", icon: PlusCircle },
  { key: "updated", label: "Atualizações", icon: RefreshCcw },
  { key: "deleted", label: "Exclusões", icon: MinusCircle },
];

const FIELD_LABELS = {
  name: "Nome",
  price: "Preço",
  stock_quantity: "Estoque",
  sku: "SKU",
  is_active: "Ativo",
  category: "Categoria",
  email: "E-mail",
  role: "Papel",
  channel: "Canal",
  payment_method: "Pagamento",
  quantity_items: "Itens",
  total_price: "Total",
  new_password: "Senha",
};

const MONEY_FIELDS = new Set(["price", "total_price"]);

function formatMoney(value) {
  const number = Number(value) || 0;
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatValue(value, field) {
  if (value === null || value === undefined || value === "") return "—";
  if (field && MONEY_FIELDS.has(field)) return formatMoney(value);
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function summarize(log) {
  const p = log.payload || {};
  switch (log.event) {
    case "sale_created": {
      const d = p.data || {};
      const items = d.quantity_items ?? 0;
      return `Venda de ${formatMoney(d.total_price)} via ${
        d.payment_method ?? "—"
      } (${items} ${items === 1 ? "item" : "itens"})`;
    }
    case "product_created": {
      const d = p.data || {};
      return `"${d.name ?? "Produto"}" criado —> ${formatMoney(d.price)} · ${
        d.stock_quantity ?? 0
      } un.`;
    }
    case "product_deleted": {
      const d = p.deleted_data || {};
      return `"${d.name ?? "Produto"}" excluído${
        d.sku ? ` · SKU ${d.sku}` : ""
      }`;
    }
    case "user_created": {
      const u = p.user || {};
      return `${u.name ?? u.email ?? "Usuário"} criado${
        u.role ? ` · ${u.role}` : ""
      }`;
    }
    case "user_deleted": {
      const d = p.deleted_data || {};
      return `"${d.name ?? "Usuário"}" foi excluído`;
    }
    case "product_updated":
    case "user_updated": {
      const count =
        p.changes && typeof p.changes === "object"
          ? Object.keys(p.changes).length
          : 0;
      return count > 0
        ? `"${p.name}" teve ${count} ${
            count === 1 ? "campo alterado" : "campos alterados"
          }`
        : "Nenhuma alteração registrada";
    }
    case "profile_updated": {
      const changes = p.changes || {};
      if (changes.new_password) return "Senha alterada";
      if (changes.email) return "E-mail alterado";
      const count = Object.keys(changes).length;
      return count > 0
        ? `"${p.name}" teve ${count} ${
            count === 1 ? "campo alterado" : "campos alterados"
          }`
        : "Nenhuma alteração registrada";
    }
    default:
      return log.event;
  }
}

function DiffPair({ oldValue, newValue, field }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="rounded bg-red-50 px-1.5 py-0.5 font-mono text-red-600 line-through">
        {formatValue(oldValue, field)}
      </span>
      <ArrowRight className="h-3 w-3 shrink-0 text-slate-300" />
      <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-emerald-700">
        {formatValue(newValue, field)}
      </span>
    </div>
  );
}

function ChangesBlock({ changes }) {
  const entries =
    changes && typeof changes === "object" ? Object.entries(changes) : [];
  if (entries.length === 0) {
    return (
      <p className="text-xs text-slate-400">Nenhuma alteração registrada.</p>
    );
  }
  return (
    <div className="space-y-2">
      {entries.map(([field, diff]) => {
        const isPair =
          diff && typeof diff === "object" && ("old" in diff || "new" in diff);
        return (
          <div key={field} className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-600">
              {FIELD_LABELS[field] ?? field}
            </span>
            {isPair ? (
              <DiffPair oldValue={diff.old} newValue={diff.new} field={field} />
            ) : (
              <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs text-blue-700">
                {formatValue(diff, field)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SnapshotBlock({ data }) {
  const entries = data && typeof data === "object" ? Object.entries(data) : [];
  if (entries.length === 0)
    return <p className="text-xs text-slate-400">Sem dados registrados.</p>;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {entries.map(([key, value]) => (
        <div key={key}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {FIELD_LABELS[key] ?? key}
          </p>
          <p className="font-mono text-xs text-slate-700">
            {formatValue(value, key)}
          </p>
        </div>
      ))}
    </div>
  );
}

function EventDetails({ log }) {
  const p = log.payload || {};
  switch (log.event) {
    case "sale_created":
    case "product_created":
      return <SnapshotBlock data={p.data} />;
    case "product_deleted":
      return <SnapshotBlock data={p.deleted_data} />;
    case "user_created":
      return <SnapshotBlock data={p.user} />;
    case "product_updated":
    case "user_updated":
    case "profile_updated":
      return <ChangesBlock changes={p.changes} />;
    default:
      return null;
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

function LogRow({ log }) {
  const [open, setOpen] = useState(false);
  const meta = EVENT_META[log.event] ?? {
    label: log.event,
    icon: ScrollText,
    tone: "slate",
  };
  const entityMeta = ENTITY_META[log.entity];
  const Icon = meta.icon;
  const tone = TONE_CLASSES[meta.tone] ?? TONE_CLASSES.slate;
  const entityUuid = log.payload?.entity_uuid;

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
            {entityMeta && (
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {entityMeta.label}
              </span>
            )}
            <span className="text-[11px] text-slate-400">
              {log.createdAt
                ? new Date(log.createdAt).toLocaleString("pt-BR")
                : "—"}
            </span>
          </div>
          <p className="mt-1 truncate text-sm font-medium text-slate-700">
            {summarize(log)}
          </p>
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4">
          <div className="mb-3 grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-3">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                ID do registro
              </p>
              <p className="font-mono text-xs text-slate-600">
                {entityUuid ?? "—"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Realizado por (userUuid)
              </p>
              <p className="font-mono text-xs text-slate-600">
                {log.userUuid ?? "—"}
              </p>
            </div>
          </div>

          <EventDetails log={log} />

          <details className="mt-3">
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

const LOGS_PER_PAGE = 8;

export default function TenantAuditLogs() {
  const { auditLogs = [], loadAuditLogs, loading } = getAuditLogs();

  const logs = auditLogs;

  const [entityFilters, setEntityFilters] = useState([]);
  const [actionFilters, setActionFilters] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  function toggleEntity(entity) {
    setPage(1);
    setEntityFilters((prev) =>
      prev.includes(entity)
        ? prev.filter((e) => e !== entity)
        : [...prev, entity]
    );
  }

  function toggleAction(action) {
    setPage(1);
    setActionFilters((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action]
    );
  }

  function clearFilters() {
    setPage(1);
    setEntityFilters([]);
    setActionFilters([]);
    setDateFrom("");
    setDateTo("");
    setSearch("");
  }

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null;

    return logs.filter((log) => {
      if (entityFilters.length && !entityFilters.includes(log.entity))
        return false;

      const meta = EVENT_META[log.event];
      if (
        actionFilters.length &&
        (!meta || !actionFilters.includes(meta.action))
      )
        return false;

      if (log.createdAt) {
        const date = new Date(log.createdAt);
        if (from && date < from) return false;
        if (to && date > to) return false;
      }

      if (query && !JSON.stringify(log).toLowerCase().includes(query))
        return false;

      return true;
    });
  }, [logs, entityFilters, actionFilters, dateFrom, dateTo, search]);

  const hasActiveFilters =
    entityFilters.length > 0 ||
    actionFilters.length > 0 ||
    dateFrom ||
    dateTo ||
    search;

  const startIndex = (page - 1) * LOGS_PER_PAGE;
  const paginatedLogs = filteredLogs.slice(
    startIndex,
    startIndex + LOGS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);

  const counts = useMemo(() => {
    const byAction = { created: 0, updated: 0, deleted: 0 };
    logs.forEach((log) => {
      const action = EVENT_META[log.event]?.action;
      if (action) byAction[action] += 1;
    });
    return { total: logs.length, ...byAction };
  }, [logs]);

  return (
    <LoadingOverlay
      loading={loading}
      minDuration={250}
      message="Buscando logs..."
    >
      <div className="bg-gray-50 p-6 h-full min-h-0 overflow-y-auto pr-3 custom-scroll">
        {/* Header */}
        <div className="mb-6">
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
            <ScrollText className="text-blue-600" /> Logs de Auditoria
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Histórico de alterações em produtos, vendas e usuários
          </p>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={ScrollText}
            label="Eventos registrados"
            value={counts.total}
            tone="slate"
          />
          <StatCard
            icon={PlusCircle}
            label="Criações"
            value={counts.created}
            tone="emerald"
          />
          <StatCard
            icon={RefreshCcw}
            label="Atualizações"
            value={counts.updated}
            tone="blue"
          />
          <StatCard
            icon={MinusCircle}
            label="Exclusões"
            value={counts.deleted}
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
                placeholder="Buscar por nome, e-mail, SKU..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">De</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition-colors duration-200 focus:border-blue-500"
              />
              <label className="text-xs font-semibold text-slate-500">
                Até
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition-colors duration-200 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Entidade
            </span>
            {ENTITY_FILTERS.map((entity) => {
              const meta = ENTITY_META[entity];
              const Icon = meta.icon;
              const isActive = entityFilters.includes(entity);
              return (
                <button
                  key={entity}
                  type="button"
                  onClick={() => toggleEntity(entity)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all duration-150 ${
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

            <span className="ml-3 mr-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Ação
            </span>
            {ACTION_FILTERS.map((action) => {
              const Icon = action.icon;
              const isActive = actionFilters.includes(action.key);
              return (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => toggleAction(action.key)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-gray-200 bg-white text-slate-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {action.label}
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

        {/* Feed */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
          {paginatedLogs.map((log, index) => (
            <LogRow
              key={
                log.payload?.entity_uuid
                  ? `${log.payload.entity_uuid}-${log.createdAt}`
                  : `${log.event}-${startIndex + index}`
              }
              log={log}
            />
          ))}

          {!loading && filteredLogs.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-slate-400">
                <ScrollText className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">
                {hasActiveFilters
                  ? "Nenhum evento encontrado para esse filtro."
                  : "Nenhum evento registrado ainda."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredLogs.length > 0 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-slate-500">
              Mostrando{" "}
              <span className="font-semibold text-slate-700">
                {startIndex + 1}–
                {Math.min(startIndex + LOGS_PER_PAGE, filteredLogs.length)}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-slate-700">
                {filteredLogs.length}
              </span>{" "}
              eventos
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
