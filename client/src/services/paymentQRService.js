import api from './api'

export const getQRCodes = () => api.get('/payment-qr')
export const upsertQR = (formData) =>
  api.post('/payment-qr', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteQR = (id) => api.delete(`/payment-qr/${id}`)
export const toggleQR = (id) => api.patch(`/payment-qr/${id}/toggle`)
