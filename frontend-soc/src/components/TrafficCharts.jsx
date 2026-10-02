import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: 0 }}>
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
    if (logs.length === 0) return [{ name: 'No Data', value: 1 }];
    return [
      { name: 'Safe', value: safe },
      { name: 'Threats', value: threats },
    ];
  }, [logs]);

  const threatPct = logs.length > 0
    ? Math.round((logs.filter(l => l.hasThreat).length / logs.length) * 100)
    : 0;

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
      <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '24px' }}>
        Network Traffic Analysis
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Line/Area chart — peticiones por minuto */}
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>Requests per minute (Last 10 min)</p>
          <div style={{ height: '140px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: 'var(--text-faint)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--text-faint)' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="requests"
                  name="Requests"
                  stroke="#1a1a1a"
                  fill="url(#gradRequests)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="threats"
                  name="Threats"
                  stroke="#ef4444"
                  fill="url(#gradThreats)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut — seguro vs malicioso */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>Traffic Integrity</p>
          <div style={{ position: 'relative', height: '120px', width: '120px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={56}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#1a1a1a" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: threatPct > 30 ? 'var(--error)' : 'var(--text)' }}>
                {threatPct}%
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', fontSize: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1a1a1a' }} /> Safe
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> Threat
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
