import axios from 'axios'
import { getToken, clearAuth } from '../utils/auth'

const client = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? '' : 'https://qi-salfa.onrender.com'),
  headers: { 'Content-Type': 'application/json' },
  timeout: 60_000,
})

client.interceptors.request.use((config) => {
  const token = getToken()
  const isLoginRequest = config.url?.includes('/auth/admin/login')
  if (token && !isLoginRequest) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/admin/login')
    if (error.response?.status === 401 && !isLoginRequest) {
      clearAuth()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default client
