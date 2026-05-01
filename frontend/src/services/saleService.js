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
    /*
      let soma = 0;

      for(let i = 0; i < sales.length; i++) {
        soma += parseFloat(sales[i].price)
      }
    */

    const invoicingAux = sales.reduce((acc, sale) => acc + parseFloat(sale.price), 0);
    const invoicing = invoicingAux.toFixed(2).replace(".", ",")

  return { sales, invoicing, loadSales, loading };
}