export function repairText(value) {
  if (typeof value !== 'string') return value

  try {
    return decodeURIComponent(escape(value))
  } catch {
    return value
  }
}

export function deepRepair(value) {
  if (Array.isArray(value)) {
    return value.map((item) => deepRepair(item))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, deepRepair(item)]),
    )
  }

  return repairText(value)
}
