import * as React from "react";
import { cn } from "@/utils/cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Layout & Box Model
        "flex h-[44px] w-full rounded-[var(--radius-md)] border border-[var(--neutral-200)] bg-[var(--input-background)] px-4 py-2",
        // Typography
        "text-[14px] font-normal text-[var(--neutral-900)] placeholder:text-[var(--neutral-400)]",
        // Transitions
        "transition-all duration-200",
        // Focus States
        "outline-none focus-visible:border-[var(--accent-main)] focus-visible:ring-2 focus-visible:ring-[var(--accent-main)]/20",
        // Disabled State
        "disabled:cursor-not-allowed disabled:opacity-50",
        // File Input Styles
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Input };
