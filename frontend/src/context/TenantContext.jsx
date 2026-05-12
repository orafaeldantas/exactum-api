import { createContext, useState } from "react";

export const TenantContext = createContext();

export function TenantProvider({ children }) {

    const [tenantData, setTenantData] = useState(null);


    return (
        <TenantContext.Provider value={{ tenantData, setTenantData }}> {children} </TenantContext.Provider>
    );

}