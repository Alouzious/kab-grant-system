import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../api/authApi';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ChangePassword() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.new_password !== form.confirm_password) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await changePassword(form);
      setSuccess(true);
      // Clear must_change_password flag from stored user
      if (user) {
        const updated = { ...user, must_change_password: false };
        login(updated);
      }
      setTimeout(() => navigate('/reviewer/dashboard', { replace: true }), 2000);
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-bold text-textMain mb-2">Password Changed!</h2>
          <p className="text-muted text-sm">Redirecting you to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-textMain">Change Your Password</h2>
          <p className="text-muted text-sm mt-1">
            {user?.must_change_password
              ? 'You must set a new password before continuing.'
              : 'Update your account password below.'}
          </p>
        </div>

        {user?.must_change_password && (
          <div className="mb-5 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3">
            For security, you need to set a new password on first login.
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { name: 'current_password', label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(p => !p) },
              { name: 'new_password', label: 'New Password', show: showNew, toggle: () => setShowNew(p => !p) },
              { name: 'confirm_password', label: 'Confirm New Password', show: showConfirm, toggle: () => setShowConfirm(p => !p) },
            ].map(({ name, label, show, toggle }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-textMain mb-1.5">{label}</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-11 border border-border rounded-lg bg-background text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                  <button
                    type="button"
                    onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-textMain transition"
                  >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}