import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/utils/cn';

// Defined in desing.json
export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--accent-main)] text-white',
          'shadow-[0_2px_8px_rgba(0,212,126,0.25)]',
          'hover:bg-[#00C272] hover:-translate-y-[1px]',
          'font-medium',
          'border-transparent'
        ],
        ghost: [
          'bg-white/10 text-white',
          'border border-white/15',
          'hover:bg-white/20',
          'font-normal'
        ],
        filter: [
          'bg-white text-[var(--neutral-900)]',
          'border border-[var(--neutral-200)]',
          'text-[13px]',
          'font-normal'
        ],
        iconButton: [
          'bg-white/10 text-white',
          'flex items-center justify-center',
          'hover:bg-white/20'
        ],
        // Compatibility variants for existing components (sidebar, etc) mapped to closest design token
        default: 'bg-[var(--accent-main)] text-white hover:bg-[#00C272]',
        destructive: 'bg-[var(--error-bg)] text-[var(--error-text)] hover:bg-[var(--error-bg)]/80',
        outline: 'border border-[var(--neutral-200)] bg-transparent hover:bg-[var(--neutral-100)] text-[var(--neutral-900)]',
        secondary: 'bg-[var(--neutral-100)] text-[var(--neutral-900)] hover:bg-[var(--neutral-200)]',
        link: 'text-[var(--primary-main)] underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-[auto] py-[10px] px-[20px] rounded-[12px] text-[14px]',
        filter: 'h-[auto] py-[6px] px-[12px] rounded-[8px]',
        icon: 'size-[32px] rounded-[8px] p-0',
        // Compatibility sizes
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  children?: ReactNode;
  isLoading?: boolean;
  asChild?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, isLoading, asChild = false, leftIcon, rightIcon, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
