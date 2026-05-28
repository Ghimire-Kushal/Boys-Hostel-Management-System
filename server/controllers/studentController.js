const Payment = require('../models/Payment')
const FoodMenu = require('../models/FoodMenu')
const PaymentQR = require('../models/PaymentQR')

exports.getMe = (req, res) => res.json(req.student)

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ tenant: req.student._id })
      .sort({ year: -1, createdAt: -1 })
      .limit(24)
    res.json({ payments })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getWeekMenu = async (req, res) => {
  try {
    const today = new Date()
    const dow = today.getDay() // 0=Sun
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    const menus = await FoodMenu.find({ date: { $gte: monday, $lte: sunday } }).sort({ date: 1 })
    res.json({ menus, weekStart: monday, weekEnd: sunday })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getPaymentOptions = async (req, res) => {
  try {
    const qrs = await PaymentQR.find({ isActive: true }).sort({ wallet: 1 })
    res.json({ qrs })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
