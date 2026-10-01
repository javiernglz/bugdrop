import { useState } from 'react';
import confetti from 'canvas-confetti';

export default function FlagInput({ onSubmit }) {
  const [flag, setFlag] = useState('');
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function fireConfetti() {
    const duration = 2000;
    const end = Date.now() + duration;

    const colors = ['#a855f7', '#f97316', '#22c55e', '#eab308', '#ef4444'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!flag.trim() || submitting) return;

    setSubmitting(true);
    const data = await onSubmit(flag.trim());
    setResult(data);
    setSubmitting(false);

    if (data.correct) {
      fireConfetti();
      setTimeout(() => setFlag(''), 1500);
    }

    setTimeout(() => setResult(null), 5000);
  }

  return (
    <div className="bg-[#111128] rounded-xl border border-gray-800 p-4">
      <h3 className="text-sm font-bold text-orange-400 mb-3 uppercase tracking-wider">
        Enviar Bandera
      </h3>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={flag}
          onChange={e => setFlag(e.target.value)}
          placeholder="FLAG{...}"
          className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-xs text-green-400 placeholder-gray-600 focus:border-purple-500 focus:outline-none font-mono"
        />
        <button
          type="submit"
          disabled={submitting || !flag.trim()}
          className="bg-purple-700 hover:bg-purple-600 disabled:bg-gray-700 text-white text-xs px-4 py-2 rounded-lg transition font-medium"
        >
          {submitting ? '...' : 'Validar'}
        </button>
      </form>

      {result && (
        <div className={`mt-3 rounded-lg px-3 py-2 text-xs transition-all ${
          result.correct
            ? 'bg-green-900/30 border border-green-800 text-green-300'
            : 'bg-red-900/20 border border-red-800/50 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-base">{result.correct ? '🏆' : '❌'}</span>
            <span>{result.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
