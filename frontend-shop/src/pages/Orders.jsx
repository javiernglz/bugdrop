import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const IMG = {
  1:  '/bug-hacker.jpg',
  2:  '/bug-aviator.jpg',
  3:  '/bug-robot.jpg',
  4:  '/bug-firefighter.jpg',
  5:  '/bug-astronaut.jpg',
  6:  '/bug-chef.jpg',
  7:  '/bug-detective.jpg',
  8:  '/bug-scientist.jpg',
  9:  '/bug-cowboy.jpg',
  10: '/bug-samurai.jpg',
  11: '/bug-wizard.jpg',
  12: '/bug-mystery.jpg',
};

function formatPrice(price) {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(0)}M`;
  if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`;
  return `$${price}`;
}

const STATUS_COLOR = {
  pending: { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
  confirmed: { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)' },
  shipped: { color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' },
  completed: { color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)' },
};

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [payResult, setPayResult] = useState(null);

  useEffect(() => {
    if (!user) return navigate('/login');
    fetch('/api/orders', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setOrders(data.orders));
  }, [user, navigate]);

  async function viewOrder(orderId) {
    setSelectedOrder(orderId);
    setPayResult(null);
    const res = await fetch(`/api/orders/${orderId}`, { credentials: 'include' });
    const data = await res.json();
    setOrderDetail(data);
  }

  async function payOrder(orderId) {
    const res = await fetch(`/api/orders/${orderId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      // In a real app, this would redirect to Stripe.
      // But here, the gateway always 'fails' for honest users!
      body: JSON.stringify({ status: 'declined', error: 'insufficient_funds' }),
    });
    const data = await res.json();
    setPayResult(data);
    viewOrder(orderId);
    fetch('/api/orders', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setOrders(d.orders));
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)', marginBottom: '32px' }}>
        My Collection
      </h2>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <span style={{ fontSize: '3rem', opacity: 0.2, display: 'block', marginBottom: '16px' }}>📦</span>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            No drops collected yet.
          </p>
          <Link to="/" style={{ fontSize: '13px', color: 'var(--text)', textDecoration: 'underline' }}>
            Explore the catalog
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map(order => (
              <button
                key={order.id}
                onClick={() => viewOrder(order.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  backgroundColor: 'var(--bg-card)',
                  border: `1px solid ${selectedOrder === order.id ? 'var(--text)' : 'var(--border)'}`,
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>
                    Drop #{order.id}
                  </span>
                  <span style={{
                    fontSize: '11px', padding: '4px 8px', borderRadius: '999px',
                    backgroundColor: STATUS_COLOR[order.status]?.bg || 'var(--border)',
                    color: STATUS_COLOR[order.status]?.color || 'var(--text)'
                  }}>
                    {order.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>
                    {formatPrice(order.total_price)}
                  </span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: order.payment_status === 'paid' ? '#34d399' : '#fbbf24' }}>
                  Payment: {order.payment_status}
                </div>
              </button>
            ))}
          </div>

          <div>
            {orderDetail ? (
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                padding: '32px',
                position: 'sticky',
                top: '96px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '24px' }}>
                  Details for Drop #{orderDetail.order.id}
                </h3>

                {orderDetail.hacked_message && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '12px', padding: '16px', marginBottom: '24px', color: 'var(--text)'
                  }}>
                    <p style={{ fontSize: '13px', fontWeight: 500 }}>{orderDetail.hacked_message}</p>
                    {orderDetail.flag && (
                      <p style={{ fontFamily: 'monospace', color: '#fbbf24', marginTop: '8px', fontSize: '12px' }}>
                        {orderDetail.flag}
                      </p>
                    )}
                  </div>
                )}

                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  <span style={{ display: 'block', marginBottom: '4px' }}>Collector: <strong style={{ color: 'var(--text)' }}>{orderDetail.order.display_name}</strong></span>
                </div>

                {orderDetail.order.notes && (
                  <div style={{ backgroundColor: 'var(--bg-input)', borderRadius: '12px', padding: '16px', marginBottom: '24px', fontSize: '13px', color: 'var(--text)' }}>
                    <span style={{ color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase' }}>Notes</span>
                    {orderDetail.order.notes}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {orderDetail.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--bg-input)' }}>
                        <img
                          src={IMG[item.product_id] || '/bug-placeholder.jpg'}
                          alt={item.product_name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                         <div style={{
                          display: 'none', position: 'absolute', inset: 0,
                          alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-input)'
                        }}>🐛</div>
                      </div>
                      <span style={{ flex: 1, fontSize: '13px', color: 'var(--text)' }}>{item.product_name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>x{item.quantity}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{formatPrice(item.unit_price)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total</span>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
                    {formatPrice(orderDetail.order.total_price)}
                  </span>
                </div>

                {orderDetail.order.payment_status === 'pending' && (
                  <button
                    onClick={() => payOrder(orderDetail.order.id)}
                    style={{
                      width: '100%', backgroundColor: 'var(--accent)', color: 'var(--accent-text)',
                      border: 'none', padding: '14px', borderRadius: '12px', fontSize: '13px',
                      fontWeight: 500, cursor: 'pointer', marginTop: '24px'
                    }}
                  >
                    Complete Payment
                  </button>
                )}

                {payResult && (
                  <div style={{
                    marginTop: '16px', borderRadius: '12px', padding: '16px', fontSize: '12px',
                    backgroundColor: payResult.flag ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)',
                    border: `1px solid ${payResult.flag ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                    color: 'var(--text)'
                  }}>
                    <p>{payResult.message}</p>
                    {payResult.flag && (
                      <p style={{ fontFamily: 'monospace', color: '#fbbf24', marginTop: '4px' }}>{payResult.flag}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '80px 0', fontSize: '14px' }}>
                Select a drop to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
