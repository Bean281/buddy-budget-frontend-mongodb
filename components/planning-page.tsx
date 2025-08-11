"use client"

import { useState } from "react"
import { DesktopNavigation } from "./desktop-navigation"
import { MobileNavigation } from "./mobile-navigation"
import { Header } from "./header"
import { FinancialPlanning } from "./financial-planning"
import { useMobile } from "@/hooks/use-mobile"

export function PlanningPage() {
  const [activeTab, setActiveTab] = useState("planning")
  const isMobile = useMobile()

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <DesktopNavigation activeTab={activeTab} setActiveTab={setActiveTab} />}
      <div className={`${isMobile ? "pb-16" : "ml-64"}`}>
        <Header />
        <main className="container mx-auto p-4">
          <FinancialPlanning />
        </main>
      </div>
      {isMobile && <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  )
}
