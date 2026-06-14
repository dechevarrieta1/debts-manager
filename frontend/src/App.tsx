import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardView } from "./features/triage/views/DashboardView";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30">
        <header className="border-b border-white/5 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20">
                N
              </div>
              <h1 className="font-semibold tracking-tight text-lg">Northwind Triage</h1>
            </div>
            <div className="text-sm text-zinc-400">Collection Agent MVP</div>
          </div>
        </header>
        
        <main className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">Priority Triage</h2>
            <p className="text-zinc-400 mt-2">Manage your collection targets based on algorithmic priority.</p>
          </div>
          
          <DashboardView />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
