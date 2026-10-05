import { motion } from 'framer-motion';
import { Activity, Flag, ShieldAlert } from 'lucide-react';

export default function StatsBar({ progress, logStats }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full"
    >
      <motion.div variants={item} className="bg-white dark:bg-[#18181b] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm p-8 flex flex-col justify-between relative overflow-hidden group transition-colors duration-300">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-50 dark:bg-zinc-800 rounded-full transition-transform group-hover:scale-150 duration-500 ease-out z-0"></div>
        <div className="flex items-center gap-3 mb-6 relative z-10 text-gray-400 dark:text-zinc-500 transition-colors">
          <Activity size={20} />
          <p className="text-[13px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest m-0 transition-colors">Total Traffic</p>
        </div>
        <p className="text-5xl font-extrabold tracking-tighter text-gray-900 dark:text-white m-0 relative z-10 transition-colors">{logStats?.total || 0}</p>
      </motion.div>

      <motion.div variants={item} className="bg-white dark:bg-[#18181b] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm p-8 flex flex-col justify-between relative overflow-hidden group transition-colors duration-300">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 dark:bg-green-950/30 rounded-full transition-transform group-hover:scale-150 duration-500 ease-out z-0"></div>
        <div className="flex items-center gap-3 mb-6 relative z-10 text-green-600 dark:text-green-500 transition-colors">
          <Flag size={20} />
          <p className="text-[13px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest m-0 transition-colors">CTF Progress</p>
        </div>
        <div className="flex items-baseline gap-2 relative z-10">
          <p className="text-5xl font-extrabold tracking-tighter text-gray-900 dark:text-white m-0 transition-colors">{progress?.current || 0}</p>
          <span className="text-xl font-medium text-gray-400 dark:text-zinc-500 transition-colors">/ {progress?.total || 0}</span>
        </div>
      </motion.div>

      <motion.div variants={item} className="bg-white dark:bg-[#18181b] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm p-8 flex flex-col justify-between relative overflow-hidden group transition-colors duration-300">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 dark:bg-red-950/30 rounded-full transition-transform group-hover:scale-150 duration-500 ease-out z-0"></div>
        <div className="flex items-center gap-3 mb-6 relative z-10 text-red-500 dark:text-red-500 transition-colors">
          <ShieldAlert size={20} />
          <p className="text-[13px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest m-0 transition-colors">Threats</p>
        </div>
        <p className={`text-5xl font-extrabold tracking-tighter m-0 relative z-10 transition-colors ${logStats?.threats > 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
          {logStats?.threats || 0}
        </p>
      </motion.div>
    </motion.div>
  );
}
