import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Plus, Bell, Users, CheckCircle2, BarChart3, Settings, LogIn } from 'lucide-react';

export default function Sidebar({ role = 'applicant' }) {
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
    <aside className="w-64 bg-secondary text-white min-h-screen">
      <div className="p-6">
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
    </aside>
  );
}
