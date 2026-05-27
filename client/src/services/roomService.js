import api from './api'

export const getRooms = (params) => api.get('/rooms', { params })
export const getRoom = (id) => api.get(`/rooms/${id}`)
export const createRoom = (data) => api.post('/rooms', data)
export const updateRoom = (id, data) => api.put(`/rooms/${id}`, data)
export const deleteRoom = (id) => api.delete(`/rooms/${id}`)
export const uploadRoomPhotos = (id, formData) =>
  api.post(`/rooms/${id}/photos`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteRoomPhoto = (id, photoUrl) =>
  api.delete(`/rooms/${id}/photos`, { data: { photoUrl } })
