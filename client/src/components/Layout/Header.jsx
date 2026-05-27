import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Header({ title }) {
  const { user } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.name ?? 'Admin'}</span>
        </div>
      </div>
    </header>
  )
}
