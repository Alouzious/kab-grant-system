import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  getGrantCalls,
  createGrantCall,
  toggleGrantCall,
  deleteGrantCall,
} from '../../api/authApi';
import {
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function GrantCalls() {
  const { user } = useAuth();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    academic_year: new Date().getFullYear(),
  });

  const fetchCalls = () => {
    setLoading(true);
    getGrantCalls()
      .then(setCalls)
      .catch(() => setError('Failed to load grant calls.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCalls(); }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.deadline) {
      setError('Title and deadline are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createGrantCall(form);
      setForm({ title: '', description: '', deadline: '', academic_year: new Date().getFullYear() });
      setShowForm(false);
      fetchCalls();
      showSuccess('Grant call created successfully.');
    } catch (err) {
      setError(err.message || 'Failed to create grant call.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleGrantCall(id);
      fetchCalls();
    } catch {
      setError('Failed to toggle grant call status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this grant call?')) return;
    try {
      await deleteGrantCall(id);
      fetchCalls();
      showSuccess('Grant call deleted.');
    } catch {
      setError('Failed to delete grant call.');
    }
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-textMain">Grant Calls</h1>
            <p className="text-muted text-sm mt-1">
              Create and manage open calls for research proposals.
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            New Grant Call
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 bg-success/10 border border-success/30 text-success text-sm rounded-lg px-4 py-3">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="mb-6 bg-surface border border-border rounded-xl p-6">
            <h2 className="text-base font-semibold text-textMain mb-4">Create New Grant Call</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textMain mb-1.5">
                  Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Innovation Grant 2027"
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMain mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Brief description of this grant call..."
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">
                    Deadline <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">
                    Academic Year
                  </label>
                  <input
                    type="number"
                    name="academic_year"
                    value={form.academic_year}
                    onChange={handleChange}
                    min={2020}
                    max={2050}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {submitting ? 'Creating...' : 'Create Grant Call'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-sm text-muted hover:text-textMain transition px-4 py-2.5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Grant Calls List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-surface rounded-xl animate-pulse" />
            ))}
          </div>
        ) : calls.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-10 text-center">
            <CalendarDays className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-muted text-sm">No grant calls yet. Create your first one above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {calls.map((call) => (
              <div
                key={call.id}
                className={`bg-surface border rounded-xl p-5 flex items-start justify-between gap-4 ${
                  call.is_active ? 'border-border' : 'border-border opacity-60'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-textMain">{call.title}</h3>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        call.is_active
                          ? 'bg-success/10 text-success'
                          : 'bg-muted/10 text-muted'
                      }`}
                    >
                      {call.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {call.description && (
                    <p className="text-muted text-sm leading-relaxed mb-2">{call.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
                    <span>Deadline: <strong className="text-textMain">{call.deadline}</strong></span>
                    <span>Year: <strong className="text-textMain">{call.academic_year}</strong></span>
                    <span>Created: {call.created_at?.split('T')[0] || call.created_at}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(call.id)}
                    title={call.is_active ? 'Deactivate' : 'Activate'}
                    className="p-2 rounded-lg hover:bg-primary/10 text-primary transition"
                  >
                    {call.is_active ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-muted" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(call.id)}
                    title="Delete"
                    className="p-2 rounded-lg hover:bg-danger/10 text-danger transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}