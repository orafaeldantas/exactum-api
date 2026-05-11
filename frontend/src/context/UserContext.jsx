import { createContext, useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [loadingProfile, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    async function loadUser() {
        try {
          const response = await apiFetch("/users/me");
          const data = await response.json();
          setProfile(data);
          console.log(data)
        } catch {
            setProfile(null);
        } finally {
          setLoading(false);
        }
      }
      
    useEffect(() => {
        loadUser()
      }, []);

    return (
        <UserContext.Provider value={{ profile, loadingProfile }}> {children} </UserContext.Provider>
    );

}