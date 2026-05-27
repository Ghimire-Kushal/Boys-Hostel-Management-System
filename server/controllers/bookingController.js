const Booking = require('../models/Booking')
const Room = require('../models/Room')
const Tenant = require('../models/Tenant')

const updateRoomStatus = async (roomId) => {
  const room = await Room.findById(roomId)
  if (!room) return
  const occupied = await Booking.countDocuments({ room: roomId, status: 'active' })
  let status = 'vacant'
  if (occupied >= room.totalBeds) status = 'occupied'
  else if (occupied > 0) status = 'partial'
  await Room.findByIdAndUpdate(roomId, { status })
}

exports.getBookings = async (req, res) => {
  try {
    const { status, room } = req.query
    const filter = {}
    if (status) filter.status = status
    if (room) filter.room = room
    const bookings = await Booking.find(filter)
      .populate('student', 'name phone collegeName paymentStatus')
      .populate('room', 'roomNumber type rent facilities photos')
      .sort({ createdAt: -1 })
    res.json({ bookings })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.createBooking = async (req, res) => {
  try {
    const { student, room, bedNumber, startDate, notes } = req.body

    const conflict = await Booking.findOne({ room, bedNumber, status: 'active' })
    if (conflict) return res.status(400).json({ message: `Bed ${bedNumber} is already occupied` })

    const roomDoc = await Room.findById(room)
    if (!roomDoc) return res.status(404).json({ message: 'Room not found' })
    if (bedNumber < 1 || bedNumber > roomDoc.totalBeds)
      return res.status(400).json({ message: `Invalid bed number for this room` })

    const booking = await Booking.create({ student, room, bedNumber, startDate, notes })

    await Tenant.findByIdAndUpdate(student, { room, bedNumber })
    await updateRoomStatus(room)

    await booking.populate([
      { path: 'student', select: 'name phone collegeName' },
      { path: 'room', select: 'roomNumber type rent' },
    ])
    res.status(201).json(booking)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', endDate: new Date() },
      { new: true }
    )
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    await Tenant.findByIdAndUpdate(booking.student, { room: null, bedNumber: null })
    await updateRoomStatus(booking.room)

    res.json(booking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getAvailableBeds = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
    if (!room) return res.status(404).json({ message: 'Room not found' })

    const bookedBeds = await Booking.distinct('bedNumber', { room: room._id, status: 'active' })
    const allBeds = Array.from({ length: room.totalBeds }, (_, i) => i + 1)
    const availableBeds = allBeds.filter((b) => !bookedBeds.includes(b))

    res.json({ totalBeds: room.totalBeds, availableBeds, bookedBeds })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
