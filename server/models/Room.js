const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
  roomNumber:  { type: String, required: true, unique: true, trim: true },
  type:        { type: String, enum: ['Single', 'Double', 'Triple', 'Quad'], required: true },
  rent:        { type: Number, required: true, min: 0 },
  floor:       { type: Number, default: 0 },
  status:      { type: String, enum: ['vacant', 'occupied', 'maintenance'], default: 'vacant' },
  amenities:   [{ type: String }],
  description: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('Room', roomSchema)
