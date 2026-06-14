import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Client, useAddCollectionAction } from "../api/triage";
import { useState } from "react";
import { Loader2 } from "lucide-react";

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
      <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 sm:max-w-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-zinc-50">Manage Debt Collection</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Record interaction for <span className="text-indigo-400 font-medium">{client.name}</span>. Total debt: <span className="text-red-400 font-mono">${client.total_debt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Action Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <SelectItem value="Llamada Realizada">Llamada Realizada</SelectItem>
                <SelectItem value="Promesa de Pago">Promesa de Pago</SelectItem>
                <SelectItem value="No Contesta">No Contesta</SelectItem>
                <SelectItem value="Email Enviado">Email Enviado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === "Promesa de Pago" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-sm font-medium text-zinc-300">Promise Date</label>
              <Input 
                type="date" 
                required
                value={promiseDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPromiseDate(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 [color-scheme:dark]" 
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Internal Note</label>
            <textarea 
              required
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" 
              placeholder="E.g. Client requested to call back tomorrow..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-white/5 text-zinc-300">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Action
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
