const Room = require('../models/Room')
const Tenant = require('../models/Tenant')
const Payment = require('../models/Payment')
const Booking = require('../models/Booking')
const FoodComplaint = require('../models/FoodComplaint')

exports.getStats = async (req, res) => {
  try {
    const [
      totalRooms, occupiedRooms, vacantRooms,
      totalStudents,
      revenueAgg, pendingPayments, overduePayments,
      activeBookings, pendingComplaints,
      recentPayments,
    ] = await Promise.all([
      Room.countDocuments(),
      Room.countDocuments({ status: 'occupied' }),
      Room.countDocuments({ status: 'vacant' }),
      Tenant.countDocuments({ isActive: true }),
      Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'overdue' }),
      Booking.countDocuments({ status: 'active' }),
      FoodComplaint.countDocuments({ status: 'pending' }),
      Payment.find().sort({ createdAt: -1 }).limit(5)
        .populate({ path: 'tenant', select: 'name room', populate: { path: 'room', select: 'roomNumber' } }),
    ])

    res.json({
      totalRooms,
      occupiedRooms,
      vacantRooms,
      totalStudents,
      totalRevenue: revenueAgg[0]?.total ?? 0,
      pendingPayments,
      overduePayments,
      activeBookings,
      pendingComplaints,
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
