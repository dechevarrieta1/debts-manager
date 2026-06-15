import { useState } from "react";
import { useClientNotes, useAddClientNote } from "../api/triage";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotesTimelineProps {
  clientId: string;
}

export function NotesTimeline({ clientId }: NotesTimelineProps) {
  const { data: notes, isLoading } = useClientNotes(clientId);
  const mutation = useAddClientNote(clientId);
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    mutation.mutate(content, {
      onSuccess: () => {
        setContent("");
      }
    });
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] border border-slate-200 bg-white rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center space-x-2">
        <MessageSquare className="w-4 h-4 text-indigo-500" />
        <h3 className="text-sm font-medium text-slate-800">Historial de Notas</h3>
      </div>

      {/* Timeline Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
          </div>
        ) : notes && notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="flex flex-col space-y-1 animate-in fade-in slide-in-from-bottom-2">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                {new Date(note.created_at).toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg rounded-tl-none text-sm text-slate-700 whitespace-pre-wrap">
                {note.content}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 opacity-60">
            <MessageSquare className="w-8 h-8 mb-2" />
            <p className="text-sm">Aún no hay notas registradas</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe una nueva nota..."
            disabled={mutation.isPending}
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50 min-h-[60px]"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || mutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/10 h-8 text-xs px-3"
            >
              {mutation.isPending ? (
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              ) : (
                <Send className="w-3 h-3 mr-2" />
              )}
              Añadir Nota
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
