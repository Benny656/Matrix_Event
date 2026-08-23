import * as React from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ children, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group bg-background relative w-auto cursor-pointer overflow-hidden rounded-full border border-border px-5 py-2 text-center font-semibold text-sm transition-all duration-200 select-none whitespace-nowrap",
        className
      )}
      {...props}
    >
      {/* Normal State */}
      <div className="flex items-center justify-center gap-2">
        <div className="bg-primary h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-[100.8]"></div>
        <span className="inline-block whitespace-nowrap transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>

      {/* Hover Overlay State */}
      <div className="text-primary-foreground absolute inset-0 z-10 flex h-full w-full translate-x-6 items-center justify-center gap-1.5 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 whitespace-nowrap px-3">
        <span className="whitespace-nowrap font-semibold">{children}</span>
        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
      </div>
    </button>
  )
})

InteractiveHoverButton.displayName = "InteractiveHoverButton"
