import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../context/AuthContext";
import { UserContext } from "../../context/UserContext";
import { TenantContext } from "../../context/TenantContext";
import { getProducts } from "../../services/productService"; 
import { getUsers } from "../../services/userService"; 
import { getSales, getTopItems } from "../../services/saleService";
import { getRevenueDaily } from "../../services/revenueService"; 

import DashboardHeader from "../../features/dashboard/DashboardHeader";
import DashboardStats from "../../features/dashboard/DashboardStats";
import SalesGoalChart from "../../features/dashboard/charts/SalesGoalChart";
import TopProductsCard from "../../features/dashboard/cards/TopProductsCard";
import SalesChannelsCard from "../../features/dashboard/cards/SalesChannelsCard";
import AiInsightsCard from "../../features/dashboard/cards/AiInsightsCard";

import DashboardSkeleton from "../../components/Loader/DashboardSkeleton";

/**
 * @component Dashboard
 * @description Central command interface with KPIs, Target Charts, and AI Insights
 */
function Dashboard() {
  const { profile } = useContext(UserContext);
  const { tenantData } = useContext(TenantContext);
  const { lowStock = [], loadProducts } = getProducts();
  const { users = [], loadUsers } = getUsers();
  const { sales = [], invoicing, loadSales } = getSales();
  const { topItems = [], loadTopItems } = getTopItems();
  const { accumulatedRevenueDaily = [], loadAccumulatedRevenueDaily } = getRevenueDaily()

  const [isInitializing, setIsInitializing] = useState(true);

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

  const goalValue = tenantData.goal ? parseInt(tenantData.goal) : 0;

  useEffect(() => {   

    if (isAdmin(profile.role)){
      loadUsers();
    }
    
    const initData = async () => {
      try {
        await Promise.all([
          loadProducts(),
          loadSales(month, year),
          loadTopItems(month, year),
          loadAccumulatedRevenueDaily()
        ]);
      } catch (error) {
        console.error("Erro ao inicializar dashboard:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initData();

  }, [month, year]);

  if (isInitializing) {
    return <DashboardSkeleton />;
  }

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