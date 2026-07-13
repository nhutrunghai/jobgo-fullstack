import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { loadEmployerCompanyGate } from '../data/apiClient.js'


export default function RequireEmployerCompany({ children }) {
  const location = useLocation()
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let active = true

    loadEmployerCompanyGate({ force: true })
      .then((data) => {
        if (!active) return
        setStatus(data?.needsCompanyProfile ? 'missing' : data?.needsAdminApproval ? 'pending' : 'ready')
      })
      .catch(() => {
        if (!active) return
        setStatus('ready')
      })

    return () => {
      active = false
    }
  }, [])

  if (status === 'checking') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.45)]">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm font-semibold text-slate-800">Đang kiểm tra hồ sơ công ty...</p>
          <p className="mt-1 text-xs text-slate-500">Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    )
  }

  if (status === 'missing' || status === 'pending') {
    return (
      <Navigate
        to="/employer/company-registration"
        replace
        state={{
          toast: {
            type: 'error',
            message: status === 'missing'
              ? 'Bạn cần tạo hồ sơ công ty trước khi dùng chức năng nhà tuyển dụng này.'
              : 'Hồ sơ công ty của bạn đang chờ admin duyệt trước khi dùng chức năng nhà tuyển dụng này.',
          },
          from: location,
        }}
      />
    )
  }

  return children
}
