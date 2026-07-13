import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Toast from '../../components/Toast.jsx'
import DashboardSidebar from '../../components/DashboardSidebar.jsx'
import EmployerTopBar from '../../components/EmployerTopBar.jsx'
import EmployerSectionTabs from '../../components/EmployerSectionTabs.jsx'
import { cancelCompanyJobPromotion, getCompanyJobPromotionDetail } from '../../api/companyService.js'

const statusLabelMap = {
  active: 'Đang hiển thị',
  expired: 'Đã hết hạn',
  cancelled: 'Đã hủy',
}

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

function InfoCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1.5 text-[13px] font-semibold text-slate-800">{value}</p>
    </div>
  )
}

export default function EmployerJobPromotionDetail() {
  const { promotionId } = useParams()
  const navigate = useNavigate()
  const [promotion, setPromotion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)

    getCompanyJobPromotionDetail(promotionId)
      .then((data) => {
        if (active) setPromotion(data)
      })
      .catch((error) => {
        if (active) setToast({ type: 'error', message: error.message || 'Không thể tải chi tiết quảng cáo.' })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [promotionId])

  const handleCancelPromotion = async () => {
    if (!promotion?._id) return
    const confirmed = window.confirm('Hủy gói quảng cáo này?')
    if (!confirmed) return

    setCancelling(true)
    try {
      const updated = await cancelCompanyJobPromotion(promotion._id)
      setPromotion(updated)
      setToast({ type: 'success', message: 'Đã hủy gói quảng cáo.' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể hủy gói quảng cáo.' })
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="dashboard-copy-font min-h-screen bg-[#F9FAFB] text-slate-900">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <DashboardSidebar activeKey="job-promotions" />

      <main className="min-h-screen bg-[#F9FAFB] lg:ml-64">
        <EmployerTopBar />

        <div className="space-y-4 px-4 py-5 lg:px-6 lg:py-8">
          <EmployerSectionTabs />

          {loading ? (
            <section className="rounded-lg border border-slate-200 bg-white px-5 py-8 text-sm font-semibold text-slate-400 shadow-sm">
              Đang tải chi tiết quảng cáo...
            </section>
          ) : null}

          {!loading && promotion ? (
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-[24px] font-extrabold tracking-tight text-slate-950">{promotion.job?.title || 'Tin tuyển dụng'}</h2>
                    <p className="mt-1 text-sm text-slate-500">{promotion.job?.location || 'Chưa có địa điểm'} • {promotion.job?.level || 'Chưa có cấp bậc'}</p>
                  </div>
                  <span className={`inline-flex rounded-lg border px-3 py-1.5 text-sm font-semibold ${statusToneMap[promotion.status] || statusToneMap.active}`}>
                    {statusLabelMap[promotion.status] || promotion.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoCard label="Mã quảng cáo" value={promotion._id} />
                  <InfoCard label="Loại" value={promotion.type === 'homepage_featured' ? 'Quảng cáo trang chủ' : promotion.type} />
                  <InfoCard label="Độ ưu tiên" value={promotion.priority} />
                  <InfoCard label="Bắt đầu" value={formatDateTime(promotion.starts_at)} />
                  <InfoCard label="Kết thúc" value={formatDateTime(promotion.ends_at)} />
                  <InfoCard label="Thời lượng" value={`${getDurationDays(promotion)} ngày`} />
                  <InfoCard label="Đã thanh toán" value={formatMoney(promotion.amount_paid, promotion.currency)} />
                  <InfoCard label="Trạng thái job" value={promotion.job?.status || 'Chưa có'} />
                  <InfoCard label="Kiểm duyệt admin" value={promotion.job?.moderation_status || 'Chưa có'} />
                </div>
              </article>

              <aside className="space-y-4">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900">Thao tác</h3>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={promotion.status !== 'active' || cancelling}
                      onClick={handleCancelPromotion}
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancelling ? 'Đang hủy...' : 'Hủy gói quảng cáo'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/wallet/top-up')}
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Nạp thêm vào ví
                    </button>
                  </div>
                </section>
              </aside>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  )
}
