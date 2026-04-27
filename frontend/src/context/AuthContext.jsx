import { createContext, useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  

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
    setUser(null);
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}