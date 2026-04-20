"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, AlertTriangle, CheckCircle, BarChart4, DollarSign, Target, Shield } from "lucide-react"

// Types for the business advisor
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

type BusinessSize = "micro" | "small" | "medium" | "large"

type BusinessStage = "startup" | "growth" | "mature" | "decline" | "turnaround"

type CompetitivePosition = "leader" | "challenger" | "follower" | "niche"

type FinancialHealth = "excellent" | "good" | "fair" | "poor" | "critical"

type StrategicFocus =
  | "growth"
  | "profitability"
  | "innovation"
  | "efficiency"
  | "customer_retention"
  | "market_expansion"
  | "cost_reduction"
  | "digital_transformation"

type BusinessModel =
  | "product"
  | "service"
  | "subscription"
  | "marketplace"
  | "freemium"
  | "franchise"
  | "direct_sales"
  | "ecommerce"
  | "hybrid"

type FinancialData = {
  revenue: number
  cogs: number
  grossProfit: number
  operatingExpenses: number
  ebitda: number
  depreciation: number
  amortization: number
  ebit: number
  interestExpense: number
  taxExpense: number
  netIncome: number

  // Balance sheet
  totalAssets: number
  currentAssets: number
  cash: number
  accountsReceivable: number
  inventory: number
  otherCurrentAssets: number
  nonCurrentAssets: number
  propertyPlantEquipment: number
  intangibleAssets: number
  otherNonCurrentAssets: number

  totalLiabilities: number
  currentLiabilities: number
  accountsPayable: number
  shortTermDebt: number
  otherCurrentLiabilities: number
  nonCurrentLiabilities: number
  longTermDebt: number
  otherNonCurrentLiabilities: number

  equity: number
  retainedEarnings: number

  // Cash flow
  operatingCashFlow: number
  investingCashFlow: number
  financingCashFlow: number
  freeCashFlow: number
}

type OperationalData = {
  employees: number
  customerCount: number
  customerRetentionRate: number
  customerAcquisitionCost: number
  lifetimeValue: number
  averageOrderValue: number
  conversionRate: number

  // Efficiency metrics
  inventoryTurnover: number
  daysInventoryOutstanding: number
  daysPayableOutstanding: number
  daysReceivableOutstanding: number
  cashConversionCycle: number

  // Productivity metrics
  revenuePerEmployee: number
  profitPerEmployee: number
  employeeTurnoverRate: number

  // Market metrics
  marketShare: number
  marketGrowthRate: number

  // Digital metrics
  websiteTraffic: number
  socialMediaFollowers: number
  emailSubscribers: number
}

type MarketData = {
  totalMarketSize: number
  marketGrowthRate: number
  competitorCount: number
  marketConcentration: number
  entryBarriers: "low" | "medium" | "high"
  supplierPower: "low" | "medium" | "high"
  buyerPower: "low" | "medium" | "high"
  substituteThreat: "low" | "medium" | "high"
  competitiveRivalry: "low" | "medium" | "high"
}

