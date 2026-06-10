import { useState, useContext } from "react";
import { apiFetch } from "./api";
import { TenantContext } from "../context/TenantContext";


export function getProducts() { 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { tenantData } = useContext(TenantContext); 

  async function loadProducts() {
    try {
      setLoading(true);
      const response = await apiFetch("/products");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }


  const lowStock = products.filter(p => p.stock_quantity <= tenantData.global_min_stock ?? 0);

  return { products, lowStock, loadProducts, loading };
}