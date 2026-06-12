import { useEffect, useMemo, useState } from 'react'
import DashboardSidebar from '../../components/DashboardSidebar.jsx'
import { loadHardcodedMock } from '../../data/hardcodedClient.js'

export default function JobDirectory() {
  const [statusOptions, setStatusOptions] = useState([])
  const [statCards, setStatCards] = useState([])
  const [status, setStatus] = useState('Chọn trạng thái')

  useEffect(() => {
    const loadData = async () => {
      const mock = await loadHardcodedMock()
      const data = mock?.ungTuyen?.jobDirectory || {}
      const options = data.statusOptions || []
      setStatusOptions(options)
      setStatus(options[0] || 'Chọn trạng thái')
      setStatCards(data.statCards || [])
    }
    loadData().catch(() => {})
  }, [])

  const stats = useMemo(() => ({ total: 0, pending: 0, accepted: 0, successRate: 0 }), [])

  return (
    <div className="bg-[#f8fafc] text-on-surface">
      <DashboardSidebar activeKey="job-list" />
      <main className="lg:ml-64 min-h-screen p-5">
        <h1 className="mb-4 text-[22px] font-bold">Danh sách Job</h1>
        <section className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article key={card.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">{card.title}</p>
              <p className="text-2xl font-bold">{stats[card.key] ?? 0}{card.suffix ?? ''}</p>
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
