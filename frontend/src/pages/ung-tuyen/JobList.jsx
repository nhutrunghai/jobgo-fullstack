import { useEffect, useMemo, useState } from 'react'
import DashboardSidebar from '../../components/DashboardSidebar.jsx'
import { loadHardcodedMock } from '../../data/hardcodedClient.js'

export default function JobList() {
  const [statusOptions, setStatusOptions] = useState([])
  const [statCards, setStatCards] = useState([])
  const [appliedJobs, setAppliedJobs] = useState([])
  const [status, setStatus] = useState('Chọn trạng thái')

  useEffect(() => {
    const loadData = async () => {
      const mock = await loadHardcodedMock()
      const data = mock?.ungTuyen?.jobList || {}
      const options = data.statusOptions || []
      setStatusOptions(options)
      setStatus(options[0] || 'Chọn trạng thái')
      setStatCards(data.statCards || [])
      setAppliedJobs(data.appliedJobs || [])
    }
    loadData().catch(() => {})
  }, [])

  const stats = useMemo(() => {
    const total = appliedJobs.length
    const pending = appliedJobs.filter((j) => j.status === 'Chờ duyệt').length
    const accepted = appliedJobs.filter((j) => j.status === 'Chấp nhận').length
    const successRate = total ? `${Math.round((accepted / total) * 100)}%` : '0%'
    return { total, pending, accepted, successRate }
  }, [appliedJobs])

  return (
    <div className="bg-[#f7f9fc] text-on-surface">
      <DashboardSidebar activeKey="applied-jobs" />
      <main className="lg:ml-64 min-h-screen p-5">
        <h1 className="mb-4 text-[22px] font-bold">Job đã ứng tuyển</h1>
        <section className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article key={card.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">{card.title}</p>
              <p className="text-2xl font-bold">{stats[card.key] ?? 0}</p>
            </article>
          ))}
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <select className="h-10 rounded-lg border border-slate-300 px-3" value={status} onChange={(e) => setStatus(e.target.value)}>
            {statusOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </section>
      </main>
    </div>
  )
}
