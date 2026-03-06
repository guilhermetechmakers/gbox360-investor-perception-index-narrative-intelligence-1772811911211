import { useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export interface AvatarUploaderProps {
  currentUrl?: string | null
  displayName?: string
  onUpload: (file: File) => Promise<string | null>
  disabled?: boolean
  className?: string
}

export function AvatarUploader({
  currentUrl,
  displayName = 'User',
  onUpload,
  disabled = false,
  className,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayUrl = previewUrl ?? currentUrl ?? undefined
  const initials = (displayName ?? 'U').slice(0, 2).toUpperCase()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please use JPEG, PNG, WebP, or GIF')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('Image must be under 2MB')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setIsUploading(true)

    try {
      const url = await onUpload(file)
      if (url) {
        setPreviewUrl(null)
        URL.revokeObjectURL(objectUrl)
      } else {
        setError('Upload failed')
      }
    } catch {
      setError('Upload failed')
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (disabled || isUploading) return
    inputRef.current?.click()
  }

  return (
    <div className={cn('relative inline-block', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="sr-only"
        aria-label="Upload avatar"
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isUploading}
        className={cn(
          'group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Change avatar"
      >
        <Avatar className="h-20 w-20 border-2 border-border transition-all duration-200 group-hover:border-accent/50">
          <AvatarImage src={displayUrl} alt={displayName} />
          <AvatarFallback className="text-xl font-semibold bg-muted">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-full bg-foreground/40',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            (isUploading || disabled) && 'opacity-100 bg-foreground/50'
          )}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" aria-hidden />
          ) : (
            <Camera className="h-8 w-8 text-primary-foreground" aria-hidden />
          )}
        </div>
      </button>
      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
