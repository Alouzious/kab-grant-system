export default function Sidebar({ role = 'applicant' }) {
  const menuItems = {
    applicant: [
      { label: 'Dashboard', href: '#' },
      { label: 'My Proposals', href: '#' },
      { label: 'Submit New Proposal', href: '#' },
      { label: 'Notifications', href: '#' },
    ],
    reviewer: [
      { label: 'Dashboard', href: '#' },
      { label: 'Assigned Proposals', href: '#' },
      { label: 'Submitted Reviews', href: '#' },
      { label: 'Notifications', href: '#' },
    ],
    admin: [
      { label: 'Dashboard', href: '#' },
      { label: 'Users', href: '#' },
      { label: 'Reviewers', href: '#' },
      { label: 'Grant Calls', href: '#' },
      { label: 'Submitted Proposals', href: '#' },
      { label: 'Reviewed Proposals', href: '#' },
      { label: 'Reports', href: '#' },
    ],
    super_admin: [
      { label: 'Dashboard', href: '#' },
      { label: 'Admins', href: '#' },
      { label: 'Roles', href: '#' },
      { label: 'System Settings', href: '#' },
      { label: 'Audit Logs', href: '#' },
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
          {items.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="block px-4 py-2 rounded-md text-sm hover:bg-accent hover:text-white transition"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
