import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Keeps the 'user' variable name for auth context compatibility
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewMsg, setReviewMsg] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => {
        setProduct(data.product);
        setReviews(data.reviews);
      });
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  async function handleReview(e) {
    e.preventDefault();
    if (!user) return navigate('/login');

    const res = await fetch(`/api/products/${id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content: reviewContent, rating: reviewRating }),
    });
    const data = await res.json();

    setReviewMsg(data);
    setReviewContent('');

    const updated = await fetch(`/api/products/${id}`).then(r => r.json());
    setReviews(updated.reviews);
  }

  if (!product) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-faint)', fontSize: '14px' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px' }}>
      
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: '13px', cursor: 'pointer', marginBottom: '32px',
          display: 'inline-flex', alignItems: 'center', gap: '8px'
        }}
      >
        &larr; Back to Drops
      </button>

      {/* ═══ PRODUCT HEADER ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', marginBottom: '64px' }}>
        
        {/* Image */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          overflow: 'hidden',
          aspectRatio: '1 / 1',
          position: 'relative'
        }}>
          <img
            src={IMG[product.id] || '/bug-placeholder.jpg'}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div style={{
            display: 'none', position: 'absolute', inset: 0,
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg) 100%)',
          }}>
            <span style={{ fontSize: '3rem', opacity: 0.4 }}>🐛</span>
          </div>
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{
            display: 'inline-block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '12px'
          }}>
            {product.category === 'secret' ? 'Secret Drop' : product.category === 'limited' ? 'Limited Edition' : 'Series 01'}
          </span>
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            {product.name}
          </h1>
          
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '32px' }}>
            {product.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '32px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1 }}>
              {formatPrice(product.price)}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '4px' }}>
              {product.stock} units left
            </span>
          </div>

          <button
            id="add-to-box-btn"
            onClick={handleAddToCart}
            style={{
              width: '100%',
              backgroundColor: added ? 'var(--bg-card)' : 'var(--accent)',
              color: added ? 'var(--text)' : 'var(--accent-text)',
              border: added ? '1px solid var(--border)' : 'none',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {added ? 'Added to Box' : 'Add to Box'}
          </button>
        </div>
      </div>

      {/* ═══ REVIEWS SECTION (VULNERABLE) ═══ */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '48px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', marginBottom: '24px' }}>
          Collector Reviews ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
            No reviews yet. Be the first to review this drop.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
            {reviews.map(review => (
              <div key={review.id} style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
                    {review.display_name} <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>@{review.username}</span>
                  </span>
                  <span style={{ fontSize: '12px', color: '#fbbf24', letterSpacing: '0.1em' }}>
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </span>
                </div>
                {/* VULN: dangerouslySetInnerHTML — no sanitiza el contenido, permite XSS */}
                <div
                  style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}
                  dangerouslySetInnerHTML={{ __html: review.content }}
                />
              </div>
            ))}
          </div>
        )}

        {reviewMsg && (
          <div style={{
            marginBottom: '24px',
            borderRadius: '12px',
            border: '1px solid',
            padding: '16px',
            fontSize: '13px',
            backgroundColor: reviewMsg.flag ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)',
            borderColor: reviewMsg.flag ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
            color: 'var(--text)'
          }}>
            <p style={{ fontWeight: 500 }}>{reviewMsg.message}</p>
            {reviewMsg.flag && (
              <p style={{ marginTop: '8px', fontFamily: 'monospace', color: '#fbbf24' }}>
                FLAG: {reviewMsg.flag}
              </p>
            )}
            {reviewMsg.stolen_cookie && (
              <p style={{ marginTop: '8px' }}>
                Admin Cookie: <code style={{ color: '#ef4444' }}>{reviewMsg.stolen_cookie}</code>
              </p>
            )}
            {reviewMsg.admin_reaction && (
              <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>{reviewMsg.admin_reaction}</p>
            )}
          </div>
        )}

        <form onSubmit={handleReview} style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '16px' }}>
            Write a review
          </h4>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setReviewRating(star)}
                style={{
                  background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer',
                  color: star <= reviewRating ? '#fbbf24' : 'var(--border-hover)'
                }}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            id="review-textarea"
            value={reviewContent}
            onChange={e => setReviewContent(e.target.value)}
            placeholder="Share your thoughts on this Bug..."
            rows={4}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              color: 'var(--text)',
              outline: 'none',
              resize: 'none',
              marginBottom: '16px',
              fontFamily: 'inherit'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--text)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            id="submit-review-btn"
            type="submit"
            style={{
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}
