import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Toast from '../../components/Toast.jsx'
import DashboardSidebar from '../../components/DashboardSidebar.jsx'
import EmployerSectionTabs from '../../components/EmployerSectionTabs.jsx'
import { getCompanyJobPromotions } from '../../api/companyService.js'

const statusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hiển thị' },
  { value: 'expired', label: 'Đã hết hạn' },
  { value: 'cancelled', label: 'Đã hủy' },
]

const statusToneMap = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  expired: 'border-amber-200 bg-amber-50 text-amber-700',
  cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
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

function formatMoney(value, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'VND' ? 0 : 2,
  }).format(Number(value || 0))
}

function getDurationDays(promotion) {
  const startsAt = new Date(promotion?.starts_at || 0)
  const endsAt = new Date(promotion?.ends_at || 0)
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) return 0
  return Math.max(1, Math.round((endsAt.getTime() - startsAt.getTime()) / 86400000))
}

export default function EmployerJobPromotions() {
  const [promotions, setPromotions] = useState([])
  const [status, setStatus] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, total_pages: 1 })
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)

    getCompanyJobPromotions({
      page: pagination.page,
      limit: pagination.limit,
      status: status || undefined,
    })
      .then((data) => {
        if (!active) return
        setPromotions(data.items || [])
        setPagination((current) => ({
          ...current,
          ...(data.pagination || {}),
        }))
      })
      .catch((error) => {
        if (active) setToast({ type: 'error', message: error.message || 'Không thể tải danh sách đẩy tin.' })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [pagination.page, pagination.limit, status])

  useEffect(() => {
    setPagination((current) => ({ ...current, page: 1 }))
  }, [status])

  const stats = useMemo(() => ({
    active: promotions.filter((item) => item.status === 'active').length,
    expired: promotions.filter((item) => item.status === 'expired').length,
    cancelled: promotions.filter((item) => item.status === 'cancelled').length,
    totalSpent: promotions.reduce((sum, item) => sum + Number(item.amount_paid || 0), 0),
  }), [promotions])

  const canGoPrev = Number(pagination.page) > 1
  const canGoNext = Number(pagination.page) < Number(pagination.total_pages || 1)

  return (
    <div className="dashboard-copy-font min-h-screen bg-[#F9FAFB] text-slate-900">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <DashboardSidebar activeKey="job-promotions" />

      <main className="min-h-screen bg-[#F9FAFB] lg:ml-64">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur lg:px-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-blue-600">Quản lý tuyển dụng</p>
              <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-slate-950 sm:text-[32px]">Đẩy tin tuyển dụng</h1>
              <p className="mt-1.5 text-sm text-slate-500">Theo dõi các gói đẩy tin đã mua, thời gian hiển thị và trạng thái từng job.</p>
            </div>
            <Link
              to="/employer-job-list"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <span className="material-symbols-outlined mr-2 text-[18px]">checklist</span>
              Về danh sách job
            </Link>
          </div>
        </header>

        <div className="space-y-4 px-4 py-5 lg:px-6 lg:py-8">
          <EmployerSectionTabs />

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            {[
              ['Đang hiển thị', stats.active, 'text-emerald-700'],
              ['Đã hết hạn', stats.expired, 'text-amber-700'],
              ['Đã hủy', stats.cancelled, 'text-rose-700'],
              ['Chi tiêu trang này', formatMoney(stats.totalSpent), 'text-slate-950'],
            ].map(([label, value, tone]) => (
              <article key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
                <p className={`mt-2 text-2xl font-extrabold tracking-tight ${tone}`}>{value}</p>
              </article>
            ))}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[220px_1fr]">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-4 text-[15px] font-semibold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              >
                {statusOptions.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>{option.label}</option>
                ))}
              </select>
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                Chọn một mục để xem chi tiết hoặc hủy gói đẩy tin còn hiệu lực.
              </div>
            </div>
          </section>

          <section className="space-y-3">
            {loading ? (
              <div className="rounded-lg border border-slate-200 bg-white px-5 py-8 text-sm font-semibold text-slate-400 shadow-sm">
                Đang tải danh sách đẩy tin...
              </div>
            ) : null}

            {!loading && promotions.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white px-8 py-14 text-center shadow-sm">
                <div className="mx-auto max-w-md">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                    <span className="material-symbols-outlined text-[26px]">rocket_launch</span>
                  </div>
                  <p className="mt-4 text-lg font-bold text-slate-800">Chưa có gói đẩy tin nào</p>
                  <p className="mt-2 text-sm text-slate-500">Hãy mở danh sách job và mua đẩy tin cho tin đang đủ điều kiện hiển thị.</p>
                </div>
              </div>
            ) : null}

            {promotions.map((promotion) => (
              <article key={promotion._id} className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm lg:px-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-[17px] font-extrabold tracking-tight text-slate-900">{promotion.job?.title || 'Tin tuyển dụng'}</h3>
                      <span className={`inline-flex rounded-lg border px-3 py-1 text-[11px] font-semibold ${statusToneMap[promotion.status] || statusToneMap.active}`}>
                        {statusOptions.find((option) => option.value === promotion.status)?.label || promotion.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{promotion.job?.location || 'Chưa có địa điểm'} • {promotion.job?.level || 'Chưa có cấp bậc'}</p>
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Bắt đầu</p>
                        <p className="mt-1 text-[12px] font-semibold text-slate-700">{formatDateTime(promotion.starts_at)}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Kết thúc</p>
                        <p className="mt-1 text-[12px] font-semibold text-slate-700">{formatDateTime(promotion.ends_at)}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Thời lượng</p>
                        <p className="mt-1 text-[12px] font-semibold text-slate-700">{getDurationDays(promotion)} ngày</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Đã thanh toán</p>
                        <p className="mt-1 text-[12px] font-semibold text-slate-700">{formatMoney(promotion.amount_paid, promotion.currency)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:w-[240px]">
                    <Link
                      to={`/employer-job-promotions/${promotion._id}`}
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Xem chi tiết
                    </Link>
                    <Link
                      to="/employer-job-list"
                      state={{ focusJobId: promotion.job_id }}
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      Mở job
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm lg:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Tổng số gói đẩy tin: {pagination.total || promotions.length}</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!canGoPrev}
                  onClick={() => setPagination((current) => ({ ...current, page: Number(current.page || 1) - 1 }))}
                  className="inline-flex h-10 min-w-[44px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <span className="px-2 text-sm font-semibold text-slate-500">Trang {pagination.page || 1}/{pagination.total_pages || 1}</span>
                <button
                  type="button"
                  disabled={!canGoNext}
                  onClick={() => setPagination((current) => ({ ...current, page: Number(current.page || 1) + 1 }))}
                  className="inline-flex h-10 min-w-[88px] items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Tiếp
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
