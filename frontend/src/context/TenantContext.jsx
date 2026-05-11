import { createContext, useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export const TenantContext = createContext();

export function TenantProvider({ children }) {
    const [loadingTenant, setLoading] = useState(true);
    const [tenantData, setTenantData] = useState(null);

    async function loadTenant() {
        try {
            const response = await apiFetch("/tenants/data");
          const data = await response.json();
          setTenantData(data);
          console.log(data)
        } catch {
            setTenantData(null);
        } finally {
          setLoading(false);
        }
      }
      
    useEffect(() => {
        loadTenant()
      }, []);

    return (
        <TenantContext.Provider value={{ tenantData, loadingTenant }}> {children} </TenantContext.Provider>
    );

}