type BusinessAnalysis = {
  // Basic information
  companyName: string
  industry: Industry
  companySize: BusinessSize
  businessStage: BusinessStage
  yearsInBusiness: number
  businessModel: BusinessModel
  competitivePosition: CompetitivePosition
  strategicFocus: StrategicFocus

  // Financial data
  currentYear: FinancialData
  previousYear: FinancialData

  // Operational data
  operationalData: OperationalData

  // Market data
  marketData: MarketData

  // Goals and challenges
  primaryGoals: string[]
  topChallenges: string[]

  // Calculated KPIs and metrics
  financialMetrics: {
    profitability: {
      grossProfitMargin: number
      operatingProfitMargin: number
      netProfitMargin: number
      ebitdaMargin: number
      returnOnAssets: number
      returnOnEquity: number
      returnOnInvestedCapital: number
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
      fixedAssetTurnover: number
      operatingCycle: number
    }
    solvency: {
      debtToEquityRatio: number
      debtToAssetsRatio: number
      interestCoverageRatio: number
      debtServiceCoverageRatio: number
      equityMultiplier: number
      financialLeverage: number
    }
    growth: {
      revenueGrowth: number
      netIncomeGrowth: number
      ebitdaGrowth: number
      assetGrowth: number
      equityGrowth: number
    }
    valuation: {
      enterpriseValue: number
      evToEbitda: number
      evToRevenue: number
      priceToEarnings: number
      priceToBookValue: number
      priceToSales: number
      discountedCashFlow: number
    }
  }

  // Analysis results
  swotAnalysis: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }

  pestelAnalysis: {
    political: string[]
    economic: string[]
    social: string[]
    technological: string[]
    environmental: string[]
    legal: string[]
  }

  portersFiveForces: {
    competitiveRivalry: {
      score: number
      factors: string[]
    }
    supplierPower: {
      score: number
      factors: string[]
    }
    buyerPower: {
      score: number
      factors: string[]
    }
    threatOfSubstitutes: {
      score: number
      factors: string[]
    }
    threatOfNewEntrants: {
      score: number
      factors: string[]
    }
  }

  businessModelCanvas: {
    keyPartners: string[]
    keyActivities: string[]
    keyResources: string[]
    valuePropositions: string[]
    customerRelationships: string[]
    channels: string[]
    customerSegments: string[]
    costStructure: string[]
    revenueStreams: string[]
  }

  // Recommendations
  strategicRecommendations: {
    category: string
    title: string
    description: string
    impact: "high" | "medium" | "low"
    effort: "high" | "medium" | "low"
    timeframe: "short" | "medium" | "long"
    priority: "critical" | "high" | "medium" | "low"
    steps: string[]
  }[]

  tacticalRecommendations: {
    category: string
    title: string
    description: string
    impact: "high" | "medium" | "low"
    effort: "high" | "medium" | "low"
    timeframe: "short" | "medium" | "long"
    priority: "critical" | "high" | "medium" | "low"
    steps: string[]
  }[]

  // Scenarios
  scenarios: {
    pessimistic: {
      description: string
      revenueGrowth: number
      profitMargin: number
      cashFlow: number
      valuation: number
    }
    realistic: {
      description: string
      revenueGrowth: number
      profitMargin: number
      cashFlow: number
      valuation: number
    }
    optimistic: {
      description: string
      revenueGrowth: number
      profitMargin: number
      cashFlow: number
      valuation: number
    }
  }

  // Overall assessment
  overallScore: number
  financialHealthAssessment: FinancialHealth
  growthPotentialAssessment: "high" | "medium" | "low"
  competitivePositionAssessment: "strong" | "moderate" | "weak"
  innovationCapacityAssessment: "high" | "medium" | "low"
  riskAssessment: "low" | "moderate" | "high" | "severe"
}

