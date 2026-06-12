import apiClient from './axiosClient.js'

const COMPANY_MOCK_URL = '/api/company.json'
const COMPANY_APPS_STORAGE_KEY = 'company_application_status_mock'

async function loadCompanyMock() {
  const response = await fetch(COMPANY_MOCK_URL)
  if (!response.ok) {
    throw new Error('Không thể tải dữ liệu mock company.')
  }
  return response.json()
}

function readStorageJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function writeStorageJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export async function createCompanyJob(payload) {
  const response = await apiClient.post('/company/jobs', payload, { auth: true })
  return response.data
}

export async function updateCompanyJob(jobId, payload) {
  const response = await apiClient.patch(`/company/jobs/${encodeURIComponent(jobId)}`, payload, { auth: true })
  return response.data
}

export async function getCompanyJob(jobId) {
  const response = await apiClient.get(`/company/jobs/${encodeURIComponent(jobId)}`, { auth: true })
  return response.data
}

export async function getCompanyJobs(params = {}) {
  const response = await apiClient.get('/company/jobs', { auth: true, params })
  const data = response.data?.data || {}
  return {
    items: data.jobs || [],
    pagination: data.pagination || {
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 20,
      total: 0,
    },
  }
}

export async function getCompanyPromotionPlans() {
  const response = await apiClient.get('/company/job-promotions/plans', { auth: true })
  return response.data?.data || { plans: [] }
}

export async function purchaseCompanyJobPromotion(jobId, payload) {
  const response = await apiClient.post(`/company/jobs/${encodeURIComponent(jobId)}/promotions/purchase`, payload, { auth: true })
  return response.data?.data || {}
}

export async function getCompanyJobPromotions(params = {}) {
  const response = await apiClient.get('/company/job-promotions', { auth: true, params })
  const data = response.data?.data || {}
  return {
    items: data.promotions || [],
    pagination: data.pagination || {
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 10,
      total: 0,
      total_pages: 1,
    },
  }
}

export async function getCompanyJobPromotionDetail(promotionId) {
  const response = await apiClient.get(`/company/job-promotions/${encodeURIComponent(promotionId)}`, { auth: true })
  return response.data?.data?.promotion || response.data?.promotion || null
}

export async function cancelCompanyJobPromotion(promotionId) {
  const response = await apiClient.patch(`/company/job-promotions/${encodeURIComponent(promotionId)}/cancel`, {}, { auth: true })
  return response.data?.data?.promotion || response.data?.promotion || null
}

export async function getCompanyJobApplications(jobId, status, page = 1, limit = 20) {
  const response = await apiClient.get(`/company/jobs/${encodeURIComponent(jobId)}/applications`, {
    auth: true,
    params: { status, page, limit },
  })
  const data = response.data?.data || {}
  return {
    items: data.applications || [],
    pagination: data.pagination || { page, limit, total: 0 },
  }
}

export async function getCompanyApplicationDetail(applicationId) {
  const mock = await loadCompanyMock()
  const details = Array.isArray(mock.applicationDetails) ? mock.applicationDetails : []
  const statusMap = readStorageJson(COMPANY_APPS_STORAGE_KEY, {})
  const detail = details.find((item) => String(item._id) === String(applicationId))

  if (!detail) throw new Error('Không tìm thấy hồ sơ ứng viên.')
  return {
    ...detail,
    status: statusMap[String(applicationId)] || detail.status,
  }
}

export async function updateCompanyApplicationStatus(applicationId, status) {
  const statusMap = readStorageJson(COMPANY_APPS_STORAGE_KEY, {})
  statusMap[String(applicationId)] = status
  writeStorageJson(COMPANY_APPS_STORAGE_KEY, statusMap)
  return { status: 'success', message: 'Cập nhật trạng thái thành công.' }
}

export async function getUserProfile(userName) {
  const mock = await loadCompanyMock()
  const profiles = Array.isArray(mock.userProfiles) ? mock.userProfiles : []
  const item = profiles.find((profile) => String(profile.user_name).toLowerCase() === String(userName).toLowerCase())
  if (!item) throw new Error('Không tìm thấy thông tin user.')
  return item
}
