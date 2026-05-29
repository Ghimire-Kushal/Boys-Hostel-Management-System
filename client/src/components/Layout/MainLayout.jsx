import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/rooms':     'Room Management',
  '/bookings':  'Bookings',
  '/students':  'Students',
  '/payments':  'Payments',
  '/food':      'Food Management',
  '/feedback':  'Feedback',
}

export default function MainLayout() {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'HostelEase Nepal'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
