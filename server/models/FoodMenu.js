const mongoose = require('mongoose')

const foodMenuSchema = new mongoose.Schema({
  date:      { type: Date, required: true, unique: true },
  breakfast: { type: String },
  lunch:     { type: String },
  dinner:    { type: String },
  snacks:    { type: String },
}, { timestamps: true })

module.exports = mongoose.model('FoodMenu', foodMenuSchema)
