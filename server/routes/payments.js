const router = require('express').Router()
const { getPayments, createPayment, updatePayment, deletePayment, getStats } = require('../controllers/paymentController')
const protect = require('../middleware/auth')

router.use(protect)
router.get('/stats', getStats)
router.route('/').get(getPayments).post(createPayment)
router.route('/:id').put(updatePayment).delete(deletePayment)

module.exports = router
