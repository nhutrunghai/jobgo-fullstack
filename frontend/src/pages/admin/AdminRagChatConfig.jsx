import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout.jsx'
import Toast from '../../components/Toast.jsx'
import {
  getAdminRagChatConfig,
  getAdminRagChatHealth,
  rotateAdminRagChatSecrets,
  updateAdminRagChatConfig,
} from '../../api/adminService.js'

const inputClassName =
  'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100'

function StatCard({ label, value, tone = 'text-slate-950' }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className={`mt-1.5 text-[14px] font-semibold leading-5 ${tone}`}>{String(value)}</p>
    </div>
  )
}

export default function AdminRagChatConfig() {
  const [config, setConfig] = useState(null)
  const [secrets, setSecrets] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [healthLoading, setHealthLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rotating, setRotating] = useState(false)
  const [toast, setToast] = useState(null)
  const [configForm, setConfigForm] = useState({
    enabled: true,
    provider: 'openai',
    intent_model: '',
    chat_model: '',
    cv_visual_review_model: '',
    job_search_top_k: 5,
    job_explanation_top_k: 5,
    cv_review_top_k: 6,
    answer_context_limit: 3,
    allow_cv_review: true,
    allow_job_qa: true,
    allow_policy_qa: false,
    allow_general_qa: false,
    maintenance_message: '',
  })
  const [secretForm, setSecretForm] = useState({ openai_api_key: '', gemini_api_key: '' })

  const syncForm = (nextConfig) => {
    setConfigForm({
      enabled: Boolean(nextConfig?.enabled),
      provider: nextConfig?.provider || 'openai',
      intent_model: nextConfig?.intent_model || '',
      chat_model: nextConfig?.chat_model || '',
      cv_visual_review_model: nextConfig?.cv_visual_review_model || '',
      job_search_top_k: nextConfig?.job_search_top_k ?? 5,
      job_explanation_top_k: nextConfig?.job_explanation_top_k ?? 5,
      cv_review_top_k: nextConfig?.cv_review_top_k ?? 6,
      answer_context_limit: nextConfig?.answer_context_limit ?? 3,
      allow_cv_review: Boolean(nextConfig?.allow_cv_review),
      allow_job_qa: nextConfig?.allow_job_qa ?? true,
      allow_policy_qa: Boolean(nextConfig?.allow_policy_qa),
      allow_general_qa: Boolean(nextConfig?.allow_general_qa),
      maintenance_message: nextConfig?.maintenance_message || '',
    })
  }

  const loadConfig = async () => {
    const data = await getAdminRagChatConfig()
    setConfig(data?.config || null)
    setSecrets(data?.secrets || null)
    syncForm(data?.config || {})
  }

  const loadHealth = async () => {
    const data = await getAdminRagChatHealth()
    setHealth(data)
  }

  useEffect(() => {
    let active = true
    Promise.all([loadConfig(), loadHealth()])
      .catch((error) => {
        if (active) setToast({ type: 'error', message: error.message || 'Không thể tải cấu hình RAG Chat.' })
      })
      .finally(() => {
        if (active) {
          setLoading(false)
          setHealthLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const handleSaveConfig = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const result = await updateAdminRagChatConfig({
        ...configForm,
        job_search_top_k: Number(configForm.job_search_top_k),
        job_explanation_top_k: Number(configForm.job_explanation_top_k),
        cv_review_top_k: Number(configForm.cv_review_top_k),
        answer_context_limit: Number(configForm.answer_context_limit),
        maintenance_message: configForm.maintenance_message.trim() || null,
      })
      setConfig(result?.config || null)
      syncForm(result?.config || {})
      setToast({ type: 'success', message: 'Đã cập nhật cấu hình RAG Chat.' })
      await loadHealth()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể cập nhật cấu hình RAG Chat.' })
    } finally {
      setSaving(false)
    }
  }

  const handleRotateSecrets = async (event) => {
    event.preventDefault()
    const body = {}
    if (secretForm.openai_api_key.trim()) body.openai_api_key = secretForm.openai_api_key.trim()
    if (secretForm.gemini_api_key.trim()) body.gemini_api_key = secretForm.gemini_api_key.trim()
    if (!Object.keys(body).length) {
      setToast({ type: 'error', message: 'Hãy nhập ít nhất một API key cần cập nhật.' })
      return
    }

    setRotating(true)
    try {
      const result = await rotateAdminRagChatSecrets(body)
      setSecrets(result?.secrets || null)
      setSecretForm({ openai_api_key: '', gemini_api_key: '' })
      setToast({ type: 'success', message: 'Đã cập nhật secret RAG Chat.' })
      await loadHealth()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Không thể cập nhật secret RAG Chat.' })
    } finally {
      setRotating(false)
    }
  }

  return (
    <AdminLayout title="Cấu hình RAG Chat" subtitle="Quản lý trạng thái chạy, nhà cung cấp, model, API key và tình trạng kiểm tra hệ thống chat.">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Nhà cung cấp" value={health?.provider || config?.provider || 'N/A'} tone="text-indigo-700" />
        <StatCard label="Trạng thái" value={health?.enabled ? 'Bật' : 'Tắt'} tone={health?.enabled ? 'text-emerald-700' : 'text-rose-700'} />
        <StatCard label="Key nhà cung cấp" value={health?.provider_configured ? 'Đã cấu hình' : 'Thiếu key'} tone={health?.provider_configured ? 'text-emerald-700' : 'text-rose-700'} />
        <StatCard label="Đánh giá CV" value={configForm.allow_cv_review ? 'Cho phép' : 'Tắt'} tone="text-slate-950" />
      </section>

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={handleSaveConfig} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-[14px] font-extrabold text-slate-950">Cấu hình vận hành</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <label className="block"><span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Nhà cung cấp</span><select value={configForm.provider} onChange={(event) => setConfigForm((current) => ({ ...current, provider: event.target.value }))} className={inputClassName}><option value="openai">OpenAI</option><option value="gemini">Gemini</option></select></label>
            <label className="block"><span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Bật hệ thống</span><select value={configForm.enabled ? 'true' : 'false'} onChange={(event) => setConfigForm((current) => ({ ...current, enabled: event.target.value === 'true' }))} className={inputClassName}><option value="true">Đang bật</option><option value="false">Tạm tắt</option></select></label>
            <label className="block"><span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Model nhận diện ý định</span><input value={configForm.intent_model} onChange={(event) => setConfigForm((current) => ({ ...current, intent_model: event.target.value }))} className={inputClassName} /></label>
            <label className="block"><span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Model chat</span><input value={configForm.chat_model} onChange={(event) => setConfigForm((current) => ({ ...current, chat_model: event.target.value }))} className={inputClassName} /></label>
            <label className="block lg:col-span-2"><span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Model đánh giá hình ảnh CV</span><input value={configForm.cv_visual_review_model} onChange={(event) => setConfigForm((current) => ({ ...current, cv_visual_review_model: event.target.value }))} className={inputClassName} /></label>
            <label className="block"><span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Số kết quả tìm việc</span><input type="number" min="1" max="20" value={configForm.job_search_top_k} onChange={(event) => setConfigForm((current) => ({ ...current, job_search_top_k: event.target.value }))} className={inputClassName} /></label>
            <label className="block"><span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Số ngữ cảnh giải thích việc làm</span><input type="number" min="1" max="20" value={configForm.job_explanation_top_k} onChange={(event) => setConfigForm((current) => ({ ...current, job_explanation_top_k: event.target.value }))} className={inputClassName} /></label>
            <label className="block"><span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Số ngữ cảnh đánh giá CV</span><input type="number" min="1" max="20" value={configForm.cv_review_top_k} onChange={(event) => setConfigForm((current) => ({ ...current, cv_review_top_k: event.target.value }))} className={inputClassName} /></label>
            <label className="block"><span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Giới hạn ngữ cảnh trả lời</span><input type="number" min="1" max="10" value={configForm.answer_context_limit} onChange={(event) => setConfigForm((current) => ({ ...current, answer_context_limit: event.target.value }))} className={inputClassName} /></label>
            <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-semibold text-slate-700"><input type="checkbox" checked={configForm.allow_job_qa} onChange={(event) => setConfigForm((current) => ({ ...current, allow_job_qa: event.target.checked }))} /> Cho phép tư vấn job</label>
            <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-semibold text-slate-700"><input type="checkbox" checked={configForm.allow_cv_review} onChange={(event) => setConfigForm((current) => ({ ...current, allow_cv_review: event.target.checked }))} /> Cho phép đánh giá CV</label>
            <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-semibold text-slate-700"><input type="checkbox" checked={configForm.allow_policy_qa} onChange={(event) => setConfigForm((current) => ({ ...current, allow_policy_qa: event.target.checked }))} /> Cho phép hỏi đáp chính sách</label>
            <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-semibold text-slate-700"><input type="checkbox" checked={configForm.allow_general_qa} onChange={(event) => setConfigForm((current) => ({ ...current, allow_general_qa: event.target.checked }))} /> Cho phép hỏi đáp ngoài phạm vi</label>
            <label className="block lg:col-span-2"><span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Thông báo bảo trì</span><textarea rows="4" value={configForm.maintenance_message} onChange={(event) => setConfigForm((current) => ({ ...current, maintenance_message: event.target.value }))} className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100" /></label>
          </div>
          <button type="submit" disabled={saving || loading} className="mt-3 flex h-10 w-full items-center justify-center rounded-md bg-slate-950 px-3 text-[13px] font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300">{saving ? 'Đang lưu...' : 'Lưu cấu hình'}</button>
        </form>

        <div className="space-y-3">
          <form onSubmit={handleRotateSecrets} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-[14px] font-extrabold text-slate-950">Cập nhật API key</h2>
            <div className="mt-3 space-y-3">
              <label className="block"><span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">API key OpenAI</span><input type="password" value={secretForm.openai_api_key} onChange={(event) => setSecretForm((current) => ({ ...current, openai_api_key: event.target.value }))} className={inputClassName} /></label>
              <label className="block"><span className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">API key Gemini</span><input type="password" value={secretForm.gemini_api_key} onChange={(event) => setSecretForm((current) => ({ ...current, gemini_api_key: event.target.value }))} className={inputClassName} /></label>
              <div className="rounded-md border border-slate-100 bg-slate-50 p-3 text-[12px] text-slate-600">
                <p className="break-all">OpenAI: {secrets?.openai_api_key_preview || "Chưa có"} · {secrets?.openai_api_key_source || "N/A"}</p>
                <p className="mt-1 break-all">Gemini: {secrets?.gemini_api_key_preview || "Chưa có"} · {secrets?.gemini_api_key_source || "N/A"}</p>
              </div>
              <button type="submit" disabled={rotating || loading} className="flex h-10 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-[13px] font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">{rotating ? 'Đang cập nhật...' : 'Cập nhật API key'}</button>
            </div>
          </form>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-extrabold text-slate-950">Kiểm tra hệ thống</h2>
                <p className="mt-1 text-[12px] font-medium text-slate-500">Kiểm tra trạng thái chạy và nguồn secret hiện tại.</p>
              </div>
              <button type="button" onClick={async () => { setHealthLoading(true); try { await loadHealth() } catch (error) { setToast({ type: 'error', message: error.message || 'Không thể tải kiểm tra hệ thống.' }) } finally { setHealthLoading(false) } }} disabled={healthLoading} className="h-9 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">{healthLoading ? 'Đang tải...' : 'Làm mới'}</button>
            </div>
            <div className="mt-3 space-y-2 text-[12px] font-semibold text-slate-700">
              <div className="rounded-md border border-slate-100 bg-slate-50 p-3">Trạng thái: {health?.enabled ? 'Bật' : 'Tắt'}</div>
              <div className="rounded-md border border-slate-100 bg-slate-50 p-3">Nhà cung cấp: {health?.provider || "Chưa có"} · {health?.provider_configured ? "Đã có key" : "Thiếu key"}</div>
              <div className="rounded-md border border-slate-100 bg-slate-50 p-3">OpenAI: {health?.openai_api_key_configured ? "Đã cấu hình" : "Chưa cấu hình"} · {health?.openai_api_key_source || "N/A"}</div>
              <div className="rounded-md border border-slate-100 bg-slate-50 p-3">Gemini: {health?.gemini_api_key_configured ? "Đã cấu hình" : "Chưa cấu hình"} · {health?.gemini_api_key_source || "N/A"}</div>
              <div className="rounded-md border border-slate-100 bg-slate-50 p-3">Index hồ sơ: {health?.resume_search_index || 'Chưa có'}</div>
              <div className="rounded-md border border-slate-100 bg-slate-50 p-3">Index việc làm công khai: {health?.public_jobs_search_index || 'Chưa có'}</div>
              <div className="rounded-md border border-slate-100 bg-slate-50 p-3 break-all">URL Embedding API: {health?.embedding_api_url || 'Chưa có'}</div>
            </div>
          </section>
        </div>
      </section>
    </AdminLayout>
  )
}
