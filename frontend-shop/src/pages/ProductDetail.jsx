import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function formatPrice(price) {
  return `$${price.toLocaleString('es-MX')}`;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { villain } = useAuth();
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
    if (!villain) return navigate('/login');

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
    return <div className="text-center text-gray-500 py-20">Cargando producto...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate('/')}
        className="text-xs text-gray-500 hover:text-gray-300 mb-6 inline-block transition"
      >
        &larr; Volver al catálogo
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gradient-to-br from-gray-900 to-[#16213e] rounded-xl flex items-center justify-center text-8xl h-72 border border-gray-800 overflow-hidden">
          <img
            src={{
              1: '/hero.jpg', 2: '/shark.jpg', 3: '/uniforms.jpg',
              4: '/volcano.jpg', 5: '/monologue.jpg', 6: '/cat.jpg',
              7: '/satellite.jpg', 8: '/sub.jpg', 9: '/mind_control.jpg',
              10: '/trap.jpg'
            }[product.id] || '/hero.jpg'}
            alt={product.name}
            className="w-full h-full object-cover pixelated"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full">
            {product.category}
          </span>
          <h2 className="text-2xl font-bold text-gray-100 mt-3 mb-2">{product.name}</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">{product.description}</p>

          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-bold text-red-400">{formatPrice(product.price)}</span>
            <span className="text-xs text-gray-600 mb-1">Stock: {product.stock} unidades</span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full py-3 rounded-lg text-sm font-medium transition ${
              added
                ? 'bg-green-800 text-green-200'
                : 'bg-red-800 hover:bg-red-700 text-white'
            }`}
          >
            {added ? 'Añadido al carrito' : 'Añadir al Carrito'}
          </button>

          {product.id === 1 && (
            <p className="text-[10px] text-yellow-600 mt-2 text-center">
              * Requiere licencia de destrucción masiva nivel 5 (no verificamos)
            </p>
          )}
        </div>
      </div>

      {/* Sección de reseñas — VULNERABLE: renderiza HTML sin sanitizar */}
      <div className="border-t border-gray-800 pt-8">
        <h3 className="text-lg font-semibold text-gray-200 mb-6">
          Reseñas de Villanos ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500 mb-8">
            Ningún villano ha opinado todavía. Sé el primero en contar tu experiencia.
          </p>
        ) : (
          <div className="space-y-4 mb-8">
            {reviews.map(review => (
              <div key={review.id} className="bg-[#16213e] rounded-lg border border-gray-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-300">
                    {review.display_name}
                    <span className="text-gray-600 ml-2">@{review.username}</span>
                  </span>
                  <span className="text-xs text-yellow-500">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </span>
                </div>
                {/* VULN: dangerouslySetInnerHTML — no sanitiza el contenido */}
                <div
                  className="text-sm text-gray-400"
                  dangerouslySetInnerHTML={{ __html: review.content }}
                />
              </div>
            ))}
          </div>
        )}

        {reviewMsg && (
          <div className={`mb-4 rounded-lg border px-4 py-3 text-xs ${
            reviewMsg.flag
              ? 'bg-red-900/20 border-red-800 text-red-300'
              : 'bg-green-900/20 border-green-800 text-green-300'
          }`}>
            <p className="font-medium">{reviewMsg.message}</p>
            {reviewMsg.flag && (
              <p className="mt-1 font-mono text-yellow-400">BANDERA: {reviewMsg.flag}</p>
            )}
            {reviewMsg.stolen_cookie && (
              <p className="mt-1">Cookie del admin: <code className="text-red-400">{reviewMsg.stolen_cookie}</code></p>
            )}
            {reviewMsg.admin_reaction && (
              <p className="mt-1 text-gray-400">{reviewMsg.admin_reaction}</p>
            )}
          </div>
        )}

        <form onSubmit={handleReview} className="bg-[#16213e] rounded-lg border border-gray-800 p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Deja tu reseña</h4>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setReviewRating(star)}
                className={`text-lg transition ${star <= reviewRating ? 'text-yellow-500' : 'text-gray-700'}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={reviewContent}
            onChange={e => setReviewContent(e.target.value)}
            placeholder="Escribe tu opinión como villano profesional..."
            rows={3}
            className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-red-500 focus:outline-none resize-none mb-3"
          />
          <button
            type="submit"
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-4 py-2 rounded-lg transition"
          >
            Publicar Reseña
          </button>
        </form>
      </div>
    </div>
  );
}
