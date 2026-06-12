import { useEffect, useMemo, useState } from 'react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'
import { loadPortalMock } from '../data/mockClient.js'

const typeLabelMap = {
  application: 'Ứng tuyển',
  system: 'Hệ thống',
}

const typeToneMap = {
  application: 'border-blue-100 bg-blue-50 text-blue-700',
  system: 'border-emerald-100 bg-emerald-50 text-emerald-700',
}

function initials(name = '') {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'M'
}

export default function MessagesCenter() {
  const [query, setQuery] = useState('')
  const [threads, setThreads] = useState([])
  const [messagesByThread, setMessagesByThread] = useState({})
  const [websiteNotifications, setWebsiteNotifications] = useState([])
  const [activeThreadId, setActiveThreadId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadData = async () => {
      setLoading(true)
      try {
        const mock = await loadPortalMock()
        if (!active) return

        const nextThreads = mock?.messages?.threads || []
        setThreads(nextThreads)
        setMessagesByThread(mock?.messages?.messagesByThread || {})
        setWebsiteNotifications(mock?.messages?.websiteNotifications || [])
        setActiveThreadId(nextThreads[0]?.id || '')
      } catch {
        if (!active) return
        setThreads([])
        setMessagesByThread({})
        setWebsiteNotifications([])
        setActiveThreadId('')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [])

  const filteredThreads = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return threads

    return threads.filter((thread) =>
      `${thread.name} ${thread.role} ${thread.lastMessage} ${thread.type}`.toLowerCase().includes(keyword)
    )
  }, [query, threads])

  const activeThread = filteredThreads.find((thread) => thread.id === activeThreadId) || filteredThreads[0] || null
  const conversation = activeThread ? messagesByThread[activeThread.id] || [] : []
  const totalUnread = threads.reduce((sum, thread) => sum + Number(thread.unread || 0), 0)

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <DashboardSidebar activeKey="messages" />

      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur lg:px-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">Trung tâm liên lạc</p>
              <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-slate-950 sm:text-[32px]">Tin nhắn</h1>
              <p className="mt-1.5 text-sm text-slate-500">Theo dõi hội thoại với nhà tuyển dụng và các thông báo quan trọng.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Hội thoại</p>
                <p className="mt-1 text-lg font-extrabold text-slate-950">{threads.length}</p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 shadow-sm">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-400">Chưa đọc</p>
                <p className="mt-1 text-lg font-extrabold text-blue-700">{totalUnread}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 p-4 lg:p-6 xl:h-[calc(100vh-104px)] xl:grid-cols-[340px_minmax(0,1fr)_320px] xl:overflow-hidden">
          <section className="flex min-h-[360px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:h-full">
            <div className="border-b border-slate-100 p-4">
              <label className="relative block">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
                <input
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-[14px] font-medium outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="Tìm hội thoại..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {filteredThreads.map((thread) => {
                const active = activeThread?.id === thread.id

                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`mb-2 w-full rounded-xl border p-3 text-left transition ${
                      active ? 'border-blue-200 bg-blue-50 shadow-sm' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {initials(thread.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-[14px] font-extrabold text-slate-950">{thread.name}</p>
                          <span className="shrink-0 text-[11px] font-semibold text-slate-400">{thread.lastTime}</span>
                        </div>
                        <p className="mt-0.5 truncate text-[12px] font-medium text-slate-500">{thread.role}</p>
                        <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-slate-600">{thread.lastMessage}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] ${typeToneMap[thread.type] || typeToneMap.application}`}>
                            {typeLabelMap[thread.type] || thread.type}
                          </span>
                          {thread.unread > 0 ? (
                            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-extrabold text-white">{thread.unread}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}

              {!loading && filteredThreads.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm font-semibold text-slate-400">Không tìm thấy hội thoại phù hợp.</div>
              ) : null}
            </div>
          </section>

          <section className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:h-full xl:min-h-0">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-extrabold text-white">
                {initials(activeThread?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[17px] font-extrabold text-slate-950">{activeThread?.name || 'Chưa có hội thoại'}</h2>
                <p className="truncate text-[12px] font-medium text-slate-500">{activeThread?.role || 'Chọn một hội thoại để xem nội dung.'}</p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.08),_transparent_32%),#f8fafc] px-4 py-5">
              {conversation.map((message, index) => {
                const isMe = message.from === 'me'

                return (
                  <div key={`${message.time}-${index}`} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-[13px] leading-6 shadow-sm sm:max-w-[76%] ${
                      isMe ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                    }`}
                    >
                      <p>{message.text}</p>
                      <p className={`mt-1 text-[11px] font-semibold ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>{message.time}</p>
                    </div>
                  </div>
                )
              })}

              {conversation.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center">
                  <div>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <span className="material-symbols-outlined">chat_bubble</span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-600">Không có tin nhắn.</p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-slate-100 bg-white p-4">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-medium text-slate-400">
                <span className="material-symbols-outlined text-[18px]">lock</span>
                Chức năng trả lời trực tiếp đang được hoàn thiện.
              </div>
            </div>
          </section>

          <aside className="space-y-4 xl:h-full xl:overflow-y-auto">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[16px] font-extrabold text-slate-950">Thông báo website</h3>
                  <p className="mt-1 text-[12px] font-medium text-slate-500">Cập nhật liên quan tới hồ sơ và dự án.</p>
                </div>
                <span className="material-symbols-outlined rounded-xl bg-amber-50 p-2 text-[20px] text-amber-600">notifications</span>
              </div>

              <div className="space-y-2">
                {websiteNotifications.map((item) => (
                  <article key={`${item.title}-${item.time}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <p className="text-[13px] font-bold leading-5 text-slate-700">{item.title}</p>
                    <p className={`mt-1 text-[11px] font-semibold ${item.tone || 'text-slate-500'}`}>{item.time}</p>
                  </article>
                ))}

                {!websiteNotifications.length ? (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm font-semibold text-slate-400">
                    Chưa có thông báo mới.
                  </p>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}
