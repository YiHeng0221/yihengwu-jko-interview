import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Dialog } from '../../lib/ui/Dialog'
import { Drawer } from '../../lib/ui/Drawer'

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export interface CategoryDrawerDialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export function CategoryDrawerDialog({
  open,
  onClose,
  children,
  title,
}: CategoryDrawerDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const titleProp = title != null ? { title } : {}

  if (isDesktop) {
    return (
      <Dialog open={open} onClose={onClose} {...titleProp}>
        {children}
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onClose={onClose} {...titleProp}>
      {children}
    </Drawer>
  )
}
