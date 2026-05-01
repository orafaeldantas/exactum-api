import { useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"
import { getProducts } from "../services/productService"; 
import { getUsers } from "../services/userService"; 
import { getSales } from "../services/saleService"; 
import { useNavigate } from "react-router-dom"
import { 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  DollarSign,
  ShoppingCart,
  Star,
  Globe,
  ShoppingBag
} from "lucide-react"

/**
 * @component Dashboard
 * @description Central command interface for the ERP. 
 * Manages real-time inventory alerts, sales performance visualization, and marketplace integration status.
 */
function Dashboard() {
  const { user } = useContext(AuthContext)
  const { lowStock = [], products = [], loadProducts } = getProducts();
  const { users = [], loadUsers } = getUsers();
  const { sales = [], loadSales } = getSales();    

  const navigate = useNavigate()

  /**
   * @constant {Array} monthlyData
   * @description Mock data for sales trend visualization. 
   * Compares Physical vs Online revenue.
   */
  const monthlyData = [
    { month: "Jan", physical: 40, online: 25 },
    { month: "Fev", physical: 35, online: 30 },
    { month: "Mar", physical: 45, online: 28 },
    { month: "Abr", physical: 30, online: 48 },
  ]

  /**
   * @constant {Array} stats
   * @description KPI configuration for the top metrics grid.
   */
  const stats = [
    { 
      label: "Total de Produtos", 
      value: products.length,
      icon: <Package className="w-5 h-5" />, 
      change: "+12%", 
      isPositive: true,
      path: "/products"
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
      value: "R$ 45.200", 
      icon: <DollarSign className="w-5 h-5" />, 
      change: "+18%", 
      isPositive: true,
      path: "/finance"
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

  /**
   * @hook useEffect
   * @description Initial data fetch on component mount.
   */
  useEffect(() => {   
    loadProducts();
    loadUsers();
    loadSales();
  }, []);
  

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      
      {/* --- DASHBOARD HEADER --- */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Bem-vindo de volta, <span className="font-semibold text-blue-600">{user?.username || 'Administrador'}</span>. Aqui está o resumo do seu negócio.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm text-sm">
           <div className="px-3 py-1 bg-slate-100 rounded-md flex items-center gap-2">
            <Users size={14} className="text-slate-400" />
            <span className="font-bold text-slate-700">{users.length} Usuários Ativos</span>
          </div>
          <div className="px-3 py-1 bg-blue-50 rounded-md border border-blue-100 font-bold text-blue-700">
            {user?.role || 'Admin'}
          </div>
        </div>
      </div>

      {/* --- KPI METRICS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className="group relative flex flex-col text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 outline-none"
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
            
            <div className="absolute bottom-0 left-0 h-1 bg-blue-500 w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl"></div>
          </button>
        ))}
      </div>

      {/* --- MAIN ANALYTICS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* SALES PERFORMANCE CHART (OMNICHANNEL VIEW) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-xl font-black text-slate-900">Desempenho de Vendas</h4>
              <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                <Globe size={14} className="text-blue-500" /> Omnichannel: Crescimento Físico + Online
              </p>
            </div>
            <select className="bg-slate-50 border-none text-xs font-bold text-slate-600 rounded-lg p-2 outline-none cursor-pointer">
              <option>Últimos 6 Meses</option>
              <option>Ano Atual</option>
            </select>
          </div>

          {/* SIMULATED BAR CHART */}
          <div className="flex items-end justify-between h-64 gap-4 px-4 border-b border-slate-100">
            {monthlyData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex flex-row items-end justify-center gap-1 h-full">
                  {/* Physical Store Bar */}
                  <div 
                    className="w-full max-w-[12px] bg-slate-200 rounded-t-sm transition-all group-hover:bg-slate-300" 
                    style={{ height: `${data.physical}%` }}
                  ></div>
                  {/* Online Marketplace Bar */}
                  <div 
                    className="w-full max-w-[12px] bg-blue-600 rounded-t-sm transition-all group-hover:bg-blue-700" 
                    style={{ height: `${data.online}%` }}
                  ></div>
                  
                  {/* TOOLTIP */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-slate-800 text-white text-[10px] py-1 px-2 rounded font-bold transition-opacity whitespace-nowrap z-10 shadow-lg">
                    Online: {data.online}% | Físico: {data.physical}%
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{data.month}</span>
              </div>
            ))}
          </div>
          
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div> Vendas Online
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <div className="w-3 h-3 bg-slate-200 rounded-full"></div> Loja Física
            </div>
          </div>
        </div>

        {/* TOP SELLING PRODUCTS RANKING */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Ranking de Top Vendidos
            </h4>
            <button onClick={() => navigate("/products")} className="text-xs font-bold text-blue-600 hover:underline">Ver Todos</button>
          </div>
          
          <div className="space-y-6">
            {products.slice(0, 5).map((prod, i) => (
              <div key={prod.id} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {i + 1}º
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate w-24 xl:w-40">{prod.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-500 font-medium">{prod.stock_quantity} unidades restantes</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900">R$ {Number(prod.price).toFixed(2)}</p>
                  <p className="text-[10px] font-bold text-emerald-600">+12%</p>
                </div>
              </div>
            ))}
            
            {products.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-10">Nenhum dado de venda disponível.</p>
            )}
          </div>

          <button className="w-full mt-8 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-xs font-bold hover:border-blue-300 hover:text-blue-500 transition-all">
            Gerar Relatório de Performance
          </button>
        </div>
      </div>

      {/* --- SECONDARY WIDGETS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MARKETPLACE INTEGRATION STATUS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h4 className="text-lg font-bold text-slate-900 mb-6">Integração com Marketplaces</h4>
          <div className="space-y-4 flex-1">
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-orange-600 shadow-sm">ML</div>
                <div>
                  <p className="text-xs font-bold text-orange-900">Mercado Livre</p>
                  <p className="text-[10px] text-orange-700 font-medium">8 pedidos pendentes</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-orange-400" />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-600 shadow-sm">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Loja Oficial</p>
                  <p className="text-[10px] text-slate-500 font-medium">Sincronização ativa...</p>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
          </div>
          <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
            Configurar Canais de Venda
          </button>
        </div>

        {/* AI TREND ANALYSIS PREVIEW */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="z-10 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase mb-4">
              <TrendingUp size={12} /> Motor Preditivo de IA
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">Previsão de Demanda</h4>
            <p className="text-slate-400 text-sm max-w-sm">
              Nossa IA está analisando seu histórico para prever as necessidades de estoque do próximo mês.
            </p>
          </div>
          <div className="z-10 flex flex-col items-center gap-2">
            <div className="text-4xl font-black text-blue-500">+24%</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
              Crescimento esperado <br/> em Eletrônicos Online
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

/**
 * @component ArrowRight
 * @description Icon helper for directional actions.
 */
function ArrowRight(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  )
}

export default Dashboard