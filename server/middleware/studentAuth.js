const jwt = require('jsonwebtoken')
const Tenant = require('../models/Tenant')

module.exports = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' })
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET)
    if (decoded.role !== 'student')
      return res.status(403).json({ message: 'Student access only' })
    req.student = await Tenant.findById(decoded.id).populate('room', 'roomNumber type rent')
    if (!req.student) return res.status(401).json({ message: 'Student not found' })
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}
