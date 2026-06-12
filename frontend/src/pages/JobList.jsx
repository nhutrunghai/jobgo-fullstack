import { Link } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'
import UserAvatar from '../components/UserAvatar.jsx'
import { loadAppliedJobStats, loadAppliedJobs, withdrawAppliedJob } from '../data/apiClient.js'

const statusOptions = [
  { value: '', label: 'Chọn trạng thái' },
  { value: 'submitted', label: 'Chờ duyệt' },
  { value: 'reviewing', label: 'Đang xem xét' },
  { value: 'shortlisted', label: 'Phù hợp' },
  { value: 'interviewing', label: 'Phỏng vấn' },
  { value: 'hired', label: 'Được nhận' },
  { value: 'rejected', label: 'Từ chối' },
  { value: 'withdrawn', label: 'Đã rút' },
]

const statCards = [
  { key: 'total', title: 'Tổng đơn ứng tuyển', icon: 'description', tone: 'bg-blue-100 text-blue-600' },
  { key: 'pending', title: 'Đang xử lý', icon: 'schedule', tone: 'bg-amber-100 text-amber-600' },
  { key: 'accepted', title: 'Được nhận', icon: 'check_circle', tone: 'bg-emerald-100 text-emerald-600' },
  { key: 'successRate', title: 'Tỷ lệ thành công', icon: 'trending_up', tone: 'bg-purple-100 text-purple-600' },
]

const withdrawableStatuses = new Set(['submitted', 'reviewing', 'shortlisted', 'interviewing'])

function statusLabel(status) {
  return statusOptions.find((item) => item.value === status)?.label || status || 'Chưa cập nhật'
}

function statusTone(status) {
  if (status === 'hired' || status === 'shortlisted') return 'bg-emerald-50 text-emerald-700'
  if (status === 'rejected') return 'bg-rose-50 text-rose-700'
  if (status === 'submitted') return 'bg-amber-50 text-amber-700'
  if (status === 'withdrawn') return 'bg-slate-100 text-slate-600'
  return 'bg-blue-50 text-blue-700'
}

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('vi-VN')
}

function getSearchText(job) {
  return `${job.title} ${job.company} ${job.location} ${job.level} ${job.workMode}`.toLowerCase()
}

