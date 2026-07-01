import { createContext, useState } from "react";

export const SuperAdminContext = createContext();

export function SuperAdminProvider({ children }) {

    const [superAdmin, setSuperAdmin] = useState(false);


    return (
        <SuperAdminContext.Provider value={{ superAdmin, setSuperAdmin }}> {children} </SuperAdminContext.Provider>
    );

}