import axios from 'axios'

// Separate instance — no auth token, no 401 redirect
const publicApi = axios.create({ baseURL: '/api' })

export const getPublicWeekMenu = () => publicApi.get('/food/public/week')
export const getPublicQRCodes  = () => publicApi.get('/payment-qr/public')
