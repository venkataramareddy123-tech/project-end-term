import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:
          'bg-[color:var(--accent)] px-5 text-[color:var(--accent-ink)] shadow-[0_14px_32px_rgba(240,109,79,0.28)] hover:bg-[color:var(--accent-strong)]',
        secondary:
          'bg-[color:var(--teal)] px-5 text-white shadow-[0_14px_32px_rgba(17,63,59,0.22)] hover:opacity-95',
        outline:
          'border border-[color:var(--border)] bg-white/70 px-5 text-[color:var(--foreground)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]',
        ghost: 'px-3 text-[color:var(--foreground)] hover:bg-black/5',
      },
      size: {
        sm: 'h-10 text-sm',
        md: 'h-11 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
