import { refreshAccessToken } from '../api/tokenRefresh.js'
import { genUploader } from 'uploadthing/client'
import { buildApiUrl, clearStoredAuthSession, createJsonHeaders, getAccessToken, getApiOrigin, getRefreshToken } from '../config/api'

const FAVORITE_STORAGE_KEY = 'favorite_job_ids'
const FAVORITE_CACHE_TTL = 30000
const JSON_GET_CACHE_TTL = 10000
const EMPLOYER_OVERVIEW_CACHE_TTL = 15000
const EMPLOYER_OVERVIEW_JOB_LIMIT = 24
const EMPLOYER_RECENT_JOB_LIMIT = 8
const EMPLOYER_RECENT_APPLICATION_LIMIT = 5
let favoriteIdsCache = null
let mockJobsPromise = null
let mockHomePromise = null
let mockProfileEditPromise = null
let employerOverviewCache = null
const jsonGetCache = new Map()
const jsonGetInflight = new Map()
const { uploadFiles } = genUploader({
  url: `${getApiOrigin()}/api/uploadthing`,
})

function getRequestMethod(options = {}) {
  return String(options.method || 'GET').toUpperCase()
}

function getJsonCacheKey(path, options = {}) {
  return `${options.auth ? getAccessToken() || 'auth' : 'public'}:${path}`
}

function clearJsonCacheByPath(pathPrefix) {
  for (const key of jsonGetCache.keys()) {
    const [, path = ''] = key.split(':', 2)
    if (path.startsWith(pathPrefix)) {
      jsonGetCache.delete(key)
    }
  }
}

async function runJsonRequest(path, options, headers) {
  return fetch(buildApiUrl(path), {
    ...options,
    credentials: 'include',
    headers,
  })
}

async function requestJson(path, options = {}) {
  const method = getRequestMethod(options)
  const cacheable = method === 'GET' && !options.noCache
  const cacheKey = cacheable ? getJsonCacheKey(path, options) : ''

  if (cacheable) {
    const cached = jsonGetCache.get(cacheKey)
    if (cached && Date.now() - cached.time < JSON_GET_CACHE_TTL) {
      return cached.payload
    }

    const inflight = jsonGetInflight.get(cacheKey)
    if (inflight) return inflight
  }

  const run = async () => {
  const headers = createJsonHeaders(options.headers, {
    auth: Boolean(options.auth),
    hasBody: Boolean(options.body),
  })

  let res = await runJsonRequest(path, options, headers)

  if (res.status === 401 && options.auth) {
    try {
      await refreshAccessToken()
      const retryHeaders = createJsonHeaders(options.headers, {
        auth: true,
        hasBody: Boolean(options.body),
      })
      res = await runJsonRequest(path, options, retryHeaders)
    } catch (error) {
      clearStoredAuthSession()
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)
      }
      throw error
    }
  }

  const payload = await res.json().catch(() => null)

  if (!res.ok) {
    const validationMessage = Array.isArray(payload?.error)
      ? payload.error
          .map((item) => item?.message)
          .filter(Boolean)
          .join('. ')
      : ''
    const error = new Error(validationMessage || payload?.message || `Request failed: ${res.status}`)
    error.status = res.status
    error.payload = payload
    throw error
  }

    if (cacheable) {
      jsonGetCache.set(cacheKey, {
        time: Date.now(),
        payload,
      })
    }

    return payload
  }

  const promise = run()

  if (cacheable) {
    jsonGetInflight.set(cacheKey, promise)
    promise.then(
      () => jsonGetInflight.delete(cacheKey),
      () => jsonGetInflight.delete(cacheKey),
    )
  }

  return promise
}

async function loadMockJobs() {
  mockJobsPromise ??= fetch('/api/jobs.json').then((res) => res.json())
  return mockJobsPromise
}

async function loadMockHome() {
  mockHomePromise ??= fetch('/api/home.json').then((res) => res.json())
  return mockHomePromise
}

async function loadMockProfileEdit() {
  mockProfileEditPromise ??= fetch('/api/profile-edit.json').then((res) => res.json())
  return mockProfileEditPromise
}

function formatSalary(salary) {
  if (!salary || typeof salary !== 'object') return 'Thỏa thuận'
  if (salary.is_negotiable && salary.min == null && salary.max == null) return 'Thỏa thuận'

  const unit = salary.currency === 'USD' ? 'USD' : 'VNĐ'
  const formatAmount = (value) => {
    if (typeof value !== 'number') return null
    if (salary.currency === 'USD') return value.toLocaleString('en-US')
    return `${Math.round(value / 1000000)}M`
  }

  const min = formatAmount(salary.min)
  const max = formatAmount(salary.max)

  if (min && max) return `${min} - ${max} ${unit}`
  if (min) return `Từ ${min} ${unit}`
  if (max) return `Đến ${max} ${unit}`
  return 'Thỏa thuận'
}

function normalizeObjectId(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    if (typeof value.$oid === 'string') return value.$oid
    if (typeof value.toString === 'function') {
      const stringValue = value.toString()
      if (stringValue && stringValue !== '[object Object]') return stringValue
    }
  }
  return ''
}

function isMongoObjectId(value) {
  return /^[a-fA-F0-9]{24}$/.test(String(value || '').trim())
}

function getJobApplyId(job) {
  return normalizeObjectId(job?.applyId || job?.backendId || job?._id || job?.id)
}

function formatDate(value) {
  if (!value) return 'Đang cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Đang cập nhật'
  return date.toLocaleDateString('vi-VN')
}

function formatEmployerRelativeTime(value) {
  if (!value) return 'Mới đăng'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Mới đăng'
  const diffDays = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000))
  if (diffDays === 0) return 'Hôm nay'
  if (diffDays === 1) return '1 ngày trước'
  return `${diffDays} ngày trước`
}

function splitTextList(value) {
  if (Array.isArray(value)) return value
  if (!value) return []
  return String(value)
    .split('\n')
    .map((item) => item.replace(/^\s*-\s*/, '').trim())
    .filter(Boolean)
}

function mapApplicationStatus(status) {
  switch (status) {
    case 'submitted':
      return 'Chờ duyệt'
    case 'reviewing':
      return 'Đang xem xét'
    case 'shortlisted':
    case 'hired':
      return 'Chấp nhận'
    case 'rejected':
      return 'Từ chối'
    case 'interviewing':
      return 'Đang xem xét'
    case 'withdrawn':
      return 'Đã rút'
    default:
      return 'Đang xem xét'
  }
}

