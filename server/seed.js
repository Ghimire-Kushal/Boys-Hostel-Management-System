require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL })
  if (existing) {
    console.log('Admin already exists:', existing.email)
    process.exit(0)
  }

  await User.create({
    name: 'Admin',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: 'admin',
  })

  console.log('Admin user created:', process.env.ADMIN_EMAIL)
  process.exit(0)
}

seed().catch((err) => { console.error(err); process.exit(1) })
