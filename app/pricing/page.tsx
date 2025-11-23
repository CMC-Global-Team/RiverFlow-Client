"use client"

import { useEffect, useRef, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PricingCard from "@/components/pricing-card"
import AuthModal from "@/components/auth/auth-modal"
import { HelpCircle, Check, Minus } from "lucide-react"
import gsap from "gsap"
import { useTranslation } from "react-i18next"

export default function PricingPage() {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; tab: "login" | "signup" }>({
    isOpen: false,
    tab: "signup",
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation("pricing")

  const plans = [
    {
      name: t("plans.starter.name"),
      price: "$0",
      description: t("plans.starter.description"),
      features: t("plans.starter.features", { returnObjects: true }) as string[] || [],
      popular: false,
    },
    {
      name: t("plans.professional.name"),
      price: "$12",
      description: t("plans.professional.description"),
      features: t("plans.professional.features", { returnObjects: true }) as string[] || [],
      popular: true,
    },
    {
      name: t("plans.enterprise.name"),
      price: "$49",
      description: t("plans.enterprise.description"),
      features: t("plans.enterprise.features", { returnObjects: true }) as string[] || [],
      popular: false,
    },
  ]

  const faqs = (t("faq.items", { returnObjects: true }) as Array<{ question: string; answer: string }>) || []

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
            {t("title")}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-10 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <PricingCard
                key={index}
                {...plan}
                onSelect={() => setAuthModal({ isOpen: true, tab: "signup" })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">{t("featureComparison")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-foreground">{t("table.feature")}</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-foreground">{t("table.starter")}</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-foreground">{t("table.professional")}</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-foreground">{t("table.enterprise")}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: t("features.mindmaps"), starter: "5", pro: t("values.unlimited"), ent: t("values.unlimited") },
                  { name: t("features.teamMembers"), starter: "1", pro: "5", ent: t("values.unlimited") },
                  { name: t("features.realTimeCollab"), starter: false, pro: true, ent: true },
                  { name: t("features.apiAccess"), starter: false, pro: false, ent: true },
                  { name: t("features.customIntegrations"), starter: false, pro: false, ent: true },
                  { name: t("features.prioritySupport"), starter: false, pro: true, ent: true },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50">
                    <td className="py-4 px-6 text-sm text-foreground">{row.name}</td>
                    <td className="py-4 px-6 text-center text-sm text-muted-foreground">
                      {typeof row.starter === "boolean" ? (
                        row.starter ? <Check className="h-5 w-5 text-primary mx-auto" /> : <Minus className="h-5 w-5 text-muted-foreground mx-auto" />
                      ) : (
                        row.starter
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-muted-foreground">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? <Check className="h-5 w-5 text-primary mx-auto" /> : <Minus className="h-5 w-5 text-muted-foreground mx-auto" />
                      ) : (
                        row.pro
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-muted-foreground">
                      {typeof row.ent === "boolean" ? (
                        row.ent ? <Check className="h-5 w-5 text-primary mx-auto" /> : <Minus className="h-5 w-5 text-muted-foreground mx-auto" />
                      ) : (
                        row.ent
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">{t("faq.title")}</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
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
