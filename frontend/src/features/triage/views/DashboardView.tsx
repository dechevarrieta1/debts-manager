import { useTriageClients } from "../api/triage";
import { TriageTable } from "../components/TriageTable";
import { Loader2, AlertCircle } from "lucide-react";

export function DashboardView() {
  const { data: clients, isLoading, isError, error } = useTriageClients();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-zinc-400 animate-pulse font-medium">Analyzing debts and prioritizing...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-10 h-10 mb-4 opacity-80" />
        <p className="font-semibold mb-2">Connection Error</p>
        <p className="text-sm opacity-80 max-w-md">{error?.message || "Failed to fetch triage clients. Is the Go backend running on port 8080?"}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-sm overflow-hidden shadow-2xl">
        <TriageTable clients={clients || []} />
      </div>
    </div>
  );
}
