import { useEffect, useState } from 'react'
import { Plus, Search, XCircle, BedDouble, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getBookings, createBooking, cancelBooking, getAvailableBeds } from '../services/bookingService'
import { getRooms } from '../services/roomService'
import { getTenants } from '../services/tenantService'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { PageSpinner } from '../components/common/Spinner'

const INITIAL_FORM = { student: '', room: '', bedNumber: '', startDate: '', notes: '' }

const statusConfig = {
  active:    { label: 'Active',    cls: 'badge-success' },
  cancelled: { label: 'Cancelled', cls: 'badge-danger' },
  completed: { label: 'Completed', cls: 'badge-info' },
}

function BookingForm({ form, setForm, onSubmit, loading, rooms, students }) {
  const [availableBeds, setAvailableBeds] = useState([])
  const [loadingBeds, setLoadingBeds] = useState(false)

  const handleRoomChange = async (roomId) => {
    setForm({ ...form, room: roomId, bedNumber: '' })
    if (!roomId) return setAvailableBeds([])
    setLoadingBeds(true)
    try {
      const { data } = await getAvailableBeds(roomId)
      setAvailableBeds(data.availableBeds)
    } catch { setAvailableBeds([]) }
    finally { setLoadingBeds(false) }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
        <select required className="input-field" value={form.student}
          onChange={(e) => setForm({ ...form, student: e.target.value })}>
          <option value="">Select student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>{s.name} — {s.phone}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room *</label>
          <select required className="input-field" value={form.room} onChange={(e) => handleRoomChange(e.target.value)}>
            <option value="">Select room</option>
            {rooms.filter((r) => r.status !== 'occupied' && r.status !== 'maintenance').map((r) => (
              <option key={r._id} value={r._id}>
                Room {r.roomNumber} ({r.type}) — {r.availableBeds ?? 0} beds free
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bed Number *</label>
          <select required className="input-field" value={form.bedNumber}
            onChange={(e) => setForm({ ...form, bedNumber: e.target.value })} disabled={!form.room || loadingBeds}>
            <option value="">{loadingBeds ? 'Loading...' : 'Select bed'}</option>
            {availableBeds.map((b) => <option key={b} value={b}>Bed {b}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
        <input required type="date" className="input-field" value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea rows={2} className="input-field resize-none" value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </form>
  )
}

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('active')
  const [showModal, setShowModal] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const fetchAll = () => {
    setLoading(true)
    Promise.all([getBookings({ status: filterStatus || undefined }), getRooms(), getTenants()])
      .then(([bRes, rRes, sRes]) => {
        setBookings(bRes.data.bookings ?? bRes.data)
        setRooms(rRes.data.rooms ?? rRes.data)
        setStudents(sRes.data.tenants ?? sRes.data)
      })
      .catch(() => { setBookings([]); setRooms([]); setStudents([]) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [filterStatus])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await createBooking({ ...form, bedNumber: Number(form.bedNumber) })
      toast.success('Room booked successfully')
      setShowModal(false); setForm(INITIAL_FORM); fetchAll()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Booking failed') }
    finally { setSaving(false) }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await cancelBooking(cancelTarget._id)
      toast.success('Booking cancelled')
      setCancelTarget(null); fetchAll()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Failed') }
    finally { setCancelling(false) }
  }

  const filtered = bookings.filter((b) =>
    b.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.room?.roomNumber?.includes(search)
  )

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex gap-3">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-9" placeholder="Search bookings..." value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-auto" value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setForm(INITIAL_FORM); setShowModal(true) }}>
          <Plus size={16} /> New Booking
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <BedDouble size={48} className="mb-3 opacity-40" />
          <p className="font-medium">No bookings found</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Student', 'Room', 'Bed', 'Start Date', 'Status', 'Notes', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const sc = statusConfig[b.status] ?? statusConfig.active
                  return (
                    <tr key={b._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium">{b.student?.name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{b.student?.phone}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="badge-info">Room {b.room?.roomNumber}</span>
                        <p className="text-xs text-gray-400 mt-0.5">{b.room?.type}</p>
                      </td>
                      <td className="px-5 py-3 font-medium">Bed {b.bedNumber}</td>
                      <td className="px-5 py-3 text-gray-500">
                        {b.startDate ? new Date(b.startDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3"><span className={sc.cls}>{sc.label}</span></td>
                      <td className="px-5 py-3 text-gray-400 text-xs max-w-[140px] truncate">{b.notes || '—'}</td>
                      <td className="px-5 py-3">
                        {b.status === 'active' && (
                          <button onClick={() => setCancelTarget(b)}
                            className="flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors">
                            <XCircle size={13} /> Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Room Booking" size="md">
        <BookingForm form={form} setForm={setForm} onSubmit={handleSubmit}
          loading={saving} rooms={rooms} students={students} />
      </Modal>

      <ConfirmDialog isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel} loading={cancelling} title="Cancel Booking"
        message={`Cancel booking for ${cancelTarget?.student?.name} in Room ${cancelTarget?.room?.roomNumber} Bed ${cancelTarget?.bedNumber}?`} />
    </div>
  )
}