function mapJobLifecycleStatus(status) {
  switch (status) {
    case 'open':
      return 'Đang mở'
    case 'paused':
      return 'Tạm dừng'
    case 'closed':
      return 'Đã đóng'
    case 'expired':
      return 'Hết hạn'
    case 'draft':
      return 'Bản nháp'
    default:
      return 'Đang mở'
  }
}

function mapJobType(value) {
  switch (value) {
    case 'full-time':
    case 'full_time':
      return 'Toàn thời gian'
    case 'part-time':
    case 'part_time':
      return 'Bán thời gian'
    case 'internship':
      return 'Thực tập'
    case 'contract':
      return 'Hợp đồng'
    case 'remote':
      return 'Remote'
    case 'hybrid':
      return 'Hybrid'
    default:
      return value || 'Đang cập nhật'
  }
}

function mapLevel(value) {
  switch (value) {
    case 'intern':
      return 'Intern'
    case 'fresher':
      return 'Fresher'
    case 'junior':
      return 'Junior'
    case 'middle':
      return 'Middle'
    case 'senior':
      return 'Senior'
    case 'lead':
      return 'Lead'
    default:
      return value || 'Đang cập nhật'
  }
}

function normalizePublicJob(job) {
  const company = job.company || {}
  const applicationStatus = job.my_application?.status || job.application_status || job.applied_status
  const requirements = splitTextList(job.requirements)
  const responsibilities = splitTextList(job.description)
  const benefits = splitTextList(job.benefits)
  const backendId = normalizeObjectId(job._id || job.id)

  return {
    id: backendId || job.id,
    backendId,
    applyId: backendId,
    title: job.title,
    company: company.company_name || job.company_name || job.company || 'Đang cập nhật',
    avatar: company.logo || job.logo || job.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=96&h=96&fit=crop',
    salary: formatSalary(job.salary),
    location: job.location || company.address || 'Đang cập nhật',
    status: applicationStatus ? mapApplicationStatus(applicationStatus) : mapJobLifecycleStatus(job.status),
    postedAt: formatRelativeTime(job.published_at),
    publishedAt: job.published_at,
    appliedAt: job.my_application?.applied_at || job.applied_at || '',
    updatedAt: job.my_application?.updated_at || job.updated_at || '',
    skills: Array.isArray(job.skills) ? job.skills : [],
    requirements: requirements[0] || responsibilities[0] || 'Đang cập nhật yêu cầu',
    deadline: formatDate(job.expired_at),
    experience: mapLevel(job.level),
    level: mapLevel(job.level),
    openings: typeof job.quantity === 'number' ? `${String(job.quantity).padStart(2, '0')} người` : 'Đang cập nhật',
    workMode: mapJobType(job.job_type),
    summary: responsibilities[0] || company.description || 'Đang cập nhật',
    tags: [...new Set([...(job.skills || []), ...(job.category || []), job.job_type, job.level].filter(Boolean))],
    responsibilities,
    requirementsList: requirements,
    benefits,
    companyDescription: company.description || 'Đang cập nhật',
    companyFacts: {
      size: company.size || company.company_size || '',
      website: company.website || '',
      address: company.address || '',
      verified: company.verified || false,
    },
  }
}

function normalizeJobDetail(job, company, myApplication) {
  const requirements = splitTextList(job.requirements)
  const responsibilities = splitTextList(job.description)
  const benefits = splitTextList(job.benefits)
  const backendId = normalizeObjectId(job._id || job.id)

  return {
    id: backendId || job.id,
    backendId,
    applyId: backendId,
    title: job.title,
    company: company?.company_name || 'Đang cập nhật',
    avatar: company?.logo || job.logo || '',
    salary: formatSalary(job.salary),
    deadline: formatDate(job.expired_at),
    location: job.location || company?.address || 'Đang cập nhật',
    experience: mapLevel(job.level),
    level: mapLevel(job.level),
    openings: typeof job.quantity === 'number' ? `${String(job.quantity).padStart(2, '0')} người` : 'Đang cập nhật',
    workMode: mapJobType(job.job_type),
    status: myApplication?.status ? mapApplicationStatus(myApplication.status) : mapJobLifecycleStatus(job.status),
    postedAt: formatRelativeTime(job.published_at),
    summary: responsibilities[0] || company?.description || 'Đang cập nhật',
    tags: [...new Set([...(job.skills || []), ...(job.category || [])])],
    responsibilities,
    requirements,
    benefits,
    companyDescription: company?.description || 'Đang cập nhật',
    companyFacts: {
      size: company?.size || company?.company_size || '',
      website: company?.website || '',
      address: company?.address || '',
      verified: company?.verified || false,
    },
    companyInfo: company || {},
    myApplication: myApplication || null,
  }
}

function getAppliedItems(payloadData) {
  if (Array.isArray(payloadData?.applications)) return payloadData.applications
  if (Array.isArray(payloadData?.jobs)) return payloadData.jobs
  if (Array.isArray(payloadData?.items)) return payloadData.items
  if (Array.isArray(payloadData)) return payloadData
  return []
}

function getApplicationStatus(item) {
  return item.status || item.my_application?.status || item.application?.status || ''
}

function getApplicationUpdatedAt(item) {
  return item.updated_at || item.my_application?.updated_at || item.application?.updated_at || item.applied_at || item.my_application?.applied_at || item.application?.applied_at || ''
}

function getApplicationTitle(item) {
  const jobTitle = item.job?.title || item.title || 'công việc'
  const companyName = item.company?.company_name || item.job?.company?.company_name || item.company_name || ''
  return companyName ? `${jobTitle} tại ${companyName}` : jobTitle
}

function mapApplicationActivity(item) {
  const target = getApplicationTitle(item)
  const status = getApplicationStatus(item)
  const updatedAt = getApplicationUpdatedAt(item)

  switch (status) {
    case 'reviewing':
      return {
        title: `Nhà tuyển dụng đang xem xét hồ sơ cho vị trí ${target}`,
        time: formatRelativeTime(updatedAt),
        tone: 'text-blue-600',
      }
    case 'shortlisted':
      return {
        title: `Hồ sơ của bạn đã vào danh sách phù hợp cho vị trí ${target}`,
        time: formatRelativeTime(updatedAt),
        tone: 'text-emerald-600',
      }
    case 'interviewing':
      return {
        title: `Bạn đã được mời phỏng vấn cho vị trí ${target}`,
        time: formatRelativeTime(updatedAt),
        tone: 'text-amber-600',
      }
    case 'hired':
      return {
        title: `Bạn đã được nhận cho vị trí ${target}`,
        time: formatRelativeTime(updatedAt),
        tone: 'text-emerald-600',
      }
    case 'rejected':
      return {
        title: `Hồ sơ chưa phù hợp với vị trí ${target}`,
        time: formatRelativeTime(updatedAt),
        tone: 'text-rose-600',
      }
    case 'withdrawn':
      return {
        title: `Bạn đã rút hồ sơ khỏi vị trí ${target}`,
        time: formatRelativeTime(updatedAt),
        tone: 'text-slate-500',
      }
    case 'submitted':
    default:
      return {
        title: `Đã ứng tuyển vị trí ${target}`,
        time: formatRelativeTime(updatedAt),
        tone: 'text-violet-600',
      }
  }
}

