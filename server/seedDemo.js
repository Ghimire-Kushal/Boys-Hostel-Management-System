require('dotenv').config()
const mongoose = require('mongoose')
const Tenant = require('./models/Tenant')
const Room = require('./models/Room')
const Payment = require('./models/Payment')
const FoodMenu = require('./models/FoodMenu')
const FoodComplaint = require('./models/FoodComplaint')

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected')

  // Get or create demo students
  let students = await Tenant.find({ isActive: true })
  const room = await Room.findOne()

  if (!room) { console.log('No rooms found. Add a room first.'); process.exit(1) }

  const demoStudents = [
    { name: 'Ram Sharma',    phone: '9841001001', address: 'Kathmandu', collegeName: 'Tribhuvan University',        guardianName: 'Hari Sharma',   guardianPhone: '9841001002', joinDate: new Date('2026-01-10'), isActive: true, room: room._id, bedNumber: 1, paymentStatus: 'paid' },
    { name: 'Sita Gurung',   phone: '9841002001', address: 'Pokhara',   collegeName: 'Pokhara University',          guardianName: 'Dil Gurung',    guardianPhone: '9841002002', joinDate: new Date('2026-02-01'), isActive: true, room: room._id, bedNumber: 2, paymentStatus: 'pending' },
    { name: 'Nabin Thapa',   phone: '9841003001', address: 'Chitwan',   collegeName: 'Purbanchal University',       guardianName: 'Binod Thapa',   guardianPhone: '9841003002', joinDate: new Date('2026-02-15'), isActive: true, room: room._id, bedNumber: 3, paymentStatus: 'overdue' },
    { name: 'Aarti Poudel',  phone: '9841004001', address: 'Bhaktapur', collegeName: 'Kathmandu University',        guardianName: 'Rajan Poudel',  guardianPhone: '9841004002', joinDate: new Date('2026-03-05'), isActive: true, room: room._id, bedNumber: 4, paymentStatus: 'paid' },
    { name: 'Bikram Rai',    phone: '9841005001', address: 'Dharan',    collegeName: 'Far Western University',      guardianName: 'Kiran Rai',     guardianPhone: '9841005002', joinDate: new Date('2026-03-20'), isActive: true, room: room._id, paymentStatus: 'pending' },
  ]

  for (const s of demoStudents) {
    const exists = await Tenant.findOne({ phone: s.phone })
    if (!exists) {
      await Tenant.create(s)
      console.log('Created student:', s.name)
    }
  }

  students = await Tenant.find({ isActive: true })

  // ── PAYMENTS (Section 6) ─────────────────────────────────────────────────────
  await Payment.deleteMany({})

  const paymentData = []
  const rentAmount = room.rent || 8000

  for (const student of students) {
    // 3 months of history
    for (const [i, month] of ['February', 'March', 'April'].entries()) {
      paymentData.push({
        tenant: student._id,
        amount: rentAmount + (Math.floor(Math.random() * 3) * 500),
        month,
        year: 2026,
        method: ['Cash', 'eSewa', 'Khalti', 'Online Transfer', 'Bank Deposit'][Math.floor(Math.random() * 5)],
        status: 'paid',
        note: i === 0 ? 'Advance payment' : '',
        paidAt: new Date(`2026-0${i + 2}-${5 + Math.floor(Math.random() * 10)}`),
      })
    }
    // Current month - mixed statuses
    paymentData.push({
      tenant: student._id,
      amount: rentAmount,
      month: 'May',
      year: 2026,
      method: 'Cash',
      status: student.paymentStatus === 'paid' ? 'paid' : student.paymentStatus === 'overdue' ? 'overdue' : 'pending',
      paidAt: student.paymentStatus === 'paid' ? new Date('2026-05-05') : null,
    })
  }

  await Payment.insertMany(paymentData)
  console.log(`Created ${paymentData.length} payment records`)

  // ── FOOD MENUS (Section 5) ───────────────────────────────────────────────────
  await FoodMenu.deleteMany({})

  const menuTemplates = [
    { breakfast: 'Sel Roti, Tea, Boiled Egg',         lunch: 'Dal Bhat, Aloo Tarkari, Salad',     dinner: 'Chapati, Chicken Curry, Rice',      snacks: 'Biscuits, Tea' },
    { breakfast: 'Poha, Milk Tea',                    lunch: 'Rice, Dal, Mixed Vegetable',         dinner: 'Rice, Fish Curry, Lentil Soup',      snacks: 'Samosa, Tea' },
    { breakfast: 'Bread, Butter, Boiled Egg, Tea',    lunch: 'Pulao, Raita, Papad',                dinner: 'Dal Bhat, Mutton Curry',             snacks: 'Fruit, Juice' },
    { breakfast: 'Chura, Dahi, Banana, Tea',          lunch: 'Rice, Dal Fry, Palak Paneer',        dinner: 'Chapati, Dal, Potato Curry',         snacks: 'Cake, Tea' },
    { breakfast: 'Atta Noodles, Tea, Egg',            lunch: 'Fried Rice, Manchurian, Soup',       dinner: 'Rice, Chicken Curry, Daal',          snacks: 'Momo, Tea' },
    { breakfast: 'Idli, Sambhar, Tea',                lunch: 'Dal Bhat, Aloo Gobi, Pickle',        dinner: 'Roti, Mixed Dal, Egg Bhurji',        snacks: 'Popcorn, Tea' },
    { breakfast: 'Paratha, Curd, Tea',                lunch: 'Rice, Chana Dal, Pumpkin Curry',     dinner: 'Rice, Pork Curry, Daal',             snacks: 'Noodles, Tea' },
  ]

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const menus = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    menus.push({ date: d, ...menuTemplates[6 - i] })
  }
  await FoodMenu.insertMany(menus)
  console.log(`Created ${menus.length} food menu entries`)

  // ── FOOD COMPLAINTS (Section 5) ──────────────────────────────────────────────
  await FoodComplaint.deleteMany({})

  const complaints = [
    { student: students[0]?._id, mealType: 'Lunch',     rating: 2, complaint: 'Dal was too salty today. Could not eat properly.',           status: 'resolved', adminResponse: 'Thank you for the feedback. We have spoken with the cook and will ensure better quality.',  date: new Date('2026-05-24') },
    { student: students[1]?._id, mealType: 'Breakfast',  rating: 3, complaint: 'Tea was cold and sel roti was hard.',                         status: 'resolved', adminResponse: 'We apologize for the inconvenience. Breakfast will be served fresh starting tomorrow.', date: new Date('2026-05-25') },
    { student: students[2]?._id, mealType: 'Dinner',     rating: 1, complaint: 'Chapati was undercooked and chicken curry had no taste.',     status: 'pending',  adminResponse: '', date: new Date('2026-05-26') },
    { student: students[3]?._id, mealType: 'Lunch',     rating: 2, complaint: 'Rice was not properly cooked, still hard.',                   status: 'pending',  adminResponse: '', date: new Date('2026-05-26') },
    { student: students[0]?._id, mealType: 'Snacks',    rating: 4, complaint: 'Samosa was good but tea was too sweet.',                     status: 'resolved', adminResponse: 'We will reduce sugar in tea. Glad you liked the samosa!', date: new Date('2026-05-22') },
    { studentName: 'Walk-in Guest', mealType: 'Dinner', rating: 3, complaint: 'Serving portion was too small for dinner.',                  status: 'pending',  adminResponse: '', date: new Date('2026-05-27') },
  ]

  await FoodComplaint.insertMany(complaints.filter(c => c.student || c.studentName))
  console.log(`Created ${complaints.length} food complaint records`)

  console.log('\nDemo data seeded successfully!')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
