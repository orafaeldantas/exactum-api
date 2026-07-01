import { createContext, useEffect, useState, useContext } from "react";
import { apiFetch } from "../services/api";
import { UserContext } from "../context/UserContext";
import { TenantContext } from "../context/TenantContext";
import { SuperAdminContext } from "../context/SuperAdminContext";
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [impersonateMode, setImpersonateMode] = useState(false);
  const [permissions, setPermissions] = useState("");
  const { setProfile } = useContext(UserContext);
  const { setTenantData } = useContext(TenantContext);
  const { setSuperAdmin } = useContext(SuperAdminContext);
  
  async function bootstrap() {
    try {
      const response = await apiFetch("/auth/bootstrap");
  
      if (!response.ok) {
        throw new Error();
      }
  
      const data = await response.json();

      if (data?.is_super_admin) {
        setSuperAdmin(data?.is_super_admin);             
      } else {
        setTenantData(data?.tenant);       
      }
  
      setProfile(data?.user);
      setUser(data?.auth);
      setPermissions(data?.auth?.permissions);  
  
      const isImpersonating = data?.impersonate_mode ?? false;
      setImpersonateMode(isImpersonating);
  
      return data; 
  
    } catch {
      setSuperAdmin(false);
      setTenantData(null);
      setProfile(null);
      setUser(null);
      return null; 
    } finally {
      setLoading(false);
    }
  }

  async function login() {
    const bootstrapData = await bootstrap();

    if (!bootstrapData) {
      console.error("Authentication failed");
      return;
    }
  
    if (bootstrapData?.is_super_admin) {
      navigate("/system/dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
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
      setSuperAdmin(false);
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
      bootstrap,
      permissions,  
    }}>
      {children}
    </AuthContext.Provider>
  );
}