function normalizeAppliedJobItem(item) {
  const baseJob = item.job || item
  const application = item.my_application || item.application || {
    _id: item._id,
    status: item.status,
    applied_at: item.applied_at,
    updated_at: item.updated_at,
  }
  const merged = {
    ...baseJob,
    company: item.company || baseJob.company,
    my_application: application,
    application_status: item.status || item.application_status || application?.status,
  }
  const normalized = normalizePublicJob(merged)

  return {
    ...normalized,
    applicationId: item._id || application?._id || '',
    rawStatus: item.status || application?.status || '',
  }
}

async function normalizeAppliedJobItemWithDetail(item) {
  const normalized = normalizeAppliedJobItem(item)
  const jobId = normalizeObjectId(normalized.backendId || normalized.id)
  if (!isMongoObjectId(jobId)) return normalized

  try {
    const payload = await requestJson(`/jobs/${encodeURIComponent(jobId)}`, { auth: true })
    const detailJob = payload?.data?.job
    const company = payload?.data?.company
    const application = item.my_application || item.application || {
      _id: item._id,
      status: item.status,
      applied_at: item.applied_at,
      updated_at: item.updated_at,
    }

    if (!detailJob) return normalized

    return {
      ...normalizeJobDetail(detailJob, company, application),
      applicationId: normalized.applicationId,
      rawStatus: normalized.rawStatus,
      status: normalized.status,
      appliedAt: normalized.appliedAt,
      updatedAt: normalized.updatedAt,
    }
  } catch {
    return normalized
  }
}

async function loadAppliedJobsFallback() {
  const mock = await loadMockJobs()
  const fallbackItems = Array.isArray(mock?.appliedJobsResponse?.data?.jobs)
    ? mock.appliedJobsResponse.data.jobs
    : Array.isArray(mock?.appliedJobs)
      ? mock.appliedJobs
      : []

  if (fallbackItems.length) {
    return {
      jobs: fallbackItems.map((item) => normalizeAppliedJobItem(item)),
      pagination: {
        page: 1,
        limit: fallbackItems.length,
        total: fallbackItems.length,
        total_pages: 1,
      },
    }
  }

  return { jobs: [], pagination: { page: 1, limit: 10, total: 0, total_pages: 1 } }
}

export async function loadHomeMeta() {
  return loadMockHome()
}

export async function loadJobsForHome() {
  const mock = await loadMockJobs()
  return mock.jobs || []
}

function getPublicJobsFromPayload(payload) {
  const items = Array.isArray(payload?.data?.items)
    ? payload.data.items
    : Array.isArray(payload?.data?.jobs)
      ? payload.data.jobs
      : Array.isArray(payload?.data)
        ? payload.data
        : []

  return items.map((item) => normalizePublicJob(item))
}

export async function loadFeaturedJobs({ page = 1, limit = 8 } = {}) {
  try {
    const payload = await requestJson(`/jobs/featured?page=${page}&limit=${limit}`)
    return {
      jobs: getPublicJobsFromPayload(payload),
      pagination: payload?.data?.pagination || null,
    }
  } catch {
    const jobs = await loadJobsForHome()
    return {
      jobs: jobs.slice(0, limit),
      pagination: null,
    }
  }
}

export async function loadLatestJobs({ page = 1, limit = 8 } = {}) {
  try {
    const payload = await requestJson(`/jobs/latest?page=${page}&limit=${limit}`)
    return {
      jobs: getPublicJobsFromPayload(payload),
      pagination: payload?.data?.pagination || null,
    }
  } catch {
    const jobs = await loadJobsForHome()
    return {
      jobs: [...jobs]
        .sort((a, b) => {
          const aTime = a?.publishedAt ? new Date(a.publishedAt).getTime() : 0
          const bTime = b?.publishedAt ? new Date(b.publishedAt).getTime() : 0
          return bTime - aTime
        })
        .slice(0, limit),
      pagination: null,
    }
  }
}

export async function searchPublicJobs(queryOrParams) {
  const shouldReturnSearchResult = typeof queryOrParams === 'object' && queryOrParams !== null
  const params =
    shouldReturnSearchResult
      ? queryOrParams
      : { q: queryOrParams }
  const query = String(params.q || '').trim()

  if (query.length < 2) {
    const jobs = await loadJobsForHome()
    return shouldReturnSearchResult ? { jobs, pagination: null } : jobs
  }

  const searchParams = new URLSearchParams({
    q: query,
    page: String(params.page || 1),
    limit: String(params.limit || 10),
  })

  if (params.location) searchParams.set('location', params.location)
  if (params.job_type) searchParams.set('job_type', params.job_type)
  if (params.level) searchParams.set('level', params.level)

  const payload = await requestJson(`/jobs/search?${searchParams.toString()}`)
  const items = Array.isArray(payload?.data?.items)
    ? payload.data.items
    : Array.isArray(payload?.data?.jobs)
      ? payload.data.jobs
      : Array.isArray(payload?.data)
        ? payload.data
        : []

  const jobs = items.map((item) => normalizePublicJob(item))
  return shouldReturnSearchResult
    ? {
        jobs,
        pagination: payload?.data?.pagination || null,
      }
    : jobs
}

