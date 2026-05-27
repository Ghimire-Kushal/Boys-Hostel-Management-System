import { useEffect, useState } from 'react'
import { Plus, Trash2, CheckCircle, Star, MessageSquare, ChefHat } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getMenus, upsertMenu, deleteMenu,
  getComplaints, createComplaint, resolveComplaint, deleteComplaint,
} from '../services/foodService'
import { getTenants } from '../services/tenantService'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { PageSpinner } from '../components/common/Spinner'

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
const INITIAL_MENU = { date: new Date().toISOString().split('T')[0], breakfast: '', lunch: '', dinner: '', snacks: '' }
const INITIAL_COMPLAINT = { student: '', studentName: '', mealType: 'Lunch', complaint: '', rating: 3 }

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}>
          <Star size={20} className={s <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
        </button>
      ))}
    </div>
  )
}

function MenuForm({ form, setForm, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
        <input required type="date" className="input-field" value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })} />
      </div>
      {['breakfast', 'lunch', 'dinner', 'snacks'].map((meal) => (
        <div key={meal}>
          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{meal}</label>
          <input className="input-field" value={form[meal]}
            onChange={(e) => setForm({ ...form, [meal]: e.target.value })}
            placeholder={`e.g. ${meal === 'breakfast' ? 'Poha, Tea' : meal === 'lunch' ? 'Dal, Rice, Sabji' : meal === 'dinner' ? 'Roti, Curry, Rice' : 'Biscuits, Tea'}`} />
        </div>
      ))}
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Menu'}
        </button>
      </div>
    </form>
  )
}

