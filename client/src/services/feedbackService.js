import axios from 'axios'
import api from './api'

// Public submit — no auth token, no 401 redirect
const publicApi = axios.create({ baseURL: '/api' })
export const submitFeedback = (data) => publicApi.post('/feedback', data)

// Admin only — uses auth interceptor
export const getFeedbacks = (params) => api.get('/feedback', { params })
export const updateFeedbackStatus = (id, data) => api.patch(`/feedback/${id}`, data)
export const deleteFeedback = (id) => api.delete(`/feedback/${id}`)
