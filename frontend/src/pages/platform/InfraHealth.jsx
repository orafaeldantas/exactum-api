import { useEffect } from "react";
import { getInfraHealth } from "../../services/platformService"

import {
  Activity, Database, Zap, Server, RefreshCw,
  CheckCircle2, XCircle, AlertTriangle, Clock,
  Tag, Timer, Gauge
} from 'lucide-react';


const SERVICE_ICONS = {
  postgres: Database,
  postgresql: Database,
  redis: Zap,
};

function getServiceIcon(name) {
  return SERVICE_ICONS[name.toLowerCase()] || Server;
}

function formatUptime(totalSeconds) {
  const seconds = Number(totalSeconds) || 0;
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}min`;
  if (minutes > 0) return `${minutes}min ${secs}s`;
  return `${secs}s`;
}

function StatusPill({ status }) {
  const isUp = status === "up" || status === "healthy";
  const isDown = status === "down" || status === "unhealthy";

  const styles = isUp
    ? "bg-emerald-50 text-emerald-700"
    : isDown
    ? "bg-red-50 text-red-600"
    : "bg-amber-50 text-amber-600";

  const Icon = isUp ? CheckCircle2 : isDown ? XCircle : AlertTriangle;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles}`}>
      <Icon className="w-3 h-3" /> {status}
    </span>
  );
}

function InfoCard({ icon: Icon, label, value, tone = "blue" }) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)]">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-lg font-black tracking-tight text-slate-900">{value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function InfraHealth() {

  const { loadHealth, infraHealth, lastChecked, loading } = getInfraHealth();

  useEffect(() => { loadHealth(); }, []);

  const services = infraHealth?.services ? Object.entries(infraHealth.services) : [];
  const overallStatus = infraHealth?.status ?? "unknown";
  const isHealthy = overallStatus === "healthy";
  const isDevelopment = infraHealth?.environment === "development";

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
            <Activity className="text-blue-600" /> Status do Sistema
          </h1>
          <p className="mt-1 text-sm text-slate-500">Status dos serviços e dependências do ecossistema</p>
        </div>
        <button
          onClick={loadHealth}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_16px_-4px_rgba(37,99,235,0.3)] transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_8px_20px_-2px_rgba(37,99,235,0.35)] active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </button>
      </div>

      {/* Overall status banner */}
      <div className={`mb-6 flex flex-col gap-4 rounded-2xl border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)] sm:flex-row sm:items-center sm:justify-between ${
        isHealthy ? "border-emerald-100 bg-emerald-50/50" : "border-red-100 bg-red-50/50"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            isHealthy ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
          }`}>
            {isHealthy ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold capitalize text-slate-800">{overallStatus}</h2>
              {infraHealth?.environment && (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    isDevelopment ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {infraHealth.environment}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Status geral do sistema</p>
          </div>
        </div>

        {infraHealth?.timestamp && (
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            Verificado às {new Date(infraHealth.timestamp).toLocaleTimeString("pt-BR")}
          </span>
        )}
      </div>

      {/* System metadata */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InfoCard icon={Tag} label="Versão" value={infraHealth?.version ?? "—"} tone="blue" />
        <InfoCard icon={Timer} label="Uptime" value={infraHealth ? formatUptime(infraHealth.uptimeSeconds) : "—"} tone="slate" />
        <InfoCard
          icon={AlertTriangle}
          label="Ambiente"
          value={infraHealth?.environment ?? "—"}
          tone={isDevelopment ? "amber" : "blue"}
        />
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map(([name, service]) => {
          const Icon = getServiceIcon(name);
          const status = service?.status ?? "unknown";
          const isUp = status === "up";
          return (
            <div
              key={name}
              className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_8px_20px_-14px_rgba(15,23,42,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(15,23,42,0.02),0_16px_32px_-14px_rgba(15,23,42,0.18)]"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isUp ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-500"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <StatusPill status={status} />
              </div>

              <h3 className="text-lg font-bold capitalize leading-tight text-slate-800">{name}</h3>
              <p className="mb-3 text-xs text-slate-400">Serviço de infraestrutura</p>

              {service?.latency && (
                <div className="flex items-center gap-1.5 border-t border-gray-100 pt-3 text-xs font-medium text-slate-500">
                  <Gauge className="h-3.5 w-3.5 text-slate-400" />
                  Latência: <span className="font-mono font-semibold text-slate-700">{service.latency}</span>
                </div>
              )}
            </div>
          );
        })}

        {!loading && services.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-400">Nenhum serviço reportado.</p>
          </div>
        )}
      </div>
    </div>
  );
}