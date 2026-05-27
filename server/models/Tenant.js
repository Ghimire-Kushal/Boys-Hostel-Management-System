const mongoose = require('mongoose')

const tenantSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  email:            { type: String, lowercase: true, trim: true },
  phone:            { type: String, required: true },
  address:          { type: String },
  room:             { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  joinDate:         { type: Date, required: true },
  leaveDate:        { type: Date },
  isActive:         { type: Boolean, default: true },
  emergencyContact: { type: String },
  emergencyPhone:   { type: String },
  photo:            { type: String },
}, { timestamps: true })

module.exports = mongoose.model('Tenant', tenantSchema)
