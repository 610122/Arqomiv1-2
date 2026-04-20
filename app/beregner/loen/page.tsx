"use client"

import { useMemo, useState, useEffect } from "react"
import { AIRecommendation } from "@/components/ai-recommendation"
import { analyzeLoen } from "@/lib/ai-engines"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Calculator,
  TrendingUp,
  Lightbulb,
  DollarSign,
  Clock,
  Percent,
  Briefcase,
  LineChart,
  Shield,
  PiggyBank,
  MapPin,
  Car,
  Home,
  Hammer,
  Users,
  CreditCard,
  Plus,
  Minus,
  Download,
  BarChart3,
  Building,
  Coins,
  FileText,
} from "lucide-react"
import { CalculatorTracker } from "@/components/calculator-tracker"
import { InvestmentStrategies } from "@/components/investment-strategies"

// Kommuneskattedata (forenklet - i virkeligheden ville dette komme fra en database)
const municipalityTaxRates = [
  { name: "København", rate: 24.5 },
  { name: "Aarhus", rate: 24.5 },
  { name: "Odense", rate: 24.9 },
  { name: "Aalborg", rate: 25.4 },
  { name: "Esbjerg", rate: 25.6 },
  { name: "Randers", rate: 25.9 },
  { name: "Kolding", rate: 25.2 },
  { name: "Horsens", rate: 25.5 },
  { name: "Vejle", rate: 23.4 },
  { name: "Roskilde", rate: 25.2 },
  { name: "Herning", rate: 24.9 },
  { name: "Helsingør", rate: 25.3 },
  { name: "Silkeborg", rate: 25.5 },
  { name: "Næstved", rate: 25.0 },
  { name: "Greve", rate: 23.9 },
]

// Fradragstyper
const deductionTypes = [
  {
    id: "transport",
    name: "Befordringsfradrag",
    description: "Fradrag for transport mellem hjem og arbejde",
    icon: <Car className="h-4 w-4" />,
    fields: [
      { id: "distance", label: "Afstand (km)", type: "number", placeholder: "25" },
      { id: "days", label: "Arbejdsdage pr. uge", type: "number", placeholder: "5" },
    ],
    calculate: (values: any) => {
      const distance = Number(values.distance || 0)
      const days = Number(values.days || 0)
      const daysPerYear = days * 47 // Antager 47 arbejdsuger

      // Beregning baseret på 2023-satser
      let deduction = 0
      if (distance > 24) {
        deduction = (distance - 24) * 2 * daysPerYear * 1.98 // 1,98 kr/km over 24 km
      }
      return deduction
    },
  },
  {
    id: "union",
    name: "A-kasse og fagforening",
    description: "Fradrag for kontingent til a-kasse og fagforening",
    icon: <Users className="h-4 w-4" />,
    fields: [
      { id: "unionFee", label: "Fagforeningskontingent (kr/år)", type: "number", placeholder: "5000" },
      { id: "unemploymentFee", label: "A-kasse (kr/år)", type: "number", placeholder: "7000" },
    ],
    calculate: (values: any) => {
      const unionFee = Number(values.unionFee || 0)
      const unemploymentFee = Number(values.unemploymentFee || 0)
      return unionFee + unemploymentFee
    },
  },
  {
    id: "craftsman",
    name: "Håndværkerfradrag",
    description: "Fradrag for lønudgifter til håndværkere (servicefradrag)",
    icon: <Hammer className="h-4 w-4" />,
    fields: [{ id: "craftsman", label: "Lønudgifter til håndværkere (kr)", type: "number", placeholder: "15000" }],
    calculate: (values: any) => {
      const craftsmanExpense = Number(values.craftsman || 0)
      return Math.min(craftsmanExpense, 25000) // Max 25.000 kr i 2023
    },
  },
  {
    id: "interest",
    name: "Renteudgifter",
    description: "Fradrag for renteudgifter på lån",
    icon: <CreditCard className="h-4 w-4" />,
    fields: [{ id: "interest", label: "Renteudgifter (kr/år)", type: "number", placeholder: "30000" }],
    calculate: (values: any) => {
      return Number(values.interest || 0)
    },
  },
  {
    id: "childSupport",
    name: "Børnebidrag",
    description: "Fradrag for betalt børnebidrag",
    icon: <Users className="h-4 w-4" />,
    fields: [{ id: "childSupport", label: "Betalt børnebidrag (kr/år)", type: "number", placeholder: "20000" }],
    calculate: (values: any) => {
      return Number(values.childSupport || 0)
    },
  },
]

// Ekstra indtægtskilder
const additionalIncomeTypes = [
  {
    id: "freelance",
    name: "Freelance/bijob",
    description: "Indtægt fra freelancearbejde eller bijob",
    icon: <Briefcase className="h-4 w-4" />,
    fields: [{ id: "amount", label: "Beløb (kr/år)", type: "number", placeholder: "50000" }],
  },
  {
    id: "rental",
    name: "Udlejning",
    description: "Indtægt fra udlejning af bolig eller sommerhus",
    icon: <Home className="h-4 w-4" />,
    fields: [
      { id: "amount", label: "Beløb (kr/år)", type: "number", placeholder: "30000" },
      { id: "expenses", label: "Udgifter (kr/år)", type: "number", placeholder: "10000" },
    ],
  },
  {
    id: "investment",
    name: "Investeringer",
    description: "Indtægt fra aktier, obligationer eller andre investeringer",
    icon: <TrendingUp className="h-4 w-4" />,
    fields: [{ id: "amount", label: "Beløb (kr/år)", type: "number", placeholder: "20000" }],
  },
  {
    id: "overtime",
    name: "Overarbejde",
    description: "Indtægt fra overarbejde",
    icon: <Clock className="h-4 w-4" />,
    fields: [
      { id: "hours", label: "Timer pr. måned", type: "number", placeholder: "10" },
      { id: "rate", label: "Timesats (kr)", type: "number", placeholder: "250" },
    ],
  },
]

