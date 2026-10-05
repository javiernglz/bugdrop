import { useState } from 'react';

function DidacticDropdown({ content, color = 'var(--info)' }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 mb-2">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-transparent border-none p-0 cursor-pointer text-[var(--text-muted)] opacity-75 hover:opacity-100 transition-opacity"
      >
        <img src="/bug-triager-icon.png" alt="Triager" className="w-10 h-10 rounded-full object-cover" />
        <span className="text-[14px] font-semibold underline italic">Why?</span>
        <span className="text-[10px] ml-1">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div 
          className="mt-3 p-4 bg-black/20 text-[var(--text-muted)] text-[13px] leading-relaxed rounded-r-lg shadow-inner"
          style={{ borderLeft: `2px solid ${color}` }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export default function DidacticReport({ report, onClose }) {
  if (!report) return null;

  
  const sev = report.cvss.severity.toLowerCase();
  const isCritical = sev === 'critical';
  const isHigh = sev === 'high';
  const isMedium = sev === 'medium';
  
  let severityColor = 'var(--success)';
  let badgeBg = 'linear-gradient(135deg, #10b981, #34d399)';
  let badgeShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';

  if (isCritical) {
    severityColor = '#991b1b';
    badgeBg = 'linear-gradient(135deg, #7f1d1d, #b91c1c)';
    badgeShadow = '0 4px 15px rgba(185, 28, 28, 0.5)';
  } else if (isHigh) {
    severityColor = 'var(--error)';
    badgeBg = 'linear-gradient(135deg, #dc2626, #ef4444)';
    badgeShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
  } else if (isMedium) {
    severityColor = 'var(--warning)';
    badgeBg = 'linear-gradient(135deg, #d97706, #f59e0b)';
    badgeShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
  }


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
          <div>
            <h2 className="m-0 text-lg font-semibold tracking-tight text-[var(--text)]">
              {report.title}
            </h2>
            <div className="flex gap-4 mt-2 text-xs font-mono text-[var(--text-muted)]">
              <span><strong className="text-[var(--text-faint)] font-sans uppercase text-[10px] tracking-wider mr-1">Scope</strong> {report.scope}</span>
              <span><strong className="text-[var(--text-faint)] font-sans uppercase text-[10px] tracking-wider mr-1">Endpoint</strong> {report.endpoint}</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--text)] text-sm rounded-lg hover:bg-[var(--border)] transition-colors cursor-pointer shrink-0"
          >
            Close
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 flex flex-col gap-10">
          
          {/* CRITICALITY / CVSS 4.0 */}
          <section>
            <h3 className="text-xl font-bold tracking-tight text-[var(--text)] mb-5">
              Criticality (CVSS v4.0)
            </h3>
            <div className="flex flex-wrap gap-4 items-center mb-6">
              <div 
                className="px-5 py-2.5 flex items-center gap-3 rounded-full text-white shadow-lg"
                style={{ background: badgeBg, boxShadow: badgeShadow }}
              >
                <span className="font-mono text-lg font-extrabold tracking-tight">{report.cvss.score}</span>
                <div className="w-[1px] h-5 bg-white/30"></div>
                <span className="font-sans text-sm font-bold uppercase tracking-widest">{report.cvss.severity}</span>
              </div>
              <code className="text-[11px] text-[var(--text-muted)] bg-[var(--bg)] px-3 py-1.5 rounded-md font-mono border border-[var(--border)]">
                {report.cvss.vector}
              </code>
            </div>
            
            
            <div className="flex flex-col gap-6 mt-6">
              {/* Exploitability Metrics (4 boxes) */}
              <div>
                <h4 className="text-[11px] font-bold text-[var(--text-faint)] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-[1px] bg-[var(--border)]"></span> Exploitability <span className="flex-1 h-[1px] bg-[var(--border)]"></span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {report.cvss.metrics.slice(0, 4).map((m, i) => (
                    <div key={i} className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-xl transition-colors hover:border-[var(--border-hover)] shadow-sm">
                      <div className="text-[10px] font-semibold tracking-wider text-[var(--text-faint)] uppercase mb-1">{m.name}</div>
                      <div className="text-[14px] font-bold text-[var(--text)] mb-2">{m.value}</div>
                      {m.didactic && <DidacticDropdown content={m.didactic} color={severityColor} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact Metrics (3 boxes) */}
              <div>
                <h4 className="text-[11px] font-bold text-[var(--text-faint)] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-[1px] bg-[var(--border)]"></span> Impact <span className="flex-1 h-[1px] bg-[var(--border)]"></span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {report.cvss.metrics.slice(4, 7).map((m, i) => (
                    <div key={i} className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-xl transition-colors hover:border-[var(--border-hover)] shadow-sm">
                      <div className="text-[10px] font-semibold tracking-wider text-[var(--text-faint)] uppercase mb-1">{m.name}</div>
                      <div className="text-[14px] font-bold text-[var(--text)] mb-2">{m.value}</div>
                      {m.didactic && <DidacticDropdown content={m.didactic} color={severityColor} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* TECH DETAILS */}
          <section>
            <h3 className="text-xl font-bold tracking-tight text-[var(--text)] mb-5">
              Technical Details
            </h3>
            <div className="text-xs text-[var(--text)] mb-3 font-bold tracking-wide">
              Type: <span className="font-medium text-[var(--text-muted)]">{report.type}</span>
            </div>
            <p className="text-[14px] text-[var(--text-muted)] leading-relaxed m-0">
              {report.description}
            </p>
          </section>

          {/* PAYLOAD */}
          <section>
            <h3 className="text-xl font-bold tracking-tight text-[var(--text)] mb-5">
              Payload
            </h3>
            <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[#0d1117] shadow-inner">
              <pre className="m-0 p-5 text-[#c9d1d9] text-[13px] font-mono overflow-x-auto leading-relaxed">
                {report.payload}
              </pre>
            </div>
            {report.payload_didactic && (
              <div className="mt-2">
                <DidacticDropdown content={report.payload_didactic} color={severityColor} />
              </div>
            )}
          </section>

          {/* POC */}
          <section>
            <h3 className="text-xl font-bold tracking-tight text-[var(--text)] mb-5">
              Proof of Concept (Recreation Steps)
            </h3>
            <ol className="m-0 pl-5 text-[var(--text-muted)] text-[14px] leading-relaxed space-y-4 marker:text-[var(--text-faint)] font-medium">
              {report.poc.map((p, i) => (
                <li key={i} className="pl-2">
                  <span className="text-[var(--text)]">{p.step}</span>
                  {p.didactic && <DidacticDropdown content={p.didactic} color={severityColor} />}
                </li>
              ))}
            </ol>
          </section>

          {/* IMPACT & REMEDIATION */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[var(--bg)] p-6 rounded-xl border border-[var(--border)]">
              <h3 className="text-xl font-bold tracking-tight text-[var(--text)] mb-4">
                Potential Impact
              </h3>
              <p className="text-[13.5px] text-[var(--text-muted)] leading-relaxed m-0">
                {report.impact}
              </p>
            </div>
            <div className="bg-[var(--bg)] p-6 rounded-xl border border-[var(--border)]">
              <h3 className="text-xl font-bold tracking-tight text-[var(--text)] mb-4">
                Remediation (Fix)
              </h3>
              <p className="text-[13.5px] text-[var(--text-muted)] leading-relaxed m-0">
                {report.remediation}
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
