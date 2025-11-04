"use client"

import { useEffect, useRef } from "react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"
import StatsCard from "@/components/admin/stats-card"
import RecentActivity from "@/components/admin/recent-activity"
import UserGrowthChart from "@/components/admin/user-growth-chart"
import RevenueChart from "@/components/admin/revenue-chart"
import QuickActions from "@/components/admin/quick-actions"
import { Users, CreditCard, Package, TrendingUp } from "lucide-react"
import gsap from "gsap"

export default function AdminDashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      // Animate stats cards
      statsRef.current.forEach((card, index) => {
        if (!card) return
        gsap.from(card, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          delay: index * 0.1,
          ease: "power2.out",
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col ml-64">
        <AdminHeader />

        <main ref={containerRef} className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 space-y-8">
            {/* Welcome Section */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="mt-2 text-muted-foreground">
                Welcome back! Here's what's happening with RiverFlow today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div ref={(el) => { statsRef.current[0] = el }}>
                <StatsCard
                  title="Total Users"
                  value="2,543"
                  change="+12.5%"
                  changeType="increase"
                  icon={Users}
                  iconColor="text-blue-500"
                  iconBgColor="bg-blue-100 dark:bg-blue-950"
                />
              </div>
              <div ref={(el) => { statsRef.current[1] = el }}>
                <StatsCard
                  title="Revenue"
                  value="$45,231"
                  change="+8.2%"
                  changeType="increase"
                  icon={CreditCard}
                  iconColor="text-green-500"
                  iconBgColor="bg-green-100 dark:bg-green-950"
                />
              </div>
              <div ref={(el) => { statsRef.current[2] = el }}>
                <StatsCard
                  title="Active Packages"
                  value="12"
                  change="+2"
                  changeType="increase"
                  icon={Package}
                  iconColor="text-purple-500"
                  iconBgColor="bg-purple-100 dark:bg-purple-950"
                />
              </div>
              <div ref={(el) => { statsRef.current[3] = el }}>
                <StatsCard
                  title="Growth Rate"
                  value="23.5%"
                  change="-2.4%"
                  changeType="decrease"
                  icon={TrendingUp}
                  iconColor="text-orange-500"
                  iconBgColor="bg-orange-100 dark:bg-orange-950"
                />
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UserGrowthChart />
              <RevenueChart />
            </div>

            {/* Activity and Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentActivity />
              </div>
              <div>
                <QuickActions />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

