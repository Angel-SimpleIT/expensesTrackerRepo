import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const cardVariants = cva(
  "rounded-[var(--radius-xl)] transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-white shadow-[var(--shadow-card)] border border-transparent",
        darkCreditCard: "bg-gradient-to-br from-[#025864] to-[#013E47] text-white shadow-[var(--shadow-card)] relative overflow-hidden",
        outline: "bg-transparent border border-[var(--neutral-200)] shadow-none",
        ghost: "bg-transparent border-none shadow-none"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> { }

function Card({ className, variant, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-[var(--font-h3-size)] font-[var(--font-h3-weight)] leading-none tracking-tight", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-[var(--neutral-500)]", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("p-6 pt-0", className)} {...props} />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
}

// Helper component for the credit card overlay pattern
function CardOverlayPattern() {
  return (
    <div
      className="absolute bottom-0 right-0 h-full w-full pointer-events-none opacity-10"
      style={{
        background: 'radial-gradient(circle at 100% 100%, #FFFFFF 0%, transparent 50%)'
      }}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardOverlayPattern };
