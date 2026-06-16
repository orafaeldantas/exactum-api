import { createContext, useEffect, useState, useContext } from "react";
import { apiFetch } from "../services/api";
import { UserContext } from "../context/UserContext";
import { TenantContext } from "../context/TenantContext";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [impersonateMode, setImpersonateMode] = useState(false);
  const { setProfile } = useContext(UserContext);
  const { setTenantData } = useContext(TenantContext);
  
  async function bootstrap() {
    try {
      const response = await apiFetch("/auth/bootstrap");
  
      if (!response.ok) {
        throw new Error();
      }
  
      const data = await response.json();
  
      setTenantData(data.tenant);
      setProfile(data.user);
      setUser(data.auth);

      const isImpersonating = data?.impersonate_mode ?? false;
      setImpersonateMode(isImpersonating);
  
    } catch {
      setTenantData(null);
      setProfile(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login() {
    await bootstrap();
  }

  async function logout() {
    try {
      const response = await apiFetch("/auth/logout", {
        method: "POST"
      });

      const data = await response.json();

    } catch (err) {
      console.log(err)  
    } finally {
      setProfile(null);
      setTenantData(null);
      setUser(null);
    }
  }

  useEffect(() => {
    bootstrap();  
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,        
      impersonateMode,
      bootstrap  
    }}>
      {children}
    </AuthContext.Provider>
  );
}