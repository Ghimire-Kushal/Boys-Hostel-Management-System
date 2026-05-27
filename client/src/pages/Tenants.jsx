import { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, Users, Phone, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { getTenants, createTenant, updateTenant, deleteTenant } from '../services/tenantService'
import { getRooms } from '../services/roomService'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { PageSpinner } from '../components/common/Spinner'

const INITIAL_FORM = {
  name: '', email: '', phone: '', address: '', room: '',
  joinDate: '', emergencyContact: '', emergencyPhone: '',
}

function TenantForm({ form, setForm, onSubmit, loading, isEdit, rooms }) {
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Room *</label>
          <select required className="input-field" value={form.room}
            onChange={(e) => setForm({ ...form, room: e.target.value })}>
            <option value="">Select room</option>
            {rooms.map((r) => (
              <option key={r._id} value={r._id}>
                Room {r.roomNumber} ({r.type}) - Rs. {Number(r.rent).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Join Date *</label>
          <input required type="date" className="input-field" value={form.joinDate}
            onChange={(e) => setForm({ ...form, joinDate: e.target.value })} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input className="input-field" value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Home district / address" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
          <input className="input-field" value={form.emergencyContact}
            onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} placeholder="Contact name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
          <input className="input-field" value={form.emergencyPhone}
            onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })} placeholder="98XXXXXXXX" />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (isEdit ? 'Updating...' : 'Adding...') : isEdit ? 'Update Tenant' : 'Add Tenant'}
        </button>
      </div>
    </form>
  )
}

export default function Tenants() {
  const [tenants, setTenants] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTenant, setEditTenant] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchData = () => {
    setLoading(true)
    Promise.all([getTenants(), getRooms()])
      .then(([tRes, rRes]) => {
        setTenants(tRes.data.tenants ?? tRes.data)
        setRooms(rRes.data.rooms ?? rRes.data)
      })
      .catch(() => { setTenants([]); setRooms([]) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const openAdd = () => { setEditTenant(null); setForm(INITIAL_FORM); setShowModal(true) }
  const openEdit = (t) => {
    setEditTenant(t)
    setForm({
      name: t.name, email: t.email ?? '', phone: t.phone,
      address: t.address ?? '', room: t.room?._id ?? t.room ?? '',
      joinDate: t.joinDate?.split('T')[0] ?? '',
      emergencyContact: t.emergencyContact ?? '',
      emergencyPhone: t.emergencyPhone ?? '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editTenant) {
        await updateTenant(editTenant._id, form)
        toast.success('Tenant updated')
      } else {
        await createTenant(form)
        toast.success('Tenant added')
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteTenant(deleteTarget._id)
      toast.success('Tenant removed')
      setDeleteTarget(null)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = tenants.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.phone?.includes(search)
  )

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="Search tenants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} /> Add Tenant
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <Users size={48} className="mb-3 opacity-40" />
          <p className="font-medium">No tenants found</p>
          <p className="text-sm mt-1">Add your first tenant to get started</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Tenant</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Contact</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Room</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Join Date</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Address</th>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                          {t.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-400">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Phone size={13} className="text-gray-400" />
                        {t.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge-info">
                        Room {t.room?.roomNumber ?? t.room ?? '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {t.joinDate ? new Date(t.joinDate).toLocaleDateString('en-NP') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {t.address ? (
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[140px]">{t.address}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1.5 rounded-lg hover:bg-primary-50 text-gray-500 hover:text-primary-600 transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editTenant ? 'Edit Tenant' : 'Add New Tenant'}
        size="lg"
      >
        <TenantForm form={form} setForm={setForm} onSubmit={handleSubmit}
          loading={saving} isEdit={!!editTenant} rooms={rooms} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Remove Tenant"
        message={`Are you sure you want to remove ${deleteTarget?.name}? This cannot be undone.`}
      />
    </div>
  )
}
