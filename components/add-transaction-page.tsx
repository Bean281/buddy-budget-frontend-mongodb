"use client"

import { useState, useEffect } from "react"
import { DesktopNavigation } from "./desktop-navigation"
import { MobileNavigation } from "./mobile-navigation"
import { Header } from "./header"
import { AddTransactionForm } from "./add-transaction-form"
import { useMobile } from "@/hooks/use-mobile"

export function AddTransactionPage({ transactionId }: { transactionId?: string }) {
  const isEditing = !!transactionId
  const [activeTab, setActiveTab] = useState(isEditing ? "transactions" : "add")
  const isMobile = useMobile()

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <DesktopNavigation activeTab={activeTab} setActiveTab={setActiveTab} />}
      <div className={`${isMobile ? "pb-16" : "ml-64"}`}>
        <Header />
        <main className="container mx-auto p-4">
          <AddTransactionForm transactionId={transactionId} isEditing={isEditing} />
        </main>
      </div>
      {isMobile && <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  )
}
