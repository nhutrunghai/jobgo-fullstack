import apiClient from './axiosClient.js'

const TOP_UP_SESSION_KEY = 'wallet_top_up_pending_order'

function unwrapData(response) {
  return response?.data?.data || response?.data || null
}

function normalizeAmount(value) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

export function validateTopUpAmount(value) {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return 'Vui lòng nhập số tiền hợp lệ.'
  }

  if (!Number.isInteger(amount)) {
    return 'Số tiền nạp phải là số nguyên.'
  }

  if (amount < 1000) {
    return 'Số tiền nạp tối thiểu là 1.000 VND.'
  }

  if (amount > 100000000) {
    return 'Số tiền nạp tối đa là 100.000.000 VND.'
  }

  return ''
}

export async function getWallet() {
  const response = await apiClient.get('/wallet')
  const data = unwrapData(response)
  return data?.wallet || null
}

export async function getWalletTransactions({ page = 1, limit = 10 } = {}) {
  const response = await apiClient.get('/wallet/transactions', {
    params: { page, limit },
  })
  const data = unwrapData(response)

  return {
    transactions: Array.isArray(data?.transactions) ? data.transactions : [],
    pagination: data?.pagination || {
      page,
      limit,
      total: 0,
      total_pages: 1,
    },
  }
}

export async function createTopUpOrder(amount) {
  const response = await apiClient.post('/wallet/top-up-orders', {
    amount: normalizeAmount(amount),
  })
  return unwrapData(response)
}

export async function getTopUpOrder(orderCode) {
  const response = await apiClient.get(`/wallet/top-up-orders/${encodeURIComponent(orderCode)}`)
  const data = unwrapData(response)
  return data?.order || null
}

export function readStoredTopUpSession() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(TOP_UP_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function storeTopUpSession(session) {
  if (typeof window === 'undefined') return

  if (!session) {
    window.localStorage.removeItem(TOP_UP_SESSION_KEY)
    return
  }

  window.localStorage.setItem(TOP_UP_SESSION_KEY, JSON.stringify(session))
}

