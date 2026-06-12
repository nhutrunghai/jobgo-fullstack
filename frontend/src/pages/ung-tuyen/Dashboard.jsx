import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardSidebar from '../../components/DashboardSidebar.jsx'
import { loadHardcodedMock } from '../../data/hardcodedClient.js'

export default function Dashboard() {
  const [overviewCards, setOverviewCards] = useState([])
  const [quickActions, setQuickActions] = useState([])
  const [activities, setActivities] = useState([])

  useEffect(() => {
    const loadData = async () => {
      const mock = await loadHardcodedMock()
      const data = mock?.ungTuyen?.dashboard || {}
      setOverviewCards(data.overviewCards || [])
      setQuickActions(data.quickActions || [])
      setActivities(data.activities || [])
    }
    loadData().catch(() => {})
  }, [])

  return (
    <div className="bg-[#f6f8fb] text-on-surface">
      <DashboardSidebar activeKey="dashboard" />
      <main className="lg:ml-64 min-h-screen p-5">
        <header className="mb-4 flex items-center gap-2">
          <Link to="/" className="rounded-md p-1.5 text-slate-600 transition hover:bg-slate-100">
            <span className="material-symbols-outlined !text-[20px]">arrow_back</span>
          </Link>
          <h1 className="text-[31px] font-semibold text-slate-900">Trang chủ</h1>
        </header>

        <section className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {overviewCards.map((card) => (
            <article key={card.key} className={`rounded-lg bg-gradient-to-br ${card.shell} p-4 text-white`}>
              <p className="text-xs font-semibold">{card.badge}</p>
              <p className="mt-1 text-[30px] font-extrabold leading-none">{card.value}</p>
              <p className="mt-1 text-sm">{card.label}</p>
            </article>
          ))}
        </section>

        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Thao tác nhanh</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {quickActions.map((item) => (
              <button key={item.label} className={`rounded-md px-3 py-2 text-sm font-semibold text-white ${item.tone}`}>
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Hoạt động gần đây</h2>
          <div className="space-y-2">
            {activities.map((item) => (
              <article key={item.title} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-sm font-medium">{item.title}</p>
                <p className={`text-xs ${item.tone}`}>{item.time}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
