import { useState } from "react";
import { apiFetch } from "./api";

export function getDashboardMetrics() { 
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);

  async function getMetrics() {
    try {
      setLoading(true);
      const response = await apiFetch("/platform/dashboard");
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error("Error loading: ", err);
    } finally {
      setLoading(false);
    }
  }


  return { metrics, getMetrics, loading };
}


export function getInfraHealth() {
  const [infraHealth, setInfraHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  async function loadHealth() {      
      try {
        setLoading(true);
        const response = await apiFetch("/health");
        const data = await response.json();
        setInfraHealth(data);
        setLastChecked(new Date());
      } catch (err) {
        console.error("Error loading: ", err);
      } finally {
        setLoading(false);
      }
    }

    return { loadHealth, infraHealth, lastChecked, loading };
}