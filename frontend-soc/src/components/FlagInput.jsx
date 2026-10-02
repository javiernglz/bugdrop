import { useState } from 'react';

export default function FlagInput({ onSubmit }) {
  const [flag, setFlag] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (flag.trim()) {
      onSubmit(flag.trim());
      setFlag('');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg-card)' }}>
      <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>Submit Flag</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          placeholder="FLAG{...}"
          style={{
            flex: 1,
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '13px',
            color: 'var(--text)',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: 'var(--text)',
            color: 'var(--bg)',
            border: 'none',
            padding: '0 16px',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
