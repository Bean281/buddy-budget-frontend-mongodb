"use client";

import { useState } from "react";
import { DesktopNavigation } from "@/components/desktop-navigation";
import { MobileNavigation } from "@/components/mobile-navigation";
import { Header } from "@/components/header";
import { DashboardOverview } from "@/components/dashboard-overview";
import { useMobile } from "@/hooks/use-mobile";

export default function DashboardOverviewPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const isMobile = useMobile();

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <DesktopNavigation activeTab={activeTab} setActiveTab={setActiveTab} />}
      <div className={`${isMobile ? "pb-16" : "ml-64"}`}>
        <Header />
        <main className="container mx-auto p-4">
          <DashboardOverview />
        </main>
      </div>
      {isMobile && <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  );
} 