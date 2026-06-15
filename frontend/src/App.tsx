import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardView } from "./features/triage/views/DashboardView";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/30">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20">
                N
              </div>
              <h1 className="font-semibold tracking-tight text-lg">Northwind Triage</h1>
            </div>
            <div className="text-sm text-slate-500 font-medium">Agente de Cobranza MVP</div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Triaje de Prioridades</h2>
            <p className="text-slate-500 mt-2">Gestiona tus objetivos de cobranza basados en prioridad algorítmica.</p>
          </div>

          <DashboardView />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
