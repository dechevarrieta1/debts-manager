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
      case 1: return { label: "CRITICAL", classes: "bg-red-500/15 text-red-400 border-red-500/30", icon: <AlertTriangle className="w-3 h-3 mr-1" /> };
      case 2: return { label: "HIGH", classes: "bg-orange-500/15 text-orange-400 border-orange-500/30", icon: null };
      case 3: return { label: "MEDIUM", classes: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: null };
      case 4: return { label: "LOW", classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: null };
      default: return { label: "UNKNOWN", classes: "bg-zinc-800 text-zinc-400", icon: null };
    }
  }

  const getSegmentConfig = (segment: string) => {
    switch (segment) {
      case "zombi": return "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20";
      case "startup": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "grande": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      default: return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-zinc-950/50 text-zinc-400 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 font-medium tracking-wider">Priority</th>
              <th className="px-6 py-4 font-medium tracking-wider">Client</th>
              <th className="px-6 py-4 font-medium tracking-wider">Segment</th>
              <th className="px-6 py-4 font-medium tracking-wider text-right">Total Debt</th>
              <th className="px-6 py-4 font-medium tracking-wider text-right">Days Overdue</th>
              <th className="px-6 py-4 font-medium tracking-wider">Latest Action</th>
              <th className="px-6 py-4 font-medium tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {clients.map((client) => {
              const prio = getPriorityConfig(client.priority);

              return (
                <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className={`font-mono text-xs font-semibold ${prio.classes}`}>
                      {prio.icon}{prio.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-100">{client.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5 font-mono">ID: {client.id.split('-')[0]}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className={`capitalize font-medium ${getSegmentConfig(client.segment)}`}>
                      {client.segment}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="font-mono font-medium text-zinc-200">
                      ${client.total_debt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 text-zinc-300">
                      <CalendarClock className="w-4 h-4 opacity-50" />
                      <span className="font-mono">{client.max_days_overdue}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {client.latest_action ? (
                      <div>
                        <div className="text-zinc-200 font-medium">{client.latest_action}</div>
                        <div className="text-xs text-zinc-500">
                          {client.latest_action_date ? format(new Date(client.latest_action_date), 'MMM dd, yyyy') : ''}
                        </div>
                      </div>
                    ) : (
                      <span className="text-zinc-600 italic">No previous action</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button
                      size="sm"
                      onClick={() => setSelectedClient(client)}
                      className="opacity-0 group-hover:opacity-100 transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    >
                      <Phone className="w-4 h-4 mr-2" /> Manage
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
