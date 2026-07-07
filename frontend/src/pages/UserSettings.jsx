import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Toast from '../components/Toast.jsx'
import {
  getUserSetting,
  requestChangePasswordOtp,
  resendVerificationMail,
  setNewPasswordWithOtp,
  updateUserSetting
} from '../api/userService.js'

export default function UserSettings() {
  const [setting, setSetting] = useState(null)
  const [phone, setPhone] = useState('')
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmNewPassword: '',
    OtpCode: ''
  })
  const [loading, setLoading] = useState(true)
  const [savingPhone, setSavingPhone] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    getUserSetting()
      .then((settingData) => {
        setSetting(settingData)
        setPhone(settingData.phone || '')
      })
      .catch((error) => setToast({ type: 'error', message: error.message || 'Không thể tải cài đặt người dùng.' }))
      .finally(() => setLoading(false))
  }, [])

  const handlePhoneSubmit = async (event) => {
    event.preventDefault()
    setSavingPhone(true)
    try {
      const updated = await updateUserSetting({ phone })
      setSetting(updated)
      setToast({ type: 'success', message: updated.message || 'Đã cập nhật cài đặt người dùng.' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể cập nhật cài đặt.' })
    } finally {
      setSavingPhone(false)
    }
  }

  const handleResendMail = async () => {
    try {
      const result = await resendVerificationMail()
      const latestSetting = await getUserSetting().catch(() => null)
      if (latestSetting) setSetting(latestSetting)
      setToast({ type: 'success', message: result.message || 'Đã gửi lại email xác minh.' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể gửi lại email xác minh.' })
    }
  }

  const handleSendOtp = async () => {
    try {
      const result = await requestChangePasswordOtp()
      setToast({ type: 'success', message: result.message || 'Đã gửi OTP đổi mật khẩu qua email.' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể gửi OTP đổi mật khẩu.' })
    }
  }

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    setSavingPassword(true)
    try {
      const result = await setNewPasswordWithOtp(passwordForm)
      setPasswordForm({ newPassword: '', confirmNewPassword: '', OtpCode: '' })
      setToast({ type: 'success', message: result.message || 'Đã đặt mật khẩu mới.' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể đặt mật khẩu mới.' })
    } finally {
      setSavingPassword(false)
    }
  }

  const handlePasswordField = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-on-surface">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 lg:py-7">
        <header className="mb-5 flex items-start gap-3">
          <Link to="/" className="mt-1 rounded-md p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-900">
            <span className="material-symbols-outlined !text-[20px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-slate-950">Cài đặt</h1>
            <p className="mt-1 text-[13px] font-medium text-slate-500">Quản lý liên hệ, xác minh email và đổi mật khẩu bằng OTP.</p>
          </div>
        </header>

        {loading ? (
          <section className="rounded-lg border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-500 shadow-sm">Đang tải cài đặt...</section>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <section className="space-y-4">
              <form className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" onSubmit={handlePhoneSubmit}>
                <div className="mb-3">
                  <h2 className="text-[15px] font-extrabold text-slate-950">Thông tin liên hệ</h2>
                  <p className="mt-0.5 text-[12px] font-medium text-slate-500">Cập nhật số điện thoại dùng cho hồ sơ tài khoản.</p>
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-bold text-slate-700">Số điện thoại</span>
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13px] font-medium outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100" />
                </label>
                <button type="submit" disabled={savingPhone} className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-[13px] font-extrabold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {savingPhone ? 'Đang lưu...' : 'Cập nhật'}
                </button>
              </form>

              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-[15px] font-extrabold text-slate-950">Email xác minh</h2>
                    <p className="mt-1 text-[13px] text-slate-600">
                      {setting?.email || '--'} ? <span className={`font-bold ${setting?.is_verified ? 'text-emerald-600' : 'text-amber-600'}`}>{setting?.is_verified ? 'Đã xác minh' : 'Chưa xác minh'}</span>
                    </p>
                  </div>
                  <button type="button" onClick={handleResendMail} className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-extrabold text-slate-700 transition hover:bg-slate-50">
                    Gửi lại email
                  </button>
                </div>
              </section>

              <form className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" onSubmit={handlePasswordChange}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-[15px] font-extrabold text-slate-950">Đổi mật khẩu bằng OTP</h2>
                    <p className="mt-1 text-[12px] font-medium text-slate-500">Nhận mã qua email, sau đó nhập mật khẩu mới và OTP để cập nhật.</p>
                  </div>
                  <button type="button" onClick={handleSendOtp} className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-950 px-4 text-[12px] font-extrabold text-white transition hover:bg-slate-800">
                    Gửi OTP
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-bold text-slate-700">Mật khẩu mới</span>
                    <input type="password" value={passwordForm.newPassword} onChange={(event) => handlePasswordField('newPassword', event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13px] font-medium outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-bold text-slate-700">Nhập lại mật khẩu</span>
                    <input type="password" value={passwordForm.confirmNewPassword} onChange={(event) => handlePasswordField('confirmNewPassword', event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13px] font-medium outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100" />
                  </label>
                </div>
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-[12px] font-bold text-slate-700">Mã OTP</span>
                  <input value={passwordForm.OtpCode} onChange={(event) => handlePasswordField('OtpCode', event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13px] font-medium outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100" placeholder="Nhập OTP" />
                </label>
                <button type="submit" disabled={savingPassword} className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-[13px] font-extrabold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {savingPassword ? 'Đang cập nhật...' : 'Đặt mật khẩu mới'}
                </button>
              </form>
            </section>

            <aside className="space-y-4">
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-[15px] font-extrabold text-slate-950">Thông tin hiện tại</h2>
                <div className="mt-3 space-y-2 text-[13px] text-slate-600">
                  <p><span className="font-bold text-slate-900">Email:</span> {setting?.email || '--'}</p>
                  <p><span className="font-bold text-slate-900">Phone:</span> {setting?.phone || '--'}</p>
                  <p><span className="font-bold text-slate-900">Username:</span> {setting?.username || '--'}</p>
                </div>
              </section>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
