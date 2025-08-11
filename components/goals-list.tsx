"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, TrendingUp, Calendar, DollarSign, CheckCircle2, Loader2, Edit, Trash, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useSavingsGoals, useAddFundsToSavingsGoal, useCompleteSavingsGoal, useDeleteSavingsGoal } from "@/hooks/use-savings-goals"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SavingsGoal } from "@/lib/api/savings-goals/types"

export function GoalsList() {
  const [activeTab, setActiveTab] = useState("active")
  const [fundAmount, setFundAmount] = useState<number>(0)
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch goals from API
  const { data: allGoals, isLoading, error } = useSavingsGoals()
  const { mutate: addFunds, isPending: isAddingFunds } = useAddFundsToSavingsGoal()
  const { mutate: markGoalComplete, isPending: isCompletingGoal } = useCompleteSavingsGoal()
  const { mutate: deleteGoal, isPending: isDeleting } = useDeleteSavingsGoal()

  // Filter goals based on active tab
  const activeGoals = allGoals?.filter(goal => !goal.completed) || []
  const completedGoals = allGoals?.filter(goal => goal.completed) || []

  const handleAddFunds = (goalId: string) => {
    setSelectedGoalId(goalId)
    setIsAddFundsOpen(true)
  }

  const handleEditGoal = (goal: SavingsGoal) => {
    // Store the goal data in localStorage for the edit form to use
    localStorage.setItem('editGoalData', JSON.stringify(goal))
    router.push(`/edit-goal/${goal.id}`)
  }

  const handleDeleteConfirm = (goal: SavingsGoal) => {
    setSelectedGoal(goal)
    setSelectedGoalId(goal.id)
    setIsDeleteConfirmOpen(true)
  }

  const handleDeleteGoal = () => {
    if (!selectedGoalId) return
    
    deleteGoal(selectedGoalId, {
      onSuccess: () => {
        toast({
          title: "Goal Deleted",
          description: selectedGoal ? `"${selectedGoal.name}" has been deleted.` : "Goal has been deleted.",
          variant: "destructive",
        })
        setIsDeleteConfirmOpen(false)
        setSelectedGoalId(null)
        setSelectedGoal(null)
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to delete goal. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  const handleSubmitFunds = () => {
    if (!selectedGoalId || fundAmount <= 0) return
    
    addFunds(
      { id: selectedGoalId, amount: fundAmount },
      {
        onSuccess: (updatedGoal) => {
          toast({
            title: "Funds Added",
            description: `$${fundAmount.toFixed(2)} added to goal "${updatedGoal.name}"`,
            variant: "default",
          })
          setIsAddFundsOpen(false)
          setFundAmount(0)
          
          // If the goal is now completed, show a success message
          if (updatedGoal.completed) {
            toast({
              title: "Goal Completed!",
              description: `Congratulations! You've reached your target for "${updatedGoal.name}"`,
              variant: "default",
            })
          }
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to add funds. Please try again.",
            variant: "destructive",
          })
        }
      }
    )
  }

  const handleCompleteGoal = (goalId: string) => {
    markGoalComplete(goalId, {
      onSuccess: (updatedGoal) => {
        toast({
          title: "Goal Completed",
          description: `"${updatedGoal.name}" has been marked as completed`,
          variant: "default",
        })
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to complete goal. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Link href="/add-goal">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Goal
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Financial Goals</CardTitle>
          <CardDescription>Track progress toward your savings targets</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active Goals ({activeGoals.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed Goals ({completedGoals.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6 mt-4">
              {isLoading ? (
                <div className="text-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading goals...</p>
                </div>
              ) : error ? (
                <div className="text-center p-8">
                  <p className="text-red-500">Error loading goals. Please try again.</p>
                </div>
              ) : activeGoals.length === 0 ? (
                <div className="text-center p-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-medium">No Active Goals</h3>
                  <p className="text-muted-foreground">Create your first savings goal to get started!</p>
                </div>
              ) : (
                activeGoals.map((goal) => {
                  const progress = goal.progressPercentage
                  let progressColor = "bg-red-500"

                  if (progress >= 75) {
                    progressColor = "bg-green-500"
                  } else if (progress >= 50) {
                    progressColor = "bg-yellow-500"
                  }

                  return (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium">{goal.name}</h3>
                          <p className="text-sm text-muted-foreground">{goal.notes || "No description"}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 md:mt-0">
                          <Button size="sm" variant="outline" onClick={() => handleAddFunds(goal.id)}>
                            <Plus className="mr-1 h-3 w-3" />
                            Add Funds
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditGoal(goal)}>
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteConfirm(goal)}>
                            <Trash className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                          {progress >= 100 && (
                            <Button size="sm" variant="outline" onClick={() => handleCompleteGoal(goal.id)}>
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <DollarSign className="mr-1 h-4 w-4" />${goal.currentAmount.toFixed(2)} / $
                            {goal.targetAmount.toFixed(2)}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {goal.daysRemaining !== null ? `${goal.daysRemaining} days left` : "No deadline"}
                          </span>
                        </div>
                        <Progress value={progress} className={progressColor} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{progress}% complete</span>
                          <span>
                            {goal.targetDate 
                              ? `Target: ${new Date(goal.targetDate).toLocaleDateString()}`
                              : "No target date"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-6 mt-4">
              {isLoading ? (
                <div className="text-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading goals...</p>
                </div>
              ) : error ? (
                <div className="text-center p-8">
                  <p className="text-red-500">Error loading goals. Please try again.</p>
                </div>
              ) : completedGoals.length === 0 ? (
                <div className="text-center p-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-medium">No Completed Goals Yet</h3>
                  <p className="text-muted-foreground">Keep working toward your active goals!</p>
                </div>
              ) : (
                completedGoals.map((goal) => (
                  <div key={goal.id} className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium">{goal.name}</h3>
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">{goal.notes || "No description"}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <span className="text-sm text-muted-foreground">
                          Completed on {new Date(goal.updatedAt).toLocaleDateString()}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteConfirm(goal)}>
                          <Trash className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center">
                          <DollarSign className="mr-1 h-4 w-4" />${goal.currentAmount.toFixed(2)} / $
                          {goal.targetAmount.toFixed(2)}
                        </span>
                      </div>
                      <Progress value={100} className="bg-green-500" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>100% complete</span>
                        <span>
                          {goal.targetDate 
                            ? `Target: ${new Date(goal.targetDate).toLocaleDateString()}`
                            : "No target date"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Funds Dialog */}
      <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Funds to Goal</DialogTitle>
            <DialogDescription>
              Enter the amount you would like to add to your savings goal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3 relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="pl-8"
                  value={fundAmount || ""}
                  onChange={(e) => setFundAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFundsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmitFunds} disabled={isAddingFunds || fundAmount <= 0}>
              {isAddingFunds ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Funds"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedGoal?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteGoal} 
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Goal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
