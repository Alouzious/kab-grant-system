import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ role = 'applicant', children }) {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={role} />
        <main className="flex-1 bg-background overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
