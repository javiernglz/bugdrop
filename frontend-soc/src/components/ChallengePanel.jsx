export default function ChallengePanel({ challenges, solved, hints, onGetHint }) {
  if (!challenges || challenges.length === 0) {
    return (
      <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: '13px' }}>
        No challenges loaded.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {challenges.map((chal) => {
        const isSolved = (solved || []).includes(chal.key);
        // hints is an object keyed by `${challengeKey}-${level}`
        const hasHint = !!(hints && hints[`${chal.key}-1`]);

        return (
          <div key={chal.key} style={{
            padding: '16px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            backgroundColor: isSolved ? 'var(--bg)' : 'var(--bg-card)',
            opacity: isSolved ? 0.6 : 1,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {isSolved && (
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: 'var(--success)' }} />
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0, textDecoration: isSolved ? 'line-through' : 'none' }}>
                {chal.title}
              </h4>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: '4px' }}>
                {chal.difficulty}
              </span>
            </div>
            
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.4 }}>
              {chal.description}
            </p>
            
            {!isSolved && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
                {hasHint ? (
                  <div style={{ fontSize: '12px', color: 'var(--warning)', backgroundColor: 'var(--bg)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    <strong>Hint:</strong> {hints[`${chal.key}-1`]?.hint || 'No hint available.'}
                  </div>
                ) : (
                  <button
                    onClick={() => onGetHint(chal.key, 1)}
                    style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Reveal Hint (-5 pts)
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