export async function loadJobDetail(id) {
  try {
    const payload = await requestJson(`/jobs/${id}`, { auth: Boolean(getAccessToken()) })
    const job = payload?.data?.job
    const company = payload?.data?.company
    const myApplication = payload?.data?.my_application
    if (job) {
      return normalizeJobDetail(job, company, myApplication)
    }
  } catch {
    // Fall back to local mock data when the backend is unavailable.
  }

  const mock = await loadMockJobs()
  const details = mock.jobDetails || []
  const localDetail = details.find((item) => item.id === id)

  if (localDetail && !isMongoObjectId(id)) {
    try {
      const searchParams = new URLSearchParams({
        q: localDetail.title,
        page: '1',
        limit: '5',
      })
      const payload = await requestJson(`/jobs/search?${searchParams.toString()}`)
      const items = Array.isArray(payload?.data?.items)
        ? payload.data.items
        : Array.isArray(payload?.data?.jobs)
          ? payload.data.jobs
          : Array.isArray(payload?.data)
            ? payload.data
            : []
      const match = items.find((item) => {
        const sameTitle = String(item.title || '').trim().toLowerCase() === String(localDetail.title || '').trim().toLowerCase()
        const sameCompany = String(item.company?.company_name || '').trim().toLowerCase() === String(localDetail.company || '').trim().toLowerCase()
        return sameTitle && (!localDetail.company || sameCompany)
      })
      const backendId = getJobApplyId(match)

      if (backendId) {
        const detailPayload = await requestJson(`/jobs/${backendId}`, { auth: Boolean(getAccessToken()) })
        const job = detailPayload?.data?.job
        const company = detailPayload?.data?.company
        const myApplication = detailPayload?.data?.my_application
        if (job) {
          return normalizeJobDetail(job, company, myApplication)
        }
      }
    } catch {
      // Keep local detail fallback if the mock slug cannot be resolved to a real backend job.
    }
  }

  const appliedItems = Array.isArray(mock?.appliedJobsResponse?.data?.jobs) ? mock.appliedJobsResponse.data.jobs : []
  const appliedMatch = appliedItems.find((item) => {
    const jobId = item?.job?._id || item?.job?.id
    return String(jobId) === String(id)
  })

  if (appliedMatch?.job) {
    return normalizeJobDetail(appliedMatch.job, appliedMatch.job.company, appliedMatch.my_application || null)
  }

  return localDetail || details[0] || null
}

export async function loadOtherJobDetails(currentId) {
  const mock = await loadMockJobs()
  return (mock.jobDetails || []).filter((item) => item.id !== currentId)
}

export async function loadAppliedJobs({ status, page = 1, limit = 100, withPagination = false } = {}) {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    if (status) params.set('status', status)

    const payload = await requestJson(`/jobs/me/applied?${params.toString()}`, { auth: true })
    const items = getAppliedItems(payload?.data)
    const result = {
      jobs: await Promise.all(items.map((item) => normalizeAppliedJobItemWithDetail(item))),
      pagination: payload?.data?.pagination || {
        page,
        limit,
        total: items.length,
        total_pages: 1,
      },
    }

    return withPagination ? result : result.jobs
  } catch {
    // Fall back to local mock data when the backend is unavailable.
  }

  const fallback = await loadAppliedJobsFallback()
  return withPagination ? fallback : fallback.jobs
}

export function buildAppliedJobStats(jobs = []) {
  const total = jobs.length
  const pending = jobs.filter((job) => ['submitted', 'reviewing', 'shortlisted', 'interviewing'].includes(job.rawStatus)).length
  const accepted = jobs.filter((job) => job.rawStatus === 'hired').length
  return {
    total,
    pending,
    accepted,
    successRate: total ? `${Math.round((accepted / total) * 100)}%` : '0%',
  }
}

export async function loadAppliedJobStats() {
  const jobs = await loadAppliedJobs({ page: 1, limit: 100 })
  return buildAppliedJobStats(jobs)
}

export async function withdrawAppliedJob(jobId) {
  const normalizedJobId = normalizeObjectId(jobId).trim()
  if (!isMongoObjectId(normalizedJobId)) {
    throw new Error('Tin tuyen dung nay chua co ma backend hop le de rut ho so.')
  }

  const response = await requestJson(`/jobs/${normalizedJobId}/withdraw`, { method: 'PATCH', auth: true })
  return response?.data
}

export async function applyToJob(jobId, { cvId, coverLetter } = {}) {
  const normalizedJobId = normalizeObjectId(jobId).trim()
  if (!isMongoObjectId(normalizedJobId)) {
    throw new Error('Tin tuyen dung nay chua co ma backend hop le de ung tuyen. Vui long mo tin tuyen dung tu ket qua tim kiem backend.')
  }

  const normalizedCvId = normalizeObjectId(cvId).trim()
  if (!normalizedCvId) {
    throw new Error('Vui long chon CV de ung tuyen.')
  }
  if (!isMongoObjectId(normalizedCvId)) {
    throw new Error('CV duoc chon khong co ma hop le. Vui long tai lai danh sach CV hoac upload CV moi.')
  }

  const response = await requestJson(`/jobs/${normalizedJobId}/apply`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify({
      cv_id: normalizedCvId,
      cover_letter: String(coverLetter || '').trim() || undefined,
    }),
  })

  return response?.data
}

export async function sendChatMessage({ message, sessionId, resumeId } = {}) {
  const normalizedMessage = String(message || '').trim()
  if (normalizedMessage.length < 2) {
    throw new Error('Vui long nhap noi dung toi thieu 2 ky tu.')
  }

  const body = {
    message: normalizedMessage,
  }

  if (sessionId) {
    body.session_id = String(sessionId).trim()
  }

  const normalizedResumeId = normalizeObjectId(resumeId).trim()
  if (normalizedResumeId) {
    if (!isMongoObjectId(normalizedResumeId)) {
      throw new Error('CV duoc chon khong co ma hop le.')
    }
    body.resume_id = normalizedResumeId
  }

  const response = await requestJson('/chat/jobs', {
    method: 'POST',
    auth: Boolean(getAccessToken() || getRefreshToken()),
    body: JSON.stringify(body),
  })

  return response?.data || {}
}

function normalizeChatSessionSummary(item = {}) {
  return {
    id: String(item.session_id || item.id || ''),
    sessionId: String(item.session_id || item.id || ''),
    title: String(item.title || 'Cuộc trò chuyện mới').trim() || 'Cuộc trò chuyện mới',
    lastMessage: String(item.last_message || ''),
    intent: item.last_intent || '',
    createdAt: item.created_at || '',
    updatedAt: item.updated_at || '',
  }
}

function normalizeChatTurns(turns = []) {
  if (!Array.isArray(turns) || !turns.length) {
    return []
  }

  return turns.map((turn, index) => ({
    id: createLocalTurnId(`session_${index}`),
    role: turn?.role === 'user' ? 'user' : 'assistant',
    content: String(turn?.content || ''),
    createdAt: turn?.created_at || new Date().toISOString(),
    sources: Array.isArray(turn?.sources) ? turn.sources : [],
  }))
}

function createLocalTurnId(prefix = 'chat_turn') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export async function loadChatSessions() {
  const payload = await requestJson('/chat/sessions', { auth: true, noCache: true })
  const items = Array.isArray(payload?.data?.sessions) ? payload.data.sessions : []
  return items.map((item) => normalizeChatSessionSummary(item))
}

