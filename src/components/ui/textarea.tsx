import { cn } from "cn"
import * as React from "react"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex field-sizing-content min-h-20 w-full border-0 border-b border-foreground/15 bg-transparent px-0 py-2 text-sm leading-relaxed transition-colors outline-none placeholder:text-neutral-400 focus-visible:border-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className,
      )}
      data-slot="textarea"
      {...props}
    />
  )
}

export { Textarea }
