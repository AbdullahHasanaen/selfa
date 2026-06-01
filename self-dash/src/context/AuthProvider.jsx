import { useState, useCallback } from 'react'
import { getUser, setAuth, clearAuth, isAuthenticated } from '../utils/auth'
import { login as loginApi } from '../api'
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
      const message =
        err.response?.data?.message || err.response?.data?.error || 'فشل تسجيل الدخول'
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
