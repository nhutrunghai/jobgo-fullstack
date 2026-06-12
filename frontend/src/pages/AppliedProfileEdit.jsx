import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DashboardSidebar from '../components/DashboardSidebar.jsx'
import { loadEditableAppliedProfile } from '../data/apiClient.js'

function toSkillText(skills) {
  return Array.isArray(skills) ? skills.join(', ') : ''
}

function toSkillArray(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatDate(value) {
  if (!value) return 'Đang cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Đang cập nhật'
  return date.toLocaleDateString('vi-VN')
}

export default function AppliedProfileEdit() {
  const { cvId } = useParams()
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [record, setRecord] = useState(null)
  const [form, setForm] = useState({
    fullName: '',
    bio: '',
    address: '',
    skillsText: '',
  })

  useEffect(() => {
    const loadData = async () => {
      const data = await loadEditableAppliedProfile(cvId)
      setRecord(data)
      setForm({
        fullName: data?.user?.fullName || '',
        bio: data?.user?.bio || '',
        address: data?.user?.address || '',
        skillsText: toSkillText(data?.user?.skills),
      })
      setLoading(false)
    }
    loadData()
  }, [cvId])

  const parsedSkills = useMemo(() => toSkillArray(form.skillsText), [form.skillsText])

  if (loading) {
    return (
      <div className="bg-[#f7f9fc] text-on-surface">
        <DashboardSidebar activeKey="uploaded-cvs" />
        <main className="lg:ml-64 min-h-screen p-5 text-sm text-slate-500">Đang tải hồ sơ đã ứng tuyển...</main>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="bg-[#f7f9fc] text-on-surface">
        <DashboardSidebar activeKey="uploaded-cvs" />
        <main className="lg:ml-64 min-h-screen p-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">Không tìm thấy hồ sơ ứng tuyển phù hợp với `cv_id` này.</div>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-[#f7f9fc] text-on-surface">
      <DashboardSidebar activeKey="uploaded-cvs" />
      <main className="lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-5 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
                <Link to="/uploaded-cvs" className="font-medium text-blue-600 hover:underline">CV đã tải lên</Link>
                <span>/</span>
                <span>Cập nhật hồ sơ</span>
              </div>
              <h1 className="text-[22px] font-extrabold leading-none tracking-tight text-slate-900">Cập nhật hồ sơ đã ứng tuyển</h1>
            </div>
            <Link to="/uploaded-cvs" className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              Quay lai
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-[minmax(0,1.25fr)_360px]">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{record.cv.title}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">cv_id: {record.cv_id}</span>
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                setRecord((prev) =>
                  prev
                    ? {
                        ...prev,
                        user: {
                          ...prev.user,
                          fullName: form.fullName,
                          bio: form.bio,
                          address: form.address,
                          skills: parsedSkills,
                        },
                      }
                    : prev,
                )
                setSaved(true)
                window.setTimeout(() => setSaved(false), 2200)
              }}
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                <input
                  value={form.fullName}
                  onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Nhap full name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                  rows="6"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Mô tả ngắn về bản thân"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Address</label>
                <input
                  value={form.address}
                  onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Nhap dia chi"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Skills</label>
                <textarea
                  value={form.skillsText}
                  onChange={(event) => setForm((prev) => ({ ...prev, skillsText: event.target.value }))}
                  rows="4"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="React Native, TypeScript, REST API"
                />
              </div>

              <div className="flex items-center gap-3">
                <button type="submit" className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700">
                  Lưu cập nhật hồ sơ
                </button>
                {saved && <span className="text-sm font-semibold text-emerald-600">Da luu mock thanh cong.</span>}
              </div>
            </form>
          </section>

          <aside className="space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Thông tin CV đã dùng</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">Ten CV:</span> {record.cv.title}</p>
                <p><span className="font-semibold text-slate-900">Vi tri:</span> {record.cv.target_role}</p>
                <p><span className="font-semibold text-slate-900">File:</span> {record.cv.file_name}</p>
                <p><span className="font-semibold text-slate-900">Lan dung cuoi:</span> {formatDate(record.cv.last_used_at)}</p>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}
