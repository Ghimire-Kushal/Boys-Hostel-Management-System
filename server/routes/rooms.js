const router = require('express').Router()
const ctrl = require('../controllers/roomController')
const protect = require('../middleware/auth')
const { upload } = require('../middleware/upload')

router.use(protect)
router.route('/').get(ctrl.getRooms).post(ctrl.createRoom)
router.route('/:id').get(ctrl.getRoom).put(ctrl.updateRoom).delete(ctrl.deleteRoom)
router.post('/:id/photos', upload.array('photos', 5), ctrl.uploadPhotos)
router.delete('/:id/photos', ctrl.deletePhoto)

module.exports = router
