import { useEffect, useState } from 'react'
import { BedDouble, Users, CreditCard, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react'
import { getDashboardStats } from '../services/dashboardService'
import { PageSpinner } from '../components/common/Spinner'

const MOCK_STATS = {
  totalRooms: 24,
  occupiedRooms: 18,
  vacantRooms: 6,
  totalTenants: 18,
  totalRevenue: 180000,
  pendingPayments: 5,
  overduePayments: 2,
  recentPayments: [
    { id: 1, tenantName: 'Ram Sharma', room: '101', amount: 8000, date: '2026-05-20', status: 'paid' },
    { id: 2, tenantName: 'Hari Prasad', room: '102', amount: 8500, date: '2026-05-18', status: 'paid' },
    { id: 3, tenantName: 'Sita Rai', room: '201', amount: 9000, date: '2026-05-15', status: 'pending' },
    { id: 4, tenantName: 'Binod KC', room: '203', amount: 8000, date: '2026-05-10', status: 'overdue' },
    { id: 5, tenantName: 'Nabin Thapa', room: '105', amount: 8500, date: '2026-05-22', status: 'paid' },
  ],
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="card flex items-start gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
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
  paid: <span className="badge-success">Paid</span>,
  pending: <span className="badge-warning">Pending</span>,
  overdue: <span className="badge-danger">Overdue</span>,
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => setStats(MOCK_STATS))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSpinner />

  const s = stats ?? MOCK_STATS
  const occupancyRate = Math.round((s.occupiedRooms / s.totalRooms) * 100)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          icon={BedDouble}
          label="Total Rooms"
          value={s.totalRooms}
          sub={`${s.vacantRooms} vacant`}
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          label="Occupied Rooms"
          value={s.occupiedRooms}
          sub={`${occupancyRate}% occupancy`}
          color="green"
        />
        <StatCard
          icon={Users}
          label="Total Tenants"
          value={s.totalTenants}
          color="purple"
        />
        <StatCard
          icon={TrendingUp}
          label="Monthly Revenue"
          value={`Rs. ${s.totalRevenue.toLocaleString()}`}
          color="green"
        />
        <StatCard
          icon={CreditCard}
          label="Pending Payments"
          value={s.pendingPayments}
          color="yellow"
        />
        <StatCard
          icon={AlertCircle}
          label="Overdue Payments"
          value={s.overduePayments}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Payments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Tenant</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Room</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Amount</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Date</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {s.recentPayments?.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 font-medium">{p.tenantName}</td>
                    <td className="py-3 text-gray-500">Room {p.room}</td>
                    <td className="py-3">Rs. {p.amount.toLocaleString()}</td>
                    <td className="py-3 text-gray-500">{p.date}</td>
                    <td className="py-3">{statusBadge[p.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Occupancy Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Occupied</span>
                <span className="font-medium">{occupancyRate}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${occupancyRate}%` }}
                />
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
          </div>
        </div>
      </div>
    </div>
  )
}
