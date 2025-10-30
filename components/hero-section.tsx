"use client"

import { useEffect, useRef } from "react"
import { ArrowRight, Sparkles } from "lucide-react"
import gsap from "gsap"

interface HeroSectionProps {
  onGetStarted: () => void
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out",
      })

      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.1,
        ease: "power2.out",
      })

      gsap.from(buttonsRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.2,
        ease: "power2.out",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative overflow-hidden py-20 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Welcome to RiverFlow</span>
          </div>

          {/* Title */}
          <h1 ref={titleRef} className="text-4xl md:text-6xl font-bold text-foreground leading-tight text-balance">
            Create Beautiful{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Mindmaps</span>{" "}
            Together
          </h1>

          {/* Subtitle */}
          <p ref={subtitleRef} className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Collaborate in real-time, organize your thoughts, and bring your ideas to life with RiverFlow's intuitive
            mindmap editor.
          </p>

          {/* CTA Buttons */}
          <div ref={buttonsRef} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 group"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-muted transition-all">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 md:gap-12">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">10K+</div>
              <p className="mt-2 text-sm text-muted-foreground">Active Users</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">50K+</div>
              <p className="mt-2 text-sm text-muted-foreground">Mindmaps Created</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">99.9%</div>
              <p className="mt-2 text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
