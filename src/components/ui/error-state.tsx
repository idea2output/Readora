import * as React from "react"
import { cn } from "@/lib/utils"

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title?: string
  description: string
  action?: React.ReactNode
}

export function ErrorState({
  className,
  icon,
  title = "Something went wrong",
  description,
  action,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-destructive/20 bg-destructive/5 p-8 text-center",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          {icon}
        </div>
      )}
      <h3 className="mt-4 text-lg font-semibold text-destructive">{title}</h3>
      <p className="mb-4 mt-2 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
