const router = require('express').Router()
const { getRooms, getRoom, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController')
const protect = require('../middleware/auth')

router.use(protect)
router.route('/').get(getRooms).post(createRoom)
router.route('/:id').get(getRoom).put(updateRoom).delete(deleteRoom)

module.exports = router
