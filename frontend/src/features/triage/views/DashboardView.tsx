import { useTriageClients } from "../api/triage";
import { TriageTable } from "../components/TriageTable";
import { DashboardMetrics } from "../components/DashboardMetrics";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DashboardView() {
  const [page, setPage] = useState(1);
  const [segmentFilter, setSegmentFilter] = useState("todos");
  const limit = 10;
  const { data, isLoading, isError, error, isPlaceholderData } = useTriageClients(page, limit, segmentFilter);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-500 animate-pulse font-medium">Analizando deudas y priorizando...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-red-600 flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-10 h-10 mb-4 opacity-80" />
        <p className="font-semibold mb-2">Error de Conexión</p>
        <p className="text-sm opacity-80 max-w-md">{error?.message || "Error al cargar los clientes. ¿Está ejecutándose el backend en el puerto 8080?"}</p>
      </div>
    );
  }

  const clients = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DashboardMetrics />
      <div className={`rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-opacity duration-200 ${isPlaceholderData ? 'opacity-50' : 'opacity-100'}`}>
        
        {/* Filter Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Filtro Rápido</span>
          </div>
          <div className="w-48">
            <Select value={segmentFilter} onValueChange={(val) => {
              setSegmentFilter(val);
              setPage(1);
            }}>
              <SelectTrigger className="bg-white border-slate-300 text-slate-900 h-8 text-sm">
                <SelectValue placeholder="Segmento" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                <SelectItem value="todos">Todos los Segmentos</SelectItem>
                <SelectItem value="zombi">Zombi</SelectItem>
                <SelectItem value="startup">Startup</SelectItem>
                <SelectItem value="grande">Grande</SelectItem>
                <SelectItem value="estandar">Estandar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TriageTable clients={clients} />
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-sm text-slate-500">
            Mostrando <span className="font-medium text-slate-900">{clients.length ? (page - 1) * limit + 1 : 0}</span> a <span className="font-medium text-slate-900">{Math.min(page * limit, total)}</span> de <span className="font-medium text-slate-900">{total}</span> clientes
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isPlaceholderData}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
            </Button>
            <div className="text-sm font-medium text-slate-500 px-2">
              Página {page} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isPlaceholderData}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              Siguiente <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
