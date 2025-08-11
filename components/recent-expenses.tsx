"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Coffee, Utensils, Car, Home, Smartphone, DollarSign, Loader2, AlertCircle } from "lucide-react"
import { useRecentExpenses } from "@/hooks/use-dashboard"

// Icon mapping for categories
const iconMap: Record<string, any> = {
  "shopping-cart": ShoppingCart,
  "coffee": Coffee,
  "utensils": Utensils,
  "car": Car,
  "home": Home,
  "smartphone": Smartphone,
  "dollar-sign": DollarSign,
  // Add more mappings as needed
}

export function RecentExpenses() {
  const { data: recentExpensesData, isLoading, isError } = useRecentExpenses({ limit: 10 })

  // Helper function to get icon component
  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || DollarSign
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const dateOnly = date.toISOString().split("T")[0]
    const todayOnly = today.toISOString().split("T")[0]
    const yesterdayOnly = yesterday.toISOString().split("T")[0]

    if (dateOnly === todayOnly) {
      return "Today"
    } else if (dateOnly === yesterdayOnly) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    }
  }

  // Helper function to format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: false 
    })
  }

  if (isLoading) {
    return (
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Expenses</CardTitle>
          <CardDescription>Your latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading recent expenses...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Expenses</CardTitle>
          <CardDescription>Your latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <h3 className="text-lg font-medium">Error Loading Expenses</h3>
            <p className="text-muted-foreground">There was a problem loading your recent expenses.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Expenses</CardTitle>
        <CardDescription>
          Your latest transactions ({recentExpensesData?.count || 0} expenses, ${recentExpensesData?.totalAmount.toFixed(2) || '0.00'} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recentExpensesData?.days.length === 0 ? (
            <div className="text-center p-4">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-lg font-medium">No Recent Expenses</h3>
              <p className="text-muted-foreground">You haven't recorded any expenses yet.</p>
            </div>
          ) : (
            recentExpensesData?.days.map((day) => (
              <div key={day.date.toString()} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {formatDate(day.date.toString())}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    ${day.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-2">
                  {day.expenses.map((expense) => {
                    const IconComponent = getIconComponent(expense.category.icon)
                    return (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-full"
                            style={{ 
                              backgroundColor: `${expense.category.color}20`,
                              color: expense.category.color
                            }}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {expense.description || 'No description'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatTime(expense.date.toString())} • {expense.category.name}
                            </div>
                          </div>
                        </div>
                        <div className="font-medium text-expense">
                          -${expense.amount.toFixed(2)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
