import api from './api'

export const getBookings = (params) => api.get('/bookings', { params })
export const createBooking = (data) => api.post('/bookings', data)
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`)
export const getAvailableBeds = (roomId) => api.get(`/bookings/available-beds/${roomId}`)
