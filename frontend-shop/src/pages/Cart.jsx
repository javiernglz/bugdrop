import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

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

export default function Cart() {
  const { user } = useAuth();
  const { items, total, clearCart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  async function handleCheckout() {
    if (!user) return navigate('/login');
    setProcessing(true);

    const res = await fetch('/api/cart/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        items: items.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      }),
    });
    const data = await res.json();
    setCheckoutResult(data);
    if (res.ok) clearCart();
    setProcessing(false);
  }

  if (items.length === 0 && !checkoutResult) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: '3rem', opacity: 0.2, display: 'block', marginBottom: '16px' }}>📦</span>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
          Your Box is Empty
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          Every great collection starts with a single Bug.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
            padding: '12px 24px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'opacity 0.2s ease',
            textDecoration: 'none'
          }}
          onMouseEnter={e => e.target.style.opacity = '0.8'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          Explore Drops
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)', marginBottom: '32px' }}>
        My Box
      </h2>

      {checkoutResult ? (
        <div style={{
          backgroundColor: checkoutResult.flag ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)',
          border: '1px solid',
          borderColor: checkoutResult.flag ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
          borderRadius: '16px',
          padding: '40px 24px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>
            {checkoutResult.flag ? '🚨' : '📦'}
          </span>
          <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '8px', fontWeight: 500 }}>
            {checkoutResult.message}
          </p>
          {checkoutResult.flag && (
            <p style={{
              fontFamily: 'monospace',
              color: '#fbbf24',
              backgroundColor: 'var(--bg-input)',
              display: 'inline-block',
              padding: '8px 16px',
              borderRadius: '8px',
              marginTop: '16px',
              fontSize: '13px'
            }}>
              {checkoutResult.flag}
            </p>
          )}
          <div style={{ marginTop: '24px' }}>
            {checkoutResult.order_id && (
              <Link
                to={`/orders`}
                style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'underline' }}
              >
                View My Collection &rarr;
              </Link>
            )}
          </div>
          <button
            onClick={() => setCheckoutResult(null)}
            style={{
              marginTop: '24px',
              background: 'none',
              border: 'none',
              fontSize: '13px',
              color: 'var(--text-faint)',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Continue browsing
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {items.map(item => (
              <div
                key={item.product_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '12px'
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  flexShrink: 0,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  position: 'relative'
                }}>
                  <img
                    src={IMG[item.product_id] || '/bug-placeholder.jpg'}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div style={{
                    display: 'none',
                    position: 'absolute', inset: 0,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'var(--bg-input)',
                  }}>
                    <span style={{ opacity: 0.3, fontSize: '20px' }}>🐛</span>
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {formatPrice(item.unit_price)}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)',
                      color: 'var(--text)', fontSize: '12px', cursor: 'pointer'
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '13px', color: 'var(--text)', width: '20px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)',
                      color: 'var(--text)', fontSize: '12px', cursor: 'pointer'
                    }}
                  >
                    +
                  </button>
                </div>

                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', width: '80px', textAlign: 'right' }}>
                  {formatPrice(item.unit_price * item.quantity)}
                </span>

                <button
                  onClick={() => removeFromCart(item.product_id)}
                  style={{
                    background: 'none', border: 'none', fontSize: '14px',
                    color: 'var(--text-faint)', cursor: 'pointer', padding: '0 8px'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{
            backgroundColor: 'var(--bg)',
            borderTop: '1px solid var(--border)',
            paddingTop: '24px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total estimated</span>
            <span style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text)' }}>
              {formatPrice(total)}
            </span>
          </div>

          <button
            id="checkout-btn"
            onClick={handleCheckout}
            disabled={processing}
            style={{
              width: '100%',
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-text)',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: processing ? 'not-allowed' : 'pointer',
              opacity: processing ? 0.7 : 1,
              transition: 'opacity 0.2s ease'
            }}
          >
            {processing ? 'Processing...' : 'Checkout'}
          </button>

          {!user && (
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px' }}>
              You must <Link to="/login" style={{ color: 'var(--text)', textDecoration: 'underline' }}>sign in</Link> to checkout.
            </p>
          )}
        </>
      )}
    </div>
  );
}
