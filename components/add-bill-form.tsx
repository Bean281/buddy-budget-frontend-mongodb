"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DollarSign, AlertCircle, Loader2, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { useCategories } from "@/hooks/use-categories"
import { useBill, useCreateBill, useUpdateBill, useDeleteBill } from "@/hooks/use-bills"
import { BillFrequencyEnum } from "@/lib/api/bills/types"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function AddBillForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const billId = searchParams.get('id')
  
  const [billName, setBillName] = useState("")
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [frequency, setFrequency] = useState<BillFrequencyEnum>("MONTHLY")
  const [categoryId, setCategoryId] = useState("")
  const [autopay, setAutopay] = useState(false)
  const [notes, setNotes] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; amount?: string; dueDate?: string; categoryId?: string }>({})

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useCategories("EXPENSE")
  
  // Fetch bill data if editing
  const { data: billData, isLoading: isLoadingBill } = useBill(billId || "")
  
  // Mutations
  const { mutate: createBill, isPending: isCreating } = useCreateBill()
  const { mutate: updateBill, isPending: isUpdating } = useUpdateBill()
  const { mutate: deleteBill, isPending: isDeleting } = useDeleteBill()
  
  const isSubmitting = isCreating || isUpdating
  
  // Load bill data if editing
  useEffect(() => {
    if (billId && billData) {
      setIsEditing(true)
      setBillName(billData.name)
      setAmount(billData.amount.toString())
      setDueDate(new Date(billData.dueDate).toISOString().split('T')[0])
      setFrequency(billData.frequency)
      setCategoryId(billData.categoryId)
      setAutopay(billData.autopay)
      setNotes(billData.notes || "")
    }
  }, [billId, billData])

  const validateForm = () => {
    const newErrors: { name?: string; amount?: string; dueDate?: string; categoryId?: string } = {}
    let isValid = true

    if (!billName.trim()) {
      newErrors.name = "Please enter a bill name"
      isValid = false
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount"
      isValid = false
    }

    if (!dueDate) {
      newErrors.dueDate = "Please select a due date"
      isValid = false
    }

    if (!categoryId) {
      newErrors.categoryId = "Please select a category"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const billData = {
      name: billName,
      amount: parseFloat(amount),
      dueDate,
      frequency,
      categoryId,
      autopay,
      notes: notes || undefined,
    }

    if (isEditing && billId) {
      // Update existing bill
      updateBill({
        id: billId,
        data: billData
      }, {
        onSuccess: () => {
          toast({
            title: "Bill updated",
            description: `${billName} has been updated.`,
          })
          router.push("/bills")
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to update bill. Please try again.",
            variant: "destructive",
          })
          console.error("Error updating bill:", error)
        }
      })
    } else {
      // Create new bill
      createBill(billData, {
        onSuccess: () => {
          toast({
            title: "Bill added",
            description: `${billName} has been added to your bills.`,
          })
          router.push("/bills")
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to add bill. Please try again.",
            variant: "destructive",
          })
          console.error("Error adding bill:", error)
        }
      })
    }
  }
  
  const handleDelete = () => {
    if (billId) {
      deleteBill(billId, {
        onSuccess: () => {
          toast({
            title: "Bill deleted",
            description: "The bill has been deleted.",
          })
          router.push("/bills")
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to delete bill. Please try again.",
            variant: "destructive",
          })
          console.error("Error deleting bill:", error)
        }
      })
    }
  }
  
  if (billId && isLoadingBill) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading bill details...</span>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">{isEditing ? "Edit Bill" : "Add Bill"}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Bill" : "New Bill"}</CardTitle>
          <CardDescription>{isEditing ? "Update your bill details" : "Add a recurring bill or expense"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="billName">Bill Name</Label>
                <Input
                  id="billName"
                  placeholder="e.g., Rent, Electricity, Netflix"
                  value={billName}
                  onChange={(e) => {
                    setBillName(e.target.value)
                    setErrors({ ...errors, name: undefined })
                  }}
                />
                {errors.name && (
                  <div className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      setErrors({ ...errors, amount: undefined })
                    }}
                  />
                </div>
                {errors.amount && (
                  <div className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.amount}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value)
                    setErrors({ ...errors, dueDate: undefined })
                  }}
                />
                {errors.dueDate && (
                  <div className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.dueDate}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={(value) => setFrequency(value as BillFrequencyEnum)}>
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="BIANNUALLY">Bi-annually</SelectItem>
                    <SelectItem value="ANNUALLY">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                {isLoadingCategories ? (
                  <div className="flex items-center space-x-2 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading categories...</span>
                  </div>
                ) : (
                  <Select
                    value={categoryId}
                    onValueChange={(value) => {
                      setCategoryId(value)
                      setErrors({ ...errors, categoryId: undefined })
                    }}
                  >
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.categoryId && (
                  <div className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.categoryId}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="autopay" checked={autopay} onCheckedChange={setAutopay} />
                <Label htmlFor="autopay">Autopay enabled</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className={isEditing ? "flex-col space-y-2" : ""}>
          <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Saving..."}
              </>
            ) : isEditing ? "Update Bill" : "Save Bill"}
          </Button>
          
          {isEditing && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Bill
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the bill. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
