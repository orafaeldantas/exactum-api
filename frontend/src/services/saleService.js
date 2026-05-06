import { useState, useEffect } from "react";
import { apiFetch } from "./api";

export function getSales() { 
  const [sales, setSales] = useState([]);
  const [salesPassed, setSalesPassed] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadSales(month, year) {
    try {
      setLoading(true);
      const response = await apiFetch(`/sales?month=${month}&year=${year}`);
      const data = await response.json();
      setSales(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadSalesPassed(month, year) {
    try {
      setLoading(true);
      const response = await apiFetch(`/sales?month=${month}&year=${year}`);
      const data = await response.json();
      setSalesPassed(data);
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

    const invoicingAux = sales.reduce((acc, sale) => acc + parseFloat(sale.total_price), 0);
    const invoicing = invoicingAux.toFixed(2).replace(".", ",")

  return { sales, invoicing, loadSales, loading, salesPassed };
}

export function getSaleItems() { 
  const [saleItems, setSaleItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadSaleItems(id) {
    try {
      setLoading(true);
      const response = await apiFetch(`/sales/${id}/items`);
      const data = await response.json();
      setSaleItems(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }

  return { saleItems, loadSaleItems, loading };

}

export function getTopItems() { 
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadTopItems(month, year) {
    try {
      setLoading(true);
      const response = await apiFetch(`/sales/five-items?month=${month}&year=${year}`);
      const data = await response.json();
      setTopItems(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }

  return { topItems, loadTopItems, loading };

}
