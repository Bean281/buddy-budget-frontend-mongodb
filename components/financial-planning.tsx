"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Save,
  Calendar,
  CalendarDays,
  CalendarRange,
  Plus,
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { 
  useFinancialPlan,
  useAddIncomeItem,
  useAddExpenseItem,
  useAddSavingsItem,
  useUpdateIncomeItem,
  useUpdateExpenseItem,
  useUpdateSavingsItem,
  useDeleteIncomeItem,
  useDeleteExpenseItem,
  useDeleteSavingsItem,
  useSaveCompletePlan,
} from "@/hooks/use-planning"
import { useCategories } from "@/hooks/use-categories"
import { PlanType, PlanItemInput, PlanItemUpdateInput } from "@/lib/api/planning/types"

// Types for our financial planning data
interface PlanItem {
  id: string
  description: string
  amount: number
  category?: string
  notes?: string
}

interface FinancialPlan {
  income: PlanItem[]
  expenses: PlanItem[]
  savings: PlanItem[]
}

export function FinancialPlanning() {
  const [planTab, setPlanTab] = useState<PlanType>("daily")

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"income" | "expense" | "savings">("income")
  const [isEditing, setIsEditing] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  // Form state
  const [itemDescription, setItemDescription] = useState("")
  const [itemAmount, setItemAmount] = useState("")
  const [itemCategory, setItemCategory] = useState("")
  const [itemNotes, setItemNotes] = useState("")

  // API integration
  const { data: apiPlanData, isLoading, isError, error } = useFinancialPlan(planTab)
  
  // Categories from API
  const { data: incomeCategories = [], isLoading: isLoadingIncomeCategories } = useCategories("INCOME")
  const { data: expenseCategories = [], isLoading: isLoadingExpenseCategories } = useCategories("EXPENSE")
  
  // Savings categories - try to fetch from API, fallback to hardcoded
  // Note: Currently API only supports INCOME/EXPENSE, so we use hardcoded categories
  const savingsCategories = [
    { id: "emergency", name: "Emergency Fund", icon: "shield", color: "#10b981" },
    { id: "retirement", name: "Retirement", icon: "calendar", color: "#3b82f6" },
    { id: "vacation", name: "Vacation", icon: "plane", color: "#f59e0b" },
    { id: "education", name: "Education", icon: "book", color: "#8b5cf6" },
    { id: "major-purchase", name: "Major Purchase", icon: "shopping-cart", color: "#ef4444" },
    { id: "investment", name: "Investment", icon: "trending-up", color: "#06b6d4" },
    { id: "home", name: "Home/Property", icon: "home", color: "#84cc16" },
    { id: "other-savings", name: "Other Savings", icon: "piggy-bank", color: "#6b7280" },
  ]

  // Mutations for CRUD operations
  const { mutate: addIncome, isPending: isAddingIncome } = useAddIncomeItem()
  const { mutate: addExpense, isPending: isAddingExpense } = useAddExpenseItem()
  const { mutate: addSavings, isPending: isAddingSavings } = useAddSavingsItem()
  const { mutate: updateIncome, isPending: isUpdatingIncome } = useUpdateIncomeItem()
  const { mutate: updateExpense, isPending: isUpdatingExpense } = useUpdateExpenseItem()
  const { mutate: updateSavings, isPending: isUpdatingSavings } = useUpdateSavingsItem()
  const { mutate: deleteIncome, isPending: isDeletingIncome } = useDeleteIncomeItem()
  const { mutate: deleteExpense, isPending: isDeletingExpense } = useDeleteExpenseItem()
  const { mutate: deleteSavings, isPending: isDeletingSavings } = useDeleteSavingsItem()
  const { mutate: savePlan, isPending: isSavingPlan } = useSaveCompletePlan()

  // Check if any mutation is pending
  const isMutating = isAddingIncome || isAddingExpense || isAddingSavings || 
                    isUpdatingIncome || isUpdatingExpense || isUpdatingSavings ||
                    isDeletingIncome || isDeletingExpense || isDeletingSavings

  // Helper function to find category name by ID
  const getCategoryName = (type: "income" | "expense" | "savings", categoryId?: string) => {
    if (!categoryId) return ""

    let categories
    switch (type) {
      case "income":
        categories = incomeCategories
        break
      case "expense":
        categories = expenseCategories
        break
      case "savings":
        categories = savingsCategories
        break
    }

    // First try to find by ID
    const categoryById = categories.find((cat) => cat.id === categoryId)
    if (categoryById) return categoryById.name

    // If not found by ID, try to find by name (for backward compatibility)
    const categoryByName = categories.find((cat) => cat.name === categoryId)
    if (categoryByName) return categoryByName.name

    // Return the categoryId as fallback
    return categoryId
  }

  // Helper function to get category ID from name (for backward compatibility)
  const getCategoryId = (type: "income" | "expense" | "savings", categoryNameOrId?: string) => {
    if (!categoryNameOrId) return undefined

    let categories
    switch (type) {
      case "income":
        categories = incomeCategories
        break
      case "expense":
        categories = expenseCategories
        break
      case "savings":
        categories = savingsCategories
        break
    }

    // First try to find by ID
    const categoryById = categories.find((cat) => cat.id === categoryNameOrId)
    if (categoryById) return categoryById.id

    // If not found by ID, try to find by name (for backward compatibility)
    const categoryByName = categories.find((cat) => cat.name === categoryNameOrId)
    if (categoryByName) return categoryByName.id

    // Return the original value as fallback
    return categoryNameOrId
  }

  // Transform API data to match UI structure
  const transformApiDataToUI = (apiData: any): FinancialPlan => {
    if (!apiData) {
      return { income: [], expenses: [], savings: [] }
    }

    const transformItems = (items: any[], type: "income" | "expense" | "savings") => 
      items.map(item => ({
        id: item.id,
        description: item.description,
        amount: item.amount,
        category: getCategoryId(type, item.categoryId),
        notes: item.notes || undefined
      }))

    return {
      income: transformItems(apiData.income || [], "income"),
      expenses: transformItems(apiData.expenses || [], "expense"),
      savings: transformItems(apiData.savings || [], "savings")
    }
  }

  // Current plan data (from API or empty)
  const currentPlan = transformApiDataToUI(apiPlanData)

  const calculateTotals = (items: PlanItem[]) => {
    return items.reduce((total, item) => total + item.amount, 0)
  }

  // Calculate totals from API data or current plan
  const incomeTotal = apiPlanData?.incomeTotal || calculateTotals(currentPlan.income)
  const expenseTotal = apiPlanData?.expensesTotal || calculateTotals(currentPlan.expenses)
  const savingsTotal = apiPlanData?.savingsTotal || calculateTotals(currentPlan.savings)
  const netAmount = apiPlanData?.balance || (incomeTotal - expenseTotal - savingsTotal)

  const handleAddItem = (type: "income" | "expense" | "savings") => {
    setDialogType(type)
    setIsEditing(false)
    setItemDescription("")
    setItemAmount("")
    setItemCategory("")
    setItemNotes("")
    setIsDialogOpen(true)
  }

  const handleEditItem = (type: "income" | "expense" | "savings", item: PlanItem) => {
    setDialogType(type)
    setIsEditing(true)
    setEditingItemId(item.id)
    setItemDescription(item.description)
    setItemAmount(item.amount.toString())
    setItemCategory(item.category || "")
    setItemNotes(item.notes || "")
    setIsDialogOpen(true)
  }

  // Reset category when dialog type changes
  useEffect(() => {
    setItemCategory("")
  }, [dialogType])

  const handleDeleteItem = (type: "income" | "expense" | "savings", itemId: string) => {
    const deleteActions = {
      income: () => deleteIncome({ type: planTab, id: itemId }, {
        onSuccess: () => {
          toast({
            title: "Item deleted",
            description: `The ${type} item has been removed from your plan.`,
          })
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: "Failed to delete item. Please try again.",
            variant: "destructive",
          })
          console.error("Error deleting item:", error)
        }
      }),
      expense: () => deleteExpense({ type: planTab, id: itemId }, {
        onSuccess: () => {
          toast({
            title: "Item deleted",
            description: `The ${type} item has been removed from your plan.`,
          })
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: "Failed to delete item. Please try again.",
            variant: "destructive",
          })
          console.error("Error deleting item:", error)
        }
      }),
      savings: () => deleteSavings({ type: planTab, id: itemId }, {
        onSuccess: () => {
          toast({
            title: "Item deleted",
            description: `The ${type} item has been removed from your plan.`,
          })
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: "Failed to delete item. Please try again.",
            variant: "destructive",
          })
          console.error("Error deleting item:", error)
        }
      })
    }

    deleteActions[type]()
  }

  const handleSaveItem = () => {
    if (!itemDescription.trim()) {
      toast({
        title: "Error",
        description: "Description is required.",
        variant: "destructive",
      })
      return
    }

    if (!itemAmount || Number.parseFloat(itemAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      })
      return
    }

    const itemData: PlanItemInput = {
      description: itemDescription,
      amount: Number.parseFloat(itemAmount),
      categoryId: itemCategory || undefined,
      notes: itemNotes.trim() || undefined,
    }

    const updateData: PlanItemUpdateInput = {
      description: itemDescription,
      amount: Number.parseFloat(itemAmount),
      categoryId: itemCategory || undefined,
      notes: itemNotes.trim() || undefined,
    }

    if (isEditing && editingItemId) {
      // Update existing item
      const updateActions = {
        income: () => updateIncome({ type: planTab, id: editingItemId, data: updateData }, {
          onSuccess: () => {
            toast({
              title: "Item updated",
              description: `The ${dialogType} item has been updated.`,
            })
            setIsDialogOpen(false)
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: "Failed to update item. Please try again.",
              variant: "destructive",
            })
            console.error("Error updating item:", error)
          }
        }),
        expense: () => updateExpense({ type: planTab, id: editingItemId, data: updateData }, {
          onSuccess: () => {
            toast({
              title: "Item updated",
              description: `The ${dialogType} item has been updated.`,
            })
            setIsDialogOpen(false)
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: "Failed to update item. Please try again.",
              variant: "destructive",
            })
            console.error("Error updating item:", error)
          }
        }),
        savings: () => updateSavings({ type: planTab, id: editingItemId, data: updateData }, {
          onSuccess: () => {
            toast({
              title: "Item updated",
              description: `The ${dialogType} item has been updated.`,
            })
            setIsDialogOpen(false)
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: "Failed to update item. Please try again.",
              variant: "destructive",
            })
            console.error("Error updating item:", error)
          }
        })
      }

      updateActions[dialogType]()
    } else {
      // Add new item
      const addActions = {
        income: () => addIncome({ type: planTab, data: itemData }, {
          onSuccess: () => {
            toast({
              title: "Item added",
              description: `The ${dialogType} item has been added to your plan.`,
            })
            setIsDialogOpen(false)
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: "Failed to add item. Please try again.",
              variant: "destructive",
            })
            console.error("Error adding item:", error)
          }
        }),
        expense: () => addExpense({ type: planTab, data: itemData }, {
          onSuccess: () => {
            toast({
              title: "Item added",
              description: `The ${dialogType} item has been added to your plan.`,
            })
            setIsDialogOpen(false)
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: "Failed to add item. Please try again.",
              variant: "destructive",
            })
            console.error("Error adding item:", error)
          }
        }),
        savings: () => addSavings({ type: planTab, data: itemData }, {
          onSuccess: () => {
            toast({
              title: "Item added",
              description: `The ${dialogType} item has been added to your plan.`,
            })
            setIsDialogOpen(false)
          },
          onError: (error: any) => {
            toast({
              title: "Error",
              description: "Failed to add item. Please try again.",
              variant: "destructive",
            })
            console.error("Error adding item:", error)
          }
        })
      }

      addActions[dialogType]()
    }
  }

  const handleSavePlan = () => {
    // Always allow saving, even if currentPlan is empty or some categories are empty
    const planInput = {
      income: currentPlan?.income?.map(item => ({
        description: item.description,
        amount: item.amount,
        categoryId: item.category || undefined,
        notes: item.notes || undefined,
      })) || [],
      expenses: currentPlan?.expenses?.map(item => ({
        description: item.description,
        amount: item.amount,
        categoryId: item.category || undefined,
        notes: item.notes || undefined,
      })) || [],
      savings: currentPlan?.savings?.map(item => ({
        description: item.description,
        amount: item.amount,
        categoryId: item.category || undefined,
        notes: item.notes || undefined,
      })) || [],
      incomeTotal: incomeTotal || 0,
      expensesTotal: expenseTotal || 0,
      savingsTotal: savingsTotal || 0,
    }

    savePlan({ type: planTab, data: planInput }, {
      onSuccess: () => {
        toast({
          title: "Plan saved",
          description: `Your ${planTab} plan has been saved successfully.`,
        })
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: "Failed to save plan. Please try again.",
          variant: "destructive",
        })
        console.error("Error saving plan:", error)
      }
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Financial Planning</h1>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading your financial plan...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Financial Planning</h1>
        <Card>
          <CardContent className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <h3 className="text-lg font-medium">Error Loading Plan</h3>
            <p className="text-muted-foreground mb-4">
              There was a problem loading your financial plan.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Helper function to render table row for plan items
  const renderPlanItemRow = (item: PlanItem, type: "income" | "expense" | "savings") => (
    <TableRow key={item.id}>
      <TableCell>
        <div>
          <div>{item.description}</div>
          {item.category && type !== "savings" && (
            <div className="text-xs text-muted-foreground">
              {getCategoryName(type, item.category)}
            </div>
          )}
          {item.notes && (
            <div className="text-xs text-muted-foreground italic">
              {item.notes}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleEditItem(type, item)}
            disabled={isMutating}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleDeleteItem(type, item.id)}
            disabled={isMutating}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Financial Planning</h1>

      <Card>
        <CardHeader>
          <CardTitle>Plan Your Finances</CardTitle>
          <CardDescription>
            Create and manage your financial plans for different time periods. 
            Track your income, expenses, and savings goals to maintain a healthy financial balance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={planTab} onValueChange={(value) => setPlanTab(value as PlanType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Daily</span>
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>Weekly</span>
              </TabsTrigger>
              <TabsTrigger value="monthly" className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4" />
                <span>Monthly</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      <ArrowUpCircle className="h-5 w-5 mr-2 text-income" />
                      Income
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleAddItem("income")} className="h-8 gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </Button>
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentPlan.income.map((item) => renderPlanItemRow(item, "income"))}
                        <TableRow>
                          <TableCell className="font-medium">Total Income</TableCell>
                          <TableCell className="text-right font-medium text-income">
                            ${incomeTotal.toFixed(2)}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      <ArrowDownCircle className="h-5 w-5 mr-2 text-expense" />
                      Expenses
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleAddItem("expense")} className="h-8 gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </Button>
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentPlan.expenses.map((item) => renderPlanItemRow(item, "expense"))}
                        <TableRow>
                          <TableCell className="font-medium">Total Expenses</TableCell>
                          <TableCell className="text-right font-medium text-expense">
                            ${expenseTotal.toFixed(2)}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      <Save className="h-5 w-5 mr-2 text-savings" />
                      Savings
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleAddItem("savings")} className="h-8 gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </Button>
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentPlan.savings.map((item) => renderPlanItemRow(item, "savings"))}
                        <TableRow>
                          <TableCell className="font-medium">Total Savings</TableCell>
                          <TableCell className="text-right font-medium text-savings">
                            ${savingsTotal.toFixed(2)}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                      <p className="text-2xl font-bold text-income">${incomeTotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                      <p className="text-2xl font-bold text-expense">${expenseTotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Savings</p>
                      <p className="text-2xl font-bold text-savings">${savingsTotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                      <p className={`text-2xl font-bold ${netAmount >= 0 ? "text-income" : "text-expense"}`}>
                        ${netAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* <div className="flex justify-end">
                <Button onClick={handleSavePlan} disabled={isSavingPlan}>
                  {isSavingPlan && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Daily Plan
                </Button>
              </div> */}
            </TabsContent>

            <TabsContent value="weekly" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      <ArrowUpCircle className="h-5 w-5 mr-2 text-income" />
                      Income
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleAddItem("income")} className="h-8 gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </Button>
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentPlan.income.map((item) => renderPlanItemRow(item, "income"))}
                        <TableRow>
                          <TableCell className="font-medium">Total Income</TableCell>
                          <TableCell className="text-right font-medium text-income">
                            ${incomeTotal.toFixed(2)}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      <ArrowDownCircle className="h-5 w-5 mr-2 text-expense" />
                      Expenses
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleAddItem("expense")} className="h-8 gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </Button>
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentPlan.expenses.map((item) => renderPlanItemRow(item, "expense"))}
                        <TableRow>
                          <TableCell className="font-medium">Total Expenses</TableCell>
                          <TableCell className="text-right font-medium text-expense">
                            ${expenseTotal.toFixed(2)}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      <Save className="h-5 w-5 mr-2 text-savings" />
                      Savings
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleAddItem("savings")} className="h-8 gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </Button>
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentPlan.savings.map((item) => renderPlanItemRow(item, "savings"))}
                        <TableRow>
                          <TableCell className="font-medium">Total Savings</TableCell>
                          <TableCell className="text-right font-medium text-savings">
                            ${savingsTotal.toFixed(2)}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                      <p className="text-2xl font-bold text-income">${incomeTotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                      <p className="text-2xl font-bold text-expense">${expenseTotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Savings</p>
                      <p className="text-2xl font-bold text-savings">${savingsTotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                      <p className={`text-2xl font-bold ${netAmount >= 0 ? "text-income" : "text-expense"}`}>
                        ${netAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* <div className="flex justify-end">
                <Button onClick={handleSavePlan} disabled={isSavingPlan}>
                  {isSavingPlan && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Weekly Plan
                </Button>
              </div> */}
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      <ArrowUpCircle className="h-5 w-5 mr-2 text-income" />
                      Income
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleAddItem("income")} className="h-8 gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </Button>
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentPlan.income.map((item) => renderPlanItemRow(item, "income"))}
                        <TableRow>
                          <TableCell className="font-medium">Total Income</TableCell>
                          <TableCell className="text-right font-medium text-income">
                            ${incomeTotal.toFixed(2)}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      <ArrowDownCircle className="h-5 w-5 mr-2 text-expense" />
                      Expenses
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleAddItem("expense")} className="h-8 gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </Button>
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentPlan.expenses.map((item) => renderPlanItemRow(item, "expense"))}
                        <TableRow>
                          <TableCell className="font-medium">Total Expenses</TableCell>
                          <TableCell className="text-right font-medium text-expense">
                            ${expenseTotal.toFixed(2)}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      <Save className="h-5 w-5 mr-2 text-savings" />
                      Savings
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleAddItem("savings")} className="h-8 gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </Button>
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentPlan.savings.map((item) => renderPlanItemRow(item, "savings"))}
                        <TableRow>
                          <TableCell className="font-medium">Total Savings</TableCell>
                          <TableCell className="text-right font-medium text-savings">
                            ${savingsTotal.toFixed(2)}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                      <p className="text-2xl font-bold text-income">${incomeTotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                      <p className="text-2xl font-bold text-expense">${expenseTotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Savings</p>
                      <p className="text-2xl font-bold text-savings">${savingsTotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                      <p className={`text-2xl font-bold ${netAmount >= 0 ? "text-income" : "text-expense"}`}>
                        ${netAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* <div className="flex justify-end">
                <Button onClick={handleSavePlan} disabled={isSavingPlan}>
                  {isSavingPlan && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Monthly Plan
                </Button>
              </div> */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add/Edit Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? `Edit ${dialogType}` : `Add ${dialogType}`}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? `Update the details of this ${dialogType} item.`
                : `Add a new ${dialogType} item to your financial plan.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder={`Enter ${dialogType} description`}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={itemAmount}
                  onChange={(e) => setItemAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>
            {dialogType !== "savings" && (
              <div className="grid gap-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Select value={itemCategory} onValueChange={setItemCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {dialogType === "income" &&
                      incomeCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    {dialogType === "expense" &&
                      expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                placeholder="Enter any notes for this item"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem} disabled={isMutating}>
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
