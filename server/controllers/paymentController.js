const Payment = require('../models/Payment')

exports.getPayments = async (req, res) => {
  try {
    const { status, month, year, tenant } = req.query
    const filter = {}
    if (status) filter.status = status
    if (month) filter.month = month
    if (year) filter.year = Number(year)
    if (tenant) filter.tenant = tenant
    const payments = await Payment.find(filter)
      .populate({ path: 'tenant', select: 'name phone room', populate: { path: 'room', select: 'roomNumber' } })
      .sort({ createdAt: -1 })
    res.json({ payments })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body)
    await payment.populate({ path: 'tenant', select: 'name phone room', populate: { path: 'room', select: 'roomNumber' } })
    res.status(201).json(payment)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate({ path: 'tenant', select: 'name phone room', populate: { path: 'room', select: 'roomNumber' } })
    if (!payment) return res.status(404).json({ message: 'Payment not found' })
    res.json(payment)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id)
    if (!payment) return res.status(404).json({ message: 'Payment not found' })
    res.json({ message: 'Payment deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getStats = async (req, res) => {
  try {
    const now = new Date()
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const currentMonth = months[now.getMonth()]
    const currentYear = now.getFullYear()

    const [totalRevenue, pending, overdue, recent] = await Promise.all([
      Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'overdue' }),
      Payment.find().sort({ createdAt: -1 }).limit(5)
        .populate({ path: 'tenant', select: 'name room', populate: { path: 'room', select: 'roomNumber' } }),
    ])

    res.json({
      totalRevenue: totalRevenue[0]?.total ?? 0,
      pendingPayments: pending,
      overduePayments: overdue,
      recentPayments: recent.map((p) => ({
        id: p._id,
        tenantName: p.tenant?.name,
        room: p.tenant?.room?.roomNumber,
        amount: p.amount,
        date: p.createdAt?.toISOString().split('T')[0],
        status: p.status,
      })),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
