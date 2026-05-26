import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Plus, Bell, Users, CheckCircle2, BarChart3, Settings, LogIn, LogOut, User } from 'lucide-react';

const mockUsers = {
  applicant: {
    name: 'Applicant User',
    email: 'applicant@kab.ac.ug',
  },
  reviewer: {
    name: 'Reviewer User',
    email: 'reviewer@example.com',
  },
  admin: {
    name: 'DRP Administrator',
    email: 'admin@kab.ac.ug',
  },
  super_admin: {
    name: 'Super Admin',
    email: 'superadmin@kab.ac.ug',
  },
};

export default function Sidebar({ role = 'applicant' }) {
  const navigate = useNavigate();
  const user = mockUsers[role] || mockUsers.applicant;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear any stored user data
      localStorage.removeItem('user');
      navigate('/');
    }
  };
  const menuItems = {
    applicant: [
      { label: 'Dashboard', href: '/applicant/dashboard', icon: LayoutDashboard },
      { label: 'My Proposals', href: '/applicant/proposals', end: true, icon: FileText },
      { label: 'Submit New Proposal', href: '/applicant/proposals/new', icon: Plus },
      { label: 'Notifications', href: '/applicant/notifications', icon: Bell },
    ],
    reviewer: [
      { label: 'Dashboard', href: '/reviewer/dashboard', icon: LayoutDashboard },
      { label: 'Assigned Proposals', href: '/reviewer/proposals', end: true, icon: FileText },
      { label: 'Submitted Reviews', href: '/reviewer/reviews', icon: CheckCircle2 },
      { label: 'Notifications', href: '/reviewer/notifications', icon: Bell },
    ],
    admin: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Users', href: '/admin/users', end: true, icon: Users },
      { label: 'Reviewers', href: '/admin/reviewers', icon: Users },
      { label: 'Grant Calls', href: '/admin/grant-calls', icon: FileText },
      { label: 'Submitted Proposals', href: '/admin/proposals', icon: FileText },
      { label: 'Reviewed Proposals', href: '/admin/reviewed', icon: CheckCircle2 },
      { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    ],
    super_admin: [
      { label: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
      { label: 'Admins', href: '/super-admin/admins', end: true, icon: Users },
      { label: 'Roles', href: '/super-admin/roles', icon: LogIn },
      { label: 'System Settings', href: '/super-admin/settings', icon: Settings },
      { label: 'Audit Logs', href: '/super-admin/audit', icon: BarChart3 },
    ],
  };

  const items = menuItems[role] || menuItems.applicant;

  return (
    <aside className="w-64 bg-secondary text-white min-h-full overflow-y-auto flex-shrink-0 flex flex-col">
      <div className="p-6 flex-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-accent mb-6">
          {role}
        </h2>
        <nav className="space-y-2">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-md text-sm transition ${
                    isActive
                      ? 'bg-accent text-white font-medium'
                      : 'hover:bg-accent hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile Section at Bottom */}
      <div className="p-6 border-t border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-white/70 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-md text-sm bg-white/10 hover:bg-white/20 transition text-white"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
