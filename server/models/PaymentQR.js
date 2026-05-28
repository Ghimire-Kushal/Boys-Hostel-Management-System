const mongoose = require('mongoose')

const paymentQRSchema = new mongoose.Schema({
  wallet:      { type: String, required: true, unique: true, trim: true },
  accountName: { type: String, trim: true },
  accountNumber: { type: String, trim: true },
  qrImage:     { type: String, required: true },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('PaymentQR', paymentQRSchema)
