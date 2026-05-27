import { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, BedDouble, Upload, X, Image, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRooms, createRoom, updateRoom, deleteRoom, uploadRoomPhotos, deleteRoomPhoto } from '../services/roomService'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { PageSpinner } from '../components/common/Spinner'

const ROOM_TYPES = ['1 Seater', '2 Seater', '3 Seater', '4 Seater']
const FACILITIES = ['Fan', 'Attached Bathroom', 'Wi-Fi', 'Study Table', 'Cupboard', 'Geyser', 'TV', 'AC']
const INITIAL_FORM = { roomNumber: '', type: '2 Seater', rent: '', floor: '', description: '', facilities: [] }

const statusConfig = {
  vacant:      { label: 'Vacant',      cls: 'badge-info' },
  partial:     { label: 'Partial',     cls: 'badge-warning' },
  occupied:    { label: 'Full',        cls: 'badge-danger' },
  maintenance: { label: 'Maintenance', cls: 'badge-warning' },
}

function FacilityCheckboxes({ selected, onChange }) {
  const toggle = (f) =>
    onChange(selected.includes(f) ? selected.filter((x) => x !== f) : [...selected, f])
  return (
    <div className="grid grid-cols-2 gap-2">
      {FACILITIES.map((f) => (
        <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={selected.includes(f)} onChange={() => toggle(f)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          {f}
        </label>
      ))}
    </div>
  )
}

function RoomForm({ form, setForm, onSubmit, loading, isEdit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
          <input required className="input-field" value={form.roomNumber}
            onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} placeholder="e.g. 101" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
          <input type="number" min="0" className="input-field" value={form.floor}
            onChange={(e) => setForm({ ...form, floor: e.target.value })} placeholder="e.g. 1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
          <select required className="input-field" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {ROOM_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (Rs.) *</label>
          <input required type="number" min="0" className="input-field" value={form.rent}
            onChange={(e) => setForm({ ...form, rent: e.target.value })} placeholder="e.g. 8000" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
        <FacilityCheckboxes selected={form.facilities}
          onChange={(facilities) => setForm({ ...form, facilities })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea rows={2} className="input-field resize-none" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Optional notes" />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (isEdit ? 'Updating...' : 'Adding...') : isEdit ? 'Update Room' : 'Add Room'}
        </button>
      </div>
    </form>
  )
}

function PhotoGallery({ room, onClose, onUpload, onDelete }) {
  const [uploading, setUploading] = useState(false)
  const [current, setCurrent] = useState(0)
  const photos = room.photos ?? []

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    const fd = new FormData()
    files.forEach((f) => fd.append('photos', f))
    try { await onUpload(room._id, fd) }
    finally { setUploading(false) }
  }

  return (
    <div className="space-y-4">
      {photos.length > 0 ? (
        <div className="relative">
          <img src={photos[current]} alt="Room" className="w-full h-56 object-cover rounded-lg" />
          {photos.length > 1 && (
            <>
              <button onClick={() => setCurrent((c) => (c - 1 + photos.length) % photos.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setCurrent((c) => (c + 1) % photos.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                <ChevronRight size={18} />
              </button>
              <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                {current + 1} / {photos.length}
              </span>
            </>
          )}
          <button onClick={() => onDelete(room._id, photos[current])}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="h-40 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400">
          <Image size={36} className="mb-2 opacity-40" />
          <p className="text-sm">No photos yet</p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {photos.map((p, i) => (
          <button key={p} onClick={() => setCurrent(i)}
            className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${current === i ? 'border-primary-500' : 'border-transparent'}`}>
            <img src={p} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 cursor-pointer btn-secondary w-full justify-center">
        <Upload size={15} />
        {uploading ? 'Uploading...' : 'Upload Photos'}
        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} disabled={uploading} />
      </label>
    </div>
  )
}

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showPhotos, setShowPhotos] = useState(null)
  const [editRoom, setEditRoom] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchRooms = () => {
    setLoading(true)
    getRooms().then(({ data }) => setRooms(data.rooms ?? data))
      .catch(() => setRooms([])).finally(() => setLoading(false))
  }

  useEffect(() => { fetchRooms() }, [])

  const openAdd = () => { setEditRoom(null); setForm(INITIAL_FORM); setShowModal(true) }
  const openEdit = (room) => {
    setEditRoom(room)
    setForm({ roomNumber: room.roomNumber, type: room.type, rent: room.rent,
      floor: room.floor ?? '', description: room.description ?? '',
      facilities: room.facilities ?? [] })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    const payload = { ...form, rent: Number(form.rent), floor: form.floor ? Number(form.floor) : 0 }
    try {
      if (editRoom) { await updateRoom(editRoom._id, payload); toast.success('Room updated') }
      else { await createRoom(payload); toast.success('Room added') }
      setShowModal(false); fetchRooms()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await deleteRoom(deleteTarget._id); toast.success('Room deleted'); setDeleteTarget(null); fetchRooms() }
    catch (err) { toast.error(err.response?.data?.message ?? 'Failed to delete') }
    finally { setDeleting(false) }
  }

  const handlePhotoUpload = async (id, fd) => {
    try {
      const { data } = await uploadRoomPhotos(id, fd)
      setShowPhotos((r) => ({ ...r, photos: data.photos }))
      setRooms((rs) => rs.map((r) => r._id === id ? { ...r, photos: data.photos } : r))
      toast.success('Photos uploaded')
    } catch (err) { toast.error(err.response?.data?.message ?? 'Upload failed') }
  }

  const handlePhotoDelete = async (id, url) => {
    try {
      const { data } = await deleteRoomPhoto(id, url)
      setShowPhotos((r) => ({ ...r, photos: data.photos }))
      setRooms((rs) => rs.map((r) => r._id === id ? { ...r, photos: data.photos } : r))
      toast.success('Photo removed')
    } catch { toast.error('Failed to remove photo') }
  }

  const filtered = rooms.filter((r) => {
    const ms = r.roomNumber?.toLowerCase().includes(search.toLowerCase())
    const mst = !filterStatus || r.status === filterStatus
    return ms && mst
  })

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex gap-3">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-9" placeholder="Search rooms..." value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-auto" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="vacant">Vacant</option>
            <option value="partial">Partial</option>
            <option value="occupied">Full</option>
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
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((room) => {
            const sc = statusConfig[room.status] ?? statusConfig.vacant
            const thumb = room.photos?.[0]
            return (
              <div key={room._id} className="card hover:shadow-md transition-shadow p-0 overflow-hidden">
                <div className="relative h-36 bg-gray-100 cursor-pointer" onClick={() => setShowPhotos(room)}>
                  {thumb ? (
                    <img src={thumb} alt="Room" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Image size={36} />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className={sc.cls}>{sc.label}</span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                    {room.availableBeds ?? room.totalBeds ?? 0} beds free
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">Room {room.roomNumber}</h3>
                    <p className="text-sm font-bold text-primary-600">Rs. {Number(room.rent).toLocaleString()}<span className="text-xs font-normal text-gray-400">/mo</span></p>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{room.type} • Floor {room.floor ?? 0}</p>

                  {room.facilities?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {room.facilities.slice(0, 3).map((f) => (
                        <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>
                      ))}
                      {room.facilities.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">+{room.facilities.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button onClick={() => openEdit(room)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded py-1.5 transition-colors">
                      <Edit2 size={13} /> Edit
                    </button>
                    <button onClick={() => setShowPhotos(room)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded py-1.5 transition-colors">
                      <Image size={13} /> Photos
                    </button>
                    <button onClick={() => setDeleteTarget(room)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded py-1.5 transition-colors">
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editRoom ? 'Edit Room' : 'Add New Room'}>
        <RoomForm form={form} setForm={setForm} onSubmit={handleSubmit} loading={saving} isEdit={!!editRoom} />
      </Modal>

      <Modal isOpen={!!showPhotos} onClose={() => setShowPhotos(null)}
        title={`Room ${showPhotos?.roomNumber} — Photos`} size="sm">
        {showPhotos && <PhotoGallery room={showPhotos} onClose={() => setShowPhotos(null)}
          onUpload={handlePhotoUpload} onDelete={handlePhotoDelete} />}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={deleting} title="Delete Room"
        message={`Delete Room ${deleteTarget?.roomNumber}? Rooms with active bookings cannot be deleted.`} />
    </div>
  )
}
