import { useState, useEffect } from 'react'

export function useFetch(fetchFn) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetchFn()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [fetchFn])

  const refetch = () => {
    setLoading(true)
    return fetchFn()
      .then((result) => {
        setData(result)
        setError(null)
        return result
      })
      .catch((err) => {
        setError(err)
        throw err
      })
      .finally(() => setLoading(false))
  }

  return { data, loading, error, refetch, setData }
}
