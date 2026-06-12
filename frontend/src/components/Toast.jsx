import { useCallback, useEffect, useState } from 'react'

export default function Toast({ toast, onClose }) {
  const [leaving, setLeaving] = useState(false)

  const closeToast = useCallback(() => {
    setLeaving(true)
    setTimeout(() => {
      onClose()
      setLeaving(false)
    }, 220)
  }, [onClose])

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timeoutId = setTimeout(() => {
      closeToast()
    }, 3600)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [closeToast, toast])

  if (!toast) {
    return null
  }

  return (
    <div className={`toast-motion fixed right-6 top-6 z-[9999] w-[calc(100vw-3rem)] max-w-sm rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-sm ${leaving ? 'toast-motion-out' : ''}`}>
      <div className="grid grid-cols-[40px_1fr_32px] items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          <span className="material-symbols-outlined !text-[20px] leading-none">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{toast.type === 'success' ? 'Thành công' : 'Lỗi'}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600 break-words">{toast.message}</p>
        </div>
        <button type="button" onClick={closeToast} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
          <span className="material-symbols-outlined !text-[18px] leading-none">close</span>
        </button>
      </div>
    </div>
  )
}
