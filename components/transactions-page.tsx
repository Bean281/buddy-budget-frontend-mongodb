"use client"

import { useState } from "react"
import { DesktopNavigation } from "./desktop-navigation"
import { MobileNavigation } from "./mobile-navigation"
import { Header } from "./header"
import { TransactionsList } from "./transactions-list"
import { useMobile } from "@/hooks/use-mobile"

export function TransactionsPage() {
  const [activeTab, setActiveTab] = useState("transactions")
  const isMobile = useMobile()

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <DesktopNavigation activeTab={activeTab} setActiveTab={setActiveTab} />}
      <div className={`${isMobile ? "pb-16" : "ml-64"}`}>
        <Header />
        <main className="container mx-auto p-4">
          <TransactionsList />
        </main>
      </div>
      {isMobile && <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  )
}
