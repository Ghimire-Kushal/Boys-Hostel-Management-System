const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Tenant = require('../models/Tenant')

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' })

    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' })

    res.json({ token: signToken({ id: user._id, role: 'admin' }), user: { ...user.toObject(), role: 'admin' } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.studentLogin = async (req, res) => {
  try {
    const { phone, password } = req.body
    if (!phone || !password)
      return res.status(400).json({ message: 'Phone and password are required' })

    const tenant = await Tenant.findOne({ phone, isActive: true })
      .select('+password')
      .populate('room', 'roomNumber type rent')
    if (!tenant) return res.status(401).json({ message: 'Invalid phone or password' })

    let valid = false
    if (tenant.password) {
      valid = await bcrypt.compare(password, tenant.password)
    } else {
      // Legacy tenant: no password set — phone IS the password, auto-migrate
      valid = password === tenant.phone
      if (valid) {
        tenant.password = await bcrypt.hash(tenant.phone, 10)
        await tenant.save()
      }
    }

    if (!valid) return res.status(401).json({ message: 'Invalid phone or password' })

    const token = signToken({ id: tenant._id, role: 'student' })
    const data = tenant.toObject()
    delete data.password
    res.json({ token, user: { ...data, role: 'student' } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getProfile = async (req, res) => {
  res.json(req.user)
}
