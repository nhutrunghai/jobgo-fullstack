import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout.jsx'
import Toast from '../../components/Toast.jsx'
import {
  createAdminJobPromotion,
  deleteAdminJobPromotion,
  getAdminJobDetail,
  getAdminJobPromotionDetail,
  getAdminJobPromotions,
  getAdminJobs,
  reorderAdminJobPromotions,
  updateAdminJobPromotion,
} from '../../api/adminService.js'

const promotionTypeOptions = [{ value: 'homepage_featured', label: 'Quảng cáo trang chủ' }]

const promotionStatusOptions = [
  { value: 'active', label: 'Đang hiển thị' },
  { value: 'expired', label: 'Đã hết hạn' },
  { value: 'cancelled', label: 'Đã hủy' },
]

const promotionStatusToneMap = {
  active: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  expired: 'border-amber-100 bg-amber-50 text-amber-700',
  cancelled: 'border-rose-100 bg-rose-50 text-rose-700',
}

const jobModerationToneMap = {
  active: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  blocked: 'border-rose-100 bg-rose-50 text-rose-700',
}

function formatDateTime(value) {
  if (!value) return 'Chưa có'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa có'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function toDatetimeLocalValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const timezoneOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

function toIsoString(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

function formatMoney(value, currency = 'VND') {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency || 'VND',
    maximumFractionDigits: currency === 'VND' ? 0 : 2,
  }).format(amount)
}

function compactId(value) {
  if (!value) return 'Chưa có'
  return `${String(value).slice(0, 8)}...${String(value).slice(-6)}`
}

function buildCreateForm(jobId = '') {
  const startsAt = new Date(Date.now() + 60 * 60 * 1000)
  const endsAt = new Date(startsAt.getTime() + 7 * 24 * 60 * 60 * 1000)

  return {
    jobId,
    type: 'homepage_featured',
    status: 'active',
    starts_at: toDatetimeLocalValue(startsAt.toISOString()),
    ends_at: toDatetimeLocalValue(endsAt.toISOString()),
    priority: '0',
    amount_paid: '0',
    currency: 'VND',
  }
}

function buildEditForm(promotion) {
  return {
    type: promotion?.type || 'homepage_featured',
    status: promotion?.status || 'active',
    starts_at: toDatetimeLocalValue(promotion?.starts_at),
    ends_at: toDatetimeLocalValue(promotion?.ends_at),
    priority: String(promotion?.priority ?? 0),
    amount_paid: String(promotion?.amount_paid ?? 0),
    currency: promotion?.currency || 'VND',
  }
}

function StatCard({ label, value, tone = 'text-slate-950' }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-extrabold ${tone}`}>{value}</p>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="rounded-md border border-slate-100 bg-slate-50 p-2.5">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400">{label}</p>
      <p className="mt-1 text-[12px] font-bold text-slate-800">{value || 'Chưa có'}</p>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      {children}
    </label>
  )
}

function PickerModal({ title, subtitle, open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4">
      <div className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-[15px] font-extrabold text-slate-950">{title}</h2>
            {subtitle ? <p className="mt-1 text-[12px] font-medium text-slate-500">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div className="max-h-[calc(85vh-76px)] overflow-auto">{children}</div>
      </div>
    </div>
  )
}

function JobPickerModal({ open, onClose, onSelect }) {
  const [keyword, setKeyword] = useState('')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    let active = true
    const timer = window.setTimeout(() => {
      setLoading(true)
      setError('')
      getAdminJobs({ page: 1, limit: 8, keyword: keyword || undefined })
        .then((data) => {
          if (!active) return
          setJobs(data?.jobs ?? [])
        })
        .catch((err) => {
          if (active) setError(err.message || 'Không thể tải danh sách jobs.')
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, keyword ? 250 : 0)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [keyword, open])

  return (
    <PickerModal
      open={open}
      onClose={onClose}
      title="Quảng cáo tuyển dụng"
      subtitle="Mở preview và gắn job ngay trong màn quản lý quảng cáo."
    >
      <div className="p-5">
        <label className="relative block">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo tiêu đề, địa điểm hoặc công ty..."
            className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-[13px] font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
          />
        </label>

        <div className="mt-4 space-y-2">
          {jobs.map((job) => (
            <article key={job._id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-extrabold text-slate-950">{job.title || 'Tin tuyển dụng chưa có tiêu đề'}</p>
                  <p className="mt-1 truncate text-[12px] font-medium text-slate-500">
                    {job.company?.company_name || 'Chưa có doanh nghiệp'} · {job.location || 'Chưa có địa điểm'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-extrabold ${jobModerationToneMap[job.moderation_status] || jobModerationToneMap.active}`}>
                      {job.moderation_status === 'blocked' ? 'Admin đã chặn' : 'Được phép hiển thị'}
                    </span>
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-extrabold text-slate-700">
                      {compactId(job._id)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelect(job)}
                  className="h-9 shrink-0 rounded-md border border-indigo-200 bg-indigo-50 px-4 text-[12px] font-extrabold text-indigo-700 transition hover:bg-indigo-100"
                >
                  Chọn job này
                </button>
              </div>
            </article>
          ))}

          {!jobs.length ? (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-[13px] font-semibold text-slate-400">
              {loading ? 'Đang tải danh sách jobs...' : error || 'Không tìm thấy tin tuyển dụng phù hợp.'}
            </div>
          ) : null}
        </div>
      </div>
    </PickerModal>
  )
}

