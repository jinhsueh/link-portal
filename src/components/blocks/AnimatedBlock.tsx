'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  index: number
  children: React.ReactNode
  /** Extra classes on the wrapping div — used by grid layouts for col-span. */
  className?: string
}

export function AnimatedBlock({ index, children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 80)
    return () => clearTimeout(timer)
  }, [index])

  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
    }}>
      {children}
    </div>
  )
}
