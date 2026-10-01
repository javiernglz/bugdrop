import useSocket from './hooks/useSocket';
import useCtf from './hooks/useCtf';
import LogConsole from './components/LogConsole';
import TrafficCharts from './components/TrafficCharts';
import ChallengePanel from './components/ChallengePanel';
import FlagInput from './components/FlagInput';
import StatsBar from './components/StatsBar';
import PanicButton from './components/PanicButton';

export default function App() {
  const { connected, logs, clearLogs, stats } = useSocket();
  const { challenges, solved, hints, submitFlag, getHint, resetProgress, progress } = useCtf();

  return (
    <div className="min-h-screen bg-[#0a0a14] text-gray-200 font-mono flex flex-col">
      <header className="bg-black/80 backdrop-blur-sm border-b border-purple-900/40 px-6 py-3 sticky top-0 z-50 shadow-[0_2px_20px_rgba(139,92,246,0.15)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-900/40 border border-purple-700/50 flex items-center justify-center text-purple-400 text-sm shadow-[0_0_10px_rgba(139,92,246,0.3)]">
              S
            </div>
            <div>
              <h1 className="text-lg font-bold text-purple-400 neon-purple tracking-wider">
                MINI-SOC
              </h1>
              <p className="text-[9px] text-gray-600 uppercase tracking-[0.2em]">
                Security Operations Center
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 rounded-full px-3 py-1 border ${
              connected
                ? 'bg-green-900/20 border-green-800/50'
                : 'bg-red-900/20 border-red-800/50'
            }`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.8)]' : 'bg-red-500'}`} />
              <span className={`text-[10px] font-bold ${connected ? 'text-green-400 neon-green' : 'text-red-400'}`}>
                {connected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-gray-500 hover:text-cyan-400 transition border border-gray-800 rounded px-2 py-1"
            >
              Abrir Tienda →
            </a>
            <button
              onClick={resetProgress}
              className="text-[10px] text-gray-600 hover:text-red-400 transition border border-gray-800 rounded px-2 py-1"
              title="Resetear progreso CTF"
            >
              Reset CTF
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 flex flex-col gap-4 min-h-0">
        {/* Fila superior: Gráficos + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <TrafficCharts logs={logs} />
          </div>
          <StatsBar
            connected={connected}
            progress={progress}
            logStats={stats}
          />
        </div>

        {/* Fila principal: Consola + Panel CTF */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[400px]">
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <LogConsole logs={logs} onClear={clearLogs} />
          </div>

          <div className="space-y-4 overflow-y-auto console-scroll">
            <FlagInput onSubmit={submitFlag} />
            <ChallengePanel
              challenges={challenges}
              solved={solved}
              hints={hints}
              onGetHint={getHint}
            />
            <PanicButton onResetCtf={resetProgress} />
          </div>
        </div>
      </main>

      <footer className="text-center text-[9px] text-gray-700 py-2 border-t border-gray-900">
        <span className="text-purple-900">▓▓</span> Mini-SOC v1.0 — pwn-shop Cyber Range <span className="text-purple-900">▓▓</span>
      </footer>
    </div>
  );
}
