import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function formatPrice(price) {
  return `$${price.toLocaleString('es-MX')}`;
}

export default function Cart() {
  const { villain } = useAuth();
  const { items, total, clearCart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  async function handleCheckout() {
    if (!villain) return navigate('/login');
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
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto block mb-4 filter drop-shadow-[0_0_12px_rgba(236,72,153,0.8)]"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
        <h2 className="text-xl font-bold text-gray-300 mb-2">Carrito vacío</h2>
        <p className="text-sm text-gray-500 mb-6">
          Un villano sin carrito es solo un ciudadano con mala actitud.
        </p>
        <Link
          to="/"
          className="inline-block bg-red-800 hover:bg-red-700 text-white text-sm px-6 py-2.5 rounded-lg transition"
        >
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-200 mb-6">Carrito de Compras</h2>

      {checkoutResult ? (
        <div className={`rounded-xl border p-6 text-center ${
          checkoutResult.flag
            ? 'bg-red-900/20 border-red-800'
            : 'bg-green-900/20 border-green-800'
        }`}>
          <span className="text-5xl block mb-4">{checkoutResult.flag ? '🚨' : '✅'}</span>
          <p className="text-sm text-gray-200 mb-2">{checkoutResult.message}</p>
          {checkoutResult.flag && (
            <p className="font-mono text-yellow-400 text-lg mt-4 bg-black/30 inline-block px-4 py-2 rounded-lg">
              {checkoutResult.flag}
            </p>
          )}
          <div className="mt-6">
            {checkoutResult.order_id && (
              <Link
                to={`/orders`}
                className="text-xs text-gray-400 hover:text-gray-200 transition"
              >
                Ver mis pedidos &rarr;
              </Link>
            )}
          </div>
          <button
            onClick={() => setCheckoutResult(null)}
            className="mt-4 text-xs text-gray-500 hover:text-gray-300 transition"
          >
            Seguir comprando
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {items.map(item => (
              <div
                key={item.product_id}
                className="flex items-center gap-4 bg-[#16213e] rounded-lg border border-gray-800 p-4"
              >
                <div className="w-16 h-16 shrink-0 rounded overflow-hidden">
                  <img
                    src={{
                      1: '/hero.jpg', 2: '/shark.jpg', 3: '/uniforms.jpg',
                      4: '/volcano.jpg', 5: '/monologue.jpg', 6: '/cat.jpg',
                      7: '/satellite.jpg', 8: '/sub.jpg', 9: '/mind_control.jpg',
                      10: '/trap.jpg'
                    }[item.product_id] || '/hero.jpg'}
                    alt={item.name}
                    className="w-full h-full object-cover pixelated"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-200 truncate">{item.name}</h3>
                  <p className="text-xs text-gray-500">{formatPrice(item.unit_price)} c/u</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="w-6 h-6 rounded bg-gray-800 text-gray-400 hover:bg-gray-700 text-xs transition"
                  >
                    -
                  </button>
                  <span className="text-sm text-gray-300 w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="w-6 h-6 rounded bg-gray-800 text-gray-400 hover:bg-gray-700 text-xs transition"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm font-medium text-red-400 w-24 text-right">
                  {formatPrice(item.unit_price * item.quantity)}
                </span>
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="text-gray-600 hover:text-red-400 transition text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="bg-[#16213e] rounded-lg border border-gray-800 p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Total</span>
              <span className="text-2xl font-bold text-red-400">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={processing}
            className="w-full bg-red-800 hover:bg-red-700 disabled:bg-gray-700 text-white py-3 rounded-lg text-sm font-medium transition"
          >
            {processing ? 'Procesando...' : 'Confirmar Pedido'}
          </button>

          {!villain && (
            <p className="text-center text-xs text-gray-500 mt-3">
              Debes <Link to="/login" className="text-red-400 hover:underline">iniciar sesión</Link> para comprar
            </p>
          )}
        </>
      )}
    </div>
  );
}
