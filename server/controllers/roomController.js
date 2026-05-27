const Room = require('../models/Room')

exports.getRooms = async (req, res) => {
  try {
    const { status, type } = req.query
    const filter = {}
    if (status) filter.status = status
    if (type) filter.type = type
    const rooms = await Room.find(filter).sort({ roomNumber: 1 })
    res.json({ rooms })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
    if (!room) return res.status(404).json({ message: 'Room not found' })
    res.json(room)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body)
    res.status(201).json(room)
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Room number already exists' })
    res.status(400).json({ message: err.message })
  }
}

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!room) return res.status(404).json({ message: 'Room not found' })
    res.json(room)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id)
    if (!room) return res.status(404).json({ message: 'Room not found' })
    res.json({ message: 'Room deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
