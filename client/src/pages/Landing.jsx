import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, Star, Send, ShieldCheck,
  UtensilsCrossed, QrCode, ScanLine, MessageSquare,
  Coffee, Sun, Moon, Apple,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { submitFeedback } from '../services/feedbackService'
import { getPublicWeekMenu, getPublicQRCodes } from '../services/publicService'
import { formatBS, getDayName, getWeekDates } from '../utils/nepaliDate'

const CATEGORIES = ['General', 'Food', 'Room', 'Staff', 'Facilities', 'Payment']
const INITIAL_FORM = { name: '', isAnonymous: false, category: 'General', message: '', rating: 0 }
const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const DAY_NP    = ['आइत','सोम','मंगल','बुध','बिही','शुक्र','शनि']

const mealConfig = [
  { key: 'breakfast', label: 'Breakfast', nepali: 'बिहान', icon: Coffee, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  { key: 'lunch',     label: 'Lunch',     nepali: 'दिउँसो', icon: Sun,    color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  { key: 'dinner',    label: 'Dinner',    nepali: 'बेलुका', icon: Moon,   color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  { key: 'snacks',    label: 'Snacks',    nepali: 'खाजा',  icon: Apple,  color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100' },
]

const walletColors = {
  eSewa:          { badge: 'bg-green-100 text-green-700',   border: 'border-green-200',  glow: 'hover:border-green-400' },
  Khalti:         { badge: 'bg-purple-100 text-purple-700', border: 'border-purple-200', glow: 'hover:border-purple-400' },
  'IME Pay':      { badge: 'bg-red-100 text-red-700',       border: 'border-red-200',    glow: 'hover:border-red-400' },
  ConnectIPS:     { badge: 'bg-blue-100 text-blue-700',     border: 'border-blue-200',   glow: 'hover:border-blue-400' },
  'Bank Transfer':{ badge: 'bg-gray-100 text-gray-700',     border: 'border-gray-200',   glow: 'hover:border-gray-400' },
  Other:          { badge: 'bg-orange-100 text-orange-700', border: 'border-orange-200', glow: 'hover:border-orange-400' },
}

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button"
          onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}>
          <Star size={22} className={(hovered || value) >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
        </button>
      ))}
    </div>
  )
}

