import { useEffect, useMemo, useState } from 'react'
import DashboardSidebar from '../../components/DashboardSidebar.jsx'
import { loadHardcodedMock } from '../../data/hardcodedClient.js'

export default function EmployerInterviewCalendar() {
  const [viewModes, setViewModes] = useState([])
  const [statusOptions, setStatusOptions] = useState([])
  const [roleOptions, setRoleOptions] = useState([])
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('Tất cả trạng thái')
  const [role, setRole] = useState('Mọi vị trí')
  const [view, setView] = useState('Tuần')

  useEffect(() => {
    const loadData = async () => {
      const mock = await loadHardcodedMock()
      const interview = mock?.employerInterview || {}
      setViewModes(interview.viewModes || [])
      setStatusOptions(interview.statusOptions || [])
      setRoleOptions(interview.roleOptions || [])
      setItems(interview.items || [])
      setView((interview.viewModes || [])[1] || 'Tuần')
      setStatus((interview.statusOptions || [])[0] || 'Tất cả trạng thái')
      setRole((interview.roleOptions || [])[0] || 'Mọi vị trí')
    }
    loadData().catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const statusOk = status === 'Tất cả trạng thái' || item.type === status
      const roleOk = role === 'Mọi vị trí' || item.role === role
      return statusOk && roleOk
    })
  }, [items, status, role])

  return (
    <div className="bg-[#f7f9fc] text-on-surface">
      <DashboardSidebar activeKey="employer-interviews" />
      <main className="lg:ml-64 min-h-screen p-5">
        <h1 className="mb-4 text-[24px] font-bold">Lịch phỏng vấn</h1>
        <div className="mb-4 flex flex-wrap gap-2">
          {viewModes.map((item) => (
            <button key={item} className={`rounded-lg px-3 py-2 text-sm ${view === item ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200'}`} onClick={() => setView(item)}>
              {item}
            </button>
          ))}
          <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            {statusOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
            {roleOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>

        <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {filtered.map((item) => (
            <article key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold">{item.candidate} - {item.role}</p>
              <p className="text-sm text-slate-600">{item.date} {item.time}</p>
              <p className="text-xs text-slate-500">{item.type}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
