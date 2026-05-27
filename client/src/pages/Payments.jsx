import { useEffect, useState, useRef } from 'react'
import { Plus, Search, Edit2, Trash2, CreditCard, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPayments, createPayment, updatePayment, deletePayment } from '../services/paymentService'
import { getTenants } from '../services/tenantService'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { PageSpinner } from '../components/common/Spinner'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const METHODS = ['Cash', 'Online Transfer', 'eSewa', 'Khalti', 'Bank Deposit']
const INITIAL_FORM = { tenant: '', amount: '', month: '', year: new Date().getFullYear(), method: 'Cash', note: '', status: 'paid' }

const statusCls = { paid: 'badge-success', pending: 'badge-warning', overdue: 'badge-danger' }

function PaymentForm({ form, setForm, onSubmit, loading, isEdit, tenants }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
        <select required className="input-field" value={form.tenant}
          onChange={(e) => setForm({ ...form, tenant: e.target.value })}>
          <option value="">Select student</option>
          {tenants.map((t) => (
            <option key={t._id} value={t._id}>{t.name} — Room {t.room?.roomNumber ?? '—'}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.) *</label>
          <input required type="number" min="0" className="input-field" value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 8000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
          <select className="input-field" value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}>
            {METHODS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
          <select required className="input-field" value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}>
            <option value="">Select month</option>
            {MONTHS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
          <input required type="number" className="input-field" value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select className="input-field" value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
        <input className="input-field" value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Optional" />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (isEdit ? 'Updating...' : 'Recording...') : isEdit ? 'Update' : 'Record Payment'}
        </button>
      </div>
    </form>
  )
}

function Receipt({ payment }) {
  const ref = useRef()
  const handlePrint = () => {
    const content = ref.current.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .sub { color: #666; font-size: 13px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        td { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px; }
        td:first-child { color: #666; width: 160px; }
        .total { font-size: 18px; font-weight: bold; color: #2563eb; }
        .footer { margin-top: 32px; font-size: 12px; color: #999; text-align: center; }
        @media print { body { padding: 20px; } }
      </style></head><body>${content}</body></html>
    `)
    win.document.close()
    win.print()
  }

  const tenantName = payment.tenant?.name ?? '—'
  const roomNum = payment.tenant?.room?.roomNumber ?? '—'

  return (
    <div>
      <div ref={ref}>
        <h1>HostelEase Nepal</h1>
        <p className="sub">Payment Receipt</p>
        <table>
          <tbody>
            <tr><td>Receipt No</td><td>#{payment._id?.slice(-8).toUpperCase()}</td></tr>
            <tr><td>Student</td><td>{tenantName}</td></tr>
            <tr><td>Room</td><td>Room {roomNum}</td></tr>
            <tr><td>Period</td><td>{payment.month} {payment.year}</td></tr>
            <tr><td>Payment Method</td><td>{payment.method ?? '—'}</td></tr>
            <tr><td>Status</td><td style={{textTransform:'capitalize'}}>{payment.status}</td></tr>
            <tr><td>Date</td><td>{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : new Date(payment.createdAt).toLocaleDateString()}</td></tr>
            {payment.note && <tr><td>Note</td><td>{payment.note}</td></tr>}
            <tr><td className="total">Amount</td><td className="total">Rs. {Number(payment.amount).toLocaleString()}</td></tr>
          </tbody>
        </table>
        <p className="footer">Thank you for your payment. — HostelEase Nepal</p>
      </div>
      <div className="flex justify-end mt-4">
        <button className="btn-primary flex items-center gap-2" onClick={handlePrint}>
          <Printer size={15} /> Print Receipt
        </button>
      </div>
    </div>
  )
}

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [receiptPayment, setReceiptPayment] = useState(null)
  const [editPayment, setEditPayment] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchData = () => {
    setLoading(true)
    Promise.all([getPayments(), getTenants()])
      .then(([pRes, tRes]) => {
        setPayments(pRes.data.payments ?? pRes.data)
        setTenants(tRes.data.tenants ?? tRes.data)
      })
      .catch(() => { setPayments([]); setTenants([]) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const openAdd = () => { setEditPayment(null); setForm(INITIAL_FORM); setShowModal(true) }
  const openEdit = (p) => {
    setEditPayment(p)
    setForm({ tenant: p.tenant?._id ?? '', amount: p.amount, month: p.month, year: p.year,
      method: p.method ?? 'Cash', note: p.note ?? '', status: p.status })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    const payload = { ...form, amount: Number(form.amount), year: Number(form.year) }
    try {
      if (editPayment) { await updatePayment(editPayment._id, payload); toast.success('Updated') }
      else { await createPayment(payload); toast.success('Payment recorded') }
      setShowModal(false); fetchData()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await deletePayment(deleteTarget._id); toast.success('Deleted'); setDeleteTarget(null); fetchData() }
    catch { toast.error('Failed') }
    finally { setDeleting(false) }
  }

  const filtered = payments.filter((p) => {
    const ms = (p.tenant?.name ?? '').toLowerCase().includes(search.toLowerCase())
    const mst = !filterStatus || p.status === filterStatus
    const mm = !filterMonth || p.month === filterMonth
    return ms && mst && mm
  })

  const totalPaid = filtered.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const totalPending = filtered.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.amount, 0)

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card bg-green-50 border-green-100">
          <p className="text-xs text-green-600 font-medium">Total Collected</p>
          <p className="text-2xl font-bold text-green-700 mt-1">Rs. {totalPaid.toLocaleString()}</p>
        </div>
        <div className="card bg-yellow-50 border-yellow-100">
          <p className="text-xs text-yellow-600 font-medium">Pending / Overdue</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1">Rs. {totalPending.toLocaleString()}</p>
        </div>
        <div className="card hidden sm:block">
          <p className="text-xs text-gray-500 font-medium">Total Records</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{filtered.length}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-9 w-48" placeholder="Search student..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-auto" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <select className="input-field w-auto" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
            <option value="">All Months</option>
            {MONTHS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <CreditCard size={48} className="mb-3 opacity-40" />
          <p className="font-medium">No payments found</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Student', 'Room', 'Period', 'Amount', 'Method', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{p.tenant?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {p.tenant?.room?.roomNumber ? `Room ${p.tenant.room.roomNumber}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{p.month} {p.year}</td>
                    <td className="px-5 py-3 font-medium">Rs. {Number(p.amount).toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-500">{p.method ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={statusCls[p.status] ?? 'badge-info'}>
                        {p.status?.charAt(0).toUpperCase() + p.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setReceiptPayment(p)}
                          className="p-1.5 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors" title="Receipt">
                          <Printer size={14} />
                        </button>
                        <button onClick={() => openEdit(p)}
                          className="p-1.5 rounded hover:bg-primary-50 text-gray-500 hover:text-primary-600 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(p)}
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
        title={editPayment ? 'Edit Payment' : 'Record Payment'}>
        <PaymentForm form={form} setForm={setForm} onSubmit={handleSubmit}
          loading={saving} isEdit={!!editPayment} tenants={tenants} />
      </Modal>

      <Modal isOpen={!!receiptPayment} onClose={() => setReceiptPayment(null)} title="Payment Receipt" size="sm">
        {receiptPayment && <Receipt payment={receiptPayment} />}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={deleting} title="Delete Payment"
        message="Delete this payment record? This cannot be undone." />
    </div>
  )
}
