"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Clock, Plus, AlertCircle, Pencil, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useBills, useMarkBillAsPaid, useDeleteBill } from "@/hooks/use-bills"
import { Bill, BillStatusEnum } from "@/lib/api/bills/types"

export function BillsList() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("upcoming")

  // API integration - fetch all bills at once
  const { data: allBills, isLoading, isError, refetch } = useBills()
  
  // Mark bill as paid mutation
  const { mutate: markAsPaid, isPending: isMarkingPaid } = useMarkBillAsPaid()
  
  // Delete bill mutation
  const { mutate: deleteBill, isPending: isDeleting } = useDeleteBill()
  
  // Filter bills by status (lowercase for UI tab values, uppercase for API)
  const upcomingBills = allBills?.filter(bill => bill.status === 'UPCOMING') || []
  const overdueBills = allBills?.filter(bill => bill.status === 'OVERDUE') || []

  // Handle "Mark as Paid" action
  const handleMarkAsPaid = (bill: Bill) => {
    markAsPaid(
      { id: bill.id },
      {
        onSuccess: () => {
          toast({
            title: "Bill marked as paid",
            description: `${bill.name} has been marked as paid.`,
          })
          refetch()
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to mark bill as paid. Please try again.",
            variant: "destructive",
          })
          console.error("Error marking bill as paid:", error)
        }
      }
    )
  }
  
  // Handle delete bill action
  const handleDeleteBill = (bill: Bill) => {
    if (confirm(`Are you sure you want to delete "${bill.name}"?`)) {
      deleteBill(bill.id, {
        onSuccess: () => {
          toast({
            title: "Bill deleted",
            description: `${bill.name} has been deleted.`,
          })
          refetch()
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading bills...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
        <h3 className="text-lg font-medium">Error Loading Bills</h3>
        <p className="text-muted-foreground mb-4">There was a problem loading your bills.</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bills</h1>
        <Link href="/add-bill">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Bill
        </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bills & Recurring Expenses</CardTitle>
          <CardDescription>Manage your upcoming and overdue bills</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming
                {upcomingBills.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {upcomingBills.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue
                {overdueBills.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {overdueBills.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4 mt-4">
              {upcomingBills.length > 0 ? upcomingBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{bill.name}</span>
                      {bill.autopay && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Autopay
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{bill.category.name}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      Due {new Date(bill.dueDate).toLocaleDateString()}
                      {bill.daysUntilDue === 0 ? ' (Today)' : 
                       bill.daysUntilDue === 1 ? ' (Tomorrow)' : 
                       bill.daysUntilDue > 0 ? ` (in ${bill.daysUntilDue} days)` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-medium">${bill.amount.toFixed(2)}</div>
                    </div>
                    <div className="flex gap-1">
                      {/* Edit button */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.push(`/add-bill?id=${bill.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      {/* Mark as paid button */}
                      {!bill.autopay && (
                        <Button 
                          size="sm" 
                          onClick={() => handleMarkAsPaid(bill)}
                          disabled={isMarkingPaid}
                        >
                          {isMarkingPaid && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center p-4">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <h3 className="text-lg font-medium">No Upcoming Bills</h3>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="overdue" className="space-y-4 mt-4">
              {overdueBills.length > 0 ? overdueBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{bill.name}</span>
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {Math.abs(bill.daysUntilDue)} days overdue
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{bill.category.name}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      Due {new Date(bill.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-medium">${bill.amount.toFixed(2)}</div>
                    </div>
                    <div className="flex gap-1">
                      {/* Edit button */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/add-bill?id=${bill.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      {/* Mark as paid button */}
                      <Button 
                        size="sm" 
                        onClick={() => handleMarkAsPaid(bill)}
                        disabled={isMarkingPaid}
                      >
                        {isMarkingPaid && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                        Mark Paid
                      </Button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center p-4">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <h3 className="text-lg font-medium">No Overdue Bills</h3>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
