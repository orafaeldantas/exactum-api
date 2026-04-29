import { createContext, useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateUserResetPassword = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
    console.log(user.password_reset)
  };

  async function loadUser() {
    if (!sessionStorage.getItem('access_token')) {
      setUser(null);
      setLoading(false);
      return; 
    }
    try {
      const response = await apiFetch("/auth/me");
      const data = await response.json();
      setUser(data);
      console.log(data.role)
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(token) {
    sessionStorage.setItem('access_token', token);
    await loadUser();
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
      await loadUser();
      
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
        await loadUser();

        // 3. Return to your control panel
        window.location.href = "/manage-companies";
      }
    } catch (error) {
      console.error("Failed to restore identity", error);
    }
  }

  // --- END: Impersonation Logic ---

  useEffect(() => {
    loadUser();  
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      updateUserResetPassword,
      impersonate,       // Exported for ManageCompanies
      stopImpersonating  // Exported for Sidebar
    }}>
      {children}
    </AuthContext.Provider>
  );
}