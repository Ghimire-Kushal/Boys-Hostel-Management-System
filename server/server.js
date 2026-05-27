require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

connectDB()

const app = express()

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())

app.use('/api/auth',      require('./routes/auth'))
app.use('/api/rooms',     require('./routes/rooms'))
app.use('/api/tenants',   require('./routes/tenants'))
app.use('/api/bookings',  require('./routes/bookings'))
app.use('/api/payments',  require('./routes/payments'))
app.use('/api/food',      require('./routes/food'))
app.use('/api/dashboard', require('./routes/dashboard'))

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ message: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
