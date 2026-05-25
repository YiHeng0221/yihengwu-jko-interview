import { useOnline } from '../hooks/useOnline'

export function OfflineBanner() {
  const isOnline = useOnline()

  if (isOnline) return null

  return (
    <div
      role="status"
      className="sticky top-0 z-30 w-full bg-warning px-4 py-2 text-center text-sm font-medium text-text-primary"
    >
      目前離線
    </div>
  )
}
