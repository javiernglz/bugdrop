import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const COLLECTOR_ACCOUNTS = [
  { username: 'minion_42', password: 'esbirro2024', hint: 'Collector #42 — Verified Buyer' },
  { username: 'lady_caos', password: 'chaos666', hint: 'Lady Caos — Early Adopter' },
  { username: 'prof_doom', password: 'doom1234', hint: 'Prof. Doom — Bulk Buyer' },
  { username: 'hacker_fantasma', password: 'ghost_in_shell', hint: 'The Ghost — Anonymous Collector' },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAccounts, setShowAccounts] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  function quickLogin(account) {
    setUsername(account.username);
    setPassword(account.password);
  }

  return (
    <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto', padding: '80px 24px' }}>
      
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '40px 32px'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '16px' }}>🐛</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Collector Access
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Sign in to manage your drops and collection.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>
              Collector ID
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. collector_89"
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                color: 'var(--text)',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--text)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>
              Passcode
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                color: 'var(--text)',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--text)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '13px',
              color: '#ef4444'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
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
              marginTop: '8px',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={e => e.target.style.opacity = '0.8'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            Access Collection
          </button>
        </form>

        <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setShowAccounts(!showAccounts)}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              fontSize: '12px',
              color: 'var(--text-faint)',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {showAccounts ? 'Hide' : 'Show'} test accounts (CTF)
          </button>

          {showAccounts && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              {COLLECTOR_ACCOUNTS.map(acc => (
                <button
                  key={acc.username}
                  onClick={() => quickLogin(acc)}
                  style={{
                    textAlign: 'left',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease'
                  }}
                  onMouseEnter={e => e.target.style.borderColor = 'var(--text)'}
                  onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>{acc.hint}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>
                    {acc.username} / {acc.password}
                  </div>
                </button>
              ))}
              <p style={{ fontSize: '11px', color: 'var(--text-faint)', textAlign: 'center', marginTop: '12px' }}>
                Note: The admin account (The Creator) is not here. Can you gain access some other way?
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
