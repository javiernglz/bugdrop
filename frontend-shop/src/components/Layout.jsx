import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Layout({ children }) {
  const { villain, logout } = useAuth();
  const { count } = useCart();
  const location = useLocation();

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`hover:text-red-400 transition ${location.pathname === to ? 'text-red-400' : 'text-gray-400'}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-gray-200 flex flex-col">
      <header className="bg-black/90 backdrop-blur-md border-b-2 border-pink-600/50 px-6 py-4 sticky top-0 z-50 shadow-[0_0_15px_rgba(219,39,119,0.3)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="cyan" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"><path d="M9 4.26v1.39M15 4.26v1.39"/><path d="M5.5 12.08c-.7-.37-1.12-1.02-1.12-1.74V9.2c0-2.32 3.4-4.2 7.62-4.2s7.62 1.88 7.62 4.2v1.14c0 .72-.42 1.37-1.12 1.74"/><path d="M12 16v.01"/><path d="M8 19h8"/><path d="M9 19v-3"/><path d="M15 19v-3"/><path d="M12 19v-3"/><path d="M9 22h6"/><path d="M10 22v-3"/><path d="M14 22v-3"/></svg>
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 tracking-wider uppercase drop-shadow-md">
                VILLAIN SUPPLY CO.
              </h1>
              <p className="text-[10px] text-cyan-500/80 uppercase tracking-widest font-mono">
                Dominación mundial desde 1984
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            {navLink('/', 'Catálogo')}
            {villain && navLink('/orders', 'Mis Pedidos')}
            <Link
              to="/cart"
              className={`relative hover:text-red-400 transition ${location.pathname === '/cart' ? 'text-red-400' : 'text-gray-400'}`}
            >
              Carrito
              {count > 0 && (
                <span className="absolute -top-2 -right-4 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            {villain ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {villain.display_name}
                  {villain.role === 'admin' && (
                    <span className="ml-1 text-yellow-500">[Jefe]</span>
                  )}
                </span>
                <button
                  onClick={logout}
                  className="text-xs text-gray-500 hover:text-red-400 transition"
                >
                  Salir
                </button>
              </div>
            ) : (
              navLink('/login', 'Iniciar Sesión')
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="text-center text-xs text-gray-600 py-6 border-t border-gray-800/50">
        <p>Villain Supply Co. &copy; 2024 — "El mal nunca duerme, pero sí hace envíos gratis"</p>
        <p className="mt-1 text-gray-700">
          [Entorno CTF educativo — Todas las vulnerabilidades son intencionales]
        </p>
      </footer>
    </div>
  );
}
