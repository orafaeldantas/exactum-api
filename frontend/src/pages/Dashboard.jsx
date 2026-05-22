import { useContext, useEffect, useState } from "react"
import { UserContext } from "../context/UserContext";
import { TenantContext } from "../context/TenantContext";
import { getProducts } from "../services/productService"; 
import { getUsers } from "../services/userService"; 
import { getSales, getTopItems } from "../services/saleService"; 
import { useNavigate } from "react-router-dom"
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  Target,
  PieChart,
  Zap,
  ChevronRight,
  Star
} from "lucide-react"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from "recharts";

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
  
  const today = new Date();
  const [month] = useState((today.getMonth() + 1).toString().padStart(2, '0'));
  const [year] = useState(today.getFullYear().toString());
  const navigate = useNavigate()


  const invoicingFormated = invoicing.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const ticketMedio = sales.length > 0 ? invoicing / sales.length : "0,00";
  const ticketMedioFormated = ticketMedio.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const goalValue = tenantData.goal ? parseInt(tenantData.goal) : 0;

  const salesGoalChart = [
    { day: "01", revenue: 4200 },
    { day: "05", revenue: 9200 },
    { day: "10", revenue: 17500 },
    { day: "15", revenue: 26000 },
    { day: "20", revenue: 39000 },
    { day: "25", revenue: 57000 },
    { day: "30", revenue: 78000 }
  ];
  
  const progress =
    goalValue > 0
      ? Math.min((invoicing / goalValue) * 100, 100)
      : 0;


  const stats = [
    { 
      label: "Ticket Médio", 
      value: `R$ ${ticketMedioFormated}`,
      icon: <TrendingUp className="w-5 h-5" />, 
      change: "+5%", 
      isPositive: true,
      path: "/average-ticket"
    },
    { 
      label: "Vendas (Mês)", 
      value: sales.length, 
      icon: <ShoppingCart className="w-5 h-5" />, 
      change: "+8%", 
      isPositive: true,
      path: "/sales"
    },
    { 
      label: "Receita Mensal", 
      value: `R$ ${invoicingFormated}`, 
      icon: <DollarSign className="w-5 h-5" />, 
      change: "+18%", 
      isPositive: true,
      path: "/revenue"
    },
    { 
      label: "Alertas de Estoque", 
      value: lowStock.length, 
      icon: <AlertTriangle className="w-5 h-5" />, 
      change: lowStock.length > 0 ? "Ação Necessária" : "Estável", 
      isPositive: lowStock.length === 0, 
      path: "/low-stock" 
    },
  ]

  useEffect(() => {   
    loadProducts();
    loadUsers();
    loadSales(month, year);
    loadTopItems(month, year);
  }, [month, year]);

  return (
    <div className="animate-in fade-in duration-500 pb-10 h-full min-h-0 overflow-y-auto pr-3 custom-scroll">
      
      {/* --- HEADER --- */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Bem-vindo, <span className="font-semibold text-blue-600">{profile?.username || 'Administrador'}</span>.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm text-sm">
           <div className="px-3 py-1 bg-slate-100 rounded-md flex items-center gap-2">
            <Users size={14} className="text-slate-400" />
            <span className="font-bold text-slate-700">{users.length} Usuários</span>
          </div>
        </div>
      </div>

      {/* --- KPI GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className="group relative flex flex-col text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 outline-none overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                {item.icon}
              </div>
              <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${item.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {item.change}
                {item.isPositive ? <ArrowUpRight className="w-3 h-3 ml-0.5" /> : <ArrowDownRight className="w-3 h-3 ml-0.5" />}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{item.value}</h3>
            <div className="absolute bottom-0 left-0 h-1 bg-blue-500 w-0 group-hover:w-full transition-all duration-500"></div>
          </button>
        ))}
      </div>

      {/* --- ANALYTICS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-xl font-black text-slate-900">Vendas Acumuladas</h4>
              <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                <Target size={14} className="text-blue-500" /> Comparativo vs Meta Mensal
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>

            <AreaChart data={salesGoalChart}>

              <defs>

                <linearGradient
                  id="salesGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35}/>
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>

              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="4 4"
              />

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
              />

              <Tooltip />

              <ReferenceLine
                y={goalValue}
                stroke="#f59e0b"
                strokeDasharray="6 6"
                label="META"
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={4}
                fill="url(#salesGradient)"
              />

            </AreaChart>

          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Star className="text-amber-400 fill-amber-400" size={20} /> Produtos Mais Vendidos
            </h4>
          </div>
          <div className="p-2">
            {topItems.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-sm">
                    #{i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{item.category || 'Geral'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{item.total_quantity} un.</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Em alta</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-50">
            <button onClick={() => navigate('/products')} className="w-full py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center gap-1">
              Ver catálogo completo <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <PieChart className="text-slate-400" size={20} /> Canais de Venda
          </h4>
          <div className="space-y-6">
            {[
              { name: "Loja Física", value: 65, color: "bg-blue-600" },
              { name: "Marketplace", value: 25, color: "bg-emerald-500" },
              { name: "WhatsApp", value: 10, color: "bg-amber-500" }
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-tighter">
                  <span className="text-slate-500">{item.name}</span>
                  <span className="text-slate-900">{item.value}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-blue-50 rounded-2xl flex items-center gap-3">
            <PieChart className="text-blue-600 flex-shrink-0" size={20} />
            <p className="text-[11px] font-bold text-blue-800 leading-tight">
              A Loja Física superou a meta de participação em 5% este mês.
            </p>
          </div>
        </div>

        {/* INSIGHTS DE IA */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={120} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Zap size={20} className="text-white fill-white" />
              </div>
              <h4 className="text-lg font-black tracking-tight">Análise Inteligente</h4>
            </div>

            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:border-blue-500 transition-all cursor-default">
                <p className="text-blue-400 text-xs font-black uppercase mb-1">Previsão de Estoque</p>
                <p className="text-sm font-medium leading-relaxed">
                  ...
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:border-emerald-500 transition-all cursor-default">
                <p className="text-emerald-400 text-xs font-black uppercase mb-1">Oportunidade de Venda</p>
                <p className="text-sm font-medium leading-relaxed">
                  ...
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 italic">
                <p className="text-xs text-slate-400">
                  "O Ticket Médio está 12% acima do registrado no mesmo período do mês passado."
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard;