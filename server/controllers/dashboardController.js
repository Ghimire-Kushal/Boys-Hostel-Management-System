const Room = require('../models/Room')
const Tenant = require('../models/Tenant')
const Payment = require('../models/Payment')
const Booking = require('../models/Booking')
const FoodComplaint = require('../models/FoodComplaint')
const Feedback = require('../models/Feedback')

exports.getStats = async (req, res) => {
  try {
    const [
      totalRooms, occupiedRooms, vacantRooms,
      totalStudents,
      revenueAgg, pendingPayments, overduePayments,
      activeBookings, pendingComplaints,
      newFeedback,
      recentPayments,
    ] = await Promise.all([
      Room.countDocuments(),
      Room.countDocuments({ status: { $in: ['occupied', 'partial'] } }),
      Room.countDocuments({ status: 'vacant' }),
      Tenant.countDocuments({ isActive: true }),
      Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'overdue' }),
      Booking.countDocuments({ status: 'active' }),
      FoodComplaint.countDocuments({ status: 'pending' }),
      Feedback.countDocuments({ status: 'new' }),
      Payment.find().sort({ createdAt: -1 }).limit(6)
        .populate({ path: 'tenant', select: 'name room', populate: { path: 'room', select: 'roomNumber' } }),
    ])

    res.json({
      totalRooms, occupiedRooms, vacantRooms, totalStudents,
      totalRevenue: revenueAgg[0]?.total ?? 0,
      pendingPayments, overduePayments,
      activeBookings, pendingComplaints, newFeedback,
      recentPayments: recentPayments.map((p) => ({
        id: p._id,
        tenantName: p.tenant?.name ?? '—',
        room: p.tenant?.room?.roomNumber,
        amount: p.amount,
        month: p.month,
        year: p.year,
        date: new Date(p.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        status: p.status,
      })),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
