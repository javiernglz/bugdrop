import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldAlert, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

function LogEntryItem({ log }) {
  const [expanded, setExpanded] = useState(false);
  const isThreat = log.hasThreat || log.isThreat || log.level === 'warn' || log.level === 'error';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={() => setExpanded(!expanded)}
      className={`relative p-4 mb-2 rounded-2xl border cursor-pointer transition-all duration-200 group ${
        isThreat 
          ? 'border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/10 hover:bg-red-50 dark:hover:bg-red-500/20' 
          : 'border-gray-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a] hover:border-gray-200 dark:hover:border-white/10 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-4 text-[13px] font-mono">
        <div className="text-gray-400 dark:text-zinc-500 whitespace-nowrap text-[11px] font-semibold transition-colors">
          {new Date(log.timestamp).toLocaleTimeString()}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {log.method && (
            <span className="font-bold text-gray-900 dark:text-white min-w-[40px] transition-colors">{log.method}</span>
          )}
          {log.url && (
            <span className="text-gray-500 dark:text-zinc-400 font-medium truncate max-w-[200px] sm:max-w-[300px] transition-colors">{log.url}</span>
          )}
          {log.statusCode && (
            <span className={`font-bold transition-colors ${log.statusCode >= 400 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
              {log.statusCode}
            </span>
          )}
          {isThreat && (
             <span className="flex items-center gap-1 bg-red-500 dark:bg-red-500 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm transition-colors">
               <ShieldAlert size={10} /> THREAT
             </span>
          )}
          {log.responseFlag && (
             <span className="flex items-center gap-1 bg-yellow-400 text-yellow-950 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm transition-colors">
               FLAG ISSUED
             </span>
          )}
          {log.message && (
            <span className={isThreat ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-zinc-400'}>
              {log.message}
            </span>
          )}
        </div>
        <div className="text-gray-300 dark:text-zinc-600 group-hover:text-gray-500 dark:group-hover:text-zinc-400 transition-colors">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="mt-4 p-5 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 text-[12px] text-gray-600 dark:text-zinc-400 flex flex-col gap-4 font-mono cursor-default shadow-inner transition-colors">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-gray-400 dark:text-zinc-500">IP Address:</span>
                <span className="text-gray-900 dark:text-white font-medium">{log.ip}</span>
                <span className="text-gray-400 dark:text-zinc-500">User-Agent:</span>
                <span className="text-gray-900 dark:text-white truncate">{log.userAgent}</span>
              </div>

              {log.body && (
                <div>
                  <span className="text-gray-400 dark:text-zinc-500 block mb-2">Payload:</span>
                  <pre className="m-0 p-4 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-lg text-gray-800 dark:text-zinc-300 whitespace-pre-wrap shadow-sm transition-colors">
                    {JSON.stringify(log.body, null, 2)}
                  </pre>
                </div>
              )}

              {log.threats && log.threats.length > 0 && (
                <div>
                  <span className="text-red-500 dark:text-red-400 block mb-2 font-bold">Threat Analysis:</span>
                  <ul className="m-0 pl-4 text-red-600 dark:text-red-400 list-disc flex flex-col gap-1">
                    {log.threats.map((t, idx) => (
                      <li key={idx} className="bg-red-50 dark:bg-red-500/10 inline-block px-2 py-1 rounded w-fit">[{t.tag}] Severity: {t.severity}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LogConsole({ logs, onClear }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <>
      <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-[#18181b]/50 backdrop-blur-sm z-10 sticky top-0 transition-colors duration-300">
        <div className="flex items-center gap-2.5">
          <Terminal size={18} className="text-gray-900 dark:text-white transition-colors" />
          <h3 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight m-0 transition-colors">Live Traffic</h3>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClear}
          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <Trash2 size={14} /> Clear
        </motion.button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col custom-scrollbar bg-gray-50/30 dark:bg-black/20 transition-colors duration-300">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-zinc-700 space-y-4 transition-colors">
             <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 flex items-center justify-center shadow-sm transition-colors">
               <Terminal size={24} className="opacity-50" />
             </div>
             <p className="text-[13px] font-mono font-medium">Awaiting network requests...</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((log, i) => (
              <LogEntryItem key={i} log={log} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </>
  );
}
