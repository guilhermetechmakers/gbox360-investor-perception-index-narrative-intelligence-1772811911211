import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NarrativeEvent } from '@/types/narrative'

interface TimelineReplayProps {
  events: NarrativeEvent[]
  currentIndex: number
  onIndexChange: (index: number) => void
  isPlaying?: boolean
  onPlayPause?: (playing: boolean) => void
  loop?: boolean
  onLoopToggle?: (loop: boolean) => void
  onViewPayload?: (rawPayloadId: string) => void
  /** Playback speed multiplier (0.5, 1, 1.5, 2) */
  speed?: number
  onSpeedChange?: (speed: number) => void
}

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5×' },
  { value: 1, label: '1×' },
  { value: 1.5, label: '1.5×' },
  { value: 2, label: '2×' },
]

const BASE_INTERVAL_MS = 2000

function detectRepetitions(events: NarrativeEvent[]): Set<number> {
  const reps = new Set<number>()
  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1]?.raw_text ?? ''
    const curr = events[i]?.raw_text ?? ''
    if (prev.length > 20 && curr.length > 20 && prev.slice(0, 40) === curr.slice(0, 40)) {
      reps.add(i)
    }
  }
  return reps
}

function detectSpikes(events: NarrativeEvent[]): Set<number> {
  const spikes = new Set<number>()
  const scores = events.map((e) => e.authority_score ?? 0).filter((v) => typeof v === 'number')
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  events.forEach((e, i) => {
    if ((e.authority_score ?? 0) > avg * 1.2) spikes.add(i)
  })
  return spikes
}

export function TimelineReplay({
  events,
  currentIndex,
  onIndexChange,
  isPlaying = false,
  onPlayPause,
  loop = false,
  onLoopToggle,
  onViewPayload,
  speed = 1,
  onSpeedChange,
}: TimelineReplayProps) {
  const safeEvents = Array.isArray(events) ? events : []
  const count = safeEvents.length
  const clampedIndex = Math.max(0, Math.min(currentIndex, count - 1))
  const repetitions = detectRepetitions(safeEvents)
  const spikes = detectSpikes(safeEvents)
  const [internalSpeed, setInternalSpeed] = useState(1)
  const effectiveSpeed = onSpeedChange != null ? speed : internalSpeed
  const intervalMs = Math.round(BASE_INTERVAL_MS / (effectiveSpeed > 0 ? effectiveSpeed : 1))

  const handleSpeedChange = (v: string) => {
    const num = Number(v)
    if (onSpeedChange) {
      onSpeedChange(num)
    } else {
      setInternalSpeed(num)
    }
  }

  const goBack = useCallback(() => {
    if (count === 0) return
    const next = clampedIndex <= 0 ? (loop ? count - 1 : 0) : clampedIndex - 1
    onIndexChange(next)
  }, [count, clampedIndex, loop, onIndexChange])

  const goForward = useCallback(() => {
    if (count === 0) return
    const next =
      clampedIndex >= count - 1 ? (loop ? 0 : count - 1) : clampedIndex + 1
    onIndexChange(next)
  }, [count, clampedIndex, loop, onIndexChange])

  useEffect(() => {
    if (!isPlaying || count === 0) return
    const id = setInterval(() => {
      if (clampedIndex >= count - 1) {
        if (loop) {
          onIndexChange(0)
        } else {
          onPlayPause?.(false)
        }
      } else {
        onIndexChange(clampedIndex + 1)
      }
    }, intervalMs)
    return () => clearInterval(id)
  }, [isPlaying, count, clampedIndex, loop, onIndexChange, onPlayPause, intervalMs])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goBack()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goForward()
      } else if (e.key === ' ') {
        e.preventDefault()
        onPlayPause?.(!isPlaying)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goBack, goForward, isPlaying, onPlayPause])

  if (count === 0) {
    return (
      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="text-lg">Timeline Replay</CardTitle>
          <p className="text-sm text-muted-foreground">
            Step through events chronologically
          </p>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground text-sm">
            No events to replay
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-surface transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Timeline Replay</CardTitle>
            <p className="text-sm text-muted-foreground">
              Event {clampedIndex + 1} of {count}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={goBack}
              disabled={count === 0}
              aria-label="Previous event"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => onPlayPause?.(!isPlaying)}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={goForward}
              disabled={count === 0}
              aria-label="Next event"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {onLoopToggle && (
              <Button
                variant={loop ? 'default' : 'outline'}
                size="icon"
                className="h-9 w-9"
                onClick={() => onLoopToggle(!loop)}
                aria-label={loop ? 'Disable loop' : 'Enable loop'}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <div className="flex items-center gap-2 min-w-[120px]">
            <span className="text-xs text-muted-foreground">Speed</span>
            <Select
              value={String(effectiveSpeed)}
              onValueChange={handleSpeedChange}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPEED_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {count > 1 && (
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">Scrubber</span>
              <Slider
                value={[clampedIndex]}
                max={Math.max(0, count - 1)}
                step={1}
                onValueChange={([v]) => onIndexChange(v ?? 0)}
                className="flex-1"
                aria-label="Event position"
              />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Use arrow keys or buttons to step. Space to play/pause.
        </p>
        <ScrollArea className="h-[180px] rounded-lg border border-border p-3">
          <div className="space-y-2">
            {safeEvents.map((ev, i) => {
              const isRep = repetitions.has(i)
              const isSpike = spikes.has(i)
              return (
                <div
                  key={ev.event_id}
                  role="button"
                  tabIndex={0}
                  aria-current={i === clampedIndex}
                  className={cn(
                    'rounded-lg border p-3 text-sm transition-colors cursor-pointer',
                    i === clampedIndex
                      ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                      : 'border-border hover:bg-muted/50',
                    isRep && 'border-l-4 border-l-amber-400',
                    isSpike && i !== clampedIndex && 'border-l-4 border-l-accent'
                  )}
                  onClick={() => onIndexChange(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onIndexChange(i)
                    }
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      {ev.original_timestamp
                        ? format(new Date(ev.original_timestamp), 'MMM d HH:mm')
                        : '—'}
                    </span>
                    <div className="flex items-center gap-1">
                      {isRep && <span className="text-[10px] text-amber-600">Rep</span>}
                      {isSpike && <span className="text-[10px] text-accent">Spike</span>}
                      <span className="text-xs font-medium">{ev.source ?? '—'}</span>
                      {onViewPayload && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            onViewPayload(ev.raw_payload_id)
                          }}
                          aria-label="View raw payload"
                        >
                          Raw
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="line-clamp-2 text-foreground">
                    {ev.raw_text?.slice(0, 120) ?? '—'}
                    {(ev.raw_text?.length ?? 0) > 120 ? '…' : ''}
                  </p>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
