"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar as CalendarIcon, DollarSign, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUpdateSavingsGoal } from "@/hooks/use-savings-goals"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { SavingsGoal } from "@/lib/api/savings-goals/types"

// Schema for the form validation
const savingsGoalSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  targetAmount: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().positive("Target amount must be positive")
  ),
  notes: z.string().optional(),
  targetDate: z.date().optional().nullable(),
})

type SavingsGoalFormValues = z.infer<typeof savingsGoalSchema>

interface EditGoalFormProps {
  goalId: string
}

export function EditGoalForm({ goalId }: EditGoalFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [goal, setGoal] = useState<SavingsGoal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { mutate: updateGoal, isPending: isUpdating } = useUpdateSavingsGoal()

  const form = useForm<SavingsGoalFormValues>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      notes: "",
      targetDate: null,
    },
  })

  // Load goal data from localStorage
  useEffect(() => {
    const fetchGoalFromStorage = () => {
      try {
        setIsLoading(true)
        if (typeof window !== 'undefined') {
          const storedGoal = localStorage.getItem('editGoalData')
          
          if (storedGoal) {
            const parsedGoal = JSON.parse(storedGoal) as SavingsGoal
            
            // Make sure we're editing the correct goal
            if (parsedGoal.id === goalId) {
              setGoal(parsedGoal)
              form.reset({
                name: parsedGoal.name,
                targetAmount: parsedGoal.targetAmount,
                notes: parsedGoal.notes || "",
                targetDate: parsedGoal.targetDate ? new Date(parsedGoal.targetDate) : null,
              })
            } else {
              // If the stored goal doesn't match the ID, navigate back to goals list
              toast({
                title: "Error",
                description: "Could not find the goal you're trying to edit.",
                variant: "destructive",
              })
              router.push("/goals")
            }
          } else {
            // If no goal found in storage, navigate back to goals list
            toast({
              title: "Error",
              description: "Could not find the goal you're trying to edit.",
              variant: "destructive",
            })
            router.push("/goals")
          }
        }
      } catch (error) {
        console.error("Error retrieving goal data:", error)
        toast({
          title: "Error",
          description: "Something went wrong while loading the goal.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGoalFromStorage()
  }, [goalId, form, router, toast])

  function onSubmit(values: SavingsGoalFormValues) {
    if (!goal) return
    
    // Format the data for API submission
    const goalData = {
      name: values.name,
      targetAmount: values.targetAmount,
      notes: values.notes || "",
      targetDate: values.targetDate ? values.targetDate.toISOString() : undefined,
    }

    updateGoal(
      { id: goalId, data: goalData },
      {
        onSuccess: (updatedGoal) => {
          toast({
            title: "Goal Updated",
            description: `"${updatedGoal.name}" has been updated successfully.`,
            variant: "default",
          })
          // Clear the stored goal data
          localStorage.removeItem('editGoalData')
          router.push("/goals")
        },
        onError: (error) => {
          console.error("Error updating goal:", error)
          toast({
            title: "Error",
            description: "Failed to update savings goal. Please try again.",
            variant: "destructive",
          })
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading goal...</span>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500 py-8">
              <p>Error loading goal. Please try again.</p>
              <Button 
                onClick={() => router.push("/goals")} 
                variant="outline" 
                className="mt-4"
              >
                Back to Goals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Savings Goal</h1>
      <Card>
        <CardHeader>
          <CardTitle>Edit "{goal.name}"</CardTitle>
          <CardDescription>Update your savings goal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Goal Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. New Car, Vacation, Emergency Fund" 
                {...form.register("name")} 
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="pl-9"
                  {...form.register("targetAmount")}
                />
              </div>
              {form.formState.errors.targetAmount && (
                <p className="text-sm text-red-500">{form.formState.errors.targetAmount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("targetDate") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("targetDate") ? (
                      format(form.watch("targetDate") as Date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("targetDate") as Date | undefined}
                    onSelect={(date) => form.setValue("targetDate", date)}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add details about your goal..."
                {...form.register("notes")}
              />
            </div>

            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  // Clear the stored goal data when canceling
                  localStorage.removeItem('editGoalData')
                  router.push("/goals")
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 