import { useEffect, useState } from 'react'
import { CreditCard, QrCode, ScanLine, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { getMyPayments, getPaymentOptions } from '../../services/studentService'
import { formatBS } from '../../utils/nepaliDate'

const statusConfig = {
  paid:    { icon: CheckCircle, cls: 'text-green-600 bg-green-50',  label: 'Paid' },
  pending: { icon: Clock,       cls: 'text-yellow-600 bg-yellow-50', label: 'Pending' },
  overdue: { icon: AlertCircle, cls: 'text-red-600 bg-red-50',      label: 'Overdue' },
}

const walletColors = {
  eSewa:         'border-green-300 bg-green-50',
  Khalti:        'border-purple-300 bg-purple-50',
  'IME Pay':     'border-red-300 bg-red-50',
  ConnectIPS:    'border-blue-300 bg-blue-50',
  'Bank Transfer':'border-gray-300 bg-gray-50',
  Other:         'border-orange-300 bg-orange-50',
}

const walletBadge = {
  eSewa:         'bg-green-100 text-green-700',
  Khalti:        'bg-purple-100 text-purple-700',
  'IME Pay':     'bg-red-100 text-red-700',
  ConnectIPS:    'bg-blue-100 text-blue-700',
  'Bank Transfer':'bg-gray-100 text-gray-700',
  Other:         'bg-orange-100 text-orange-700',
}

export default function StudentPayments() {
  const [tab, setTab] = useState('pay')
  const [qrs, setQrs] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedQR, setSelectedQR] = useState(null)

  useEffect(() => {
    Promise.all([getMyPayments(), getPaymentOptions()])
      .then(([pRes, qRes]) => {
        setPayments(pRes.data.payments ?? [])
        setQrs(qRes.data.qrs ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        <button onClick={() => setTab('pay')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            tab === 'pay' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}>
          <QrCode size={15} /> Pay Now
        </button>
        <button onClick={() => setTab('history')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            tab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}>
          <CreditCard size={15} /> My Payments
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === 'pay' ? (
        <>
          <div>
            <h2 className="font-semibold text-gray-900">Payment Options</h2>
            <p className="text-sm text-gray-500 mt-0.5">Choose your preferred wallet and scan the QR code to pay</p>
          </div>

          {qrs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center text-gray-400">
              <QrCode size={40} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">No payment QR codes available</p>
              <p className="text-xs mt-1">Please contact the hostel admin</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {qrs.map((qr) => (
                  <button key={qr._id} onClick={() => setSelectedQR(qr)}
                    className={`rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${
                      selectedQR?._id === qr._id
                        ? 'border-primary-500 shadow-md'
                        : `${walletColors[qr.wallet] ?? walletColors.Other} hover:shadow-sm`
                    }`}>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${walletBadge[qr.wallet] ?? walletBadge.Other}`}>
                      {qr.wallet}
                    </span>
                    <img src={qr.qrImage} alt={qr.wallet}
                      className="w-20 h-20 object-contain rounded-lg" />
                    {qr.accountName && <p className="text-xs font-medium text-gray-700 text-center">{qr.accountName}</p>}
                    {qr.accountNumber && <p className="text-xs text-gray-500">{qr.accountNumber}</p>}
                  </button>
                ))}
              </div>

              {/* Selected QR enlarged */}
              {selectedQR && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${walletBadge[selectedQR.wallet] ?? walletBadge.Other}`}>
                        {selectedQR.wallet}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <ScanLine size={14} /> Scan to Pay
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <img src={selectedQR.qrImage} alt={selectedQR.wallet}
                      className="w-52 h-52 object-contain rounded-xl border border-gray-200" />
                    {selectedQR.accountName && (
                      <p className="font-semibold text-gray-800">{selectedQR.accountName}</p>
                    )}
                    {selectedQR.accountNumber && (
                      <div className="bg-gray-50 px-4 py-2 rounded-lg">
                        <p className="text-xs text-gray-500 text-center">Account / Phone</p>
                        <p className="text-base font-bold text-gray-800 tracking-widest text-center">
                          {selectedQR.accountNumber}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 text-center mt-1">
                      After payment, inform the hostel admin with your transaction ID for confirmation.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <div>
            <h2 className="font-semibold text-gray-900">My Payment History</h2>
            <p className="text-sm text-gray-500 mt-0.5">Your recent rent payment records</p>
          </div>

          {payments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center text-gray-400">
              <CreditCard size={40} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">No payment records yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map((p) => {
                const cfg = statusConfig[p.status] ?? statusConfig.pending
                const Icon = cfg.icon
                return (
                  <div key={p._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                    <div className={`${cfg.cls} p-2.5 rounded-xl shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{p.month} {p.year}</p>
                      <p className="text-xs text-gray-400">
                        {p.method ?? 'Cash'}
                        {p.paidAt ? ` • ${new Date(p.paidAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}` : ''}
                        {p.paidAt ? ` (${formatBS(p.paidAt)} BS)` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-800">Rs. {Number(p.amount).toLocaleString()}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
