import { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, Users, Phone, MapPin, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import { getTenants, createTenant, updateTenant, deleteTenant } from '../services/tenantService'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { PageSpinner } from '../components/common/Spinner'

const INITIAL_FORM = {
  name: '', email: '', phone: '', address: '', collegeName: '',
  joinDate: '', guardianName: '', guardianPhone: '', paymentStatus: 'pending',
}

const paymentBadge = {
  paid:    <span className="badge-success">Paid</span>,
  pending: <span className="badge-warning">Pending</span>,
  overdue: <span className="badge-danger">Overdue</span>,
}

function StudentForm({ form, setForm, onSubmit, loading, isEdit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input required className="input-field" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ram Sharma" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input required className="input-field" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="98XXXXXXXX" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" className="input-field" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="optional" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">College / School</label>
          <input className="input-field" value={form.collegeName}
            onChange={(e) => setForm({ ...form, collegeName: e.target.value })} placeholder="e.g. Tribhuvan University" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date *</label>
          <input required type="date" className="input-field" value={form.joinDate}
            onChange={(e) => setForm({ ...form, joinDate: e.target.value })} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Home Address</label>
          <input className="input-field" value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="District / Village" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
          <input className="input-field" value={form.guardianName}
            onChange={(e) => setForm({ ...form, guardianName: e.target.value })} placeholder="Parent / Guardian" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Phone</label>
          <input className="input-field" value={form.guardianPhone}
            onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} placeholder="98XXXXXXXX" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
          <select className="input-field" value={form.paymentStatus}
            onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (isEdit ? 'Updating...' : 'Adding...') : isEdit ? 'Update Student' : 'Add Student'}
        </button>
      </div>
    </form>
  )
}

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPayment, setFilterPayment] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchStudents = () => {
    setLoading(true)
    getTenants().then(({ data }) => setStudents(data.tenants ?? data))
      .catch(() => setStudents([])).finally(() => setLoading(false))
  }

  useEffect(() => { fetchStudents() }, [])

  const openAdd = () => { setEditStudent(null); setForm(INITIAL_FORM); setShowModal(true) }
  const openEdit = (s) => {
    setEditStudent(s)
    setForm({ name: s.name, email: s.email ?? '', phone: s.phone, address: s.address ?? '',
      collegeName: s.collegeName ?? '', joinDate: s.joinDate?.split('T')[0] ?? '',
      guardianName: s.guardianName ?? '', guardianPhone: s.guardianPhone ?? '',
      paymentStatus: s.paymentStatus ?? 'pending' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editStudent) { await updateTenant(editStudent._id, form); toast.success('Student updated') }
      else { await createTenant(form); toast.success('Student added') }
      setShowModal(false); fetchStudents()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await deleteTenant(deleteTarget._id); toast.success('Student removed'); setDeleteTarget(null); fetchStudents() }
    catch (err) { toast.error(err.response?.data?.message ?? 'Failed') }
    finally { setDeleting(false) }
  }

  const filtered = students.filter((s) => {
    const ms = s.name?.toLowerCase().includes(search.toLowerCase()) || s.phone?.includes(search)
    const mp = !filterPayment || s.paymentStatus === filterPayment
    return ms && mp
  })

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-9" placeholder="Search students..." value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-auto" value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}>
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} /> Add Student
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <Users size={48} className="mb-3 opacity-40" />
          <p className="font-medium">No students found</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Student', 'Contact', 'College', 'Room / Bed', 'Joined', 'Payment', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                          {s.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{s.name}</p>
                          {s.guardianName && <p className="text-xs text-gray-400">Guardian: {s.guardianName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                        <Phone size={12} className="text-gray-400" />{s.phone}
                      </div>
                      {s.guardianPhone && (
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-0.5">
                          <Phone size={12} />{s.guardianPhone}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {s.collegeName ? (
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <GraduationCap size={13} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[140px]">{s.collegeName}</span>
                        </div>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      {s.room ? (
                        <div>
                          <span className="badge-info">Room {s.room.roomNumber}</span>
                          {s.bedNumber && <span className="ml-1 text-xs text-gray-400">Bed {s.bedNumber}</span>}
                        </div>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {s.joinDate ? new Date(s.joinDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3">{paymentBadge[s.paymentStatus] ?? paymentBadge.pending}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(s)}
                          className="p-1.5 rounded hover:bg-primary-50 text-gray-500 hover:text-primary-600 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(s)}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editStudent ? 'Edit Student' : 'Add New Student'} size="lg">
        <StudentForm form={form} setForm={setForm} onSubmit={handleSubmit}
          loading={saving} isEdit={!!editStudent} />
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={deleting} title="Remove Student"
        message={`Remove ${deleteTarget?.name} from the hostel? This cannot be undone.`} />
    </div>
  )
}
