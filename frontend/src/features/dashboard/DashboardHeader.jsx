import { Users } from "lucide-react"


function DashboardHeader({
    username,
    totalUsers
}) {

    return (
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 mt-1">
                        Bem-vindo, <span className="font-semibold text-blue-600">{username || 'Administrador'}</span>.
                    </p>
            </div>
            
            {totalUsers > 0 && (
                <div className="flex items-center gap-2.5 bg-white pl-3 pr-1.5 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs">
                    <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Time
                    </span>
                    <div className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-1.5 font-bold text-slate-700">
                        <Users size={13} className="text-slate-400" />
                        <span>
                            {totalUsers} {totalUsers === 1 ? 'Usuário' : 'Usuários'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardHeader;