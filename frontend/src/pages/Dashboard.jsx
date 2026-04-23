import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react"

function Dashboard() {
  const { user } = useContext(AuthContext)

  // Dados estáticos para visualização prévia
  const stats = [
    { 
      label: "Total de Produtos", 
      value: "1,284", 
      icon: <Package className="w-6 h-6" />, 
      change: "+12%", 
      isPositive: true 
    },
    { 
      label: "Alertas de Estoque", 
      value: "14", 
      icon: <AlertTriangle className="w-6 h-6" />, 
      change: "-2", 
      isPositive: true 
    },
    { 
      label: "Usuários Ativos", 
      value: "42", 
      icon: <Users className="w-6 h-6" />, 
      change: "+5%", 
      isPositive: true 
    },
    { 
      label: "Previsão Mensal", 
      value: "R$ 45.200", 
      icon: <TrendingUp className="w-6 h-6" />, 
      change: "+18%", 
      isPositive: true 
    },
  ]

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* HEADER DO DASHBOARD */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Bem-vindo de volta, <span className="font-semibold text-blue-600">{user?.username || 'Administrador'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="px-3 py-1 bg-slate-100 rounded-md">
            <span className="text-[10px] uppercase font-bold text-slate-500">ID do Usuário</span>
            <p className="text-xs font-mono font-bold text-slate-700">{user?.id || '---'}</p>
          </div>
          <div className="px-3 py-1 bg-blue-50 rounded-md border border-blue-100">
            <span className="text-[10px] uppercase font-bold text-blue-600">Nível de Acesso</span>
            <p className="text-xs font-bold text-blue-700 capitalize">{user?.role || '---'}</p>
          </div>
        </div>
      </div>

      {/* GRID DE MÉTRICAS (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                {item.icon}
              </div>
              <span className={`flex items-center text-xs font-bold ${item.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {item.change}
                {item.isPositive ? <ArrowUpRight className="w-3 h-3 ml-0.5" /> : <ArrowDownRight className="w-3 h-3 ml-0.5" />}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{item.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ÁREA DE CONTEÚDO (PLACEHOLDERS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Espaço para Gráfico Principal */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[400px] flex flex-col items-center justify-center text-center border-dashed">
          <div className="bg-slate-50 p-4 rounded-full mb-4">
            <TrendingUp className="w-8 h-8 text-slate-300" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Análise de Tendência Predisposta</h4>
          <p className="text-sm text-slate-400 max-w-xs mt-2">
            Os gráficos de IA aparecerão aqui assim que os primeiros dados de estoque forem processados.
          </p>
        </div>

        {/* Espaço para Atividades Recentes ou Alertas */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
            Ações Rápidas
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">3 Pendentes</span>
          </h4>
          
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer group">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">Atualizar estoque mínimo</p>
                  <p className="text-[11px] text-slate-500">Sugestão automática da Exactum IA</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}

// Pequeno componente interno para o ícone de seta (apenas para o exemplo acima)
function ArrowRight(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  )
}

export default Dashboard