const inputClassName =
  'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100'

export default function AdminJobPromotions() {
  const [searchParams, setSearchParams] = useSearchParams()
  const presetJobId = searchParams.get('jobId') || ''
  const presetJobTitle = searchParams.get('jobTitle') || ''
  const presetCompanyName = searchParams.get('companyName') || ''

  const [promotions, setPromotions] = useState([])
  const [selectedPromotion, setSelectedPromotion] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [toast, setToast] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [isJobPickerOpen, setIsJobPickerOpen] = useState(false)
  const [selectedJobPreview, setSelectedJobPreview] = useState(() =>
    presetJobId
      ? {
          _id: presetJobId,
          title: presetJobTitle,
          company_name: presetCompanyName,
        }
      : null
  )
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, total_pages: 1 })
  const [createForm, setCreateForm] = useState(() => buildCreateForm(presetJobId))
  const [editForm, setEditForm] = useState(() => buildEditForm(null))
  const [priorityDrafts, setPriorityDrafts] = useState({})

  useEffect(() => {
    if (presetJobId) {
      setSelectedJobPreview({
        _id: presetJobId,
        title: presetJobTitle,
        company_name: presetCompanyName,
      })
      setCreateForm((current) => ({ ...current, jobId: presetJobId }))
      return
    }

    setSelectedJobPreview(null)
    setCreateForm((current) => ({ ...current, jobId: '' }))
  }, [presetCompanyName, presetJobId, presetJobTitle])

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      setLoading(true)
      getAdminJobPromotions({
        page: pagination.page,
        limit: pagination.limit,
        keyword: keyword || undefined,
        status: status || undefined,
        jobId: selectedJobPreview?._id || undefined,
      })
        .then((data) => {
          if (!active) return
          const nextPromotions = data?.promotions ?? []
          setPromotions(nextPromotions)
          setPagination((current) => ({ ...current, ...(data?.pagination || {}) }))
          setPriorityDrafts(
            nextPromotions.reduce((accumulator, item) => {
              accumulator[item._id] = String(item.priority ?? 0)
              return accumulator
            }, {})
          )

          if (selectedPromotion?._id && !nextPromotions.some((item) => item._id === selectedPromotion._id)) {
            setSelectedPromotion(null)
            setEditForm(buildEditForm(null))
          }
        })
        .catch((error) => {
          if (active) setToast({ type: 'error', message: error.message || 'Không thể tải danh sách quảng cáo.' })
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, keyword ? 250 : 0)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [keyword, pagination.limit, pagination.page, selectedJobPreview?._id, selectedPromotion?._id, status])

  useEffect(() => {
    setPagination((current) => ({ ...current, page: 1 }))
  }, [keyword, selectedJobPreview?._id, status])

  const stats = useMemo(
    () => ({
      active: promotions.filter((item) => item.status === 'active').length,
      expired: promotions.filter((item) => item.status === 'expired').length,
      cancelled: promotions.filter((item) => item.status === 'cancelled').length,
      paid: promotions.reduce((sum, item) => sum + Number(item.amount_paid || 0), 0),
    }),
    [promotions]
  )

  const hasPriorityChanges = promotions.some(
    (item) => String(item.priority ?? 0) !== String(priorityDrafts[item._id] ?? item.priority ?? 0)
  )
  const canGoPrev = Number(pagination.page) > 1
  const canGoNext = Number(pagination.page) < Number(pagination.total_pages || 1)

  const handleOpenDetail = async (promotionId) => {
    setDetailLoading(true)
    try {
      const promotion = await getAdminJobPromotionDetail(promotionId)
      setSelectedPromotion(promotion)
      setEditForm(buildEditForm(promotion))
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể tải chi tiết quảng cáo.' })
    } finally {
      setDetailLoading(false)
    }
  }

  const refreshListAndDetail = async (promotionId) => {
    const data = await getAdminJobPromotions({
      page: pagination.page,
      limit: pagination.limit,
      keyword: keyword || undefined,
      status: status || undefined,
      jobId: selectedJobPreview?._id || undefined,
    })

    const nextPromotions = data?.promotions ?? []
    setPromotions(nextPromotions)
    setPagination((current) => ({ ...current, ...(data?.pagination || {}) }))
    setPriorityDrafts(
      nextPromotions.reduce((accumulator, item) => {
        accumulator[item._id] = String(item.priority ?? 0)
        return accumulator
      }, {})
    )

    if (!promotionId) return

    try {
      const detail = await getAdminJobPromotionDetail(promotionId)
      setSelectedPromotion(detail)
      setEditForm(buildEditForm(detail))
    } catch {
      setSelectedPromotion(null)
      setEditForm(buildEditForm(null))
    }
  }

  const handleCreatePromotion = async (event) => {
    event.preventDefault()
    if (!selectedJobPreview?._id) {
      setToast({ type: 'error', message: 'Hãy chọn job ngay trong màn này trước khi tạo quảng cáo.' })
      return
    }

    setCreating(true)
    try {
      const promotion = await createAdminJobPromotion({
        ...createForm,
        jobId: selectedJobPreview._id,
        starts_at: toIsoString(createForm.starts_at),
        ends_at: toIsoString(createForm.ends_at),
        priority: Number(createForm.priority || 0),
        amount_paid: Number(createForm.amount_paid || 0),
      })
      await refreshListAndDetail(promotion?._id)
      setCreateForm(buildCreateForm(selectedJobPreview._id))
      setToast({ type: 'success', message: 'Đã tạo cấu hình quảng cáo.' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể tạo cấu hình quảng cáo.' })
    } finally {
      setCreating(false)
    }
  }

  const handleSavePromotion = async (event) => {
    event.preventDefault()
    if (!selectedPromotion?._id) return

    setSaving(true)
    try {
      const promotion = await updateAdminJobPromotion(selectedPromotion._id, {
        type: editForm.type,
        status: editForm.status,
        starts_at: toIsoString(editForm.starts_at),
        ends_at: toIsoString(editForm.ends_at),
        priority: Number(editForm.priority || 0),
        amount_paid: Number(editForm.amount_paid || 0),
        currency: editForm.currency,
      })

      setPromotions((current) => current.map((item) => (item._id === promotion._id ? promotion : item)))
      setSelectedPromotion(promotion)
      setEditForm(buildEditForm(promotion))
      setPriorityDrafts((current) => ({ ...current, [promotion._id]: String(promotion.priority ?? 0) }))
      setToast({ type: 'success', message: 'Đã cập nhật cấu hình quảng cáo.' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể cập nhật cấu hình quảng cáo.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePromotion = async () => {
    if (!selectedPromotion?._id) return
    if (!window.confirm('Xóa cấu hình quảng cáo này? Hành động này không thể hoàn tác.')) return

    setDeleting(true)
    try {
      const deletedId = selectedPromotion._id
      await deleteAdminJobPromotion(deletedId)
      setPromotions((current) => current.filter((item) => item._id !== deletedId))
      setSelectedPromotion(null)
      setEditForm(buildEditForm(null))
      setToast({ type: 'success', message: 'Đã xóa cấu hình quảng cáo.' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể xóa cấu hình quảng cáo.' })
    } finally {
      setDeleting(false)
    }
  }

  const handleSavePriorityOrder = async () => {
    if (!promotions.length) return

    setReordering(true)
    try {
      await reorderAdminJobPromotions(
        promotions.map((item) => ({
          promotionId: item._id,
          priority: Number(priorityDrafts[item._id] ?? item.priority ?? 0),
        }))
      )

      const nextPromotions = promotions
        .map((item) => ({
          ...item,
          priority: Number(priorityDrafts[item._id] ?? item.priority ?? 0),
        }))
        .sort((left, right) => {
          if ((right.priority ?? 0) !== (left.priority ?? 0)) return (right.priority ?? 0) - (left.priority ?? 0)
          return new Date(right.starts_at).getTime() - new Date(left.starts_at).getTime()
        })

      setPromotions(nextPromotions)
      if (selectedPromotion?._id) {
        const updatedSelected = nextPromotions.find((item) => item._id === selectedPromotion._id)
        if (updatedSelected) {
          setSelectedPromotion(updatedSelected)
          setEditForm(buildEditForm(updatedSelected))
        }
      }
      setToast({ type: 'success', message: 'Đã lưu thứ tự ưu tiên.' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể sắp xếp thứ tự quảng cáo.' })
    } finally {
      setReordering(false)
    }
  }

  const handleSelectJobPreview = (job) => {
    if (!job?._id) return

    const nextPreview = {
      _id: job._id,
      title: job.title || '',
      company_name: job.company_name || job.company?.company_name || '',
    }

    setSelectedJobPreview(nextPreview)
    setCreateForm((current) => ({ ...current, jobId: nextPreview._id }))

    const nextParams = new URLSearchParams()
    nextParams.set('jobId', nextPreview._id)
    if (nextPreview.title) nextParams.set('jobTitle', nextPreview.title)
    if (nextPreview.company_name) nextParams.set('companyName', nextPreview.company_name)
    setSearchParams(nextParams)
  }

  const handlePickJob = async (job) => {
    try {
      const detail = await getAdminJobDetail(job._id)
      handleSelectJobPreview(detail)
      setIsJobPickerOpen(false)
    } catch {
      handleSelectJobPreview(job)
      setIsJobPickerOpen(false)
    }
  }

  const handleClearSelectedJob = () => {
    setSelectedJobPreview(null)
    setCreateForm(buildCreateForm(''))
    setSearchParams({})
  }

  return (
    <AdminLayout
      title="Đẩy Tin Tuyển Dụng"
      subtitle="Tạo cấu hình quảng cáo thủ công cho job, quản lý thời gian hiển thị và sắp xếp độ ưu tiên xuất hiện của các tin đang được làm nổi bật."
    >
      <Toast toast={toast} onClose={() => setToast(null)} />
      <JobPickerModal open={isJobPickerOpen} onClose={() => setIsJobPickerOpen(false)} onSelect={handlePickJob} />

      <section className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Đang hiển thị" value={stats.active} tone="text-emerald-700" />
        <StatCard label="Đã hết hạn" value={stats.expired} tone="text-amber-700" />
        <StatCard label="Đã hủy" value={stats.cancelled} tone="text-rose-700" />
        <StatCard label="Tổng tiền trang này" value={formatMoney(stats.paid)} tone="text-slate-950" />
      </section>

      <section className="mb-3 grid grid-cols-1 gap-3 xl:grid-cols-[380px_minmax(0,1fr)] xl:items-start">
        <form onSubmit={handleCreatePromotion} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-extrabold text-slate-950">Tạo cấu hình quảng cáo mới</h2>
              <p className="mt-1 text-[12px] font-medium text-slate-500">Chọn job bằng popup preview ngay trong màn này, không cần chuyển sang tab jobs.</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Quản trị</span>
          </div>

          <div className="space-y-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Job đang chọn</p>
                <button
                  type="button"
                  onClick={() => setIsJobPickerOpen(true)}
                  className="inline-flex h-8 items-center rounded-md border border-indigo-200 bg-indigo-50 px-3 text-[12px] font-extrabold text-indigo-700 transition hover:bg-indigo-100"
                >
                  Mở preview chọn job
                </button>
              </div>

              {selectedJobPreview ? (
                <div className="mt-2">
                  <p className="text-[13px] font-extrabold text-slate-900">{selectedJobPreview.title || 'Tin tuyển dụng đã chọn'}</p>
                  <p className="mt-1 text-[12px] font-medium text-slate-500">
                    {selectedJobPreview.company_name || 'Chưa có doanh nghiệp'} · {compactId(selectedJobPreview._id)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setIsJobPickerOpen(true)}
                      className="inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-3 text-[12px] font-extrabold text-slate-700 transition hover:bg-slate-50"
                    >
                      Đổi job
                    </button>
                    <button
                      type="button"
                      onClick={handleClearSelectedJob}
                      className="inline-flex h-8 items-center rounded-md border border-rose-200 bg-rose-50 px-3 text-[12px] font-extrabold text-rose-700 transition hover:bg-rose-100"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-[12px] font-medium leading-5 text-slate-500">Chưa có job nào được gắn. Bấm nút phía trên để mở màn preview chọn job.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Loại quảng cáo">
                <select
                  value={createForm.type}
                  onChange={(event) => setCreateForm((current) => ({ ...current, type: event.target.value }))}
                  className={inputClassName}
                >
                  {promotionTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Trạng thái">
                <select
                  value={createForm.status}
                  onChange={(event) => setCreateForm((current) => ({ ...current, status: event.target.value }))}
                  className={inputClassName}
                >
                  {promotionStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Bắt đầu">
                <input
                  type="datetime-local"
                  value={createForm.starts_at}
                  onChange={(event) => setCreateForm((current) => ({ ...current, starts_at: event.target.value }))}
                  className={inputClassName}
                />
              </FormField>

              <FormField label="Kết thúc">
                <input
                  type="datetime-local"
                  value={createForm.ends_at}
                  onChange={(event) => setCreateForm((current) => ({ ...current, ends_at: event.target.value }))}
                  className={inputClassName}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FormField label="Độ ưu tiên">
                <input
                  type="number"
                  min="0"
                  value={createForm.priority}
                  onChange={(event) => setCreateForm((current) => ({ ...current, priority: event.target.value }))}
                  className={inputClassName}
                />
              </FormField>

              <FormField label="Số tiền">
                <input
                  type="number"
                  min="0"
                  value={createForm.amount_paid}
                  onChange={(event) => setCreateForm((current) => ({ ...current, amount_paid: event.target.value }))}
                  className={inputClassName}
                />
              </FormField>

              <FormField label="Tiền tệ">
                <select
                  value={createForm.currency}
                  onChange={(event) => setCreateForm((current) => ({ ...current, currency: event.target.value }))}
                  className={inputClassName}
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                </select>
              </FormField>
            </div>

            <button
              type="submit"
              disabled={creating || !selectedJobPreview?._id}
              className="flex h-10 w-full items-center justify-center rounded-md bg-slate-950 px-3 text-[13px] font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {creating ? 'Đang tạo...' : 'Tạo quảng cáo'}
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <h2 className="text-[13px] font-extrabold text-slate-950">Danh sách quảng cáo</h2>
                <p className="mt-0.5 text-[12px] font-medium text-slate-500">Tìm kiếm, lọc trạng thái và sửa nhanh thứ tự ưu tiên ngay trong danh sách.</p>
              </div>
              <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-[minmax(240px,1fr)_170px_120px_auto] xl:max-w-[820px]">
                <label className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
                  <input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="Tìm theo tiêu đề tin tuyển dụng..."
                    className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-[13px] font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </label>
                <select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClassName}>
                  <option value="">Tất cả trạng thái</option>
                  {promotionStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setKeyword('')
                    setStatus('')
                    handleClearSelectedJob()
                  }}
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-extrabold text-slate-600 transition hover:bg-slate-50"
                >
                  Đặt lại
                </button>
                <button
                  type="button"
                  disabled={!hasPriorityChanges || reordering}
                  onClick={handleSavePriorityOrder}
                  className="h-10 rounded-md border border-indigo-200 bg-indigo-50 px-3 text-[12px] font-extrabold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {reordering ? "Đang lưu..." : "Lưu thứ tự"}
                </button>
              </div>
            </div>
            {selectedJobPreview ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-indigo-100 bg-indigo-50 px-3 py-2 text-[12px] font-semibold text-indigo-700">
                <span>Đang lọc và tạo mới theo tin: {selectedJobPreview.title || compactId(selectedJobPreview._id)}</span>
                <button type="button" onClick={() => setIsJobPickerOpen(true)} className="rounded-md bg-white px-2 py-1 text-[11px] font-extrabold text-indigo-700">Đổi tin</button>
                <button type="button" onClick={handleClearSelectedJob} className="rounded-md bg-white px-2 py-1 text-[11px] font-extrabold text-indigo-700">Bỏ chọn tin</button>
              </div>
            ) : null}
          </div>

          <div className="hidden grid-cols-[minmax(0,1.2fr)_170px_95px_130px_100px_184px] bg-slate-50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400 lg:grid">
            <span>Tin tuyển dụng</span>
            <span>Doanh nghiệp</span>
            <span>Trạng thái</span>
            <span>Thời gian</span>
            <span>Ưu tiên</span>
            <span></span>
          </div>

          {promotions.map((promotion) => {
            const isSelected = selectedPromotion?._id === promotion._id
            return (
              <article
                key={promotion._id}
                className={`border-t border-slate-100 px-4 py-3 text-[12px] transition lg:grid lg:grid-cols-[minmax(0,1.2fr)_170px_95px_130px_100px_184px] lg:items-center lg:gap-3 ${isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}`}
              >
                <div className="min-w-0">
                  <p className="truncate font-extrabold text-slate-950">{promotion.job?.title || 'Không có tiêu đề tin'}</p>
                  <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{compactId(promotion._id)} · {promotion.type}</p>
                  <p className="mt-1 truncate text-[11px] font-semibold text-slate-400">
                    {promotion.job?.location || 'Chưa có địa điểm'} · {promotion.job?.level || 'Chưa có cấp bậc'}
                  </p>
                </div>

                <div className="mt-3 min-w-0 lg:mt-0">
                  <p className="truncate font-bold text-slate-700">{promotion.company?.company_name || 'Chưa có doanh nghiệp'}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-400">{promotion.company?.verified ? 'Đã xác minh' : 'Chưa xác minh'}</p>
                </div>

                <div className="mt-3 lg:mt-0">
                  <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-extrabold ${promotionStatusToneMap[promotion.status] || promotionStatusToneMap.active}`}>
                    {promotionStatusOptions.find((option) => option.value === promotion.status)?.label || promotion.status}
                  </span>
                </div>

                <div className="mt-3 text-[11px] font-medium leading-5 text-slate-500 lg:mt-0">
                  <p>{formatDateTime(promotion.starts_at)}</p>
                  <p>{formatDateTime(promotion.ends_at)}</p>
                </div>

                <div className="mt-3 lg:mt-0">
                  <input
                    type="number"
                    min="0"
                    value={priorityDrafts[promotion._id] ?? String(promotion.priority ?? 0)}
                    onChange={(event) => setPriorityDrafts((current) => ({ ...current, [promotion._id]: event.target.value }))}
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 lg:mt-0">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(promotion._id)}
                    className="h-9 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-extrabold text-slate-700 transition hover:bg-slate-50"
                  >
                    Xem
                  </button>
                </div>
              </article>
            )
          })}

          {!promotions.length ? (
            <div className="px-4 py-10 text-center text-[13px] font-semibold text-slate-400">
              {loading ? 'Đang tải danh sách quảng cáo...' : 'Không tìm thấy cấu hình quảng cáo phù hợp.'}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 text-[12px] font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>Trang {pagination.page || 1}/{pagination.total_pages || 1} · Tổng {pagination.total || promotions.length} cấu hình quảng cáo</span>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={() => setPagination((current) => ({ ...current, page: Number(current.page || 1) - 1 }))}
                className="h-8 rounded-md border border-slate-200 bg-white px-3 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => setPagination((current) => ({ ...current, page: Number(current.page || 1) + 1 }))}
                className="h-8 rounded-md border border-slate-200 bg-white px-3 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        </section>
      </section>

      {(detailLoading || selectedPromotion) && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-indigo-600">Chi tiết quảng cáo</p>
                <h2 className="mt-1 text-lg font-extrabold text-slate-950">
                  {selectedPromotion?.job?.title || 'Đang tải cấu hình quảng cáo'}
                </h2>
                {selectedPromotion ? (
                  <p className="mt-1 text-[12px] font-medium text-slate-500">
                    {selectedPromotion.company?.company_name || 'Chưa có doanh nghiệp'} ? {compactId(selectedPromotion._id)}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPromotion(null)
                  setEditForm(buildEditForm(null))
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {detailLoading && !selectedPromotion ? (
              <div className="flex min-h-[320px] items-center justify-center p-8 text-sm font-bold text-slate-400">
                Đang tải chi tiết quảng cáo...
              </div>
            ) : null}

            {selectedPromotion ? (
              <div className="min-h-0 overflow-y-auto p-5">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Mã quảng cáo" value={compactId(selectedPromotion._id)} />
                  <Field label="Loại" value={selectedPromotion.type === 'homepage_featured' ? 'Quảng cáo trang chủ' : selectedPromotion.type} />
                  <Field label="Job" value={compactId(selectedPromotion.job_id)} />
                  <Field label="Doanh nghiệp" value={selectedPromotion.company?.company_name} />
                  <Field label="Bắt đầu" value={formatDateTime(selectedPromotion.starts_at)} />
                  <Field label="Kết thúc" value={formatDateTime(selectedPromotion.ends_at)} />
                  <Field label="Ưu tiên" value={selectedPromotion.priority} />
                  <Field label="Đã thanh toán" value={formatMoney(selectedPromotion.amount_paid, selectedPromotion.currency)} />
                </div>

                <form onSubmit={handleSavePromotion} className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-[13px] font-extrabold text-slate-950">Chỉnh sửa quảng cáo</h4>
                    <button
                      type="button"
                      onClick={handleDeletePromotion}
                      disabled={deleting}
                      className="h-9 rounded-md border border-rose-200 bg-rose-50 px-3 text-[12px] font-extrabold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {deleting ? 'Đang xóa...' : 'Xóa'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField label="Loại quảng cáo">
                      <select value={editForm.type} onChange={(event) => setEditForm((current) => ({ ...current, type: event.target.value }))} className={inputClassName}>
                        {promotionTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Trạng thái">
                      <select value={editForm.status} onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value }))} className={inputClassName}>
                        {promotionStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField label="Bắt đầu">
                      <input type="datetime-local" value={editForm.starts_at} onChange={(event) => setEditForm((current) => ({ ...current, starts_at: event.target.value }))} className={inputClassName} />
                    </FormField>
                    <FormField label="Kết thúc">
                      <input type="datetime-local" value={editForm.ends_at} onChange={(event) => setEditForm((current) => ({ ...current, ends_at: event.target.value }))} className={inputClassName} />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <FormField label="Độ ưu tiên">
                      <input type="number" min="0" value={editForm.priority} onChange={(event) => setEditForm((current) => ({ ...current, priority: event.target.value }))} className={inputClassName} />
                    </FormField>
                    <FormField label="Số tiền">
                      <input type="number" min="0" value={editForm.amount_paid} onChange={(event) => setEditForm((current) => ({ ...current, amount_paid: event.target.value }))} className={inputClassName} />
                    </FormField>
                    <FormField label="Tiền tệ">
                      <select value={editForm.currency} onChange={(event) => setEditForm((current) => ({ ...current, currency: event.target.value }))} className={inputClassName}>
                        <option value="VND">VND</option>
                        <option value="USD">USD</option>
                      </select>
                    </FormField>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex h-10 w-full items-center justify-center rounded-md bg-slate-950 px-3 text-[13px] font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
