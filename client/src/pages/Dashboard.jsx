import { useEffect, useState } from 'react'
import { BedDouble, Users, CreditCard, AlertCircle, TrendingUp, CheckCircle, BookOpen, MessageSquare } from 'lucide-react'
import { getDashboardStats } from '../services/dashboardService'
import { PageSpinner } from '../components/common/Spinner'

const MOCK = {
  totalRooms: 12, occupiedRooms: 8, vacantRooms: 4, totalStudents: 14,
  totalRevenue: 112000, pendingPayments: 3, overduePayments: 1,
  activeBookings: 14, pendingComplaints: 2,
  recentPayments: [],
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red:    'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }
  return (
    <div className="card flex items-start gap-4">
      <div className={`p-3 rounded-xl flex-shrink-0 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const statusBadge = {
  paid:    <span className="badge-success">Paid</span>,
  pending: <span className="badge-warning">Pending</span>,
  overdue: <span className="badge-danger">Overdue</span>,
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => setStats(MOCK))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSpinner />
  const s = stats ?? MOCK
  const occupancyRate = s.totalRooms > 0 ? Math.round((s.occupiedRooms / s.totalRooms) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BedDouble}      label="Total Rooms"       value={s.totalRooms}     sub={`${s.vacantRooms} vacant`}         color="blue" />
        <StatCard icon={Users}          label="Total Students"    value={s.totalStudents}                                            color="purple" />
        <StatCard icon={BookOpen}       label="Active Bookings"   value={s.activeBookings}                                           color="green" />
        <StatCard icon={TrendingUp}     label="Total Revenue"     value={`Rs. ${(s.totalRevenue ?? 0).toLocaleString()}`}            color="green" />
        <StatCard icon={CheckCircle}    label="Pending Payments"  value={s.pendingPayments} color="yellow" />
        <StatCard icon={AlertCircle}    label="Overdue Payments"  value={s.overduePayments} color="red" />
        <StatCard icon={MessageSquare}  label="Food Complaints"   value={s.pendingComplaints} sub="pending"                         color="orange" />
        <StatCard icon={BedDouble}      label="Occupied Rooms"    value={s.occupiedRooms}   sub={`${occupancyRate}% occupancy`}     color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Payments</h3>
          {!s.recentPayments?.length ? (
            <p className="text-gray-400 text-sm text-center py-6">No payments recorded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Student', 'Room', 'Amount', 'Date', 'Status'].map((h) => (
                      <th key={h} className="text-left py-2 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.recentPayments.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 font-medium">{p.tenantName ?? '—'}</td>
                      <td className="py-3 text-gray-500">{p.room ? `Room ${p.room}` : '—'}</td>
                      <td className="py-3">Rs. {Number(p.amount).toLocaleString()}</td>
                      <td className="py-3 text-gray-500">{p.date}</td>
                      <td className="py-3">{statusBadge[p.status]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Occupancy</h3>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Occupied</span>
              <span className="font-medium">{occupancyRate}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${occupancyRate}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{s.occupiedRooms}</p>
              <p className="text-xs text-green-600 mt-0.5">Occupied</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{s.vacantRooms}</p>
              <p className="text-xs text-blue-600 mt-0.5">Vacant</p>
            </div>
          </div>
          {s.pendingComplaints > 0 && (
            <div className="mt-4 bg-orange-50 border border-orange-100 rounded-lg p-3 text-sm text-orange-700">
              <span className="font-medium">{s.pendingComplaints}</span> food complaint{s.pendingComplaints > 1 ? 's' : ''} pending response
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
