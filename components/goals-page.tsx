"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DesktopNavigation } from "./desktop-navigation"
import { MobileNavigation } from "./mobile-navigation"
import { Header } from "./header"
import { GoalsList } from "./goals-list"
import { SavingsGoalsHistory } from "./savings-goals-history"
import { useMobile } from "@/hooks/use-mobile"

export function GoalsPage() {
  const [activeTab, setActiveTab] = useState("goals")
  const [goalsSubTab, setGoalsSubTab] = useState("list")
  const isMobile = useMobile()

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <DesktopNavigation activeTab={activeTab} setActiveTab={setActiveTab} />}
      <div className={`${isMobile ? "pb-16" : "ml-64"}`}>
        <Header />
        <main className="container mx-auto p-4">
          <Tabs value={goalsSubTab} onValueChange={setGoalsSubTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Savings Goals</h1>
              <TabsList>
                <TabsTrigger value="list">My Goals</TabsTrigger>
                <TabsTrigger value="history">History & Trends</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="list" className="mt-0">
              <GoalsList />
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <SavingsGoalsHistory />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      {isMobile && <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  )
}
