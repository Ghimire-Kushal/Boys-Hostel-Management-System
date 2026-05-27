const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  room:      { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  bedNumber: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate:   { type: Date },
  status:    { type: String, enum: ['active', 'cancelled', 'completed'], default: 'active' },
  notes:     { type: String },
}, { timestamps: true })

bookingSchema.index({ room: 1, bedNumber: 1, status: 1 })

module.exports = mongoose.model('Booking', bookingSchema)
