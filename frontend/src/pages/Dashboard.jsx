import { useContext, useEffect, useState } from "react"
import { UserContext } from "../context/UserContext";
import { TenantContext } from "../context/TenantContext";
import { getProducts } from "../services/productService"; 
import { getUsers } from "../services/userService"; 
import { getSales, getTopItems } from "../services/saleService";
import { getRevenueDaily } from "../services/revenueService"; 

import DashboardHeader from "../components/Dashboard/DashboardHeader";
import DashboardStats from "../components/Dashboard/DashboardStats";
import SalesGoalChart from "../components/Dashboard/charts/SalesGoalChart";
import TopProductsCard from "../components/Dashboard/cards/TopProductsCard";
import SalesChannelsCard from "../components/Dashboard/cards/SalesChannelsCard";
import AiInsightsCard from "../components/Dashboard/cards/AiInsightsCard";

/**
 * @component Dashboard
 * @description Interface de comando central com KPIs, Gráficos de Meta e Insights de IA.
 */
function Dashboard() {
  const { profile } = useContext(UserContext);
  const { tenantData } = useContext(TenantContext);
  const { lowStock = [], loadProducts } = getProducts();
  const { users = [], loadUsers } = getUsers();
  const { sales = [], invoicing, loadSales } = getSales();
  const { topItems = [], loadTopItems } = getTopItems();
  const { accumulatedRevenueDaily = [], loadAccumulatedRevenueDaily } = getRevenueDaily()
  
  const today = new Date();
  const [month] = useState((today.getMonth() + 1).toString().padStart(2, '0'));
  const [year] = useState(today.getFullYear().toString());

  const invoicingFormated = invoicing.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const ticketMedio = sales.length > 0 ? invoicing / sales.length : "0,00";
  const ticketMedioFormated = ticketMedio.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const isAdmin = (role) => ["admin", "super-admin"].includes(role);

  /* CHARTS */ 
  const goalValue = tenantData.goal ? parseInt(tenantData.goal) : 0;

  

  /* END CHARTS */ 

  useEffect(() => {   
    loadProducts();
    if (isAdmin(profile.role)) {
      loadUsers();
    }
    loadSales(month, year);
    loadTopItems(month, year);
    loadAccumulatedRevenueDaily()
  }, [month, year]);

  return (
    <div className="animate-in fade-in duration-500 pb-10 h-full min-h-0 overflow-y-auto pr-3 custom-scroll">
      
      <DashboardHeader
        username={profile?.username}
        totalUsers={users.length}
      />

      <DashboardStats
        ticketMedio={ticketMedioFormated}
        totalSales={sales.length}
        invoicing={invoicingFormated}
        lowStock={lowStock.length}
      />

      {/* --- ANALYTICS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        <SalesGoalChart
          goalValue={goalValue}
          invoicing={invoicing}
          accumulatedRevenueDaily={accumulatedRevenueDaily}
        />

        <TopProductsCard
          topItems={topItems}
        />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
         <SalesChannelsCard />    

         <AiInsightsCard />
        

      </div>
    </div>
  )
}

export default Dashboard;