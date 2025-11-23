"use client"

import { useEffect, useRef } from "react"
import { Zap, Users, Lock, Palette, Share2, Smartphone } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useTranslation } from "react-i18next"

gsap.registerPlugin(ScrollTrigger)

export default function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const { t } = useTranslation()

  const features = [
    {
      icon: Zap,
      title: t("featuresSection.lightningFast.title"),
      description: t("featuresSection.lightningFast.description"),
    },
    {
      icon: Users,
      title: t("featuresSection.teamCollaboration.title"),
      description: t("featuresSection.teamCollaboration.description"),
    },
    {
      icon: Lock,
      title: t("featuresSection.securePrivate.title"),
      description: t("featuresSection.securePrivate.description"),
    },
    {
      icon: Palette,
      title: t("featuresSection.customizable.title"),
      description: t("featuresSection.customizable.description"),
    },
    {
      icon: Share2,
      title: t("featuresSection.easySharing.title"),
      description: t("featuresSection.easySharing.description"),
    },
    {
      icon: Smartphone,
      title: t("featuresSection.mobileReady.title"),
      description: t("featuresSection.mobileReady.description"),
    },
  ]

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
            {t("featuresSection.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("featuresSection.subtitle")}
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
