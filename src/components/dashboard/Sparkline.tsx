import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface SparklineProps {
  data: number[]
  className?: string
  height?: number
  strokeColor?: string
}

/** Lightweight SVG sparkline for narrative persistence visualization */
export function Sparkline({
  data,
  className,
  height = 32,
  strokeColor = 'rgb(var(--accent))',
}: SparklineProps) {
  const path = useMemo(() => {
    const items = Array.isArray(data) ? data : []
    if (items.length === 0) return ''
    const min = Math.min(...items)
    const max = Math.max(...items)
    const range = max - min || 1
    const w = 120
    const h = height - 4
    const points = items.map((v, i) => {
      const x = (i / (items.length - 1 || 1)) * w
      const y = h - ((v - min) / range) * h + 2
      return `${x},${y}`
    })
    return `M ${points.join(' L ')}`
  }, [data, height])

  const items = Array.isArray(data) ? data : []
  if (items.length < 2) {
    return (
      <div
        className={cn('flex items-center justify-center text-muted-foreground text-xs', className)}
        style={{ height }}
      >
        —
      </div>
    )
  }

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 120 ${height}`}
      preserveAspectRatio="none meet"
      className={cn('overflow-visible', className)}
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-opacity duration-200"
      />
    </svg>
  )
}