export default function Landing() {
  const [activeSection, setActiveSection] = useState('food')
  const [menus, setMenus] = useState([])
  const [qrs, setQrs] = useState([])
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const [selectedQR, setSelectedQR] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const foodRef     = useRef(null)
  const payRef      = useRef(null)
  const feedbackRef = useRef(null)

  useEffect(() => {
    getPublicWeekMenu().then((r) => setMenus(r.data.menus ?? [])).catch(() => {})
    getPublicQRCodes().then((r) => setQrs(r.data.qrs ?? [])).catch(() => {})
  }, [])

  // Scroll-spy
  useEffect(() => {
    const refs = [
      { id: 'food', ref: foodRef },
      { id: 'payment', ref: payRef },
      { id: 'feedback', ref: feedbackRef },
    ]
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.dataset.section)
        })
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    refs.forEach(({ ref }) => { if (ref.current) observer.observe(ref.current) })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (ref, section) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(section)
  }

  const today = new Date()
  const weekDates = getWeekDates()
  const menuMap = {}
  menus.forEach((m) => { menuMap[new Date(m.date).toDateString()] = m })
  const weekDayIndex = selectedDay === 0 ? 6 : selectedDay - 1
  const selectedDate = weekDates[weekDayIndex]
  const selectedMenu = selectedDate ? menuMap[selectedDate.toDateString()] : null

  const handleFeedback = async (e) => {
    e.preventDefault()
    if (!form.message.trim()) return toast.error('Please write your feedback')
    setSubmitting(true)
    try {
      await submitFeedback(form)
      setSubmitted(true)
      setForm(INITIAL_FORM)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const NAV = [
    { id: 'food',     label: 'Food Schedule', nepali: 'खाना',   icon: UtensilsCrossed, ref: foodRef },
    { id: 'payment',  label: 'Pay Rent',       nepali: 'भाडा',   icon: QrCode,          ref: payRef },
    { id: 'feedback', label: 'Feedback',       nepali: 'प्रतिक्रिया', icon: MessageSquare,   ref: feedbackRef },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ─── Sticky Header ─── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-lg shrink-0">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">HostelEase Nepal</p>
              <p className="text-xs text-gray-400 mt-0.5">Boys Hostel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-gray-700">
                {today.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
              <p className="text-xs text-gray-400">{formatBS(today)} BS</p>
            </div>
            <Link to="/login"
              className="flex items-center gap-1.5 bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
              <ShieldCheck size={14} /> Admin Login
            </Link>
          </div>
        </div>

        {/* Section nav */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-0">
          {NAV.map(({ id, label, nepali, icon: Icon, ref }) => (
            <button key={id} onClick={() => scrollTo(ref, id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeSection === id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}>
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(' ')[0]}</span>
              <span className="text-xs text-gray-400 hidden md:inline">({nepali})</span>
            </button>
          ))}
        </div>
      </header>

      {/* ─── Content ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-14">

        {/* ── FOOD SCHEDULE ── */}
        <section ref={foodRef} data-section="food">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">This Week's Food Schedule</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {weekDates[0] ? `${formatBS(weekDates[0])} – ${formatBS(weekDates[6])} BS` : ''}
              </p>
            </div>
            <span className="text-xs bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full font-medium border border-primary-100">
              {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Day picker */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-5">
            <div className="grid grid-cols-7">
              {weekDates.map((date, idx) => {
                const dow = date.getDay()
                const isToday = date.toDateString() === today.toDateString()
                const hasMenu = !!menuMap[date.toDateString()]
                const isSelected = dow === selectedDay
                return (
                  <button key={idx} onClick={() => setSelectedDay(dow)}
                    className={`py-3.5 flex flex-col items-center gap-1.5 transition-all ${
                      isSelected ? 'bg-primary-600' : 'hover:bg-gray-50'
                    }`}>
                    <span className={`text-xs font-semibold ${isSelected ? 'text-primary-200' : 'text-gray-400'}`}>
                      <span className="hidden sm:inline">{DAY_SHORT[dow]}</span>
                      <span className="sm:hidden">{DAY_NP[dow]}</span>
                    </span>
                    <span className={`text-base font-bold leading-none ${
                      isSelected ? 'text-white' : isToday ? 'text-primary-600' : 'text-gray-800'
                    }`}>
                      {date.getDate()}
                    </span>
                    {isToday && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    )}
                    {isSelected && hasMenu && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                    )}
                    {!isSelected && !isToday && hasMenu && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    )}
                    {!hasMenu && !isToday && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected day info */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-900">
                {selectedDate ? getDayName(selectedDate) : ''}
                {selectedDate ? `, ${selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}` : ''}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {selectedDate ? `${formatBS(selectedDate)} BS` : ''}
              </p>
            </div>
            {selectedDate?.toDateString() === today.toDateString() && (
              <span className="text-xs font-semibold bg-primary-600 text-white px-3 py-1 rounded-full">Today</span>
            )}
          </div>

          {/* Meal cards */}
          {selectedMenu ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mealConfig.map(({ key, label, nepali, icon: Icon, color, bg, border }) =>
                selectedMenu[key] ? (
                  <div key={key} className={`bg-white rounded-xl border ${border} p-4 flex items-start gap-3 shadow-sm`}>
                    <div className={`${bg} p-2.5 rounded-xl shrink-0`}>
                      <Icon size={18} className={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                        <span className="text-xs text-gray-300">{nepali}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 leading-relaxed">{selectedMenu[key]}</p>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center text-gray-400">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <UtensilsCrossed size={32} className="opacity-40" />
              </div>
              <p className="font-medium">No menu scheduled for this day</p>
              <p className="text-sm mt-1">Check back later or try another day</p>
            </div>
          )}
        </section>

        {/* ── PAY RENT ── */}
        <section ref={payRef} data-section="payment">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900">Pay Rent</h2>
            <p className="text-sm text-gray-400 mt-0.5">Tap a wallet to expand the QR code and scan to pay</p>
          </div>

          {qrs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center text-gray-400">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <QrCode size={32} className="opacity-40" />
              </div>
              <p className="font-medium">No payment options available yet</p>
              <p className="text-sm mt-1">Contact the hostel admin</p>
            </div>
          ) : (
            <>
              <div className={`grid gap-4 mb-4 ${qrs.length === 1 ? 'grid-cols-1 max-w-xs' : qrs.length === 2 ? 'grid-cols-2 max-w-sm' : 'grid-cols-2 sm:grid-cols-3'}`}>
                {qrs.map((qr) => {
                  const wc = walletColors[qr.wallet] ?? walletColors.Other
                  return (
                    <button key={qr._id}
                      onClick={() => setSelectedQR(selectedQR?._id === qr._id ? null : qr)}
                      className={`rounded-xl border-2 bg-white p-4 flex flex-col items-center gap-2.5 transition-all ${
                        selectedQR?._id === qr._id
                          ? 'border-primary-500 shadow-lg shadow-primary-100'
                          : `${wc.border} ${wc.glow} hover:shadow-md`
                      }`}>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${wc.badge}`}>{qr.wallet}</span>
                      <img src={qr.qrImage} alt={qr.wallet}
                        className="w-24 h-24 object-contain rounded-lg border border-gray-100" />
                      {qr.accountName && <p className="text-xs font-semibold text-gray-700 text-center leading-tight">{qr.accountName}</p>}
                      {qr.accountNumber && <p className="text-xs text-gray-400 font-mono">{qr.accountNumber}</p>}
                      <span className="text-xs text-primary-500 font-medium">
                        {selectedQR?._id === qr._id ? '▲ Close' : '▼ Scan QR'}
                      </span>
                    </button>
                  )
                })}
              </div>

              {selectedQR && (
                <div className="bg-white rounded-2xl border-2 border-primary-200 shadow-lg shadow-primary-50 p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className={`font-bold px-3 py-1 rounded-full text-sm ${(walletColors[selectedQR.wallet] ?? walletColors.Other).badge}`}>
                        {selectedQR.wallet}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                      <ScanLine size={14} /> Scan to Pay
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <img src={selectedQR.qrImage} alt={selectedQR.wallet}
                      className="w-52 h-52 object-contain rounded-2xl border-2 border-gray-100 p-2" />
                    <div className="flex-1 space-y-4 text-center sm:text-left">
                      {selectedQR.accountName && (
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Account Name</p>
                          <p className="text-xl font-bold text-gray-900">{selectedQR.accountName}</p>
                        </div>
                      )}
                      {selectedQR.accountNumber && (
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Account / Phone</p>
                          <p className="text-2xl font-bold text-primary-600 tracking-widest font-mono">{selectedQR.accountNumber}</p>
                        </div>
                      )}
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <p className="text-xs text-amber-700 font-medium">
                          📌 After payment, show your transaction ID to the hostel admin for confirmation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── FEEDBACK ── */}
        <section ref={feedbackRef} data-section="feedback">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900">Share Your Feedback</h2>
            <p className="text-sm text-gray-400 mt-0.5">Your opinion helps us improve. You can stay anonymous.</p>
          </div>

          {submitted ? (
            <div className="bg-white border border-green-200 rounded-2xl p-12 text-center shadow-sm">
              <div className="text-5xl mb-4">🙏</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h4>
              <p className="text-gray-500 mb-5">Your feedback has been received.</p>
              <button onClick={() => setSubmitted(false)}
                className="text-sm text-primary-600 hover:underline font-medium">
                Submit another feedback
              </button>
            </div>
          ) : (
            <form onSubmit={handleFeedback} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">

              {/* Anonymous toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Submit anonymously</p>
                  <p className="text-xs text-gray-400 mt-0.5">Your name won't be shared with anyone</p>
                </div>
                <button type="button"
                  onClick={() => setForm({ ...form, isAnonymous: !form.isAnonymous, name: '' })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.isAnonymous ? 'bg-primary-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.isAnonymous ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {!form.isAnonymous && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your Name <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input className="input-field" placeholder="e.g. Ram Shrestha"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select className="input-field" value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating</label>
                  <StarRating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Feedback *</label>
                <textarea required rows={4} className="input-field resize-none"
                  placeholder="Share your experience, suggestions, or concerns about food, rooms, staff, or facilities..."
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>

              <button type="submit" disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
                <Send size={16} />
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-5 mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <div className="bg-primary-600 p-1 rounded-md"><Building2 size={14} className="text-white" /></div>
            HostelEase Nepal
          </div>
          <p className="text-xs text-gray-400">Kathmandu, Nepal &nbsp;·&nbsp; 6AM – 10PM daily</p>
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} HostelEase Nepal</p>
        </div>
      </footer>
    </div>
  )
}
