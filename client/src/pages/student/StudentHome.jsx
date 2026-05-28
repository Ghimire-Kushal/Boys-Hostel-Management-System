import { useAuth } from '../../context/AuthContext'
import { GraduationCap, BedDouble, Phone, Users, Calendar, BookOpen } from 'lucide-react'
import { formatBS } from '../../utils/nepaliDate'

const paymentBadge = {
  paid:    { cls: 'bg-green-100 text-green-700',  label: 'Payment Up to Date' },
  pending: { cls: 'bg-yellow-100 text-yellow-700', label: 'Payment Pending' },
  overdue: { cls: 'bg-red-100 text-red-700',       label: 'Payment Overdue' },
}

export default function StudentHome() {
  const { user } = useAuth()
  const badge = paymentBadge[user?.paymentStatus] ?? paymentBadge.pending
  const today = new Date()

  return (
    <div className="space-y-4">
      {/* Welcome card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl p-6 text-white">
        <p className="text-primary-100 text-sm mb-1">Welcome back,</p>
        <h2 className="text-2xl font-bold mb-3">{user?.name}</h2>
        <div className="flex flex-wrap gap-3">
          {user?.room?.roomNumber && (
            <div className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5">
              <BedDouble size={14} />
              Room {user.room.roomNumber}
              {user.bedNumber && ` • Bed ${user.bedNumber}`}
            </div>
          )}
          <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${badge.cls}`}>
            {badge.label}
          </div>
        </div>
      </div>

      {/* Today's date */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary-50 p-2 rounded-lg">
            <Calendar size={20} className="text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Today</p>
            <p className="text-sm font-semibold text-gray-800">
              {today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Nepali Date (BS)</p>
          <p className="text-sm font-medium text-gray-700">{formatBS(today)}</p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3">
        {user?.phone && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone size={14} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">Phone</span>
            </div>
            <p className="text-sm font-medium text-gray-800">{user.phone}</p>
          </div>
        )}
        {user?.collegeName && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">College</span>
            </div>
            <p className="text-sm font-medium text-gray-800 leading-snug">{user.collegeName}</p>
          </div>
        )}
        {user?.joinDate && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">Join Date</span>
            </div>
            <p className="text-sm font-medium text-gray-800">
              {new Date(user.joinDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{formatBS(user.joinDate)} BS</p>
          </div>
        )}
        {(user?.guardianName || user?.guardianPhone) && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">Guardian</span>
            </div>
            {user.guardianName && <p className="text-sm font-medium text-gray-800">{user.guardianName}</p>}
            {user.guardianPhone && <p className="text-xs text-gray-500 mt-0.5">{user.guardianPhone}</p>}
          </div>
        )}
      </div>

      {user?.room && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap size={16} className="text-primary-500" />
            <span className="text-sm font-semibold text-gray-800">Room Details</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-primary-600">{user.room.roomNumber}</p>
              <p className="text-xs text-gray-500">Room No.</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{user.room.type ?? '—'}</p>
              <p className="text-xs text-gray-500">Type</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">
                {user.room.rent ? `Rs.${Number(user.room.rent).toLocaleString()}` : '—'}
              </p>
              <p className="text-xs text-gray-500">Monthly Rent</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
