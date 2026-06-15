import { useTriageClients } from "../api/triage";
import { TriageTable } from "../components/TriageTable";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DashboardView() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, isError, error, isPlaceholderData } = useTriageClients(page, limit);

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

  const clients = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-sm overflow-hidden shadow-2xl transition-opacity duration-200 ${isPlaceholderData ? 'opacity-50' : 'opacity-100'}`}>
        <TriageTable clients={clients} />
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-zinc-950/50">
          <div className="text-sm text-zinc-400">
            Showing <span className="font-medium text-zinc-200">{clients.length ? (page - 1) * limit + 1 : 0}</span> to <span className="font-medium text-zinc-200">{Math.min(page * limit, total)}</span> of <span className="font-medium text-zinc-200">{total}</span> clients
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isPlaceholderData}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <div className="text-sm font-medium text-zinc-400 px-2">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isPlaceholderData}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
