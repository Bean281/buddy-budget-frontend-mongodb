"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Loader2, AlertCircle, Target, TrendingUp, History } from "lucide-react"
import { useSavingsGoals } from "@/hooks/use-savings-goals"
import { SavingsGoalsHistory } from "./savings-goals-history"

export function SavingsGoals() {
  const { data: allGoals, isLoading, isError } = useSavingsGoals({ status: 'active' })

  // Show only first 3 active goals for dashboard
  const goals = allGoals?.slice(0, 3) || []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Savings Goals</CardTitle>
          <CardDescription>Track your progress toward financial goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading savings goals...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Savings Goals</CardTitle>
          <CardDescription>Track your progress toward financial goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <h3 className="text-lg font-medium">Error Loading Goals</h3>
            <p className="text-muted-foreground">There was a problem loading your savings goals.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Savings Goals</CardTitle>
            <CardDescription>
              {goals.length === 0 
                ? "No active savings goals" 
                : `Track your progress toward financial goals (${goals.length} active)`
              }
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                View History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Savings Goals History</DialogTitle>
              </DialogHeader>
              <SavingsGoalsHistory />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center p-4">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-lg font-medium">No Savings Goals</h3>
              <p className="text-muted-foreground">Create your first savings goal to start tracking progress.</p>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = Math.round(goal.progressPercentage)
              let progressColor = "bg-red-500"

              if (progress >= 75) {
                progressColor = "bg-green-500"
              } else if (progress >= 50) {
                progressColor = "bg-yellow-500"
              }

              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{goal.name}</span>
                      {progress >= 100 && (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <span className="text-sm">
                      ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className={progressColor} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress}% complete</span>
                    <span>
                      {goal.targetDate 
                        ? `Target: ${new Date(goal.targetDate).toLocaleDateString()}`
                        : "No target date"}
                    </span>
                  </div>
                  {goal.daysRemaining !== null && goal.daysRemaining > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {goal.daysRemaining} days remaining
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
