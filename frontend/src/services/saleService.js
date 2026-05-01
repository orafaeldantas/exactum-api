import { useState, useEffect } from "react";
import { apiFetch } from "./api";

export function getSales() { 
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadSales() {
    try {
      setLoading(true);
      const response = await apiFetch("/sales");
      const data = await response.json();
      setSales(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }


  return { sales, loadSales, loading };
}