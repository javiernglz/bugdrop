import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import RulesModal from './RulesModal';
import Tutorials from './Tutorials';

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const location = useLocation();

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('bugdrop-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('bugdrop-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const isActive = (to) => location.pathname === to;

  const navLink = (to, label) => (
    <Link
      to={to}
      style={{ color: isActive(to) ? 'var(--text)' : 'var(--text-muted)' }}
      className="text-sm hover:opacity-70 transition-opacity"
    >
      {label}
    </Link>
  );

  return (
    <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ═══ HEADER ═══ */}
      <header style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}
              className="px-6 py-4 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <div style={{ width: '24px', height: '24px', borderRadius: '4px', overflow: 'hidden' }}>
              <img src="/bug-guide-head.png" alt="Bugdrop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ color: 'var(--text)' }} className="text-sm font-medium tracking-wide">
              Bugdrop
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link to="/" id="nav-drops" style={{ color: isActive('/') ? 'var(--text)' : 'var(--text-muted)' }} className="text-sm hover:opacity-70 transition-opacity">
              Drops
            </Link>
            {user && (
              <Link
                to="/orders"
                id="nav-collection"
                style={{ color: isActive('/orders') ? 'var(--text)' : 'var(--text-muted)' }}
                className="text-sm hover:opacity-70 transition-opacity"
              >
                My Collection
              </Link>
            )}
            <Link
              to="/cart"
              id="nav-cart"
              style={{ color: isActive('/cart') ? 'var(--text)' : 'var(--text-muted)' }}
              className="relative text-sm hover:opacity-70 transition-opacity"
            >
              My Box
              {count > 0 && (
                <span style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                      className="absolute -top-1.5 -right-3.5 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <span style={{ color: 'var(--text-faint)' }} className="text-xs">
                  {user.display_name}
                </span>
                <button onClick={logout} style={{ color: 'var(--text-muted)' }}
                        className="text-xs hover:opacity-70 transition-opacity">
                  Sign out
                </button>
              </div>
            ) : (
              navLink('/login', 'Collector Login')
            )}

            {/* Theme toggle */}
            <button
              onClick={() => setDark(d => !d)}
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '6px' }}
              className="p-1.5 hover:opacity-70 transition-opacity"
              aria-label="Toggle theme"
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* ═══ FOOTER / NEWSLETTER ═══ */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        backgroundColor: 'var(--bg)',
        padding: '64px 24px',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '48px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
              Subscribe and get 10% off
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Receive news, exclusive drops and much more.
            </p>
            <form
              onSubmit={async e => {
                e.preventDefault();
                const email = e.target.email.value;
                try {
                  const res = await fetch('/api/newsletter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                  });
                  const data = await res.json();
                  if (data.flag) {
                    alert(`Flag Found!\n${data.message}\nCoupon: ${data.coupon}\nFLAG: ${data.flag}`);
                  } else if (data.error) {
                    alert(`Error: ${data.details}\n${data.hint}`);
                  } else {
                    alert(data.message);
                  }
                  e.target.reset();
                } catch (err) {
                  alert('Failed to subscribe.');
                }
              }}
              style={{ display: 'flex', borderBottom: '1px solid var(--text)', paddingBottom: '8px', maxWidth: '400px' }}
            >
              <input
                id="newsletter-input"
                type="text"
                name="email"
                placeholder="EMAIL ADDRESS"
                required
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '12px',
                  letterSpacing: '0.05em',
                  color: 'var(--text)',
                  textTransform: 'uppercase'
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                &rarr;
              </button>
            </form>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>BUGDROP</span>
            <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Collect the unexpected.</span>
            <span style={{ fontSize: '10px', color: 'var(--text-faint)', opacity: 0.5, marginTop: '8px' }}>
              [CTF Environment — Intentional Vulnerabilities]
            </span>
          </div>
        </div>
      </footer>
      <RulesModal />
      <Tutorials />
    </div>
  );
}
