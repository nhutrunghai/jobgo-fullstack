import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Toast from '../components/Toast.jsx'
import { getUserSetting, requestChangePasswordOtp, resendVerificationMail, setNewPasswordWithOtp, updateUserSetting } from '../api/userService.js'

export default function UserSettings() {
  const [setting, setSetting] = useState(null)
  const [phone, setPhone] = useState('')
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmNewPassword: '',
    OtpCode: '',
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
      .catch((error) => setToast({ type: 'error', message: error.message || 'Không thể tải cài đặt user.' }))
      .finally(() => setLoading(false))
  }, [])

  const handlePhoneSubmit = async (event) => {
    event.preventDefault()
    setSavingPhone(true)
    try {
      const updated = await updateUserSetting({ phone })
      setSetting(updated)
      setToast({ type: 'success', message: updated.message || 'Đã cập nhật cài đặt user.' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể cập nhật setting.' })
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
    <div className="bg-[#f6f8fb] text-on-surface">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <main className="min-h-screen px-6 py-8 xl:px-10 2xl:px-14">
        <header className="mb-6 flex items-center gap-2">
          <Link to="/" className="rounded-md p-1.5 text-slate-600 transition hover:bg-slate-100">
            <span className="material-symbols-outlined !text-[20px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-[31px] font-semibold text-slate-900">Cài đặt</h1>
            <p className="mt-1 text-sm text-slate-500">Quản lý thông tin liên hệ, email xác minh và đổi mật khẩu bằng OTP.</p>
          </div>
        </header>

        {loading ? (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-500">Đang tải cài đặt user...</section>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_360px]">
            <section className="space-y-5">
              <form className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handlePhoneSubmit}>
                <h2 className="text-lg font-bold text-slate-900">Thông tin setting</h2>
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4" placeholder="0987654321" />
                </div>
                <button type="submit" disabled={savingPhone} className="mt-4 inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white disabled:opacity-60">
                  {savingPhone ? 'Đang lưu...' : 'Cập nhật setting'}
                </button>
              </form>

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">Email xác minh</h2>
                <p className="mt-3 text-sm text-slate-600">Email hiện tại: <span className="font-semibold text-slate-900">{setting?.email || '--'}</span></p>
                <p className="mt-1 text-sm text-slate-600">Trạng thái: <span className={`font-semibold ${setting?.is_verified ? 'text-emerald-600' : 'text-amber-600'}`}>{setting?.is_verified ? 'Đã xác minh' : 'Chưa xác minh'}</span></p>
                <button type="button" onClick={handleResendMail} className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700">
                  Gửi lại email xác minh
                </button>
              </section>

              <form className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handlePasswordChange}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-slate-900">Đổi mật khẩu bằng OTP</h2>
                  <button type="button" onClick={handleSendOtp} className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-bold text-white">
                    Gửi OTP
                  </button>
                </div>
                <p className="mt-3 text-sm text-slate-500">Nhấn nút Gửi OTP để nhận mã xác thực qua email, sau đó nhập mật khẩu mới và OTP để cập nhật.</p>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">New Password</label>
                    <input type="password" value={passwordForm.newPassword} onChange={(event) => handlePasswordField('newPassword', event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm New Password</label>
                    <input type="password" value={passwordForm.confirmNewPassword} onChange={(event) => handlePasswordField('confirmNewPassword', event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">OTP Code</label>
                  <input value={passwordForm.OtpCode} onChange={(event) => handlePasswordField('OtpCode', event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4" placeholder="Nhập OTP" />
                </div>
                <button type="submit" disabled={savingPassword} className="mt-4 inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-bold text-white disabled:opacity-60">
                  {savingPassword ? 'Đang cập nhật...' : 'Đặt mật khẩu mới'}
                </button>
              </form>
            </section>

            <aside className="space-y-5">
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">Thông tin hiện tại</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p><span className="font-semibold text-slate-900">Email:</span> {setting?.email || '--'}</p>
                  <p><span className="font-semibold text-slate-900">Phone:</span> {setting?.phone || '--'}</p>
                  <p><span className="font-semibold text-slate-900">Username:</span> {setting?.username || '--'}</p>
                </div>
              </section>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
