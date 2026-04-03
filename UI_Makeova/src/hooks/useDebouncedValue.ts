import { useEffect, useState } from 'react'

const DEFAULT_DEBOUNCE_MS = 500
export const useDebouncedValue = <T>(value: T, delay = DEFAULT_DEBOUNCE_MS): T => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [delay, value])

  return debouncedValue
}

export default useDebouncedValue
