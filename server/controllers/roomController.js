const Room = require('../models/Room')
const Booking = require('../models/Booking')
const { uploadToCloudinary } = require('../middleware/upload')

exports.getRooms = async (req, res) => {
  try {
    const { status, type } = req.query
    const filter = {}
    if (status) filter.status = status
    if (type) filter.type = type
    const rooms = await Room.find(filter).sort({ roomNumber: 1 })

    const roomsWithBeds = await Promise.all(rooms.map(async (room) => {
      const occupiedBeds = await Booking.countDocuments({ room: room._id, status: 'active' })
      const obj = room.toObject()
      obj.occupiedBeds = occupiedBeds
      obj.availableBeds = (room.totalBeds || 0) - occupiedBeds
      return obj
    }))

    res.json({ rooms: roomsWithBeds })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
    if (!room) return res.status(404).json({ message: 'Room not found' })

    const occupiedBeds = await Booking.countDocuments({ room: room._id, status: 'active' })
    const bookedBedNumbers = await Booking.distinct('bedNumber', { room: room._id, status: 'active' })

    const obj = room.toObject()
    obj.occupiedBeds = occupiedBeds
    obj.availableBeds = (room.totalBeds || 0) - occupiedBeds
    obj.bookedBedNumbers = bookedBedNumbers

    res.json(obj)
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
    const active = await Booking.countDocuments({ room: req.params.id, status: 'active' })
    if (active > 0)
      return res.status(400).json({ message: 'Cannot delete room with active bookings' })
    const room = await Room.findByIdAndDelete(req.params.id)
    if (!room) return res.status(404).json({ message: 'Room not found' })
    res.json({ message: 'Room deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.uploadPhotos = async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: 'No files uploaded' })

    const urls = await Promise.all(
      req.files.map((f) => uploadToCloudinary(f.buffer, f.mimetype, 'hostelease/rooms')
        .then((r) => r.secure_url))
    )

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $push: { photos: { $each: urls } } },
      { new: true }
    )
    if (!room) return res.status(404).json({ message: 'Room not found' })
    res.json({ photos: room.photos })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.deletePhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $pull: { photos: photoUrl } },
      { new: true }
    )
    if (!room) return res.status(404).json({ message: 'Room not found' })
    res.json({ photos: room.photos })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
