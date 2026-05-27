const mongoose = require('mongoose')

const FACILITIES = ['Fan', 'Attached Bathroom', 'Wi-Fi', 'Study Table', 'Cupboard', 'Geyser', 'TV', 'AC']
const ROOM_TYPES = ['1 Seater', '2 Seater', '3 Seater', '4 Seater']

const BEDS_BY_TYPE = { '1 Seater': 1, '2 Seater': 2, '3 Seater': 3, '4 Seater': 4 }

const roomSchema = new mongoose.Schema({
  roomNumber:  { type: String, required: true, unique: true, trim: true },
  type:        { type: String, enum: ROOM_TYPES, required: true },
  totalBeds:   { type: Number },
  rent:        { type: Number, required: true, min: 0 },
  floor:       { type: Number, default: 0 },
  status:      { type: String, enum: ['vacant', 'occupied', 'partial', 'maintenance'], default: 'vacant' },
  facilities:  [{ type: String, enum: FACILITIES }],
  photos:      [{ type: String }],
  description: { type: String },
}, { timestamps: true })

roomSchema.pre('save', function (next) {
  if (this.isModified('type')) {
    this.totalBeds = BEDS_BY_TYPE[this.type] ?? 1
  }
  next()
})

roomSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate()
  if (update.type) {
    update.totalBeds = BEDS_BY_TYPE[update.type] ?? 1
  }
  next()
})

module.exports = mongoose.model('Room', roomSchema)
module.exports.FACILITIES = FACILITIES
module.exports.ROOM_TYPES = ROOM_TYPES
