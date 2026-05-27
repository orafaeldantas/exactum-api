import { useState, useEffect } from "react";
import { apiFetch } from "./api";

export function getRevenuePeriod() { 
  const [revenuePeriod, setRevenuePeriod] = useState([]);
  const [goal, setGoal] = useState([]);
  const [loading, setLoading] = useState(false);
  

  async function loadRevenue(period) {
    try {
      setLoading(true);
      const response = await apiFetch(`/analytics/revenue?period=${period}`);
      const data = await response.json();
      setRevenuePeriod(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadGoal() {
    try {
      setLoading(true);
      const response = await apiFetch(`/analytics/revenue?period=month`);
      const data = await response.json();
      setGoal(data?.total_revenue);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }

  
  return { revenuePeriod, loadRevenue, goal, loadGoal};
}


export function getRevenueDaily(){
  
  const [accumulatedRevenueDaily, setAccumulatedRevenueDaily] = useState([])
  const [loading, setLoading] = useState(false);
  
  async function loadAccumulatedRevenueDaily() {
    try {
      setLoading(true);
      const response = await apiFetch("/analytics/revenue/accumulated-revenue-day?period=month");
      const data = await response.json();
      setAccumulatedRevenueDaily(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }

  return { accumulatedRevenueDaily, loadAccumulatedRevenueDaily};
}

export function getAverageTicketMetrics(){
  
  
  const [averageTicketMetrics, setAverageTicketMetric] = useState([])
  const [loading, setLoading] = useState(false);
  
  async function loadAverageTicketMetrics(month, year) {
    try {
      setLoading(true);
      const response = await apiFetch(`/analytics/revenue/ticket-average?period=month${month}year${year}`);
      const data = await response.json();
      setAverageTicketMetric(data);
      console.log(data)
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }

  return { averageTicketMetrics, loadAverageTicketMetrics };
}


  





  