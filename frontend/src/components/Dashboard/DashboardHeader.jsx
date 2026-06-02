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
            {totalUsers && (
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm text-sm">
                    <div className="px-3 py-1 bg-slate-100 rounded-md flex items-center gap-2">
                        <Users size={14} className="text-slate-400" />
                        <span className="font-bold text-slate-700">{totalUsers} Usuários</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardHeader;