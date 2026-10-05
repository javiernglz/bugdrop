import { useState } from 'react';
import useSocket from './hooks/useSocket';
import useCtf from './hooks/useCtf';
import LogConsole from './components/LogConsole';
import TrafficCharts from './components/TrafficCharts';
import ChallengePanel from './components/ChallengePanel';
import FlagInput from './components/FlagInput';
import PanicButton from './components/PanicButton';
import StatsBar from './components/StatsBar';
import DidacticReport from './components/DidacticReport';
import ThemeToggle from './components/ThemeToggle';
import { officialReports } from './data/reports';
import { ExternalLink } from 'lucide-react';

export default function App() {
  const { connected, logs, clearLogs, stats } = useSocket();
  const { challenges, solved, hints, submitFlag, getHint, resetProgress, progress } = useCtf();
  const [activeReport, setActiveReport] = useState(null);

  const handleFlagSubmit = async (flag) => {
    const res = await submitFlag(flag);
    if (res.correct) {
      setActiveReport(res.challenge_key);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-gray-200 selection:text-black dark:selection:bg-zinc-800 dark:selection:text-white bg-[#fafafa] dark:bg-[#09090b] transition-colors duration-300">
      
      {/* ELEGANT HEADER */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-8 py-5 flex items-center justify-between shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 flex items-center justify-center p-1 shadow-sm overflow-hidden transition-colors">
             <img src="/logo-head-nobg.png" alt="Bugdrop Logo" className="w-full h-full object-contain scale-110" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2 m-0 leading-none transition-colors">
              BUGDROP <span className="text-gray-300 dark:text-zinc-700 font-light">|</span> <span className="text-gray-700 dark:text-zinc-300">Mini SOC</span>
            </h1>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium mt-1 m-0 transition-colors">
              Security Operations & Reporting
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-full shadow-sm transition-colors">
            <span className="relative flex h-2.5 w-2.5">
              {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 dark:bg-green-500 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-[11px] font-bold text-gray-700 dark:text-zinc-300 transition-colors">
              {connected ? 'SYSTEM ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            Go to Store <ExternalLink size={16} />
          </a>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-8">
        
        {/* TOP ROW: Stats & Decor */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
             <StatsBar connected={connected} progress={progress} logStats={stats} />
          </div>
          <div className="lg:col-span-1 flex items-center justify-center bg-white dark:bg-[#18181b] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm p-6 relative overflow-hidden transition-colors duration-300">
             <div className="absolute top-0 right-0 w-40 h-40 bg-gray-50 dark:bg-zinc-900 rounded-full blur-3xl -mr-10 -mt-10 transition-colors z-0"></div>
             
             {/* LIGHT MODE: Lightbulb OFF */}
             <img src="/bug-triager-off.jpg" alt="SOC Assistant Off" className="w-40 h-40 object-cover mix-blend-multiply dark:hidden relative z-10 hover:scale-110 transition-transform duration-500" />
             {/* DARK MODE: Lightbulb ON */}
             <img src="/bug-triager-icon.png" alt="SOC Assistant On" className="w-40 h-40 object-contain hidden dark:block relative z-10 hover:scale-110 transition-transform duration-500" />
          </div>
        </div>

        {/* MIDDLE ROW: Traffic & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col h-[700px] bg-white dark:bg-[#18181b] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm overflow-hidden transition-colors duration-300">
            <LogConsole logs={logs} onClear={clearLogs} />
          </div>

          <div className="flex flex-col h-[700px]">
            <TrafficCharts logs={logs} />
          </div>
        </div>

        {/* BOTTOM ROW: CTF Challenges */}
        <div className="bg-white dark:bg-[#18181b] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm p-8 transition-colors duration-300">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1 transition-colors">Vulnerability Reports</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 m-0 transition-colors">Validate flags to unlock the technical write-ups.</p>
            </div>
            <div className="w-[300px]">
              <FlagInput onSubmit={handleFlagSubmit} />
            </div>
          </div>
          
          <ChallengePanel 
            challenges={challenges} 
            solved={solved} 
            hints={hints} 
            onGetHint={getHint} 
            onViewReport={(key) => setActiveReport(key)}
          />

          <div className="mt-8 flex justify-end">
            <PanicButton onResetCtf={resetProgress} />
          </div>
        </div>

      </main>

      {/* Triager Report Modal */}
      {activeReport && officialReports[activeReport] && (
        <DidacticReport 
          report={officialReports[activeReport]} 
          onClose={() => setActiveReport(null)} 
        />
      )}
      {activeReport && !officialReports[activeReport] && (
        <DidacticReport 
          report={{
            title: "Vulnerability Report",
            scope: "bugdrop.local",
            endpoint: "Multiple",
            type: "Security Flaw",
            description: "Detailed Triager report is being generated by the SOC team. Excellent find!",
            payload: "Payload hidden for security reasons.",
            poc: [{step: "Recreation steps pending review."}],
            impact: "Under evaluation.",
            cvss: {
              score: "7.5", severity: "High", vector: "CVSS:4.0/...",
              metrics: [{name: "Evaluation", value: "Pending"}]
            },
            remediation: "Apply standard security patching."
          }} 
          onClose={() => setActiveReport(null)} 
        />
      )}
    </div>
  );
}
