import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

const defaultVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
}

export interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  variants?: typeof defaultVariants
  once?: boolean
  amount?: number
}

export function ScrollReveal({
  children,
  className,
  variants = defaultVariants,
  once = true,
  amount = 0.2,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion()
  if (shouldReduceMotion) {
    return <div className={cn(className)}>{children}</div>
  }
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}
