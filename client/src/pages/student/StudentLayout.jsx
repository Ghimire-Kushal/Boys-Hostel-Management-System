import { Outlet, useNavigate } from 'react-router-dom'
import { Building2, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function StudentLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">HostelEase Nepal</p>
              <p className="text-xs text-gray-500">Student Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800 leading-none">{user?.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {user?.room?.roomNumber ? `Room ${user.room.roomNumber}` : 'No room assigned'}
              </p>
            </div>
            <button onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5">
        <Outlet />
      </main>
    </div>
  )
}
