import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUserNotificationUnreadCount, subscribeUnreadNotificationCount } from './api/notificationService.js'
import { getMyProfile } from './api/userService.js'
import UserAvatar from './components/UserAvatar.jsx'
import { loadFavoriteIds, loadFeaturedJobs, loadHomeMeta, loadLatestJobs, toggleFavoriteJob } from './data/apiClient.js'

const AUTH_SESSION_KEYS = ['token', 'accessToken', 'refreshToken', 'isLoggedIn']

function hasActiveAuthSession() {
  if (typeof window === 'undefined') return false

  return AUTH_SESSION_KEYS.some((key) => window.localStorage.getItem(key) || window.sessionStorage.getItem(key))
}

const homeNav = [
  { label: 'Việc làm IT', path: '/search-jobs', icon: 'work' },
  { label: 'Bài viết', path: '/discussions', icon: 'article' },
  { label: 'AI Agent', path: '/ai-agent', icon: 'smart_toy' },
]

const FEATURED_PAGE_LIMIT = 2
const LATEST_PAGE_LIMIT = 6

function JobCard({ job, favoriteSet, onToggleFavorite, animationDelay = '0ms' }) {
  const fav = favoriteSet.has(job.id)

  return (
    <article className="soft-radius group card-enter border border-slate-100 bg-white p-5 shadow-sm" style={{ animationDelay }}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <UserAvatar src={job.avatar} name={job.company} className="h-10 w-10 border border-slate-50" textClassName="text-xs" />
          <div className="min-w-0">
            <h4 className="truncate text-[14px] font-bold text-slate-800">{job.company}</h4>
            <p className="text-[11px] text-slate-400">{job.postedAt} • <span className="material-symbols-outlined !text-[11px]">location_on</span> {job.location}</p>
          </div>
        </div>
        <button className={`${fav ? 'text-red-500' : 'text-slate-300'} transition hover:text-red-500`} onClick={() => onToggleFavorite(job.id)}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: fav ? "'FILL' 1" : "'FILL' 0" }}>
            favorite
          </span>
        </button>
      </div>
      <Link to={`/job-detail/${job.id}`} className="mb-3 block text-[17px] font-bold text-slate-900 transition-colors group-hover:text-primary hover:text-primary">
        {job.title}
      </Link>
      <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-[#28a745]">
        <span className="material-symbols-outlined !text-[16px]">payments</span> {job.salary}
      </div>
      <p className="mb-3 text-[12px] leading-relaxed text-slate-600">
        <span className="font-semibold text-slate-700">Yêu cầu:</span> {job.requirements}
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(job.skills || []).map((skill) => (
            <span key={skill} className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-200">
              {skill}
            </span>
          ))}
        </div>
        <Link to={`/job-detail/${job.id}`} className="inline-flex justify-center rounded-lg bg-[#007bff] px-3.5 py-2 text-[12px] font-bold text-white transition hover:bg-blue-700">
          Xem chi tiết
        </Link>
      </div>
    </article>
  )
}