export async function loadChatSessionDetail(sessionId) {
  const normalizedSessionId = normalizeObjectId(sessionId).trim()
  if (!isMongoObjectId(normalizedSessionId)) {
    throw new Error('Session chat khong hop le.')
  }

  const payload = await requestJson(`/chat/sessions/${encodeURIComponent(normalizedSessionId)}`, {
    auth: true,
    noCache: true,
  })
  const data = payload?.data || {}

  return {
    ...normalizeChatSessionSummary(data),
    messages: normalizeChatTurns(data.turns),
  }
}

export async function deleteChatSession(sessionId) {
  const normalizedSessionId = normalizeObjectId(sessionId).trim()
  if (!isMongoObjectId(normalizedSessionId)) {
    throw new Error('Session chat khong hop le.')
  }

  await requestJson(`/chat/sessions/${encodeURIComponent(normalizedSessionId)}`, {
    method: 'DELETE',
    auth: true,
  })

  return true
}

export async function loadCandidateApplicationSummary() {
  const fallback = async () => {
    const mock = await loadMockJobs()
    const items = Array.isArray(mock?.appliedJobsResponse?.data?.jobs)
      ? mock.appliedJobsResponse.data.jobs
      : Array.isArray(mock?.appliedJobs)
        ? mock.appliedJobs
        : []

    return {
      totalApplied: items.length,
      hired: items.filter((item) => item.status === 'hired' || item.my_application?.status === 'hired').length,
    }
  }

  try {
    const [allPayload, hiredPayload] = await Promise.all([
      requestJson('/jobs/me/applied?page=1&limit=1', { auth: true }),
      requestJson('/jobs/me/applied?page=1&limit=1&status=hired', { auth: true }),
    ])

    return {
      totalApplied: Number(allPayload?.data?.pagination?.total || 0),
      hired: Number(hiredPayload?.data?.pagination?.total || 0),
    }
  } catch {
    return fallback()
  }
}

export async function loadCandidateRecentActivities() {
  const fallback = async () => {
    const mock = await loadMockJobs()
    const items = getAppliedItems(mock?.appliedJobsResponse?.data)
    return items
      .slice()
      .sort((a, b) => new Date(getApplicationUpdatedAt(b)).getTime() - new Date(getApplicationUpdatedAt(a)).getTime())
      .slice(0, 5)
      .map((item) => mapApplicationActivity(item))
  }

  try {
    const payload = await requestJson('/jobs/me/applied?page=1&limit=5', { auth: true })
    const items = getAppliedItems(payload?.data)
    return items.map((item) => mapApplicationActivity(item))
  } catch {
    return fallback()
  }
}

export async function loadCandidateDashboardSnapshot() {
  const fallback = async () => {
    const mock = await loadMockJobs()
    const items = getAppliedItems(mock?.appliedJobsResponse?.data)
    const sortedItems = items
      .slice()
      .sort((a, b) => new Date(getApplicationUpdatedAt(b)).getTime() - new Date(getApplicationUpdatedAt(a)).getTime())

    return {
      summary: {
        totalApplied: items.length,
        hired: items.filter((item) => item.status === 'hired' || item.my_application?.status === 'hired').length,
      },
      recentActivities: sortedItems.slice(0, 5).map((item) => mapApplicationActivity(item)),
    }
  }

  try {
    const payload = await requestJson('/jobs/me/applied?page=1&limit=100', { auth: true })
    const items = getAppliedItems(payload?.data)
    const sortedItems = items
      .slice()
      .sort((a, b) => new Date(getApplicationUpdatedAt(b)).getTime() - new Date(getApplicationUpdatedAt(a)).getTime())

    return {
      summary: {
        totalApplied: Number(payload?.data?.pagination?.total || items.length),
        hired: items.filter((item) => getApplicationStatus(item) === 'hired').length,
      },
      recentActivities: sortedItems.slice(0, 5).map((item) => mapApplicationActivity(item)),
    }
  } catch {
    return fallback()
  }
}

function formatRelativeTime(value) {
  if (!value) return 'Vừa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Vừa cập nhật'

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))
  if (diffMinutes < 1) return 'Vừa xong'
  if (diffMinutes < 60) return `${diffMinutes} phút trước`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} giờ trước`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày trước`

  return date.toLocaleDateString('vi-VN')
}

function getCompanyJobsFromPayload(payload) {
  if (Array.isArray(payload?.data?.jobs)) return payload.data.jobs
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  if (Array.isArray(payload?.jobs)) return payload.jobs
  return []
}

function getCompanyApplicationsFromPayload(payload) {
  if (Array.isArray(payload?.data?.applications)) return payload.data.applications
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  if (Array.isArray(payload?.applications)) return payload.applications
  return []
}

function getEmployerApplicantInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) return 'UV'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase()
}

function mapEmployerApplicationStatus(status) {
  switch (status) {
    case 'submitted':
      return 'Mới nhận'
    case 'reviewing':
      return 'Đang xem'
    case 'shortlisted':
      return 'Tiềm năng'
    case 'interviewing':
      return 'Phỏng vấn'
    case 'hired':
      return 'Đã nhận'
    case 'rejected':
      return 'Từ chối'
    case 'withdrawn':
      return 'Đã rút'
    default:
      return 'Chưa rõ'
  }
}

function getEmployerApplicantTone(status) {
  switch (status) {
    case 'hired':
      return 'bg-emerald-100 text-emerald-700'
    case 'interviewing':
      return 'bg-amber-100 text-amber-700'
    case 'shortlisted':
      return 'bg-cyan-100 text-cyan-700'
    case 'rejected':
      return 'bg-rose-100 text-rose-700'
    case 'withdrawn':
      return 'bg-slate-200 text-slate-600'
    case 'reviewing':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-violet-100 text-violet-700'
  }
}

function normalizeEmployerApplicant(application = {}) {
  const name = application?.candidate?.full_name || application?.resume_snapshot?.full_name || 'Ứng viên mới'
  const status = application?.status || 'submitted'

  return {
    id: normalizeObjectId(application?._id || application?.id),
    applicationId: normalizeObjectId(application?._id || application?.id),
    candidateId: normalizeObjectId(application?.candidate?._id || application?.candidate_id),
    name,
    email: application?.resume_snapshot?.email || '',
    phone: application?.resume_snapshot?.phone || '',
    cvUrl: application?.resume_snapshot?.cv_url || '',
    status,
    statusLabel: mapEmployerApplicationStatus(status),
    initials: getEmployerApplicantInitials(name),
    tone: getEmployerApplicantTone(status),
    appliedAt: application?.applied_at || '',
    updatedAt: application?.updated_at || '',
    avatar: application?.candidate?.avatar || '',
  }
}

