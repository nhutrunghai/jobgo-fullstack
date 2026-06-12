import apiClient from './axiosClient.js'

const UNREAD_COUNT_EVENT = 'mycoder:notifications-unread-count'

export async function getUserNotifications(params = {}) {
  const response = await apiClient.get('/user/notifications', { auth: true, params })
  return response.data?.data || response.data || { notifications: [], pagination: { page: 1, limit: 10, total: 0, total_pages: 1 } }
}

export async function getUserNotificationUnreadCount() {
  const response = await apiClient.get('/user/notifications/unread-count', { auth: true })
  const data = response.data?.data || response.data || {}
  return Number(data.unread_count || 0)
}

export async function markUserNotificationAsRead(notificationId) {
  const response = await apiClient.patch(`/user/notifications/${encodeURIComponent(notificationId)}/read`, {}, { auth: true })
  return response.data?.data?.notification || response.data?.notification || null
}

export async function markAllUserNotificationsAsRead() {
  const response = await apiClient.patch('/user/notifications/read-all', {}, { auth: true })
  return response.data?.data || response.data || { modified_count: 0 }
}

export function emitUnreadNotificationCount(count) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(UNREAD_COUNT_EVENT, {
      detail: { count: Number(count || 0) },
    })
  )
}

export function subscribeUnreadNotificationCount(listener) {
  if (typeof window === 'undefined') return () => {}
  const handler = (event) => {
    listener(Number(event.detail?.count || 0))
  }
  window.addEventListener(UNREAD_COUNT_EVENT, handler)
  return () => window.removeEventListener(UNREAD_COUNT_EVENT, handler)
}
