import { useState } from 'react';

export default function PanicButton({ onResetCtf }) {
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [result, setResult] = useState(null);

  async function handleReset() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 5000);
      return;
    }

    setResetting(true);
    setConfirming(false);

    try {
      const res = await fetch('/api/sys/reset', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        onResetCtf();
        setResult({ ok: true, msg: 'BD restaurada. Progreso CTF reseteado.' });
      } else {
        setResult({ ok: false, msg: data.message || 'Error al resetear.' });
      }
    } catch {
      setResult({ ok: false, msg: 'No se pudo conectar al backend.' });
    }

    setResetting(false);
    setTimeout(() => setResult(null), 4000);
  }

  return (
    <div className="bg-[#111128] rounded-xl border border-gray-800 p-4">
      <h3 className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-3">
        Botón de Pánico
      </h3>
      <p className="text-[10px] text-gray-600 mb-3">
        Restaura la base de datos al estado original y resetea tu progreso CTF.
      </p>
      <button
        onClick={handleReset}
        disabled={resetting}
        className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition border ${
          resetting
            ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-wait'
            : confirming
              ? 'bg-red-800 border-red-600 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
              : 'bg-red-900/30 border-red-800/50 text-red-400 hover:bg-red-900/50 hover:border-red-700'
        }`}
      >
        {resetting
          ? 'Reseteando...'
          : confirming
            ? '¿Confirmar? Haz clic otra vez'
            : 'Resetear Entorno'}
      </button>

      {result && (
        <div className={`mt-2 rounded-lg px-3 py-2 text-[10px] border ${
          result.ok
            ? 'bg-green-900/20 border-green-800/50 text-green-400'
            : 'bg-red-900/20 border-red-800/50 text-red-400'
        }`}>
          {result.msg}
        </div>
      )}
    </div>
  );
}
