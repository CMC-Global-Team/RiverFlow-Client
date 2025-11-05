"use client"

import { useEffect, useRef, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PricingCard from "@/components/pricing-card"
import AuthModal from "@/components/auth/auth-modal"
import { HelpCircle } from "lucide-react"
import gsap from "gsap"

const pricingPlans = [
  {
    name: "Starter",
    price: "0",
    description: "Perfect for individuals",
    features: ["Up to 5 mindmaps", "Basic shapes and text", "Personal workspace", "Export as PNG", "Community support"],
  },
  {
    name: "Professional",
    price: "9",
    description: "For teams and professionals",
    features: [
      "Unlimited mindmaps",
      "Advanced styling options",
      "Team collaboration (up to 5 members)",
      "Real-time sync",
      "Export multiple formats",
      "Priority email support",
      "Custom templates",
    ],
    isPopular: true,
  },
  {
    name: "Enterprise",
    price: "29",
    description: "For large organizations",
    features: [
      "Everything in Professional",
      "Unlimited team members",
      "Advanced permissions",
      "API access",
      "Custom integrations",
      "Dedicated support",
      "SSO & security features",
      "Analytics dashboard",
    ],
  },
]

const faqs = [
  {
    question: "Can I change my plan anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, start with our free Starter plan. No credit card required.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer: "Yes, save 20% when you choose annual billing instead of monthly.",
  },
]

export default function PricingPage() {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; tab: "login" | "signup" }>({
    isOpen: false,
    tab: "signup",
  })
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
          ease: "power2.out",
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Header onAuthClick={(tab) => setAuthModal({ isOpen: true, tab })} />

      {/* Pricing Section */}
      <section ref={containerRef} className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">Simple, Transparent Pricing</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your needs. Always flexible to scale.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                ref={(el) => {
                  cardsRef.current[index] = el
                }}
              >
                <PricingCard {...plan} onSelect={() => setAuthModal({ isOpen: true, tab: "signup" })} />
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">Feature Comparison</h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Starter</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Professional</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Mindmaps", starter: "5", pro: "Unlimited", enterprise: "Unlimited" },
                    { feature: "Team Members", starter: "1", pro: "5", enterprise: "Unlimited" },
                    { feature: "Real-time Collaboration", starter: "No", pro: "Yes", enterprise: "Yes" },
                    { feature: "API Access", starter: "No", pro: "No", enterprise: "Yes" },
                    { feature: "Custom Integrations", starter: "No", pro: "No", enterprise: "Yes" },
                    { feature: "Priority Support", starter: "No", pro: "Yes", enterprise: "Yes" },
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{row.feature}</td>
                      <td className="px-6 py-4 text-center text-sm text-muted-foreground">{row.starter}</td>
                      <td className="px-6 py-4 text-center text-sm text-muted-foreground">{row.pro}</td>
                      <td className="px-6 py-4 text-center text-sm text-muted-foreground">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group rounded-lg border border-border bg-card p-6 cursor-pointer hover:border-primary/50 transition-all"
              >
                <summary className="flex items-center justify-between font-semibold text-foreground">
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    {faq.question}
                  </span>
                  <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-4 text-muted-foreground">{faq.answer}</p>
              </details>
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
