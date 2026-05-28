const router = require('express').Router()
const { login, studentLogin, getProfile } = require('../controllers/authController')
const protect = require('../middleware/auth')

router.post('/login', login)
router.post('/student-login', studentLogin)
router.get('/profile', protect, getProfile)

module.exports = router
