import { motion } from 'framer-motion';
import { HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

export default function ChallengePanel({ challenges, solved, hints, onGetHint, onViewReport }) {
  if (!challenges || challenges.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 dark:text-zinc-500 text-sm border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl transition-colors">
        No challenges loaded.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {challenges.map((c, i) => {
        const isSolved = (solved || []).includes(c.challenge_key);
        const hint1 = hints && hints[`${c.challenge_key}-1`];
        const hint2 = hints && hints[`${c.challenge_key}-2`];

        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 30 }}
            key={c.challenge_key}
            className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
              isSolved 
                ? 'bg-green-50/50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30' 
                : 'bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 hover:shadow-sm'
            }`}
          >
            {isSolved && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600" />
            )}
            
            <div>
              <div className="flex justify-between items-start gap-4 mb-3">
                <h4 className={`text-base font-bold tracking-tight m-0 transition-colors ${isSolved ? 'text-green-900 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                  {c.title}
                </h4>
                {isSolved ? (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20 px-2 py-1 rounded-full shrink-0 transition-colors">
                    <CheckCircle2 size={12} /> SECURED
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 px-2 py-1 rounded-full shrink-0 tracking-wider transition-colors">
                    {c.difficulty}
                  </span>
                )}
              </div>

              <p className="text-[13px] text-gray-500 dark:text-zinc-400 leading-relaxed m-0 mb-6 font-medium transition-colors">
                {c.description}
              </p>
            </div>

            {isSolved ? (
              <div className="flex justify-start">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onViewReport(c.challenge_key)}
                  className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-transform cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-200"
                >
                  <FileText size={14} /> Open Triager Report
                </motion.button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 transition-colors">
                {hint1 ? (
                  <div className="flex flex-col gap-3">
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="text-[13px] bg-yellow-50/50 dark:bg-yellow-500/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-500/20 text-yellow-800 dark:text-yellow-200 transition-colors" onClick={() => hint1.isError && onGetHint(c.challenge_key, 1)} style={{ cursor: hint1.isError ? 'pointer' : 'default' }}
                    >
                      <strong className="text-yellow-600 dark:text-yellow-500 uppercase tracking-widest text-[10px] block mb-1">Concept</strong>
                      {hint1.isError ? (<span>{hint1.error} {hint1.retry_after > 0 && `(Retry in ${hint1.retry_after}s)`}</span>) : hint1.hint}
                    </motion.div>
                    
                    {hint2 ? (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="text-[13px] bg-red-50/50 dark:bg-red-500/10 p-4 rounded-xl border border-red-100 dark:border-red-500/20 text-red-800 dark:text-red-200 transition-colors" onClick={() => hint2.isError && onGetHint(c.challenge_key, 2)} style={{ cursor: hint2.isError ? 'pointer' : 'default' }}
                      >
                        <strong className="text-red-600 dark:text-red-500 uppercase tracking-widest text-[10px] block mb-1">Technical</strong>
                        {hint2.isError ? (<span>{hint2.error} {hint2.retry_after > 0 && `(Retry in ${hint2.retry_after}s)`}</span>) : hint2.hint}
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => onGetHint(c.challenge_key, 2)}
                        className="text-[12px] font-semibold text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white text-left cursor-pointer transition-colors underline underline-offset-4 decoration-gray-200 dark:decoration-zinc-700 hover:decoration-black dark:hover:decoration-white self-start"
                      >
                        Reveal Technical Hint
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => onGetHint(c.challenge_key, 1)}
                    className="text-[12px] font-semibold text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white text-left flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <HelpCircle size={14} /> Need a hint?
                  </button>
                )}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
