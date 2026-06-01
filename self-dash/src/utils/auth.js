const TOKEN_KEY = 'salfa_token'
const USER_KEY = 'salfa_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated() {
  const token = getToken()
  const user = getUser()
  if (!token || !user) return false
  if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
    clearAuth()
    return false
  }
  return true
}