// Simuleringstyper
const simulationTypes = [
  {
    id: "salaryraise",
    name: "Lønforhøjelse",
    description: "Simuler effekten af en lønforhøjelse",
    icon: <TrendingUp className="h-4 w-4" />,
    fields: [{ id: "amount", label: "Beløb (kr/md)", type: "number", placeholder: "5000" }],
  },
  {
    id: "leave",
    name: "Orlov",
    description: "Simuler effekten af orlov",
    icon: <Clock className="h-4 w-4" />,
    fields: [
      { id: "months", label: "Antal måneder", type: "number", placeholder: "3" },
      { id: "compensation", label: "Kompensation (%)", type: "number", placeholder: "80" },
    ],
  },
  {
    id: "sidebusiness",
    name: "Opstart af virksomhed",
    description: "Simuler effekten af at starte virksomhed ved siden af",
    icon: <Building className="h-4 w-4" />,
    fields: [
      { id: "income", label: "Forventet indtægt (kr/år)", type: "number", placeholder: "100000" },
      { id: "expenses", label: "Forventede udgifter (kr/år)", type: "number", placeholder: "50000" },
    ],
  },
  {
    id: "pension",
    name: "Ekstra pensionsindbetaling",
    description: "Simuler effekten af ekstra pensionsindbetaling",
    icon: <PiggyBank className="h-4 w-4" />,
    fields: [{ id: "amount", label: "Ekstra indbetaling (kr/md)", type: "number", placeholder: "2000" }],
  },
]

interface SalaryCalculation {
  grossSalary: number
  netSalary: number
  yearlyGross: number
  yearlyNet: number
  taxRate: number
  municipalTax: number
  stateTax: number
  healthTax: number
  amContribution: number
  pensionContribution: number
  atp: number
  deductions: number
  effectiveTaxRate: number
  topTaxAmount: number
  topTaxThreshold: number
  isPayingTopTax: boolean
}

interface DeductionValue {
  id: string
  values: Record<string, string>
  amount: number
}

interface AdditionalIncome {
  id: string
  values: Record<string, string>
  amount: number
  netAmount: number
}

interface Simulation {
  id: string
  values: Record<string, string>
  result: {
    currentNet: number
    simulatedNet: number
    difference: number
    percentChange: number
    details: string
  }
}

interface InvestmentGoal {
  id: string
  name: string
  targetAmount: number
  timeHorizon: number
  priority: "høj" | "medium" | "lav"
  category: "pension" | "bolig" | "uddannelse" | "ferie" | "nødopsparing" | "andet"
}

interface InvestmentRecommendation {
  type: string
  allocation: number
  expectedReturn: number
  risk: string
  description: string
  products: string[]
}

interface InvestmentCalculation {
  monthlyAmount: number
  futureValue: number
  totalContributions: number
  totalReturns: number
  taxOptimization: number
  recommendedAllocation: InvestmentRecommendation[]
}

