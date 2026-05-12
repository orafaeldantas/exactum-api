import { createContext, useEffect, useState, useContext } from "react";
import { apiFetch } from "../services/api";
import { UserContext } from "../context/UserContext";
import { TenantContext } from "../context/TenantContext";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null)
  const { setProfile } = useContext(UserContext);
  const { setTenantData } = useContext(TenantContext);
  

  async function bootstrap() {
    if (!sessionStorage.getItem('access_token')) {
      setProfile(null);
      setTenantData(null);
      setUser(null)
      setLoading(false);
      return; 
    }
    try {
      const response = await apiFetch("/auth/bootstrap");
      const data = await response.json();
      setTenantData(data.tenant);
      setProfile(data.user);
      setUser(data.auth);
    
    } catch {
      setTenantData(null);
      setProfile(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(token) {
    sessionStorage.setItem('access_token', token);
    await bootstrap();
  }

  function logout() {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('super_token'); // Clean up backup on logout
    setUser(null);
  }

  // --- NEW: Impersonation Logic ---

  async function impersonate(tenantToken) {
    try {
      // 1. Backup your master access_token
      const masterToken = sessionStorage.getItem('access_token');
      sessionStorage.setItem('super_token', masterToken);

      // 2. Set the tenant token as the primary one
      sessionStorage.setItem('access_token', tenantToken);

      // 3. Reload user to update global state with tenant info
      await bootstrap();
      
      // 4. Force a hard reload to clear any remaining state in other components
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Impersonation failed", error);
    }
  }

  async function stopImpersonating() {
    try {
      const backupToken = sessionStorage.getItem('super_token');

      if (backupToken) {
        // 1. Restore your original super-admin token
        sessionStorage.setItem('access_token', backupToken);
        sessionStorage.removeItem('super_token');

        // 2. Reload user to restore your original identity
        await bootstrap();

        // 3. Return to your control panel
        window.location.href = "/manage-companies";
      }
    } catch (error) {
      console.error("Failed to restore identity", error);
    }
  }

  // --- END: Impersonation Logic ---

  useEffect(() => {
    bootstrap();  
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      impersonate,       
      stopImpersonating  
    }}>
      {children}
    </AuthContext.Provider>
  );
}