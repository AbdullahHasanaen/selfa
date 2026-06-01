import { useState, useCallback } from 'react'
import { getUser, setAuth, clearAuth, isAuthenticated } from '../utils/auth'
import { login as loginApi } from '../api'
import { getApiError } from '../utils/apiError'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser())
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (username, password) => {
    setLoading(true)
    try {
      const { data } = await loginApi(username, password)
      const userData = {
        username: data.username,
        role: data.role,
        expiresAt: data.expiresAt,
      }
      setAuth(data.token, userData)
      setUser(userData)
      return { success: true }
    } catch (err) {
      let message = getApiError(err, '')
      if (!message) {
        if (err.code === 'ECONNABORTED') {
          message = 'انتهت مهلة الاتصال — الخادم قد يكون في وضع السكون، حاول مرة أخرى'
        } else if (err.code === 'ERR_NETWORK') {
          message = 'تعذر الاتصال بالخادم — تحقق من الإنترنت أو أعد المحاولة'
        } else {
          message = 'فشل تسجيل الدخول'
        }
      }
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, isAuthenticated: isAuthenticated() }}
    >
      {children}
    </AuthContext.Provider>
  )
}
