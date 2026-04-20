"use client"

import { useMemo, useState } from "react"
import { AIRecommendation } from "@/components/ai-recommendation"
import { analyzeVirksomhed } from "@/lib/ai-engines"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Building,
  Percent,
  CreditCard,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { FieldTooltip } from "@/components/field-tooltip"
import { CalculatorTracker } from "@/components/calculator-tracker"
// import { BusinessAdvisor } from "./business-advisor"

// Types for business data
type Industry =
  | "manufacturing"
  | "retail"
  | "technology"
  | "finance"
  | "healthcare"
  | "construction"
  | "hospitality"
  | "professional_services"
  | "transportation"
  | "other"

type CompanySize = "micro" | "small" | "medium" | "large"

type BusinessStage = "startup" | "growth" | "mature" | "decline" | "turnaround"

type FinancialData = {
  revenue: number
  cogs: number
  operatingExpenses: number
  ebitda: number
  netIncome: number
  totalAssets: number
  currentAssets: number
  inventory: number
  accountsReceivable: number
  cash: number
  totalLiabilities: number
  currentLiabilities: number
  longTermDebt: number
  equity: number
  retainedEarnings: number
}

type OperationalData = {
  employees: number
  customerCount: number
  customerRetentionRate: number
  averageOrderValue: number
  inventoryTurnover: number
  daysInventoryOutstanding: number
  daysPayableOutstanding: number
  daysReceivableOutstanding: number
  employeeTurnoverRate: number
}

type BusinessData = {
  // Basic information
  companyName: string
  industry: Industry
  companySize: CompanySize
  businessStage: BusinessStage
  yearsInBusiness: number

  // Financial data
  currentYear: FinancialData
  previousYear: FinancialData

  // Operational data
  operationalData: OperationalData

  // Goals and challenges
  primaryGoals: string[]
  topChallenges: string[]

  // Calculated KPIs (will be computed)
  kpis: {
    profitability: {
      grossProfitMargin: number
      operatingProfitMargin: number
      netProfitMargin: number
      returnOnAssets: number
      returnOnEquity: number
      ebitdaMargin: number
    }
    liquidity: {
      currentRatio: number
      quickRatio: number
      cashRatio: number
      workingCapital: number
      workingCapitalRatio: number
    }
    efficiency: {
      assetTurnover: number
      inventoryTurnover: number
      receivablesTurnover: number
      payablesTurnover: number
      cashConversionCycle: number
    }
    solvency: {
      debtToEquityRatio: number
      debtToAssetsRatio: number
      interestCoverageRatio: number
      equityMultiplier: number
    }
    growth: {
      revenueGrowth: number
      netIncomeGrowth: number
      ebitdaGrowth: number
    }
  }
}

// Industry benchmarks for KPIs
const INDUSTRY_BENCHMARKS: Record<Industry, any> = {
  manufacturing: {
    profitability: {
      grossProfitMargin: 0.35,
      operatingProfitMargin: 0.12,
      netProfitMargin: 0.08,
      returnOnAssets: 0.07,
      returnOnEquity: 0.15,
      ebitdaMargin: 0.15,
    },
    liquidity: {
      currentRatio: 1.5,
      quickRatio: 1.0,
      cashRatio: 0.3,
    },
    efficiency: {
      assetTurnover: 1.2,
      inventoryTurnover: 5.0,
      receivablesTurnover: 8.0,
      payablesTurnover: 7.5,
      cashConversionCycle: 60,
    },
    solvency: {
      debtToEquityRatio: 0.8,
      debtToAssetsRatio: 0.4,
      interestCoverageRatio: 4.0,
    },
    growth: {
      revenueGrowth: 0.05,
      netIncomeGrowth: 0.06,
      ebitdaGrowth: 0.06,
    },
  },
  retail: {
    profitability: {
      grossProfitMargin: 0.4,
      operatingProfitMargin: 0.08,
      netProfitMargin: 0.05,
      returnOnAssets: 0.08,
      returnOnEquity: 0.18,
      ebitdaMargin: 0.1,
    },
    liquidity: {
      currentRatio: 1.3,
      quickRatio: 0.7,
      cashRatio: 0.2,
    },
    efficiency: {
      assetTurnover: 2.0,
      inventoryTurnover: 8.0,
      receivablesTurnover: 12.0,
      payablesTurnover: 10.0,
      cashConversionCycle: 30,
    },
    solvency: {
      debtToEquityRatio: 0.7,
      debtToAssetsRatio: 0.35,
      interestCoverageRatio: 3.5,
    },
    growth: {
      revenueGrowth: 0.04,
      netIncomeGrowth: 0.05,
      ebitdaGrowth: 0.05,
    },
  },
  technology: {
    profitability: {
      grossProfitMargin: 0.6,
      operatingProfitMargin: 0.2,
      netProfitMargin: 0.15,
      returnOnAssets: 0.12,
      returnOnEquity: 0.25,
      ebitdaMargin: 0.25,
    },
    liquidity: {
      currentRatio: 2.0,
      quickRatio: 1.8,
      cashRatio: 1.0,
    },
    efficiency: {
      assetTurnover: 0.8,
      inventoryTurnover: 10.0,
      receivablesTurnover: 9.0,
      payablesTurnover: 8.0,
      cashConversionCycle: 40,
    },
    solvency: {
      debtToEquityRatio: 0.5,
      debtToAssetsRatio: 0.25,
      interestCoverageRatio: 8.0,
    },
    growth: {
      revenueGrowth: 0.15,
      netIncomeGrowth: 0.18,
      ebitdaGrowth: 0.17,
    },
  },
  finance: {
    profitability: {
      grossProfitMargin: 0.7,
      operatingProfitMargin: 0.3,
      netProfitMargin: 0.2,
      returnOnAssets: 0.02,
      returnOnEquity: 0.15,
      ebitdaMargin: 0.35,
    },
    liquidity: {
      currentRatio: 1.1,
      quickRatio: 1.0,
      cashRatio: 0.3,
    },
    efficiency: {
      assetTurnover: 0.1,
      inventoryTurnover: 0,
      receivablesTurnover: 6.0,
      payablesTurnover: 5.0,
      cashConversionCycle: 15,
    },
    solvency: {
      debtToEquityRatio: 4.0,
      debtToAssetsRatio: 0.8,
      interestCoverageRatio: 2.5,
    },
    growth: {
      revenueGrowth: 0.06,
      netIncomeGrowth: 0.07,
      ebitdaGrowth: 0.07,
    },
  },
  healthcare: {
    profitability: {
      grossProfitMargin: 0.55,
      operatingProfitMargin: 0.15,
      netProfitMargin: 0.1,
      returnOnAssets: 0.08,
      returnOnEquity: 0.16,
      ebitdaMargin: 0.18,
    },
    liquidity: {
      currentRatio: 1.8,
      quickRatio: 1.5,
      cashRatio: 0.6,
    },
    efficiency: {
      assetTurnover: 0.9,
      inventoryTurnover: 12.0,
      receivablesTurnover: 7.0,
      payablesTurnover: 6.0,
      cashConversionCycle: 45,
    },
    solvency: {
      debtToEquityRatio: 0.6,
      debtToAssetsRatio: 0.3,
      interestCoverageRatio: 5.0,
    },
    growth: {
      revenueGrowth: 0.08,
      netIncomeGrowth: 0.09,
      ebitdaGrowth: 0.09,
    },
  },
  construction: {
    profitability: {
      grossProfitMargin: 0.2,
      operatingProfitMargin: 0.08,
      netProfitMargin: 0.05,
      returnOnAssets: 0.06,
      returnOnEquity: 0.14,
      ebitdaMargin: 0.1,
    },
    liquidity: {
      currentRatio: 1.3,
      quickRatio: 1.1,
      cashRatio: 0.3,
    },
    efficiency: {
      assetTurnover: 1.5,
      inventoryTurnover: 6.0,
      receivablesTurnover: 8.0,
      payablesTurnover: 7.0,
      cashConversionCycle: 55,
    },
    solvency: {
      debtToEquityRatio: 1.0,
      debtToAssetsRatio: 0.5,
      interestCoverageRatio: 3.0,
    },
    growth: {
      revenueGrowth: 0.04,
      netIncomeGrowth: 0.05,
      ebitdaGrowth: 0.05,
    },
  },
  hospitality: {
    profitability: {
      grossProfitMargin: 0.65,
      operatingProfitMargin: 0.12,
      netProfitMargin: 0.08,
      returnOnAssets: 0.07,
      returnOnEquity: 0.15,
      ebitdaMargin: 0.15,
    },
    liquidity: {
      currentRatio: 1.2,
      quickRatio: 1.0,
      cashRatio: 0.4,
    },
    efficiency: {
      assetTurnover: 0.6,
      inventoryTurnover: 20.0,
      receivablesTurnover: 15.0,
      payablesTurnover: 12.0,
      cashConversionCycle: 15,
    },
    solvency: {
      debtToEquityRatio: 1.2,
      debtToAssetsRatio: 0.55,
      interestCoverageRatio: 2.5,
    },
    growth: {
      revenueGrowth: 0.05,
      netIncomeGrowth: 0.06,
      ebitdaGrowth: 0.06,
    },
  },
  professional_services: {
    profitability: {
      grossProfitMargin: 0.7,
      operatingProfitMargin: 0.18,
      netProfitMargin: 0.12,
      returnOnAssets: 0.15,
      returnOnEquity: 0.25,
      ebitdaMargin: 0.2,
    },
    liquidity: {
      currentRatio: 2.0,
      quickRatio: 1.9,
      cashRatio: 0.8,
    },
    efficiency: {
      assetTurnover: 1.8,
      inventoryTurnover: 0,
      receivablesTurnover: 8.0,
      payablesTurnover: 6.0,
      cashConversionCycle: 45,
    },
    solvency: {
      debtToEquityRatio: 0.4,
      debtToAssetsRatio: 0.2,
      interestCoverageRatio: 10.0,
    },
    growth: {
      revenueGrowth: 0.08,
      netIncomeGrowth: 0.1,
      ebitdaGrowth: 0.09,
    },
  },
  transportation: {
    profitability: {
      grossProfitMargin: 0.25,
      operatingProfitMargin: 0.1,
      netProfitMargin: 0.06,
      returnOnAssets: 0.05,
      returnOnEquity: 0.12,
      ebitdaMargin: 0.15,
    },
    liquidity: {
      currentRatio: 1.2,
      quickRatio: 1.0,
      cashRatio: 0.3,
    },
    efficiency: {
      assetTurnover: 0.7,
      inventoryTurnover: 15.0,
      receivablesTurnover: 10.0,
      payablesTurnover: 8.0,
      cashConversionCycle: 30,
    },
    solvency: {
      debtToEquityRatio: 1.5,
      debtToAssetsRatio: 0.6,
      interestCoverageRatio: 2.5,
    },
    growth: {
      revenueGrowth: 0.04,
      netIncomeGrowth: 0.05,
      ebitdaGrowth: 0.05,
    },
  },
  other: {
    profitability: {
      grossProfitMargin: 0.4,
      operatingProfitMargin: 0.12,
      netProfitMargin: 0.08,
      returnOnAssets: 0.08,
      returnOnEquity: 0.15,
      ebitdaMargin: 0.15,
    },
    liquidity: {
      currentRatio: 1.5,
      quickRatio: 1.2,
      cashRatio: 0.4,
    },
    efficiency: {
      assetTurnover: 1.0,
      inventoryTurnover: 8.0,
      receivablesTurnover: 8.0,
      payablesTurnover: 7.0,
      cashConversionCycle: 40,
    },
    solvency: {
      debtToEquityRatio: 0.8,
      debtToAssetsRatio: 0.4,
      interestCoverageRatio: 4.0,
    },
    growth: {
      revenueGrowth: 0.05,
      netIncomeGrowth: 0.06,
      ebitdaGrowth: 0.06,
    },
  },
}

