import type { ReactNode } from 'react'
import { Dialog } from '../../lib/ui/Dialog/Dialog'
import { Drawer } from '../../lib/ui/Drawer/Drawer'
import { useMediaQuery } from '../../hooks/useMediaQuery'

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
  title = '選擇類別',
}: CategoryDrawerDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog open={open} onClose={onClose} title={title}>
        {children}
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onClose={onClose} title={title}>
      {children}
    </Drawer>
  )
}
