"use client"

import { Home, DollarSign, Receipt, Target, BarChart3, Settings, Calendar, PlusCircle, Tag } from "lucide-react"
import Link from "next/link"

interface DesktopNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function DesktopNavigation({ activeTab, setActiveTab }: DesktopNavigationProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/" },
    { id: "transactions", label: "Transactions", icon: DollarSign, href: "/transactions" },
    { id: "bills", label: "Bills", icon: Receipt, href: "/bills" },
    { id: "goals", label: "Savings Goals", icon: Target, href: "/goals" },
    { id: "planning", label: "Planning", icon: Calendar, href: "/planning" },
    { id: "statistics", label: "Statistics", icon: BarChart3, href: "/statistics" },
    { id: "categories", label: "Categories", icon: Tag, href: "/categories" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  ]

  const quickActions = [
    { id: "add-transaction", label: "Add Transaction", icon: PlusCircle, href: "/add-transaction" },
    { id: "add-bill", label: "Add Bill", icon: Receipt, href: "/add-bill" },
    { id: "add-goal", label: "Add Goal", icon: Target, href: "/add-goal" },
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-card shadow-md z-10">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Finance Tracker</h1>
      </div>
      <div className="p-4 border-b">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-muted text-center"
              onClick={() => setActiveTab(action.id)}
            >
              <action.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{action.label.split(" ")[1]}</span>
            </Link>
          ))}
        </div>
      </div>
      <nav className="p-2">
        <h2 className="text-sm font-medium text-muted-foreground px-3 py-2">Navigation</h2>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  activeTab === item.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
