"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth/useAuth"

interface CTASectionProps {
  onGetStarted: () => void
}

export default function CTASection({ onGetStarted }: CTASectionProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            {isAuthenticated ? "Ready to Start Creating?" : "Ready to Create Your First Mindmap?"}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {isAuthenticated 
              ? "Go to your dashboard and start organizing your ideas with RiverFlow."
              : "Join thousands of teams using RiverFlow to organize their ideas and collaborate effectively."
            }
          </p>
          <button
            onClick={isAuthenticated ? () => router.push("/dashboard") : onGetStarted}
            className="mt-8 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
          >
            {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
          </button>
        </div>
      </div>
    </section>
  )
}
