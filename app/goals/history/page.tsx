import { SavingsGoalsHistory } from "@/components/savings-goals-history"

export default function SavingsGoalsHistoryPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Savings Goals History</h1>
          <p className="text-muted-foreground">
            Track your savings progress and contributions over time
          </p>
        </div>
      </div>
      
      <SavingsGoalsHistory />
    </div>
  )
} 