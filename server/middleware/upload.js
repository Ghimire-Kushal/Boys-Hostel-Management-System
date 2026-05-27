const multer = require('multer')
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'), false)
  },
})

const uploadToCloudinary = async (buffer, mimetype, folder = 'hostelease') => {
  const b64 = Buffer.from(buffer).toString('base64')
  const dataURI = `data:${mimetype};base64,${b64}`
  return cloudinary.uploader.upload(dataURI, { folder, resource_type: 'image' })
}

module.exports = { upload, uploadToCloudinary }
