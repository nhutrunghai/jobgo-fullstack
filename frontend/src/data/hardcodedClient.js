export async function loadHardcodedMock() {
  const response = await fetch('/api/hardcoded.json')
  if (!response.ok) {
    throw new Error('Không thể tải dữ liệu hardcoded mock')
  }
  return response.json()
}
