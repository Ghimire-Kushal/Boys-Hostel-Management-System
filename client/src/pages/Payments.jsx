import { useEffect, useState, useRef } from 'react'
import { Plus, Search, Edit2, Trash2, CreditCard, Printer, QrCode, Upload, ToggleLeft, ToggleRight, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPayments, createPayment, updatePayment, deletePayment } from '../services/paymentService'
import { getTenants } from '../services/tenantService'
import { getQRCodes, upsertQR, deleteQR, toggleQR } from '../services/paymentQRService'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { PageSpinner } from '../components/common/Spinner'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const METHODS = ['Cash', 'Online Transfer', 'eSewa', 'Khalti', 'Bank Deposit']
const WALLETS = ['eSewa', 'Khalti', 'IME Pay', 'ConnectIPS', 'Bank Transfer', 'Other']
const INITIAL_FORM = { tenant: '', amount: '', month: '', year: new Date().getFullYear(), method: 'Cash', note: '', status: 'paid' }
const INITIAL_QR_FORM = { wallet: '', accountName: '', accountNumber: '', file: null }

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

function QRForm({ form, setForm, onSubmit, loading }) {
  const fileRef = useRef()
  const [preview, setPreview] = useState(null)

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm({ ...form, file })
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const clearFile = () => {
    setForm({ ...form, file: null })
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Wallet / Payment Method *</label>
        <select required className="input-field" value={form.wallet}
          onChange={(e) => setForm({ ...form, wallet: e.target.value })}>
          <option value="">Select wallet</option>
          {WALLETS.map((w) => <option key={w}>{w}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
          <input className="input-field" value={form.accountName}
            onChange={(e) => setForm({ ...form, accountName: e.target.value })} placeholder="e.g. Rajesh Hostel" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account / Phone Number</label>
          <input className="input-field" value={form.accountNumber}
            onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} placeholder="e.g. 9800000000" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">QR Code Image *</label>
        {preview ? (
          <div className="relative inline-block">
            <img src={preview} alt="QR preview" className="w-40 h-40 object-contain border border-gray-200 rounded-lg" />
            <button type="button" onClick={clearFile}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600">
              <X size={12} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
            <Upload size={24} className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Click to upload QR image</span>
            <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        )}
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Uploading...' : 'Save QR Code'}
        </button>
      </div>
    </form>
  )
}

function QRCard({ qr, onToggle, onDelete }) {
  const walletColors = {
    eSewa: 'bg-green-100 text-green-700 border-green-200',
    Khalti: 'bg-purple-100 text-purple-700 border-purple-200',
    'IME Pay': 'bg-red-100 text-red-700 border-red-200',
    ConnectIPS: 'bg-blue-100 text-blue-700 border-blue-200',
    'Bank Transfer': 'bg-gray-100 text-gray-700 border-gray-200',
    Other: 'bg-orange-100 text-orange-700 border-orange-200',
  }
  const cls = walletColors[qr.wallet] ?? walletColors.Other

  return (
    <div className={`card flex flex-col items-center gap-3 relative ${!qr.isActive ? 'opacity-60' : ''}`}>
      <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>{qr.wallet}</div>
      <img src={qr.qrImage} alt={`${qr.wallet} QR`}
        className="w-36 h-36 object-contain border border-gray-200 rounded-lg" />
      {(qr.accountName || qr.accountNumber) && (
        <div className="text-center">
          {qr.accountName && <p className="text-sm font-medium text-gray-800">{qr.accountName}</p>}
          {qr.accountNumber && <p className="text-xs text-gray-500">{qr.accountNumber}</p>}
        </div>
      )}
      <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${qr.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
        {qr.isActive ? 'Active' : 'Inactive'}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <button onClick={() => onToggle(qr._id)}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors" title={qr.isActive ? 'Deactivate' : 'Activate'}>
          {qr.isActive ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
        </button>
        <button onClick={() => onDelete(qr)}
          className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors" title="Delete">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

export default function Payments() {
  const [tab, setTab] = useState('history')

  // Payment history state
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

  // QR state
  const [qrCodes, setQrCodes] = useState([])
  const [qrLoading, setQrLoading] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrForm, setQrForm] = useState(INITIAL_QR_FORM)
  const [qrSaving, setQrSaving] = useState(false)
  const [qrDeleteTarget, setQrDeleteTarget] = useState(null)
  const [qrDeleting, setQrDeleting] = useState(false)

  const fetchPayments = () => {
    setLoading(true)
    Promise.all([getPayments(), getTenants()])
      .then(([pRes, tRes]) => {
        setPayments(pRes.data.payments ?? pRes.data)
        setTenants(tRes.data.tenants ?? tRes.data)
      })
      .catch(() => { setPayments([]); setTenants([]) })
      .finally(() => setLoading(false))
  }

  const fetchQRCodes = () => {
    setQrLoading(true)
    getQRCodes()
      .then((res) => setQrCodes(res.data.qrs ?? []))
      .catch(() => setQrCodes([]))
      .finally(() => setQrLoading(false))
  }

  useEffect(() => { fetchPayments() }, [])
  useEffect(() => { if (tab === 'qr') fetchQRCodes() }, [tab])

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
      setShowModal(false); fetchPayments()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await deletePayment(deleteTarget._id); toast.success('Deleted'); setDeleteTarget(null); fetchPayments() }
    catch { toast.error('Failed') }
    finally { setDeleting(false) }
  }

  const handleQRSubmit = async (e) => {
    e.preventDefault()
    if (!qrForm.file) return toast.error('Please select a QR image')
    if (!qrForm.wallet) return toast.error('Please select a wallet')
    setQrSaving(true)
    try {
      const fd = new FormData()
      fd.append('qrImage', qrForm.file)
      fd.append('wallet', qrForm.wallet)
      if (qrForm.accountName) fd.append('accountName', qrForm.accountName)
      if (qrForm.accountNumber) fd.append('accountNumber', qrForm.accountNumber)
      await upsertQR(fd)
      toast.success(`${qrForm.wallet} QR saved`)
      setShowQRModal(false)
      setQrForm(INITIAL_QR_FORM)
      fetchQRCodes()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Upload failed') }
    finally { setQrSaving(false) }
  }

  const handleQRToggle = async (id) => {
    try {
      const res = await toggleQR(id)
      setQrCodes((prev) => prev.map((q) => q._id === id ? res.data : q))
    } catch { toast.error('Failed to toggle') }
  }

  const handleQRDelete = async () => {
    setQrDeleting(true)
    try {
      await deleteQR(qrDeleteTarget._id)
      toast.success('QR code deleted')
      setQrDeleteTarget(null)
      fetchQRCodes()
    } catch { toast.error('Failed') }
    finally { setQrDeleting(false) }
  }

  const filtered = payments.filter((p) => {
    const ms = (p.tenant?.name ?? '').toLowerCase().includes(search.toLowerCase())
    const mst = !filterStatus || p.status === filterStatus
    const mm = !filterMonth || p.month === filterMonth
    return ms && mst && mm
  })

  const totalPaid = filtered.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const totalPending = filtered.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.amount, 0)

  if (loading && tab === 'history') return <PageSpinner />

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            tab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}>
          <CreditCard size={15} /> Payment History
        </button>
        <button
          onClick={() => setTab('qr')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            tab === 'qr' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}>
          <QrCode size={15} /> QR Codes
          {qrCodes.length > 0 && (
            <span className="bg-primary-100 text-primary-700 text-xs px-1.5 py-0.5 rounded-full">{qrCodes.length}</span>
          )}
        </button>
      </div>

      {tab === 'history' && (
        <>
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
        </>
      )}

      {tab === 'qr' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Payment QR Codes</h2>
              <p className="text-sm text-gray-500 mt-0.5">Upload QR codes for digital payment wallets so students can pay easily</p>
            </div>
            <button className="btn-primary flex items-center gap-2" onClick={() => { setQrForm(INITIAL_QR_FORM); setShowQRModal(true) }}>
              <Plus size={16} /> Add QR Code
            </button>
          </div>

          {qrLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : qrCodes.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
              <QrCode size={48} className="mb-3 opacity-40" />
              <p className="font-medium">No QR codes added yet</p>
              <p className="text-sm mt-1">Add QR codes for eSewa, Khalti, or bank transfer</p>
              <button className="btn-primary mt-4 flex items-center gap-2"
                onClick={() => { setQrForm(INITIAL_QR_FORM); setShowQRModal(true) }}>
                <Plus size={15} /> Add First QR Code
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {qrCodes.map((qr) => (
                <QRCard key={qr._id} qr={qr} onToggle={handleQRToggle} onDelete={setQrDeleteTarget} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Payment modals */}
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

      {/* QR modals */}
      <Modal isOpen={showQRModal} onClose={() => setShowQRModal(false)} title="Add Payment QR Code">
        <QRForm form={qrForm} setForm={setQrForm} onSubmit={handleQRSubmit} loading={qrSaving} />
      </Modal>

      <ConfirmDialog isOpen={!!qrDeleteTarget} onClose={() => setQrDeleteTarget(null)}
        onConfirm={handleQRDelete} loading={qrDeleting} title="Delete QR Code"
        message={`Delete the ${qrDeleteTarget?.wallet} QR code? This cannot be undone.`} />
    </div>
  )
}
