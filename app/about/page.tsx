"use client"

import { useEffect, useRef, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import TeamMemberCard from "@/components/team-member-card"
import AuthModal from "@/components/auth/auth-modal"
import { Lightbulb, Users, Zap, Target } from "lucide-react"
import gsap from "gsap"
import { useTranslation } from "react-i18next"

export default function AboutPage() {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; tab: "login" | "signup" }>({
    isOpen: false,
    tab: "login",
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation("about")

  const teamMembers = [
    {
      name: "Sarah Chen",
      role: t("team.members.sarah.role"),
      bio: t("team.members.sarah.bio"),
      image: "SC",
    },
    {
      name: "Alex Rodriguez",
      role: t("team.members.alex.role"),
      bio: t("team.members.alex.bio"),
      image: "AR",
    },
    {
      name: "Emma Thompson",
      role: t("team.members.emma.role"),
      bio: t("team.members.emma.bio"),
      image: "ET",
    },
    {
      name: "James Park",
      role: t("team.members.james.role"),
      bio: t("team.members.james.bio"),
      image: "JP",
    },
  ]

  const values = [
    {
      icon: Lightbulb,
      title: t("values.innovation.title"),
      description: t("values.innovation.description"),
    },
    {
      icon: Users,
      title: t("values.collaboration.title"),
      description: t("values.collaboration.description"),
    },
    {
      icon: Zap,
      title: t("values.performance.title"),
      description: t("values.performance.description"),
    },
    {
      icon: Target,
      title: t("values.userCentric.title"),
      description: t("values.userCentric.description"),
    },
  ]

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
            {t("title")}{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t("brand")}</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("mission")}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">{t("story.title")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("story.p1")}
              </p>
              <p className="text-muted-foreground mb-4">
                {t("story.p2")}
              </p>
              <p className="text-muted-foreground">
                {t("story.p3")}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-bold text-primary">50K+</div>
                  <p className="text-muted-foreground">{t("stats.mindmapsCreated")}</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">10K+</div>
                  <p className="text-muted-foreground">{t("stats.activeUsers")}</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">150+</div>
                  <p className="text-muted-foreground">{t("stats.countries")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">{t("values.title")}</h2>
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
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">{t("team.title")}</h2>
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
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">{t("cta.title")}</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("cta.description")}
            </p>
            <button
              onClick={() => setAuthModal({ isOpen: true, tab: "signup" })}
              className="mt-8 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
            >
              {t("cta.button")}
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
