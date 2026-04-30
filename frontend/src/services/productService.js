import { useState, useEffect } from "react"; // VOCÊ PROVAVELMENTE ESQUECEU ISSO
import { apiFetch } from "./api"; 

export function getProducts() { 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

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


  const lowStock = products.filter(p => p.stock_quantity <= 10);

  return { products, lowStock, loadProducts, loading };
}