import api from './api'

export const getMe = () => api.get('/student/me')
export const getMyPayments = () => api.get('/student/payments')
export const getWeekMenu = () => api.get('/student/food/week')
export const getPaymentOptions = () => api.get('/student/payment-options')
