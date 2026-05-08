import { useState, useEffect } from "react";
import { apiFetch } from "./api";

export function getFinancePeriod() { 
  const [financePeriod, setFinancePeriod] = useState([]);
  const [financeGoal, setFinanceGoal] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadFinancePeriod(period) {
    try {
      setLoading(true);
      const response = await apiFetch(`/finance/period?period=${period}`);
      const data = await response.json();
      setFinancePeriod(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadFinanceGoal() {
    try {
      setLoading(true);
      const response = await apiFetch(`/finance/period?period=month`);
      const data = await response.json();
      setFinanceGoal(data?.total_revenue);
      console.log(data)
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }
    

  return { financePeriod, loadFinancePeriod, financeGoal, loadFinanceGoal};
}


  