import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VILLAIN_ACCOUNTS = [
  { username: 'minion_42', password: 'esbirro2024', hint: 'Esbirro #42 — El empleado del mes' },
  { username: 'lady_caos', password: 'chaos666', hint: 'Lady Caos — Ex-meteoróloga' },
  { username: 'prof_doom', password: 'doom1234', hint: 'Profesor Doom — Ingeniero nuclear' },
  { username: 'hacker_fantasma', password: 'ghost_in_shell', hint: 'El Fantasma Digital — Hacker misterioso' },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAccounts, setShowAccounts] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  function quickLogin(account) {
    setUsername(account.username);
    setPassword(account.password);
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="bg-[#16213e] rounded-xl border border-gray-800 p-8">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🦹</span>
          <h2 className="text-2xl font-bold text-red-400">Portal de Villanos</h2>
          <p className="text-xs text-gray-500 mt-1">Accede con tus credenciales de villano</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-red-500 focus:outline-none"
              placeholder="tu_alias_villano"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-red-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-red-800 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-medium transition"
          >
            Entrar a la Guarida
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-800">
          <button
            onClick={() => setShowAccounts(!showAccounts)}
            className="w-full text-xs text-gray-500 hover:text-gray-400 transition"
          >
            {showAccounts ? 'Ocultar' : 'Mostrar'} cuentas de prueba
          </button>

          {showAccounts && (
            <div className="mt-3 space-y-2">
              {VILLAIN_ACCOUNTS.map(acc => (
                <button
                  key={acc.username}
                  onClick={() => quickLogin(acc)}
                  className="w-full text-left bg-black/20 hover:bg-black/40 border border-gray-800 rounded-lg px-3 py-2 transition"
                >
                  <div className="text-xs text-gray-300">{acc.hint}</div>
                  <div className="text-[10px] text-gray-600 mt-0.5">
                    {acc.username} / {acc.password}
                  </div>
                </button>
              ))}
              <p className="text-[10px] text-gray-600 text-center mt-2">
                Nota: La cuenta de Dr. Maligno (admin) no está aquí.
                ¿Podrías conseguir acceso de otra forma?
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
