"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrencies } from "@/hooks/admin/useCurrencies"

interface Price {
  currencyCode: string
  price: number
  promotionalPrice?: number
  promotionStartDate?: string
  promotionEndDate?: string
}

interface PriceManagerProps {
  prices: Price[]
  onPriceChange: (prices: Price[]) => void
}

export default function PriceManager({ prices = [], onPriceChange }: PriceManagerProps) {
  const { currencies, isLoading } = useCurrencies()
  const [showPromotion, setShowPromotion] = useState<Record<string, boolean>>({})

  const updatePrice = (currencyCode: string, field: string, value: any) => {
    const updatedPrices = [...prices]
    const priceIndex = updatedPrices.findIndex((p) => p.currencyCode === currencyCode)

    if (priceIndex >= 0) {
      updatedPrices[priceIndex] = {
        ...updatedPrices[priceIndex],
        [field]: value,
      }
    } else {
      updatedPrices.push({
        currencyCode,
        price: 0,
        [field]: value,
      })
    }

    onPriceChange(updatedPrices)
  }

  const getPrice = (currencyCode: string): Price => {
    return (
      prices.find((p) => p.currencyCode === currencyCode) || {
        currencyCode,
        price: 0,
      }
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multi-Currency Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Currency Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currencies.map((currency) => {
          const price = getPrice(currency.code)
          const hasPromotion = showPromotion[currency.code] || false

          return (
            <div
              key={currency.code}
              className="p-4 rounded-lg border border-border space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{currency.code}</Badge>
                  <span className="text-sm text-muted-foreground">{currency.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`promo-${currency.code}`} className="text-sm">
                    Promotion
                  </Label>
                  <Switch
                    id={`promo-${currency.code}`}
                    checked={hasPromotion}
                    onCheckedChange={(checked) =>
                      setShowPromotion({ ...showPromotion, [currency.code]: checked })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`price-${currency.code}`}>Regular Price</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground">{currency.symbol}</span>
                    <Input
                      id={`price-${currency.code}`}
                      type="number"
                      step="0.01"
                      value={price.price || ""}
                      onChange={(e) =>
                        updatePrice(currency.code, "price", parseFloat(e.target.value))
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {hasPromotion && (
                  <div>
                    <Label htmlFor={`promo-price-${currency.code}`}>
                      Promotional Price
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-muted-foreground">{currency.symbol}</span>
                      <Input
                        id={`promo-price-${currency.code}`}
                        type="number"
                        step="0.01"
                        value={price.promotionalPrice || ""}
                        onChange={(e) =>
                          updatePrice(
                            currency.code,
                            "promotionalPrice",
                            parseFloat(e.target.value)
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}
              </div>

              {hasPromotion && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`promo-start-${currency.code}`}>Start Date</Label>
                    <Input
                      id={`promo-start-${currency.code}`}
                      type="date"
                      value={price.promotionStartDate || ""}
                      onChange={(e) =>
                        updatePrice(currency.code, "promotionStartDate", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`promo-end-${currency.code}`}>End Date</Label>
                    <Input
                      id={`promo-end-${currency.code}`}
                      type="date"
                      value={price.promotionEndDate || ""}
                      onChange={(e) =>
                        updatePrice(currency.code, "promotionEndDate", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