// Default business data
const DEFAULT_FINANCIAL_DATA: FinancialData = {
  revenue: 10000000,
  cogs: 6000000,
  operatingExpenses: 2500000,
  ebitda: 1500000,
  netIncome: 1000000,
  totalAssets: 8000000,
  currentAssets: 3000000,
  inventory: 1000000,
  accountsReceivable: 1200000,
  cash: 800000,
  totalLiabilities: 4000000,
  currentLiabilities: 2000000,
  longTermDebt: 2000000,
  equity: 4000000,
  retainedEarnings: 2500000,
}

const DEFAULT_PREVIOUS_YEAR: FinancialData = {
  revenue: 9000000,
  cogs: 5500000,
  operatingExpenses: 2300000,
  ebitda: 1200000,
  netIncome: 800000,
  totalAssets: 7500000,
  currentAssets: 2800000,
  inventory: 950000,
  accountsReceivable: 1100000,
  cash: 750000,
  totalLiabilities: 3800000,
  currentLiabilities: 1900000,
  longTermDebt: 1900000,
  equity: 3700000,
  retainedEarnings: 2200000,
}

const DEFAULT_OPERATIONAL_DATA: OperationalData = {
  employees: 50,
  customerCount: 500,
  customerRetentionRate: 0.85,
  averageOrderValue: 20000,
  inventoryTurnover: 6,
  daysInventoryOutstanding: 60,
  daysPayableOutstanding: 45,
  daysReceivableOutstanding: 45,
  employeeTurnoverRate: 0.15,
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(amount)
}

// Helper function to format percentage
const formatPercent = (value: number) => {
  return new Intl.NumberFormat("da-DK", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}

// Helper function to format decimal
const formatDecimal = (value: number) => {
  return new Intl.NumberFormat("da-DK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Helper function to calculate KPIs
const calculateKPIs = (data: BusinessData): BusinessData => {
  const current = data.currentYear
  const previous = data.previousYear

  // Calculate profitability KPIs
  const grossProfitMargin = (current.revenue - current.cogs) / current.revenue
  const operatingProfitMargin = (current.revenue - current.cogs - current.operatingExpenses) / current.revenue
  const netProfitMargin = current.netIncome / current.revenue
  const returnOnAssets = current.netIncome / current.totalAssets
  const returnOnEquity = current.netIncome / current.equity
  const ebitdaMargin = current.ebitda / current.revenue

  // Calculate liquidity KPIs
  const currentRatio = current.currentAssets / current.currentLiabilities
  const quickRatio = (current.currentAssets - current.inventory) / current.currentLiabilities
  const cashRatio = current.cash / current.currentLiabilities
  const workingCapital = current.currentAssets - current.currentLiabilities
  const workingCapitalRatio = workingCapital / current.revenue

  // Calculate efficiency KPIs
  const assetTurnover = current.revenue / current.totalAssets
  const inventoryTurnover = current.cogs / current.inventory
  const receivablesTurnover = current.revenue / current.accountsReceivable
  const payablesTurnover =
    current.cogs /
    (current.currentLiabilities -
      (current.currentAssets - current.inventory - current.accountsReceivable - current.cash))
  const cashConversionCycle = 365 / inventoryTurnover + 365 / receivablesTurnover - 365 / payablesTurnover

  // Calculate solvency KPIs
  const debtToEquityRatio = current.totalLiabilities / current.equity
  const debtToAssetsRatio = current.totalLiabilities / current.totalAssets
  const interestCoverageRatio = (current.ebitda / (current.ebitda - current.netIncome)) * 2 // Approximation
  const equityMultiplier = current.totalAssets / current.equity

  // Calculate growth KPIs
  const revenueGrowth = (current.revenue - previous.revenue) / previous.revenue
  const netIncomeGrowth = (current.netIncome - previous.netIncome) / previous.netIncome
  const ebitdaGrowth = (current.ebitda - previous.ebitda) / previous.ebitda

  return {
    ...data,
    kpis: {
      profitability: {
        grossProfitMargin,
        operatingProfitMargin,
        netProfitMargin,
        returnOnAssets,
        returnOnEquity,
        ebitdaMargin,
      },
      liquidity: {
        currentRatio,
        quickRatio,
        cashRatio,
        workingCapital,
        workingCapitalRatio,
      },
      efficiency: {
        assetTurnover,
        inventoryTurnover,
        receivablesTurnover,
        payablesTurnover,
        cashConversionCycle,
      },
      solvency: {
        debtToEquityRatio,
        debtToAssetsRatio,
        interestCoverageRatio,
        equityMultiplier,
      },
      growth: {
        revenueGrowth,
        netIncomeGrowth,
        ebitdaGrowth,
      },
    },
  }
}

// Helper function to evaluate KPI performance
const evaluateKPI = (kpiValue: number, benchmark: number, inverse = false) => {
  const percentDifference = inverse
    ? (benchmark - kpiValue) / benchmark // For metrics where lower is better
    : (kpiValue - benchmark) / benchmark // For metrics where higher is better

  if (percentDifference >= 0.2) return { status: "excellent", color: "text-green-600" }
  if (percentDifference >= 0) return { status: "good", color: "text-green-500" }
  if (percentDifference >= -0.2) return { status: "fair", color: "text-yellow-500" }
  return { status: "poor", color: "text-red-500" }
}

// Helper function to get recommendations based on KPIs
const getRecommendations = (data: BusinessData) => {
  const recommendations: {
    category: string
    title: string
    description: string
    priority: "high" | "medium" | "low"
  }[] = []
  const kpis = data.kpis
  const benchmarks = INDUSTRY_BENCHMARKS[data.industry]

  // Profitability recommendations
  if (kpis.profitability.grossProfitMargin < benchmarks.profitability.grossProfitMargin * 0.8) {
    recommendations.push({
      category: "Profitability",
      title: "Forbedre bruttoavancen",
      description:
        "Din bruttoavance er lavere end branchegennemsnittet. Overvej at genforhandle leverandørkontrakter, optimere produktmix eller justere priser.",
      priority: "high",
    })
  }

  if (kpis.profitability.netProfitMargin < benchmarks.profitability.netProfitMargin * 0.8) {
    recommendations.push({
      category: "Profitability",
      title: "Øg nettooverskuddet",
      description:
        "Dit nettooverskud er lavere end branchegennemsnittet. Gennemgå driftsomkostninger for at identificere besparelsesmuligheder.",
      priority: "high",
    })
  }

  // Liquidity recommendations
  if (kpis.liquidity.currentRatio < 1.0) {
    recommendations.push({
      category: "Liquidity",
      title: "Forbedre likviditeten",
      description:
        "Din likviditetsgrad er under 1,0, hvilket indikerer potentielle likviditetsproblemer. Fokuser på at forbedre arbejdskapitalen.",
      priority: "high",
    })
  } else if (kpis.liquidity.currentRatio < benchmarks.liquidity.currentRatio * 0.8) {
    recommendations.push({
      category: "Liquidity",
      title: "Styrk likviditeten",
      description:
        "Din likviditetsgrad er lavere end branchegennemsnittet. Overvej at forbedre lagerstyring og debitoropfølgning.",
      priority: "medium",
    })
  }

  // Efficiency recommendations
  if (kpis.efficiency.inventoryTurnover < benchmarks.efficiency.inventoryTurnover * 0.7) {
    recommendations.push({
      category: "Efficiency",
      title: "Optimer lagerstyring",
      description:
        "Din lageromsætningshastighed er lavere end branchegennemsnittet. Implementer bedre lagerstyring for at reducere bundet kapital.",
      priority: "medium",
    })
  }

  if (kpis.efficiency.receivablesTurnover < benchmarks.efficiency.receivablesTurnover * 0.7) {
    recommendations.push({
      category: "Efficiency",
      title: "Forbedre debitoropfølgning",
      description:
        "Din debitorormsætningshastighed er lavere end branchegennemsnittet. Implementer strammere kreditpolitik og bedre opfølgningsprocedurer.",
      priority: "medium",
    })
  }

  if (kpis.efficiency.cashConversionCycle > benchmarks.efficiency.cashConversionCycle * 1.3) {
    recommendations.push({
      category: "Efficiency",
      title: "Reducer cash conversion cycle",
      description:
        "Din cash conversion cycle er længere end branchegennemsnittet. Fokuser på at reducere lagerbindingstid og debitordage.",
      priority: "medium",
    })
  }

  // Solvency recommendations
  if (kpis.solvency.debtToEquityRatio > benchmarks.solvency.debtToEquityRatio * 1.3) {
    recommendations.push({
      category: "Solvency",
      title: "Reducer gældsætning",
      description:
        "Din gæld i forhold til egenkapital er højere end branchegennemsnittet. Overvej at reducere gæld eller øge egenkapitalen.",
      priority: "high",
    })
  }

  if (kpis.solvency.interestCoverageRatio < 1.5) {
    recommendations.push({
      category: "Solvency",
      title: "Forbedre renteafdækning",
      description:
        "Din renteafdækningsgrad er lav, hvilket indikerer potentielle problemer med at betjene gæld. Fokuser på at øge EBITDA eller reducere gæld.",
      priority: "high",
    })
  }

  // Growth recommendations
  if (kpis.growth.revenueGrowth < benchmarks.growth.revenueGrowth * 0.5) {
    recommendations.push({
      category: "Growth",
      title: "Stimuler omsætningsvækst",
      description:
        "Din omsætningsvækst er lavere end branchegennemsnittet. Udvikl en vækststrategi med fokus på nye markeder, produkter eller kundesegmenter.",
      priority: "medium",
    })
  }

  if (kpis.growth.netIncomeGrowth < 0) {
    recommendations.push({
      category: "Growth",
      title: "Vend negativ indtjeningsvækst",
      description:
        "Din nettoindtjening er faldende. Gennemgå omkostningsstrukturen og implementer effektiviseringer for at vende trenden.",
      priority: "high",
    })
  }

  // Add general recommendations if we have few specific ones
  if (recommendations.length < 3) {
    recommendations.push({
      category: "Strategy",
      title: "Udvikl en langsigtet strategi",
      description: "Udarbejd en 3-5 års strategiplan med klare mål for vækst, rentabilitet og markedsposition.",
      priority: "medium",
    })

    recommendations.push({
      category: "Operations",
      title: "Implementer KPI-opfølgning",
      description:
        "Etabler et system til løbende opfølgning på nøgletal og handlingsplaner for at sikre kontinuerlig forbedring.",
      priority: "low",
    })
  }

  return recommendations
}

// Helper function to get business health score
const calculateBusinessHealthScore = (data: BusinessData) => {
  const kpis = data.kpis
  const benchmarks = INDUSTRY_BENCHMARKS[data.industry]
  const score = 50 // Base score

  // Profitability impact (30%)
  const profitabilityScore =
    ((kpis.profitability.grossProfitMargin / benchmarks.profitability.grossProfitMargin) * 0.2 +
      (kpis.profitability.netProfitMargin / benchmarks.profitability.netProfitMargin) * 0.4 +
      (kpis.profitability.returnOnEquity / benchmarks.profitability.returnOnEquity) * 0.4) *
    30

  // Liquidity impact (20%)
  const liquidityScore =
    ((kpis.liquidity.currentRatio / benchmarks.liquidity.currentRatio) * 0.5 +
      (kpis.liquidity.quickRatio / benchmarks.liquidity.quickRatio) * 0.5) *
    20

  // Efficiency impact (20%)
  const efficiencyScore =
    ((benchmarks.efficiency.cashConversionCycle / Math.max(kpis.efficiency.cashConversionCycle, 1)) * 0.4 +
      (kpis.efficiency.assetTurnover / benchmarks.efficiency.assetTurnover) * 0.3 +
      (kpis.efficiency.inventoryTurnover / benchmarks.efficiency.inventoryTurnover) * 0.3) *
    20

  // Solvency impact (15%)
  const solvencyScore =
    ((benchmarks.solvency.debtToEquityRatio / Math.max(kpis.solvency.debtToEquityRatio, 0.1)) * 0.5 +
      (kpis.solvency.interestCoverageRatio / benchmarks.solvency.interestCoverageRatio) * 0.5) *
    15

  // Growth impact (15%)
  const growthScore =
    ((kpis.growth.revenueGrowth / benchmarks.growth.revenueGrowth) * 0.4 +
      (kpis.growth.netIncomeGrowth / benchmarks.growth.netIncomeGrowth) * 0.6) *
    15

  // Calculate final score, capped between 0-100
  const finalScore = Math.min(
    100,
    Math.max(0, score + profitabilityScore + liquidityScore + efficiencyScore + solvencyScore + growthScore),
  )

  return Math.round(finalScore)
}

// Helper function to get business health category
const getBusinessHealthCategory = (score: number) => {
  if (score >= 80) {
    return { category: "Fremragende", color: "text-green-600" }
  } else if (score >= 65) {
    return { category: "God", color: "text-green-500" }
  } else if (score >= 50) {
    return { category: "Tilfredsstillende", color: "text-yellow-500" }
  } else if (score >= 35) {
    return { category: "Udfordrende", color: "text-orange-500" }
  } else {
    return { category: "Kritisk", color: "text-red-500" }
  }
}

export default function BusinessCalculatorPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbage til forsiden
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">Virksomhedsrådgiver</h1>
      <p className="text-gray-600 mb-8">
        Få skræddersyet rådgivning til din virksomheds økonomiske udfordringer og muligheder.
      </p>

      {/* Fjernet TokenCheck komponenten, så alle kan bruge rådgiveren */}
      <CalculatorTracker calculatorName="virksomhed">
        <SimpleBusinessAdvisor />
      </CalculatorTracker>
    </div>
  )
}

function SimpleBusinessAdvisor() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Virksomhedsanalyse</h2>
        <p className="mb-4">
          Vores avancerede virksomhedsrådgiver hjælper dig med at analysere din virksomheds økonomiske situation og
          giver dig strategiske anbefalinger baseret på dine data.
        </p>
        <p className="mb-4">
          Indtast dine virksomhedsdata, og få en omfattende analyse af din virksomheds finansielle sundhed,
          konkurrenceposition og vækstmuligheder.
        </p>
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Finansiel Analyse</h3>
            <p className="text-sm">
              Omfattende analyse af nøgletal, rentabilitet, likviditet, soliditet og værdiansættelse
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Strategisk Analyse</h3>
            <p className="text-sm">SWOT, PESTEL, Porters Five Forces og Business Model Canvas analyse</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Anbefalinger</h3>
            <p className="text-sm">Konkrete strategiske og taktiske anbefalinger med implementeringsplan</p>
          </div>
        </div>
        <div className="mt-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Start Virksomhedsanalyse
          </button>
        </div>
      </div>
    </div>
  )
}

