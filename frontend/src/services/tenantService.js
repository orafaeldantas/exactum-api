import { useState } from "react";
import { apiFetch } from "./api";

export function getTenantData() { 
  const [tenantData, setTenantData] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadTenantData() {
    try {
      setLoading(true);
      const response = await apiFetch("/tenants/data");
      const data = await response.json();
      setTenantData(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }


  return { tenantData, loadTenantData, loading };
}