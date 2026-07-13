import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { loadEmployerDashboardOverview } from '../data/apiClient.js'


export default function RequireEmployerCompany({ children }) {
  const location = useLocation()
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let active = true

    loadEmployerDashboardOverview({ force: true })
      .then((data) => {
        if (!active) return
        setStatus(data?.needsCompanyProfile ? 'missing' : 'ready')
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
    return null
  }

  if (status === 'missing') {
    return (
      <Navigate
        to="/employer/company-registration"
        replace
        state={{
          toast: {
            type: 'error',
            message: 'Bạn cần tạo hồ sơ công ty trước khi dùng chức năng nhà tuyển dụng này.',
          },
          from: location,
        }}
      />
    )
  }

  return children
}