function VirksomhedsraadgivningPage() {
  const [step, setStep] = useState(1)
  const [showResults, setShowResults] = useState(false)
  const [businessData, setBusinessData] = useState<BusinessData>({
    // Basic information
    companyName: "Min Virksomhed A/S",
    industry: "manufacturing",
    companySize: "small",
    businessStage: "growth",
    yearsInBusiness: 5,

    // Financial data
    currentYear: DEFAULT_FINANCIAL_DATA,
    previousYear: DEFAULT_PREVIOUS_YEAR,

    // Operational data
    operationalData: DEFAULT_OPERATIONAL_DATA,

    // Goals and challenges
    primaryGoals: ["Øge omsætning", "Forbedre rentabilitet", "Ekspandere til nye markeder"],
    topChallenges: ["Stigende råvarepriser", "Hård konkurrence", "Rekruttering af kvalificeret arbejdskraft"],

    // Calculated KPIs (will be computed)
    kpis: {
      profitability: {
        grossProfitMargin: 0,
        operatingProfitMargin: 0,
        netProfitMargin: 0,
        returnOnAssets: 0,
        returnOnEquity: 0,
        ebitdaMargin: 0,
      },
      liquidity: {
        currentRatio: 0,
        quickRatio: 0,
        cashRatio: 0,
        workingCapital: 0,
        workingCapitalRatio: 0,
      },
      efficiency: {
        assetTurnover: 0,
        inventoryTurnover: 0,
        receivablesTurnover: 0,
        payablesTurnover: 0,
        cashConversionCycle: 0,
      },
      solvency: {
        debtToEquityRatio: 0,
        debtToAssetsRatio: 0,
        interestCoverageRatio: 0,
        equityMultiplier: 0,
      },
      growth: {
        revenueGrowth: 0,
        netIncomeGrowth: 0,
        ebitdaGrowth: 0,
      },
    },
  })

  const totalSteps = 5
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Calculate KPIs before showing results
      const updatedData = calculateKPIs(businessData)
      setBusinessData(updatedData)
      setShowResults(true)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleReset = () => {
    setShowResults(false)
    setStep(1)
  }

  const updateBusinessData = (field: keyof BusinessData, value: any) => {
    setBusinessData((prev) => ({ ...prev, [field]: value }))
  }

  const phaseMap: Record<string, "idé" | "opstart" | "vækst" | "moden"> = {
    startup: "opstart",
    growth: "vækst",
    mature: "moden",
    established: "moden",
    idea: "idé",
  }

  const aiRecommendation = useMemo(
    () =>
      analyzeVirksomhed({
        revenue: businessData.currentYear.revenue,
        costs: businessData.currentYear.cogs + businessData.currentYear.operatingExpenses,
        employees: (businessData.operationalData as any)?.employees ?? 0,
        industry: String(businessData.industry ?? ""),
        phase: phaseMap[String(businessData.businessStage)] ?? "vækst",
        cashBalance: businessData.currentYear.cash,
        monthlyBurn:
          businessData.currentYear.revenue - businessData.currentYear.netIncome > 0
            ? Math.max(
                0,
                (businessData.currentYear.cogs + businessData.currentYear.operatingExpenses) / 12,
              )
            : 0,
      }),
    [businessData],
  )

  const updateFinancialData = (
    year: "currentYear" | "previousYear",
    field: keyof FinancialData,
    value: number | string,
  ) => {
    // Hvis værdien er en tom streng, sæt værdien til 0
    const numericValue =
      value === ""
        ? 0
        : typeof value === "string"
          ? Number.parseFloat(value.replace(/\./g, "").replace(",", "."))
          : value

    setBusinessData((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [field]: numericValue,
      },
    }))
  }

  const updateOperationalData = (field: keyof OperationalData, value: any) => {
    // Hvis værdien er en tom streng, sæt værdien til 0
    const numericValue =
      value === ""
        ? 0
        : typeof value === "string" && field !== "customerRetentionRate" && field !== "employeeTurnoverRate"
          ? Number.parseFloat(value.replace(/\./g, "").replace(",", "."))
          : value

    setBusinessData((prev) => ({
      ...prev,
      operationalData: {
        ...prev.operationalData,
        [field]: numericValue,
      },
    }))
  }

  // Calculate KPIs for display
  const calculatedData = calculateKPIs(businessData)
  const kpis = calculatedData.kpis
  const benchmarks = INDUSTRY_BENCHMARKS[businessData.industry]
  const recommendations = getRecommendations(calculatedData)
  const businessHealthScore = calculateBusinessHealthScore(calculatedData)
  const healthCategory = getBusinessHealthCategory(businessHealthScore)

  // Prepare data for charts
  const profitabilityChartData = [
    {
      name: "Bruttoavance",
      Virksomhed: kpis.profitability.grossProfitMargin * 100,
      Benchmark: benchmarks.profitability.grossProfitMargin * 100,
    },
    {
      name: "Driftsmargin",
      Virksomhed: kpis.profitability.operatingProfitMargin * 100,
      Benchmark: benchmarks.profitability.operatingProfitMargin * 100,
    },
    {
      name: "Nettomargin",
      Virksomhed: kpis.profitability.netProfitMargin * 100,
      Benchmark: benchmarks.profitability.netProfitMargin * 100,
    },
    {
      name: "Afkast af aktiver",
      Virksomhed: kpis.profitability.returnOnAssets * 100,
      Benchmark: benchmarks.profitability.returnOnAssets * 100,
    },
    {
      name: "Egenkapitalforrentning",
      Virksomhed: kpis.profitability.returnOnEquity * 100,
      Benchmark: benchmarks.profitability.returnOnEquity * 100,
    },
  ]

  const liquidityChartData = [
    {
      name: "Likviditetsgrad",
      Virksomhed: kpis.liquidity.currentRatio,
      Benchmark: benchmarks.liquidity.currentRatio,
    },
    {
      name: "Acid test ratio",
      Virksomhed: kpis.liquidity.quickRatio,
      Benchmark: benchmarks.liquidity.quickRatio,
    },
    {
      name: "Cash ratio",
      Virksomhed: kpis.liquidity.cashRatio,
      Benchmark: benchmarks.liquidity.cashRatio,
    },
  ]

  const efficiencyChartData = [
    {
      name: "Aktivernes omsætningshastighed",
      Virksomhed: kpis.efficiency.assetTurnover,
      Benchmark: benchmarks.efficiency.assetTurnover,
    },
    {
      name: "Lageromsætningshastighed",
      Virksomhed: kpis.efficiency.inventoryTurnover,
      Benchmark: benchmarks.efficiency.inventoryTurnover,
    },
    {
      name: "Debitorormsætningshastighed",
      Virksomhed: kpis.efficiency.receivablesTurnover,
      Benchmark: benchmarks.efficiency.receivablesTurnover,
    },
    {
      name: "Kreditorormsætningshastighed",
      Virksomhed: kpis.efficiency.payablesTurnover,
      Benchmark: benchmarks.efficiency.payablesTurnover,
    },
  ]

  const growthChartData = [
    {
      name: "Omsætningsvækst",
      Virksomhed: kpis.growth.revenueGrowth * 100,
      Benchmark: benchmarks.growth.revenueGrowth * 100,
    },
    {
      name: "Indtjeningsvækst",
      Virksomhed: kpis.growth.netIncomeGrowth * 100,
      Benchmark: benchmarks.growth.netIncomeGrowth * 100,
    },
    {
      name: "EBITDA vækst",
      Virksomhed: kpis.growth.ebitdaGrowth * 100,
      Benchmark: benchmarks.growth.ebitdaGrowth * 100,
    },
  ]

  const radarChartData = [
    {
      subject: "Rentabilitet",
      A: Math.min(100, (kpis.profitability.netProfitMargin / benchmarks.profitability.netProfitMargin) * 100),
      fullMark: 100,
    },
    {
      subject: "Likviditet",
      A: Math.min(100, (kpis.liquidity.currentRatio / benchmarks.liquidity.currentRatio) * 100),
      fullMark: 100,
    },
    {
      subject: "Effektivitet",
      A: Math.min(100, (kpis.efficiency.assetTurnover / benchmarks.efficiency.assetTurnover) * 100),
      fullMark: 100,
    },
    {
      subject: "Soliditet",
      A: Math.min(100, (benchmarks.solvency.debtToEquityRatio / Math.max(kpis.solvency.debtToEquityRatio, 0.1)) * 100),
      fullMark: 100,
    },
    {
      subject: "Vækst",
      A: Math.min(100, (kpis.growth.revenueGrowth / Math.max(benchmarks.growth.revenueGrowth, 0.01)) * 100),
      fullMark: 100,
    },
  ]

  const pieChartData = [
    { name: "Vareforbrug", value: businessData.currentYear.cogs },
    { name: "Driftsomkostninger", value: businessData.currentYear.operatingExpenses },
    { name: "Nettoindkomst", value: businessData.currentYear.netIncome },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  // Tilføj disse konstanter til at forberede data for soliditetsgrafen
  const solvencyChartData = [
    {
      name: "Gæld/Egenkapital",
      Virksomhed: kpis.solvency.debtToEquityRatio,
      Benchmark: benchmarks.solvency.debtToEquityRatio,
    },
    {
      name: "Gæld/Aktiver",
      Virksomhed: kpis.solvency.debtToAssetsRatio,
      Benchmark: benchmarks.solvency.debtToAssetsRatio,
    },
    {
      name: "Renteafdækning",
      Virksomhed: kpis.solvency.interestCoverageRatio,
      Benchmark: benchmarks.solvency.interestCoverageRatio,
    },
    {
      name: "Soliditetsgrad",
      Virksomhed: 1 - kpis.solvency.debtToAssetsRatio,
      Benchmark: 1 - benchmarks.solvency.debtToAssetsRatio,
    },
  ]

  // Tilføj denne konstant for at forberede data til anbefalingsmodeller
  const businessModels = [
    {
      title: "Abonnementsmodel",
      description:
        "Implementer en abonnementsbaseret indtægtsmodel for at skabe forudsigelig, tilbagevendende omsætning og øge kundelivstidsværdien.",
      suitability:
        businessData.industry === "technology" || businessData.industry === "professional_services" ? "Høj" : "Medium",
      implementation: "3-6 måneder",
      roi: "Medium til høj",
      risk: "Lav til medium",
    },
    {
      title: "Vertikal integration",
      description:
        "Udvid forretningen op eller ned i værdikæden for at reducere afhængighed af leverandører, øge marginer og skabe konkurrencefordele.",
      suitability: businessData.industry === "manufacturing" || businessData.industry === "retail" ? "Høj" : "Medium",
      implementation: "6-12 måneder",
      roi: "Medium til høj",
      risk: "Medium til høj",
    },
    {
      title: "Platformsøkonomi",
      description:
        "Udvikl en digital platform der forbinder købere og sælgere, skaber netværkseffekter og genererer indtægter gennem transaktionsgebyrer.",
      suitability: businessData.companySize === "medium" || businessData.companySize === "large" ? "Medium" : "Lav",
      implementation: "12-18 måneder",
      roi: "Høj",
      risk: "Høj",
    },
    {
      title: "Servitization",
      description:
        "Transformér produkttilbud til service-baserede løsninger for at skabe længerevarende kunderelationer og højere marginer.",
      suitability:
        businessData.industry === "manufacturing" || businessData.industry === "technology" ? "Høj" : "Medium",
      implementation: "6-12 måneder",
      roi: "Medium",
      risk: "Medium",
    },
    {
      title: "Freemium-model",
      description:
        "Tilbyd en gratis basisversion af dit produkt med betalte premium-funktioner for at tiltrække en bred brugerbase og konvertere til betalende kunder.",
      suitability:
        businessData.industry === "technology" || businessData.industry === "professional_services" ? "Høj" : "Lav",
      implementation: "3-6 måneder",
      roi: "Medium til høj",
      risk: "Lav til medium",
    },
  ]

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 flex items-center">
        <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbage til forsiden
        </Link>
        <h1 className="ml-auto text-2xl font-bold tracking-tight">Virksomhedsrådgivning</h1>
      </div>

      {!showResults ? (
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">
                Trin {step} af {totalSteps}
              </h2>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% fuldført</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Virksomhedsoplysninger</CardTitle>
                <CardDescription>Indtast grundlæggende oplysninger om din virksomhed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="company-name">Virksomhedsnavn</Label>
                      <FieldTooltip text="Indtast din virksomheds officielle navn" />
                    </div>
                    <Input
                      id="company-name"
                      value={businessData.companyName}
                      onChange={(e) => updateBusinessData("companyName", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="industry">Branche</Label>
                      <FieldTooltip text="Vælg den branche der bedst beskriver din virksomheds primære aktivitet" />
                    </div>
                    <Select
                      value={businessData.industry}
                      onValueChange={(value) => updateBusinessData("industry", value as Industry)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg branche" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manufacturing">Produktion</SelectItem>
                        <SelectItem value="retail">Detailhandel</SelectItem>
                        <SelectItem value="technology">Teknologi</SelectItem>
                        <SelectItem value="finance">Finans</SelectItem>
                        <SelectItem value="healthcare">Sundhed</SelectItem>
                        <SelectItem value="construction">Byggeri</SelectItem>
                        <SelectItem value="hospitality">Hotel & Restauration</SelectItem>
                        <SelectItem value="professional_services">Professionelle services</SelectItem>
                        <SelectItem value="transportation">Transport</SelectItem>
                        <SelectItem value="other">Andet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="company-size">Virksomhedsstørrelse</Label>
                      <FieldTooltip text="Vælg den kategori der bedst beskriver din virksomheds størrelse baseret på antal ansatte" />
                    </div>
                    <Select
                      value={businessData.companySize}
                      onValueChange={(value) => updateBusinessData("companySize", value as CompanySize)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg størrelse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="micro">Mikro (1-9 ansatte)</SelectItem>
                        <SelectItem value="small">Lille (10-49 ansatte)</SelectItem>
                        <SelectItem value="medium">Mellemstor (50-249 ansatte)</SelectItem>
                        <SelectItem value="large">Stor (250+ ansatte)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="business-stage">Virksomhedens fase</Label>
                      <FieldTooltip text="Vælg den fase der bedst beskriver din virksomheds nuværende udviklingsstadie" />
                    </div>
                    <Select
                      value={businessData.businessStage}
                      onValueChange={(value) => updateBusinessData("businessStage", value as BusinessStage)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg fase" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Opstart</SelectItem>
                        <SelectItem value="growth">Vækst</SelectItem>
                        <SelectItem value="mature">Moden</SelectItem>
                        <SelectItem value="decline">Nedgang</SelectItem>
                        <SelectItem value="turnaround">Turnaround</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="years-in-business">Antal år i drift</Label>
                      <FieldTooltip text="Indtast hvor mange år din virksomhed har været i drift" />
                    </div>
                    <Input
                      id="years-in-business"
                      type="number"
                      min={0}
                      value={businessData.yearsInBusiness}
                      onChange={(e) =>
                        updateBusinessData(
                          "yearsInBusiness",
                          e.target.value === "" ? 0 : Number.parseInt(e.target.value),
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div></div>
                <Button onClick={handleNext}>
                  Næste
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Finansielle data - Indeværende år</CardTitle>
                <CardDescription>Indtast finansielle nøgletal for indeværende regnskabsår</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Resultatopgørelse</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="revenue">Omsætning</Label>
                          <FieldTooltip text="Den samlede omsætning i regnskabsåret. Repræsenterer virksomhedens totale salg af varer og tjenesteydelser før fradrag af omkostninger." />
                        </div>
                        <Input
                          id="revenue"
                          value={businessData.currentYear.revenue}
                          onChange={(e) => updateFinancialData("currentYear", "revenue", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="cogs">Vareforbrug</Label>
                          <FieldTooltip text="De direkte omkostninger forbundet med produktion eller indkøb af solgte varer. Inkluderer råvarer, komponenter og direkte produktionsomkostninger." />
                        </div>
                        <Input
                          id="cogs"
                          value={businessData.currentYear.cogs}
                          onChange={(e) => updateFinancialData("currentYear", "cogs", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="operating-expenses">Driftsomkostninger</Label>
                          <FieldTooltip text="Alle omkostninger relateret til den daglige drift, ekskl. vareforbrug. Omfatter løn, husleje, marketing, administration og andre indirekte omkostninger." />
                        </div>
                        <Input
                          id="operating-expenses"
                          value={businessData.currentYear.operatingExpenses}
                          onChange={(e) => updateFinancialData("currentYear", "operatingExpenses", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="ebitda">EBITDA</Label>
                          <FieldTooltip text="Indtjening før renter, skat, afskrivninger og amortiseringer. Et mål for virksomhedens driftsmæssige indtjening og kontantstrømspotentiale." />
                        </div>
                        <Input
                          id="ebitda"
                          value={businessData.currentYear.ebitda}
                          onChange={(e) => updateFinancialData("currentYear", "ebitda", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="net-income">Nettoindkomst</Label>
                          <FieldTooltip text="Årets resultat efter alle omkostninger, renter og skat. Repræsenterer virksomhedens endelige overskud eller underskud i perioden." />
                        </div>
                        <Input
                          id="net-income"
                          value={businessData.currentYear.netIncome}
                          onChange={(e) => updateFinancialData("currentYear", "netIncome", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Balance</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="total-assets">Samlede aktiver</Label>
                          <FieldTooltip text="Summen af alle virksomhedens aktiver (anlægsaktiver og omsætningsaktiver)" />
                        </div>
                        <Input
                          id="total-assets"
                          value={businessData.currentYear.totalAssets}
                          onChange={(e) => updateFinancialData("currentYear", "totalAssets", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="current-assets">Omsætningsaktiver</Label>
                          <FieldTooltip text="Aktiver der forventes omsat inden for et år (f.eks. varelager, debitorer, likvider)" />
                        </div>
                        <Input
                          id="current-assets"
                          value={businessData.currentYear.currentAssets}
                          onChange={(e) => updateFinancialData("currentYear", "currentAssets", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="inventory">Varelager</Label>
                          <FieldTooltip text="Værdien af virksomhedens varelager ved regnskabsårets afslutning" />
                        </div>
                        <Input
                          id="inventory"
                          value={businessData.currentYear.inventory}
                          onChange={(e) => updateFinancialData("currentYear", "inventory", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="accounts-receivable">Debitorer</Label>
                          <FieldTooltip text="Udestående beløb som kunder skylder virksomheden" />
                        </div>
                        <Input
                          id="accounts-receivable"
                          value={businessData.currentYear.accountsReceivable}
                          onChange={(e) => updateFinancialData("currentYear", "accountsReceivable", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="cash">Likvide beholdninger</Label>
                          <FieldTooltip text="Kontanter og andre likvide midler til rådighed for virksomheden" />
                        </div>
                        <Input
                          id="cash"
                          value={businessData.currentYear.cash}
                          onChange={(e) => updateFinancialData("currentYear", "cash", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="total-liabilities">Samlede forpligtelser</Label>
                          <FieldTooltip text="Summen af alle virksomhedens gældsforpligtelser" />
                        </div>
                        <Input
                          id="total-liabilities"
                          value={businessData.currentYear.totalLiabilities}
                          onChange={(e) => updateFinancialData("currentYear", "totalLiabilities", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="current-liabilities">Kortfristede forpligtelser</Label>
                          <FieldTooltip text="Gæld der skal betales inden for et år (f.eks. kreditorer, kortfristet gæld)" />
                        </div>
                        <Input
                          id="current-liabilities"
                          value={businessData.currentYear.currentLiabilities}
                          onChange={(e) => updateFinancialData("currentYear", "currentLiabilities", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="long-term-debt">Langfristet gæld</Label>
                          <FieldTooltip text="Gæld der forfalder efter mere end et år" />
                        </div>
                        <Input
                          id="long-term-debt"
                          value={businessData.currentYear.longTermDebt}
                          onChange={(e) => updateFinancialData("currentYear", "longTermDebt", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="equity">Egenkapital</Label>
                          <FieldTooltip text="Virksomhedens nettoværdi (aktiver minus forpligtelser)" />
                        </div>
                        <Input
                          id="equity"
                          value={businessData.currentYear.equity}
                          onChange={(e) => updateFinancialData("currentYear", "equity", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tilbage
                </Button>
                <Button onClick={handleNext}>
                  Næste
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Finansielle data - Foregående år</CardTitle>
                <CardDescription>
                  Indtast finansielle nøgletal for foregående regnskabsår (til sammenligning)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Resultatopgørelse</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="prev-revenue">Omsætning</Label>
                          <FieldTooltip text="Den samlede omsætning i foregående regnskabsår" />
                        </div>
                        <Input
                          id="prev-revenue"
                          value={businessData.previousYear.revenue}
                          onChange={(e) => updateFinancialData("previousYear", "revenue", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="prev-cogs">Vareforbrug</Label>
                          <FieldTooltip text="De direkte omkostninger forbundet med produktion eller indkøb af solgte varer i foregående år" />
                        </div>
                        <Input
                          id="prev-cogs"
                          value={businessData.previousYear.cogs}
                          onChange={(e) => updateFinancialData("previousYear", "cogs", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="prev-operating-expenses">Driftsomkostninger</Label>
                          <FieldTooltip text="Alle omkostninger relateret til den daglige drift i foregående år, ekskl. vareforbrug" />
                        </div>
                        <Input
                          id="prev-operating-expenses"
                          value={businessData.previousYear.operatingExpenses}
                          onChange={(e) => updateFinancialData("previousYear", "operatingExpenses", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="prev-ebitda">EBITDA</Label>
                          <FieldTooltip text="Indtjening før renter, skat, afskrivninger og amortiseringer i foregående år" />
                        </div>
                        <Input
                          id="prev-ebitda"
                          value={businessData.previousYear.ebitda}
                          onChange={(e) => updateFinancialData("previousYear", "ebitda", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="prev-net-income">Nettoindkomst</Label>
                          <FieldTooltip text="Årets resultat efter alle omkostninger, renter og skat i foregående år" />
                        </div>
                        <Input
                          id="prev-net-income"
                          value={businessData.previousYear.netIncome}
                          onChange={(e) => updateFinancialData("previousYear", "netIncome", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Balance</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="prev-total-assets">Samlede aktiver</Label>
                          <FieldTooltip text="Summen af alle virksomhedens aktiver i foregående år" />
                        </div>
                        <Input
                          id="prev-total-assets"
                          value={businessData.previousYear.totalAssets}
                          onChange={(e) => updateFinancialData("previousYear", "totalAssets", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="prev-current-assets">Omsætningsaktiver</Label>
                          <FieldTooltip text="Aktiver der forventes omsat inden for et år i foregående regnskabsår" />
                        </div>
                        <Input
                          id="prev-current-assets"
                          value={businessData.previousYear.currentAssets}
                          onChange={(e) => updateFinancialData("previousYear", "currentAssets", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="prev-inventory">Varelager</Label>
                          <FieldTooltip text="Værdien af virksomhedens varelager ved foregående regnskabsårs afslutning" />
                        </div>
                        <Input
                          id="prev-inventory"
                          value={businessData.previousYear.inventory}
                          onChange={(e) => updateFinancialData("previousYear", "inventory", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="prev-accounts-receivable">Debitorer</Label>
                          <FieldTooltip text="Udestående beløb som kunder skyldte virksomheden i foregående år" />
                        </div>
                        <Input
                          id="prev-accounts-receivable"
                          value={businessData.previousYear.accountsReceivable}
                          onChange={(e) => updateFinancialData("previousYear", "accountsReceivable", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="prev-cash">Likvide beholdninger</Label>
                          <FieldTooltip text="Kontanter og andre likvide midler til rådighed for virksomheden i foregående år" />
                        </div>
                        <Input
                          id="prev-cash"
                          value={businessData.previousYear.cash}
                          onChange={(e) => updateFinancialData("previousYear", "cash", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="prev-total-liabilities">Samlede forpligtelser</Label>
                          <FieldTooltip text="Summen af alle virksomhedens gældsforpligtelser i foregående år" />
                        </div>
                        <Input
                          id="prev-total-liabilities"
                          value={businessData.previousYear.totalLiabilities}
                          onChange={(e) => updateFinancialData("previousYear", "totalLiabilities", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="prev-current-liabilities">Kortfristede forpligtelser</Label>
                          <FieldTooltip text="Gæld der skulle betales inden for et år i foregående regnskabsår" />
                        </div>
                        <Input
                          id="prev-current-liabilities"
                          value={businessData.previousYear.currentLiabilities}
                          onChange={(e) => updateFinancialData("previousYear", "currentLiabilities", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="prev-long-term-debt">Langfristet gæld</Label>
                          <FieldTooltip text="Gæld der forfaldt efter mere end et år i foregående regnskabsår" />
                        </div>
                        <Input
                          id="prev-long-term-debt"
                          value={businessData.previousYear.longTermDebt}
                          onChange={(e) => updateFinancialData("previousYear", "longTermDebt", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor="prev-equity">Egenkapital</Label>
                          <FieldTooltip text="Virksomhedens nettoværdi i foregående regnskabsår" />
                        </div>
                        <Input
                          id="prev-equity"
                          value={businessData.previousYear.equity}
                          onChange={(e) => updateFinancialData("previousYear", "equity", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tilbage
                </Button>
                <Button onClick={handleNext}>
                  Næste
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Driftsdata</CardTitle>
                <CardDescription>Indtast operationelle nøgletal for din virksomhed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="employees">Antal medarbejdere</Label>
                      <FieldTooltip text="Det samlede antal medarbejdere i virksomheden (fuldtidsækvivalenter). Bruges til at beregne nøgletal per medarbejder og vurdere produktivitet." />
                    </div>
                    <Input
                      id="employees"
                      value={businessData.operationalData.employees}
                      onChange={(e) => updateOperationalData("employees", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="customer-count">Antal kunder</Label>
                      <FieldTooltip text="Det samlede antal aktive kunder i virksomheden. Hjælper med at vurdere kundekoncentration og afhængighed af enkelte kunder." />
                    </div>
                    <Input
                      id="customer-count"
                      value={businessData.operationalData.customerCount}
                      onChange={(e) => updateOperationalData("customerCount", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="customer-retention">Kundefastholdelsesrate (%)</Label>
                      <FieldTooltip text="Procentdel af kunder der forbliver kunder fra år til år. En høj rate indikerer god kundetilfredshed og stærke kunderelationer." />
                    </div>
                    <Input
                      id="customer-retention"
                      type="number"
                      min={0}
                      max={100}
                      value={businessData.operationalData.customerRetentionRate * 100}
                      onChange={(e) =>
                        updateOperationalData(
                          "customerRetentionRate",
                          e.target.value === "" ? 0 : Number.parseFloat(e.target.value) / 100,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="average-order">Gennemsnitlig ordreværdi</Label>
                      <FieldTooltip text="Den gennemsnitlige værdi af en ordre eller transaktion. Kan bruges til at vurdere potentialet for krydssalg og mersalg." />
                    </div>
                    <Input
                      id="average-order"
                      value={businessData.operationalData.averageOrderValue}
                      onChange={(e) => updateOperationalData("averageOrderValue", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="days-inventory">Lagerbindingstid (dage)</Label>
                      <FieldTooltip text="Gennemsnitligt antal dage varerne ligger på lager før de sælges. Lavere tal indikerer bedre lagerstyring og mindre bundet kapital." />
                    </div>
                    <Input
                      id="days-inventory"
                      value={businessData.operationalData.daysInventoryOutstanding}
                      onChange={(e) => updateOperationalData("daysInventoryOutstanding", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="days-payable">Kreditorbetalingstid (dage)</Label>
                      <FieldTooltip text="Gennemsnitligt antal dage det tager at betale leverandører. Længere betalingstid kan forbedre likviditeten, men kan påvirke leverandørrelationer." />
                    </div>
                    <Input
                      id="days-payable"
                      value={businessData.operationalData.daysPayableOutstanding}
                      onChange={(e) => updateOperationalData("daysPayableOutstanding", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="days-receivable">Debitordage (dage)</Label>
                      <FieldTooltip text="Gennemsnitligt antal dage det tager at inddrive betaling fra kunder. Lavere tal indikerer effektiv debitorhåndtering og bedre likviditet." />
                    </div>
                    <Input
                      id="days-receivable"
                      value={businessData.operationalData.daysReceivableOutstanding}
                      onChange={(e) => updateOperationalData("daysReceivableOutstanding", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="employee-turnover">Medarbejderomsætning (%)</Label>
                      <FieldTooltip text="Procentdel af medarbejdere der forlader virksomheden årligt. En høj rate kan indikere problemer med arbejdsmiljø, ledelse eller konkurrencedygtig aflønning og medfører ofte høje rekrutterings- og oplæringsomkostninger." />
                    </div>
                    <Input
                      id="employee-turnover"
                      type="number"
                      min={0}
                      max={100}
                      value={businessData.operationalData.employeeTurnoverRate * 100}
                      onChange={(e) =>
                        updateOperationalData(
                          "employeeTurnoverRate",
                          e.target.value === "" ? 0 : Number.parseFloat(e.target.value) / 100,
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tilbage
                </Button>
                <Button onClick={handleNext}>
                  Næste
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Mål og udfordringer</CardTitle>
                <CardDescription>Beskriv dine primære forretningsmål og udfordringer</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label>Primære forretningsmål</Label>
                      <FieldTooltip text="Vælg de vigtigste strategiske mål for din virksomhed" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Øge omsætning",
                        "Forbedre rentabilitet",
                        "Ekspandere til nye markeder",
                        "Reducere omkostninger",
                        "Øge markedsandel",
                        "Udvikle nye produkter",
                        "Forbedre kundetilfredshed",
                        "Optimere processer",
                        "Styrke likviditet",
                        "Reducere gæld",
                      ].map((goal) => (
                        <Button
                          key={goal}
                          variant={businessData.primaryGoals.includes(goal) ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => {
                            const updatedGoals = businessData.primaryGoals.includes(goal)
                              ? businessData.primaryGoals.filter((g) => g !== goal)
                              : [...businessData.primaryGoals, goal]
                            updateBusinessData("primaryGoals", updatedGoals)
                          }}
                        >
                          {businessData.primaryGoals.includes(goal) && <CheckCircle className="mr-2 h-4 w-4" />}
                          {goal}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label>Største udfordringer</Label>
                      <FieldTooltip text="Vælg de største udfordringer din virksomhed står overfor" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Stigende råvarepriser",
                        "Hård konkurrence",
                        "Rekruttering af kvalificeret arbejdskraft",
                        "Faldende efterspørgsel",
                        "Regulatoriske krav",
                        "Teknologisk udvikling",
                        "Likviditetsproblemer",
                        "Høje finansieringsomkostninger",
                        "Ineffektive processer",
                        "Lav kundeloyalitet",
                      ].map((challenge) => (
                        <Button
                          key={challenge}
                          variant={businessData.topChallenges.includes(challenge) ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => {
                            const updatedChallenges = businessData.topChallenges.includes(challenge)
                              ? businessData.topChallenges.filter((c) => c !== challenge)
                              : [...businessData.topChallenges, challenge]
                            updateBusinessData("topChallenges", updatedChallenges)
                          }}
                        >
                          {businessData.topChallenges.includes(challenge) && <CheckCircle className="mr-2 h-4 w-4" />}
                          {challenge}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tilbage
                </Button>
                <Button onClick={handleNext}>
                  Generer analyse
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Virksomhedsanalyse for {businessData.companyName}</CardTitle>
              <CardDescription>
                Baseret på dine indtastede data har vi udarbejdet følgende analyse og anbefalinger
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
                  <TabsTrigger value="overview">Overblik</TabsTrigger>
                  <TabsTrigger value="profitability">Rentabilitet</TabsTrigger>
                  <TabsTrigger value="liquidity">Likviditet</TabsTrigger>
                  <TabsTrigger value="efficiency">Effektivitet</TabsTrigger>
                  <TabsTrigger value="solvency">Soliditet</TabsTrigger>
                  <TabsTrigger value="recommendations">Anbefalinger</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 pt-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Virksomhedsscore</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{businessHealthScore}/100</div>
                        <p className={`text-xs ${healthCategory.color}`}>{healthCategory.category}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Omsætningsvækst</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatPercent(kpis.growth.revenueGrowth)}</div>
                        <p className="text-xs text-muted-foreground">
                          Benchmark: {formatPercent(benchmarks.growth.revenueGrowth)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nettomargin</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatPercent(kpis.profitability.netProfitMargin)}</div>
                        <p className="text-xs text-muted-foreground">
                          Benchmark: {formatPercent(benchmarks.profitability.netProfitMargin)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Likviditetsgrad</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatDecimal(kpis.liquidity.currentRatio)}</div>
                        <p className="text-xs text-muted-foreground">
                          Benchmark: {formatDecimal(benchmarks.liquidity.currentRatio)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="col-span-1">
                      <CardHeader>
                        <CardTitle>Virksomhedsprofil</CardTitle>
                        <CardDescription>Nøgleoplysninger om din virksomhed</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Branche</p>
                            <p className="text-sm text-muted-foreground">
                              {businessData.industry === "manufacturing"
                                ? "Produktion"
                                : businessData.industry === "retail"
                                  ? "Detailhandel"
                                  : businessData.industry === "technology"
                                    ? "Teknologi"
                                    : businessData.industry === "finance"
                                      ? "Finans"
                                      : businessData.industry === "healthcare"
                                        ? "Sundhed"
                                        : businessData.industry === "construction"
                                          ? "Byggeri"
                                          : businessData.industry === "hospitality"
                                            ? "Hotel & Restauration"
                                            : businessData.industry === "professional_services"
                                              ? "Professionelle services"
                                              : businessData.industry === "transportation"
                                                ? "Transport"
                                                : "Andet"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Størrelse</p>
                            <p className="text-sm text-muted-foreground">
                              {businessData.companySize === "micro"
                                ? "Mikro (1-9 ansatte)"
                                : businessData.companySize === "small"
                                  ? "Lille (10-49 ansatte)"
                                  : businessData.companySize === "medium"
                                    ? "Mellemstor (50-249 ansatte)"
                                    : "Stor (250+ ansatte)"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Fase</p>
                            <p className="text-sm text-muted-foreground">
                              {businessData.businessStage === "startup"
                                ? "Opstart"
                                : businessData.businessStage === "growth"
                                  ? "Vækst"
                                  : businessData.businessStage === "mature"
                                    ? "Moden"
                                    : businessData.businessStage === "decline"
                                      ? "Nedgang"
                                      : "Turnaround"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">År i drift</p>
                            <p className="text-sm text-muted-foreground">{businessData.yearsInBusiness} år</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="col-span-1">
                      <CardHeader>
                        <CardTitle>Nøgletal</CardTitle>
                        <CardDescription>Sammenligning med branchebenchmarks</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[180px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="subject" />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} />
                              <Radar name="Virksomhed" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                              <Tooltip />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Resultatoverblik</CardTitle>
                      <CardDescription>Fordeling af omsætning</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Omsætning</p>
                              <p className="text-xl font-bold">{formatCurrency(businessData.currentYear.revenue)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Bruttofortjeneste</p>
                              <p className="text-xl font-bold">
                                {formatCurrency(businessData.currentYear.revenue - businessData.currentYear.cogs)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">EBITDA</p>
                              <p className="text-xl font-bold">{formatCurrency(businessData.currentYear.ebitda)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Nettoindkomst</p>
                              <p className="text-xl font-bold">{formatCurrency(businessData.currentYear.netIncome)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {pieChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="profitability" className="space-y-6 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rentabilitetsanalyse</CardTitle>
                      <CardDescription>Analyse af virksomhedens evne til at generere overskud</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Bruttoavance</h3>
                          <div className="text-2xl font-bold">
                            {formatPercent(kpis.profitability.grossProfitMargin)}
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              Benchmark: {formatPercent(benchmarks.profitability.grossProfitMargin)}
                            </span>
                            <span
                              className={
                                evaluateKPI(
                                  kpis.profitability.grossProfitMargin,
                                  benchmarks.profitability.grossProfitMargin,
                                ).color
                              }
                            >
                              {evaluateKPI(
                                kpis.profitability.grossProfitMargin,
                                benchmarks.profitability.grossProfitMargin,
                              ).status === "excellent" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.profitability.grossProfitMargin,
                                  benchmarks.profitability.grossProfitMargin,
                                ).status === "good" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.profitability.grossProfitMargin,
                                  benchmarks.profitability.grossProfitMargin,
                                ).status === "fair" ? (
                                <HelpCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Driftsmargin</h3>
                          <div className="text-2xl font-bold">
                            {formatPercent(kpis.profitability.operatingProfitMargin)}
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              Benchmark: {formatPercent(benchmarks.profitability.operatingProfitMargin)}
                            </span>
                            <span
                              className={
                                evaluateKPI(
                                  kpis.profitability.operatingProfitMargin,
                                  benchmarks.profitability.operatingProfitMargin,
                                ).color
                              }
                            >
                              {evaluateKPI(
                                kpis.profitability.operatingProfitMargin,
                                benchmarks.profitability.operatingProfitMargin,
                              ).status === "excellent" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.profitability.operatingProfitMargin,
                                  benchmarks.profitability.operatingProfitMargin,
                                ).status === "good" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.profitability.operatingProfitMargin,
                                  benchmarks.profitability.operatingProfitMargin,
                                ).status === "fair" ? (
                                <HelpCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Nettomargin</h3>
                          <div className="text-2xl font-bold">{formatPercent(kpis.profitability.netProfitMargin)}</div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              Benchmark: {formatPercent(benchmarks.profitability.netProfitMargin)}
                            </span>
                            <span
                              className={
                                evaluateKPI(
                                  kpis.profitability.netProfitMargin,
                                  benchmarks.profitability.netProfitMargin,
                                ).color
                              }
                            >
                              {evaluateKPI(kpis.profitability.netProfitMargin, benchmarks.profitability.netProfitMargin)
                                .status === "excellent" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.profitability.netProfitMargin,
                                  benchmarks.profitability.netProfitMargin,
                                ).status === "good" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.profitability.netProfitMargin,
                                  benchmarks.profitability.netProfitMargin,
                                ).status === "fair" ? (
                                <HelpCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Afkast af aktiver (ROA)</h3>
                          <div className="text-2xl font-bold">{formatPercent(kpis.profitability.returnOnAssets)}</div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              Benchmark: {formatPercent(benchmarks.profitability.returnOnAssets)}
                            </span>
                            <span
                              className={
                                evaluateKPI(kpis.profitability.returnOnAssets, benchmarks.profitability.returnOnAssets)
                                  .color
                              }
                            >
                              {evaluateKPI(kpis.profitability.returnOnAssets, benchmarks.profitability.returnOnAssets)
                                .status === "excellent" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.profitability.returnOnAssets,
                                  benchmarks.profitability.returnOnAssets,
                                ).status === "good" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.profitability.returnOnAssets,
                                  benchmarks.profitability.returnOnAssets,
                                ).status === "fair" ? (
                                <HelpCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Egenkapitalforrentning (ROE)</h3>
                          <div className="text-2xl font-bold">{formatPercent(kpis.profitability.returnOnEquity)}</div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              Benchmark: {formatPercent(benchmarks.profitability.returnOnEquity)}
                            </span>
                            <span
                              className={
                                evaluateKPI(kpis.profitability.returnOnEquity, benchmarks.profitability.returnOnEquity)
                                  .color
                              }
                            >
                              {evaluateKPI(kpis.profitability.returnOnEquity, benchmarks.profitability.returnOnEquity)
                                .status === "excellent" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.profitability.returnOnEquity,
                                  benchmarks.profitability.returnOnEquity,
                                ).status === "good" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.profitability.returnOnEquity,
                                  benchmarks.profitability.returnOnEquity,
                                ).status === "fair" ? (
                                <HelpCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">EBITDA-margin</h3>
                          <div className="text-2xl font-bold">{formatPercent(kpis.profitability.ebitdaMargin)}</div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              Benchmark: {formatPercent(benchmarks.profitability.ebitdaMargin)}
                            </span>
                            <span
                              className={
                                evaluateKPI(kpis.profitability.ebitdaMargin, benchmarks.profitability.ebitdaMargin)
                                  .color
                              }
                            >
                              {evaluateKPI(kpis.profitability.ebitdaMargin, benchmarks.profitability.ebitdaMargin)
                                .status === "excellent" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(kpis.profitability.ebitdaMargin, benchmarks.profitability.ebitdaMargin)
                                  .status === "good" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(kpis.profitability.ebitdaMargin, benchmarks.profitability.ebitdaMargin)
                                  .status === "fair" ? (
                                <HelpCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={profitabilityChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis unit="%" />
                            <Tooltip formatter={(value) => [`${value}%`, ""]} />
                            <Legend />
                            <Bar dataKey="Virksomhed" fill="#3b82f6" />
                            <Bar dataKey="Benchmark" fill="#64748b" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="rounded-md bg-blue-50 p-4 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                        <h3 className="text-sm font-medium mb-2">Indsigter og anbefalinger</h3>
                        <p className="text-sm">
                          {kpis.profitability.grossProfitMargin < benchmarks.profitability.grossProfitMargin * 0.8
                            ? "Din bruttoavance er lavere end branchegennemsnittet. Overvej at genforhandle leverandørkontrakter, optimere produktmix eller justere priser."
                            : "Din bruttoavance er på niveau med eller over branchegennemsnittet, hvilket indikerer god prissætning og omkostningsstyring."}
                        </p>
                        <p className="text-sm mt-2">
                          {kpis.profitability.netProfitMargin < benchmarks.profitability.netProfitMargin * 0.8
                            ? "Din nettomargin er lavere end branchegennemsnittet. Fokuser på at reducere driftsomkostninger og optimere forretningsprocesser."
                            : "Din nettomargin er sund sammenlignet med branchegennemsnittet, hvilket indikerer god omkostningsstyring."}
                        </p>
                        <p className="text-sm mt-2">
                          {kpis.profitability.returnOnEquity < benchmarks.profitability.returnOnEquity * 0.8
                            ? "Din egenkapitalforrentning er lavere end branchegennemsnittet. Overvej at optimere kapitalstrukturen eller forbedre driftseffektiviteten."
                            : "Din egenkapitalforrentning er god, hvilket indikerer effektiv udnyttelse af egenkapitalen."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="liquidity" className="space-y-6 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Likviditetsanalyse</CardTitle>
                      <CardDescription>
                        Analyse af virksomhedens evne til at betale kortfristede forpligtelser
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Likviditetsgrad</h3>
                          <div className="text-2xl font-bold">{formatDecimal(kpis.liquidity.currentRatio)}</div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              Benchmark: {formatDecimal(benchmarks.liquidity.currentRatio)}
                            </span>
                            <span
                              className={
                                evaluateKPI(kpis.liquidity.currentRatio, benchmarks.liquidity.currentRatio).color
                              }
                            >
                              {evaluateKPI(kpis.liquidity.currentRatio, benchmarks.liquidity.currentRatio).status ===
                              "excellent" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(kpis.liquidity.currentRatio, benchmarks.liquidity.currentRatio).status ===
                                "good" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(kpis.liquidity.currentRatio, benchmarks.liquidity.currentRatio).status ===
                                "fair" ? (
                                <HelpCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Quick ratio</h3>
                          <div className="text-2xl font-bold">{formatDecimal(kpis.liquidity.quickRatio)}</div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              Benchmark: {formatDecimal(benchmarks.liquidity.quickRatio)}
                            </span>
                            <span
                              className={evaluateKPI(kpis.liquidity.quickRatio, benchmarks.liquidity.quickRatio).color}
                            >
                              {evaluateKPI(kpis.liquidity.quickRatio, benchmarks.liquidity.quickRatio).status ===
                              "excellent" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(kpis.liquidity.quickRatio, benchmarks.liquidity.quickRatio).status ===
                                "good" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(kpis.liquidity.quickRatio, benchmarks.liquidity.quickRatio).status ===
                                "fair" ? (
                                <HelpCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Cash ratio</h3>
                          <div className="text-2xl font-bold">{formatDecimal(kpis.liquidity.cashRatio)}</div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              Benchmark: {formatDecimal(benchmarks.liquidity.cashRatio)}
                            </span>
                            <span
                              className={evaluateKPI(kpis.liquidity.cashRatio, benchmarks.liquidity.cashRatio).color}
                            >
                              {evaluateKPI(kpis.liquidity.cashRatio, benchmarks.liquidity.cashRatio).status ===
                              "excellent" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(kpis.liquidity.cashRatio, benchmarks.liquidity.cashRatio).status ===
                                "good" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(kpis.liquidity.cashRatio, benchmarks.liquidity.cashRatio).status ===
                                "fair" ? (
                                <HelpCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Arbejdskapital</h3>
                          <div className="text-2xl font-bold">{formatCurrency(kpis.liquidity.workingCapital)}</div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Arbejdskapitalratio</h3>
                          <div className="text-2xl font-bold">{formatPercent(kpis.liquidity.workingCapitalRatio)}</div>
                        </div>
                      </div>

                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={liquidityChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Virksomhed" fill="#3b82f6" />
                            <Bar dataKey="Benchmark" fill="#64748b" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="rounded-md bg-blue-50 p-4 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                        <h3 className="text-sm font-medium mb-2">Indsigter og anbefalinger</h3>
                        <p className="text-sm">
                          {kpis.liquidity.currentRatio < 1.0
                            ? "Din likviditetsgrad er under 1,0, hvilket indikerer potentielle likviditetsproblemer. Fokuser på at forbedre arbejdskapitalen ved at reducere kortfristede forpligtelser eller øge omsætningsaktiver."
                            : "Din likviditetsgrad er tilfredsstillende, hvilket indikerer at du har tilstrækkelige aktiver til at dække dine kortfristede forpligtelser."}
                        </p>
                        <p className="text-sm mt-2">
                          {kpis.liquidity.quickRatio < benchmarks.liquidity.quickRatio * 0.8
                            ? "Din quick ratio er lavere end branchegennemsnittet, hvilket kan indikere at du har for meget kapital bundet i varelager. Overvej at optimere lagerstyringen."
                            : "Din quick ratio er på niveau med eller over branchegennemsnittet, hvilket indikerer god likviditet selv uden varelager."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="efficiency" className="space-y-6 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Effektivitetsanalyse</CardTitle>
                      <CardDescription>
                        Analyse af virksomhedens evne til at udnytte sine aktiver og ressourcer effektivt
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Aktivernes omsætningshastighed</h3>
                          <div className="text-2xl font-bold">{formatDecimal(kpis.efficiency.assetTurnover)}</div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              Benchmark: {formatDecimal(benchmarks.efficiency.assetTurnover)}
                            </span>
                            <span
                              className={
                                evaluateKPI(kpis.efficiency.assetTurnover, benchmarks.efficiency.assetTurnover).color
                              }
                            >
                              {evaluateKPI(kpis.efficiency.assetTurnover, benchmarks.efficiency.assetTurnover)
                                .status === "excellent" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(kpis.efficiency.assetTurnover, benchmarks.efficiency.assetTurnover)
                                  .status === "good" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(kpis.efficiency.assetTurnover, benchmarks.efficiency.assetTurnover)
                                  .status === "fair" ? (
                                <HelpCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Lageromsætningshastighed</h3>
                          <div className="text-2xl font-bold">{formatDecimal(kpis.efficiency.inventoryTurnover)}</div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              Benchmark: {formatDecimal(benchmarks.efficiency.inventoryTurnover)}
                            </span>
                            <span
                              className={
                                evaluateKPI(kpis.efficiency.inventoryTurnover, benchmarks.efficiency.inventoryTurnover)
                                  .color
                              }
                            >
                              {evaluateKPI(kpis.efficiency.inventoryTurnover, benchmarks.efficiency.inventoryTurnover)
                                .status === "excellent" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.efficiency.inventoryTurnover,
                                  benchmarks.efficiency.inventoryTurnover,
                                ).status === "good" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.efficiency.inventoryTurnover,
                                  benchmarks.efficiency.inventoryTurnover,
                                ).status === "fair" ? (
                                <HelpCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Debitorormsætningshastighed</h3>
                          <div className="text-2xl font-bold">{formatDecimal(kpis.efficiency.receivablesTurnover)}</div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              Benchmark: {formatDecimal(benchmarks.efficiency.receivablesTurnover)}
                            </span>
                            <span
                              className={
                                evaluateKPI(
                                  kpis.efficiency.receivablesTurnover,
                                  benchmarks.efficiency.receivablesTurnover,
                                ).color
                              }
                            >
                              {evaluateKPI(
                                kpis.efficiency.receivablesTurnover,
                                benchmarks.efficiency.receivablesTurnover,
                              ).status === "excellent" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.efficiency.receivablesTurnover,
                                  benchmarks.efficiency.receivablesTurnover,
                                ).status === "good" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.efficiency.receivablesTurnover,
                                  benchmarks.efficiency.receivablesTurnover,
                                ).status === "fair" ? (
                                <HelpCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Kreditorormsætningshastighed</h3>
                          <div className="text-2xl font-bold">{formatDecimal(kpis.efficiency.payablesTurnover)}</div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              Benchmark: {formatDecimal(benchmarks.efficiency.payablesTurnover)}
                            </span>
                            <span
                              className={
                                evaluateKPI(kpis.efficiency.payablesTurnover, benchmarks.efficiency.payablesTurnover)
                                  .color
                              }
                            >
                              {evaluateKPI(kpis.efficiency.payablesTurnover, benchmarks.efficiency.payablesTurnover)
                                .status === "excellent" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(kpis.efficiency.payablesTurnover, benchmarks.efficiency.payablesTurnover)
                                  .status === "good" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(kpis.efficiency.payablesTurnover, benchmarks.efficiency.payablesTurnover)
                                  .status === "fair" ? (
                                <HelpCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Cash Conversion Cycle</h3>
                          <div className="text-2xl font-bold">{formatDecimal(kpis.efficiency.cashConversionCycle)}</div>
                        </div>
                      </div>

                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={efficiencyChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Virksomhed" fill="#3b82f6" />
                            <Bar dataKey="Benchmark" fill="#64748b" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="rounded-md bg-blue-50 p-4 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                        <h3 className="text-sm font-medium mb-2">Indsigter og anbefalinger</h3>
                        <p className="text-sm">
                          {kpis.efficiency.assetTurnover < benchmarks.efficiency.assetTurnover * 0.8
                            ? "Din aktivernes omsætningshastighed er lavere end branchegennemsnittet, hvilket indikerer at du ikke udnytter dine aktiver effektivt. Overvej at optimere brugen af dine aktiver eller afhænde unødvendige aktiver."
                            : "Din aktivernes omsætningshastighed er på niveau med eller over branchegennemsnittet, hvilket indikerer at du udnytter dine aktiver effektivt."}
                        </p>
                        <p className="text-sm mt-2">
                          {kpis.efficiency.inventoryTurnover < benchmarks.efficiency.inventoryTurnover * 0.8
                            ? "Din lageromsætningshastighed er lavere end branchegennemsnittet, hvilket kan indikere at du har for meget kapital bundet i varelager. Overvej at optimere lagerstyringen."
                            : "Din lageromsætningshastighed er på niveau med eller over branchegennemsnittet, hvilket indikerer god lagerstyring."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="solvency" className="space-y-6 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Soliditetsanalyse</CardTitle>
                      <CardDescription>
                        Analyse af virksomhedens evne til at betale sine langsigtede forpligtelser
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Gæld/Egenkapital</h3>
                          <div className="text-2xl font-bold">{formatDecimal(kpis.solvency.debtToEquityRatio)}</div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              Benchmark: {formatDecimal(benchmarks.solvency.debtToEquityRatio)}
                            </span>
                            <span
                              className={
                                evaluateKPI(
                                  kpis.solvency.debtToEquityRatio,
                                  benchmarks.solvency.debtToEquityRatio,
                                  true,
                                ).color
                              }
                            >
                              {evaluateKPI(kpis.solvency.debtToEquityRatio, benchmarks.solvency.debtToEquityRatio, true)
                                .status === "excellent" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.solvency.debtToEquityRatio,
                                  benchmarks.solvency.debtToEquityRatio,
                                  true,
                                ).status === "good" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.solvency.debtToEquityRatio,
                                  benchmarks.solvency.debtToEquityRatio,
                                  true,
                                ).status === "fair" ? (
                                <HelpCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Gæld/Aktiver</h3>
                          <div className="text-2xl font-bold">{formatDecimal(kpis.solvency.debtToAssetsRatio)}</div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              Benchmark: {formatDecimal(benchmarks.solvency.debtToAssetsRatio)}
                            </span>
                            <span
                              className={
                                evaluateKPI(
                                  kpis.solvency.debtToAssetsRatio,
                                  benchmarks.solvency.debtToAssetsRatio,
                                  true,
                                ).color
                              }
                            >
                              {evaluateKPI(kpis.solvency.debtToAssetsRatio, benchmarks.solvency.debtToAssetsRatio, true)
                                .status === "excellent" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.solvency.debtToAssetsRatio,
                                  benchmarks.solvency.debtToAssetsRatio,
                                  true,
                                ).status === "good" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.solvency.debtToAssetsRatio,
                                  benchmarks.solvency.debtToAssetsRatio,
                                  true,
                                ).status === "fair" ? (
                                <HelpCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Renteafdækning</h3>
                          <div className="text-2xl font-bold">{formatDecimal(kpis.solvency.interestCoverageRatio)}</div>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              Benchmark: {formatDecimal(benchmarks.solvency.interestCoverageRatio)}
                            </span>
                            <span
                              className={
                                evaluateKPI(
                                  kpis.solvency.interestCoverageRatio,
                                  benchmarks.solvency.interestCoverageRatio,
                                ).color
                              }
                            >
                              {evaluateKPI(
                                kpis.solvency.interestCoverageRatio,
                                benchmarks.solvency.interestCoverageRatio,
                              ).status === "excellent" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.solvency.interestCoverageRatio,
                                  benchmarks.solvency.interestCoverageRatio,
                                ).status === "good" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : evaluateKPI(
                                  kpis.solvency.interestCoverageRatio,
                                  benchmarks.solvency.interestCoverageRatio,
                                ).status === "fair" ? (
                                <HelpCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={solvencyChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Virksomhed" fill="#3b82f6" />
                            <Bar dataKey="Benchmark" fill="#64748b" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="rounded-md bg-blue-50 p-4 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                        <h3 className="text-sm font-medium mb-2">Indsigter og anbefalinger</h3>
                        <p className="text-sm">
                          {kpis.solvency.debtToEquityRatio > benchmarks.solvency.debtToEquityRatio * 1.2
                            ? "Din gæld i forhold til egenkapital er højere end branchegennemsnittet, hvilket indikerer at du har en høj gældsætning. Overvej at reducere gælden eller øge egenkapitalen."
                            : "Din gæld i forhold til egenkapital er på niveau med eller under branchegennemsnittet, hvilket indikerer en sund kapitalstruktur."}
                        </p>
                        <p className="text-sm mt-2">
                          {kpis.solvency.interestCoverageRatio < benchmarks.solvency.interestCoverageRatio * 0.8
                            ? "Din renteafdækningsgrad er lavere end branchegennemsnittet, hvilket kan indikere at du har svært ved at betale dine renteomkostninger. Overvej at øge indtjeningen eller reducere gælden."
                            : "Din renteafdækningsgrad er på niveau med eller over branchegennemsnittet, hvilket indikerer at du har god evne til at betale dine renteomkostninger."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-6 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Anbefalinger</CardTitle>
                      <CardDescription>
                        Baseret på din virksomheds data har vi udarbejdet følgende anbefalinger
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {recommendations.length > 0 ? (
                        <div className="space-y-4">
                          {recommendations.map((recommendation, index) => (
                            <div key={index} className="rounded-md border p-4">
                              <h3 className="text-sm font-medium">{recommendation.title}</h3>
                              <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                              <p className="text-xs mt-2">
                                Prioritet:{" "}
                                {recommendation.priority === "high"
                                  ? "Høj"
                                  : recommendation.priority === "medium"
                                    ? "Medium"
                                    : "Lav"}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Ingen specifikke anbefalinger på nuværende tidspunkt.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                Rediger data
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-8">
            <AIRecommendation data={aiRecommendation} />
          </div>
        </div>
      )}
    </div>
  )
}
