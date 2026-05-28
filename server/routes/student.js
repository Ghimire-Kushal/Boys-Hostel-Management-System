const router = require('express').Router()
const ctrl = require('../controllers/studentController')
const protectStudent = require('../middleware/studentAuth')

router.use(protectStudent)
router.get('/me', ctrl.getMe)
router.get('/payments', ctrl.getMyPayments)
router.get('/food/week', ctrl.getWeekMenu)
router.get('/payment-options', ctrl.getPaymentOptions)

module.exports = router
