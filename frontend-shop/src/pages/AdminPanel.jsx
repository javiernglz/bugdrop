import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. First, check if the token is in localStorage (the user stole it and pasted it)
    const token = localStorage.getItem('bugdrop_token');
    
    // We send it to our new admin endpoint
    fetch('/api/admin/dashboard', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(({ status, body }) => {
      if (status !== 200) {
        setError(body.error || 'Access Denied');
      } else {
        setData(body);
      }
    })
    .catch(err => {
      setError('Connection failed.');
    });
  }, []);

  if (error) {
    return (
      <div style={{
        minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', backgroundColor: '#fafafa', color: '#111'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 200, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
          403 Forbidden
        </h1>
        <p style={{ color: '#666', fontSize: '0.9rem', maxWidth: '400px', textAlign: 'center' }}>
          Admin's private dashboard. Access is strictly restricted.
          <br /><br />
          {error}
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '2rem', padding: '10px 24px', backgroundColor: '#000', color: '#fff',
            border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
          }}
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  if (!data) return <div style={{ padding: '40px', textAlign: 'center' }}>Authenticating...</div>;

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      {/* Sleek Header */}
      <header style={{ borderBottom: '1px solid #eaeaea', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: 500, letterSpacing: '-0.01em' }}>
          Bugdrop <span style={{ color: '#888', fontWeight: 400 }}>// Admin Hub</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#666' }}>
          <span>Status: <strong style={{ color: '#10b981' }}>Operational</strong></span>
          <span>Logged in as: <strong>Admin</strong></span>
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '60px' }}>
        {/* Left Column: Data */}
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.03em', marginBottom: '8px' }}>
            {data.message}
          </h1>
          <p style={{ color: '#666', marginBottom: '48px', fontSize: '15px' }}>
            Overview of your luxury manufacturing empire.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
            <div style={{ padding: '24px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Revenue</div>
              <div style={{ fontSize: '24px', fontWeight: 300 }}>{data.stats.revenue}</div>
            </div>
            <div style={{ padding: '24px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Active Molds</div>
              <div style={{ fontSize: '24px', fontWeight: 300 }}>{data.stats.active_molds}</div>
            </div>
            <div style={{ padding: '24px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Pending Shipments</div>
              <div style={{ fontSize: '24px', fontWeight: 300 }}>{data.stats.pending_shipments}</div>
            </div>
          </div>

          <div style={{ padding: '32px', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              Secure System Flag
            </h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
              This flag verifies your successful intrusion into the Admin's Dashboard.
            </p>
            <div style={{ 
              fontFamily: 'monospace', fontSize: '14px', padding: '16px', 
              backgroundColor: '#fff', border: '1px dashed #d1d5db', borderRadius: '6px',
              color: '#000', fontWeight: 500, letterSpacing: '0.02em'
            }}>
              {data.flag}
            </div>
          </div>
        </div>

        {/* Right Column: The Bug CEO */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', aspectRatio: '1/1', position: 'relative' }}>
            <img 
              src="/bug-ceo-head.png" 
              alt="Admin" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.1))' }} 
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Identity Confirmed</div>
            <div style={{ fontSize: '15px', fontWeight: 500, marginTop: '4px' }}>Admin</div>
          </div>
        </div>
      </main>
    </div>
  );
}
