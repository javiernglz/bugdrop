import { useRef, useEffect } from 'react';

export default function LogConsole({ logs, onClear }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-card)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg)' }}>
        <h3 style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Real-time Traffic Log</h3>
        <button
          onClick={onClear}
          style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Clear Logs
        </button>
      </div>
      
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', fontFamily: 'monospace' }} className="console-scroll">
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-faint)', textAlign: 'center', marginTop: '20px' }}>Listening for traffic on the Bugdrop network...</div>
        ) : (
          logs.map((log, i) => {
            const isThreat = log.isThreat || log.level === 'warn' || log.level === 'error';
            
            return (
              <div key={i} className="log-entry-new" style={{
                padding: '8px 12px',
                backgroundColor: 'var(--bg)',
                border: '1px solid',
                borderColor: isThreat ? 'var(--error)' : 'var(--border)',
                borderRadius: '4px',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start'
              }}>
                <div style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
                
                <div style={{ display: 'flex', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
                  {log.method && (
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{log.method}</span>
                  )}
                  {log.url && (
                    <span style={{ color: 'var(--info)' }}>{log.url}</span>
                  )}
                  <span style={{ color: isThreat ? 'var(--error)' : 'var(--text-muted)' }}>
                    {log.message}
                  </span>
                  
                  {log.details && (
                    <div style={{ width: '100%', marginTop: '4px', padding: '8px', backgroundColor: 'var(--bg-card)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-muted)', overflowX: 'auto' }}>
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
