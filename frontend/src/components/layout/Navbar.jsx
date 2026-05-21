export default function Navbar() {
  return (
    <nav className="bg-surface border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-lg font-bold text-primary">
              KAB Fund for Innovation and Research (KAB-FIR)
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </div>
    </nav>
  );
}
