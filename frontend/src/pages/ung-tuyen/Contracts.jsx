import { useEffect, useState } from 'react'
import DashboardSidebar from '../../components/DashboardSidebar.jsx'
import { loadHardcodedMock } from '../../data/hardcodedClient.js'

export default function Contracts() {
  const [statCards, setStatCards] = useState([])

  useEffect(() => {
    const loadData = async () => {
      const mock = await loadHardcodedMock()
      setStatCards(mock?.ungTuyen?.contracts?.statCards || [])
    }
    loadData().catch(() => {})
  }, [])

  return (
    <div className="bg-[#f7f9fc] text-on-surface">
      <DashboardSidebar activeKey="contracts" />
      <main className="lg:ml-64 min-h-screen p-5">
        <h1 className="mb-4 text-[22px] font-bold">Hợp đồng dự án</h1>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article key={card.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-slate-500">{card.trend}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
