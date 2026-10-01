import { useState } from 'react';

const DIFFICULTY_STYLES = {
  easy: 'bg-green-900/30 text-green-400 border-green-800',
  medium: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
  hard: 'bg-red-900/30 text-red-400 border-red-800',
};

const CHALLENGE_EMOJIS = {
  cart_manipulation: '🛒',
  stored_xss: '💉',
  idor_orders: '🔓',
  payment_bypass: '💳',
};

export default function ChallengePanel({ challenges, solved, hints, onGetHint }) {
  const [openChallenge, setOpenChallenge] = useState(null);
  const [loadingHint, setLoadingHint] = useState(null);

  async function handleHint(key, level) {
    setLoadingHint(`${key}-${level}`);
    await onGetHint(key, level);
    setLoadingHint(null);
  }

  return (
    <div className="bg-[#111128] rounded-xl border border-gray-800 p-4">
      <h3 className="text-sm font-bold text-purple-400 mb-4 uppercase tracking-wider">
        Retos CTF
      </h3>

      <div className="space-y-2">
        {challenges.map(ch => {
          const isSolved = solved.includes(ch.challenge_key);
          const isOpen = openChallenge === ch.challenge_key;
          const hint1 = hints[`${ch.challenge_key}-1`];
          const hint2 = hints[`${ch.challenge_key}-2`];

          return (
            <div key={ch.challenge_key}>
              <button
                onClick={() => setOpenChallenge(isOpen ? null : ch.challenge_key)}
                className={`w-full text-left rounded-lg px-3 py-2.5 transition border ${
                  isSolved
                    ? 'bg-green-900/20 border-green-800/50'
                    : 'bg-black/30 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {isSolved ? '🏆' : (CHALLENGE_EMOJIS[ch.challenge_key] || '🎯')}
                    </span>
                    <span className={`text-xs font-medium ${isSolved ? 'text-green-400' : 'text-gray-300'}`}>
                      {ch.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${DIFFICULTY_STYLES[ch.difficulty] || ''}`}>
                      {ch.difficulty}
                    </span>
                    {isSolved ? (
                      <span className="text-green-400 text-xs">✓</span>
                    ) : (
                      <span className="text-gray-600 text-xs">{isOpen ? '▼' : '▶'}</span>
                    )}
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="mt-1 ml-2 bg-black/20 rounded-lg p-3 border border-gray-800/50 space-y-3">
                  <p className="text-[11px] text-gray-400 leading-relaxed">{ch.description}</p>

                  {isSolved && (
                    <div className="bg-green-900/20 rounded-lg p-2 text-[10px] text-green-300 text-center font-bold">
                      COMPLETADO
                    </div>
                  )}

                  <div className="space-y-2">
                    <div>
                      <button
                        onClick={() => handleHint(ch.challenge_key, 1)}
                        disabled={!!hint1}
                        className={`text-[10px] px-2.5 py-1 rounded transition ${
                          hint1
                            ? 'text-gray-500 cursor-default'
                            : 'bg-orange-900/30 text-orange-400 hover:bg-orange-900/50 border border-orange-800/50'
                        }`}
                      >
                        {loadingHint === `${ch.challenge_key}-1`
                          ? 'Cargando...'
                          : hint1
                            ? '💡 Pista 1 (desbloqueada)'
                            : '💡 Pista 1 — Teórica'}
                      </button>
                      {hint1 && (
                        <p className="text-[10px] text-orange-300/80 mt-1.5 pl-2 border-l border-orange-800/50 leading-relaxed">
                          {hint1.hint}
                        </p>
                      )}
                    </div>

                    <div>
                      <button
                        onClick={() => handleHint(ch.challenge_key, 2)}
                        disabled={!!hint2}
                        className={`text-[10px] px-2.5 py-1 rounded transition ${
                          hint2
                            ? 'text-gray-500 cursor-default'
                            : 'bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-800/50'
                        }`}
                      >
                        {loadingHint === `${ch.challenge_key}-2`
                          ? 'Cargando...'
                          : hint2
                            ? '🔧 Pista 2 (desbloqueada)'
                            : '🔧 Pista 2 — Técnica'}
                      </button>
                      {hint2 && (
                        <p className="text-[10px] text-red-300/80 mt-1.5 pl-2 border-l border-red-800/50 leading-relaxed">
                          {hint2.hint}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
