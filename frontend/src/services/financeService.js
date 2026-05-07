import { useState, useEffect } from "react";
import { apiFetch } from "./api";

export function getFinancePeriod() { 
  const [financePeriod, setFinancePeriod] = useState([]);
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
    

  return { financePeriod, loadFinancePeriod, loading };
}

export function getFinanceToday() { 
    const [financeToday, setFinanceToday] = useState([]);
    const [loading, setLoading] = useState(false);


    const today = new Date();

    const [day] = useState(
        today.getDate().toString().padStart(2, "0")
    );

  
    async function loadFinanceToday() {
      try {
        setLoading(true);
        const response = await apiFetch(`/finance/period?period=${day}`);
        const data = await response.json();
        setFinanceToday(data);
      } catch (err) {
        console.error("Erro ao carregar:", err);
      } finally {
        setLoading(false);
      }
    }
      
  
    return { financeToday, loadFinanceToday, loading};
  }

/*
        {
            receita_total,
            total_de_vendas,
            total_produtos_vendidos,
            ticket_medio,
            meta_mensal
        }

*/
  