function mapEmployerJobStatus(status) {
  switch (status) {
    case 'open':
      return 'Đang hoạt động'
    case 'draft':
      return 'Bản nháp'
    case 'closed':
      return 'Đã đóng'
    case 'paused':
      return 'Tạm dừng'
    case 'expired':
      return 'Hết hạn'
    default:
      return 'Đang cập nhật'
  }
}

function normalizeEmployerJobListItem(job = {}) {
  const jobId = normalizeObjectId(job._id || job.id)
  return {
    id: jobId,
    backendId: jobId,
    title: job.title || 'Tin tuyển dụng chưa đặt tên',
    department: Array.isArray(job.category) && job.category.length ? job.category[0] : mapLevel(job.level),
    type: mapJobType(job.job_type),
    workMode: mapJobType(job.job_type),
    location: job.location || 'Đang cập nhật',
    postedAt: job.published_at || job.created_at || '',
    deadline: job.expired_at || '',
    status: mapEmployerJobStatus(job.status),
    rawStatus: job.status || '',
    moderationStatus: job.moderation_status || '',
    blockedReason: job.blocked_reason || '',
    blockedAt: job.blocked_at || '',
    level: mapLevel(job.level),
    applicants: [],
    applicantsCount: Number(job.applications_count || job.total_applications || 0),
    latestApplication: null,
    packageType: 'Gói thường',
  }
}

function getPayloadTotal(payload, fallback = 0) {
  return Number(payload?.data?.pagination?.total ?? payload?.pagination?.total ?? fallback)
}

function getEmployerOverviewCacheKey() {
  return getAccessToken() || 'anonymous'
}

function readEmployerOverviewCache() {
  if (!employerOverviewCache) return null
  if (employerOverviewCache.key !== getEmployerOverviewCacheKey()) return null
  if (Date.now() - employerOverviewCache.time > EMPLOYER_OVERVIEW_CACHE_TTL) return null
  return employerOverviewCache.value
}

function writeEmployerOverviewCache(value) {
  employerOverviewCache = {
    key: getEmployerOverviewCacheKey(),
    time: Date.now(),
    value,
  }
  return value
}

function clearEmployerOverviewCache() {
  employerOverviewCache = null
}

function mapEmployerApplicationActivity(application, job) {
  const candidateName = application?.resume_snapshot?.full_name || 'Ứng viên mới'
  const jobTitle = job?.title || 'vị trí tuyển dụng'
  const status = application?.status || 'submitted'
  const statusText = {
    submitted: 'đã nộp hồ sơ',
    reviewing: 'đang được xem xét',
    shortlisted: 'vào danh sách tiềm năng',
    interviewing: 'đang phỏng vấn',
    rejected: 'đã bị từ chối',
    hired: 'đã được nhận',
    withdrawn: 'đã rút hồ sơ',
  }[status] || 'có cập nhật hồ sơ'

  return {
    id: application?._id || `${job?._id || job?.id}-${candidateName}-${application?.updated_at || application?.applied_at}`,
    title: `${candidateName} ${statusText} cho ${jobTitle}`,
    time: formatEmployerRelativeTime(application?.updated_at || application?.applied_at),
    timestamp: new Date(application?.updated_at || application?.applied_at || 0).getTime(),
    tone: status === 'hired' ? 'text-emerald-600' : status === 'interviewing' ? 'text-amber-600' : 'text-blue-600',
  }
}

export async function loadEmployerDashboardOverview({ force = false } = {}) {
  if (!force) {
    const cached = readEmployerOverviewCache()
    if (cached) return cached
  }

  let companyPayload = null
  try {
    companyPayload = await requestJson('/company/me', { auth: true, noCache: force })
  } catch (error) {
    if (error.status === 404) {
      return {
        needsCompanyProfile: true,
        company: null,
        stats: {
          totalJobs: 0,
          openJobs: 0,
          draftJobs: 0,
          closedJobs: 0,
          totalApplications: 0,
          interviewing: 0,
        },
        recentActivities: [],
      }
    }
    throw error
  }

  const company = companyPayload?.data || null
  const [jobsPayload, openPayload, draftPayload, closedPayload] = await Promise.all([
    requestJson(`/company/jobs?page=1&limit=${EMPLOYER_OVERVIEW_JOB_LIMIT}`, { auth: true, noCache: force }),
    requestJson('/company/jobs?page=1&limit=1&status=open', { auth: true, noCache: force }).catch(() => null),
    requestJson('/company/jobs?page=1&limit=1&status=draft', { auth: true, noCache: force }).catch(() => null),
    requestJson('/company/jobs?page=1&limit=1&status=closed', { auth: true, noCache: force }).catch(() => null),
  ])
  const jobs = getCompanyJobsFromPayload(jobsPayload)
  const totalJobs = Number(jobsPayload?.data?.pagination?.total || jobs.length)
  const openJobs = getPayloadTotal(openPayload, jobs.filter((job) => job.status === 'open').length)
  const draftJobs = getPayloadTotal(draftPayload, jobs.filter((job) => job.status === 'draft').length)
  const closedJobs = getPayloadTotal(closedPayload, jobs.filter((job) => job.status === 'closed').length)
  const jobsForApplications = jobs.slice(0, EMPLOYER_RECENT_JOB_LIMIT)

  const applicationResults = await Promise.all(
    jobsForApplications.map(async (job) => {
      const jobId = job?._id || job?.id
      if (!jobId) {
        return { job, applications: [], total: 0, interviewing: 0 }
      }

      const allPayload = await requestJson(
        `/company/jobs/${encodeURIComponent(jobId)}/applications?page=1&limit=${EMPLOYER_RECENT_APPLICATION_LIMIT}`,
        { auth: true, noCache: force },
      ).catch(() => null)
      const applications = getCompanyApplicationsFromPayload(allPayload)

      return {
        job,
        applications,
        total: getPayloadTotal(allPayload, applications.length),
        interviewing: applications.filter((application) => application?.status === 'interviewing').length,
      }
    }),
  )

  const totalApplications = applicationResults.reduce((sum, item) => sum + item.total, 0)
  const interviewing = applicationResults.reduce((sum, item) => sum + item.interviewing, 0)
  const recentActivities = applicationResults
    .flatMap((item) => item.applications.map((application) => mapEmployerApplicationActivity(application, item.job)))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)

  return writeEmployerOverviewCache({
    needsCompanyProfile: false,
    company,
    stats: {
      totalJobs,
      openJobs,
      draftJobs,
      closedJobs,
      totalApplications,
      interviewing,
    },
    recentActivities,
  })
}

