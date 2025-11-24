"use client"

import { Check } from "lucide-react"
import { useTranslation } from "react-i18next"

interface PricingCardProps {
  name: string
  price: string
  description: string
  features: string[]
  isPopular?: boolean
  onSelect: () => void
}

export default function PricingCard({ name, price, description, features, isPopular, onSelect }: PricingCardProps) {
  const { t } = useTranslation("pricing")

  return (
    <div
      className={`relative rounded-2xl border transition-all ${isPopular
        ? "border-primary bg-gradient-to-b from-primary/5 to-accent/5 shadow-xl scale-105"
        : "border-border bg-card hover:border-primary/50 hover:shadow-lg"
        }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
            {t("card.mostPopular")}
          </span>
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <h3 className="text-2xl font-bold text-foreground">{name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>

        {/* Price */}
        <div className="mt-6">
          <span className="text-5xl font-bold text-foreground">${price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>

        {/* CTA Button */}
        <button
          onClick={onSelect}
          className={`mt-8 w-full rounded-lg py-3 font-semibold transition-all ${isPopular
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "border border-border text-foreground hover:bg-muted"
            }`}
        >
          {t("card.getStarted")}
        </button>

        {/* Divider */}
        <div className="my-8 border-t border-border"></div>

        {/* Features */}
        <ul className="space-y-4">
          {Array.isArray(features) && features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
