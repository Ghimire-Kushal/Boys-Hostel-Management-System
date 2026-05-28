import { useEffect, useState } from 'react'
import { MessageSquare, Trash2, CheckCheck, Mail, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { getFeedbacks, updateFeedbackStatus, deleteFeedback } from '../services/feedbackService'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Modal from '../components/common/Modal'
import { PageSpinner } from '../components/common/Spinner'

const STATUS_OPTS = ['new', 'read', 'addressed']
const CATEGORIES = ['', 'Food', 'Room', 'Staff', 'Facilities', 'Payment', 'General']

const statusCls = {
  new:       'bg-blue-100 text-blue-700',
  read:      'bg-yellow-100 text-yellow-700',
  addressed: 'bg-green-100 text-green-700',
}

const catCls = {
  Food:        'bg-orange-100 text-orange-700',
  Room:        'bg-indigo-100 text-indigo-700',
  Staff:       'bg-pink-100 text-pink-700',
  Facilities:  'bg-teal-100 text-teal-700',
  Payment:     'bg-green-100 text-green-700',
  General:     'bg-gray-100 text-gray-600',
}

function Stars({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={12} className={s <= (value ?? 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
      ))}
    </div>
  )
}

function ReplyModal({ feedback, onClose, onSaved }) {
  const [reply, setReply] = useState(feedback.adminReply ?? '')
  const [status, setStatus] = useState(feedback.status)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updateFeedbackStatus(feedback._id, { status, adminReply: reply })
      onSaved(res.data)
      toast.success('Updated')
      onClose()
    } catch {
      toast.error('Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catCls[feedback.category] ?? catCls.General}`}>
            {feedback.category}
          </span>
          {feedback.rating && <Stars value={feedback.rating} />}
          <span className="text-xs text-gray-400 ml-auto">
            {feedback.isAnonymous ? 'Anonymous' : (feedback.name || 'Anonymous')}
          </span>
        </div>
        <p className="text-sm text-gray-700">{feedback.message}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Reply <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea rows={3} className="input-field resize-none" placeholder="Write a response..."
          value={reply} onChange={(e) => setReply(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <button className="btn-primary" disabled={saving} onClick={handleSave}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [replyTarget, setReplyTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = () => {
    setLoading(true)
    const params = {}
    if (filterStatus) params.status = filterStatus
    if (filterCat) params.category = filterCat
    getFeedbacks(params)
      .then((res) => setFeedbacks(res.data.feedbacks ?? []))
      .catch(() => setFeedbacks([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [filterStatus, filterCat])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteFeedback(deleteTarget._id)
      toast.success('Deleted')
      setDeleteTarget(null)
      fetchData()
    } catch { toast.error('Failed') }
    finally { setDeleting(false) }
  }

  const handleSaved = (updated) => {
    setFeedbacks((prev) => prev.map((f) => f._id === updated._id ? updated : f))
  }

  const counts = { new: 0, read: 0, addressed: 0 }
  feedbacks.forEach((f) => { if (counts[f.status] !== undefined) counts[f.status]++ })

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-blue-50 border-blue-100">
          <p className="text-xs text-blue-600 font-medium">New</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{counts.new}</p>
        </div>
        <div className="card bg-yellow-50 border-yellow-100">
          <p className="text-xs text-yellow-600 font-medium">Read</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1">{counts.read}</p>
        </div>
        <div className="card bg-green-50 border-green-100">
          <p className="text-xs text-green-600 font-medium">Addressed</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{counts.addressed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select className="input-field w-auto" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUS_OPTS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select className="input-field w-auto" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.filter(Boolean).map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* List */}
      {feedbacks.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <MessageSquare size={48} className="mb-3 opacity-40" />
          <p className="font-medium">No feedback yet</p>
          <p className="text-sm mt-1">Share the landing page with students to receive feedback</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div key={fb._id} className="card space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catCls[fb.category] ?? catCls.General}`}>
                    {fb.category}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCls[fb.status]}`}>
                    {fb.status.charAt(0).toUpperCase() + fb.status.slice(1)}
                  </span>
                  {fb.rating > 0 && <Stars value={fb.rating} />}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setReplyTarget(fb)}
                    className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Reply">
                    <Mail size={14} />
                  </button>
                  <button onClick={() => setDeleteTarget(fb)}
                    className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-600">
                    {fb.isAnonymous ? 'Anonymous' : (fb.name || 'Anonymous')}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(fb.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{fb.message}</p>
              </div>

              {fb.adminReply && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-start gap-2">
                  <CheckCheck size={14} className="text-green-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-700">{fb.adminReply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!replyTarget} onClose={() => setReplyTarget(null)} title="Review Feedback">
        {replyTarget && <ReplyModal feedback={replyTarget} onClose={() => setReplyTarget(null)} onSaved={handleSaved} />}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={deleting} title="Delete Feedback"
        message="Delete this feedback? This cannot be undone." />
    </div>
  )
}
