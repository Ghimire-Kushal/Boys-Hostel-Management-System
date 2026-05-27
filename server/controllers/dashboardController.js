const Room = require('../models/Room')
const Tenant = require('../models/Tenant')
const Payment = require('../models/Payment')

exports.getStats = async (req, res) => {
  try {
    const [
      totalRooms, occupiedRooms, vacantRooms,
      totalTenants,
      revenueAgg, pendingPayments, overduePayments,
      recentPayments,
    ] = await Promise.all([
      Room.countDocuments(),
      Room.countDocuments({ status: 'occupied' }),
      Room.countDocuments({ status: 'vacant' }),
      Tenant.countDocuments({ isActive: true }),
      Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'overdue' }),
      Payment.find().sort({ createdAt: -1 }).limit(5)
        .populate({ path: 'tenant', select: 'name room', populate: { path: 'room', select: 'roomNumber' } }),
    ])

    res.json({
      totalRooms,
      occupiedRooms,
      vacantRooms,
      totalTenants,
      totalRevenue: revenueAgg[0]?.total ?? 0,
      pendingPayments,
      overduePayments,
      recentPayments: recentPayments.map((p) => ({
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
