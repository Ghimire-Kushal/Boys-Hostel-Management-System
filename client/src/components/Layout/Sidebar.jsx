import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BedDouble, Users, CreditCard, LogOut,
  Building2, BookOpen, ChefHat, MessageSquare,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/rooms',     icon: BedDouble,       label: 'Rooms' },
  { to: '/bookings',  icon: BookOpen,        label: 'Bookings' },
  { to: '/students',  icon: Users,           label: 'Students' },
  { to: '/payments',  icon: CreditCard,      label: 'Payments' },
  { to: '/food',      icon: ChefHat,         label: 'Food' },
  { to: '/feedback',  icon: MessageSquare,   label: 'Feedback' },
]

export default function Sidebar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-white flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-lg shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">HostelEase Nepal</h1>
            <p className="text-gray-400 text-xs mt-0.5">Management System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              }`
            }>
            <Icon size={17} />{label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-700/50">
        <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-lg bg-gray-800">
          <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.name ?? 'Admin'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  )
}
