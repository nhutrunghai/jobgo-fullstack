import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/AdminLayout.jsx'
import Toast from '../../components/Toast.jsx'
import {
  getAdminCompanies,
  getAdminCompanyApplications,
  getAdminCompanyDetail,
  getAdminCompanyJobs,
  updateAdminCompanyStatus,
} from '../../api/adminService.js'

const verifyToneMap = {
  true: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  false: 'border-amber-100 bg-amber-50 text-amber-700',
}

const jobStatusLabelMap = {
  draft: 'Ban nhap',
  open: 'Dang tuyen',
  paused: 'Tam dung',
  closed: 'Da dong',
  expired: 'Het han',
}

const applicationStatusLabelMap = {
  submitted: 'Da nop',
  reviewing: 'Dang xem',
  shortlisted: 'Phu hop',
  interviewing: 'Phong van',
  rejected: 'Tu choi',
  hired: 'Da nhan',
  withdrawn: 'Da rut',
}

function formatDate(value) {
  if (!value) return 'Chua co'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chua co'
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

function compactId(value) {
  if (!value) return 'Chua co'
  return `${String(value).slice(0, 7)}...${String(value).slice(-5)}`
}

function getInitial(company) {
  return (company?.company_name || 'C').slice(0, 1).toUpperCase()
}

function Field({ label, value }) {
  return (
    <div className="rounded-md border border-slate-100 bg-slate-50 p-2.5">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-[12px] font-bold text-slate-800">{value || 'Chua co'}</p>
    </div>
  )
}

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [companyJobs, setCompanyJobs] = useState([])
  const [companyApplications, setCompanyApplications] = useState([])
  const [keyword, setKeyword] = useState('')
  const [verified, setVerified] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, total_pages: 1 })
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [updatingVerify, setUpdatingVerify] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      setLoading(true)
      getAdminCompanies({
        page: pagination.page,
        limit: pagination.limit,
        keyword: keyword || undefined,
        verified: verified === '' ? undefined : verified,
      })
        .then((data) => {
          if (!active) return
          setCompanies(data?.companies ?? [])
          setPagination((current) => ({
            ...current,
            ...(data?.pagination || {}),
          }))
        })
        .catch((error) => {
          if (active) setToast({ type: 'error', message: error.message || 'Khong the tai danh sach doanh nghiep.' })
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, keyword ? 250 : 0)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [keyword, verified, pagination.page, pagination.limit])

  useEffect(() => {
    setPagination((current) => ({ ...current, page: 1 }))
  }, [keyword, verified])

  const stats = useMemo(() => {
    return {
      verified: companies.filter((company) => Boolean(company.verified)).length,
      pending: companies.filter((company) => !company.verified).length,
      total: companies.length,
      verifyRate: companies.length ? Math.round((companies.filter((company) => Boolean(company.verified)).length / companies.length) * 100) : 0,
    }
  }, [companies])

  const handleOpenDetail = async (companyId) => {
    setDetailLoading(true)
    try {
      const [detail, jobsData, applicationsData] = await Promise.all([
        getAdminCompanyDetail(companyId).catch(() => null),
        getAdminCompanyJobs(companyId, { page: 1, limit: 5 }).catch(() => ({ jobs: [] })),
        getAdminCompanyApplications(companyId, { page: 1, limit: 5 }).catch(() => ({ applications: [] })),
      ])
      if (!detail) {
        throw new Error('Khong the tai chi tiet doanh nghiep.')
      }
      setSelectedCompany(detail)
      setCompanyJobs(jobsData?.jobs ?? [])
      setCompanyApplications(applicationsData?.applications ?? [])
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong the tai chi tiet doanh nghiep.' })
    } finally {
      setDetailLoading(false)
    }
  }

  const handleVerifyChange = async (nextVerified) => {
    if (!selectedCompany) return
    setUpdatingVerify(true)
    try {
      const result = await updateAdminCompanyStatus(selectedCompany._id, nextVerified)
      const updatedVerified = Boolean(result?.verified ?? nextVerified)
      const updatedAt = result?.updated_at || new Date().toISOString()
      setCompanies((current) => current.map((company) => (company._id === selectedCompany._id ? { ...company, verified: updatedVerified, updated_at: updatedAt } : company)))
      setSelectedCompany((current) => ({ ...current, verified: updatedVerified, updated_at: updatedAt }))
      setToast({ type: 'success', message: updatedVerified ? 'Da xac minh doanh nghiep.' : 'Da bo xac minh doanh nghiep.' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Khong the cap nhat xac minh doanh nghiep.' })
    } finally {
      setUpdatingVerify(false)
    }
  }

  const canGoPrev = Number(pagination.page) > 1
  const canGoNext = Number(pagination.page) < Number(pagination.total_pages || 1)

  return (
    <AdminLayout title="Doanh nghiep" subtitle="Quan ly ho so doanh nghiep, trang thai xac minh, tin tuyen dung va ho so ung tuyen lien quan.">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Da xac minh</p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-700">{stats.verified}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Cho duyet</p>
          <p className="mt-2 text-2xl font-extrabold text-amber-700">{stats.pending}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Dang hien thi</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-950">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Ty le xac minh</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-950">{stats.verifyRate}%</p>
        </div>
      </section>

      <section className="mb-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_110px]">
          <label className="relative md:col-span-2 xl:col-span-1">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tim theo ten doanh nghiep..."
              className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-[13px] font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
          </label>
          <select value={verified} onChange={(event) => setVerified(event.target.value)} className="h-9 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-700 outline-none">
            <option value="">Tat ca xac minh</option>
            <option value="true">Da xac minh</option>
            <option value="false">Cho duyet</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setKeyword('')
              setVerified('')
            }}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-extrabold text-slate-600 transition hover:bg-slate-50"
          >
            Dat lai
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 2xl:grid-cols-[minmax(0,1fr)_400px]">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[minmax(0,1.2fr)_180px_120px_110px_92px] bg-slate-50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400 lg:grid">
            <span>Doanh nghiep</span>
            <span>Website</span>
            <span>Xac minh</span>
            <span>Cap nhat</span>
            <span></span>
          </div>

          {companies.map((company) => {
            const isSelected = selectedCompany?._id === company._id
            return (
              <article key={company._id} className={`border-t border-slate-100 px-4 py-3 text-[12px] transition ${isSelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50'} lg:grid lg:grid-cols-[minmax(0,1.2fr)_180px_120px_110px_92px] lg:items-center lg:gap-3`}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-[13px] font-extrabold text-slate-700 ring-1 ring-slate-200">
                    {company.logo ? <img src={company.logo} alt="" className="h-full w-full object-cover" /> : getInitial(company)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-extrabold text-slate-950">{company.company_name || 'Doanh nghiep chua dat ten'}</p>
                    <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{company.address || 'Chua co dia chi'}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 lg:mt-0 lg:contents">
                  <p className="truncate font-semibold text-slate-500">{company.website || 'Chua co'}</p>
                  <span className={`w-fit rounded-full border px-2 py-1 text-[11px] font-extrabold ${verifyToneMap[String(Boolean(company.verified))]}`}>
                    {company.verified ? 'Da xac minh' : 'Cho duyet'}
                  </span>
                  <p className="text-[11px] font-semibold text-slate-500 lg:text-[12px]">{formatDate(company.updated_at)}</p>
                </div>
                <button type="button" onClick={() => handleOpenDetail(company._id)} className="mt-3 h-8 w-full rounded-md border border-slate-200 bg-white px-3 text-[12px] font-extrabold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 lg:mt-0 lg:w-auto">
                  Xem
                </button>
              </article>
            )
          })}

          {!companies.length ? (
            <div className="px-4 py-10 text-center text-[13px] font-semibold text-slate-400">
              {loading ? 'Dang tai danh sach doanh nghiep...' : 'Khong tim thay doanh nghiep phu hop.'}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 text-[12px] font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Trang {pagination.page || 1}/{pagination.total_pages || 1} · Tong {pagination.total || companies.length} doanh nghiep
            </span>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={() => setPagination((current) => ({ ...current, page: Number(current.page || 1) - 1 }))}
                className="h-8 rounded-md border border-slate-200 bg-white px-3 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Truoc
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

        <aside className="rounded-lg border border-slate-200 bg-white shadow-sm 2xl:sticky 2xl:top-[76px]">
          <div className="flex h-11 items-center justify-between border-b border-slate-100 px-4">
            <h2 className="text-[13px] font-extrabold text-slate-950">Chi tiet doanh nghiep</h2>
            {detailLoading ? <span className="text-[12px] font-bold text-slate-400">Dang tai</span> : null}
          </div>

          {selectedCompany ? (
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-base font-extrabold text-slate-700 ring-1 ring-slate-200">
                  {selectedCompany.logo ? <img src={selectedCompany.logo} alt="" className="h-full w-full object-cover" /> : getInitial(selectedCompany)}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-extrabold text-slate-950">{selectedCompany.company_name || 'Doanh nghiep chua dat ten'}</h3>
                  <p className="mt-1 truncate text-[12px] font-medium text-slate-500">{selectedCompany.website || 'Chua co website'}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-extrabold ${verifyToneMap[String(Boolean(selectedCompany.verified))]}`}>
                      {selectedCompany.verified ? 'Da xac minh' : 'Cho duyet'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-600">{companyJobs.length} tin tuyen dung</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-600">{companyApplications.length} ho so</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Field label="Ma doanh nghiep" value={compactId(selectedCompany._id)} />
                <Field label="Ngay tao" value={formatDate(selectedCompany.created_at)} />
                <Field label="Dia chi" value={selectedCompany.address} />
                <Field label="Cap nhat" value={formatDate(selectedCompany.updated_at)} />
                <Field label="Chu so huu" value={selectedCompany.owner?.fullName} />
                <Field label="Email chu so huu" value={selectedCompany.owner?.email} />
              </div>

              {selectedCompany.description ? (
                <div className="mt-3 rounded-md border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400">Mo ta</p>
                  <p className="mt-2 text-[12px] font-medium leading-5 text-slate-600">{selectedCompany.description}</p>
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={updatingVerify || Boolean(selectedCompany.verified)}
                  onClick={() => handleVerifyChange(true)}
                  className="h-9 rounded-md bg-slate-900 px-3 text-[12px] font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Xac minh
                </button>
                <button
                  type="button"
                  disabled={updatingVerify || !selectedCompany.verified}
                  onClick={() => handleVerifyChange(false)}
                  className="h-9 rounded-md border border-amber-200 bg-amber-50 px-3 text-[12px] font-extrabold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Bo xac minh
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <section className="rounded-md border border-slate-100">
                  <div className="flex h-9 items-center justify-between border-b border-slate-100 px-3">
                    <h4 className="text-[12px] font-extrabold text-slate-950">Tin tuyen dung gan day</h4>
                    <span className="text-[11px] font-bold text-slate-400">{companyJobs.length} tin</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {companyJobs.map((job) => (
                      <div key={job._id} className="px-3 py-2">
                        <p className="truncate text-[12px] font-bold text-slate-900">{job.title}</p>
                        <p className="mt-0.5 text-[11px] font-medium text-slate-500">{jobStatusLabelMap[job.status] || job.status || 'Chua ro'} · {formatDate(job.updated_at)}</p>
                      </div>
                    ))}
                    {!companyJobs.length ? <p className="px-3 py-3 text-[12px] font-semibold text-slate-400">Chua co tin tuyen dung.</p> : null}
                  </div>
                </section>

                <section className="rounded-md border border-slate-100">
                  <div className="flex h-9 items-center justify-between border-b border-slate-100 px-3">
                    <h4 className="text-[12px] font-extrabold text-slate-950">Ho so ung tuyen gan day</h4>
                    <span className="text-[11px] font-bold text-slate-400">{companyApplications.length} ho so</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {companyApplications.map((application) => (
                      <div key={application._id} className="px-3 py-2">
                        <p className="truncate text-[12px] font-bold text-slate-900">{application.candidate?.fullName || 'Ung vien'}</p>
                        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{application.job?.title || 'Tin tuyen dung'} · {applicationStatusLabelMap[application.status] || application.status || 'Chua ro'}</p>
                      </div>
                    ))}
                    {!companyApplications.length ? <p className="px-3 py-3 text-[12px] font-semibold text-slate-400">Chua co ho so ung tuyen.</p> : null}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center p-6 text-center">
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                  <span className="material-symbols-outlined">apartment</span>
                </div>
                <p className="mt-3 text-[13px] font-bold text-slate-600">Chon mot doanh nghiep de xem chi tiet.</p>
                <p className="mt-1 text-[12px] font-medium text-slate-400">Thong tin chu so huu, tin tuyen dung va ho so ung tuyen se hien thi o day.</p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </AdminLayout>
  )
}
