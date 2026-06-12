import { useEffect, useState } from 'react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'
import { loadHardcodedMock } from '../data/hardcodedClient.js'

export default function Contracts() {
  const [statCards, setStatCards] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const mock = await loadHardcodedMock()
        setStatCards(mock?.contracts?.statCards || [])
      } catch {
        setStatCards([])
      }
    }
    loadData()
  }, [])

  return (
    <div className="bg-[#f7f9fc] text-on-surface">
      <DashboardSidebar activeKey="contracts" />
      <main className="lg:ml-64 min-h-screen p-5">
        <h1 className="mb-4 text-[22px] font-extrabold text-slate-900">Hợp đồng dự án</h1>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article key={card.title} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[15px] font-semibold text-slate-700">{card.title}</p>
                  <p className="mt-1.5 text-[30px] font-extrabold leading-none text-slate-900">{card.value}</p>
                  <p className="mt-1.5 text-[13px] text-slate-500">{card.trend}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.tone}`}>
                  <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
