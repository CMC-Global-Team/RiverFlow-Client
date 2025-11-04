/**
 * Type definitions for package management
 */

// ============ Request Types ============

export interface PriceData {
  currencyCode: string
  price: number
  promotionalPrice?: number
  promotionStartDate?: string
  promotionEndDate?: string
}

export interface PackageRequest {
  name: string
  description?: string
  slug: string
  basePrice: number
  baseCurrencyCode: string
  durationDays: number
  maxMindmaps: number
  maxCollaborators: number
  maxStorageMb: number
  features?: Record<string, boolean>
  prices?: PriceData[]
  isActive?: boolean
  displayOrder?: number
}

// ============ Response Types ============

export interface PriceInfo {
  id: number
  currencyCode: string
  currencySymbol: string
  currencyName: string
  price: number
  promotionalPrice?: number
  promotionStartDate?: string
  promotionEndDate?: string
  hasActivePromotion: boolean
}

export interface PackageResponse {
  id: number
  name: string
  description?: string
  slug: string
  basePrice: number
  baseCurrencyCode: string
  baseCurrencySymbol: string
  durationDays: number
  maxMindmaps: number
  maxCollaborators: number
  maxStorageMb: number
  features?: Record<string, boolean>
  isActive: boolean
  displayOrder: number
  subscriberCount: number
  prices: PriceInfo[]
  createdAt: string
  updatedAt: string
}

export interface PackageStatsResponse {
  totalPackages: number
  activePackages: number
  activeSubscribers: number
  monthlyRecurringRevenue: number
  conversionRate: number
  growthPercentage: number
}

export interface FeatureResponse {
  id: number
  featureKey: string
  featureName: string
  description?: string
  category: string
  isActive: boolean
  createdAt: string
}

export interface CurrencyResponse {
  id: number
  code: string
  name: string
  symbol: string
  decimalPlaces: number
  isActive: boolean
}

// ============ API Error ============

export interface ApiErrorResponse {
  message: string
  status?: number
  errors?: Record<string, string[]>
}

