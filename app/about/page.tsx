"use client"

import { useEffect, useRef, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import TeamMemberCard from "@/components/team-member-card"
import AuthModal from "@/components/auth/auth-modal"
import { Lightbulb, Users, Zap, Target } from "lucide-react"
import gsap from "gsap"

const teamMembers = [
  {
    name: "Sarah Chen",
    role: "Founder & CEO",
    bio: "Passionate about collaborative tools and creative thinking. 10+ years in product design.",
    image: "SC",
  },
  {
    name: "Alex Rodriguez",
    role: "CTO",
    bio: "Full-stack engineer with expertise in real-time collaboration. Built 3 startups.",
    image: "AR",
  },
  {
    name: "Emma Thompson",
    role: "Head of Design",
    bio: "Award-winning UX designer focused on intuitive interfaces and user experience.",
    image: "ET",
  },
  {
    name: "James Park",
    role: "Lead Developer",
    bio: "Open-source contributor and performance optimization specialist.",
    image: "JP",
  },
]

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We constantly push boundaries to create better tools for creative thinking.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Teamwork makes the dream work. We believe in the power of collective ideas.",
  },
  {
    icon: Zap,
    title: "Performance",
    description: "Speed and reliability are non-negotiable. We optimize for every millisecond.",
  },
  {
    icon: Target,
    title: "User-Centric",
    description: "Every decision is guided by our users' needs and feedback.",
  },
]

export default function AboutPage() {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; tab: "login" | "signup" }>({
    isOpen: false,
    tab: "login",
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!heroRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power2.out",
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Header onAuthClick={(tab) => setAuthModal({ isOpen: true, tab })} />

      {/* Hero Section */}
      <section ref={heroRef} className="py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
            About{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">RiverFlow</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            We're on a mission to revolutionize how teams collaborate and organize their ideas. RiverFlow was born from
            the frustration of existing mindmap tools that felt clunky and disconnected.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                RiverFlow started in 2023 when our founder Sarah realized that existing mindmap tools were missing
                something crucial: the ability to collaborate seamlessly in real-time.
              </p>
              <p className="text-muted-foreground mb-4">
                After months of research and prototyping, we built RiverFlow from the ground up with collaboration at
                its core. Today, thousands of teams use RiverFlow to organize their thoughts and bring their ideas to
                life.
              </p>
              <p className="text-muted-foreground">
                We're just getting started. Our vision is to become the go-to platform for creative teams worldwide.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-bold text-primary">50K+</div>
                  <p className="text-muted-foreground">Mindmaps Created</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">10K+</div>
                  <p className="text-muted-foreground">Active Users</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">150+</div>
                  <p className="text-muted-foreground">Countries</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-all"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{value.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={index} {...member} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">Join Our Community</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Be part of a growing community of creative teams using RiverFlow to organize their ideas.
            </p>
            <button
              onClick={() => setAuthModal({ isOpen: true, tab: "signup" })}
              className="mt-8 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
            >
              Get Started Today
            </button>
          </div>
        </div>
      </section>

      <Footer />
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        initialTab={authModal.tab}
      />
    </main>
  )
}
