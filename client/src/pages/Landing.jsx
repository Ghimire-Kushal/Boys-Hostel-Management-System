import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, Star, Send, ShieldCheck,
  UtensilsCrossed, CreditCard, Wifi, Phone, MapPin, Clock,
  Coffee, Sun, Moon, Apple, QrCode, ScanLine, MessageSquare,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { submitFeedback } from '../services/feedbackService'
import { getPublicWeekMenu, getPublicQRCodes } from '../services/publicService'
import { formatBS, getDayName, getWeekDates } from '../utils/nepaliDate'

const CATEGORIES = ['General', 'Food', 'Room', 'Staff', 'Facilities', 'Payment']
const INITIAL_FORM = { name: '', isAnonymous: false, category: 'General', message: '', rating: 0 }
const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

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

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button"
          onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}>
          <Star size={22} className={(hovered || value) >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
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

  const foodRef = useRef(null)
  const payRef = useRef(null)
  const feedbackRef = useRef(null)

  useEffect(() => {
    getPublicWeekMenu().then((r) => setMenus(r.data.menus ?? [])).catch(() => {})
    getPublicQRCodes().then((r) => setQrs(r.data.qrs ?? [])).catch(() => {})
  }, [])

  const scrollTo = (ref, section) => {
    setActiveSection(section)
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
      toast.success('Thank you for your feedback!')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top header ── */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-none">HostelEase Nepal</h1>
              <p className="text-xs text-gray-500">Boys Hostel Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-400 hidden sm:block">
              {today.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
              &nbsp;·&nbsp;{formatBS(today)} BS
            </p>
            <Link to="/login"
              className="flex items-center gap-1.5 bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
              <ShieldCheck size={14} /> Login
            </Link>
          </div>
        </div>

        {/* ── Section nav bar ── */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-4xl mx-auto px-4 flex">
            {[
              { id: 'food',     label: 'Food Schedule', icon: UtensilsCrossed, ref: foodRef },
              { id: 'payment',  label: 'Pay Rent',      icon: QrCode,          ref: payRef },
              { id: 'feedback', label: 'Feedback',      icon: MessageSquare,   ref: feedbackRef },
            ].map(({ id, label, icon: Icon, ref }) => (
              <button key={id} onClick={() => scrollTo(ref, id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}>
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-10 pb-16">

        {/* ── Food Schedule ── */}
        <section ref={foodRef}>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">This Week's Food Schedule</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {weekDates[0] && `${formatBS(weekDates[0])} – ${formatBS(weekDates[6])} BS`}
            </p>
          </div>

          {/* Day picker */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
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

          {selectedDate && (
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-800">
                  {getDayName(selectedDate)}, {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                </p>
                <p className="text-xs text-gray-400">{formatBS(selectedDate)} BS</p>
              </div>
              {selectedDate.toDateString() === today.toDateString() && (
                <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full">Today</span>
              )}
            </div>
          )}

          {selectedMenu ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {mealConfig.map(({ key, label, icon: Icon, color, bg }) =>
                selectedMenu[key] ? (
                  <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
                    <div className={`${bg} p-2.5 rounded-lg shrink-0`}>
                      <Icon size={18} className={color} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{selectedMenu[key]}</p>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center text-gray-400">
              <UtensilsCrossed size={32} className="mb-2 opacity-40" />
              <p className="font-medium">No menu scheduled for this day</p>
            </div>
          )}
        </section>

        {/* ── Pay Rent ── */}
        <section ref={payRef}>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Pay Rent</h2>
            <p className="text-sm text-gray-500 mt-0.5">Tap a wallet below to scan the QR code and pay</p>
          </div>

          {qrs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center text-gray-400">
              <QrCode size={32} className="mb-2 opacity-40" />
              <p className="font-medium">No payment options available yet</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {qrs.map((qr) => (
                  <button key={qr._id}
                    onClick={() => setSelectedQR(selectedQR?._id === qr._id ? null : qr)}
                    className={`rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all bg-white ${
                      selectedQR?._id === qr._id
                        ? 'border-primary-500 shadow-lg'
                        : 'border-gray-100 hover:shadow-sm hover:border-gray-200'
                    }`}>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${walletBadge[qr.wallet] ?? walletBadge.Other}`}>
                      {qr.wallet}
                    </span>
                    <img src={qr.qrImage} alt={qr.wallet} className="w-24 h-24 object-contain rounded-lg" />
                    {qr.accountName && <p className="text-xs font-medium text-gray-700 text-center">{qr.accountName}</p>}
                    {qr.accountNumber && <p className="text-xs text-gray-500">{qr.accountNumber}</p>}
                  </button>
                ))}
              </div>

              {selectedQR && (
                <div className="bg-white rounded-2xl border border-primary-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <span className={`font-semibold px-3 py-1 rounded-full text-sm ${walletBadge[selectedQR.wallet] ?? walletBadge.Other}`}>
                      {selectedQR.wallet}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-gray-400">
                      <ScanLine size={15} /> Scan to Pay
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <img src={selectedQR.qrImage} alt={selectedQR.wallet}
                      className="w-56 h-56 object-contain rounded-xl border border-gray-200" />
                    {selectedQR.accountName && (
                      <p className="text-lg font-bold text-gray-800">{selectedQR.accountName}</p>
                    )}
                    {selectedQR.accountNumber && (
                      <div className="bg-gray-50 px-5 py-3 rounded-xl text-center">
                        <p className="text-xs text-gray-400 mb-1">Account / Phone Number</p>
                        <p className="text-xl font-bold text-gray-800 tracking-widest">{selectedQR.accountNumber}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 text-center max-w-xs">
                      After payment, inform the hostel admin with your transaction ID for confirmation.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── Feedback ── */}
        <section ref={feedbackRef}>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Share Your Feedback</h2>
            <p className="text-sm text-gray-500 mt-0.5">Your feedback helps us improve. You can stay anonymous.</p>
          </div>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
              <div className="text-5xl mb-4">🙏</div>
              <h4 className="text-xl font-semibold text-green-800 mb-2">Thank you!</h4>
              <p className="text-green-700 text-sm mb-4">Your feedback has been submitted successfully.</p>
              <button onClick={() => setSubmitted(false)} className="text-sm text-primary-600 hover:underline">
                Submit another feedback
              </button>
            </div>
          ) : (
            <form onSubmit={handleFeedback} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              {/* Anonymous toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-800">Submit anonymously</p>
                  <p className="text-xs text-gray-500">Your name won't be shown to anyone</p>
                </div>
                <button type="button"
                  onClick={() => setForm({ ...form, isAnonymous: !form.isAnonymous, name: '' })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isAnonymous ? 'bg-primary-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isAnonymous ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {!form.isAnonymous && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input className="input-field" placeholder="e.g. Ram Shrestha"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="input-field" value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <StarRating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback *</label>
                <textarea required rows={4} className="input-field resize-none"
                  placeholder="Tell us about your experience, suggestions, or complaints..."
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>

              <button type="submit" disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                <Send size={16} />
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <Building2 size={16} className="text-white" />
            </div>
            <span className="font-semibold text-gray-700 text-sm">HostelEase Nepal</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><MapPin size={13} /> Kathmandu, Nepal</span>
            <span className="flex items-center gap-1.5"><Clock size={13} /> 6AM – 10PM daily</span>
          </div>
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} HostelEase Nepal</p>
        </div>
      </footer>
    </div>
  )
}
