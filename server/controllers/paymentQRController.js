const PaymentQR = require('../models/PaymentQR')
const { uploadToCloudinary } = require('../middleware/upload')

exports.getQRCodes = async (req, res) => {
  try {
    const qrs = await PaymentQR.find().sort({ wallet: 1 })
    res.json({ qrs })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getActiveQRs = async (req, res) => {
  try {
    const qrs = await PaymentQR.find({ isActive: true }).sort({ wallet: 1 })
    res.json({ qrs })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.upsertQR = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'QR image is required' })

    const { wallet, accountName, accountNumber } = req.body
    if (!wallet) return res.status(400).json({ message: 'Wallet name is required' })

    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype, 'hostelease/qrcodes')

    const qr = await PaymentQR.findOneAndUpdate(
      { wallet },
      { wallet, accountName, accountNumber, qrImage: result.secure_url, isActive: true },
      { upsert: true, new: true, runValidators: true }
    )
    res.json(qr)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.deleteQR = async (req, res) => {
  try {
    const qr = await PaymentQR.findByIdAndDelete(req.params.id)
    if (!qr) return res.status(404).json({ message: 'QR code not found' })
    res.json({ message: 'QR code deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.toggleQR = async (req, res) => {
  try {
    const qr = await PaymentQR.findById(req.params.id)
    if (!qr) return res.status(404).json({ message: 'QR code not found' })
    qr.isActive = !qr.isActive
    await qr.save()
    res.json(qr)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
