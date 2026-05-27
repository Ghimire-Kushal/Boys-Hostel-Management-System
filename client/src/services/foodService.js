import api from './api'

export const getMenus = () => api.get('/food/menu')
export const getTodayMenu = () => api.get('/food/menu/today')
export const upsertMenu = (data) => api.post('/food/menu', data)
export const deleteMenu = (id) => api.delete(`/food/menu/${id}`)

export const getComplaints = (params) => api.get('/food/complaints', { params })
export const createComplaint = (data) => api.post('/food/complaints', data)
export const resolveComplaint = (id, data) => api.put(`/food/complaints/${id}/resolve`, data)
export const deleteComplaint = (id) => api.delete(`/food/complaints/${id}`)
