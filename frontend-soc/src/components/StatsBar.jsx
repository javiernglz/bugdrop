export default function StatsBar({ connected, progress, logStats }) {
  const pct = progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="bg-[#111128] rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${connected ? 'text-green-400' : 'text-red-400'}`}>
            {connected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
        <span className="text-xs text-gray-500 font-mono">
          {progress.current}/{progress.total} banderas
        </span>
      </div>

      <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: pct === 100
              ? 'linear-gradient(90deg, #22c55e, #a855f7)'
              : 'linear-gradient(90deg, #a855f7, #f97316)',
          }}
        />
      </div>

      {pct === 100 && (
        <div className="text-center text-xs text-green-400 font-bold mb-3 animate-pulse">
          TODOS LOS RETOS COMPLETADOS
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-black/30 rounded-lg py-2">
          <div className="text-lg font-bold text-blue-400 font-mono">{logStats.total}</div>
          <div className="text-[9px] text-gray-500 uppercase">Peticiones</div>
        </div>
        <div className="bg-black/30 rounded-lg py-2">
          <div className="text-lg font-bold text-red-400 font-mono">{logStats.threats}</div>
          <div className="text-[9px] text-gray-500 uppercase">Amenazas</div>
        </div>
        <div className="bg-black/30 rounded-lg py-2">
          <div className="text-lg font-bold text-yellow-400 font-mono">{logStats.flags}</div>
          <div className="text-[9px] text-gray-500 uppercase">Flags</div>
        </div>
      </div>
    </div>
  );
}
