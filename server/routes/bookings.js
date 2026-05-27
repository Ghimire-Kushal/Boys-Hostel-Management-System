const router = require('express').Router()
const ctrl = require('../controllers/bookingController')
const protect = require('../middleware/auth')

router.use(protect)
router.route('/').get(ctrl.getBookings).post(ctrl.createBooking)
router.get('/available-beds/:roomId', ctrl.getAvailableBeds)
router.put('/:id/cancel', ctrl.cancelBooking)

module.exports = router
