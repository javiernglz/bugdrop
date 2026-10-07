import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'series-01', label: 'Series 01' },
  { key: 'limited', label: 'Limited' },
  { key: 'secret', label: 'Secret' },
];

// Image map — will be replaced with clay renders
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

const RARITY_COLOR = {
  'Common':     { bg: '#f0f0f0', text: '#6b6b6b', dark_bg: '#2a2a2a', dark_text: '#8a8a8a' },
  'Rare':       { bg: '#e8f4ff', text: '#2563eb', dark_bg: '#1e3a5f', dark_text: '#60a5fa' },
  'Ultra Rare': { bg: '#f5e8ff', text: '#7c3aed', dark_bg: '#3b1f5f', dark_text: '#a78bfa' },
  'Limited':    { bg: '#fee2e2', text: '#dc2626', dark_bg: '#450a0a', dark_text: '#f87171' },
  'Secret':     { bg: '#fff8e8', text: '#b45309', dark_bg: '#3d2800', dark_text: '#fbbf24' },
};

function formatPrice(price) {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(0)}M`;
  if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`;
  return `$${price}`;
}

function RarityBadge({ rarity }) {
  const colors = RARITY_COLOR[rarity] || RARITY_COLOR['Common'];
  return (
    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px',
                   backgroundColor: colors.bg, color: colors.text }}
          className="font-medium tracking-wide">
      {rarity}
    </span>
  );
}

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = category ? `/api/products?category=${category}` : '/api/products';
    fetch(url)
      .then(r => r.json())
      .then(data => setProducts(data.products))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '64px 24px' }}>

      {/* ═══ HERO ═══ */}
      <div style={{ marginBottom: '64px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-faint)', fontSize: '11px', letterSpacing: '0.14em',
                    textTransform: 'uppercase', marginBottom: '12px', fontWeight: 500 }}>
          Series 01 — Now Available
        </p>
        <h1 style={{ color: 'var(--text)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700,
                     letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Meet the Bugs.
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '16px auto 0',
                    fontSize: '14px', lineHeight: 1.7 }}>
          Collectible art figures, each one unique. Open a blind box and discover which Bug joins your display.
          Common, Rare, or the elusive Secret Bug.
        </p>
      </div>

      {/* ═══ CATEGORY FILTER ═══ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', marginBottom: '48px', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            style={{
              padding: '6px 18px',
              borderRadius: '999px',
              fontSize: '13px',
              border: '1px solid var(--border)',
              backgroundColor: category === cat.key ? 'var(--accent)' : 'transparent',
              color: category === cat.key ? 'var(--accent-text)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ═══ PRODUCT GRID ═══ */}
      {loading ? (
        <div style={{ color: 'var(--text-faint)', textAlign: 'center', padding: '80px 0', fontSize: '14px' }}>
          Loading collection...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
          {products.map(product => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group block product-card"
              style={{ textDecoration: 'none' }}
            >
              {/* Image */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                overflow: 'hidden',
                aspectRatio: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                transition: 'border-color 0.2s ease',
                position: 'relative',
              }}
              >
                <img
                  src={IMG[product.id] || '/bug-placeholder.jpg'}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover',
                           transition: 'transform 0.4s ease' }}
                  className="group-hover:scale-105"
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback placeholder */}
                <div style={{
                  display: 'none',
                  position: 'absolute', inset: 0,
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg) 100%)',
                }}>
                  <span style={{ fontSize: '2rem', opacity: 0.4 }}>🐛</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.08em' }}>
                    COMING SOON
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="px-1">
                <p style={{ color: 'var(--text)', fontSize: '13px', fontWeight: 500,
                            marginBottom: '4px', lineHeight: 1.3 }}>
                  {product.name}
                </p>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {formatPrice(product.price)}
                  </span>
                  {product.category === 'secret' && <RarityBadge rarity="Secret" />}
                  {product.category === 'limited' && <RarityBadge rarity="Limited" />}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
