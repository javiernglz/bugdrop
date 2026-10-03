import { useRef, useEffect, useState } from 'react';

function LogEntryItem({ log }) {
  const [expanded, setExpanded] = useState(false);
  const isThreat = log.hasThreat || log.isThreat || log.level === 'warn' || log.level === 'error';

  return (
    <div style={{
      padding: '8px 12px',
      backgroundColor: 'var(--bg)',
      border: '1px solid',
      borderColor: isThreat ? 'var(--error)' : 'var(--border)',
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }} onClick={() => setExpanded(!expanded)}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {new Date(log.timestamp).toLocaleTimeString()}
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {log.method && (
            <span style={{ fontWeight: 600, color: 'var(--text)', minWidth: '40px' }}>{log.method}</span>
          )}
          {log.url && (
            <span style={{ color: 'var(--info)', marginRight: '8px' }}>{log.url}</span>
          )}
          {log.statusCode && (
            <span style={{ 
              color: log.statusCode >= 400 ? 'var(--error)' : 'var(--success)',
              fontWeight: 600
            }}>
              {log.statusCode}
            </span>
          )}
          {isThreat && (
             <span style={{ backgroundColor: 'var(--error)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', marginLeft: '4px' }}>THREAT DETECTED</span>
          )}
          {log.message && (
            <span style={{ color: isThreat ? 'var(--error)' : 'var(--text-muted)' }}>
              {log.message}
            </span>
          )}
        </div>
        <div style={{ color: 'var(--text-faint)', fontSize: '10px' }}>
          {expanded ? '▲' : '▼'}
        </div>
      </div>

      {expanded && (
        <div style={{ width: '100%', marginTop: '4px', padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-muted)', overflowX: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'default' }} onClick={e => e.stopPropagation()}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '4px' }}>
            <span style={{ color: 'var(--text-faint)' }}>IP Address:</span>
            <span>{log.ip}</span>
            <span style={{ color: 'var(--text-faint)' }}>User-Agent:</span>
            <span>{log.userAgent}</span>
          </div>

          {log.body && (
            <div>
              <span style={{ color: 'var(--text-faint)', display: 'block', marginBottom: '4px' }}>Request Body (Payload):</span>
              <pre style={{ margin: 0, padding: '8px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(log.body, null, 2)}
              </pre>
            </div>
          )}

          {log.threats && log.threats.length > 0 && (
            <div>
              <span style={{ color: 'var(--error)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Threat Analysis:</span>
              <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--error)' }}>
                {log.threats.map((t, idx) => (
                  <li key={idx}>[{t.tag}] Severity: {t.severity}</li>
                ))}
              </ul>
            </div>
          )}
          
          {log.details && (
            <div>
              <span style={{ color: 'var(--text-faint)', display: 'block', marginBottom: '4px' }}>Details:</span>
              <pre style={{ margin: 0, padding: '8px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
          logs.map((log, i) => (
            <LogEntryItem key={i} log={log} />
          ))
        )}
      </div>
    </div>
  );
}
