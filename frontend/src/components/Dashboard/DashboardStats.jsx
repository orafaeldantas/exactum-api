import { useNavigate } from "react-router-dom";

import { 
    TrendingUp, 
    AlertTriangle, 
    ArrowUpRight, 
    ArrowDownRight,
    DollarSign,
    ShoppingCart,
  } from "lucide-react"


function DashboardStats({
    ticketMedio,
    totalSales,
    invoicing,
    lowStock,
}) {

    const navigate = useNavigate()

    const stats = [
        { 
          label: "Ticket Médio", 
          value: `R$ ${ticketMedio}`,
          icon: <TrendingUp className="w-5 h-5" />, 
          change: "+5%", 
          isPositive: true,
          path: "/average-ticket"
        },
        { 
          label: "Vendas (Mês)", 
          value: totalSales, 
          icon: <ShoppingCart className="w-5 h-5" />, 
          change: "+8%", 
          isPositive: true,
          path: "/sales"
        },
        { 
          label: "Receita Mensal", 
          value: `R$ ${invoicing}`, 
          icon: <DollarSign className="w-5 h-5" />, 
          change: "+18%", 
          isPositive: true,
          path: "/revenue"
        },
        { 
          label: "Alertas de Estoque", 
          value: lowStock, 
          icon: <AlertTriangle className="w-5 h-5" />, 
          change: lowStock > 0 ? "Ação Necessária" : "Estável", 
          isPositive: lowStock === 0, 
          path: "/low-stock" 
        },
      ]

    return (
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
    );
}

export default DashboardStats;