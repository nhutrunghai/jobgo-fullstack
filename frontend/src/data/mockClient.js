export async function loadPortalMock() {
  const response = await fetch('/api/portal.json')
  if (!response.ok) {
    throw new Error('Không thể tải dữ liệu portal mock')
  }
  return response.json()
}
