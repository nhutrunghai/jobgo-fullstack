import { useEffect, useState } from 'react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'
import { loadHardcodedMock } from '../data/hardcodedClient.js'

const statCardStyles = [
  { shell: 'bg-blue-50 border-blue-100', value: 'text-blue-700' },
  { shell: 'bg-emerald-50 border-emerald-100', value: 'text-emerald-700' },
  { shell: 'bg-amber-50 border-amber-100', value: 'text-amber-700' },
  { shell: 'bg-rose-50 border-rose-100', value: 'text-rose-700' },
]

export default function MilestoneManagement() {
  const [projectOptions, setProjectOptions] = useState([])
  const [statCards, setStatCards] = useState([])
  const [items, setItems] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const mock = await loadHardcodedMock()
        setProjectOptions(mock?.milestones?.projectOptions || [])
        setStatCards(mock?.milestones?.statCards || [])
        setItems(mock?.milestones?.items || [])
      } catch {
        setProjectOptions([])
        setStatCards([])
        setItems([])
      }
    }
    loadData()
  }, [])

  return (
    <div className="bg-[#f7f9fc] text-on-surface">
      <DashboardSidebar activeKey="milestones" />
      <main className="lg:ml-64 min-h-screen p-5">
        <h1 className="mb-4 text-[22px] font-semibold text-slate-900">Milestone management</h1>
        <div className="mb-4">
          <select className="h-11 rounded-lg border border-slate-300 bg-white px-3">
            {projectOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
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
          <div className="space-y-3">
            {items.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">{item.title}</p>
                  <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-600">{item.status}</span>
                </div>
                <p className="text-sm text-slate-600">{item.project}</p>
                <p className="text-xs text-slate-500">Due: {item.due} - Progress: {item.progress}%</p>
                <p className="text-xs text-slate-500">ID: {item.id}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
