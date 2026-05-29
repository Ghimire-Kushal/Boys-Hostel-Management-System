import { useAuth } from '../../context/AuthContext'
import { formatBS } from '../../utils/nepaliDate'

export default function Header({ title }) {
  const { user } = useAuth()
  const today = new Date()
  const adDate = today.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  const bsDate = formatBS(today)

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium text-gray-700">{adDate}</p>
          <p className="text-xs text-gray-400">{bsDate} BS</p>
        </div>
        <div className="w-px h-8 bg-gray-200 hidden sm:block" />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-800 leading-none">{user?.name ?? 'Admin'}</p>
            <p className="text-xs text-gray-400 mt-0.5">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  )
}
