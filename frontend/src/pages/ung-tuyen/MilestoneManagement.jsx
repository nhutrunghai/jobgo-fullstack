import { useEffect, useState } from 'react'
import DashboardSidebar from '../../components/DashboardSidebar.jsx'
import { loadHardcodedMock } from '../../data/hardcodedClient.js'

export default function MilestoneManagement() {
  const [projectOptions, setProjectOptions] = useState([])
  const [statCards, setStatCards] = useState([])
  const [items, setItems] = useState([])
  const [project, setProject] = useState('')

  useEffect(() => {
    const loadData = async () => {
      const mock = await loadHardcodedMock()
      const data = mock?.ungTuyen?.milestones || {}
      const options = data.projectOptions || []
      setProjectOptions(options)
      setProject(options[0] || '')
      setStatCards(data.statCards || [])
      setItems(data.items || [])
    }
    loadData().catch(() => {})
  }, [])

  return (
    <div className="bg-[#f7f9fc] text-on-surface">
      <DashboardSidebar activeKey="milestone" />
      <main className="lg:ml-64 min-h-screen p-5">
        <h1 className="mb-4 text-[24px] font-bold">Quản lý Milestone</h1>
        <select className="mb-4 h-10 rounded-lg border border-slate-300 px-3" value={project} onChange={(e) => setProject(e.target.value)}>
          {projectOptions.map((item) => <option key={item}>{item}</option>)}
        </select>
        <section className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article key={card.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">{card.title}</p>
              <p className="text-2xl font-bold">{items.length}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
