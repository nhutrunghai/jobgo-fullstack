import apiClient from './axiosClient'

const AUTH_STORAGE_KEYS = ['token', 'accessToken', 'refreshToken', 'user', 'authUser', 'isLoggedIn']

function getStorage(remember) {
  return remember ? window.localStorage : window.sessionStorage
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return

  AUTH_STORAGE_KEYS.forEach((key) => {
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  })
}

export function saveAuthSession(authData, { remember = true } = {}) {
  if (typeof window === 'undefined') return

  const storage = getStorage(remember)
  const accessToken = authData?.AccessToken || authData?.accessToken || ''
  const refreshToken = authData?.RefreshToken || authData?.refreshToken || ''
  const user = {
    id: authData?.id || authData?.userId || '',
  }

  clearAuthSession()

  storage.setItem('accessToken', accessToken)
  storage.setItem('refreshToken', refreshToken)
  storage.setItem('token', accessToken)
  storage.setItem('authUser', JSON.stringify(user))
  storage.setItem('user', JSON.stringify(user))
  storage.setItem('isLoggedIn', 'true')
}

export async function login(payload, options = {}) {
  const response = await apiClient.post('/auth/login', {
    email: payload.email,
    password: payload.password,
  }, { auth: false })
  const authData = response?.data?.data

  if (!authData?.AccessToken || !authData?.RefreshToken) {
    throw new Error('Phản hồi đăng nhập không hợp lệ.')
  }

  saveAuthSession(authData, options)

  return {
    id: authData.id,
    accessToken: authData.AccessToken,
    refreshToken: authData.RefreshToken,
    message: response?.data?.message || 'Đăng nhập thành công.',
  }
}

export async function register(payload, options = {}) {
  const response = await apiClient.post('/auth/register', {
    fullName: payload.fullName,
    email: payload.email,
    password: payload.password,
    confirmPassword: payload.confirmPassword,
  }, { auth: false })
  const authData = response?.data?.data

  if (!authData?.AccessToken || !authData?.RefreshToken) {
    throw new Error('Phản hồi đăng ký không hợp lệ.')
  }

  saveAuthSession(authData, options)

  return {
    id: authData.id,
    accessToken: authData.AccessToken,
    refreshToken: authData.RefreshToken,
    message: response?.data?.message || 'Đăng ký thành công.',
  }
}

export async function forgotPassword(payload) {
  const response = await apiClient.post('/auth/forgot-password', {
    email: payload.email,
  }, { auth: false })

  return {
    message: response?.data?.message || 'Đã gửi email đặt lại mật khẩu nếu email tồn tại trong hệ thống.',
  }
}

export async function resetPassword(payload) {
  const response = await apiClient.post('/auth/reset-password', {
    password: payload.password,
    confirmPassword: payload.confirmPassword,
    forgot_password_token: payload.forgotPasswordToken,
  }, { auth: false })

  return {
    message: response?.data?.message || 'Đặt lại mật khẩu thành công.',
  }
}

export async function verifyEmail(payload, options = {}) {
  const response = await apiClient.post('/auth/verify-email', {
    email_verify_token: payload.emailVerifyToken,
  }, { auth: false })
  const authData = response?.data?.data

  if (authData?.AccessToken && authData?.RefreshToken) {
    saveAuthSession(authData, options)
  }

  return {
    id: authData?.id,
    accessToken: authData?.AccessToken,
    refreshToken: authData?.RefreshToken,
    message: response?.data?.message || 'Xác minh email thành công.',
  }
}
