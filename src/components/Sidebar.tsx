import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, Layers, BarChart3, Activity, ShieldCheck, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/claims', label: 'Claims', icon: FileText },
  { to: '/claims/new', label: 'New Claim', icon: PlusCircle },
  { to: '/batch', label: 'Batch Intelligence', icon: Layers },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/activity', label: 'AI Activity', icon: Activity },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useApp();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-gray-900/50 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-gray-900">ClaimPulse</span>
              <span className="ml-1 text-base font-bold text-blue-600">AI</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              AI-assisted decision
            </div>
            <p className="mt-1 text-xs text-gray-500">Human approval required for all claims.</p>
          </div>
          {user && (
            <div className="mt-3 flex items-center gap-2 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-gray-900">{user.name}</p>
                <p className="truncate text-xs text-gray-400">{user.role}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
