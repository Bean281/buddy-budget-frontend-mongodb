"use client"

import { Home, DollarSign, Receipt, User, PlusCircle } from "lucide-react"
import Link from "next/link"

interface MobileNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function MobileNavigation({ activeTab, setActiveTab }: MobileNavigationProps) {
  const navItems = [
    { id: "dashboard", label: "Home", icon: Home, href: "/" },
    { id: "transactions", label: "Transactions", icon: DollarSign, href: "/transactions" },
    { id: "add", label: "Add", icon: PlusCircle, href: "/add-transaction" },
    { id: "bills", label: "Bills", icon: Receipt, href: "/bills" },
    { id: "profile", label: "Profile", icon: User, href: "/profile" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-10">
      <nav className="flex justify-around">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center py-2 px-3 ${
              activeTab === item.id ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon className={`h-6 w-6 ${item.id === "add" ? "text-primary h-8 w-8" : ""}`} />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