export default function App() {
  const navigate = useNavigate()
  const [featuredJobs, setFeaturedJobs] = useState([])
  const [latestJobs, setLatestJobs] = useState([])
  const [search, setSearch] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasActiveAuthSession())
  const [favoriteSet, setFavoriteSet] = useState(() => {
    try {
      const raw = localStorage.getItem('favorite_job_ids')
      const parsed = raw ? JSON.parse(raw) : []
      return new Set(Array.isArray(parsed) ? parsed : [])
    } catch {
      return new Set()
    }
  })
  const [bannerOpen, setBannerOpen] = useState(true)
  const [homeMeta, setHomeMeta] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [typedHeroTitle, setTypedHeroTitle] = useState('')
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [featuredPagination, setFeaturedPagination] = useState(null)
  const [latestPagination, setLatestPagination] = useState(null)
  const [isLoadingMoreFeatured, setIsLoadingMoreFeatured] = useState(false)
  const [isLoadingMoreLatest, setIsLoadingMoreLatest] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingJobs(true)
      try {
        const [featuredData, latestData, homeData, ids] = await Promise.all([
          loadFeaturedJobs({ page: 1, limit: FEATURED_PAGE_LIMIT }).catch(() => ({ jobs: [], pagination: null })),
          loadLatestJobs({ page: 1, limit: LATEST_PAGE_LIMIT }).catch(() => ({ jobs: [], pagination: null })),
          loadHomeMeta().catch(() => null),
          loadFavoriteIds().catch(() => []),
        ])
        setFeaturedJobs(featuredData?.jobs || [])
        setLatestJobs(latestData?.jobs || [])
        setFeaturedPagination(featuredData?.pagination || null)
        setLatestPagination(latestData?.pagination || null)
        setHomeMeta(homeData)
        setFavoriteSet(new Set(ids))
      } finally {
        setIsLoadingJobs(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    localStorage.setItem('favorite_job_ids', JSON.stringify(Array.from(favoriteSet)))
  }, [favoriteSet])

  useEffect(() => {
    let active = true

    if (!isAuthenticated) {
      return () => {
        active = false
      }
    }

    getMyProfile()
      .then((profile) => {
        if (active) {
          setUserProfile(profile)
        }
      })
      .catch(() => {
        if (active) {
          setUserProfile(null)
        }
      })

    return () => {
      active = false
    }
  }, [isAuthenticated])

  useEffect(() => {
    let active = true

    if (!isAuthenticated) {
      setUnreadNotificationCount(0)
      return () => {
        active = false
      }
    }

    getUserNotificationUnreadCount()
      .then((count) => {
        if (active) setUnreadNotificationCount(count)
      })
      .catch(() => {
        if (active) setUnreadNotificationCount(0)
      })

    const unsubscribe = subscribeUnreadNotificationCount((count) => {
      setUnreadNotificationCount(count)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [isAuthenticated])

  const sidebarJobs = useMemo(() => {
    const merged = [...featuredJobs, ...latestJobs]
    const seen = new Set()
    return merged.filter((job) => {
      if (!job?.id || seen.has(job.id)) return false
      seen.add(job.id)
      return true
    })
  }, [featuredJobs, latestJobs])

  const appendUniqueJobs = (currentJobs, nextJobs) => {
    const seen = new Set(currentJobs.map((job) => job.id))
    const merged = [...currentJobs]

    nextJobs.forEach((job) => {
      if (!job?.id || seen.has(job.id)) return
      seen.add(job.id)
      merged.push(job)
    })

    return merged
  }

  const handleLoadMoreFeatured = async () => {
    if (isLoadingMoreFeatured || !featuredPagination?.has_next) return

    setIsLoadingMoreFeatured(true)
    try {
      const nextPage = Number(featuredPagination?.page || 1) + 1
      const response = await loadFeaturedJobs({ page: nextPage, limit: FEATURED_PAGE_LIMIT })
      setFeaturedJobs((current) => appendUniqueJobs(current, response?.jobs || []))
      setFeaturedPagination(response?.pagination || null)
    } catch (error) {
      console.error('Failed to load more featured jobs', error)
    } finally {
      setIsLoadingMoreFeatured(false)
    }
  }

  const handleLoadMoreLatest = async () => {
    if (isLoadingMoreLatest || !latestPagination?.has_next) return

    setIsLoadingMoreLatest(true)
    try {
      const nextPage = Number(latestPagination?.page || 1) + 1
      const response = await loadLatestJobs({ page: nextPage, limit: LATEST_PAGE_LIMIT })
      setLatestJobs((current) => appendUniqueJobs(current, response?.jobs || []))
      setLatestPagination(response?.pagination || null)
    } catch (error) {
      console.error('Failed to load more latest jobs', error)
    } finally {
      setIsLoadingMoreLatest(false)
    }
  }

  const heroTitle = homeMeta?.hero?.title || 'MYCODER.COM'

  useEffect(() => {
    let index = 0
    let typingTimer

    const startTimer = window.setTimeout(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setTypedHeroTitle(heroTitle)
        return
      }

      setTypedHeroTitle('')
      typingTimer = window.setInterval(() => {
        index += 1
        setTypedHeroTitle(heroTitle.slice(0, index))

        if (index >= heroTitle.length) {
          window.clearInterval(typingTimer)
        }
      }, 95)
    }, 260)

    return () => {
      window.clearTimeout(startTimer)
      if (typingTimer) window.clearInterval(typingTimer)
    }
  }, [heroTitle])
  const profileName = userProfile?.fullName || userProfile?.username || 'Tài khoản người dùng'
  const profileHandle = userProfile?.username ? `@${userProfile.username}` : '@mycoder-user'
  const profileAvatar = userProfile?.avatar || ''
  const heroSubtitle = homeMeta?.hero?.subtitle || 'Nền tảng việc làm công nghệ chất lượng cho developer Việt Nam.'

  const toggleFavorite = (key) => {
    const shouldFavorite = !favoriteSet.has(key)

    setFavoriteSet((prev) => {
      const next = new Set(prev)
      if (shouldFavorite) next.add(key)
      else next.delete(key)
      return next
    })

    toggleFavoriteJob(key, shouldFavorite).catch(() => {
      setFavoriteSet((prev) => {
        const next = new Set(prev)
        if (shouldFavorite) next.delete(key)
        else next.add(key)
        return next
      })
      if (!hasActiveAuthSession()) {
        navigate('/login', { state: { from: { pathname: '/', search: '' } } })
      }
    })
  }

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

  const handleSearchNavigate = () => {
    const q = search.trim()
    navigate(q ? `/search-jobs?q=${encodeURIComponent(q)}` : '/search-jobs')
  }

  return (
    <div className="bg-white text-on-surface">
      <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-2 sm:px-6">
          <div className="flex min-w-0 items-center gap-6">
            <Link to="/" className="flex min-w-0 items-center text-lg font-bold tracking-tight text-[#2b59ff] sm:text-xl">
              <span className="material-symbols-outlined mr-1 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                code
              </span>
              MYCODER
            </Link>
            <div className="hidden items-center gap-4 text-[13.5px] font-medium text-slate-600 lg:flex">
              {homeNav.map((item) => (
                <Link key={item.label} className="nav-link-animate flex items-center gap-1.5" to={item.path}>
                  <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200">
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadNotificationCount > 0 ? (
                    <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-sky-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </span>
                  ) : null}
                </Link>
                <Link to="/messages" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200">
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
                        <Link to="/user/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                          <span className="material-symbols-outlined text-[18px]">person</span>
                          Hồ sơ
                        </Link>
                        <Link to="/user/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                          <span className="material-symbols-outlined text-[18px]">settings</span>
                          Cài đặt
                        </Link>
                        <Link to="/messages" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                          <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                          Tin nhắn
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
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-slate-50 px-3 text-xs font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6 sm:py-4">
        <div className={`soft-radius mb-4 flex flex-col items-start justify-between gap-2 border border-slate-100 bg-white p-2.5 shadow-sm transition-all duration-300 sm:mb-6 sm:flex-row sm:items-center ${bannerOpen ? 'max-h-32 opacity-100 sm:max-h-28' : 'pointer-events-none max-h-0 overflow-hidden opacity-0'}`}>
          <div className="flex items-start gap-2 text-sm sm:items-center sm:gap-3">
            <span className="font-semibold text-orange-500">Tin hot:</span>
            <span className="text-slate-600">{homeMeta?.hero?.announcement || 'Cập nhật việc làm mới mỗi ngày cho cộng đồng lập trình viên.'}</span>
          </div>
          <button className="self-end text-slate-400 hover:text-slate-600 sm:self-auto" onClick={() => setBannerOpen(false)}>
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <section className="mx-0 mb-6 animate-fade-up lg:mx-[calc(50%-50vw+5rem)] lg:mb-10">
          <div className="soft-radius relative flex h-[220px] items-center overflow-hidden bg-gradient-to-r from-[#20c3d0] via-[#2489d2] to-[#1e58b1] shadow-lg md:h-[280px]">
            <div className="z-10 w-full px-5 text-left text-white md:w-[72%] md:px-14">
              <h1 className="typewriter-title mb-2 text-[32px] font-black leading-tight tracking-tight md:text-[56px]" aria-label={heroTitle}>
                {typedHeroTitle || '\u00a0'}
              </h1>
              <p className="text-base font-medium leading-7 opacity-95 md:text-2xl">{heroSubtitle}</p>
            </div>
            <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>
        </section>

        <div className="mx-auto max-w-[1360px]">
          <div className="grid grid-cols-1 gap-8 pb-12 lg:grid-cols-12">
            <aside className="order-2 space-y-4 lg:order-none lg:col-span-2 animate-fade-up" style={{ animationDelay: '70ms' }}>
              <div className="soft-radius border border-slate-100 bg-white p-4 shadow-sm">
                {isAuthenticated ? (
                  <>
                    <div className="mb-6 flex flex-col items-center text-center">
                      <div className="mb-3 h-16 w-16 overflow-hidden rounded-full border border-slate-100 bg-slate-100">
                        <UserAvatar src={profileAvatar} name={profileName} className="h-full w-full" textClassName="text-lg" />
                      </div>
                      <p className="max-w-full truncate text-sm font-bold text-slate-800">{profileName}</p>
                      <p className="max-w-full truncate text-[11px] text-slate-400">{profileHandle}</p>
                    </div>
                    <nav className="space-y-1">
                      {[
                        { label: 'Việc làm', to: '#' },
                        { label: 'Tìm Developer', to: '#' },
                        { label: 'Việc đã ứng tuyển', to: '/jobs' },
                        { label: 'Việc yêu thích', to: '/favorites' },
                        { label: 'Quản lý việc', to: '/dashboard' },
                      ].map((item, i) =>
                        item.to === '#' ? (
                          <a key={item.label} className={`soft-radius flex items-center gap-3 px-3 py-2 text-[13px] font-medium transition-colors ${i === 0 ? 'bg-blue-50 font-semibold text-primary' : 'text-slate-600 hover:bg-slate-50'}`} href="#">
                            {item.label}
                          </a>
                        ) : (
                          <Link key={item.label} className={`soft-radius flex items-center gap-3 px-3 py-2 text-[13px] font-medium transition-colors ${i === 0 ? 'bg-blue-50 font-semibold text-primary' : 'text-slate-600 hover:bg-slate-50'}`} to={item.to}>
                            {item.label}
                          </Link>
                        ),
                      )}
                    </nav>
                  </>
                ) : (
                  <div className="space-y-3 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#2b59ff]">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Tham gia MYCODER</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Đăng nhập để lưu việc, ứng tuyển và quản lý hồ sơ.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link to="/login" className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-sky-200 hover:text-sky-800">
                        Đăng nhập
                      </Link>
                      <Link to="/register" className="inline-flex h-10 items-center justify-center rounded-full bg-[#2b59ff] px-3 text-xs font-bold text-white transition hover:bg-[#1f4bf1]">
                        Đăng ký
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="soft-radius border border-slate-100 bg-white p-4 shadow-sm">
                <h3 className="mb-4 text-[14px] font-bold text-slate-800">Danh mục phổ biến</h3>
                <div className="space-y-3 text-[13px]">
                  {(homeMeta?.categories || []).slice(0, 5).map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-slate-600">{item.name}</span>
                      <span className="text-slate-400">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div className="order-1 space-y-5 lg:order-none lg:col-span-7 animate-fade-up" style={{ animationDelay: '120ms' }}>
              <div className="soft-radius border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-sm font-bold text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>work</span>
                  Tìm kiếm việc làm
                </div>
                <div className="relative mb-4 flex flex-col gap-2 sm:block">
                  <span className="material-symbols-outlined absolute left-4 top-[22px] -translate-y-1/2 text-slate-400 sm:top-1/2">search</span>
                  <input
                    className="soft-radius w-full border border-slate-200 py-2.5 pl-11 pr-4 text-[14px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:pr-32"
                    placeholder="Tìm kiếm công việc, kỹ năng, công ty..."
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearchNavigate()
                    }}
                  />
                  <button type="button" onClick={handleSearchNavigate} className="h-10 rounded-md bg-[#2b59ff] px-4 text-xs font-bold text-white transition hover:bg-[#1f4bf1] sm:absolute sm:right-1.5 sm:top-1/2 sm:h-9 sm:-translate-y-1/2">
                    Tìm kiếm
                  </button>
                </div>
              </div>

              <section>
                <div className="soft-radius mb-5 overflow-hidden border border-[#cae5ff] bg-[linear-gradient(135deg,#eff8ff_0%,#f8fbff_45%,#ffffff_100%)] shadow-sm">
                  <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
                    <div>
                      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#2b59ff]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#2b59ff]">
                        <span className="material-symbols-outlined !text-[15px]">workspace_premium</span>
                        Gợi ý nổi bật
                      </div>
                      <h2 className="text-[20px] font-black tracking-tight text-slate-900">Việc làm tốt nhất</h2>
                      <p className="mt-1 text-[13px] text-slate-600">Những cơ hội được ưu tiên hiển thị nhằm phù hợp hơn với mục tiêu của bạn.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {featuredJobs.map((job, index) => (
                    <JobCard key={`featured-${job.id}`} job={job} favoriteSet={favoriteSet} onToggleFavorite={toggleFavorite} animationDelay={`${180 + index * 50}ms`} />
                  ))}
                  {!isLoadingJobs && featuredJobs.length === 0 && (
                    <div className="soft-radius border border-dashed border-slate-200 bg-white px-4 py-5 text-center text-[13px] text-slate-500">
                      Chưa có job promotion để hiển thị.
                    </div>
                  )}
                  {featuredPagination?.has_next && (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={handleLoadMoreFeatured}
                        disabled={isLoadingMoreFeatured}
                        className="inline-flex h-11 items-center justify-center rounded-full border border-[#b7d7ff] bg-white px-5 text-[13px] font-bold text-[#2b59ff] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isLoadingMoreFeatured ? 'Đang tải...' : 'Xem thêm'}
                      </button>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <div className="soft-radius mb-5 overflow-hidden border border-[#d7eef2] bg-[linear-gradient(135deg,#f2fbfd_0%,#f7fdff_48%,#ffffff_100%)] shadow-sm">
                  <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
                    <div>
                      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#20c3d0]/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#168fa5]">
                        <span className="material-symbols-outlined !text-[15px]">schedule</span>
                        Mới cập nhật
                      </div>
                      <h2 className="text-[20px] font-black tracking-tight text-slate-900">Việc làm mới nhất</h2>
                      <p className="mt-1 text-[13px] text-slate-600">Cập nhật liên tục các tin đăng mới để bạn theo dõi và ứng tuyển nhanh hơn.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {latestJobs.map((job, index) => (
                    <JobCard key={`latest-${job.id}`} job={job} favoriteSet={favoriteSet} onToggleFavorite={toggleFavorite} animationDelay={`${320 + index * 50}ms`} />
                  ))}
                  {!isLoadingJobs && latestJobs.length === 0 && (
                    <div className="soft-radius border border-dashed border-slate-200 bg-white px-4 py-5 text-center text-[13px] text-slate-500">
                      Chưa có job mới nhất để hiển thị.
                    </div>
                  )}
                  {latestPagination?.has_next && (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={handleLoadMoreLatest}
                        disabled={isLoadingMoreLatest}
                        className="inline-flex h-11 items-center justify-center rounded-full border border-[#bce8ee] bg-white px-5 text-[13px] font-bold text-[#168fa5] transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isLoadingMoreLatest ? 'Đang tải...' : 'Xem thêm'}
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <aside className="order-3 space-y-5 lg:order-none lg:col-span-3 animate-fade-up" style={{ animationDelay: '170ms' }}>
              <div className="soft-radius border border-slate-100 bg-white p-6 shadow-sm lg:sticky lg:top-20">
                <h2 className="mb-6 flex items-center gap-2 text-[16px] font-bold text-slate-800">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                  Công việc nổi bật
                </h2>
                <div className="space-y-2.5">
                  {sidebarJobs.slice(0, 5).map((job, i) => (
                    <Link key={job.id} to={`/job-detail/${job.id}`} className="soft-radius flex cursor-pointer items-start gap-3 px-2 py-1.5 transition-all hover:bg-slate-50">
                      <span className="pt-0.5 text-[17px] font-bold text-primary">{i + 1}.</span>
                      <p className="text-[13.5px] font-medium leading-6 text-slate-700">{job.title}</p>
                    </Link>
                  ))}
                  {!isLoadingJobs && sidebarJobs.length === 0 && (
                    <p className="text-[13px] text-slate-500">Chưa có dữ liệu công việc để hiển thị.</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 py-10 text-slate-600">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="mb-10 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 lg:grid-cols-6">
            <div className="col-span-2">
              <div className="mb-4 flex items-center text-xl font-bold tracking-tight text-[#2b59ff]">
                <span className="material-symbols-outlined mr-1 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>code</span>
                MYCODER
              </div>
              <p className="mb-6 max-w-xs text-[13px] leading-relaxed text-slate-500">{homeMeta?.footer?.brandDescription || 'Nền tảng kết nối nhà tuyển dụng và developer chất lượng cao tại Việt Nam.'}</p>
            </div>
            {(homeMeta?.footer?.columns || []).map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-slate-900">{col.title}</h4>
                <ul className="space-y-2.5 text-[13px]">
                  {(col.links || []).map((link) => (
                    <li key={link}>
                      <a className="transition-colors hover:text-primary" href="#">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
