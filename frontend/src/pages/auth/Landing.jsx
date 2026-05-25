import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGrantCalls } from '../../api/authApi';
import {
  Megaphone,
  CalendarDays,
  ArrowRight,
  ChevronRight,
  Clock,
} from 'lucide-react';

const announcements = [
  {
    id: 1,
    title: 'KAB-FIR Portal Now Live',
    body: 'The Kabale University Fund for Innovation and Research portal is now open for proposal submissions. All eligible staff are encouraged to apply.',
    date: '2026-05-01',
    type: 'info',
  },
  {
    id: 2,
    title: 'Submission Deadline Reminder',
    body: 'The deadline for Innovation Grant 2026 proposals is 31 December 2026. Ensure all required documents are uploaded before submission.',
    date: '2026-05-10',
    type: 'warning',
  },
  {
    id: 3,
    title: 'Research Ethics Training',
    body: 'Mandatory research ethics training scheduled for 15 June 2026. All principal investigators must attend before submitting proposals.',
    date: '2026-05-12',
    type: 'info',
  },
];

export default function Landing() {
  const { isAuthenticated, user, redirectPathForRole } = useAuth();
  const [grantCalls, setGrantCalls] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(true);

  useEffect(() => {
    getGrantCalls()
      .then((data) => setGrantCalls(data.filter((c) => c.is_active)))
      .catch(() => setGrantCalls([]))
      .finally(() => setLoadingCalls(false));
  }, []);

  const daysLeft = (deadline) => {
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff} days left` : 'Deadline passed';
  };

  return (
    <div className="min-h-screen bg-background text-textMain font-sans">
      {/* ── Top Nav ── */}
      <header className="bg-surface border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/log1.jpg" alt="KAB-FIR Logo" className="h-12 w-auto rounded-lg" />
            <div>
              <span className="text-primary font-bold text-lg tracking-tight">KAB-FIR</span>
              <span className="block text-xs text-muted">
                Fund for Innovation & Research
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={redirectPathForRole(user.role)}
                className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-textMain hover:text-primary transition px-4 py-2 rounded-lg border border-border hover:border-primary"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-secondary text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            Kabale University <br />
            <span className="text-accent">Fund for Innovation</span> & Research
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            Supporting research excellence and innovation at Kabale University. Submit your
            proposals, track progress, and receive funding all in one place.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition text-base"
              >
                Create Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition text-base"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Main content: Grant Calls + Announcements ── */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Grant Calls — takes 2 cols */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-textMain">Active Grant Calls</h2>
          </div>

          {loadingCalls ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-surface rounded-xl animate-pulse" />
              ))}
            </div>
          ) : grantCalls.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center text-muted">
              No active grant calls at the moment. Check back soon.
            </div>
          ) : (
            <div className="space-y-4">
              {grantCalls.map((call) => (
                <div
                  key={call.id}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-textMain text-lg mb-1">{call.title}</h3>
                      <p className="text-muted text-sm leading-relaxed mb-4">{call.description}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1 text-warning font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          Deadline: {call.deadline}
                        </span>
                        <span className="text-muted">Academic Year: {call.academic_year}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block bg-success/10 text-success text-xs font-semibold px-3 py-1 rounded-full mb-3">
                        {daysLeft(call.deadline)}
                      </span>
                      {!isAuthenticated && (
                        <div>
                          <Link
                            to="/register"
                            className="flex items-center gap-1 text-primary text-xs font-medium hover:underline"
                          >
                            Apply Now <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Announcements — 1 col */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Megaphone className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-textMain">Announcements</h2>
          </div>
          <div className="space-y-4">
            {announcements.map((a) => (
              <div
                key={a.id}
                className={`bg-surface border rounded-xl p-4 ${
                  a.type === 'warning' ? 'border-warning/40' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {a.type === 'warning' ? (
                    <span className="w-2 h-2 rounded-full bg-warning shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                  <p className="font-semibold text-sm text-textMain">{a.title}</p>
                </div>
                <p className="text-xs text-muted leading-relaxed mb-2">{a.body}</p>
                <p className="text-xs text-muted/60">{a.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-surface mt-8 py-6 px-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} Kabale University Directorate of Research & Publications. All rights reserved.
      </footer>
    </div>
  );
}