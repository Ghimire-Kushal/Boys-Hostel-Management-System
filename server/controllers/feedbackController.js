const Feedback = require('../models/Feedback')

// Public — anyone can submit
exports.submitFeedback = async (req, res) => {
  try {
    const { name, isAnonymous, category, message, rating } = req.body
    if (!message?.trim()) return res.status(400).json({ message: 'Feedback message is required' })
    const feedback = await Feedback.create({
      name: isAnonymous ? null : (name?.trim() || null),
      isAnonymous: !!isAnonymous,
      category,
      message,
      rating,
    })
    res.status(201).json({ message: 'Feedback submitted. Thank you!', id: feedback._id })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Admin only
exports.getFeedbacks = async (req, res) => {
  try {
    const { status, category } = req.query
    const filter = {}
    if (status) filter.status = status
    if (category) filter.category = category
    const feedbacks = await Feedback.find(filter).sort({ createdAt: -1 })
    res.json({ feedbacks })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { status, adminReply } = req.body
    const fb = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status, adminReply },
      { new: true, runValidators: true }
    )
    if (!fb) return res.status(404).json({ message: 'Feedback not found' })
    res.json(fb)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.deleteFeedback = async (req, res) => {
  try {
    const fb = await Feedback.findByIdAndDelete(req.params.id)
    if (!fb) return res.status(404).json({ message: 'Feedback not found' })
    res.json({ message: 'Feedback deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
