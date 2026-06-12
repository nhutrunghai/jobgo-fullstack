import { useEffect, useMemo, useState } from 'react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'
import { loadHardcodedMock } from '../data/hardcodedClient.js'

const statCardStyles = [
  { shell: 'bg-blue-50 border-blue-100', value: 'text-blue-700' },
  { shell: 'bg-emerald-50 border-emerald-100', value: 'text-emerald-700' },
  { shell: 'bg-amber-50 border-amber-100', value: 'text-amber-700' },
  { shell: 'bg-slate-100 border-slate-200', value: 'text-slate-700' },
]

export default function JobDirectory() {
  const [jobs, setJobs] = useState([])
  const [statusOptions, setStatusOptions] = useState(['Chọn trạng thái'])
  const [statCards, setStatCards] = useState([])
  const [status, setStatus] = useState('Chọn trạng thái')

  useEffect(() => {
    const loadData = async () => {
      try {
        const mock = await loadHardcodedMock()
        setJobs(mock?.jobDirectory?.jobs || [])
        const options = mock?.jobDirectory?.statusOptions || ['Chọn trạng thái']
        setStatusOptions(options)
        setStatus(options[0] || 'Chọn trạng thái')
        setStatCards(mock?.jobDirectory?.statCards || [])
      } catch {
        setJobs([])
      }
    }
    loadData()
  }, [])

  const filtered = useMemo(() => {
    if (status === 'Chọn trạng thái') return jobs
    return jobs.filter((job) => job.status === status)
  }, [jobs, status])

  return (
    <div className="bg-[#f7f9fc] text-on-surface">
      <DashboardSidebar activeKey="jobs" />
      <main className="lg:ml-64 min-h-screen p-5">
        <h1 className="mb-4 text-[22px] font-semibold text-slate-900">Job Directory</h1>
        <section className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card, index) => {
            const tone = statCardStyles[index % statCardStyles.length]
            return (
            <article key={card.title} className={`rounded-xl border p-4 shadow-sm ${tone.shell}`}>
              <p className="text-sm text-slate-500">{card.title}</p>
              <p className={`mt-1 text-2xl font-extrabold ${tone.value}`}>{card.value}</p>
            </article>
            )
          })}
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3">
            <select className="h-10 rounded-lg border border-slate-300 bg-white px-3" value={status} onChange={(e) => setStatus(e.target.value)}>
              {statusOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            {filtered.map((job) => (
              <article key={job.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{job.title}</p>
                  <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-600">{job.status}</span>
                </div>
                <p className="text-sm text-slate-600">{job.company} - {job.location}</p>
                <p className="text-sm text-emerald-600">{job.salary}</p>
                <p className="text-xs text-slate-500">ID: {job.id}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
