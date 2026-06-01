export function formatIQD(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—'
  return `${Number(amount).toLocaleString('ar-IQ')} د.ع`
}

export function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('ar-IQ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
