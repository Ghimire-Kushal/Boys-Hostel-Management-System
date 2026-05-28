const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const tenantSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  email:            { type: String, lowercase: true, trim: true },
  phone:            { type: String, required: true },
  address:          { type: String },
  collegeName:      { type: String },
  room:             { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  bedNumber:        { type: Number },
  joinDate:         { type: Date, required: true },
  leaveDate:        { type: Date },
  isActive:         { type: Boolean, default: true },
  guardianName:     { type: String },
  guardianPhone:    { type: String },
  paymentStatus:    { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
  photo:            { type: String },
  password:         { type: String, select: false },
}, { timestamps: true })

// Auto-set password to phone number for new tenants
tenantSchema.pre('save', async function (next) {
  if (this.isNew && !this.password) this.password = this.phone
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

module.exports = mongoose.model('Tenant', tenantSchema)
