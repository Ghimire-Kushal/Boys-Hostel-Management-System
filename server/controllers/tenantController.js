const Tenant = require('../models/Tenant')
const Room = require('../models/Room')

exports.getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({ isActive: true })
      .populate('room', 'roomNumber type rent')
      .sort({ name: 1 })
    res.json({ tenants })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate('room')
    if (!tenant) return res.status(404).json({ message: 'Student not found' })
    res.json(tenant)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.createTenant = async (req, res) => {
  try {
    const tenant = await Tenant.create(req.body)
    await tenant.populate('room', 'roomNumber type rent')
    res.status(201).json(tenant)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate('room', 'roomNumber type rent')
    if (!tenant) return res.status(404).json({ message: 'Student not found' })
    res.json(tenant)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { isActive: false, leaveDate: new Date() },
      { new: true }
    )
    if (!tenant) return res.status(404).json({ message: 'Student not found' })
    res.json({ message: 'Student removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
