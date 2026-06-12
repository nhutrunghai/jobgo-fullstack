import { useEffect, useMemo, useState } from 'react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'
import { loadHardcodedMock } from '../data/hardcodedClient.js'

function progressTone(value) {
  if (value >= 100) return 'bg-emerald-500'
  if (value >= 70) return 'bg-blue-500'
  if (value >= 40) return 'bg-amber-500'
  return 'bg-rose-500'
}

export default function JobProgress() {
  const [jobs, setJobs] = useState([])
  const [statusOptions, setStatusOptions] = useState(['Tất cả'])
  const [timeline, setTimeline] = useState([])
  const [status, setStatus] = useState('Tất cả')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const mock = await loadHardcodedMock()
        setJobs(mock?.jobProgress?.jobs || [])
        const options = mock?.jobProgress?.statusOptions || ['Tất cả']
        setStatusOptions(options)
        setStatus(options[0] || 'Tất cả')
        setTimeline(mock?.jobProgress?.timeline || [])
      } catch {
        setJobs([])
      }
    }
    loadData()
  }, [])

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase()
    return jobs.filter((item) => {
      const statusOk = status === 'Tất cả' || item.status === status
      if (!q) return statusOk
      return statusOk && `${item.project} ${item.task} ${item.client} ${item.id}`.toLowerCase().includes(q)
    })
  }, [jobs, status, search])

  return (
    <div className="bg-[#f7f9fc] text-on-surface">
      <DashboardSidebar activeKey="job-progress" />
      <main className="lg:ml-64 min-h-screen p-5">
        <h1 className="mb-4 text-[22px] font-semibold text-slate-900">Tien do công việc</h1>
        <section className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <input
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-[14px] lg:col-span-7"
            placeholder="Tìm theo mã job, dự án, khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="h-11 rounded-lg border border-slate-300 bg-white px-3.5 text-[14px] lg:col-span-3" value={status} onChange={(e) => setStatus(e.target.value)}>
            {statusOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </section>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <section className="xl:col-span-8">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {filteredJobs.map((job) => (
                  <article key={job.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-[15px] font-semibold text-slate-900">{job.project} <span className="text-xs text-slate-400">({job.id})</span></h3>
                        <p className="text-[13px] text-slate-600">{job.task}</p>
                        <p className="text-[12px] text-slate-500">{job.client} - {job.updatedAt}</p>
                        <p className="text-[12px] text-slate-500">Deadline: {job.deadline}</p>
                      </div>
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{job.status}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${progressTone(job.progress)}`} style={{ width: `${job.progress}%` }} />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <aside className="space-y-4 xl:col-span-4">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-[17px] font-semibold text-slate-900">Nhat ky tien do</h3>
              <div className="space-y-2">
                {timeline.map((item) => (
                  <article key={item.title} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <p className="text-[13px] font-medium text-slate-700">{item.title}</p>
                    <p className={`mt-1 text-[12px] ${item.tone}`}>{item.time}</p>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}