export async function loadEmployerJobsList({ page = 1, limit = 5, status, keyword } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  if (status) params.set('status', status)
  if (keyword?.trim()) params.set('keyword', keyword.trim())

  const payload = await requestJson(`/company/jobs?${params.toString()}`, { auth: true })
  const rawJobs = getCompanyJobsFromPayload(payload)
  const jobs = await Promise.all(
    rawJobs.map(async (job) => {
      const normalizedJob = normalizeEmployerJobListItem(job)
      if (!normalizedJob.backendId) return normalizedJob

      try {
        const applicationsPayload = await requestJson(
          `/company/jobs/${encodeURIComponent(normalizedJob.backendId)}/applications?page=1&limit=3`,
          { auth: true },
        )
        const applications = getCompanyApplicationsFromPayload(applicationsPayload).map((application) =>
          normalizeEmployerApplicant(application),
        )
        const totalApplicants = getPayloadTotal(applicationsPayload, applications.length)

        return {
          ...normalizedJob,
          applicants: applications,
          applicantsCount: totalApplicants,
          latestApplication: applications[0] || null,
        }
      } catch {
        return normalizedJob
      }
    }),
  )

  return {
    jobs,
    pagination: payload?.data?.pagination || {
      page,
      limit,
      total: jobs.length,
      total_pages: 1,
    },
  }
}

export async function updateEmployerJobStatus(jobId, status) {
  if (!jobId) {
    throw new Error('Thiếu mã job.')
  }

  const payload = await requestJson(`/company/jobs/${encodeURIComponent(jobId)}/status`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ status }),
  })

  clearJsonCacheByPath('/company/jobs')
  clearJsonCacheByPath(`/company/jobs/${encodeURIComponent(jobId)}`)
  clearEmployerOverviewCache()

  return payload?.data || null
}

export async function loadEmployerJobApplications({ jobId, status, page = 1, limit = 10 } = {}) {
  if (!jobId) {
    return {
      applications: [],
      pagination: { page, limit, total: 0, total_pages: 1 },
    }
  }

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  if (status) params.set('status', status)

  const payload = await requestJson(`/company/jobs/${encodeURIComponent(jobId)}/applications?${params.toString()}`, {
    auth: true,
  })
  const applications = getCompanyApplicationsFromPayload(payload).map((application) =>
    normalizeEmployerApplicant(application),
  )

  return {
    applications,
    pagination: payload?.data?.pagination || {
      page,
      limit,
      total: applications.length,
      total_pages: 1,
    },
  }
}

export async function loadEmployerReceivedApplications({ status, keyword = '', page = 1, limit = 10 } = {}) {
  const jobsPayload = await requestJson('/company/jobs?page=1&limit=100', { auth: true })
  const jobs = getCompanyJobsFromPayload(jobsPayload)
  const normalizedKeyword = keyword.trim().toLowerCase()

  const results = await Promise.all(
    jobs.map(async (job) => {
      const jobId = normalizeObjectId(job?._id || job?.id)
      if (!jobId) return []

      const params = new URLSearchParams({
        page: '1',
        limit: '100',
      })
      if (status) params.set('status', status)

      const payload = await requestJson(`/company/jobs/${encodeURIComponent(jobId)}/applications?${params.toString()}`, {
        auth: true,
      }).catch(() => null)

      return getCompanyApplicationsFromPayload(payload).map((application) => {
        const applicant = normalizeEmployerApplicant(application)
        return {
          ...applicant,
          jobId,
          jobTitle: job?.title || 'Tin tuyển dụng',
          jobLocation: job?.location || '',
          jobType: mapJobType(job?.job_type),
          jobLevel: mapLevel(job?.level),
          appliedTimeLabel: formatEmployerRelativeTime(applicant.appliedAt),
        }
      })
    }),
  )

  const allApplications = results
    .flat()
    .filter((item) => {
      if (!normalizedKeyword) return true
      return `${item.name} ${item.email} ${item.phone} ${item.jobTitle}`.toLowerCase().includes(normalizedKeyword)
    })
    .sort((a, b) => new Date(b.appliedAt || b.updatedAt || 0).getTime() - new Date(a.appliedAt || a.updatedAt || 0).getTime())

  const total = allApplications.length
  const start = (page - 1) * limit

  return {
    applications: allApplications.slice(start, start + limit),
    stats: {
      total,
      submitted: allApplications.filter((item) => item.status === 'submitted').length,
      reviewing: allApplications.filter((item) => item.status === 'reviewing').length,
      interviewing: allApplications.filter((item) => item.status === 'interviewing').length,
      hired: allApplications.filter((item) => item.status === 'hired').length,
    },
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.max(1, Math.ceil(total / limit)),
    },
  }
}

export async function loadEmployerApplicationDetail(applicationId) {
  if (!applicationId) {
    throw new Error('Thiếu mã hồ sơ ứng tuyển.')
  }

  const payload = await requestJson(`/company/applications/${encodeURIComponent(applicationId)}`, { auth: true })
  const detail = payload?.data || {}

  return {
    id: normalizeObjectId(detail?._id || detail?.id) || applicationId,
    applicationId: normalizeObjectId(detail?._id || detail?.id) || applicationId,
    status: detail?.status || 'submitted',
    statusLabel: mapEmployerApplicationStatus(detail?.status || 'submitted'),
    appliedAt: detail?.applied_at || '',
    updatedAt: detail?.updated_at || '',
    coverLetter: detail?.cover_letter || '',
    resumeSnapshot: detail?.resume_snapshot || {},
    candidate: detail?.candidate || null,
    job: detail?.job || null,
  }
}

export async function updateEmployerApplicationStatus(applicationId, status) {
  if (!applicationId) {
    throw new Error('Thiếu mã hồ sơ ứng tuyển.')
  }

  const payload = await requestJson(`/company/applications/${encodeURIComponent(applicationId)}/status`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ status }),
  })

  clearJsonCacheByPath('/company/jobs/')
  clearJsonCacheByPath('/company/applications/')
  clearEmployerOverviewCache()

  return payload?.data || null
}

export async function createCompanyProfile(payload) {
  const body = {
    company_name: String(payload?.company_name || '').trim(),
    address: String(payload?.address || '').trim(),
  }

  const website = String(payload?.website || '').trim()
  const logo = String(payload?.logo || '').trim()
  const description = String(payload?.description || '').trim()

  if (website) body.website = website
  if (logo) body.logo = logo
  if (description) body.description = description

  const response = await requestJson('/company', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(body),
  })

  clearEmployerOverviewCache()
  clearJsonCacheByPath('/company')
  return response?.data
}

