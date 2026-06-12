import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { loadFavoriteIds, loadFavoriteJobs, toggleFavoriteJob } from '../data/apiClient.js'

const FAVORITE_STORAGE_KEY = 'favorite_job_ids'

export default function Favorites() {
  const [jobs, setJobs] = useState([])
  const [favoriteIds, setFavoriteIds] = useState([])

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await loadFavoriteJobs()
        setJobs(data || [])
      } catch (error) {
        console.error('Failed to load jobs data', error)
      }
    }
    loadJobs()

    const loadIds = async () => {
      try {
        const ids = await loadFavoriteIds()
        setFavoriteIds(ids)
      } catch {
        setFavoriteIds([])
      }
    }
    loadIds()
  }, [])

  const favoriteJobs = useMemo(() => {
    const set = new Set(favoriteIds)
    return jobs.filter((job) => set.has(job.id))
  }, [jobs, favoriteIds])

  const removeFavorite = (id) => {
    const previousFavoriteIds = favoriteIds
    const previousJobs = jobs

    setFavoriteIds((prev) => {
      const next = prev.filter((item) => item !== id)
      localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(next))
      return next
    })
    setJobs((prev) => prev.filter((job) => job.id !== id))

    toggleFavoriteJob(id, false).catch(() => {
      setFavoriteIds(previousFavoriteIds)
      setJobs(previousJobs)
      localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(previousFavoriteIds))
    })
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-5">
            <Link to="/" className="flex items-center text-xl font-bold tracking-tight text-[#2b59ff]">
              <span className="material-symbols-outlined mr-1 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                code
              </span>
              MYCODER
            </Link>
            <span className="text-sm font-semibold text-slate-700">Công việc yêu thích</span>
          </div>
          <Link to="/" className="rounded-lg bg-[#007bff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            Quay lại trang chủ
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-[1240px] px-6 py-5">
        <section className="panel-enter rounded-xl border border-slate-200 bg-white p-4 shadow-sm" style={{ animationDelay: '40ms' }}>
          <h1 className="text-[22px] font-semibold text-slate-900">Danh sách công việc đã lưu</h1>
          <p className="mt-1 text-[14px] text-slate-500">Những công việc bạn đã thả tim ở trang chủ sẽ xuất hiện tại đây.</p>
        </section>

        <section className="mt-4 space-y-3">
          {favoriteJobs.map((job, idx) => (
            <article key={job.id} className="panel-enter rounded-xl border border-slate-200 bg-white p-4 shadow-sm" style={{ animationDelay: `${90 + idx * 40}ms` }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[17px] font-semibold text-slate-900">{job.title}</h2>
                  <p className="mt-1 text-[13px] text-slate-600">
                    {job.company} • {job.location}
                  </p>
                  <p className="mt-2 text-[13px] font-semibold text-emerald-600">{job.salary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFavorite(job.id)}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[12px] font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  Bỏ yêu thích
                </button>
              </div>
              <div className="mt-3">
                <Link to={`/job-detail/${job.id}`} className="text-[13px] font-semibold text-blue-600 hover:underline">
                  Xem chi tiết
                </Link>
              </div>
            </article>
          ))}

          {favoriteJobs.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white py-14 text-center">
              <p className="text-[16px] font-medium text-slate-500">Bạn chưa lưu công việc nào.</p>
              <Link to="/" className="mt-3 inline-flex rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600">
                Khám phá công việc
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
