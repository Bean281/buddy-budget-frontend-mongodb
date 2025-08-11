import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Target } from "lucide-react"

interface BudgetProgressProps {
  title: string
  current: number
  target: number
  period: string
  plannedAmount?: number
}

export function BudgetProgress({ title, current, target, period, plannedAmount }: BudgetProgressProps) {
  // Calculate combined budget and remaining
  const combinedTarget = target + (plannedAmount || 0)
  const combinedRemaining = combinedTarget - current
  const isOverBudget = current > combinedTarget
  const percentage = Math.min(Math.round((current / combinedTarget) * 100), 100)

  let progressColor = "bg-income"
  if (percentage > 70) {
    progressColor = "bg-warning"
  }
  if (isOverBudget) {
    progressColor = "bg-expense"
  }

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{period}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              {formatCurrency(current)} of {formatCurrency(combinedTarget)}
              {/* {plannedAmount && plannedAmount > 0 && (
                <span className="block text-xs">
                  (${target.toFixed(2)} + ${plannedAmount.toFixed(2)})
                </span>
              )} */}
            </span>
            <span className="text-sm font-medium">
              {isOverBudget ? (
                <span className="text-expense">Over budget by {formatCurrency(Math.abs(combinedRemaining))}</span>
              ) : (
                <span className="text-income">{formatCurrency(combinedRemaining)} remaining</span>
              )}
            </span>
          </div>
          <Progress value={percentage} className={progressColor} />
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">{percentage}% used</div>
            {plannedAmount && plannedAmount > 0 && (
              <div className="text-xs text-muted-foreground flex items-center">
                <Target className="mr-1 h-3 w-3" />
                Combined Budget
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
