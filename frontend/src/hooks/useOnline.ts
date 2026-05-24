import { useEffect, useState } from 'react'

export function useOnline(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    const handleVisibilityChange = () => {
      if (!document.hidden) setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return isOnline
}
