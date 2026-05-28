import { useEffect, useState } from 'react'
import { UtensilsCrossed, Coffee, Sun, Moon, Apple, ChevronLeft, ChevronRight } from 'lucide-react'
import { getWeekMenu } from '../../services/studentService'
import { formatBS, getDayName, getWeekDates } from '../../utils/nepaliDate'

const MEAL_CONFIG = [
  { key: 'breakfast', label: 'Breakfast', icon: Coffee,  color: 'text-orange-500', bg: 'bg-orange-50' },
  { key: 'lunch',     label: 'Lunch',     icon: Sun,     color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { key: 'dinner',    label: 'Dinner',    icon: Moon,    color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { key: 'snacks',    label: 'Snacks',    icon: Apple,   color: 'text-green-500',  bg: 'bg-green-50' },
]

const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function StudentFood() {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay()) // 0=Sun

  useEffect(() => {
    getWeekMenu()
      .then((res) => setMenus(res.data.menus ?? []))
      .catch(() => setMenus([]))
      .finally(() => setLoading(false))
  }, [])

  const weekDates = getWeekDates() // Mon–Sun array

  // Map fetched menus by date string key
  const menuMap = {}
  menus.forEach((m) => {
    const key = new Date(m.date).toDateString()
    menuMap[key] = m
  })

  const today = new Date()

  // selectedDay is 0=Sun, but weekDates is Mon(1)..Sun(0)
  // weekDates index: 0=Mon,1=Tue,...,6=Sun
  // Convert selectedDay (0=Sun,1=Mon...6=Sat) to weekDates index
  const weekDayIndex = selectedDay === 0 ? 6 : selectedDay - 1
  const selectedDate = weekDates[weekDayIndex]
  const selectedMenu = selectedDate ? menuMap[selectedDate.toDateString()] : null

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">This Week's Menu</h2>
        <p className="text-sm text-gray-500">
          {weekDates[0]
            ? `${formatBS(weekDates[0])} – ${formatBS(weekDates[6])} BS`
            : ''}
        </p>
      </div>

      {/* Day selector */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
                  hasMenu
                    ? isSelected ? 'bg-white' : 'bg-primary-400'
                    : 'bg-transparent'
                }`} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day menu */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {selectedDate && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  {getDayName(selectedDate)},&nbsp;
                  {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                </p>
                <p className="text-xs text-gray-400">{formatBS(selectedDate)} BS</p>
              </div>
              {selectedDate.toDateString() === today.toDateString() && (
                <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </div>
          )}

          {selectedMenu ? (
            MEAL_CONFIG.map(({ key, label, icon: Icon, color, bg }) => (
              selectedMenu[key] ? (
                <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
                  <div className={`${bg} p-2 rounded-lg shrink-0`}>
                    <Icon size={18} className={color} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-800">{selectedMenu[key]}</p>
                  </div>
                </div>
              ) : null
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex flex-col items-center text-gray-400">
              <UtensilsCrossed size={36} className="mb-3 opacity-40" />
              <p className="font-medium text-sm">No menu scheduled</p>
              <p className="text-xs mt-1">Check back later</p>
            </div>
          )}
        </div>
      )}

      {/* Weekly overview dots legend */}
      <div className="flex items-center gap-2 text-xs text-gray-400 justify-center pt-2">
        <span className="w-2 h-2 rounded-full bg-primary-400 inline-block" />
        Menu available
        <span className="w-2 h-2 rounded-full bg-gray-200 inline-block ml-2" />
        Not scheduled
      </div>
    </div>
  )
}
