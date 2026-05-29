import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BedDouble, Users, CreditCard, AlertCircle, TrendingUp,
  CheckCircle, BookOpen, MessageSquare, ChefHat, ArrowRight,
} from 'lucide-react'
import { getDashboardStats } from '../services/dashboardService'
import { PageSpinner } from '../components/common/Spinner'

const statusBadge = {
  paid:    'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
}

function StatCard({ icon: Icon, label, value, sub, color, to }) {
  const scheme = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   val: 'text-blue-700' },
    green:  { bg: 'bg-green-50',  icon: 'text-green-600',  val: 'text-green-700' },
    yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', val: 'text-yellow-700' },
    red:    { bg: 'bg-red-50',    icon: 'text-red-600',    val: 'text-red-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', val: 'text-purple-700' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', val: 'text-orange-700' },
  }[color] ?? { bg: 'bg-gray-50', icon: 'text-gray-600', val: 'text-gray-700' }

  const inner = (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`${scheme.bg} p-3 rounded-xl shrink-0`}>
        <Icon size={20} className={scheme.icon} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${scheme.val}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )

  return to ? <Link to={to}>{inner}</Link> : inner
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSpinner />

  const s = stats ?? {}
  const occupancyRate = s.totalRooms > 0 ? Math.round(((s.occupiedRooms ?? 0) / s.totalRooms) * 100) : 0

  return (
    <div className="space-y-6">

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BedDouble}     label="Total Rooms"       value={s.totalRooms ?? 0}     sub={`${s.vacantRooms ?? 0} vacant`}           color="blue"   to="/rooms" />
        <StatCard icon={Users}         label="Total Students"    value={s.totalStudents ?? 0}                                                   color="purple" to="/students" />
        <StatCard icon={BookOpen}      label="Active Bookings"   value={s.activeBookings ?? 0}                                                  color="green"  to="/bookings" />
        <StatCard icon={TrendingUp}    label="Total Revenue"     value={`Rs. ${((s.totalRevenue ?? 0) / 1000).toFixed(0)}k`} sub="all time"  color="green"  to="/payments" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BedDouble}     label="Occupied Rooms"    value={s.occupiedRooms ?? 0}   sub={`${occupancyRate}% rate`}                  color="blue"   to="/rooms" />
        <StatCard icon={CheckCircle}   label="Pending Payments"  value={s.pendingPayments ?? 0}                                                 color="yellow" to="/payments" />
        <StatCard icon={AlertCircle}   label="Overdue Payments"  value={s.overduePayments ?? 0}                                                 color="red"    to="/payments" />
        <StatCard icon={MessageSquare} label="New Feedback"      value={s.newFeedback ?? 0}     sub="unread"                                    color="orange" to="/feedback" />
      </div>

      {/* ── Recent payments + Occupancy ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent payments */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Recent Payments</h3>
            <Link to="/payments" className="text-xs text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {!s.recentPayments?.length ? (
            <div className="px-6 py-12 text-center">
              <CreditCard size={32} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No payments recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Student', 'Period', 'Amount', 'Date', 'Status'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {s.recentPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-gray-800">{p.tenantName}</td>
                      <td className="px-6 py-3.5 text-gray-500">{p.month} {p.year}</td>
                      <td className="px-6 py-3.5 font-semibold text-gray-800">Rs. {Number(p.amount).toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-gray-400 text-xs">{p.date}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[p.status] ?? statusBadge.pending}`}>
                          {p.status?.charAt(0).toUpperCase() + p.status?.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Occupancy */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Room Occupancy</h3>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Utilization</span>
              <span className="font-bold text-gray-800">{occupancyRate}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${occupancyRate}%`,
                  background: occupancyRate > 80 ? '#ef4444' : occupancyRate > 50 ? '#f59e0b' : '#22c55e',
                }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-50 rounded-lg p-2.5">
                <p className="text-lg font-bold text-green-700">{s.occupiedRooms ?? 0}</p>
                <p className="text-xs text-green-600">Occupied</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2.5">
                <p className="text-lg font-bold text-blue-700">{s.vacantRooms ?? 0}</p>
                <p className="text-xs text-blue-600">Vacant</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-lg font-bold text-gray-700">{s.totalRooms ?? 0}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
            <div className="space-y-1.5">
              {[
                { to: '/students',  icon: Users,      label: 'Add Student',   color: 'text-purple-600 bg-purple-50' },
                { to: '/payments',  icon: CreditCard, label: 'Record Payment', color: 'text-green-600 bg-green-50' },
                { to: '/food',      icon: ChefHat,    label: 'Update Menu',    color: 'text-orange-600 bg-orange-50' },
                { to: '/feedback',  icon: MessageSquare, label: 'View Feedback', color: 'text-blue-600 bg-blue-50' },
              ].map(({ to, icon: Icon, label, color }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                  <span className={`p-1.5 rounded-lg ${color}`}>
                    <Icon size={14} />
                  </span>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
                  <ArrowRight size={13} className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Alerts */}
          {(s.overduePayments > 0 || s.newFeedback > 0 || s.pendingComplaints > 0) && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-2">
              <h3 className="font-semibold text-gray-800 mb-3">Needs Attention</h3>
              {s.overduePayments > 0 && (
                <Link to="/payments" className="flex items-center gap-2 p-2.5 bg-red-50 rounded-lg text-sm text-red-700 hover:bg-red-100 transition-colors">
                  <AlertCircle size={15} />
                  {s.overduePayments} overdue payment{s.overduePayments > 1 ? 's' : ''}
                </Link>
              )}
              {s.pendingComplaints > 0 && (
                <Link to="/food" className="flex items-center gap-2 p-2.5 bg-orange-50 rounded-lg text-sm text-orange-700 hover:bg-orange-100 transition-colors">
                  <ChefHat size={15} />
                  {s.pendingComplaints} food complaint{s.pendingComplaints > 1 ? 's' : ''} pending
                </Link>
              )}
              {s.newFeedback > 0 && (
                <Link to="/feedback" className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors">
                  <MessageSquare size={15} />
                  {s.newFeedback} new feedback unread
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
