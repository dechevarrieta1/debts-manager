import { useDashboardKPIs } from "../service/triage";
import { AlertCircle, TrendingUp, AlertTriangle, Users } from "lucide-react";

export function DashboardMetrics() {
  const { data: kpis, isLoading, isError, error } = useDashboardKPIs();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl border border-slate-200 bg-white shadow-sm"></div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 flex items-center justify-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="text-sm">Error al cargar métricas: {error?.message}</span>
      </div>
    );
  }

  if (!kpis) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">

      {/* Total Overdue Debt */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Deuda Total Vencida</h3>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">
              ${kpis.total_overdue_debt?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* At Risk Debt */}
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-red-600">En Riesgo (Startup/Zombi)</h3>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-red-900">
              ${kpis.at_risk_debt?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 Debtors */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Top 3 Deudores</h3>
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {kpis.top_debtors && kpis.top_debtors.length > 0 ? (
              kpis.top_debtors.map((client, idx) => (
                <div key={client.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-xs font-mono text-slate-400">#{idx + 1}</span>
                    <span className="text-sm font-medium text-slate-800 truncate">{client.name}</span>
                  </div>
                  <span className="text-sm font-mono text-slate-500">
                    ${client.total_debt.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-sm text-slate-400">Sin deudores vencidos</span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
