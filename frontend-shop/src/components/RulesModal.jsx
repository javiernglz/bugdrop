import { useState, useEffect } from 'react';

function Spoiler({ label, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '14px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--text)',
          fontSize: '13px',
          fontWeight: 500,
        }}
      >
        {label}
        <span style={{
          fontSize: '11px',
          color: 'var(--text-faint)',
          transition: 'transform 0.2s ease',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          &#9660;
        </span>
      </button>
      {open && (
        <div style={{
          padding: '0 16px 14px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function RulesModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('bugdrop-rules-seen')) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function close() {
    setVisible(false);
    localStorage.setItem('bugdrop-rules-seen', 'true');
  }

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 999,
          backgroundColor: 'transparent',
          border: 'none',
          width: '140px',
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.2))',
          transition: 'transform 0.2s ease'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
        title="Rules"
      >
        <img src="/bug-rules-head.png" alt="Rules" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(0.9)' }} />
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        padding: '24px',
      }}
      onClick={e => { if (e.target === e.currentTarget) close(); }}
    >
      <div style={{
        backgroundColor: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '460px',
        padding: '36px 32px',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.12)',
      }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text)', marginBottom: '14px' }}>
          Rules
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '24px' }}>
          This is not a real store. Bugdrop is a training environment with
          7 real web vulnerabilities hidden across the site. Find them,
          exploit them, capture the flags. Use DevTools, intercept requests,
          read the source, and fuzz endpoints — everything you need is already here.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
          <Spoiler label="What kind of vulnerabilities?">
            You are looking for business logic flaws, injection points,
            access control issues, client-side trust problems, and information leaks.
            Seven in total, ranging from easy to hard difficulty.
          </Spoiler>

          <Spoiler label="Where should I look?">
            The checkout flow, product reviews, order history, the payment
            process, the newsletter form, and hidden developer assets.
          </Spoiler>
          
          <Spoiler label="Is Fuzzing allowed?">
            Yes! You can (and should) use directory brute-forcing tools like
            Gobuster, DirBuster, or ffuf with a common wordlist. Not all
            files are linked in the frontend. Just try not to launch DoS attacks.
          </Spoiler>

          <Spoiler label="I need more help">
            Open the Mini-SOC at <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>localhost:5174</span> — it
            has a full challenge panel with two-level hints for each
            vulnerability, plus a real-time log of every request you make.
          </Spoiler>
        </div>

        <button
          onClick={close}
          style={{
            width: '100%',
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
            border: 'none',
            padding: '14px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
