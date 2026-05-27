const FoodMenu = require('../models/FoodMenu')
const FoodComplaint = require('../models/FoodComplaint')

exports.getMenus = async (req, res) => {
  try {
    const menus = await FoodMenu.find().sort({ date: -1 }).limit(30)
    res.json({ menus })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getTodayMenu = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const menu = await FoodMenu.findOne({ date: today })
    res.json(menu ?? null)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.upsertMenu = async (req, res) => {
  try {
    const { date, breakfast, lunch, dinner, snacks } = req.body
    const d = new Date(date); d.setHours(0, 0, 0, 0)
    const menu = await FoodMenu.findOneAndUpdate(
      { date: d },
      { breakfast, lunch, dinner, snacks },
      { upsert: true, new: true, runValidators: true }
    )
    res.json(menu)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.deleteMenu = async (req, res) => {
  try {
    await FoodMenu.findByIdAndDelete(req.params.id)
    res.json({ message: 'Menu deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getComplaints = async (req, res) => {
  try {
    const { status } = req.query
    const filter = status ? { status } : {}
    const complaints = await FoodComplaint.find(filter)
      .populate('student', 'name phone')
      .sort({ createdAt: -1 })
    res.json({ complaints })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.createComplaint = async (req, res) => {
  try {
    const complaint = await FoodComplaint.create(req.body)
    await complaint.populate('student', 'name phone')
    res.status(201).json(complaint)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.resolveComplaint = async (req, res) => {
  try {
    const { adminResponse } = req.body
    const complaint = await FoodComplaint.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', adminResponse },
      { new: true }
    ).populate('student', 'name phone')
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })
    res.json(complaint)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.deleteComplaint = async (req, res) => {
  try {
    await FoodComplaint.findByIdAndDelete(req.params.id)
    res.json({ message: 'Complaint deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
