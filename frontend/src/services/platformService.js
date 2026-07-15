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

export function getTenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadTenants() {
    try {
      setLoading(true);
      const response = await apiFetch("/platform/tenants");
      const data = await response.json();
      setTenants(data);
    } catch (err) {
      console.error("Error loading: ", err);
    } finally {
      setLoading(false);
    }
  }

  return { loadTenants, tenants, loading };

}

export function getPlatformEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadEvents() {      
      try {
        setLoading(true);
        const response = await apiFetch("/platform/events");
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        console.error("Error loading: ", err);
      } finally {
        setLoading(false);
      }
    }

    return { loadEvents, events, loading };
}

export function getInfraLogs() {
  const [dataLogs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadInfraLogs() {      
      try {
        setLoading(true);
        const response = await apiFetch("/platform/logs");
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        console.error("Error loading: ", err);
      } finally {
        setLoading(false);
      }
    }

    return { loadInfraLogs, dataLogs, loading };
}