// Default data for demonstration
const DEFAULT_BUSINESS_ANALYSIS: BusinessAnalysis = {
  companyName: "Eksempel A/S",
  industry: "technology",
  companySize: "small",
  businessStage: "growth",
  yearsInBusiness: 5,
  businessModel: "subscription",
  competitivePosition: "challenger",
  strategicFocus: "growth",

  currentYear: {
    revenue: 12000000,
    cogs: 4800000,
    grossProfit: 7200000,
    operatingExpenses: 5400000,
    ebitda: 1800000,
    depreciation: 300000,
    amortization: 200000,
    ebit: 1300000,
    interestExpense: 200000,
    taxExpense: 275000,
    netIncome: 825000,

    totalAssets: 10000000,
    currentAssets: 4000000,
    cash: 1500000,
    accountsReceivable: 1500000,
    inventory: 500000,
    otherCurrentAssets: 500000,
    nonCurrentAssets: 6000000,
    propertyPlantEquipment: 3000000,
    intangibleAssets: 2500000,
    otherNonCurrentAssets: 500000,

    totalLiabilities: 6000000,
    currentLiabilities: 2500000,
    accountsPayable: 1000000,
    shortTermDebt: 1000000,
    otherCurrentLiabilities: 500000,
    nonCurrentLiabilities: 3500000,
    longTermDebt: 3000000,
    otherNonCurrentLiabilities: 500000,

    equity: 4000000,
    retainedEarnings: 2500000,

    operatingCashFlow: 1500000,
    investingCashFlow: -1000000,
    financingCashFlow: -300000,
    freeCashFlow: 500000,
  },

  previousYear: {
    revenue: 10000000,
    cogs: 4200000,
    grossProfit: 5800000,
    operatingExpenses: 4600000,
    ebitda: 1200000,
    depreciation: 250000,
    amortization: 150000,
    ebit: 800000,
    interestExpense: 180000,
    taxExpense: 155000,
    netIncome: 465000,

    totalAssets: 8500000,
    currentAssets: 3200000,
    cash: 1200000,
    accountsReceivable: 1300000,
    inventory: 400000,
    otherCurrentAssets: 300000,
    nonCurrentAssets: 5300000,
    propertyPlantEquipment: 2800000,
    intangibleAssets: 2000000,
    otherNonCurrentAssets: 500000,

    totalLiabilities: 5300000,
    currentLiabilities: 2200000,
    accountsPayable: 900000,
    shortTermDebt: 900000,
    otherCurrentLiabilities: 400000,
    nonCurrentLiabilities: 3100000,
    longTermDebt: 2700000,
    otherNonCurrentLiabilities: 400000,

    equity: 3200000,
    retainedEarnings: 1800000,

    operatingCashFlow: 1100000,
    investingCashFlow: -800000,
    financingCashFlow: -200000,
    freeCashFlow: 300000,
  },

  operationalData: {
    employees: 45,
    customerCount: 350,
    customerRetentionRate: 0.85,
    customerAcquisitionCost: 5000,
    lifetimeValue: 50000,
    averageOrderValue: 25000,
    conversionRate: 0.15,

    inventoryTurnover: 8,
    daysInventoryOutstanding: 45,
    daysPayableOutstanding: 60,
    daysReceivableOutstanding: 45,
    cashConversionCycle: 30,

    revenuePerEmployee: 266667,
    profitPerEmployee: 18333,
    employeeTurnoverRate: 0.12,

    marketShare: 0.05,
    marketGrowthRate: 0.15,

    websiteTraffic: 50000,
    socialMediaFollowers: 15000,
    emailSubscribers: 8000,
  },

  marketData: {
    totalMarketSize: 240000000,
    marketGrowthRate: 0.15,
    competitorCount: 12,
    marketConcentration: 0.65,
    entryBarriers: "medium",
    supplierPower: "low",
    buyerPower: "medium",
    substituteThreat: "medium",
    competitiveRivalry: "high",
  },

  primaryGoals: [
    "Øge omsætning med 25% inden for 2 år",
    "Forbedre kundefastholdelse til 90%",
    "Lancere 2 nye produktlinjer",
    "Ekspandere til 2 nye markeder",
  ],

  topChallenges: [
    "Stigende konkurrence fra større aktører",
    "Vanskeligheder med at tiltrække specialiseret talent",
    "Stigende kundeerhvervelsesomkostninger",
    "Behov for teknologisk modernisering",
  ],

  financialMetrics: {
    profitability: {
      grossProfitMargin: 0.6,
      operatingProfitMargin: 0.15,
      netProfitMargin: 0.0688,
      ebitdaMargin: 0.15,
      returnOnAssets: 0.0825,
      returnOnEquity: 0.2063,
      returnOnInvestedCapital: 0.1857,
    },
    liquidity: {
      currentRatio: 1.6,
      quickRatio: 1.4,
      cashRatio: 0.6,
      workingCapital: 1500000,
      workingCapitalRatio: 0.125,
    },
    efficiency: {
      assetTurnover: 1.2,
      inventoryTurnover: 8,
      receivablesTurnover: 8,
      payablesTurnover: 4.8,
      cashConversionCycle: 30,
      fixedAssetTurnover: 4,
      operatingCycle: 90,
    },
    solvency: {
      debtToEquityRatio: 1.5,
      debtToAssetsRatio: 0.6,
      interestCoverageRatio: 6.5,
      debtServiceCoverageRatio: 3.2,
      equityMultiplier: 2.5,
      financialLeverage: 1.5,
    },
    growth: {
      revenueGrowth: 0.2,
      netIncomeGrowth: 0.7742,
      ebitdaGrowth: 0.5,
      assetGrowth: 0.1765,
      equityGrowth: 0.25,
    },
    valuation: {
      enterpriseValue: 15000000,
      evToEbitda: 8.33,
      evToRevenue: 1.25,
      priceToEarnings: 12,
      priceToBookValue: 2.5,
      priceToSales: 0.83,
      discountedCashFlow: 16500000,
    },
  },

  swotAnalysis: {
    strengths: [
      "Stærk produktinnovation og udviklingsteam",
      "Høj kundetilfredshed og loyalitet (NPS score på 65)",
      "Skalerbar forretningsmodel med høje bruttomarginaler",
      "Stærk virksomhedskultur med lav medarbejderomsætning",
    ],
    weaknesses: [
      "Begrænset markedsandel sammenlignet med større konkurrenter",
      "Afhængighed af få nøglekunder (top 5 udgør 35% af omsætningen)",
      "Begrænsede ressourcer til markedsføring og salg",
      "Teknologisk gæld i kernesystemer",
    ],
    opportunities: [
      "Voksende markedsstørrelse med 15% årligt",
      "Mulighed for international ekspansion",
      "Potentiale for strategiske partnerskaber",
      "Nye produktlinjer til komplementære markeder",
    ],
    threats: [
      "Intensiveret konkurrence fra større aktører med flere ressourcer",
      "Hurtig teknologisk udvikling kræver konstante investeringer",
      "Potentielle regulatoriske ændringer",
      "Økonomisk usikkerhed påvirker kunders investeringsvillighed",
    ],
  },

  pestelAnalysis: {
    political: [
      "Stabil politisk situation i primære markeder",
      "Potentielle ændringer i erhvervsstøtteordninger",
      "Øget fokus på dataregulering",
    ],
    economic: [
      "Moderat økonomisk vækst forventes",
      "Stigende renter kan påvirke investeringer",
      "Valutaudsving påvirker internationale operationer",
    ],
    social: [
      "Øget fokus på bæredygtighed og social ansvarlighed",
      "Ændrede arbejdsmønstre efter COVID-19",
      "Demografiske ændringer i målgruppen",
    ],
    technological: [
      "Hurtig udvikling inden for AI og automatisering",
      "Øget cloud-adoption i branchen",
      "Cybersikkerhed bliver stadig vigtigere",
    ],
    environmental: [
      "Strengere miljøkrav til produkter og processer",
      "Muligheder inden for grøn omstilling",
      "Klimaforandringer påvirker forsyningskæder",
    ],
    legal: [
      "Nye databeskyttelsesregler under implementering",
      "Ændringer i kontraktlovgivning",
      "Intellektuelle ejendomsrettigheder under pres",
    ],
  },

  portersFiveForces: {
    competitiveRivalry: {
      score: 4,
      factors: [
        "Mange konkurrenter af samme størrelse",
        "Moderat markedsvækst reducerer rivaliseringen",
        "Høje skifteomkostninger for kunder",
      ],
    },
    supplierPower: {
      score: 2,
      factors: [
        "Mange alternative leverandører tilgængelige",
        "Lave skifteomkostninger for leverandører",
        "Leverandører er ikke integreret fremad",
      ],
    },
    buyerPower: {
      score: 3,
      factors: [
        "Moderate koncentration af købere",
        "Produktdifferentiering reducerer købers magt",
        "Høje skifteomkostninger for købere",
      ],
    },
    threatOfSubstitutes: {
      score: 3,
      factors: [
        "Få direkte substitutter",
        "Høje skifteomkostninger",
        "God pris-performance ratio sammenlignet med substitutter",
      ],
    },
    threatOfNewEntrants: {
      score: 2,
      factors: ["Moderate adgangsbarrierer", "Betydelige kapitalkrav", "Stærke etablerede brands og kundeloyalitet"],
    },
  },

  businessModelCanvas: {
    keyPartners: ["Teknologileverandører", "Distributionspartnere", "Konsulentnetværk", "Forskningsinstitutioner"],
    keyActivities: ["Produktudvikling", "Kundesupport", "Salg og marketing", "Kvalitetssikring"],
    keyResources: ["Teknologisk platform", "Intellektuel ejendom", "Specialiseret personale", "Kundedata og indsigter"],
    valuePropositions: [
      "Øget effektivitet og produktivitet",
      "Reducerede driftsomkostninger",
      "Forbedret beslutningstagning",
      "Brugervenlig og intuitiv løsning",
    ],
    customerRelationships: [
      "Dedikerede account managers",
      "Selvbetjeningsportal",
      "Regelmæssige check-ins",
      "Kundesuccesprogram",
    ],
    channels: ["Direkte salg", "Online platform", "Partnernetværk", "Branchekonferencer"],
    customerSegments: [
      "Mellemstore virksomheder",
      "Teknologivirksomheder",
      "Professionelle servicevirksomheder",
      "Produktionsvirksomheder",
    ],
    costStructure: [
      "Personaleomkostninger (60%)",
      "Teknologiinfrastruktur (15%)",
      "Salg og marketing (15%)",
      "Administration og overhead (10%)",
    ],
    revenueStreams: [
      "Abonnementsindtægter (70%)",
      "Implementeringsgebyrer (15%)",
      "Konsulentydelser (10%)",
      "Uddannelse og certificering (5%)",
    ],
  },

  strategicRecommendations: [
    {
      category: "Vækststrategi",
      title: "Ekspansion til nye markeder",
      description:
        "Udnyt den eksisterende produktplatform til at ekspandere til to nye geografiske markeder inden for de næste 18 måneder.",
      impact: "high",
      effort: "high",
      timeframe: "medium",
      priority: "high",
      steps: [
        "Gennemfør markedsanalyse for at identificere de mest lovende markeder",
        "Udvikl en go-to-market strategi for hvert marked",
        "Etabler lokale partnerskaber for at accelerere indtrængning",
        "Tilpas produkt og marketing til lokale behov",
        "Ansæt nøglepersonale med lokal markedsviden",
      ],
    },
    {
      category: "Produktstrategi",
      title: "Udvikling af komplementære produktlinjer",
      description:
        "Udvid produktporteføljen med to nye produktlinjer, der komplementerer den eksisterende løsning og øger kundens livstidsværdi.",
      impact: "high",
      effort: "medium",
      timeframe: "medium",
      priority: "high",
      steps: [
        "Gennemfør kundeundersøgelser for at identificere uopfyldte behov",
        "Prioriter produktideer baseret på markedspotentiale og strategisk fit",
        "Udvikl MVP (Minimum Viable Product) for de højest prioriterede ideer",
        "Test med nøglekunder og indsaml feedback",
        "Skalér succesfulde produkter til fuld lancering",
      ],
    },
    {
      category: "Operationel Excellence",
      title: "Implementering af automatisering og AI",
      description:
        "Implementer automatisering og AI-teknologier for at forbedre operationel effektivitet og reducere omkostninger.",
      impact: "medium",
      effort: "medium",
      timeframe: "medium",
      priority: "medium",
      steps: [
        "Identificer processer med højt automatiseringspotentiale",
        "Evaluér og vælg passende teknologiløsninger",
        "Implementer pilotprojekter for at validere ROI",
        "Skalér succesfulde initiativer på tværs af organisationen",
        "Træn personale i nye processer og teknologier",
      ],
    },
  ],

  tacticalRecommendations: [
    {
      category: "Kundefastholdelse",
      title: "Implementering af proaktivt kundesuccesprogram",
      description:
        "Udvikl og implementer et struktureret kundesuccesprogram for at øge kundefastholdelse og ekspandere eksisterende kundeforhold.",
      impact: "high",
      effort: "medium",
      timeframe: "short",
      priority: "critical",
      steps: [
        "Segmenter kunderne baseret på værdi og potentiale",
        "Definer succes-metrics for hver kundesegment",
        "Implementer regelmæssige sundhedstjek og reviewmøder",
        "Udvikl eskaleringsprocesser for kunder i risiko",
        "Etabler et formelt upsell/cross-sell program",
      ],
    },
    {
      category: "Salg & Marketing",
      title: "Optimering af kundeerhvervelsesprocessen",
      description:
        "Optimer salgs- og marketingprocesser for at reducere kundeerhvervelsesomkostninger og forkorte salgscyklussen.",
      impact: "medium",
      effort: "medium",
      timeframe: "short",
      priority: "high",
      steps: [
        "Analysér nuværende konverteringsrater gennem salgstragten",
        "Identificer flaskehalse og forbedringsmuligheder",
        "Implementer lead scoring og automatisering",
        "Optimér salgsmaterialer og præsentationer",
        "Træn salgsteamet i nye processer og teknikker",
      ],
    },
    {
      category: "Talent & Organisation",
      title: "Udvikling af talentpipeline",
      description:
        "Etabler en robust talentpipeline for at sikre adgang til kritiske kompetencer og understøtte vækstambitioner.",
      impact: "medium",
      effort: "medium",
      timeframe: "medium",
      priority: "medium",
      steps: [
        "Identificer kritiske roller og kompetencer for fremtidig vækst",
        "Udvikl partnerskaber med uddannelsesinstitutioner",
        "Implementer et struktureret praktik- og graduate program",
        "Forbedre employer branding og rekrutteringsprocesser",
        "Etabler interne udviklings- og mentorprogrammer",
      ],
    },
  ],

  scenarios: {
    pessimistic: {
      description: "Øget konkurrence og økonomisk afmatning fører til lavere vækst og pres på marginer",
      revenueGrowth: 0.05,
      profitMargin: 0.05,
      cashFlow: 300000,
      valuation: 12000000,
    },
    realistic: {
      description: "Fortsat vækst i linje med markedet og stabile marginer",
      revenueGrowth: 0.15,
      profitMargin: 0.08,
      cashFlow: 800000,
      valuation: 16000000,
    },
    optimistic: {
      description: "Succesfuld produktlancering og markedsekspansion driver accelereret vækst",
      revenueGrowth: 0.25,
      profitMargin: 0.12,
      cashFlow: 1500000,
      valuation: 22000000,
    },
  },

  overallScore: 72,
  financialHealthAssessment: "good",
  growthPotentialAssessment: "high",
  competitivePositionAssessment: "moderate",
  innovationCapacityAssessment: "high",
  riskAssessment: "moderate",
}

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatPercent = (value: number) => {
  return new Intl.NumberFormat("da-DK", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}

const formatDecimal = (value: number) => {
  return new Intl.NumberFormat("da-DK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Color constants
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"]

export function BusinessAdvisor() {
  const [isLoading, setIsLoading] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(1)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysis, setAnalysis] = useState<null | {
    score: number
    category: string
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    recommendations: string[]
  }>(null)

  // Handle analysis start
  const handleStartAnalysis = () => {
    setIsLoading(true)
    setAnalysisStep(1)
    setAnalysisProgress(0)

    // Simulate analysis process with multiple steps
    const totalSteps = 5
    const stepDuration = 1000 // milliseconds per step

    const runAnalysis = (step: number) => {
      if (step <= totalSteps) {
        setAnalysisStep(step)
        setAnalysisProgress((step / totalSteps) * 100)

        setTimeout(() => {
          runAnalysis(step + 1)
        }, stepDuration)
      } else {
        // Analysis complete
        setIsLoading(false)
        setAnalysisComplete(true)
        setAnalysis({
          score: 72,
          category: "God",
          strengths: [
            "Solid bruttoavance på 40%",
            "God likviditetsgrad på 1.5",
            "Stabil kundebase med høj fastholdelsesrate",
            "Effektiv driftsmodel med skalerbarhed",
          ],
          weaknesses: [
            "Lavere aktivomsætningshastighed end branchegennemsnit",
            "Høj gæld i forhold til egenkapital",
            "Stigende driftsomkostninger",
            "Begrænset digital tilstedeværelse",
          ],
          opportunities: [
            "Potentiale for ekspansion til nye markeder",
            "Mulighed for at optimere lagerstyring",
            "Digitalisering af forretningsprocesser",
            "Strategiske partnerskaber med leverandører",
          ],
          recommendations: [
            "Fokuser på at reducere driftsomkostninger med 10-15%",
            "Overvej at restrukturere gæld for at forbedre kapitalstruktur",
            "Implementer et lagerstyringssystem for at reducere bundet kapital",
            "Udvikl en digital strategi for at øge effektivitet og kundeengagement",
            "Investér i medarbejderudvikling for at øge produktivitet",
          ],
        })
      }
    }

    // Start the analysis process
    runAnalysis(1)
  }

  // Handle reset
  const handleReset = () => {
    setAnalysisComplete(false)
    setAnalysis(null)
  }

  // Render analysis steps
  const renderAnalysisStep = () => {
    switch (analysisStep) {
      case 1:
        return "Indsamler og analyserer finansielle data..."
      case 2:
        return "Beregner nøgletal og benchmarks..."
      case 3:
        return "Udfører strategisk analyse..."
      case 4:
        return "Genererer anbefalinger..."
      case 5:
        return "Færdiggør rapport..."
      default:
        return "Analyserer..."
    }
  }

  return (
    <div className="space-y-6">
      {!analysisComplete ? (
        <Card>
          <CardHeader>
            <CardTitle>Avanceret Virksomhedsanalyse</CardTitle>
            <CardDescription>
              Få en dybdegående analyse af din virksomheds finansielle sundhed, strategiske position og vækstmuligheder
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isLoading ? (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="rounded-lg border p-4 flex flex-col items-center text-center">
                    <BarChart4 className="h-10 w-10 mb-3 text-blue-500" />
                    <h3 className="font-medium text-lg">Finansiel Analyse</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Omfattende analyse af nøgletal, rentabilitet, likviditet, soliditet og værdiansættelse
                    </p>
                  </div>

                  <div className="rounded-lg border p-4 flex flex-col items-center text-center">
                    <Target className="h-10 w-10 mb-3 text-green-500" />
                    <h3 className="font-medium text-lg">Strategisk Analyse</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      SWOT, PESTEL, Porters Five Forces og Business Model Canvas analyse
                    </p>
                  </div>

                  <div className="rounded-lg border p-4 flex flex-col items-center text-center">
                    <TrendingUp className="h-10 w-10 mb-3 text-amber-500" />
                    <h3 className="font-medium text-lg">Handlingsorienterede Anbefalinger</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Konkrete strategiske og taktiske anbefalinger med implementeringsplan
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-4 mt-6">
                  <h3 className="font-medium text-lg mb-4">Hvad får du?</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm">Komplet finansiel sundhedstjek med over 30 nøgletal</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm">Benchmarking mod branchegennemsnit</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm">Værdiansættelse med multiple metoder</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm">Dybdegående strategisk analyse</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm">Scenarieanalyse (pessimistisk, realistisk, optimistisk)</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm">Prioriterede anbefalinger med implementeringsplan</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-full max-w-md">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium">{renderAnalysisStep()}</span>
                    <span className="text-sm font-medium">{Math.round(analysisProgress)}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                  <div className="mt-8 flex justify-center">
                    <div className="animate-pulse flex space-x-4">
                      <div className="h-12 w-12 rounded-full bg-blue-400"></div>
                      <div className="h-12 w-12 rounded-full bg-blue-400"></div>
                      <div className="h-12 w-12 rounded-full bg-blue-400"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartAnalysis} disabled={isLoading} className="w-full">
              {isLoading ? "Analyserer..." : "Start Avanceret Analyse"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Virksomhedsanalyse</CardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">{analysis?.score}/100</span>
                <span className="text-green-500 font-medium">{analysis?.category}</span>
              </div>
            </div>
            <CardDescription>Baseret på din virksomheds data har vi udarbejdet følgende analyse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overblik</TabsTrigger>
                <TabsTrigger value="strengths">Styrker</TabsTrigger>
                <TabsTrigger value="weaknesses">Svagheder</TabsTrigger>
                <TabsTrigger value="recommendations">Anbefalinger</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Finansiel Sundhed</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analysis?.category}</div>
                      <p className="text-xs text-muted-foreground mt-1">Baseret på finansielle nøgletal</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Vækstpotentiale</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Højt</div>
                      <p className="text-xs text-muted-foreground mt-1">15% årlig vækst mulig</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Konkurrenceposition</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Moderat</div>
                      <p className="text-xs text-muted-foreground mt-1">5% markedsandel</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Risikoprofil</CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Moderat</div>
                      <p className="text-xs text-muted-foreground mt-1">Balanceret risiko/afkast</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-blue-50 p-4 rounded-md dark:bg-blue-900/20">
                  <h3 className="text-lg font-medium mb-2">Overordnet vurdering</h3>
                  <p className="text-sm">
                    Din virksomhed viser en solid finansiel performance med god rentabilitet og likviditet. Der er
                    identificeret flere muligheder for optimering, særligt inden for omkostningsstyring og
                    digitalisering. Virksomheden har et godt fundament for fremtidig vækst, men bør adressere den
                    relativt høje gældsætning for at reducere den finansielle risiko.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="strengths" className="pt-4">
                <div>
                  <h3 className="text-lg font-medium flex items-center mb-4">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Styrker
                  </h3>
                  <ul className="space-y-3">
                    {analysis?.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start bg-green-50 p-3 rounded-md dark:bg-green-900/20">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500 mt-0.5 shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium flex items-center mb-4">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                    Muligheder
                  </h3>
                  <ul className="space-y-3">
                    {analysis?.opportunities.map((opportunity, i) => (
                      <li key={i} className="flex items-start bg-blue-50 p-3 rounded-md dark:bg-blue-900/20">
                        <TrendingUp className="h-5 w-5 mr-2 text-blue-500 mt-0.5 shrink-0" />
                        <span>{opportunity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="weaknesses" className="pt-4">
                <div>
                  <h3 className="text-lg font-medium flex items-center mb-4">
                    <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                    Svagheder
                  </h3>
                  <ul className="space-y-3">
                    {analysis?.weaknesses.map((weakness, i) => (
                      <li key={i} className="flex items-start bg-amber-50 p-3 rounded-md dark:bg-amber-900/20">
                        <AlertTriangle className="h-5 w-5 mr-2 text-amber-500 mt-0.5 shrink-0" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="pt-4">
                <div className="bg-blue-50 p-4 rounded-md dark:bg-blue-900/20">
                  <h3 className="text-lg font-medium mb-4">Anbefalinger</h3>
                  <ul className="space-y-3">
                    {analysis?.recommendations.map((recommendation, i) => (
                      <li key={i} className="flex items-start">
                        <span className="font-medium mr-2">{i + 1}.</span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleReset} className="w-full">
              Start ny analyse
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
