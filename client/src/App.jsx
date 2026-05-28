import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import MainLayout from './components/Layout/MainLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Rooms from './pages/Rooms'
import Bookings from './pages/Bookings'
import Students from './pages/Students'
import Payments from './pages/Payments'
import Food from './pages/Food'
import Feedback from './pages/Feedback'
import StudentDashboard from './pages/student/StudentDashboard'

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public — no login needed */}
        <Route path="/" element={<Landing />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/login" element={<Login />} />

        {/* Admin — pathless layout route, requires login */}
        <Route element={<AdminRoute><MainLayout /></AdminRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rooms"     element={<Rooms />} />
          <Route path="/bookings"  element={<Bookings />} />
          <Route path="/students"  element={<Students />} />
          <Route path="/payments"  element={<Payments />} />
          <Route path="/food"      element={<Food />} />
          <Route path="/feedback"  element={<Feedback />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