export default function JobList() {
  const [status, setStatus] = useState('')
  const [keyword, setKeyword] = useState('')
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, successRate: '0%' })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [withdrawingId, setWithdrawingId] = useState('')

  const loadJobs = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const [jobsData, statsData] = await Promise.all([
        loadAppliedJobs({ status, page: 1, limit: 100 }).catch(() => []),
        loadAppliedJobStats().catch(() => ({ total: 0, pending: 0, accepted: 0, successRate: '0%' })),
      ])
      setJobs(jobsData || [])
      setStats(statsData)
    } catch (loadError) {
      setJobs([])
      setError(loadError.message || 'Không thể tải danh sách ứng tuyển.')
    } finally {
      setIsLoading(false)
    }
  }, [status])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  const filteredJobs = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return jobs
    return jobs.filter((job) => getSearchText(job).includes(q))
  }, [jobs, keyword])

  const handleWithdraw = async (job) => {
    setWithdrawingId(job.id)
    setError('')
    try {
      await withdrawAppliedJob(job.id)
      setJobs((prev) =>
        prev.map((item) =>
          item.id === job.id
            ? {
                ...item,
                rawStatus: 'withdrawn',
                status: statusLabel('withdrawn'),
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      )
      setOpenMenuId(null)
      const nextStats = await loadAppliedJobStats()
      setStats(nextStats)
    } catch (withdrawError) {
      setError(withdrawError.message || 'Không thể rút hồ sơ.')
    } finally {
      setWithdrawingId('')
    }
  }

  const resetFilters = () => {
    setStatus('')
    setKeyword('')
  }

  return (
    <div className="bg-[#f7f9fc] text-on-surface">
      <DashboardSidebar activeKey="applied-jobs" />
      <main className="lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-40 flex flex-col gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[20px] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[22px] sm:leading-none">Job đã ứng tuyển</h1>
              <p className="mt-1 text-xs font-medium leading-5 text-slate-500 sm:leading-normal">Theo dõi trạng thái, thông tin job và tiến trình ứng tuyển của bạn</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
            <button className="pressable rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50" onClick={() => { resetFilters(); loadJobs() }}>
              <span className="material-symbols-outlined mr-1.5 text-[16px]">refresh</span>Làm mới
            </button>
            <Link className="pressable rounded-lg bg-blue-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600" to="/search-jobs">
              <span className="material-symbols-outlined mr-1.5 text-[16px]">search</span>Tìm việc mới
            </Link>
          </div>
        </header>

        <div className="p-5">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card, idx) => (
              <article key={card.key} className="card-enter rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm" style={{ animationDelay: `${80 + idx * 80}ms` }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[15px] font-semibold text-slate-700">{card.title}</p>
                    <p className="mt-1.5 text-[30px] font-extrabold leading-none text-slate-900">{stats[card.key]}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.tone}`}>
                    <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="mt-5">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="p-5">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <span className="material-symbols-outlined text-[22px]">work_history</span>
                    Danh sách ứng tuyển
                  </h2>
                  <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-12">
                    <div className="relative lg:col-span-7">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[17px] text-slate-400">search</span>
                      <input className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="Tìm kiếm vị trí, công ty, level..." type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                    </div>
                    <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 lg:col-span-3" value={status} onChange={(e) => setStatus(e.target.value)}>
                      {statusOptions.map((item) => <option key={item.value || 'all'} value={item.value}>{item.label}</option>)}
                    </select>
                    <button className="h-9 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 lg:col-span-2" onClick={resetFilters}>
                      Đặt lại
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mx-5 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {error}
                  </div>
                )}

                <div className="border-t border-slate-100 p-5">
                  <div className="space-y-4">
                    {isLoading && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm font-semibold text-slate-500">
                        Đang tải danh sách ứng tuyển...
                      </div>
                    )}

                    {!isLoading && filteredJobs.map((job) => (
                      <article key={job.id} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-3">
                              <UserAvatar src={job.avatar} name={job.company} className="h-11 w-11 border border-slate-100" textClassName="text-xs" />
                              <div className="min-w-0 flex-1">
                                <h4 className="text-[17px] font-bold text-slate-900">{job.title}</h4>
                                <p className="mt-1 text-sm text-slate-500">{job.company} · {job.location}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(job.rawStatus)}`}>{statusLabel(job.rawStatus)}</span>
                                  {job.appliedAt && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">Ứng tuyển: {formatDateTime(job.appliedAt)}</span>}
                                  {job.updatedAt && <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">Cập nhật: {formatDateTime(job.updatedAt)}</span>}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                              <div className="rounded-lg bg-slate-50 px-3 py-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Mức lương</p>
                                <p className="mt-1 text-sm font-bold text-emerald-600">{job.salary}</p>
                              </div>
                              <div className="rounded-lg bg-slate-50 px-3 py-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Cấp bậc</p>
                                <p className="mt-1 text-sm font-semibold text-slate-700">{job.level}</p>
                              </div>
                              <div className="rounded-lg bg-slate-50 px-3 py-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Hình thức</p>
                                <p className="mt-1 text-sm font-semibold text-slate-700">{job.workMode}</p>
                              </div>
                              <div className="rounded-lg bg-slate-50 px-3 py-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Hạn nộp / Số lượng</p>
                                <p className="mt-1 text-sm font-semibold text-slate-700">{job.deadline} · {job.openings}</p>
                              </div>
                            </div>

                            <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Tóm tắt công việc</p>
                              <p className="mt-2 text-[13px] leading-6 text-slate-600">{job.summary}</p>
                            </div>

                            {!!job.skills?.length && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {job.skills.map((skill) => (
                                  <span key={skill} className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="relative flex shrink-0 flex-row items-center justify-between gap-3 xl:w-[156px] xl:flex-col xl:items-end">
                            <div className="text-left xl:text-right">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Trạng thái hồ sơ</p>
                              <p className="mt-1 text-sm font-bold text-slate-800">{statusLabel(job.rawStatus)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setOpenMenuId((prev) => (prev === job.id ? null : job.id))}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                            >
                              Thao tác
                              <span className="material-symbols-outlined text-[16px]">expand_more</span>
                            </button>
                            {openMenuId === job.id && (
                              <div className="absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)]">
                                <Link
                                  to={`/job-detail/${job.id}`}
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                                  Xem chi tiết
                                </Link>
                                {withdrawableStatuses.has(job.rawStatus) && (
                                  <button
                                    type="button"
                                    onClick={() => handleWithdraw(job)}
                                    disabled={withdrawingId === job.id}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">logout</span>
                                    {withdrawingId === job.id ? 'Đang rút...' : 'Rút hồ sơ'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}

                    {!isLoading && filteredJobs.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                        Không có hồ sơ ứng tuyển phù hợp với bộ lọc hiện tại.
                      </div>
                    )}
                  </div>
                </div>
              </div>
          </section>
        </div>
      </main>
    </div>
  )
}
