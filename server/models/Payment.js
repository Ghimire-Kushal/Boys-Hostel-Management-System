const mongoose = require('mongoose')

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const paymentSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  amount: { type: Number, required: true, min: 0 },
  month:  { type: String, enum: MONTHS, required: true },
  year:   { type: Number, required: true },
  status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'paid' },
  method: { type: String, enum: ['Cash', 'Online Transfer', 'eSewa', 'Khalti', 'Bank Deposit'], default: 'Cash' },
  note:   { type: String },
  paidAt: { type: Date },
}, { timestamps: true })

paymentSchema.pre('save', function (next) {
  if (this.status === 'paid' && !this.paidAt) this.paidAt = new Date()
  next()
})

module.exports = mongoose.model('Payment', paymentSchema)
