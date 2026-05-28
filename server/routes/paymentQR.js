const router = require('express').Router()
const ctrl = require('../controllers/paymentQRController')
const protect = require('../middleware/auth')
const { upload } = require('../middleware/upload')

// Public — students view active QRs without login
router.get('/public', ctrl.getActiveQRs)

router.use(protect)
router.get('/', ctrl.getQRCodes)
router.post('/', upload.single('qrImage'), ctrl.upsertQR)
router.delete('/:id', ctrl.deleteQR)
router.patch('/:id/toggle', ctrl.toggleQR)

module.exports = router
