const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
  name:        { type: String, trim: true },  // optional — null means anonymous
  isAnonymous: { type: Boolean, default: false },
  category:    { type: String, enum: ['Food', 'Room', 'Staff', 'Facilities', 'Payment', 'General'], default: 'General' },
  message:     { type: String, required: true, trim: true },
  rating:      { type: Number, min: 1, max: 5 },
  status:      { type: String, enum: ['new', 'read', 'addressed'], default: 'new' },
  adminReply:  { type: String },
}, { timestamps: true })

module.exports = mongoose.model('Feedback', feedbackSchema)
