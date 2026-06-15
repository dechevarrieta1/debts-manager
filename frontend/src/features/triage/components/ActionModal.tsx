import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Client, useAddCollectionAction } from "../service/triage";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { NotesTimeline } from "./NotesTimeline";

interface ActionModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ActionModal({ client, isOpen, onClose }: ActionModalProps) {
  const [status, setStatus] = useState("Llamada Realizada");
  const [note, setNote] = useState("");
  const [promiseDate, setPromiseDate] = useState("");

  const mutation = useAddCollectionAction(client?.id || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    mutation.mutate(
      {
        collection_status: status,
        note,
        promise_date: promiseDate || undefined
      },
      {
        onSuccess: () => {
          setStatus("Llamada Realizada");
          setNote("");
          setPromiseDate("");
          onClose();
        }
      }
    );
  };

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="bg-white border border-slate-200 text-slate-900 sm:max-w-4xl shadow-2xl p-0 overflow-hidden">

        <div className="grid grid-cols-1 md:grid-cols-2 h-full max-h-[80vh]">
          {/* Left Column: Manage Debt Collection */}
          <div className="p-6 overflow-y-auto border-r border-slate-200">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-semibold text-slate-900">Gestionar Cobranza</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1">
                Registrar interacción para <span className="text-indigo-600 font-medium">{client.name}</span>. Deuda total: <span className="text-red-500 font-mono">${client.total_debt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Estado de la Acción</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900">
                    <SelectItem value="Llamada Realizada">Llamada Realizada</SelectItem>
                    <SelectItem value="Promesa de Pago">Promesa de Pago</SelectItem>
                    <SelectItem value="No Contesta">No Contesta</SelectItem>
                    <SelectItem value="Email Enviado">Email Enviado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {status === "Promesa de Pago" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-medium text-slate-700">Fecha de Promesa</label>
                  <Input
                    type="date"
                    required
                    value={promiseDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPromiseDate(e.target.value)}
                    className="bg-slate-50 border-slate-200 text-slate-900"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nota Interna</label>
                <textarea
                  required
                  value={note}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  placeholder="Ej. El cliente solicitó volver a llamar mañana..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-slate-100 text-slate-600">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                >
                  {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Guardar Acción
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Notes Timeline */}
          <div className="bg-slate-50 p-6 flex flex-col overflow-hidden">
            <NotesTimeline clientId={client.id} />
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
