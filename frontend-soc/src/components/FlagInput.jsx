import { useState } from 'react';
import { motion } from 'framer-motion';
import { CornerDownLeft, Target } from 'lucide-react';

export default function FlagInput({ onSubmit }) {
  const [flag, setFlag] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (flag.trim()) {
      onSubmit(flag.trim());
      setFlag('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Target size={18} className="text-gray-300 dark:text-zinc-600 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
      </div>
      <input
        type="text"
        value={flag}
        onChange={(e) => setFlag(e.target.value)}
        placeholder="Enter FLAG{...}"
        className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-zinc-800 pl-11 pr-12 py-3.5 rounded-2xl text-[13px] text-black dark:text-white outline-none focus:bg-white dark:focus:bg-[#111] focus:border-gray-300 dark:focus:border-zinc-700 focus:shadow-sm transition-all font-mono placeholder:text-gray-400 dark:placeholder:text-zinc-600 placeholder:font-sans"
      />
      <div className="absolute inset-y-0 right-2 flex items-center">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-xl shadow-sm cursor-pointer flex items-center justify-center transition-colors"
        >
          <CornerDownLeft size={14} />
        </motion.button>
      </div>
    </form>
  );
}
