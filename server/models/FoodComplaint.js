const mongoose = require('mongoose')

const foodComplaintSchema = new mongoose.Schema({
  student:       { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  studentName:   { type: String },
  mealType:      { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'], required: true },
  complaint:     { type: String, required: true },
  rating:        { type: Number, min: 1, max: 5 },
  date:          { type: Date, default: Date.now },
  status:        { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  adminResponse: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('FoodComplaint', foodComplaintSchema)