function ComplaintForm({ form, setForm, onSubmit, loading, students }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Student (optional)</label>
        <select className="input-field" value={form.student}
          onChange={(e) => setForm({ ...form, student: e.target.value })}>
          <option value="">Anonymous / Walk-in</option>
          {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>
      {!form.student && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
          <input className="input-field" value={form.studentName}
            onChange={(e) => setForm({ ...form, studentName: e.target.value })}
            placeholder="Enter name manually" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meal *</label>
          <select required className="input-field" value={form.mealType}
            onChange={(e) => setForm({ ...form, mealType: e.target.value })}>
            {MEAL_TYPES.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <StarRating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Complaint *</label>
        <textarea required rows={3} className="input-field resize-none" value={form.complaint}
          onChange={(e) => setForm({ ...form, complaint: e.target.value })}
          placeholder="Describe the issue..." />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Logging...' : 'Log Complaint'}
        </button>
      </div>
    </form>
  )
}

function ResolveForm({ complaint, onResolve, onClose, loading }) {
  const [response, setResponse] = useState('')
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-3 text-sm">
        <p className="text-gray-500 text-xs mb-1">{complaint.mealType} complaint</p>
        <p className="text-gray-800">{complaint.complaint}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Response</label>
        <textarea rows={3} className="input-field resize-none" value={response}
          onChange={(e) => setResponse(e.target.value)} placeholder="How was this resolved?" />
      </div>
      <div className="flex gap-3 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary flex items-center gap-2" disabled={loading}
          onClick={() => onResolve(complaint._id, response)}>
          <CheckCircle size={15} /> {loading ? 'Resolving...' : 'Mark Resolved'}
        </button>
      </div>
    </div>
  )
}

export default function Food() {
  const [tab, setTab] = useState('menu')
  const [menus, setMenus] = useState([])
  const [complaints, setComplaints] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [showComplaintModal, setShowComplaintModal] = useState(false)
  const [resolveTarget, setResolveTarget] = useState(null)
  const [deleteMenuTarget, setDeleteMenuTarget] = useState(null)
  const [deleteComplaintTarget, setDeleteComplaintTarget] = useState(null)
  const [menuForm, setMenuForm] = useState(INITIAL_MENU)
  const [complaintForm, setComplaintForm] = useState(INITIAL_COMPLAINT)
  const [saving, setSaving] = useState(false)
  const [filterComplaint, setFilterComplaint] = useState('')

  const fetchAll = () => {
    setLoading(true)
    Promise.all([getMenus(), getComplaints({ status: filterComplaint || undefined }), getTenants()])
      .then(([mRes, cRes, sRes]) => {
        setMenus(mRes.data.menus ?? mRes.data)
        setComplaints(cRes.data.complaints ?? cRes.data)
        setStudents(sRes.data.tenants ?? sRes.data)
      })
      .catch(() => { setMenus([]); setComplaints([]); setStudents([]) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [filterComplaint])

  const handleMenuSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await upsertMenu(menuForm); toast.success('Menu saved'); setShowMenuModal(false); fetchAll() }
    catch (err) { toast.error(err.response?.data?.message ?? 'Failed') }
    finally { setSaving(false) }
  }

  const handleComplaintSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await createComplaint(complaintForm); toast.success('Complaint logged')
      setShowComplaintModal(false); setComplaintForm(INITIAL_COMPLAINT); fetchAll()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Failed') }
    finally { setSaving(false) }
  }

  const handleResolve = async (id, adminResponse) => {
    setSaving(true)
    try {
      await resolveComplaint(id, { adminResponse }); toast.success('Complaint resolved')
      setResolveTarget(null); fetchAll()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const handleDeleteMenu = async () => {
    try { await deleteMenu(deleteMenuTarget._id); toast.success('Menu deleted'); setDeleteMenuTarget(null); fetchAll() }
    catch { toast.error('Failed') }
  }

  const handleDeleteComplaint = async () => {
    try { await deleteComplaint(deleteComplaintTarget._id); toast.success('Deleted'); setDeleteComplaintTarget(null); fetchAll() }
    catch { toast.error('Failed') }
  }

  if (loading) return <PageSpinner />

  const pendingCount = complaints.filter((c) => c.status === 'pending').length

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[['menu', 'Food Menu', ChefHat], ['complaints', `Complaints${pendingCount ? ` (${pendingCount})` : ''}`, MessageSquare]].map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === key ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {tab === 'menu' && (
        <>
          <div className="flex justify-end">
            <button className="btn-primary flex items-center gap-2"
              onClick={() => { setMenuForm(INITIAL_MENU); setShowMenuModal(true) }}>
              <Plus size={16} /> Add / Update Menu
            </button>
          </div>
          {menus.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
              <ChefHat size={48} className="mb-3 opacity-40" />
              <p className="font-medium">No menus added yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {menus.map((m) => (
                <div key={m._id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-gray-800">
                      {new Date(m.date).toLocaleDateString('en-NP', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                    <button onClick={() => setDeleteMenuTarget(m)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    {[['Breakfast', m.breakfast], ['Lunch', m.lunch], ['Dinner', m.dinner], ['Snacks', m.snacks]].map(([label, val]) => val && (
                      <div key={label} className="flex gap-2">
                        <span className="text-gray-400 w-20 flex-shrink-0">{label}</span>
                        <span className="text-gray-700">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'complaints' && (
        <>
          <div className="flex gap-3 justify-between">
            <select className="input-field w-auto" value={filterComplaint}
              onChange={(e) => setFilterComplaint(e.target.value)}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
            <button className="btn-primary flex items-center gap-2"
              onClick={() => { setComplaintForm(INITIAL_COMPLAINT); setShowComplaintModal(true) }}>
              <Plus size={16} /> Log Complaint
            </button>
          </div>

          {complaints.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
              <MessageSquare size={48} className="mb-3 opacity-40" />
              <p className="font-medium">No complaints</p>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((c) => (
                <div key={c._id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="font-medium text-gray-900">{c.student?.name ?? c.studentName ?? 'Anonymous'}</span>
                        <span className="badge-info text-xs">{c.mealType}</span>
                        {c.status === 'pending'
                          ? <span className="badge-warning">Pending</span>
                          : <span className="badge-success">Resolved</span>}
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={13} className={s <= (c.rating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">{c.complaint}</p>
                      {c.adminResponse && (
                        <div className="mt-2 bg-green-50 border border-green-100 rounded-lg p-2 text-xs text-green-800">
                          <span className="font-medium">Response: </span>{c.adminResponse}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">{new Date(c.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {c.status === 'pending' && (
                        <button onClick={() => setResolveTarget(c)}
                          className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors">
                          <CheckCircle size={15} />
                        </button>
                      )}
                      <button onClick={() => setDeleteComplaintTarget(c)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Modal isOpen={showMenuModal} onClose={() => setShowMenuModal(false)} title="Food Menu" size="sm">
        <MenuForm form={menuForm} setForm={setMenuForm} onSubmit={handleMenuSubmit} loading={saving} />
      </Modal>

      <Modal isOpen={showComplaintModal} onClose={() => setShowComplaintModal(false)} title="Log Food Complaint">
        <ComplaintForm form={complaintForm} setForm={setComplaintForm}
          onSubmit={handleComplaintSubmit} loading={saving} students={students} />
      </Modal>

      <Modal isOpen={!!resolveTarget} onClose={() => setResolveTarget(null)} title="Resolve Complaint" size="sm">
        {resolveTarget && <ResolveForm complaint={resolveTarget} onResolve={handleResolve}
          onClose={() => setResolveTarget(null)} loading={saving} />}
      </Modal>

      <ConfirmDialog isOpen={!!deleteMenuTarget} onClose={() => setDeleteMenuTarget(null)}
        onConfirm={handleDeleteMenu} loading={false} title="Delete Menu" message="Delete this food menu entry?" />

      <ConfirmDialog isOpen={!!deleteComplaintTarget} onClose={() => setDeleteComplaintTarget(null)}
        onConfirm={handleDeleteComplaint} loading={false} title="Delete Complaint" message="Delete this complaint?" />
    </div>
  )
}
