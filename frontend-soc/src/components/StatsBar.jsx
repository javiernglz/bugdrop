export default function StatsBar({ progress, logStats }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
      
      {/* Total Requests */}
      <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg-card)' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total Traffic</p>
        <p style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>{logStats?.total || 0}</p>
      </div>

      {/* Flag Progress */}
      <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg-card)' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>CTF Progress</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <p style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>{progress?.solved || 0}</p>
          <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>/ {progress?.total || 0} Flags</span>
        </div>
      </div>

      {/* Threats Detected */}
      <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg-card)' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Threats</p>
        <p style={{ fontSize: '24px', fontWeight: 600, margin: 0, color: (logStats?.threats > 0) ? 'var(--error)' : 'var(--text)' }}>
          {logStats?.threats || 0}
        </p>
      </div>

    </div>
  );
}
