import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BedDouble,
  Users,
  CreditCard,
  LogOut,
  Building2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/rooms', icon: BedDouble, label: 'Rooms' },
  { to: '/tenants', icon: Users, label: 'Tenants' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
]

export default function Sidebar() {
  const { logout, user } = useAuth()

  return (
    <aside className="w-64 min-h-screen bg-primary-900 text-white flex flex-col">
      <div className="p-6 border-b border-primary-700">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-lg">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">HostelEase</h1>
            <p className="text-primary-300 text-xs">Nepal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-200 hover:bg-primary-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-700">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-semibold">
            {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name ?? 'Admin'}</p>
            <p className="text-xs text-primary-300 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-primary-200 hover:bg-primary-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
