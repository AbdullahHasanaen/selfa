export function getApiError(err, fallback = 'حدث خطأ') {
  const data = err?.response?.data
  if (!data) return fallback
  if (data.error) return data.error
  if (Array.isArray(data.errors) && data.errors.length) return data.errors[0]
  if (data.message) return data.message
  return fallback
}
