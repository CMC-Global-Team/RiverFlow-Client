"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, Trash2, Plus, DollarSign } from "lucide-react"
import type { CurrencyResponse } from "@/services/admin/currency.service"

interface CurrenciesListProps {
  currencies: CurrencyResponse[]
  isLoading: boolean
  onEdit: (currency: CurrencyResponse) => void
  onDelete: (id: number) => void
  onCreate: () => void
}

function CurrencySkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4 flex-1">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
  )
}

export default function CurrenciesList({
  currencies,
  isLoading,
  onEdit,
  onDelete,
  onCreate,
}: CurrenciesListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Currency Management</CardTitle>
          <Button onClick={onCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Currency
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <CurrencySkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && currencies.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No currencies found</p>
            <Button variant="outline" className="mt-4" onClick={onCreate}>
              Create First Currency
            </Button>
          </div>
        )}

        {!isLoading &&
          currencies.map((currency) => (
            <div
              key={currency.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Currency Icon */}
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {currency.symbol}
                  </span>
                </div>

                {/* Currency Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">
                      {currency.code}
                    </h4>
                    <span className="text-sm text-muted-foreground">
                      ({currency.symbol})
                    </span>
                    {!currency.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {currency.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Decimal places: {currency.decimalPlaces}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(currency)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(currency.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}

