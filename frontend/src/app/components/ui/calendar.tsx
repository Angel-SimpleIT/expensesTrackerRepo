"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-[var(--neutral-200)]",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-[var(--neutral-500)] rounded-[var(--radius-sm)] w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[var(--neutral-100)] [&:has([aria-selected].day-range-end)]:rounded-r-[var(--radius-sm)]",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-[var(--radius-sm)] [&:has(>.day-range-start)]:rounded-l-[var(--radius-sm)] first:[&:has([aria-selected])]:rounded-l-[var(--radius-sm)] last:[&:has([aria-selected])]:rounded-r-[var(--radius-sm)]"
            : "[&:has([aria-selected])]:rounded-[var(--radius-sm)]",
        ),
        day: cn(
          buttonVariants({ variant: "ghostLight" }),
          "size-8 p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_start:
          "day-range-start aria-selected:bg-[var(--primary-main)] aria-selected:text-white",
        day_range_end:
          "day-range-end aria-selected:bg-[var(--primary-main)] aria-selected:text-white",
        day_selected:
          "bg-[var(--primary-main)] text-white hover:bg-[var(--primary-main)] hover:text-white focus:bg-[var(--primary-main)] focus:text-white",
        day_today: "bg-[var(--neutral-100)] text-[var(--neutral-900)] border border-[var(--neutral-200)]",
        day_outside:
          "day-outside text-[var(--neutral-400)] aria-selected:text-[var(--neutral-400)] opacity-50",
        day_disabled: "text-[var(--neutral-300)] opacity-50",
        day_range_middle:
          "aria-selected:bg-[var(--neutral-100)] aria-selected:text-[var(--neutral-900)]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