export default function LoenberegnerPage() {
  // Grundlæggende lønoplysninger
  const [grossSalary, setGrossSalary] = useState<string>("")
  const [workHours, setWorkHours] = useState<string>("")
  const [municipality, setMunicipality] = useState<string>("København")
  const [amRate, setAmRate] = useState<number>(8)
  const [pensionRate, setPensionRate] = useState<number>(12)
  const [includeATP, setIncludeATP] = useState<boolean>(true)

  // Beregningsresultater
  const [calculation, setCalculation] = useState<SalaryCalculation | null>(null)

  // Fradrag
  const [activeDeductions, setActiveDeductions] = useState<DeductionValue[]>([])
  const [deductionValues, setDeductionValues] = useState<Record<string, Record<string, string>>>({})

  // Ekstra indtægter
  const [additionalIncomes, setAdditionalIncomes] = useState<AdditionalIncome[]>([])
  const [incomeValues, setIncomeValues] = useState<Record<string, Record<string, string>>>({})

  // Simuleringer
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [simulationValues, setSimulationValues] = useState<Record<string, Record<string, string>>>({})

  // Investeringsoptimering
  const [investmentGoals, setInvestmentGoals] = useState<InvestmentGoal[]>([])
  const [riskProfile, setRiskProfile] = useState<string>("moderat")
  const [investmentHorizon, setInvestmentHorizon] = useState<number>(10)
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(0)
  const [currentSavings, setCurrentSavings] = useState<number>(0)
  const [investmentRecommendations, setInvestmentRecommendations] = useState<InvestmentRecommendation[]>([])

  // UI-tilstand
  const [activeTab, setActiveTab] = useState<string>("beregning")
  const [optimizationScore, setOptimizationScore] = useState<number>(0)
  const [showAdvice, setShowAdvice] = useState<boolean>(true)

  const aiRecommendation = useMemo(() => {
    const gross = parseFloat(grossSalary || "0") || 0
    const totalDeductions = activeDeductions.reduce(
      (sum, d) => sum + (typeof d.value === "number" ? d.value : 0),
      0,
    )
    return analyzeLoen({
      grossMonthlySalary: gross,
      amBidragRate: amRate,
      taxRate: 37,
      deductions: totalDeductions,
      pensionContribution: (gross * pensionRate) / 100,
    })
  }, [grossSalary, amRate, pensionRate, activeDeductions])

  // Beregn løn når inputs ændres
  useEffect(() => {
    if (grossSalary) {
      calculateSalary()
    }
  }, [grossSalary, workHours, municipality, amRate, pensionRate, includeATP, activeDeductions])

  // Beregn optimeringsscore
  useEffect(() => {
    if (calculation) {
      calculateOptimizationScore()
    }
  }, [calculation, activeDeductions, additionalIncomes])

  // Beregn løn
  const calculateSalary = () => {
    const grossSalaryNum = Number(grossSalary) || 0
    const yearlyGross = grossSalaryNum * 12

    // Find kommuneskat
    const municipalTaxRate = municipalityTaxRates.find((m) => m.name === municipality)?.rate || 25

    // AM-bidrag (arbejdsmarkedsbidrag)
    const amContribution = grossSalaryNum * (amRate / 100)

    // Pension
    const pensionContribution = grossSalaryNum * (pensionRate / 100)

    // ATP (fast beløb pr. måned ved fuld tid)
    const atp = includeATP ? 94.65 : 0

    // Beregn skattepligtig indkomst
    const taxableIncome = grossSalaryNum - amContribution - pensionContribution

    // Beregn fradrag
    const totalDeductions = activeDeductions.reduce((sum, deduction) => sum + deduction.amount, 0) / 12

    // Skattepligtig indkomst efter fradrag
    const taxableIncomeAfterDeductions = Math.max(0, taxableIncome - totalDeductions)

    // Bundskat (12.15% i 2023)
    const stateTax = taxableIncomeAfterDeductions * 0.1215

    // Sundhedsbidrag (indregnet i kommuneskatten siden 2019)
    const healthTax = 0

    // Kommuneskat
    const municipalTax = taxableIncomeAfterDeductions * (municipalTaxRate / 100)

    // Topskat (15% af indkomst over 568.900 kr. i 2023)
    const topTaxThreshold = 568900 / 12
    const topTaxAmount = Math.max(0, taxableIncomeAfterDeductions - topTaxThreshold) * 0.15
    const isPayingTopTax = topTaxAmount > 0

    // Samlet skat
    const totalTax = stateTax + healthTax + municipalTax + topTaxAmount

    // Nettoløn
    const netSalary = grossSalaryNum - amContribution - pensionContribution - totalTax - atp

    // Effektiv skattesats
    const effectiveTaxRate = (totalTax / grossSalaryNum) * 100

    setCalculation({
      grossSalary: grossSalaryNum,
      netSalary,
      yearlyGross: yearlyGross,
      yearlyNet: netSalary * 12,
      taxRate: municipalTaxRate + 12.15, // Kommuneskat + bundskat
      municipalTax,
      stateTax,
      healthTax,
      amContribution,
      pensionContribution,
      atp,
      deductions: totalDeductions,
      effectiveTaxRate,
      topTaxAmount,
      topTaxThreshold,
      isPayingTopTax,
    })
  }

  // Beregn investeringsoptimering
  const calculateInvestmentOptimization = () => {
    if (!calculation) return null

    const availableForInvestment = calculation.netSalary * 0.2 // Antager 20% af nettoløn kan investeres
    const recommendedMonthly = Math.min(monthlyInvestment || availableForInvestment, availableForInvestment)

    // Beregn fremtidig værdi baseret på risikoprofil
    const expectedReturns = {
      konservativ: 0.04,
      moderat: 0.07,
      aggressiv: 0.1,
    }

    const annualReturn = expectedReturns[riskProfile as keyof typeof expectedReturns] || 0.07
    const monthlyReturn = annualReturn / 12
    const months = investmentHorizon * 12

    // Beregn fremtidig værdi med renters rente
    const futureValue =
      currentSavings * Math.pow(1 + annualReturn, investmentHorizon) +
      (recommendedMonthly * (Math.pow(1 + monthlyReturn, months) - 1)) / monthlyReturn

    const totalContributions = currentSavings + recommendedMonthly * months
    const totalReturns = futureValue - totalContributions

    // Skatteoptimering
    const pensionTaxSaving = recommendedMonthly * 0.4 * 12 // 40% skattebesparelse på pension
    const aktiesparekonto = Math.min(recommendedMonthly * 12, 103500) // Max på aktiesparekonto 2023
    const aktiesparekontoTax = aktiesparekonto * 0.17 // 17% skat på aktiesparekonto

    return {
      monthlyAmount: recommendedMonthly,
      futureValue,
      totalContributions,
      totalReturns,
      taxOptimization: pensionTaxSaving,
      recommendedAllocation: getInvestmentAllocation(),
    }
  }

  // Få investeringsallokering baseret på risikoprofil
  const getInvestmentAllocation = (): InvestmentRecommendation[] => {
    const allocations = {
      konservativ: [
        {
          type: "Obligationer",
          allocation: 60,
          expectedReturn: 3,
          risk: "Lav",
          description: "Danske og europæiske statsobligationer",
          products: ["Danske Bank Obligationer", "Nordea Stable Return", "SEB Obligationer"],
        },
        {
          type: "Aktier",
          allocation: 30,
          expectedReturn: 7,
          risk: "Medium",
          description: "Brede aktiefonde med fokus på dividende",
          products: ["Sparindex INDEX Globale Aktier", "Danske Invest Global", "Nordea Invest Globale Aktier"],
        },
        {
          type: "Kontanter",
          allocation: 10,
          expectedReturn: 1,
          risk: "Ingen",
          description: "Højrentekonto og pengemarkedsfonde",
          products: ["Højrentekonto", "Pengemarkedsfond", "Kortsigtede obligationer"],
        },
      ],
      moderat: [
        {
          type: "Aktier",
          allocation: 60,
          expectedReturn: 8,
          risk: "Medium",
          description: "Globale aktiefonde og ETF'er",
          products: ["Sparindex INDEX Globale Aktier", "iShares Core MSCI World", "Vanguard Total World Stock"],
        },
        {
          type: "Obligationer",
          allocation: 30,
          expectedReturn: 3,
          risk: "Lav",
          description: "Blandede obligationsfonde",
          products: ["Danske Bank Obligationer", "Nordea Stable Return", "BankInvest Obligationer"],
        },
        {
          type: "Alternative",
          allocation: 10,
          expectedReturn: 6,
          risk: "Medium-høj",
          description: "REIT, råvarer og emerging markets",
          products: ["Ejendomsfonde", "Råvarefonde", "Emerging Markets ETF"],
        },
      ],
      aggressiv: [
        {
          type: "Aktier",
          allocation: 80,
          expectedReturn: 10,
          risk: "Høj",
          description: "Globale aktier med fokus på vækst",
          products: ["Teknologiaktier", "Emerging Markets", "Small Cap fonde"],
        },
        {
          type: "Alternative",
          allocation: 15,
          expectedReturn: 8,
          risk: "Høj",
          description: "Kryptovaluta, private equity, venture capital",
          products: ["Bitcoin ETF", "Private Equity fonde", "Venture Capital"],
        },
        {
          type: "Obligationer",
          allocation: 5,
          expectedReturn: 3,
          risk: "Lav",
          description: "Minimal obligationseksponering",
          products: ["Kortsigtede obligationer", "Inflation-linked bonds"],
        },
      ],
    }

    return allocations[riskProfile as keyof typeof allocations] || allocations.moderat
  }

  // Beregn optimeringsscore
  const calculateOptimizationScore = () => {
    let score = 50 // Basisscore

    // Tjek for uudnyttede fradragsmuligheder
    const unusedDeductions = deductionTypes.filter((type) => !activeDeductions.some((d) => d.id === type.id)).length

    // Træk point for hver uudnyttet fradragsmulighed
    score -= unusedDeductions * 10

    // Tjek for pensionsoptimering
    if (pensionRate < 10) {
      score -= 10
    } else if (pensionRate > 15) {
      score += 10
    }

    // Tjek for topskat
    if (calculation?.isPayingTopTax) {
      score -= 15
    }

    // Tjek for diversificerede indtægtskilder
    if (additionalIncomes.length > 0) {
      score += additionalIncomes.length * 5
    }

    // Begræns score til 0-100
    score = Math.max(0, Math.min(100, score))

    setOptimizationScore(score)
  }

  // Håndter tilføjelse af fradrag
  const handleAddDeduction = (deductionType: string) => {
    const deduction = deductionTypes.find((d) => d.id === deductionType)
    if (!deduction) return

    // Tjek om fradraget allerede er aktivt
    if (activeDeductions.some((d) => d.id === deductionType)) return

    // Initialiser værdier hvis de ikke findes
    if (!deductionValues[deductionType]) {
      const initialValues: Record<string, string> = {}
      deduction.fields.forEach((field) => {
        initialValues[field.id] = ""
      })
      setDeductionValues((prev) => ({
        ...prev,
        [deductionType]: initialValues,
      }))
    }

    // Beregn fradragsbeløb
    const values = deductionValues[deductionType] || {}
    const amount = deduction.calculate(values)

    // Tilføj fradraget
    setActiveDeductions((prev) => [
      ...prev,
      {
        id: deductionType,
        values,
        amount,
      },
    ])
  }

  // Håndter opdatering af fradragsværdier
  const handleDeductionValueChange = (deductionId: string, fieldId: string, value: string) => {
    // Opdater værdier
    setDeductionValues((prev) => ({
      ...prev,
      [deductionId]: {
        ...(prev[deductionId] || {}),
        [fieldId]: value,
      },
    }))

    // Find deductionType
    const deductionType = deductionTypes.find((d) => d.id === deductionId)
    if (!deductionType) return

    // Opdater aktivt fradrag
    setActiveDeductions((prev) => {
      return prev.map((d) => {
        if (d.id === deductionId) {
          const updatedValues = {
            ...(deductionValues[deductionId] || {}),
            [fieldId]: value,
          }
          return {
            ...d,
            values: updatedValues,
            amount: deductionType.calculate(updatedValues),
          }
        }
        return d
      })
    })
  }

  // Håndter fjernelse af fradrag
  const handleRemoveDeduction = (deductionId: string) => {
    setActiveDeductions((prev) => prev.filter((d) => d.id !== deductionId))
  }

  // Håndter tilføjelse af ekstra indtægt
  const handleAddIncome = (incomeType: string) => {
    const income = additionalIncomeTypes.find((i) => i.id === incomeType)
    if (!income) return

    // Initialiser værdier hvis de ikke findes
    if (!incomeValues[incomeType]) {
      const initialValues: Record<string, string> = {}
      income.fields.forEach((field) => {
        initialValues[field.id] = ""
      })
      setIncomeValues((prev) => ({
        ...prev,
        [incomeType]: initialValues,
      }))
    }

    // Beregn indtægtsbeløb
    const values = incomeValues[incomeType] || {}
    let amount = 0

    if (incomeType === "freelance" || incomeType === "investment") {
      amount = Number(values.amount || 0)
    } else if (incomeType === "rental") {
      amount = Number(values.amount || 0) - Number(values.expenses || 0)
    } else if (incomeType === "overtime") {
      amount = Number(values.hours || 0) * Number(values.rate || 0) * 12
    }

    // Beregn nettobeløb (forenklet - i virkeligheden ville dette være mere komplekst)
    const netAmount = amount * 0.6 // Antager ca. 40% skat

    // Tilføj indtægten
    setAdditionalIncomes((prev) => [
      ...prev,
      {
        id: incomeType,
        values,
        amount,
        netAmount,
      },
    ])
  }

  // Håndter opdatering af indtægtsværdier
  const handleIncomeValueChange = (incomeId: string, fieldId: string, value: string) => {
    // Opdater værdier
    setIncomeValues((prev) => ({
      ...prev,
      [incomeId]: {
        ...(prev[incomeId] || {}),
        [fieldId]: value,
      },
    }))

    // Find incomeType
    const incomeType = additionalIncomeTypes.find((i) => i.id === incomeId)
    if (!incomeType) return

    // Opdater aktiv indtægt
    setAdditionalIncomes((prev) => {
      return prev.map((i) => {
        if (i.id === incomeId) {
          const updatedValues = {
            ...(incomeValues[incomeId] || {}),
            [fieldId]: value,
          }

          let amount = 0
          if (incomeId === "freelance" || incomeId === "investment") {
            amount = Number(updatedValues.amount || 0)
          } else if (incomeId === "rental") {
            amount = Number(updatedValues.amount || 0) - Number(updatedValues.expenses || 0)
          } else if (incomeId === "overtime") {
            amount = Number(updatedValues.hours || 0) * Number(updatedValues.rate || 0) * 12
          }

          const netAmount = amount * 0.6 // Antager ca. 40% skat

          return {
            ...i,
            values: updatedValues,
            amount,
            netAmount,
          }
        }
        return i
      })
    })
  }

  // Håndter fjernelse af ekstra indtægt
  const handleRemoveIncome = (incomeId: string) => {
    setAdditionalIncomes((prev) => prev.filter((i) => i.id !== incomeId))
  }

  // Håndter tilføjelse af simulering
  const handleAddSimulation = (simulationType: string) => {
    const simulation = simulationTypes.find((s) => s.id === simulationType)
    if (!simulation) return

    // Initialiser værdier hvis de ikke findes
    if (!simulationValues[simulationType]) {
      const initialValues: Record<string, string> = {}
      simulation.fields.forEach((field) => {
        initialValues[field.id] = ""
      })
      setSimulationValues((prev) => ({
        ...prev,
        [simulationType]: initialValues,
      }))
    }

    // Beregn simuleringsresultat
    const values = simulationValues[simulationType] || {}
    const result = {
      currentNet: calculation?.netSalary || 0,
      simulatedNet: 0,
      difference: 0,
      percentChange: 0,
      details: "",
    }

    if (simulationType === "salaryraise") {
      const raiseAmount = Number(values.amount || 0)
      const additionalNet = raiseAmount * 0.6 // Antager ca. 40% skat
      result.simulatedNet = result.currentNet + additionalNet
      result.difference = additionalNet
      result.percentChange = (additionalNet / result.currentNet) * 100
      result.details = `En lønforhøjelse på ${raiseAmount} kr/md før skat giver ca. ${additionalNet.toFixed(0)} kr/md efter skat.`
    } else if (simulationType === "leave") {
      const months = Number(values.months || 0)
      const compensation = Number(values.compensation || 0) / 100
      const monthlyLoss = result.currentNet * (1 - compensation)
      result.simulatedNet = result.currentNet - monthlyLoss
      result.difference = -monthlyLoss
      result.percentChange = -((monthlyLoss / result.currentNet) * 100)
      result.details = `${months} måneders orlov med ${compensation * 100}% kompensation vil reducere din månedsløn med ca. ${monthlyLoss.toFixed(0)} kr/md i orlovsperioden.`
    } else if (simulationType === "sidebusiness") {
      const income = Number(values.income || 0)
      const expenses = Number(values.expenses || 0)
      const profit = income - expenses
      const additionalNet = (profit * 0.6) / 12 // Antager ca. 40% skat, omregnet til månedlig
      result.simulatedNet = result.currentNet + additionalNet
      result.difference = additionalNet
      result.percentChange = (additionalNet / result.currentNet) * 100
      result.details = `En virksomhed med ${income} kr/år i indtægter og ${expenses} kr/år i udgifter vil give dig ca. ${additionalNet.toFixed(0)} kr/md ekstra efter skat.`
    } else if (simulationType === "pension") {
      const amount = Number(values.amount || 0)
      const taxSaving = amount * 0.4 // Antager ca. 40% skattebesparelse
      result.simulatedNet = result.currentNet - amount + taxSaving
      result.difference = -amount + taxSaving
      result.percentChange = ((-amount + taxSaving) / result.currentNet) * 100
      result.details = `En ekstra pensionsindbetaling på ${amount} kr/md vil reducere din nettoløn med ca. ${(amount - taxSaving).toFixed(0)} kr/md, men give dig en skattebesparelse på ca. ${taxSaving.toFixed(0)} kr/md.`
    }

    // Tilføj simuleringen
    setSimulations((prev) => [
      ...prev,
      {
        id: simulationType,
        values,
        result,
      },
    ])
  }

  // Håndter opdatering af simuleringsværdier
  const handleSimulationValueChange = (simulationId: string, fieldId: string, value: string) => {
    // Opdater værdier
    setSimulationValues((prev) => ({
      ...prev,
      [simulationId]: {
        ...(prev[simulationId] || {}),
        [fieldId]: value,
      },
    }))
  }

  // Håndter fjernelse af simulering
  const handleRemoveSimulation = (simulationId: string) => {
    setSimulations((prev) => prev.filter((s) => s.id !== simulationId))
  }

  // Kør simulering
  const runSimulation = (simulationId: string) => {
    const simulation = simulationTypes.find((s) => s.id === simulationId)
    if (!simulation) return

    const values = simulationValues[simulationId] || {}
    const result = {
      currentNet: calculation?.netSalary || 0,
      simulatedNet: 0,
      difference: 0,
      percentChange: 0,
      details: "",
    }

    if (simulationId === "salaryraise") {
      const raiseAmount = Number(values.amount || 0)
      const additionalNet = raiseAmount * 0.6 // Antager ca. 40% skat
      result.simulatedNet = result.currentNet + additionalNet
      result.difference = additionalNet
      result.percentChange = (additionalNet / result.currentNet) * 100
      result.details = `En lønforhøjelse på ${raiseAmount} kr/md før skat giver ca. ${additionalNet.toFixed(0)} kr/md efter skat.`
    } else if (simulationId === "leave") {
      const months = Number(values.months || 0)
      const compensation = Number(values.compensation || 0) / 100
      const monthlyLoss = result.currentNet * (1 - compensation)
      result.simulatedNet = result.currentNet - monthlyLoss
      result.difference = -monthlyLoss
      result.percentChange = -((monthlyLoss / result.currentNet) * 100)
      result.details = `${months} måneders orlov med ${compensation * 100}% kompensation vil reducere din månedsløn med ca. ${monthlyLoss.toFixed(0)} kr/md i orlovsperioden.`
    } else if (simulationId === "sidebusiness") {
      const income = Number(values.income || 0)
      const expenses = Number(values.expenses || 0)
      const profit = income - expenses
      const additionalNet = (profit * 0.6) / 12 // Antager ca. 40% skat, omregnet til månedlig
      result.simulatedNet = result.currentNet + additionalNet
      result.difference = additionalNet
      result.percentChange = (additionalNet / result.currentNet) * 100
      result.details = `En virksomhed med ${income} kr/år i indtægter og ${expenses} kr/år i udgifter vil give dig ca. ${additionalNet.toFixed(0)} kr/md ekstra efter skat.`
    } else if (simulationId === "pension") {
      const amount = Number(values.amount || 0)
      const taxSaving = amount * 0.4 // Antager ca. 40% skattebesparelse
      result.simulatedNet = result.currentNet - amount + taxSaving
      result.difference = -amount + taxSaving
      result.percentChange = ((-amount + taxSaving) / result.currentNet) * 100
      result.details = `En ekstra pensionsindbetaling på ${amount} kr/md vil reducere din nettoløn med ca. ${(amount - taxSaving).toFixed(0)} kr/md, men give dig en skattebesparelse på ca. ${taxSaving.toFixed(0)} kr/md.`
    }

    // Opdater simuleringen
    setSimulations((prev) => {
      return prev.map((s) => {
        if (s.id === simulationId) {
          return {
            ...s,
            result,
          }
        }
        return s
      })
    })
  }

  // Formater valuta
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Få optimeringsfarve
  const getOptimizationColor = () => {
    if (optimizationScore < 40) return "text-red-500"
    if (optimizationScore < 70) return "text-yellow-500"
    return "text-green-500"
  }

  // Få personlige råd
  const getPersonalAdvice = () => {
    if (!calculation) return []

    const advice = []

    // Fradragsoptimering
    const unusedDeductions = deductionTypes.filter((type) => !activeDeductions.some((d) => d.id === type.id))

    if (unusedDeductions.length > 0) {
      advice.push({
        title: "Udnyt flere fradragsmuligheder",
        description: `Du udnytter kun ${activeDeductions.length} ud af ${deductionTypes.length} mulige fradrag. Tilføj flere for at reducere din skat.`,
        priority: "høj",
      })
    }

    // Pensionsoptimering
    if (pensionRate < 10) {
      advice.push({
        title: "Øg din pensionsindbetaling",
        description:
          "Din pensionsindbetaling er under 10%. Overvej at øge den for at få skattemæssige fordele og sikre din fremtid.",
        priority: "medium",
      })
    }

    // Topskat
    if (calculation.isPayingTopTax) {
      advice.push({
        title: "Reducér topskat",
        description: `Du betaler ${formatCurrency(calculation.topTaxAmount)} i topskat hver måned. Overvej at indbetale mere til pension for at reducere din skattepligtige indkomst.`,
        priority: "høj",
      })
    }

    // Diversificering af indtægter
    if (additionalIncomes.length === 0) {
      advice.push({
        title: "Diversificér dine indtægtskilder",
        description:
          "Du har ingen ekstra indtægtskilder. Overvej at tilføje passive indtægtskilder for at øge din økonomiske sikkerhed.",
        priority: "medium",
      })
    }

    // AM-bidrag og pension
    if (amRate !== 8) {
      advice.push({
        title: "Tjek dit AM-bidrag",
        description: "Dit AM-bidrag er ikke sat til standardsatsen på 8%. Kontrollér om dette er korrekt.",
        priority: "lav",
      })
    }

    return advice
  }

  // Få prioritetsfarve
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "høj":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "lav":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  // Få deduktionsnavn
  const getDeductionName = (id: string) => {
    return deductionTypes.find((d) => d.id === id)?.name || id
  }

  // Få indtægtsnavn
  const getIncomeName = (id: string) => {
    return additionalIncomeTypes.find((i) => i.id === id)?.name || id
  }

  // Få simuleringsnavn
  const getSimulationName = (id: string) => {
    return simulationTypes.find((s) => s.id === id)?.name || id
  }

  // Få deduktionsikon
  const getDeductionIcon = (id: string) => {
    return deductionTypes.find((d) => d.id === id)?.icon || <Minus className="h-4 w-4" />
  }

  // Få indtægtsikon
  const getIncomeIcon = (id: string) => {
    return additionalIncomeTypes.find((i) => i.id === id)?.icon || <Plus className="h-4 w-4" />
  }

  // Få simuleringsikon
  const getSimulationIcon = (id: string) => {
    return simulationTypes.find((s) => s.id === id)?.icon || <Calculator className="h-4 w-4" />
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <CalculatorTracker calculatorName="loen" />

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-blue-500 bg-clip-text text-transparent">
          Avanceret Lønberegner
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Beregn din løn, optimer dine fradrag, simulér fremtidsscenarier og få personlig økonomisk rådgivning
        </p>
      </div>

      <Tabs defaultValue="beregning" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="beregning">Lønberegning</TabsTrigger>
          <TabsTrigger value="fradrag">Fradragsoptimering</TabsTrigger>
          <TabsTrigger value="indtaegter">Ekstra Indtægter</TabsTrigger>
          <TabsTrigger value="investering">Investeringsoptimering</TabsTrigger>
          <TabsTrigger value="simulering">Fremtidssimulering</TabsTrigger>
          <TabsTrigger value="raadgivning">Rådgivning</TabsTrigger>
          <TabsTrigger value="ai">AI-anbefaling</TabsTrigger>
        </TabsList>

        {/* Lønberegning */}
        <TabsContent value="beregning" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Indtast dine lønoplysninger
                  </CardTitle>
                  <CardDescription>Udfyld dine grundlæggende lønoplysninger</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="grossSalary" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Bruttoløn pr. måned (DKK)
                    </Label>
                    <Input
                      id="grossSalary"
                      type="text"
                      inputMode="numeric"
                      value={grossSalary}
                      onChange={(e) => {
                        const value = e.target.value.replace(/^0+/, "")
                        setGrossSalary(value)
                      }}
                      placeholder="Indtast bruttoløn"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workHours" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Arbejdstimer pr. uge
                    </Label>
                    <Input
                      id="workHours"
                      type="text"
                      inputMode="numeric"
                      value={workHours}
                      onChange={(e) => {
                        const value = e.target.value.replace(/^0+/, "")
                        setWorkHours(value)
                      }}
                      placeholder="Indtast arbejdstimer"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="municipality" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Skattekommune
                    </Label>
                    <Select value={municipality} onValueChange={setMunicipality}>
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg kommune" />
                      </SelectTrigger>
                      <SelectContent>
                        {municipalityTaxRates.map((m) => (
                          <SelectItem key={m.name} value={m.name}>
                            {m.name} ({m.rate}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      AM-bidrag: {amRate}%
                    </Label>
                    <Slider
                      value={[amRate]}
                      onValueChange={(value) => setAmRate(value[0])}
                      max={10}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>0%</span>
                      <span>10%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <PiggyBank className="h-4 w-4" />
                      Pension: {pensionRate}%
                    </Label>
                    <Slider
                      value={[pensionRate]}
                      onValueChange={(value) => setPensionRate(value[0])}
                      max={20}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>0%</span>
                      <span>20%</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="atp" checked={includeATP} onCheckedChange={setIncludeATP} />
                    <Label htmlFor="atp">Inkluder ATP-bidrag (94,65 kr/md)</Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {calculation ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Din løn
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <p className="text-sm text-muted-foreground">Bruttoløn/måned</p>
                          <p className="text-2xl font-bold text-blue-600">{formatCurrency(calculation.grossSalary)}</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                          <p className="text-sm text-muted-foreground">Nettoløn/måned</p>
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(calculation.netSalary)}</p>
                        </div>
                      </div>

                      <Separator />

                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="details">
                          <AccordionTrigger>Detaljeret oversigt</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Skatteberegning</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">AM-bidrag ({amRate}%):</span>
                                    <span>-{formatCurrency(calculation.amContribution)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Bundskat (12,15%):</span>
                                    <span>-{formatCurrency(calculation.stateTax)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Kommuneskat:</span>
                                    <span>-{formatCurrency(calculation.municipalTax)}</span>
                                  </div>
                                  {calculation.topTaxAmount > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Topskat (15%):</span>
                                      <span>-{formatCurrency(calculation.topTaxAmount)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pension ({pensionRate}%):</span>
                                    <span>-{formatCurrency(calculation.pensionContribution)}</span>
                                  </div>
                                  {calculation.atp > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">ATP:</span>
                                      <span>-{formatCurrency(calculation.atp)}</span>
                                    </div>
                                  )}
                                  {calculation.deductions > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Fradrag:</span>
                                      <span>+{formatCurrency(calculation.deductions)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between font-medium col-span-2 pt-1 border-t">
                                    <span>Samlet nettoløn:</span>
                                    <span>{formatCurrency(calculation.netSalary)}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Årlig oversigt</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Årlig bruttoløn:</span>
                                    <span>{formatCurrency(calculation.yearlyGross)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Årlig nettoløn:</span>
                                    <span>{formatCurrency(calculation.yearlyNet)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Effektiv skattesats:</span>
                                    <span>{calculation.effectiveTaxRate.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Skattefordeling
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-200 text-blue-800">
                                Nettoløn
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold inline-block text-blue-800">
                                {((calculation.netSalary / calculation.grossSalary) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                            <div
                              style={{
                                width: `${((calculation.netSalary / calculation.grossSalary) * 100).toFixed(1)}%`,
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                            ></div>
                          </div>
                        </div>

                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-red-200 text-red-800">
                                Skat
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold inline-block text-red-800">
                                {(
                                  ((calculation.stateTax + calculation.municipalTax + calculation.topTaxAmount) /
                                    calculation.grossSalary) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
                            <div
                              style={{
                                width: `${(((calculation.stateTax + calculation.municipalTax + calculation.topTaxAmount) / calculation.grossSalary) * 100).toFixed(1)}%`,
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                            ></div>
                          </div>
                        </div>

                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-green-200 text-green-800">
                                Pension
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold inline-block text-green-800">
                                {(
                                  ((calculation.pensionContribution + calculation.atp) / calculation.grossSalary) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                            <div
                              style={{
                                width: `${(((calculation.pensionContribution + calculation.atp) / calculation.grossSalary) * 100).toFixed(1)}%`,
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                            ></div>
                          </div>
                        </div>

                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-purple-200 text-purple-800">
                                AM-bidrag
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold inline-block text-purple-800">
                                {((calculation.amContribution / calculation.grossSalary) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                            <div
                              style={{
                                width: `${((calculation.amContribution / calculation.grossSalary) * 100).toFixed(1)}%`,
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                      <p>Indtast dine lønoplysninger for at se beregningen</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Fradragsoptimering */}
        <TabsContent value="fradrag" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Minus className="h-5 w-5" />
                    Tilføj fradrag
                  </CardTitle>
                  <CardDescription>Vælg fradrag for at optimere din skat</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deductionTypes.map((deduction) => (
                      <div key={deduction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          {deduction.icon}
                          <div>
                            <p className="font-medium">{deduction.name}</p>
                            <p className="text-sm text-muted-foreground">{deduction.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddDeduction(deduction.id)}
                          disabled={activeDeductions.some((d) => d.id === deduction.id)}
                        >
                          {activeDeductions.some((d) => d.id === deduction.id) ? "Tilføjet" : "Tilføj"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Dine aktive fradrag
                  </CardTitle>
                  <CardDescription>
                    {activeDeductions.length > 0
                      ? `Du har ${activeDeductions.length} aktive fradrag`
                      : "Du har ingen aktive fradrag"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeDeductions.length > 0 ? (
                    <div className="space-y-4">
                      {activeDeductions.map((deduction) => {
                        const deductionType = deductionTypes.find((d) => d.id === deduction.id)
                        if (!deductionType) return null

                        return (
                          <Card key={deduction.id} className="border">
                            <CardHeader className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getDeductionIcon(deduction.id)}
                                  <CardTitle className="text-base">{getDeductionName(deduction.id)}</CardTitle>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveDeduction(deduction.id)}>
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="space-y-3">
                                {deductionType.fields.map((field) => (
                                  <div key={field.id} className="space-y-1">
                                    <Label htmlFor={`${deduction.id}-${field.id}`}>{field.label}</Label>
                                    <Input
                                      id={`${deduction.id}-${field.id}`}
                                      type={field.type}
                                      placeholder={field.placeholder}
                                      value={deductionValues[deduction.id]?.[field.id] || ""}
                                      onChange={(e) =>
                                        handleDeductionValueChange(deduction.id, field.id, e.target.value)
                                      }
                                    />
                                  </div>
                                ))}
                                <div className="pt-2 border-t mt-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Årligt fradrag:</span>
                                    <span className="font-bold text-green-600">{formatCurrency(deduction.amount)}</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-sm font-medium">Skattebesparelse (ca.):</span>
                                    <span className="font-bold text-green-600">
                                      {formatCurrency(deduction.amount * 0.35)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}

                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Samlet fradragseffekt
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Samlede årlige fradrag:</span>
                            <span className="font-bold">
                              {formatCurrency(activeDeductions.reduce((sum, d) => sum + d.amount, 0))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Estimeret årlig skattebesparelse:</span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(activeDeductions.reduce((sum, d) => sum + d.amount, 0) * 0.35)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Månedlig skattebesparelse:</span>
                            <span className="font-bold text-green-600">
                              {formatCurrency((activeDeductions.reduce((sum, d) => sum + d.amount, 0) * 0.35) / 12)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground p-6">
                      <p>Du har ikke tilføjet nogen fradrag endnu</p>
                      <p className="text-sm mt-2">Tilføj fradrag fra listen til venstre for at optimere din skat</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Ekstra Indtægter */}
        <TabsContent value="indtaegter" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Tilføj ekstra indtægter
                  </CardTitle>
                  <CardDescription>Tilføj ekstra indtægtskilder for at se deres effekt på din økonomi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {additionalIncomeTypes.map((income) => (
                      <div key={income.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          {income.icon}
                          <div>
                            <p className="font-medium">{income.name}</p>
                            <p className="text-sm text-muted-foreground">{income.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddIncome(income.id)}
                          disabled={additionalIncomes.some((i) => i.id === income.id)}
                        >
                          {additionalIncomes.some((i) => i.id === income.id) ? "Tilføjet" : "Tilføj"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Dine ekstra indtægter
                  </CardTitle>
                  <CardDescription>
                    {additionalIncomes.length > 0
                      ? `Du har ${additionalIncomes.length} ekstra indtægtskilder`
                      : "Du har ingen ekstra indtægtskilder"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {additionalIncomes.length > 0 ? (
                    <div className="space-y-4">
                      {additionalIncomes.map((income) => {
                        const incomeType = additionalIncomeTypes.find((i) => i.id === income.id)
                        if (!incomeType) return null

                        return (
                          <Card key={income.id} className="border">
                            <CardHeader className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getIncomeIcon(income.id)}
                                  <CardTitle className="text-base">{getIncomeName(income.id)}</CardTitle>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveIncome(income.id)}>
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="space-y-3">
                                {incomeType.fields.map((field) => (
                                  <div key={field.id} className="space-y-1">
                                    <Label htmlFor={`${income.id}-${field.id}`}>{field.label}</Label>
                                    <Input
                                      id={`${income.id}-${field.id}`}
                                      type={field.type}
                                      placeholder={field.placeholder}
                                      value={incomeValues[income.id]?.[field.id] || ""}
                                      onChange={(e) => handleIncomeValueChange(income.id, field.id, e.target.value)}
                                    />
                                  </div>
                                ))}
                                <div className="pt-2 border-t mt-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Årlig bruttoindtægt:</span>
                                    <span className="font-bold text-blue-600">{formatCurrency(income.amount)}</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-sm font-medium">Årlig nettoindtægt (ca.):</span>
                                    <span className="font-bold text-green-600">{formatCurrency(income.netAmount)}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}

                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Coins className="h-4 w-4" />
                          Samlet effekt af ekstra indtægter
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Samlede årlige ekstraindtægter (brutto):</span>
                            <span className="font-bold">
                              {formatCurrency(additionalIncomes.reduce((sum, i) => sum + i.amount, 0))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Samlede årlige ekstraindtægter (netto):</span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(additionalIncomes.reduce((sum, i) => sum + i.netAmount, 0))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Månedlig ekstra nettoindtægt:</span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(additionalIncomes.reduce((sum, i) => sum + i.netAmount, 0) / 12)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground p-6">
                      <p>Du har ikke tilføjet nogen ekstra indtægtskilder endnu</p>
                      <p className="text-sm mt-2">
                        Tilføj indtægtskilder fra listen til venstre for at se deres effekt
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Fremtidssimulering */}
        <TabsContent value="simulering" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Simulér fremtidsscenarier
                  </CardTitle>
                  <CardDescription>Undersøg hvordan forskellige scenarier påvirker din økonomi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {simulationTypes.map((simulation) => (
                      <div key={simulation.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          {simulation.icon}
                          <div>
                            <p className="font-medium">{simulation.name}</p>
                            <p className="text-sm text-muted-foreground">{simulation.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddSimulation(simulation.id)}
                          disabled={!calculation || simulations.some((s) => s.id === simulation.id)}
                        >
                          {simulations.some((s) => s.id === simulation.id) ? "Tilføjet" : "Simulér"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Dine simuleringer
                  </CardTitle>
                  <CardDescription>
                    {simulations.length > 0
                      ? `Du har ${simulations.length} aktive simuleringer`
                      : "Du har ingen aktive simuleringer"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {simulations.length > 0 ? (
                    <div className="space-y-4">
                      {simulations.map((simulation) => {
                        const simulationType = simulationTypes.find((s) => s.id === simulation.id)
                        if (!simulationType) return null

                        return (
                          <Card key={simulation.id} className="border">
                            <CardHeader className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getSimulationIcon(simulation.id)}
                                  <CardTitle className="text-base">{getSimulationName(simulation.id)}</CardTitle>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveSimulation(simulation.id)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="space-y-3">
                                {simulationType.fields.map((field) => (
                                  <div key={field.id} className="space-y-1">
                                    <Label htmlFor={`${simulation.id}-${field.id}`}>{field.label}</Label>
                                    <Input
                                      id={`${simulation.id}-${field.id}`}
                                      type={field.type}
                                      placeholder={field.placeholder}
                                      value={simulationValues[simulation.id]?.[field.id] || ""}
                                      onChange={(e) =>
                                        handleSimulationValueChange(simulation.id, field.id, e.target.value)
                                      }
                                    />
                                  </div>
                                ))}
                                <div className="flex justify-end mt-2">
                                  <Button size="sm" onClick={() => runSimulation(simulation.id)}>
                                    Kør simulering
                                  </Button>
                                </div>
                                {simulation.result && (
                                  <div className="pt-2 border-t mt-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium">Nuværende nettoløn:</span>
                                      <span className="font-bold">{formatCurrency(simulation.result.currentNet)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                      <span className="text-sm font-medium">Simuleret nettoløn:</span>
                                      <span className="font-bold text-blue-600">
                                        {formatCurrency(simulation.result.simulatedNet)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                      <span className="text-sm font-medium">Forskel:</span>
                                      <span
                                        className={`font-bold ${simulation.result.difference >= 0 ? "text-green-600" : "text-red-600"}`}
                                      >
                                        {simulation.result.difference >= 0 ? "+" : ""}
                                        {formatCurrency(simulation.result.difference)} (
                                        {simulation.result.difference >= 0 ? "+" : ""}
                                        {simulation.result.percentChange.toFixed(1)}%)
                                      </span>
                                    </div>
                                    <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded text-sm">
                                      {simulation.result.details}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground p-6">
                      <p>Du har ikke tilføjet nogen simuleringer endnu</p>
                      <p className="text-sm mt-2">Tilføj simuleringer fra listen til venstre for at se deres effekt</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Investeringsoptimering */}
        <TabsContent value="investering" className="space-y-6 mt-6">
          <InvestmentStrategies
            monthlyIncome={calculation?.netSalary || 0}
            age={35} // Dette kunne komme fra brugerinput
            riskProfile={riskProfile}
          />
        </TabsContent>

        {/* Rådgivning */}
        <TabsContent value="raadgivning" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Personlig økonomisk rådgivning
                  </CardTitle>
                  <CardDescription>Baseret på din økonomiske situation</CardDescription>
                </CardHeader>
                <CardContent>
                  {calculation ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Din økonomiske optimeringsgrad</h3>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-lg ${getOptimizationColor()}`}>{optimizationScore}%</span>
                        </div>
                      </div>
                      <Progress value={optimizationScore} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Lav optimering</span>
                        <span>Høj optimering</span>
                      </div>

                      <Separator className="my-4" />

                      {showAdvice && (
                        <div className="space-y-4">
                          {getPersonalAdvice().map((advice, index) => (
                            <div key={index} className="p-4 border rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold">{advice.title}</h4>
                                <Badge className={getPriorityColor(advice.priority)}>{advice.priority}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{advice.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground p-6">
                      <p>Indtast dine lønoplysninger for at få personlig rådgivning</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Eksportér din økonomiske rapport
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Download en detaljeret rapport med alle dine beregninger, fradrag, ekstra indtægter og
                      simuleringer.
                    </p>
                    <div className="flex gap-2">
                      <Button className="w-full" disabled={!calculation}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline" className="w-full" disabled={!calculation}>
                        <FileText className="h-4 w-4 mr-2" />
                        Send til revisor
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Langsigtet økonomisk strategi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">1. Optimér din skattestruktur</h4>
                      <p className="text-sm text-muted-foreground">
                        Udnyt alle lovlige fradragsmuligheder og overvej at strukturere din indkomst på den mest
                        skatteeffektive måde. Pensionsindbetalinger, aktiesparekonto og virksomhedsordning kan være
                        relevante værktøjer.
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">2. Diversificér dine indtægtskilder</h4>
                      <p className="text-sm text-muted-foreground">
                        Skab flere indtægtsstrømme for at reducere økonomisk risiko. Passive indtægter som udlejning,
                        investeringer eller royalties kan supplere din lønindkomst og give økonomisk frihed.
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">3. Balancér kort- og langsigtede mål</h4>
                      <p className="text-sm text-muted-foreground">
                        Planlæg din økonomi med både kort- og langsigtede mål for øje. Opbyg en nødopsparing til
                        uforudsete udgifter, samtidig med at du investerer i din pension og andre langsigtede aktiver.
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">4. Løbende kompetenceudvikling</h4>
                      <p className="text-sm text-muted-foreground">
                        Investér i din karriere gennem løbende kompetenceudvikling. Højere kvalifikationer fører typisk
                        til højere løn og bedre jobsikkerhed, hvilket er en af de bedste langsigtede investeringer.
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">5. Regelmæssig økonomisk gennemgang</h4>
                      <p className="text-sm text-muted-foreground">
                        Gennemgå din økonomiske situation mindst én gang årligt. Revurdér dine fradrag, investeringer,
                        forsikringer og pensionsordninger for at sikre, at de fortsat matcher dine behov og mål.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6 mt-6">
          <AIRecommendation data={aiRecommendation} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
