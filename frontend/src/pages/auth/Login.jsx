import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../api/authApi';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login, redirectPathForRole } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await loginUser(form);
      login(data); // saves to context + localStorage
      if (data.must_change_password) {
        navigate('/change-password', { replace: true });
      } else {
        navigate(redirectPathForRole(data.role), { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Logo */}
      <div className="bg-surface border-b border-border shadow-sm">
        <div className="max-w-md mx-auto px-6 py-6 flex items-center gap-3">
          <img src="/log1.jpg" alt="KAB-FIR Logo" className="h-14 w-14 rounded-lg" />
          <div>
            <h1 className="text-lg font-bold text-primary">KAB-FIR</h1>
            <p className="text-xs text-muted">Fund for Innovation & Research</p>
          </div>
        </div>
      </div>

      {/* Login Form - Centered */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-textMain">Welcome back</h2>
            <p className="text-muted text-sm mt-2">Sign in to your KAB-FIR account</p>
          </div>

          {/* Demo credentials hint */}
          <div className="mb-6 bg-primary/5 border border-primary/20 rounded-lg p-4 text-xs text-muted space-y-1">
            <p className="font-semibold text-primary mb-1">Demo Credentials</p>
            <p>Admin: <span className="font-mono text-xs">admin@kab.ac.ug</span> / <span className="font-mono text-xs">admin1234</span></p>
            <p>Staff: <span className="font-mono text-xs">j.omondi@kab.ac.ug</span> / <span className="font-mono text-xs">staff1234</span></p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-textMain mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@kab.ac.ug"
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textMain mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 pr-11 border border-border rounded-lg bg-surface text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-textMain transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Register here
              </Link>
            </p>
            <p className="text-sm text-muted">
              <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}