import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { key: '', label: '[ SYS.ALL ]' },
  { key: 'armas', label: '[ W3AP0NS ]' },
  { key: 'mascotas', label: '[ B3ASTS ]' },
  { key: 'guaridas', label: '[ L41RS ]' },
  { key: 'tecnología', label: '[ T3CH ]' },
  { key: 'uniformes', label: '[ G3AR ]' },
  { key: 'accesorios', label: '[ M1SC ]' },
  { key: 'vehículos', label: '[ R1D3S ]' },
  { key: 'seguridad', label: '[ S3CUR1TY ]' },
];

function formatPrice(price) {
  if (price >= 1_000_000_000) return `$${(price / 1_000_000_000).toFixed(0)}B`;
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(0)}M`;
  if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`;
  return `$${price}`;
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
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-red-500 mb-2">
          Catálogo de Suministros Villanos
        </h2>
        <p className="text-gray-500">
          Todo lo que necesitas para tu plan de dominación mundial. Envío discreto en helicóptero negro.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`px-4 py-1.5 font-mono text-xs tracking-wider border transition-all ${
              category === cat.key
                ? 'bg-cyan-900/30 text-cyan-300 border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                : 'bg-black/50 text-gray-500 border-gray-800 hover:text-cyan-400 hover:border-cyan-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-20">Cargando arsenal...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group bg-[#16213e] rounded-xl border border-gray-800 hover:border-red-900/50 transition overflow-hidden"
            >
              <div className="h-40 bg-gradient-to-br from-gray-900 to-[#1a1a2e] flex items-center justify-center text-6xl group-hover:scale-110 transition duration-300 overflow-hidden">
                <img
                  src={{
                    1: '/hero.jpg', 2: '/shark.jpg', 3: '/uniforms.jpg',
                    4: '/volcano.jpg', 5: '/monologue.jpg', 6: '/cat.jpg',
                    7: '/satellite.jpg', 8: '/sub.jpg', 9: '/mind_control.jpg',
                    10: '/trap.jpg'
                  }[product.id] || '/hero.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-300 pixelated"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-gray-200 group-hover:text-red-400 transition leading-tight">
                    {product.name}
                  </h3>
                  {product.featured === 1 && (
                    <span className="shrink-0 text-[10px] bg-yellow-900/30 text-yellow-500 border border-yellow-800/50 px-1.5 py-0.5 rounded-full">
                      DESTACADO
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-red-400">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
