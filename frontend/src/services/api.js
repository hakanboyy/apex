import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3001/api' })

export const getBacklog = (params) => api.get('/backlog', { params })
export const getSprints = () => api.get('/sprints')
export const getTeam = () => api.get('/team')
export const getDashboard = () => api.get('/ai/dashboard')
export const predictSizing = (taskId) => api.post('/ai/predict-sizing', { taskId })
export const decomposeTask = (taskId) => api.post('/ai/decompose', { taskId })
export const generateSprintReview = (sprintId) => api.post('/ai/sprint-review', { sprintId })
export const suggestUnblock = (taskId, blockReason) => api.post('/ai/suggest-unblock', { taskId, blockReason })
