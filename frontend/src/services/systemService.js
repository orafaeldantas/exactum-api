import { useState } from "react";
import { apiFetch } from "./api";

export function getDashboardMetrics() { 
  const [kpi, setKpi] = useState([]);
  const [loading, setLoading] = useState(false);

  async function getKPIs() {
    try {
      setLoading(true);
      const response = await apiFetch("/platform/dashboard");
      const data = await response.json();
      setKpi(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }


  return { kpi, getKPIs, loading };
}