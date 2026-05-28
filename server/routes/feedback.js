const router = require('express').Router()
const ctrl = require('../controllers/feedbackController')
const protect = require('../middleware/auth')

// Public — no auth required
router.post('/', ctrl.submitFeedback)

// Admin only
router.get('/', protect, ctrl.getFeedbacks)
router.patch('/:id', protect, ctrl.updateFeedbackStatus)
router.delete('/:id', protect, ctrl.deleteFeedback)

module.exports = router
