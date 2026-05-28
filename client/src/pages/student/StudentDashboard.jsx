import { useEffect, useState } from 'react'
import {
  Building2, Coffee, Sun, Moon, Apple, UtensilsCrossed,
  QrCode, ScanLine, CreditCard,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getPublicWeekMenu, getPublicQRCodes } from '../../services/publicService'
import { formatBS, getDayName, getWeekDates } from '../../utils/nepaliDate'

const mealConfig = [
  { key: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'text-orange-500', bg: 'bg-orange-50' },
  { key: 'lunch',     label: 'Lunch',     icon: Sun,    color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { key: 'dinner',    label: 'Dinner',    icon: Moon,   color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { key: 'snacks',    label: 'Snacks',    icon: Apple,  color: 'text-green-500',  bg: 'bg-green-50' },
]

const walletBadge = {
  eSewa:          'bg-green-100 text-green-700',
  Khalti:         'bg-purple-100 text-purple-700',
  'IME Pay':      'bg-red-100 text-red-700',
  ConnectIPS:     'bg-blue-100 text-blue-700',
  'Bank Transfer':'bg-gray-100 text-gray-700',
  Other:          'bg-orange-100 text-orange-700',
}

const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function StudentDashboard() {
  const [menus, setMenus] = useState([])
  const [qrs, setQrs] = useState([])
  const [selectedQR, setSelectedQR] = useState(null)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPublicWeekMenu(), getPublicQRCodes()])
      .then(([mRes, qRes]) => {
        setMenus(mRes.data.menus ?? [])
        setQrs(qRes.data.qrs ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const today = new Date()
  const weekDates = getWeekDates()

  const menuMap = {}
  menus.forEach((m) => { menuMap[new Date(m.date).toDateString()] = m })

  const weekDayIndex = selectedDay === 0 ? 6 : selectedDay - 1
  const selectedDate = weekDates[weekDayIndex]
  const selectedMenu = selectedDate ? menuMap[selectedDate.toDateString()] : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">HostelEase Nepal</p>
              <p className="text-xs text-gray-500">Student Info</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-400">
              {today.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
              &nbsp;·&nbsp;{formatBS(today)} BS
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6 pb-10">

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── This Week's Food Schedule ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900">This Week's Food Schedule</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {weekDates[0] && `${formatBS(weekDates[0])} – ${formatBS(weekDates[6])} BS`}
                  </p>
                </div>
              </div>

              {/* Day picker */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-3">
                <div className="grid grid-cols-7">
                  {weekDates.map((date, idx) => {
                    const dow = date.getDay()
                    const isToday = date.toDateString() === today.toDateString()
                    const hasMenu = !!menuMap[date.toDateString()]
                    const isSelected = dow === selectedDay
                    return (
                      <button key={idx} onClick={() => setSelectedDay(dow)}
                        className={`py-3 flex flex-col items-center gap-1 transition-colors ${
                          isSelected ? 'bg-primary-600 text-white' : 'hover:bg-gray-50 text-gray-600'
                        }`}>
                        <span className={`text-xs font-medium ${isSelected ? 'text-primary-100' : 'text-gray-400'}`}>
                          {DAY_SHORT[dow]}
                        </span>
                        <span className={`text-sm font-bold ${isToday && !isSelected ? 'text-primary-600' : ''}`}>
                          {date.getDate()}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          hasMenu ? (isSelected ? 'bg-white' : 'bg-primary-400') : 'bg-transparent'
                        }`} />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Selected day */}
              {selectedDate && (
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {getDayName(selectedDate)}, {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-xs text-gray-400">{formatBS(selectedDate)} BS</p>
                  </div>
                  {isToday(selectedDate) && (
                    <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full">Today</span>
                  )}
                </div>
              )}

              {selectedMenu ? (
                <div className="space-y-2">
                  {mealConfig.map(({ key, label, icon: Icon, color, bg }) =>
                    selectedMenu[key] ? (
                      <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-start gap-3">
                        <div className={`${bg} p-2 rounded-lg shrink-0`}>
                          <Icon size={16} className={color} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">{label}</p>
                          <p className="text-sm font-medium text-gray-800">{selectedMenu[key]}</p>
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex flex-col items-center text-gray-400">
                  <UtensilsCrossed size={28} className="mb-2 opacity-40" />
                  <p className="text-sm">No menu scheduled for this day</p>
                </div>
              )}
            </div>

            {/* ── Pay Rent ── */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">Pay Rent</h2>
              <p className="text-xs text-gray-400 mb-3">Choose your preferred wallet and scan the QR code</p>

              {qrs.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex flex-col items-center text-gray-400">
                  <QrCode size={28} className="mb-2 opacity-40" />
                  <p className="text-sm">No payment options available yet</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {qrs.map((qr) => (
                      <button key={qr._id}
                        onClick={() => setSelectedQR(selectedQR?._id === qr._id ? null : qr)}
                        className={`rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all bg-white ${
                          selectedQR?._id === qr._id
                            ? 'border-primary-500 shadow-md'
                            : 'border-gray-100 hover:shadow-sm'
                        }`}>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${walletBadge[qr.wallet] ?? walletBadge.Other}`}>
                          {qr.wallet}
                        </span>
                        <img src={qr.qrImage} alt={qr.wallet} className="w-20 h-20 object-contain rounded-lg" />
                        {qr.accountName && <p className="text-xs font-medium text-gray-700">{qr.accountName}</p>}
                        {qr.accountNumber && <p className="text-xs text-gray-500">{qr.accountNumber}</p>}
                      </button>
                    ))}
                  </div>

                  {selectedQR && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${walletBadge[selectedQR.wallet] ?? walletBadge.Other}`}>
                          {selectedQR.wallet}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <ScanLine size={13} /> Scan to Pay
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        <img src={selectedQR.qrImage} alt={selectedQR.wallet}
                          className="w-52 h-52 object-contain rounded-xl border border-gray-200" />
                        {selectedQR.accountName && (
                          <p className="font-semibold text-gray-800">{selectedQR.accountName}</p>
                        )}
                        {selectedQR.accountNumber && (
                          <div className="bg-gray-50 px-4 py-2 rounded-lg text-center">
                            <p className="text-xs text-gray-400">Account / Phone</p>
                            <p className="text-lg font-bold text-gray-800 tracking-widest">{selectedQR.accountNumber}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 text-center">
                          After payment, inform the hostel admin with your transaction ID for confirmation.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Feedback link ── */}
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-center">
              <p className="text-sm text-primary-700 font-medium mb-2">Have feedback about the hostel?</p>
              <Link to="/"
                className="inline-flex items-center gap-1.5 bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Submit Feedback
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function isToday(date) {
  return date.toDateString() === new Date().toDateString()
}
