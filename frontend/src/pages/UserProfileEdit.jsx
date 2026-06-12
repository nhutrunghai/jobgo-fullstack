import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Toast from '../components/Toast.jsx'
import UserAvatar from '../components/UserAvatar.jsx'
import { getMyProfileDetail, updateMyAvatar, updateMyProfile } from '../api/userService.js'

function toSkillText(skills) {
  return Array.isArray(skills) ? skills.join(', ') : ''
}

function toSkillArray(value) {
  const normalized = String(value || '')
    .replace(/[;\n]+/g, ',')
    .split(',')
    .map((item) => item.trim())
    .map((item) => item.replace(/\s+/g, ' '))
    .filter(Boolean)
  return [...new Set(normalized)]
}

export default function UserProfileEdit() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({
    fullName: '',
    bio: '',
    address: '',
    skillsText: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [toast, setToast] = useState(null)
  const parsedSkills = useMemo(() => toSkillArray(form.skillsText), [form.skillsText])

  useEffect(() => {
    getMyProfileDetail()
      .then((data) => {
        setProfile(data)
        setForm({
        fullName: data.fullName || '',
        bio: data.bio || '',
        address: data.address || '',
          skillsText: toSkillText(data.skills),
        })
      })
      .catch((error) => setToast({ type: 'error', message: error.message || 'Không thể tải profile.' }))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.skillsText.trim() && parsedSkills.length === 0) {
      setToast({ type: 'error', message: 'Vui lòng nhập ít nhất một kỹ năng hợp lệ.' })
      return
    }

    setSaving(true)
    try {
      const updated = await updateMyProfile({
        fullName: form.fullName.trim(),
        bio: form.bio.trim(),
        address: form.address.trim(),
        skills: parsedSkills,
      })
      setProfile(updated)
      setForm((current) => ({ ...current, skillsText: toSkillText(updated.skills) }))
      setToast({ type: 'success', message: 'Đã cập nhật hồ sơ.' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể cập nhật profile.' })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return
    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', message: 'Vui lòng chọn file ảnh hợp lệ.' })
      return
    }

    setUploadingAvatar(true)
    try {
      const updated = await updateMyAvatar(file)
      setProfile(updated)
      setToast({ type: 'success', message: 'Đã cập nhật avatar.' })
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể cập nhật avatar.' })
    } finally {
      setUploadingAvatar(false)
    }
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
            <h1 className="text-[31px] font-semibold text-slate-900">Cập nhật profile</h1>
            <p className="mt-1 text-sm text-slate-500">Cập nhật thông tin cá nhân và kỹ năng để hồ sơ của bạn đầy đủ hơn.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.3fr)_340px]">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {loading ? (
              <div className="text-sm text-slate-500">Đang tải profile...</div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                  <input value={form.fullName} onChange={(event) => handleChange('fullName', event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4" placeholder="Nhap full name" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Bio</label>
                  <textarea value={form.bio} onChange={(event) => handleChange('bio', event.target.value)} rows="5" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" placeholder="Mô tả ngắn về bản thân" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Address</label>
                  <input value={form.address} onChange={(event) => handleChange('address', event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4" placeholder="Nhap dia chi" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Skills</label>
                  <textarea
                    value={form.skillsText}
                    onChange={(event) => handleChange('skillsText', event.target.value)}
                    rows="4"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    placeholder="React, Vite, Tailwind CSS"
                  />
                  {parsedSkills.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {parsedSkills.map((skill) => (
                        <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button type="submit" disabled={saving} className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white disabled:opacity-60">
                  {saving ? 'Đang lưu...' : 'Cập nhật profile'}
                </button>
              </form>
            )}
          </section>

          <aside className="space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col items-center text-center">
                <div className="relative">
                  <UserAvatar
                    src={profile?.avatar}
                    name={profile?.fullName || profile?.username || 'User'}
                    className="h-24 w-24 border-4 border-white shadow-md"
                    textClassName="text-3xl"
                  />
                  <label
                    className={`absolute -bottom-1 -right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700 ${
                      uploadingAvatar ? 'pointer-events-none opacity-70' : ''
                    }`}
                    title="Cập nhật avatar"
                  >
                    <span className="material-symbols-outlined text-[18px]">{uploadingAvatar ? 'progress_activity' : 'photo_camera'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
                  </label>
                </div>
                <p className="mt-3 text-xs text-slate-500">{uploadingAvatar ? 'Đang upload avatar...' : 'Nhấn icon camera để đổi ảnh đại diện'}</p>
              </div>
              <h2 className="text-lg font-bold text-slate-900">Profile hiện tại</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">Username:</span> {profile?.username || '--'}</p>
                <p><span className="font-semibold text-slate-900">Email:</span> {profile?.email || '--'}</p>
                <p><span className="font-semibold text-slate-900">Full Name:</span> {profile?.fullName || '--'}</p>
                <p><span className="font-semibold text-slate-900">Address:</span> {profile?.address || '--'}</p>
              </div>
              {profile?.username ? (
                <Link to={`/user/profile/${profile.username}`} className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700">
                  Xem profile public
                </Link>
              ) : null}
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}
