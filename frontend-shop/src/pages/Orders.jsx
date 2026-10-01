import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function formatPrice(price) {
  return `$${price.toLocaleString('es-MX')}`;
}

const STATUS_COLORS = {
  pending: 'text-yellow-500 bg-yellow-900/20 border-yellow-800',
  confirmed: 'text-blue-400 bg-blue-900/20 border-blue-800',
  shipped: 'text-purple-400 bg-purple-900/20 border-purple-800',
  completed: 'text-green-400 bg-green-900/20 border-green-800',
};

const PAYMENT_COLORS = {
  pending: 'text-yellow-500',
  paid: 'text-green-400',
};

export default function Orders() {
  const { villain } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [payResult, setPayResult] = useState(null);

  useEffect(() => {
    if (!villain) return navigate('/login');
    fetch('/api/orders', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setOrders(data.orders));
  }, [villain, navigate]);

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
      body: JSON.stringify({ status: 'success' }),
    });
    const data = await res.json();
    setPayResult(data);
    viewOrder(orderId);
    fetch('/api/orders', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setOrders(d.orders));
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-200 mb-6">Mis Pedidos</h2>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">📦</span>
          <p className="text-gray-500 mb-4">No tienes pedidos aún.</p>
          <Link to="/" className="text-red-400 text-sm hover:underline">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tus pedidos</h3>
            {orders.map(order => (
              <button
                key={order.id}
                onClick={() => viewOrder(order.id)}
                className={`w-full text-left bg-[#16213e] rounded-lg border p-4 transition ${
                  selectedOrder === order.id
                    ? 'border-red-700'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-200">
                    Pedido #{order.id}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || ''}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('es-MX')}
                  </span>
                  <span className="text-sm text-red-400 font-medium">
                    {formatPrice(order.total_price)}
                  </span>
                </div>
                <div className="mt-1">
                  <span className={`text-[10px] ${PAYMENT_COLORS[order.payment_status] || 'text-gray-500'}`}>
                    Pago: {order.payment_status}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div>
            {orderDetail ? (
              <div className="bg-[#16213e] rounded-lg border border-gray-800 p-4 sticky top-24">
                <h3 className="text-sm font-bold text-gray-200 mb-3">
                  Detalle del Pedido #{orderDetail.order.id}
                </h3>

                {orderDetail.hacked_message && (
                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 mb-3 text-xs text-red-300">
                    <p className="font-medium">{orderDetail.hacked_message}</p>
                    {orderDetail.flag && (
                      <p className="font-mono text-yellow-400 mt-2">{orderDetail.flag}</p>
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-3">
                  <span>Propietario: {orderDetail.order.display_name}</span>
                </div>

                {orderDetail.order.notes && (
                  <div className="bg-black/20 rounded-lg p-3 mb-3 text-xs text-gray-400">
                    <span className="text-gray-500 block mb-1">Notas:</span>
                    {orderDetail.order.notes}
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {orderDetail.items.map(item => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-6 shrink-0 rounded overflow-hidden">
                        <img
                          src={{
                            1: '/hero.jpg', 2: '/shark.jpg', 3: '/uniforms.jpg',
                            4: '/volcano.jpg', 5: '/monologue.jpg', 6: '/cat.jpg',
                            7: '/satellite.jpg', 8: '/sub.jpg', 9: '/mind_control.jpg',
                            10: '/trap.jpg'
                          }[item.product_id] || '/hero.jpg'}
                          alt={item.product_name}
                          className="w-full h-full object-cover pixelated"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                      <span className="text-gray-300 flex-1">{item.product_name}</span>
                      <span className="text-gray-500">x{item.quantity}</span>
                      <span className="text-gray-400">{formatPrice(item.unit_price)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-800 pt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="text-lg font-bold text-red-400">
                    {formatPrice(orderDetail.order.total_price)}
                  </span>
                </div>

                {orderDetail.order.payment_status === 'pending' && (
                  <button
                    onClick={() => payOrder(orderDetail.order.id)}
                    className="w-full mt-4 bg-green-800 hover:bg-green-700 text-white text-xs py-2.5 rounded-lg transition"
                  >
                    Pagar Ahora
                  </button>
                )}

                {payResult && (
                  <div className={`mt-3 rounded-lg border p-3 text-xs ${
                    payResult.flag
                      ? 'bg-red-900/20 border-red-800 text-red-300'
                      : 'bg-green-900/20 border-green-800 text-green-300'
                  }`}>
                    <p>{payResult.message}</p>
                    {payResult.flag && (
                      <p className="font-mono text-yellow-400 mt-1">{payResult.flag}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-16 text-sm">
                Selecciona un pedido para ver detalles
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
