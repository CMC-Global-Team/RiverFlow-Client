"use client"

import { useEffect, useRef } from "react"
import { Zap, Users, Lock, Palette, Share2, Smartphone } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Real-time collaboration with zero lag. See changes instantly as your team works.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite team members and work together on mindmaps in real-time.",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description: "Your data is encrypted and stored securely. Full control over sharing.",
  },
  {
    icon: Palette,
    title: "Customizable",
    description: "Personalize your mindmaps with colors, themes, and custom styling.",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share your mindmaps with a link or export in multiple formats.",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Access your mindmaps on any device. Fully responsive design.",
  },
]

export default function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        if (!card) return

        gsap.from(card, {
          opacity: 0,
          y: 50,
          duration: 0.6,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            end: "top 50%",
            scrub: 1,
            markers: false,
          },
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} id="features" className="py-20 md:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
            Powerful Features for Creative Teams
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create, collaborate, and share beautiful mindmaps.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                ref={(el) => {
                  cardsRef.current[index] = el
                }}
                className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg transition-all group"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
