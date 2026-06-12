import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { adminLogin } from '../../api/adminService.js'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const redirectPath = new URLSearchParams(location.search).get('redirect')
  const nextPath = redirectPath?.startsWith('/admin/') && redirectPath !== '/admin/login' ? redirectPath : '/admin/dashboard'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await adminLogin({ email, password })
      navigate(nextPath, { replace: true })
    } catch (submitError) {
      setError(submitError.message || 'Không thể đăng nhập admin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.45)]">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Mycoder Admin</p>
        <h1 className="mt-3 text-[32px] font-bold tracking-tight text-slate-900">Đăng nhập</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            placeholder="admin@example.com"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            placeholder="password"
          />
          {error ? <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center rounded-md bg-slate-900 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập admin'}
          </button>
        </form>
      </div>
    </div>
  )
}
