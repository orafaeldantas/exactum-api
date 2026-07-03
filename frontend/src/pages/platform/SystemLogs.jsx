import { useState } from "react";
// import { useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { apiFetch } from "../../services/api";
// import { AuthContext } from "../../context/AuthContext";

import {
  Terminal, Eye, Trash2, Search, Clock, Server,
  User, MapPin, Hash, Info, AlertTriangle, XCircle, AlertOctagon, X, Copy, Building2
} from 'lucide-react';

const MOCK_LOGS = [
  { id: 1, timestamp: "2026-06-30T11:42:10Z", level: "info", service: "exactum", action: "EXACTUM", actor: "exactum@exactum.app.br", tenant: "System", ip: "255.255.255.255", message: "Exactum" },  
];

const LEVEL_CONFIG = {
  info:     { label: "Info",     icon: Info,          badge: "bg-blue-50 text-blue-700",     dot: "bg-blue-500" },
  warning:  { label: "Atenção",  icon: AlertTriangle,  badge: "bg-amber-50 text-amber-700",   dot: "bg-amber-500" },
  error:    { label: "Erro",     icon: XCircle,        badge: "bg-red-50 text-red-700",       dot: "bg-red-500" },
  critical: { label: "Crítico",  icon: AlertOctagon,   badge: "bg-purple-50 text-purple-700", dot: "bg-purple-500" },
};

function formatTimestamp(iso) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });
}

export default function SystemLogs() {
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [page, setPage] = useState(1);
  const logsPerPage = 8; 

  // const navigate = useNavigate();
  // const { user } = useContext(AuthContext);

  // Modal de detalhes do log
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [logToView, setLogToView] = useState(null);

  // ---------------------------------------------------------------------
  // async function loadLogs() {
  //   try {
  //     const response = await apiFetch("/super-admin/logs");
  //     if (!response.ok) throw new Error("Erro ao carregar logs");
  //     const data = await response.json();
  //     setLogs(data);
  //   } catch (err) {
  //     toast.error(err.message);
  //   }
  // }
  // useEffect(() => { loadLogs(); }, []);
  // ---------------------------------------------------------------------

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.message.toLowerCase().includes(search.toLowerCase()) ||
      l.service.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === "all" || l.level === levelFilter;
    return matchesSearch && matchesLevel; 
  });

  const paginated = filteredLogs.slice((page - 1) * logsPerPage, page * logsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  function openDetail(log) {
    setLogToView(log);
    setIsDetailModalOpen(true);
  }

  // function handleCopyLog(log) {
  //   navigator.clipboard.writeText(JSON.stringify(log, null, 2));
  //   toast.success("Log copiado para a área de transferência");
  // }

  // async function handleDeleteLog(logId) {
  //   try {
  //     const response = await apiFetch(`/super-admin/logs/${logId}`, { method: "DELETE" });
  //     if (!response.ok) throw new Error("Erro ao excluir log");
  //     setLogs((prev) => prev.filter((l) => l.id !== logId));
  //     toast.success("Log excluído");
  //   } catch (err) {
  //     toast.error(err.message);
  //   }
  // }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Terminal className="text-blue-600" /> Logs do Sistema
          </h1>
          <p className="mt-1 text-sm text-gray-500">Auditoria de eventos e atividades do ecossistema</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Mensagem, serviço, ação ou autor..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
          />
        </div>

        <div className="flex gap-2">
          {["all", "info", "warning", "error", "critical"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => { setLevelFilter(lvl); setPage(1); }}
              className={`rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                levelFilter === lvl
                  ? "bg-slate-800 text-white"
                  : "bg-white border border-gray-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {lvl === "all" ? "Todos" : LEVEL_CONFIG[lvl].label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Nível</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Timestamp</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">Serviço</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Ação</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Mensagem</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Autor</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((log) => {
                const cfg = LEVEL_CONFIG[log.level];
                const LevelIcon = cfg.icon;
                return (
                  <tr
                    key={log.id}
                    onClick={() => openDetail(log)}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}>
                        <LevelIcon className="w-3 h-3" /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-slate-500">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-700 hidden md:table-cell">
                      {log.service}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono font-medium text-blue-600 hidden lg:table-cell">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">
                      {log.message}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 hidden lg:table-cell">
                      {log.actor}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openDetail(log)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          // onClick={() => handleDeleteLog(log.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">Nenhum log encontrado para os filtros aplicados.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium disabled:opacity-40">Anterior</button>
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-2 text-sm font-bold text-gray-700">{page} / {totalPages}</div>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium disabled:opacity-40">Próxima</button>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && logToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-800">Detalhes do Log #{logToView.id}</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">{logToView.message}</p>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2"><Clock className="w-3.5 h-3.5"/> Timestamp:</span>
                <span className="font-mono text-xs font-medium text-slate-700">{formatTimestamp(logToView.timestamp)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2"><Server className="w-3.5 h-3.5"/> Serviço:</span>
                <span className="font-medium text-slate-700">{logToView.service}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2"><Hash className="w-3.5 h-3.5"/> Ação:</span>
                <span className="font-mono text-xs font-medium text-blue-600">{logToView.action}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2"><User className="w-3.5 h-3.5"/> Autor:</span>
                <span className="font-medium text-slate-700">{logToView.actor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2"><Building2 className="w-3.5 h-3.5"/> Tenant:</span>
                <span className="font-medium text-slate-700">{logToView.tenant || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2"><MapPin className="w-3.5 h-3.5"/> IP:</span>
                <span className="font-mono text-xs font-medium text-slate-700">{logToView.ip}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                // onClick={() => handleCopyLog(logToView)}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <Copy className="w-4 h-4" /> Copiar JSON
              </button>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}