import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getInfraHealth } from "../../services/platformService"

import {
  Activity, Database, Zap, Server, RefreshCw,
  CheckCircle2, XCircle, AlertTriangle, Clock
} from 'lucide-react';

// Maps known service names to an icon. Falls back to a generic Server icon.
const SERVICE_ICONS = {
  postgres: Database,
  postgresql: Database,
  redis: Zap,
};

function getServiceIcon(name) {
  return SERVICE_ICONS[name.toLowerCase()] || Server;
}

function StatusPill({ state }) {
  const isUp = state === "up" || state === "healthy";
  const isDown = state === "down" || state === "unhealthy";

  const styles = isUp
    ? "bg-emerald-50 text-emerald-700"
    : isDown
    ? "bg-red-50 text-red-600"
    : "bg-amber-50 text-amber-600";

  const Icon = isUp ? CheckCircle2 : isDown ? XCircle : AlertTriangle;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles}`}>
      <Icon className="w-3 h-3" /> {state}
    </span>
  );
}

export default function InfraHealth() {

  const { loadHealth, infraHealth, lastChecked, loading } = getInfraHealth();

  useEffect(() => { loadHealth(); }, []);

  const services = infraHealth?.services ? Object.entries(infraHealth.services) : [];
  const overallStatus = infraHealth?.status ?? "unknown";
  const isHealthy = overallStatus === "healthy";

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Activity className="text-blue-600" /> Status do Sistema
          </h1>
          <p className="mt-1 text-sm text-gray-500">Status dos serviços e dependências do ecossistema</p>
        </div>
        <button
          onClick={loadHealth}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </button>
      </div>

      {/* Overall status banner */}
      <div className={`mb-6 flex items-center justify-between rounded-2xl border p-5 shadow-sm ${
        isHealthy ? "border-emerald-100 bg-emerald-50/50" : "border-red-100 bg-red-50/50"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            isHealthy ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
          }`}>
            {isHealthy ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 capitalize">{overallStatus}</h2>
            <p className="text-xs text-slate-500">Status geral do sistema</p>
          </div>
        </div>
        {lastChecked && (
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            {lastChecked.toLocaleTimeString("pt-BR")}
          </span>
        )}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(([name, state]) => {
          const Icon = getServiceIcon(name);
          const isUp = state === "up";
          return (
            <div key={name} className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">

              <div className="flex justify-between items-start mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isUp ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-500"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <StatusPill state={state} />
              </div>

              <h3 className="text-lg font-bold text-slate-800 leading-tight capitalize">{name}</h3>
              <p className="text-xs text-slate-400">Serviço de infraestrutura</p>
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