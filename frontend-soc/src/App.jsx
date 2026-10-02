import useSocket from './hooks/useSocket';
import useCtf from './hooks/useCtf';
import LogConsole from './components/LogConsole';
import TrafficCharts from './components/TrafficCharts';
import ChallengePanel from './components/ChallengePanel';
import FlagInput from './components/FlagInput';
import StatsBar from './components/StatsBar';

export default function App() {
  const { connected, logs, clearLogs, stats } = useSocket();
  const { challenges, solved, hints, submitFlag, getHint, resetProgress, progress } = useCtf();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      {/* ═══ HEADER ═══ */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--bg)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: 'var(--text)',
            color: 'var(--bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px'
          }}>
            B
          </div>
          <div>
            <h1 style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.02em', margin: 0 }}>
              BUGDROP
            </h1>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
              Control Center
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', border: '1px solid var(--border)', borderRadius: '100px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: connected ? 'var(--success)' : 'var(--error)' }} />
            <span style={{ fontSize: '10px', fontWeight: 600, color: connected ? 'var(--text)' : 'var(--text-muted)' }}>
              {connected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none', borderBottom: '1px solid transparent' }}
            onMouseOver={e => e.target.style.color = 'var(--text)'}
            onMouseOut={e => e.target.style.color = 'var(--text-muted)'}
          >
            Storefront &rarr;
          </a>
        </div>
      </header>

      {/* ═══ MAIN LAYOUT ═══ */}
      <main style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* STATS & CHARTS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <StatsBar connected={connected} progress={progress} logStats={stats} />
          <TrafficCharts logs={logs} />
        </div>

        {/* LOGS & CTF */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', flex: 1, minHeight: '500px' }}>
          
          {/* Logs */}
          <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}>
            <LogConsole logs={logs} onClear={clearLogs} />
          </div>

          {/* CTF Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }} className="console-scroll">
            <FlagInput onSubmit={submitFlag} />
            <ChallengePanel challenges={challenges} solved={solved} hints={hints} onGetHint={getHint} />
            
            <button
              onClick={resetProgress}
              style={{
                marginTop: 'auto',
                padding: '12px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Reset CTF Progress
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