export async function loadFavoriteJobs() {
  const token = getAccessToken()
  if (token) {
    try {
      const payload = await requestJson('/user/favorite-jobs', { auth: true })
      const items = Array.isArray(payload?.data?.jobs)
        ? payload.data.jobs
        : Array.isArray(payload?.data?.items)
          ? payload.data.items
          : Array.isArray(payload?.data)
            ? payload.data
            : []

      if (items.length) {
        return items.map((item) => normalizePublicJob(item.job || item))
      }
    } catch {
      // Fall back to local mock data when the backend is unavailable.
    }
  }

  const mock = await loadMockJobs()
  const raw = localStorage.getItem(FAVORITE_STORAGE_KEY)
  const ids = raw ? JSON.parse(raw) : []
  const set = new Set(Array.isArray(ids) ? ids : [])
  return (mock.jobs || []).filter((job) => set.has(job.id))
}

export async function loadFavoriteIds() {
  const token = getAccessToken()
  if (token) {
    if (
      favoriteIdsCache &&
      favoriteIdsCache.token === token &&
      Date.now() - favoriteIdsCache.time < FAVORITE_CACHE_TTL
    ) {
      return favoriteIdsCache.ids
    }

    try {
      const payload = await requestJson('/user/favorite-jobs', { auth: true })
      const items = Array.isArray(payload?.data?.jobs)
        ? payload.data.jobs
        : Array.isArray(payload?.data)
          ? payload.data
          : []
      if (items.length) {
        const ids = items.map((item) => item.job?._id || item.job?.id || item._id || item.id).filter(Boolean)
        favoriteIdsCache = { token, time: Date.now(), ids }
        return ids
      }
      favoriteIdsCache = { token, time: Date.now(), ids: [] }
      return []
    } catch {
      // Fall back to locally stored favorite ids when the backend is unavailable.
    }
  }

  try {
    const raw = localStorage.getItem(FAVORITE_STORAGE_KEY)
    const ids = raw ? JSON.parse(raw) : []
    return Array.isArray(ids) ? ids : []
  } catch {
    return []
  }
}

export async function toggleFavoriteJob(jobId, shouldFavorite) {
  const token = getAccessToken()
  if (!token) {
    throw new Error('Bạn cần đăng nhập để lưu công việc.')
  }

  if (shouldFavorite) {
    await requestJson(`/user/favorite-jobs/${jobId}`, { method: 'POST', auth: true })
  } else {
    await requestJson(`/user/favorite-jobs/${jobId}`, { method: 'DELETE', auth: true })
  }

  favoriteIdsCache = null
  clearJsonCacheByPath('/user/favorite-jobs')
  return true
}

export async function loadUserUploadedCvs() {
  try {
    const payload = await requestJson('/user/resumes', { auth: true })
    const items = Array.isArray(payload?.data) ? payload.data : []
    return items.map((item) => {
      const resumeId = normalizeObjectId(item._id || item.id || item.resume_id)
      const fileSource = item.resume_file_key || item.cv_url || ''
      const extensionMatch = String(fileSource).match(/\.([a-z0-9]+)(?:[?#].*)?$/i)
      const fileType = extensionMatch?.[1]?.toUpperCase() || 'CV'

      return {
        id: resumeId,
        title: item.title || 'CV chưa đặt tên',
        cvUrl: item.cv_url || '',
        fileKey: item.resume_file_key || '',
        fileType,
        isDefault: Boolean(item.is_default),
        status: item.status || 'active',
        createdAt: item.created_at || '',
        updatedAt: item.updated_at || '',
      }
    })
  } catch {
    return []
  }
}

export async function loadUserResumeDetail(resumeId) {
  const normalizedResumeId = normalizeObjectId(resumeId).trim()
  if (!isMongoObjectId(normalizedResumeId)) {
    throw new Error('CV duoc chon khong co ma hop le.')
  }

  const payload = await requestJson(`/user/resumes/${normalizedResumeId}`, { auth: true })
  const item = payload?.data || {}
  const fileSource = item.resume_file_key || item.cv_url || ''
  const extensionMatch = String(fileSource).match(/\.([a-z0-9]+)(?:[?#].*)?$/i)

  return {
    id: normalizeObjectId(item._id || item.id || item.resume_id) || normalizedResumeId,
    title: item.title || 'CV chưa đặt tên',
    cvUrl: item.cv_url || '',
    fileKey: item.resume_file_key || '',
    fileType: extensionMatch?.[1]?.toUpperCase() || 'CV',
    isDefault: Boolean(item.is_default),
    status: item.status || 'active',
    createdAt: item.created_at || '',
    updatedAt: item.updated_at || '',
  }
}

export async function deleteUserUploadedCv(cvId) {
  await requestJson(`/user/resumes/${cvId}`, { method: 'DELETE', auth: true })
  return true
}

export async function uploadUserResume({ title, file, isDefault = false, onProgress } = {}) {
  if (!title?.trim()) {
    throw new Error('Vui lòng nhập tên CV.')
  }
  if (!file) {
    throw new Error('Vui lòng chọn file CV.')
  }

  const token = getAccessToken()
  if (!token) {
    throw new Error('Bạn cần đăng nhập để upload CV.')
  }

  const uploadedFiles = await uploadFiles('userResume', {
    files: [file],
    headers: {
      Authorization: `Bearer ${token}`,
    },
    onUploadProgress: ({ progress }) => {
      if (typeof onProgress === 'function') {
        onProgress(Math.round(progress))
      }
    },
  })

  const uploadedFile = uploadedFiles?.[0]
  const cvUrl = uploadedFile?.url || uploadedFile?.serverData?.url
  const fileKey = uploadedFile?.key || uploadedFile?.serverData?.key

  if (!cvUrl || !fileKey) {
    throw new Error('Upload CV thành công nhưng thiếu URL hoặc file key.')
  }

  const response = await requestJson('/user/resumes', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({
      title: title.trim(),
      cv_url: cvUrl,
      resume_file_key: fileKey,
      is_default: Boolean(isDefault),
    }),
  })

  const item = response?.data
  const resumeId = normalizeObjectId(item?._id || item?.id || item?.resume_id)
  if (!resumeId) {
    throw new Error('Khong the luu thong tin CV sau khi upload.')
  }

  return {
    id: resumeId,
    title: item.title || title.trim(),
    cvUrl: item.cv_url || cvUrl,
    fileKey: item.resume_file_key || fileKey,
    fileType: file.name.split('.').pop()?.toUpperCase() || 'CV',
    isDefault: Boolean(item.is_default),
    status: item.status || 'active',
    createdAt: item.created_at || '',
    updatedAt: item.updated_at || '',
  }
}

export async function loadEditableAppliedProfile(cvId) {
  const mock = await loadMockProfileEdit()
  const items = Array.isArray(mock?.data?.profiles) ? mock.data.profiles : []
  return items.find((item) => String(item.cv_id) === String(cvId)) || null
}
