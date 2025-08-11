"use client"

import * as React from "react"

const Chart = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div className="relative" ref={ref} {...props} />
))
Chart.displayName = "Chart"

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className="relative" ref={ref} {...props} />,
)
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className="pointer-events-none absolute z-50 opacity-0 transition-opacity data-[state=open]:opacity-100"
      ref={ref}
      {...props}
    />
  ),
)
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className="rounded-md border bg-popover p-4 text-popover-foreground shadow-sm" ref={ref} {...props} />
  ),
)
ChartTooltipContent.displayName = "ChartTooltipContent"

interface ChartTooltipItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode
  value?: React.ReactNode
  color?: string
}

const ChartTooltipItem = React.forwardRef<HTMLDivElement, ChartTooltipItemProps>(
  ({ className, label, value, color, ...props }, ref) => (
    <div className="flex items-center justify-between space-x-2" ref={ref} {...props}>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <span className="font-medium">{value}</span>
    </div>
  ),
)
ChartTooltipItem.displayName = "ChartTooltipItem"

export { Chart, ChartContainer, ChartTooltip, ChartTooltipContent, ChartTooltipItem }
