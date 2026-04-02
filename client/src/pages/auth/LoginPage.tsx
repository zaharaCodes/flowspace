import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (e: string) => { setEmail(e); setPassword('password123'); };

  const quickUsers = [
  { label: 'Fathima Zahra', email: 'fathima@flowspace.com', role: 'Admin · Full access', color: 'text-red-600 bg-red-50 border-red-200' },
  { label: 'Zahara Sheikh', email: 'zahara@flowspace.com', role: 'Admin · Full access', color: 'text-red-600 bg-red-50 border-red-200' },
  { label: 'Arjun Sharma', email: 'arjun@flowspace.com', role: 'Project Manager', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { label: 'Priya Nair', email: 'priya@flowspace.com', role: 'Project Manager', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { label: 'Ravi Kumar', email: 'ravi@flowspace.com', role: 'Developer', color: 'text-green-600 bg-green-50 border-green-200' },
  { label: 'Aisha Patel', email: 'aisha@flowspace.com', role: 'Developer', color: 'text-green-600 bg-green-50 border-green-200' },
];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">Flowspace</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight">
            Your team's<br />command center.
          </h2>
          <p className="text-blue-200 mt-4 text-lg leading-relaxed">
            Real-time project tracking, role-based access, and live activity feeds — all in one place.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { label: 'Live updates', desc: 'WebSocket powered' },
              { label: 'Role based', desc: 'Secure by design' },
              { label: 'Activity feed', desc: 'Full audit trail' },
              { label: 'Smart alerts', desc: 'Never miss a beat' },
            ].map((f) => (
              <div key={f.label} className="bg-white bg-opacity-10 rounded-xl p-4">
                <p className="text-white font-semibold text-sm">{f.label}</p>
                <p className="text-blue-200 text-xs mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-sm">© 2026 Flowspace. Built for agencies.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">Flowspace</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your workspace</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-xl transition-all text-sm shadow-sm hover:shadow"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8">
            <p className="text-xs text-gray-400 text-center mb-3">Quick access — all passwords: <span className="font-mono font-semibold">password123</span></p>
            <div className="space-y-2">
              {quickUsers.map((u) => (
                <button
                  key={u.email}
                  onClick={() => quickLogin(u.email)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all hover:shadow-sm ${u.color}`}
                >
                  <div>
                    <p className="text-sm font-semibold">{u.label}</p>
                    <p className="text-xs opacity-70">{u.role}</p>
                  </div>
                  <span className="text-xs font-mono opacity-60">{u.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}