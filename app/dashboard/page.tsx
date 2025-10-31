"use client"

import { useEffect, useRef } from "react"
import Sidebar from "@/components/dashboard/sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import MindmapCard from "@/components/dashboard/mindmap-card"
import { Plus } from "lucide-react"
import gsap from "gsap"

const recentMindmaps = [
  {
    id: "1",
    title: "Project Planning",
    description: "Q1 2025 project roadmap and milestones",
    lastModified: "2 hours ago",
    collaborators: 3,
  },
  {
    id: "2",
    title: "Learning Path",
    description: "Web development learning resources",
    lastModified: "1 day ago",
    collaborators: 1,
  },
  {
    id: "3",
    title: "Business Strategy",
    description: "2025 business goals and strategies",
    lastModified: "3 days ago",
    collaborators: 5,
  },
  {
    id: "4",
    title: "Product Features",
    description: "Feature brainstorming for new product",
    lastModified: "1 week ago",
    collaborators: 4,
  },
  {
    id: "5",
    title: "Team Structure",
    description: "Organization and team hierarchy",
    lastModified: "2 weeks ago",
    collaborators: 2,
  },
  {
    id: "6",
    title: "Content Calendar",
    description: "Social media content planning",
    lastModified: "3 weeks ago",
    collaborators: 3,
  },
]

export default function DashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        if (!card) return
        gsap.from(card, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          delay: index * 0.05,
          ease: "power2.out",
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col ml-64">
        <DashboardHeader />

        <main ref={containerRef} className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Welcome back, User</h1>
              <p className="mt-2 text-muted-foreground">Here are your recent mindmaps</p>
            </div>

            {/* Quick Action */}
            <div className="mb-8">
              <button className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
                <Plus className="h-5 w-5" />
                Create New Mindmap
              </button>
            </div>

            {/* Mindmaps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentMindmaps.map((mindmap, index) => (
                <div
                  key={mindmap.id}
                  ref={(el) => {
                    cardsRef.current[index] = el
                  }}
                >
                  <MindmapCard {...mindmap} />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
