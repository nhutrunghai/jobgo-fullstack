import { buildApiUrl, createJsonHeaders, getRefreshToken, saveAuthTokens } from '../config/api.js'

let refreshPromise = null

async function readPayload(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('Phiên đăng nhập đã hết hạn.')
  }

  if (!refreshPromise) {
    refreshPromise = fetch(buildApiUrl('/auth/refresh-token'), {
      method: 'POST',
      credentials: 'include',
      headers: createJsonHeaders({}, { auth: false }),
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
      .then(async (response) => {
        const payload = await readPayload(response)
        if (!response.ok) {
          throw new Error(payload?.message || 'Không thể làm mới phiên đăng nhập.')
        }

        const authData = payload?.data
        if (!authData?.AccessToken || !authData?.RefreshToken) {
          throw new Error('Phản hồi refresh token không hợp lệ.')
        }

        saveAuthTokens(authData)
        return authData
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}
