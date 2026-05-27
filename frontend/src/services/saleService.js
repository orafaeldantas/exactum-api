import { useState, useEffect } from "react";
import { apiFetch } from "./api";

export function getSales() { 
  const [sales, setSales] = useState([]);
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

    /*
      let soma = 0;

      for(let i = 0; i < sales.length; i++) {
        soma += parseFloat(sales[i].price)
      }
    */

    const invoicing = sales.reduce((acc, sale) => acc + parseFloat(sale.total_price), 0);
    

  return { sales, invoicing, loadSales, loading};
}

export function getSaleItems() { 
  const [saleItems, setSaleItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadSaleItems(id) {
    try {
      setLoading(true);
      const response = await apiFetch(`/sales/${id}`);
      const data = await response.json();
      console.log(data)
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

  async function loadTopItems(period) {
    try {
      setLoading(true);
      const response = await apiFetch("/analytics/sold-items/best-sellers?period=month");
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

export function getSoldItems() { 
  const [soldItems, setSoldItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadSoldItems({ period = null, month = null, year = null } = {}) {
    try {
      setLoading(true);
      let url = " "
      if (period !== null) {
         url = `/analytics/sold-items?period=${period}`
      } else {
        url = `/analytics/sold-items?period=month${month}year${year}`
      }
      const response = await apiFetch(url);
      
      const data = await response.json();
      setSoldItems(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }

  return { soldItems, loadSoldItems, loading };

}
