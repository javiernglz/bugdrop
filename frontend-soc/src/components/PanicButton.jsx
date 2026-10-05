import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

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
        setResult({ ok: true, msg: 'Environment restored. CTF reset.' });
      } else {
        setResult({ ok: false, msg: data.message || 'Error resetting.' });
      }
    } catch {
      setResult({ ok: false, msg: 'Connection to backend failed.' });
    }

    setResetting(false);
    setTimeout(() => setResult(null), 4000);
  }

  return (
    <div className="p-5 panel-base border-[var(--error)]/20 bg-[var(--error)]/5">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={16} className="text-[var(--error)]" />
        <h3 className="text-[11px] font-bold text-[var(--error)] uppercase tracking-widest m-0">
          Panic Button
        </h3>
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
        Wipes the database, restarts the backend seed, and resets your CTF progress permanently.
      </p>
      
      <motion.button
        whileHover={!resetting ? { scale: 1.02 } : {}}
        whileTap={!resetting ? { scale: 0.98 } : {}}
        onClick={handleReset}
        disabled={resetting}
        className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
          resetting
            ? 'bg-[var(--border)] text-[var(--text-faint)] cursor-wait'
            : confirming
              ? 'bg-[var(--error)] text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : 'bg-transparent border border-[var(--error)]/50 text-[var(--error)] hover:bg-[var(--error)] hover:text-white'
        }`}
      >
        {resetting
          ? 'Resetting...'
          : confirming
            ? 'Confirm Wipe?'
            : 'Reset Environment'}
      </motion.button>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-3 rounded-lg px-3 py-2 text-[10px] font-mono border ${
          result.ok
            ? 'bg-[var(--success)]/10 border-[var(--success)]/30 text-[var(--success)]'
            : 'bg-[var(--error)]/10 border-[var(--error)]/30 text-[var(--error)]'
        }`}>
          {result.msg}
        </motion.div>
      )}
    </div>
  );
}
