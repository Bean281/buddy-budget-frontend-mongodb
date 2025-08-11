"use client"

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
import { useCreateSavingsGoal } from "@/hooks/use-savings-goals"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

// Schema for the form validation
const savingsGoalSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  targetAmount: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().positive("Target amount must be positive")
  ),
  currentAmount: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(1, "Current amount must be non-negative")
  ),
  notes: z.string().optional(),
  targetDate: z.date().optional().nullable(),
})

type SavingsGoalFormValues = z.infer<typeof savingsGoalSchema>

export function AddGoalForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { mutate: createGoal, isPending } = useCreateSavingsGoal()

  const form = useForm<SavingsGoalFormValues>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      notes: "",
      targetDate: null,
    },
  })

  function onSubmit(values: SavingsGoalFormValues) {
    // Format the data for API submission
    const goalData = {
      name: values.name,
      targetAmount: values.targetAmount,
      currentAmount: values.currentAmount || 0,
      notes: values.notes || "",
      targetDate: values.targetDate ? values.targetDate.toISOString() : undefined,
    }

    createGoal(goalData, {
      onSuccess: () => {
        toast({
          title: "Goal Created",
          description: `New savings goal "${values.name}" has been created.`,
          variant: "default",
        })
        router.push("/goals")
      },
      onError: (error) => {
        console.error("Error creating goal:", error)
      toast({
          title: "Error",
          description: "Failed to create savings goal. Please try again.",
          variant: "destructive",
        })
      },
    })
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Savings Goal</h1>
      <Card>
        <CardHeader>
          <CardTitle>New Savings Goal</CardTitle>
          <CardDescription>Set a target and track your progress</CardDescription>
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
                <Label htmlFor="currentAmount">Current Amount (Optional)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="currentAmount"
                    type="number"
                    step="0.01"
                  min="0"
                    placeholder="0.00"
                    className="pl-9"
                  {...form.register("currentAmount")}
                  />
              </div>
              {form.formState.errors.currentAmount && (
                <p className="text-sm text-red-500">{form.formState.errors.currentAmount.message}</p>
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

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Goal"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
