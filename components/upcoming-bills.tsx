"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Loader2, AlertCircle, Clock } from "lucide-react"
import { useBillReminders } from "@/hooks/use-bills"

export function UpcomingBills() {
  const { data: bills, isLoading, isError } = useBillReminders({ days: 30 })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bills</CardTitle>
          <CardDescription>Loading your upcoming bills...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading bills...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bills</CardTitle>
          <CardDescription>Error loading bills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <h3 className="text-lg font-medium">Error Loading Bills</h3>
            <p className="text-muted-foreground">There was a problem loading your bills.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const upcomingBills = bills?.filter(bill => bill.status === 'UPCOMING').slice(0, 5) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Bills</CardTitle>
        <CardDescription>
          {upcomingBills.length === 0 
            ? "No upcoming bills" 
            : `You have ${upcomingBills.length} bill${upcomingBills.length === 1 ? '' : 's'} due soon`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingBills.length === 0 ? (
            <div className="text-center p-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h3 className="text-lg font-medium">No Upcoming Bills</h3>
              <p className="text-muted-foreground">You're all caught up with your bills!</p>
            </div>
          ) : (
            upcomingBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{bill.name}</span>
                    {bill.autopay && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Autopay
                      </Badge>
                    )}
                    {bill.daysUntilDue <= 3 && (
                      <Badge variant="destructive" className="text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        Due Soon
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{bill.category.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${bill.amount.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">
                    {bill.daysUntilDue === 0 ? 'Due Today' : 
                     bill.daysUntilDue === 1 ? 'Due Tomorrow' : 
                     bill.daysUntilDue > 0 ? `Due in ${bill.daysUntilDue} days` : 
                     `Due ${new Date(bill.dueDate).toLocaleDateString()}`}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
