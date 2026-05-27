import { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, BedDouble } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRooms, createRoom, updateRoom, deleteRoom } from '../services/roomService'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { PageSpinner } from '../components/common/Spinner'

const ROOM_TYPES = ['Single', 'Double', 'Triple', 'Quad']
const INITIAL_FORM = { roomNumber: '', type: 'Single', rent: '', floor: '', description: '', amenities: '' }

const statusConfig = {
  vacant: { label: 'Vacant', cls: 'badge-info' },
  occupied: { label: 'Occupied', cls: 'badge-success' },
  maintenance: { label: 'Maintenance', cls: 'badge-warning' },
}

function RoomForm({ form, setForm, onSubmit, loading, isEdit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
          <input
            required
            className="input-field"
            value={form.roomNumber}
            onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
            placeholder="e.g. 101"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
          <input
            className="input-field"
            type="number"
            min="0"
            value={form.floor}
            onChange={(e) => setForm({ ...form, floor: e.target.value })}
            placeholder="e.g. 1"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
          <select
            required
            className="input-field"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {ROOM_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (Rs.) *</label>
          <input
            required
            type="number"
            min="0"
            className="input-field"
            value={form.rent}
            onChange={(e) => setForm({ ...form, rent: e.target.value })}
            placeholder="e.g. 8000"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
        <input
          className="input-field"
          value={form.amenities}
          onChange={(e) => setForm({ ...form, amenities: e.target.value })}
          placeholder="e.g. WiFi, Attached Bathroom, TV"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          className="input-field resize-none"
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Optional notes about the room"
        />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (isEdit ? 'Updating...' : 'Adding...') : isEdit ? 'Update Room' : 'Add Room'}
        </button>
      </div>
    </form>
  )
}

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editRoom, setEditRoom] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchRooms = () => {
    setLoading(true)
    getRooms()
      .then(({ data }) => setRooms(data.rooms ?? data))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRooms() }, [])

  const openAdd = () => { setEditRoom(null); setForm(INITIAL_FORM); setShowModal(true) }
  const openEdit = (room) => {
    setEditRoom(room)
    setForm({
      roomNumber: room.roomNumber,
      type: room.type,
      rent: room.rent,
      floor: room.floor ?? '',
      description: room.description ?? '',
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : room.amenities ?? '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      rent: Number(form.rent),
      floor: form.floor ? Number(form.floor) : undefined,
      amenities: form.amenities ? form.amenities.split(',').map((a) => a.trim()).filter(Boolean) : [],
    }
    try {
      if (editRoom) {
        await updateRoom(editRoom._id, payload)
        toast.success('Room updated')
      } else {
        await createRoom(payload)
        toast.success('Room added')
      }
      setShowModal(false)
      fetchRooms()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteRoom(deleteTarget._id)
      toast.success('Room deleted')
      setDeleteTarget(null)
      fetchRooms()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = rooms.filter((r) => {
    const matchSearch = r.roomNumber?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || r.status === filterStatus
    return matchSearch && matchStatus
  })

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input-field w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} /> Add Room
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <BedDouble size={48} className="mb-3 opacity-40" />
          <p className="font-medium">No rooms found</p>
          <p className="text-sm mt-1">Add your first room to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((room) => {
            const sc = statusConfig[room.status] ?? statusConfig.vacant
            return (
              <div key={room._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Room {room.roomNumber}</h3>
                    <p className="text-sm text-gray-500">{room.type} • Floor {room.floor ?? '-'}</p>
                  </div>
                  <span className={sc.cls}>{sc.label}</span>
                </div>
                <p className="text-lg font-bold text-primary-600">
                  Rs. {Number(room.rent).toLocaleString()}<span className="text-xs font-normal text-gray-400">/mo</span>
                </p>
                {room.amenities?.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2 truncate">
                    {Array.isArray(room.amenities) ? room.amenities.join(' • ') : room.amenities}
                  </p>
                )}
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEdit(room)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg py-1.5 transition-colors"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(room)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg py-1.5 transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editRoom ? 'Edit Room' : 'Add New Room'}
      >
        <RoomForm form={form} setForm={setForm} onSubmit={handleSubmit} loading={saving} isEdit={!!editRoom} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Room"
        message={`Are you sure you want to delete Room ${deleteTarget?.roomNumber}? This cannot be undone.`}
      />
    </div>
  )
}
