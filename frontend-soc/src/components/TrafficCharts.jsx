import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const DONUT_COLORS = ['#22c55e', '#ef4444'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111128] border border-gray-700 rounded-lg px-3 py-2 text-[10px] shadow-lg">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function TrafficCharts({ logs }) {
  const timeSeriesData = useMemo(() => {
    const buckets = {};
    const now = Date.now();

    for (let i = 9; i >= 0; i--) {
      const t = new Date(now - i * 60000);
      const key = t.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
      buckets[key] = { time: key, requests: 0, threats: 0 };
    }

    for (const log of logs) {
      const t = new Date(log.timestamp);
      const key = t.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
      if (buckets[key]) {
        buckets[key].requests++;
        if (log.hasThreat) buckets[key].threats++;
      }
    }

    return Object.values(buckets);
  }, [logs]);

  const donutData = useMemo(() => {
    const threats = logs.filter(l => l.hasThreat).length;
    const safe = logs.length - threats;
    if (logs.length === 0) return [{ name: 'Sin datos', value: 1 }];
    return [
      { name: 'Seguro', value: safe },
      { name: 'Malicioso', value: threats },
    ];
  }, [logs]);

  const threatPct = logs.length > 0
    ? Math.round((logs.filter(l => l.hasThreat).length / logs.length) * 100)
    : 0;

  return (
    <div className="bg-[#111128] rounded-xl border border-gray-800 p-4">
      <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-3">
        Tráfico en Tiempo Real
      </h3>

      <div className="grid grid-cols-5 gap-3">
        {/* Line/Area chart — peticiones por minuto */}
        <div className="col-span-3">
          <p className="text-[9px] text-gray-500 mb-1">Peticiones / minuto (últimos 10 min)</p>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={timeSeriesData} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 8, fill: '#4b5563' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 8, fill: '#4b5563' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="requests"
                name="Peticiones"
                stroke="#a855f7"
                fill="url(#gradRequests)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="threats"
                name="Amenazas"
                stroke="#ef4444"
                fill="url(#gradThreats)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut — seguro vs malicioso */}
        <div className="col-span-2 flex flex-col items-center justify-center">
          <p className="text-[9px] text-gray-500 mb-1">Seguro vs Malicioso</p>
          <div className="relative">
            <ResponsiveContainer width={90} height={90}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={40}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i] || '#374151'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-bold font-mono ${threatPct > 30 ? 'text-red-400' : 'text-green-400'}`}>
                {threatPct}%
              </span>
            </div>
          </div>
          <div className="flex gap-3 mt-1 text-[8px]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Seguro
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Malicioso
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
