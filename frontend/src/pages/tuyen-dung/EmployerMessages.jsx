import { useEffect, useMemo, useState } from 'react'
import DashboardSidebar from '../../components/DashboardSidebar.jsx'
import { loadHardcodedMock } from '../../data/hardcodedClient.js'

export default function EmployerMessages() {
  const [conversations, setConversations] = useState([])
  const [quickReplies, setQuickReplies] = useState([])
  const [activeId, setActiveId] = useState('')
  const [input, setInput] = useState('')

  useEffect(() => {
    const loadData = async () => {
      const mock = await loadHardcodedMock()
      const list = mock?.employerMessages?.conversations || []
      setConversations(list)
      setQuickReplies(mock?.employerMessages?.quickReplies || [])
      setActiveId(list[0]?.id || '')
    }
    loadData().catch(() => {})
  }, [])

  const active = useMemo(() => conversations.find((item) => item.id === activeId) || conversations[0] || null, [conversations, activeId])

  const send = () => {
    if (!input.trim() || !active) return
    setConversations((prev) =>
      prev.map((item) =>
        item.id === active.id
          ? { ...item, messages: [...item.messages, { from: 'employer', text: input.trim(), time: 'Now' }], lastMessage: input.trim() }
          : item,
      ),
    )
    setInput('')
  }

  return (
    <div className="bg-[#f7f9fc] text-on-surface">
      <DashboardSidebar activeKey="employer-messages" />
      <main className="min-h-screen p-4 lg:ml-64 lg:p-5">
        <h1 className="mb-4 text-[22px] font-bold sm:text-[24px]">Tin nhắn nhà tuyển dụng</h1>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <section className="max-h-[360px] space-y-2 overflow-y-auto xl:col-span-4 xl:max-h-none">
            {conversations.map((item) => (
              <button key={item.id} className={`w-full rounded-lg border p-3 text-left ${active?.id === item.id ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`} onClick={() => setActiveId(item.id)}>
                <p className="truncate font-semibold">{item.name}</p>
                <p className="text-sm text-slate-500">{item.role}</p>
                <p className="mt-1 text-sm">{item.lastMessage}</p>
              </button>
            ))}
          </section>
          <section className="xl:col-span-8 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 truncate font-semibold">{active?.name || 'Chưa có hội thoại'}</h2>
            <div className="mb-3 space-y-2">
              {(active?.messages || []).map((msg, idx) => (
                <div key={`${idx}-${msg.time}`} className={`rounded-lg px-3 py-2 text-sm ${msg.from === 'employer' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  <p>{msg.text}</p>
                  <p className={`mt-1 text-[11px] ${msg.from === 'employer' ? 'text-blue-100' : 'text-slate-500'}`}>{msg.time}</p>
                </div>
              ))}
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {quickReplies.map((item) => (
                <button key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs" onClick={() => setInput(item)}>
                  {item}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input className="h-10 flex-1 rounded-lg border border-slate-300 px-3" value={input} onChange={(e) => setInput(e.target.value)} />
              <button className="h-10 rounded-lg bg-blue-600 px-4 text-white" onClick={send}>Gửi</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
