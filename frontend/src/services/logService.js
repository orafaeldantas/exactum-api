import { useState } from "react";
import { apiFetch } from "./api";

export function getAuditLogs() { 
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAuditLogs() {
    try {
      setLoading(true);
      const response = await apiFetch("/tenants/logs");
      const data = await response.json();
      setAuditLogs(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }


  return { auditLogs, loadAuditLogs, loading };
}