import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMyProfile } from '../api/userService.js'
import UserAvatar from '../components/UserAvatar.jsx'
import { getAccessToken, getRefreshToken } from '../config/api.js'
import { loadPortalMock } from '../data/mockClient.js'

const homeNav = [
  { label: 'Việc làm IT', path: '/search-jobs', icon: 'work' },
  { label: 'Bài viết', path: '/discussions', icon: 'article' },
  { label: 'AI Agent', path: '/ai-agent', icon: 'smart_toy' },
]

export default function Discussions() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Tất cả')
  const [forumPosts, setForumPosts] = useState([])
  const [filterOptions, setFilterOptions] = useState(['Tất cả'])
  const [userProfile, setUserProfile] = useState(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAccessToken() || getRefreshToken()))

  useEffect(() => {
    const loadData = async () => {
      try {
        const mock = await loadPortalMock()
        setForumPosts(mock?.discussions?.forumPosts || [])
        setFilterOptions(mock?.discussions?.filterOptions || ['Tất cả'])
      } catch {
        setForumPosts([])
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    let active = true

    if (!isAuthenticated) {
      return () => {
        active = false
      }
    }

    getMyProfile()
      .then((profile) => {
        if (active) setUserProfile(profile)
      })
      .catch(() => {
        if (active) setUserProfile(null)
      })

    return () => {
      active = false
    }
  }, [isAuthenticated])

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase()
    return forumPosts.filter((post) => {
      const filterOk = filter === 'Tất cả' || (post.tags || []).includes(filter)
      if (!q) return filterOk
      return filterOk && `${post.author} ${post.content} ${(post.tags || []).join(' ')}`.toLowerCase().includes(q)
    })
  }, [query, filter, forumPosts])

  const profileName = userProfile?.fullName || userProfile?.username || 'Tài khoản người dùng'
  const profileHandle = userProfile?.username ? `@${userProfile.username}` : '@mycoder-user'
  const profileAvatar = userProfile?.avatar || ''

  const handleLogout = () => {
    ;['token', 'accessToken', 'refreshToken', 'user', 'authUser', 'isLoggedIn'].forEach((key) => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })
    setUserMenuOpen(false)
    setIsAuthenticated(false)
    setUserProfile(null)
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f2f5fa] text-slate-900">
      <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-2 sm:px-5">
          <div className="flex min-w-0 items-center gap-6">
            <Link to="/" className="flex min-w-0 items-center text-lg font-bold tracking-tight text-[#2b59ff] sm:text-xl">
              <span className="material-symbols-outlined mr-1 text-2xl">code</span>
              MYCODER
            </Link>
            <div className="hidden items-center gap-4 text-[13.5px] font-medium text-slate-600 lg:flex">
              {homeNav.map((item) => (
                <Link
                  key={item.label}
                  className={`nav-link-animate flex items-center gap-1.5 ${item.path === '/discussions' ? 'font-semibold text-[#2b59ff]' : ''}`}
                  to={item.path}
                >
                  <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/notifications" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 sm:h-10 sm:w-10">
                  <span className="material-symbols-outlined">notifications</span>
                </Link>
                <Link to="/messages" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 sm:h-10 sm:w-10">
                  <span className="material-symbols-outlined">chat</span>
                </Link>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="block h-9 w-9 overflow-hidden rounded-full border border-slate-200 bg-slate-200 transition hover:ring-2 hover:ring-blue-100"
                  >
                    <UserAvatar src={profileAvatar} name={profileName} className="h-full w-full" textClassName="text-xs" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 z-[60] w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)]">
                      <div className="border-b border-slate-100 px-3 py-2">
                        <p className="truncate text-sm font-bold text-slate-800">{profileName}</p>
                        <p className="truncate text-xs text-slate-400">{profileHandle}</p>
                      </div>
                      <div className="pt-2">
                        <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                          <span className="material-symbols-outlined text-[18px]">dashboard</span>
                          Dashboard
                        </Link>
                        <Link to="/favorites" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                          <span className="material-symbols-outlined text-[18px]">favorite</span>
                          Việc yêu thích
                        </Link>
                        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50">
                          <span className="material-symbols-outlined text-[18px]">logout</span>
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-sky-200 hover:text-sky-800 sm:h-10 sm:px-4 sm:text-sm">
                  Đăng nhập
                </Link>
                <Link to="/register" className="inline-flex h-9 items-center justify-center rounded-full bg-[#2b59ff] px-3 text-xs font-bold text-white transition hover:bg-[#1f4bf1] sm:h-10 sm:px-4 sm:text-sm">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
          {homeNav.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-bold transition ${
                item.path === '/discussions' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-[1180px] px-4 py-4 sm:px-5">
        <header className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <h1 className="text-[21px] font-extrabold leading-tight text-slate-900 sm:text-[22px]">Diễn đàn bài viết</h1>
            <p className="mt-1 text-sm text-slate-500">
              <Link to="/" className="font-semibold text-blue-600">Trang chủ</Link> {'>'} Bài viết
            </p>
          </div>
          <div className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-600 sm:w-auto">
            {filteredPosts.length} bài viết
          </div>
        </header>

        <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
            <input
              className="h-10 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-[14px] outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              placeholder="Tìm bài viết trong diễn đàn..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-[14px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {filterOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="space-y-3">
          {filteredPosts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start gap-3">
                <img src={post.avatar} alt={post.author} className="h-10 w-10 rounded-full object-cover" />
              <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-slate-900">{post.author}</p>
                  <p className="text-[12px] text-slate-500">{post.role} - {post.time}</p>
                </div>
              </div>
              <p className="text-[14px] leading-6 text-slate-700">{post.content}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(post.tags || []).map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">#{tag}</span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>Like: {post.likes ?? 0}</span>
                <span>Comments: {post.comments ?? 0}</span>
                <span>Shares: {post.shares ?? 0}</span>
              </div>
            </article>
          ))}
          {filteredPosts.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Không có bài viết phù hợp.</p>}
        </section>
      </main>
    </div>
  )
}
