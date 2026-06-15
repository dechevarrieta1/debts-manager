import { type Client } from "../api/triage";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Phone, CalendarClock, AlertTriangle } from "lucide-react";
import { ActionModal } from "./ActionModal";

interface TriageTableProps {
  clients: Client[];
}

export function TriageTable({ clients }: TriageTableProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const getPriorityConfig = (priority: number) => {
    switch (priority) {
      case 1: return { label: "CRÍTICO", classes: "bg-red-50 text-red-600 border-red-200", icon: <AlertTriangle className="w-3 h-3 mr-1" /> };
      case 2: return { label: "ALTO", classes: "bg-orange-50 text-orange-600 border-orange-200", icon: null };
      case 3: return { label: "MEDIO", classes: "bg-yellow-50 text-yellow-600 border-yellow-200", icon: null };
      case 4: return { label: "BAJO", classes: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: null };
      default: return { label: "DESCONOCIDO", classes: "bg-slate-100 text-slate-500", icon: null };
    }
  }

  const getSegmentConfig = (segment: string) => {
    switch (segment) {
      case "zombi": return "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200";
      case "startup": return "bg-blue-50 text-blue-600 border-blue-200";
      case "grande": return "bg-indigo-50 text-indigo-600 border-indigo-200";
      default: return "bg-slate-100 text-slate-500 border-slate-200";
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-100 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium tracking-wider">Prioridad</th>
              <th className="px-6 py-4 font-medium tracking-wider">Cliente</th>
              <th className="px-6 py-4 font-medium tracking-wider">Segmento</th>
              <th className="px-6 py-4 font-medium tracking-wider text-right">Deuda Total</th>
              <th className="px-6 py-4 font-medium tracking-wider text-right">Días Vencidos</th>
              <th className="px-6 py-4 font-medium tracking-wider">Última Acción</th>
              <th className="px-6 py-4 font-medium tracking-wider text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {clients.map((client) => {
              const prio = getPriorityConfig(client.priority);

              return (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className={`font-mono text-xs font-semibold ${prio.classes}`}>
                      {prio.icon}{prio.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{client.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 font-mono">ID: {client.id.split('-')[0]}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className={`capitalize font-medium ${getSegmentConfig(client.segment)}`}>
                      {client.segment}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="font-mono font-medium text-slate-800">
                      ${client.total_debt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-600">
                      <CalendarClock className="w-4 h-4 opacity-50" />
                      <span className="font-mono">{client.max_days_overdue}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {client.latest_action ? (
                      <div>
                        <div className="text-slate-800 font-medium">{client.latest_action}</div>
                        <div className="text-xs text-slate-500">
                          {client.latest_action_date ? format(new Date(client.latest_action_date), 'MMM dd, yyyy') : ''}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Sin acción previa</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button
                      size="sm"
                      onClick={() => setSelectedClient(client)}
                      className="opacity-0 group-hover:opacity-100 transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    >
                      <Phone className="w-4 h-4 mr-2" /> Gestionar
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ActionModal
        client={selectedClient}
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
      />
    </>
  );
}
