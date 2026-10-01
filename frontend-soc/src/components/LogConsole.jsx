import { useRef, useEffect, useState } from 'react';

const SEVERITY_STYLES = {
  critical: 'bg-red-900/40 border-red-800 threat-glow',
  high: 'bg-orange-900/30 border-orange-800',
};

const METHOD_COLORS = {
  GET: 'text-green-400 neon-green',
  POST: 'text-yellow-400',
  PUT: 'text-blue-400',
  DELETE: 'text-red-400 neon-red',
  PATCH: 'text-purple-400',
};

function StatusBadge({ code }) {
  const color = code < 300 ? 'text-green-400' : code < 400 ? 'text-yellow-400' : 'text-red-400';
  return <span className={`${color} w-8 text-right`}>{code}</span>;
}

export default function LogConsole({ logs, onClear }) {
  const containerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    prevCountRef.current = logs.length;
  }, [logs, autoScroll]);

  const filtered = filter === 'all'
    ? logs
    : filter === 'threats'
      ? logs.filter(l => l.hasThreat)
      : logs.filter(l => l.responseFlag);

  return (
    <div className="bg-[#0a0a1a] rounded-xl border border-purple-900/30 p-4 flex flex-col h-full shadow-[0_0_20px_rgba(139,92,246,0.1)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-green-400 neon-green text-xs">$</span>
          <h2 className="text-sm font-bold text-green-400 neon-green uppercase tracking-wider">
            Consola HTTP
          </h2>
          <span className="terminal-cursor text-green-400 neon-green">_</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-black/50 rounded-lg overflow-hidden text-[10px] border border-gray-800">
            {[
              { key: 'all', label: 'Todos', count: logs.length },
              { key: 'threats', label: 'Amenazas', count: logs.filter(l => l.hasThreat).length },
              { key: 'flags', label: 'Flags', count: logs.filter(l => l.responseFlag).length },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-2.5 py-1 transition ${
                  filter === f.key
                    ? 'bg-purple-900/60 text-purple-300 neon-purple'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {f.label} {f.count > 0 && <span className="text-[8px] opacity-60">({f.count})</span>}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-[10px] px-2 py-1 rounded border transition ${
              autoScroll
                ? 'text-green-400 border-green-800/50'
                : 'text-gray-600 border-gray-800'
            }`}
          >
            {autoScroll ? '▼ AUTO' : '‖ PAUSE'}
          </button>
          <button
            onClick={onClear}
            className="text-[10px] text-gray-600 hover:text-red-400 transition px-2 py-1 border border-gray-800 rounded"
          >
            CLR
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="crt-overlay bg-black/70 rounded-lg p-3 flex-1 overflow-y-auto min-h-0 space-y-0.5 font-mono console-scroll border border-gray-900"
      >
        {filtered.length === 0 ? (
          <div className="text-gray-600 text-xs py-8 text-center">
            <p className="text-green-800 neon-green mb-2">$ waiting for connections...</p>
            {logs.length === 0
              ? <p className="text-gray-700">Abre la tienda en <span className="text-purple-400">localhost:5173</span> y navega para ver tráfico.</p>
              : <p className="text-gray-700">No hay logs que coincidan con el filtro.</p>}
          </div>
        ) : (
          filtered.map((log, index) => {
            const isNew = index === 0 && logs.length > prevCountRef.current;
            return (
              <div key={log.id} className={isNew ? 'log-entry-new' : ''}>
                <button
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  className={`w-full text-left text-[11px] leading-relaxed px-2 py-1 rounded transition hover:bg-white/5 flex items-center gap-2 ${
                    log.hasThreat
                      ? SEVERITY_STYLES[log.maxSeverity] || 'bg-yellow-900/20 border-yellow-800'
                      : ''
                  } ${log.hasThreat ? 'border-l-2' : 'border-l-2 border-transparent'}`}
                >
                  <span className="text-gray-600 w-16 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString('es-MX', { hour12: false })}
                  </span>
                  <span className={`font-bold w-10 shrink-0 ${METHOD_COLORS[log.method] || 'text-gray-400'}`}>
                    {log.method}
                  </span>
                  <span className="text-gray-300 truncate flex-1">{log.url}</span>
                  <StatusBadge code={log.statusCode} />
                  <span className="text-gray-600 w-10 text-right shrink-0">{log.duration}ms</span>
                  {log.hasThreat && (
                    <span className="shrink-0">
                      {log.threats.map((t, i) => (
                        <span
                          key={i}
                          className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            t.severity === 'critical'
                              ? 'bg-red-900/70 text-red-300 neon-red'
                              : 'bg-orange-900/50 text-orange-300'
                          }`}
                        >
                          {t.tag}
                        </span>
                      ))}
                    </span>
                  )}
                  {log.responseFlag && (
                    <span className="text-[9px] bg-yellow-900/60 text-yellow-300 px-1.5 py-0.5 rounded-full shrink-0 ml-1 font-bold">
                      FLAG
                    </span>
                  )}
                </button>

                {expanded === log.id && (
                  <div className="ml-4 mb-2 mt-1 bg-black/60 rounded-lg p-3 text-[10px] space-y-2 border border-gray-800">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <span className="text-gray-500">IP:</span>
                      <span className="text-cyan-400">{log.ip}</span>
                      <span className="text-gray-500">User-Agent:</span>
                      <span className="text-cyan-400 truncate">{log.userAgent}</span>
                      <span className="text-gray-500">Content-Type:</span>
                      <span className="text-cyan-400">{log.contentType || '—'}</span>
                    </div>
                    {log.body && (
                      <div>
                        <span className="text-gray-500 block mb-1">$ cat request.body</span>
                        <pre className="text-green-400 neon-green bg-black/50 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all text-[10px]">
                          {JSON.stringify(log.body, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.threats.length > 0 && (
                      <div>
                        <span className="text-red-500 block mb-1 font-bold">$ threat.analyze()</span>
                        {log.threats.map((t, i) => (
                          <div key={i} className="flex items-center gap-2 text-red-300">
                            <span className="uppercase font-bold neon-red">[{t.severity}]</span>
                            <span>{t.tag}</span>
                            <span className="text-gray-600">→ "{t.match}"</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {log.responseFlag && (
                      <div className="text-yellow-400 font-bold bg-yellow-900/20 rounded px-2 py-1">
                        $ flag.captured → {log.responseFlag}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
