import { useMemo, useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#18181b] border border-gray-100 dark:border-white/10 rounded-xl p-4 text-[13px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-colors">
      <p className="text-gray-400 dark:text-zinc-500 mb-3 font-mono font-semibold text-[11px] uppercase tracking-wider">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold flex items-center justify-between gap-6 m-0 mb-2 last:mb-0">
          <span>{p.name}</span>
          <span className="font-mono text-gray-900 dark:text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function TrafficCharts({ logs }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDark(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  const timeSeriesData = useMemo(() => {
    const buckets = {};
    const now = Date.now();

    for (let i = 14; i >= 0; i--) {
      const t = new Date(now - i * 60000);
      const key = t.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
      buckets[key] = { time: key, requests: 0, threats: 0 };
    }

    for (const log of logs) {
      const t = new Date(log.timestamp);
      const key = t.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
      if (buckets[key]) {
        buckets[key].requests++;
        if (log.hasThreat || log.isThreat || log.level === 'error' || log.level === 'warn') buckets[key].threats++;
      }
    }

    return Object.values(buckets);
  }, [logs]);

  const donutData = useMemo(() => {
    const threats = logs.filter(l => l.hasThreat || l.isThreat || l.level === 'error' || l.level === 'warn').length;
    const safe = logs.length - threats;
    if (logs.length === 0) return [{ name: 'Awaiting', value: 1 }];
    return [
      { name: 'Safe', value: safe },
      { name: 'Threats', value: threats },
    ];
  }, [logs]);

  const threatPct = logs.length > 0
    ? Math.round((logs.filter(l => l.hasThreat || l.isThreat || l.level === 'error' || l.level === 'warn').length / logs.length) * 100)
    : 0;

  const strokeColor = isDark ? '#ffffff' : '#000000';
  const emptyDonutColor = isDark ? '#27272a' : '#e5e7eb';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-white dark:bg-[#18181b] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm p-8 h-full flex flex-col relative overflow-hidden transition-colors duration-300"
    >
      <div className="flex items-center gap-2 mb-8 text-gray-900 dark:text-white transition-colors">
        <BarChart3 size={20} />
        <h3 className="text-[16px] font-bold tracking-tight m-0">Traffic Analysis</h3>
      </div>

      <div className="flex flex-col gap-10 flex-1">
        {/* Line/Area chart */}
        <div className="flex flex-col flex-1 min-h-[200px]">
          <p className="text-[11px] text-gray-400 dark:text-zinc-500 uppercase tracking-widest font-mono font-bold mb-4 transition-colors">Requests (Last 15 min)</p>
          <div className="flex-1 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={strokeColor} stopOpacity={isDark ? 0.2 : 0.05} />
                    <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDark ? '#3f3f46' : '#f3f4f6', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="requests" name="Total Traffic" stroke={strokeColor} fill="url(#gradRequests)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="threats" name="Threats" stroke="#ef4444" fill="url(#gradThreats)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut chart */}
        <div className="flex gap-8 items-center bg-gray-50/50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-gray-100 dark:border-white/5 transition-colors duration-300">
          <div className="relative h-[120px] w-[120px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                  <Cell fill={logs.length === 0 ? emptyDonutColor : strokeColor} />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-extrabold font-mono tracking-tighter m-0 transition-colors ${threatPct > 30 ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {threatPct}%
              </span>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 flex-1">
             <p className="text-[11px] text-gray-500 dark:text-zinc-400 uppercase tracking-widest font-mono font-bold m-0 mb-1 transition-colors">Traffic Integrity</p>
             <div className="flex items-center justify-between p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors duration-300">
                <span className="flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-white transition-colors"><span className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`} /> Safe</span>
                <span className="text-xs font-mono font-bold text-gray-500 dark:text-zinc-500 transition-colors">{donutData[0].value} req</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors duration-300">
                <span className="flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-white transition-colors"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Threat</span>
                <span className="text-xs font-mono font-bold text-red-500 dark:text-red-400 transition-colors">{donutData[1]?.value || 0} req</span>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
