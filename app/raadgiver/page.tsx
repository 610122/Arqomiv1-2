"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Briefcase,
  Baby,
  Heart,
  Shield,
  TrendingUp,
  PiggyBank,
  Calculator,
  CreditCard,
  BarChart3,
  DollarSign,
  LineChart,
  Clock,
} from "lucide-react"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

// Definér typer for rådgivningsdata
type LifeSituation =
  | "first_job"
  | "buying_home"
  | "having_children"
  | "illness"
  | "retirement"
  | "investment"
  | "moving_together"
  | "divorce"
  | "debt_reduction"
  | "saving"
  | "career_change"
  | "business_start"

type AdvisoryArea = "pension" | "insurance" | "investment" | "budget" | "housing" | "debt" | "savings" | "cashflow"

type RiskProfile = "low" | "medium" | "high"

type DebtType = {
  id: string
  name: string
  amount: number
  interestRate: number
  minimumPayment: number
  priority?: number
}

type ExpenseType = {
  id: string
  category: "fixed" | "variable" | "savings"
  name: string
  amount: number
  essential: boolean
}

type IncomeType = {
  id: string
  source: string
  amount: number
  frequency: "monthly" | "yearly" | "weekly" | "irregular"
}

type FinancialGoal = {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: Date | null
  priority: "high" | "medium" | "low"
  category: "savings" | "debt" | "investment" | "purchase" | "other"
}

type Asset = {
  id: string
  name: string
  value: number
  type: "cash" | "investment" | "property" | "vehicle" | "other"
  liquid: boolean
}

interface UserData {
  // Basic information
  lifeSituation: LifeSituation | null
  advisoryArea: AdvisoryArea | null
  age: number
  hasChildren: boolean
  numberOfChildren: number
  income: number
  savings: number
  debt: number
  housingStatus: "renting" | "owning" | "looking" | null
  riskProfile: RiskProfile
  pensionSavings: number
  partnerIncome: number
  hasPartner: boolean

  // Detailed financial information
  monthlyExpenses: number
  detailedExpenses: ExpenseType[]
  detailedDebts: DebtType[]
  detailedIncomes: IncomeType[]
  assets: Asset[]
  financialGoals: FinancialGoal[]

  // Personal preferences
  debtRepaymentStrategy: "snowball" | "avalanche" | null
  savingPreference: "automatic" | "manual" | null
  budgetMethod: "50-30-20" | "zero-based" | "envelope" | null
  financialPriorities: string[]
  financialChallenges: string[]
  riskTolerance: number // 1-10 scale
  timeHorizon: "short" | "medium" | "long" | null

  // Behavioral aspects
  spendingTriggers: string[]
  financialAnxiety: number // 1-10 scale
  financialKnowledge: number // 1-10 scale
  automationPreference: number // 1-10 scale

  // Additional context
  employmentStatus: "employed" | "self_employed" | "unemployed" | "student" | "retired" | null
  employmentSector: string
  education: string
  healthStatus: "excellent" | "good" | "fair" | "poor" | null
  expectedMajorLifeChanges: string[]

  // Interaction preferences
  preferredContactFrequency: "weekly" | "monthly" | "quarterly" | null
  preferredAdviceStyle: "detailed" | "concise" | "visual" | null

  // Analysis results (calculated)
  netWorth: number
  debtToIncomeRatio: number
  savingsRate: number
  emergencyFundMonths: number
  cashflowStatus: "positive" | "negative" | "neutral" | null
}

// Konstanter for beregninger
const PENSION_PERCENTAGES = {
  young: {
    // Under 35 år
    low: 10,
    medium: 12,
    high: 15,
  },
  middle: {
    // 35-50 år
    low: 15,
    medium: 18,
    high: 20,
  },
  senior: {
    // Over 50 år
    low: 20,
    medium: 25,
    high: 30,
  },
}

const INSURANCE_RECOMMENDATIONS = {
  young: ["Indbo", "Ulykke", "Sundhed"],
  middle: ["Indbo", "Ulykke", "Sundhed", "Livsforsikring", "Tab af erhvervsevne"],
  senior: ["Indbo", "Ulykke", "Sundhed", "Livsforsikring"],
}

const INVESTMENT_PROFILES = {
  low: {
    stocks: 20,
    bonds: 70,
    cash: 10,
    expectedReturn: 3,
  },
  medium: {
    stocks: 60,
    bonds: 35,
    cash: 5,
    expectedReturn: 6,
  },
  high: {
    stocks: 80,
    bonds: 15,
    cash: 5,
    expectedReturn: 8,
  },
}

// Eksempel på detaljerede udgifter
const DEFAULT_EXPENSES: ExpenseType[] = [
  { id: "1", category: "fixed", name: "Husleje/boliglån", amount: 8000, essential: true },
  { id: "2", category: "fixed", name: "El, vand, varme", amount: 2000, essential: true },
  { id: "3", category: "fixed", name: "Transport", amount: 1500, essential: true },
  { id: "4", category: "fixed", name: "Forsikringer", amount: 1200, essential: true },
  { id: "5", category: "fixed", name: "Internet og telefon", amount: 800, essential: true },
  { id: "6", category: "variable", name: "Dagligvarer", amount: 3500, essential: true },
  { id: "7", category: "variable", name: "Restaurantbesøg", amount: 1500, essential: false },
  { id: "8", category: "variable", name: "Underholdning", amount: 1000, essential: false },
  { id: "9", category: "variable", name: "Tøj", amount: 800, essential: false },
  { id: "10", category: "savings", name: "Opsparing", amount: 2000, essential: true },
]

// Eksempel på detaljerede gældsposter
const DEFAULT_DEBTS: DebtType[] = [
  { id: "1", name: "Boliglån", amount: 2000000, interestRate: 3.5, minimumPayment: 8000 },
  { id: "2", name: "Billån", amount: 150000, interestRate: 5.0, minimumPayment: 2500 },
  { id: "3", name: "SU-lån", amount: 120000, interestRate: 1.0, minimumPayment: 1000 },
  { id: "4", name: "Forbrugslån", amount: 50000, interestRate: 12.0, minimumPayment: 1500 },
]

// Eksempel på indkomstkilder
const DEFAULT_INCOMES: IncomeType[] = [
  { id: "1", source: "Primær løn", amount: 32000, frequency: "monthly" },
  { id: "2", source: "Bijob", amount: 5000, frequency: "monthly" },
]

// Eksempel på aktiver
const DEFAULT_ASSETS: Asset[] = [
  { id: "1", name: "Opsparing", value: 100000, type: "cash", liquid: true },
  { id: "2", name: "Aktier", value: 200000, type: "investment", liquid: true },
  { id: "3", name: "Bolig", value: 2500000, type: "property", liquid: false },
  { id: "4", name: "Bil", value: 200000, type: "vehicle", liquid: false },
]

// Eksempel på finansielle mål
const DEFAULT_GOALS: FinancialGoal[] = [
  {
    id: "1",
    name: "Nødopsparing",
    targetAmount: 100000,
    currentAmount: 30000,
    targetDate: new Date(2024, 11, 31),
    priority: "high",
    category: "savings",
  },
  {
    id: "2",
    name: "Afbetale forbrugslån",
    targetAmount: 50000,
    currentAmount: 0,
    targetDate: new Date(2024, 5, 30),
    priority: "high",
    category: "debt",
  },
  {
    id: "3",
    name: "Ferieopsparing",
    targetAmount: 30000,
    currentAmount: 5000,
    targetDate: new Date(2024, 6, 1),
    priority: "medium",
    category: "savings",
  },
]

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
  }).format(amount)
}

// Helper function to calculate financial health score
const calculateFinancialHealthScore = (metrics: any) => {
  let score = 50 // Start with a base score

  // Adjust score based on key financial metrics
  if (metrics.cashflowStatus === "positive") {
    score += 15
  } else if (metrics.cashflowStatus === "negative") {
    score -= 15
  }

  if (metrics.emergencyFundMonths >= 6) {
    score += 10
  } else if (metrics.emergencyFundMonths < 3) {
    score -= 10
  }

  if (metrics.savingsRate >= 0.1) {
    score += 10
  } else if (metrics.savingsRate < 0) {
    score -= 10
  }

  if (metrics.debtToIncomeRatio <= 1) {
    score += 10
  } else if (metrics.debtToIncomeRatio > 2) {
    score -= 10
  }

  if (metrics.netWorth > 0) {
    score += 5
  }

  // Ensure the score stays within the 0-100 range
  return Math.max(0, Math.min(100, score))
}

// Helper function to get financial health category
const getFinancialHealthCategory = (score: number) => {
  if (score >= 80) {
    return { category: "Fremragende", color: "text-green-500" }
  } else if (score >= 60) {
    return { category: "God", color: "text-green-400" }
  } else if (score >= 40) {
    return { category: "Okay", color: "text-yellow-500" }
  } else {
    return { category: "Kritisk", color: "text-red-500" }
  }
}

// Action plan data
const actionPlan = [
  {
    title: "Opbyg en nødopsparing",
    description: "Sørg for at have en opsparing til uforudsete udgifter.",
    priority: "high",
    steps: [
      "Sæt et mål for din nødopsparing (3-6 måneders leveomkostninger).",
      "Opret en separat konto til din nødopsparing.",
      "Overfør automatisk et fast beløb til kontoen hver måned.",
    ],
    impact: "Reducerer stress og giver økonomisk sikkerhed.",
  },
  {
    title: "Reducer gæld",
    description: "Afbetal gæld med høje renter for at spare penge.",
    priority: "high",
    steps: [
      "Lav en liste over al din gæld med renter og minimumsbetalinger.",
      "Vælg en gældsafviklingsstrategi (f.eks. snebold- eller lavinemetoden).",
      "Betal mere end minimumsbeløbet på dine lån med høje renter.",
    ],
    impact: "Forbedrer din økonomiske situation og reducerer stress.",
  },
  {
    title: "Læg et budget",
    description: "Få overblik over dine indtægter og udgifter.",
    priority: "medium",
    steps: [
      "Registrer dine indtægter og udgifter i en måned.",
      "Kategoriser dine udgifter (f.eks. bolig, transport, mad).",
      "Identificer områder, hvor du kan spare penge.",
    ],
    impact: "Giver dig kontrol over din økonomi og hjælper dig med at nå dine mål.",
  },
  {
    title: "Invester i din fremtid",
    description: "Start med at investere tidligt for at drage fordel af renters rente.",
    priority: "medium",
    steps: [
      "Sæt dig et investeringsmål (f.eks. pension, boligkøb).",
      "Vælg en investeringsstrategi, der passer til din risikoprofil.",
      "Invester regelmæssigt et fast beløb i aktier, obligationer eller investeringsfonde.",
    ],
    impact: "Sikrer din økonomiske fremtid og hjælper dig med at nå dine langsigtede mål.",
  },
  {
    title: "Gennemgå dine forsikringer",
    description: "Sørg for at du har de nødvendige forsikringer.",
    priority: "low",
    steps: [
      "Lav en liste over dine forsikringer (f.eks. indbo, ulykke, bil).",
      "Sammenlign priser og dækninger fra forskellige selskaber.",
      "Juster dine forsikringer efter dine behov.",
    ],
    impact: "Beskytter dig mod økonomiske tab i tilfælde af uheld.",
  },
]

function PersonalAdvisorContent() {
  const [step, setStep] = useState(1)
  const [showResults, setShowResults] = useState(false)
  const [userData, setUserData] = useState<UserData>({
    // Basic information
    lifeSituation: null,
    advisoryArea: null,
    age: 30,
    hasChildren: false,
    numberOfChildren: 0,
    income: 400000,
    savings: 100000,
    debt: 0,
    housingStatus: null,
    riskProfile: "medium",
    pensionSavings: 200000,
    partnerIncome: 0,
    hasPartner: false,

    // Detailed financial information
    monthlyExpenses: 22300, // Sum of default expenses
    detailedExpenses: DEFAULT_EXPENSES,
    detailedDebts: DEFAULT_DEBTS,
    detailedIncomes: DEFAULT_INCOMES,
    assets: DEFAULT_ASSETS,
    financialGoals: DEFAULT_GOALS,

    // Personal preferences
    debtRepaymentStrategy: null,
    savingPreference: null,
    budgetMethod: null,
    financialPriorities: [],
    financialChallenges: [],
    riskTolerance: 5,
    timeHorizon: null,

    // Behavioral aspects
    spendingTriggers: [],
    financialAnxiety: 5,
    financialKnowledge: 5,
    automationPreference: 7,

    // Additional context
    employmentStatus: null,
    employmentSector: "",
    education: "",
    healthStatus: null,
    expectedMajorLifeChanges: [],

    // Interaction preferences
    preferredContactFrequency: null,
    preferredAdviceStyle: null,

    // Analysis results (calculated)
    netWorth: 0, // Will be calculated
    debtToIncomeRatio: 0, // Will be calculated
    savingsRate: 0, // Will be calculated
    emergencyFundMonths: 0, // Will be calculated
    cashflowStatus: null, // Will be calculated
  })

  // Calculate derived financial metrics
  const calculateFinancialMetrics = () => {
    // Calculate total debt
    const totalDebt = userData.detailedDebts.reduce((sum, debt) => sum + debt.amount, 0)

    // Calculate total assets
    const totalAssets = userData.assets.reduce((sum, asset) => sum + asset.value, 0)

    // Calculate net worth
    const netWorth = totalAssets - totalDebt

    // Calculate debt-to-income ratio
    const annualIncome = userData.detailedIncomes.reduce(
      (sum, income) => sum + (income.frequency === "monthly" ? income.amount * 12 : income.amount),
      0,
    )
    const debtToIncomeRatio = totalDebt / (annualIncome > 0 ? annualIncome : 1)

    // Calculate savings rate
    const monthlySavings = userData.detailedExpenses
      .filter((expense) => expense.category === "savings")
      .reduce((sum, expense) => sum + expense.amount, 0)
    const monthlyIncome = userData.detailedIncomes.reduce(
      (sum, income) => sum + (income.frequency === "monthly" ? income.amount : income.amount / 12),
      0,
    )
    const savingsRate = monthlyIncome > 0 ? monthlySavings / monthlyIncome : 0

    // Calculate emergency fund months
    const monthlyEssentialExpenses = userData.detailedExpenses
      .filter((expense) => expense.essential)
      .reduce((sum, expense) => sum + expense.amount, 0)
    const emergencyFund = userData.assets
      .filter((asset) => asset.liquid && asset.type === "cash")
      .reduce((sum, asset) => sum + asset.value, 0)
    const emergencyFundMonths = monthlyEssentialExpenses > 0 ? emergencyFund / monthlyEssentialExpenses : 0

    // Calculate cashflow status
    const totalMonthlyExpenses = userData.detailedExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const cashflowStatus =
      monthlyIncome > totalMonthlyExpenses ? "positive" : monthlyIncome < totalMonthlyExpenses ? "negative" : "neutral"

    return {
      netWorth,
      debtToIncomeRatio,
      savingsRate,
      emergencyFundMonths,
      cashflowStatus,
      totalDebt,
      totalAssets,
      monthlyIncome,
      totalMonthlyExpenses,
      monthlySavings,
      monthlyEssentialExpenses,
      emergencyFund,
    }
  }

  const metrics = calculateFinancialMetrics()

  const totalSteps = 7
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Update calculated metrics before showing results
      const metrics = calculateFinancialMetrics()
      setUserData((prev) => ({
        ...prev,
        netWorth: metrics.netWorth,
        debtToIncomeRatio: metrics.debtToIncomeRatio,
        savingsRate: metrics.savingsRate,
        emergencyFundMonths: metrics.emergencyFundMonths,
        cashflowStatus: metrics.cashflowStatus,
      }))
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

  const updateUserData = (field: keyof UserData, value: any) => {
    setUserData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 flex items-center">
        <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbage til forsiden
        </Link>
        <h1 className="ml-auto text-2xl font-bold tracking-tight">Min Personlige Økonomiske Rådgiver</h1>
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
                <CardTitle>Hvilken økonomisk situation står du i?</CardTitle>
                <CardDescription>
                  Vælg den situation, der bedst beskriver din nuværende økonomiske situation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={userData.lifeSituation === "first_job" ? "default" : "outline"}
                          className="h-24 flex-col"
                          onClick={() => updateUserData("lifeSituation", "first_job")}
                        >
                          <Briefcase className="mb-2 h-6 w-6" />
                          <span>Første job</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Du er ny på arbejdsmarkedet og skal i gang med din karriere</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={userData.lifeSituation === "buying_home" ? "default" : "outline"}
                          className="h-24 flex-col"
                          onClick={() => updateUserData("lifeSituation", "buying_home")}
                        >
                          <Home className="mb-2 h-6 w-6" />
                          <span>Købe bolig</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Du overvejer at købe bolig eller er i gang med boligkøb</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={userData.lifeSituation === "having_children" ? "default" : "outline"}
                          className="h-24 flex-col"
                          onClick={() => updateUserData("lifeSituation", "having_children")}
                        >
                          <Baby className="mb-2 h-6 w-6" />
                          <span>Få børn</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Du venter barn eller har små børn</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={userData.lifeSituation === "moving_together" ? "default" : "outline"}
                          className="h-24 flex-col"
                          onClick={() => updateUserData("lifeSituation", "moving_together")}
                        >
                          <Heart className="mb-2 h-6 w-6" />
                          <span>Flytte sammen</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Du skal flytte sammen med din partner</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={userData.lifeSituation === "investment" ? "default" : "outline"}
                          className="h-24 flex-col"
                          onClick={() => updateUserData("lifeSituation", "investment")}
                        >
                          <TrendingUp className="mb-2 h-6 w-6" />
                          <span>Investering</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Du vil i gang med at investere eller optimere dine investeringer</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={userData.lifeSituation === "debt_reduction" ? "default" : "outline"}
                          className="h-24 flex-col"
                          onClick={() => updateUserData("lifeSituation", "debt_reduction")}
                        >
                          <CreditCard className="mb-2 h-6 w-6" />
                          <span>Gældsafvikling</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Du ønsker at reducere eller afvikle din gæld</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={userData.lifeSituation === "saving" ? "default" : "outline"}
                          className="h-24 flex-col"
                          onClick={() => updateUserData("lifeSituation", "saving")}
                        >
                          <PiggyBank className="mb-2 h-6 w-6" />
                          <span>Opsparing</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Du vil opbygge opsparing til fremtidige mål</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={userData.lifeSituation === "retirement" ? "default" : "outline"}
                          className="h-24 flex-col"
                          onClick={() => updateUserData("lifeSituation", "retirement")}
                        >
                          <Clock className="mb-2 h-6 w-6" />
                          <span>Pension</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Du nærmer dig pensionsalderen eller er gået på pension</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div></div>
                <Button onClick={handleNext} disabled={!userData.lifeSituation}>
                  Næste
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Hvad vil du gerne have hjælp til?</CardTitle>
                <CardDescription>Vælg det område, du primært ønsker rådgivning om</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Button
                    variant={userData.advisoryArea === "budget" ? "default" : "outline"}
                    className="h-20 flex-col"
                    onClick={() => updateUserData("advisoryArea", "budget")}
                  >
                    <Calculator className="mb-2 h-5 w-5" />
                    <span>Budget</span>
                  </Button>

                  <Button
                    variant={userData.advisoryArea === "debt" ? "default" : "outline"}
                    className="h-20 flex-col"
                    onClick={() => updateUserData("advisoryArea", "debt")}
                  >
                    <CreditCard className="mb-2 h-5 w-5" />
                    <span>Gældsafvikling</span>
                  </Button>

                  <Button
                    variant={userData.advisoryArea === "savings" ? "default" : "outline"}
                    className="h-20 flex-col"
                    onClick={() => updateUserData("advisoryArea", "savings")}
                  >
                    <PiggyBank className="mb-2 h-5 w-5" />
                    <span>Opsparing</span>
                  </Button>

                  <Button
                    variant={userData.advisoryArea === "investment" ? "default" : "outline"}
                    className="h-20 flex-col"
                    onClick={() => updateUserData("advisoryArea", "investment")}
                  >
                    <TrendingUp className="mb-2 h-5 w-5" />
                    <span>Investering</span>
                  </Button>

                  <Button
                    variant={userData.advisoryArea === "cashflow" ? "default" : "outline"}
                    className="h-20 flex-col"
                    onClick={() => updateUserData("advisoryArea", "cashflow")}
                  >
                    <BarChart3 className="mb-2 h-5 w-5" />
                    <span>Likviditet</span>
                  </Button>

                  <Button
                    variant={userData.advisoryArea === "housing" ? "default" : "outline"}
                    className="h-20 flex-col"
                    onClick={() => updateUserData("advisoryArea", "housing")}
                  >
                    <Home className="mb-2 h-5 w-5" />
                    <span>Boligøkonomi</span>
                  </Button>

                  <Button
                    variant={userData.advisoryArea === "pension" ? "default" : "outline"}
                    className="h-20 flex-col"
                    onClick={() => updateUserData("advisoryArea", "pension")}
                  >
                    <Clock className="mb-2 h-5 w-5" />
                    <span>Pension</span>
                  </Button>

                  <Button
                    variant={userData.advisoryArea === "insurance" ? "default" : "outline"}
                    className="h-20 flex-col"
                    onClick={() => updateUserData("advisoryArea", "insurance")}
                  >
                    <Shield className="mb-2 h-5 w-5" />
                    <span>Forsikring</span>
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tilbage
                </Button>
                <Button onClick={handleNext} disabled={!userData.advisoryArea}>
                  Næste
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Fortæl os om dig selv</CardTitle>
                <CardDescription>Disse oplysninger hjælper os med at give dig personlig rådgivning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="income">Årlig indkomst før skat: {formatCurrency(userData.income)}</Label>
                    <Slider
                      id="income"
                      min={100000}
                      max={2000000}
                      step={10000}
                      value={[userData.income]}
                      onValueChange={(value) => updateUserData("income", value[0])}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>100.000 kr.</span>
                      <span>2.000.000 kr.</span>
                    </div>
                  </div>

                  {userData.hasPartner && (
                    <div>
                      <Label htmlFor="partner-income">
                        Partners årlige indkomst før skat: {formatCurrency(userData.partnerIncome)}
                      </Label>
                      <Slider
                        id="partner-income"
                        min={0}
                        max={2000000}
                        step={10000}
                        value={[userData.partnerIncome]}
                        onValueChange={(value) => updateUserData("partnerIncome", value[0])}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0 kr.</span>
                        <span>2.000.000 kr.</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="savings">Opsparing: {formatCurrency(userData.savings)}</Label>
                    <Slider
                      id="savings"
                      min={0}
                      max={5000000}
                      step={10000}
                      value={[userData.savings]}
                      onValueChange={(value) => updateUserData("savings", value[0])}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0 kr.</span>
                      <span>5.000.000 kr.</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pension-savings">
                      Pensionsopsparing: {formatCurrency(userData.pensionSavings)}
                    </Label>
                    <Slider
                      id="pension-savings"
                      min={0}
                      max={10000000}
                      step={50000}
                      value={[userData.pensionSavings]}
                      onValueChange={(value) => updateUserData("pensionSavings", value[0])}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0 kr.</span>
                      <span>10.000.000 kr.</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="debt">Gæld (ekskl. boliglån): {formatCurrency(userData.debt)}</Label>
                    <Slider
                      id="debt"
                      min={0}
                      max={2000000}
                      step={10000}
                      value={[userData.debt]}
                      onValueChange={(value) => updateUserData("debt", value[0])}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0 kr.</span>
                      <span>2.000.000 kr.</span>
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
                <CardTitle>Din risikoprofil</CardTitle>
                <CardDescription>Vælg den risikoprofil, der passer bedst til dig</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={userData.riskProfile}
                  onValueChange={(value) => updateUserData("riskProfile", value as RiskProfile)}
                  className="space-y-4"
                >
                  <div className="flex items-start space-x-3 rounded-md border p-4">
                    <RadioGroupItem value="low" id="risk-low" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="risk-low" className="font-medium">
                        Lav risiko
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Du foretrækker stabilitet og sikkerhed frem for høje afkast. Du er ikke komfortabel med store
                        udsving i dine investeringer.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 rounded-md border p-4">
                    <RadioGroupItem value="medium" id="risk-medium" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="risk-medium" className="font-medium">
                        Moderat risiko
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Du søger en balance mellem vækst og stabilitet. Du kan acceptere moderate udsving for at opnå
                        bedre afkast på længere sigt.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 rounded-md border p-4">
                    <RadioGroupItem value="high" id="risk-high" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="risk-high" className="font-medium">
                        Høj risiko
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Du prioriterer vækst og højt afkast. Du er komfortabel med betydelige udsving og er villig til
                        at tage større risici for potentielt højere afkast.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tilbage
                </Button>
                <Button onClick={handleNext}>
                  Se resultater
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Dine udgifter</CardTitle>
                <CardDescription>Fortæl os om dine månedlige udgifter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="monthly-expenses">
                      Månedlige udgifter: {formatCurrency(userData.monthlyExpenses)}
                    </Label>
                    <Slider
                      id="monthly-expenses"
                      min={5000}
                      max={100000}
                      step={1000}
                      value={[userData.monthlyExpenses]}
                      onValueChange={(value) => updateUserData("monthlyExpenses", value[0])}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5.000 kr.</span>
                      <span>100.000 kr.</span>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="fixed-expenses">Faste udgifter</Label>
                      <div className="text-2xl font-bold mt-2">
                        {formatCurrency(
                          userData.detailedExpenses
                            .filter((e) => e.category === "fixed")
                            .reduce((sum, e) => sum + e.amount, 0),
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="variable-expenses">Variable udgifter</Label>
                      <div className="text-2xl font-bold mt-2">
                        {formatCurrency(
                          userData.detailedExpenses
                            .filter((e) => e.category === "variable")
                            .reduce((sum, e) => sum + e.amount, 0),
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="savings-expenses">Opsparing</Label>
                      <div className="text-2xl font-bold mt-2">
                        {formatCurrency(
                          userData.detailedExpenses
                            .filter((e) => e.category === "savings")
                            .reduce((sum, e) => sum + e.amount, 0),
                        )}
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

          {step === 6 && (
            <Card>
              <CardHeader>
                <CardTitle>Dine finansielle mål</CardTitle>
                <CardDescription>Fortæl os om dine økonomiske mål</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="text-md font-medium mb-2">Dine mål</h3>
                    <div className="space-y-4">
                      {userData.financialGoals.map((goal, index) => (
                        <div key={goal.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{goal.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Mål: {formatCurrency(goal.targetAmount)} | Nuværende: {formatCurrency(goal.currentAmount)}
                            </p>
                          </div>
                          <div>
                            <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-2 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="time-horizon">Tidshorisont for dine økonomiske mål</Label>
                    <RadioGroup
                      id="time-horizon"
                      value={userData.timeHorizon || ""}
                      onValueChange={(value) => updateUserData("timeHorizon", value as UserData["timeHorizon"])}
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="short" id="short" />
                        <Label htmlFor="short">Kort sigt (0-2 år)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium">Mellemlang sigt (2-5 år)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="long" id="long" />
                        <Label htmlFor="long">Lang sigt (5+ år)</Label>
                      </div>
                    </RadioGroup>
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

          {step === 7 && (
            <Card>
              <CardHeader>
                <CardTitle>Opsummering</CardTitle>
                <CardDescription>Gennemgå dine oplysninger før vi genererer din personlige rådgivning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium">Økonomisk situation</h3>
                      <p className="text-sm text-muted-foreground">
                        {userData.lifeSituation === "first_job"
                          ? "Første job"
                          : userData.lifeSituation === "buying_home"
                            ? "Købe bolig"
                            : userData.lifeSituation === "having_children"
                              ? "Få børn"
                              : userData.lifeSituation === "moving_together"
                                ? "Flytte sammen"
                                : userData.lifeSituation === "investment"
                                  ? "Investering"
                                  : userData.lifeSituation === "debt_reduction"
                                    ? "Gældsafvikling"
                                    : userData.lifeSituation === "saving"
                                      ? "Opsparing"
                                      : userData.lifeSituation === "retirement"
                                        ? "Pension"
                                        : ""}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Rådgivningsområde</h3>
                      <p className="text-sm text-muted-foreground">
                        {userData.advisoryArea === "budget"
                          ? "Budget"
                          : userData.advisoryArea === "debt"
                            ? "Gældsafvikling"
                            : userData.advisoryArea === "savings"
                              ? "Opsparing"
                              : userData.advisoryArea === "investment"
                                ? "Investering"
                                : userData.advisoryArea === "cashflow"
                                  ? "Likviditet"
                                  : userData.advisoryArea === "housing"
                                    ? "Boligøkonomi"
                                    : userData.advisoryArea === "pension"
                                      ? "Pension"
                                      : userData.advisoryArea === "insurance"
                                        ? "Forsikring"
                                        : ""}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium">Indkomst</h3>
                      <p className="text-sm">{formatCurrency(userData.income)} årligt</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Opsparing</h3>
                      <p className="text-sm">{formatCurrency(userData.savings)}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium">Gæld</h3>
                      <p className="text-sm">{formatCurrency(userData.debt)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Risikoprofil</h3>
                      <p className="text-sm">
                        {userData.riskProfile === "low" ? "Lav" : userData.riskProfile === "medium" ? "Moderat" : "Høj"}
                      </p>
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
                  Generer rådgivning
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
              <CardTitle>Din personlige økonomiske rådgivning</CardTitle>
              <CardDescription>
                Baseret på dine svar har vi udarbejdet følgende økonomiske analyse og anbefalinger
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
                  <TabsTrigger value="overview">Overblik</TabsTrigger>
                  <TabsTrigger value="budget">Budget</TabsTrigger>
                  <TabsTrigger value="debt">Gæld</TabsTrigger>
                  <TabsTrigger value="savings">Opsparing</TabsTrigger>
                  <TabsTrigger value="investments">Investering</TabsTrigger>
                  <TabsTrigger value="goals">Mål</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 pt-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nettoformue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(metrics.netWorth)}</div>
                        <p className="text-xs text-muted-foreground">
                          Aktiver: {formatCurrency(metrics.totalAssets)} | Gæld: {formatCurrency(metrics.totalDebt)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Månedlig pengestrøm</CardTitle>
                        <LineChart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(metrics.monthlyIncome - metrics.totalMonthlyExpenses)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Indkomst: {formatCurrency(metrics.monthlyIncome)} | Udgifter:{" "}
                          {formatCurrency(metrics.totalMonthlyExpenses)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Opsparingsrate</CardTitle>
                        <PiggyBank className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{(metrics.savingsRate * 100).toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                          {metrics.savingsRate >= 0.2
                            ? "Excellent"
                            : metrics.savingsRate >= 0.1
                              ? "God"
                              : metrics.savingsRate > 0
                                ? "Kan forbedres"
                                : "Kritisk"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nødopsparing</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{metrics.emergencyFundMonths.toFixed(1)} måneder</div>
                        <p className="text-xs text-muted-foreground">
                          {metrics.emergencyFundMonths >= 6
                            ? "Excellent"
                            : metrics.emergencyFundMonths >= 3
                              ? "God"
                              : metrics.emergencyFundMonths >= 1
                                ? "Kan forbedres"
                                : "Kritisk"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="col-span-1">
                      <CardHeader>
                        <CardTitle>Økonomisk sundhedsscore</CardTitle>
                        <CardDescription>Baseret på din samlede økonomiske situation</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center justify-between mb-2">
                          <span>Score: {calculateFinancialHealthScore(metrics)}/100</span>
                          <span className={getFinancialHealthCategory(calculateFinancialHealthScore(metrics)).color}>
                            {getFinancialHealthCategory(calculateFinancialHealthScore(metrics)).category}
                          </span>
                        </div>
                        <Progress value={calculateFinancialHealthScore(metrics)} className="h-2" />
                      </CardContent>
                    </Card>

                    <Card className="col-span-1">
                      <CardHeader>
                        <CardTitle>Budget fordeling</CardTitle>
                        <CardDescription>Hvordan dine penge fordeles</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[180px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  {
                                    name: "Faste udgifter",
                                    value: userData.detailedExpenses
                                      .filter((e) => e.category === "fixed")
                                      .reduce((sum, e) => sum + e.amount, 0),
                                  },
                                  {
                                    name: "Variable udgifter",
                                    value: userData.detailedExpenses
                                      .filter((e) => e.category === "variable")
                                      .reduce((sum, e) => sum + e.amount, 0),
                                  },
                                  {
                                    name: "Opsparing",
                                    value: userData.detailedExpenses
                                      .filter((e) => e.category === "savings")
                                      .reduce((sum, e) => sum + e.amount, 0),
                                  },
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                <Cell key="cell-0" fill="#3b82f6" />
                                <Cell key="cell-1" fill="#f97316" />
                                <Cell key="cell-2" fill="#10b981" />
                              </Pie>
                              <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Handlingsplan</CardTitle>
                      <CardDescription>Prioriterede anbefalinger baseret på din økonomiske situation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        {actionPlan.map((action, index) => (
                          <div key={index} className="space-y-3">
                            <div className="flex items-start">
                              <Badge
                                variant="outline"
                                className={`mr-2 ${
                                  action.priority === "high"
                                    ? "border-red-500 text-red-500"
                                    : action.priority === "medium"
                                      ? "border-yellow-500 text-yellow-500"
                                      : "border-blue-500 text-blue-500"
                                }`}
                              >
                                {action.priority === "high"
                                  ? "Høj prioritet"
                                  : action.priority === "medium"
                                    ? "Medium prioritet"
                                    : "Lav prioritet"}
                              </Badge>
                              <h3 className="text-lg font-medium">{action.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Trin:</h4>
                              <ul className="list-disc pl-5 space-y-1 text-sm">
                                {action.steps.map((step, stepIndex) => (
                                  <li key={stepIndex}>{step}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Effekt: </span>
                              <span className="text-muted-foreground">{action.impact}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="budget" className="space-y-6 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Budgetanalyse</CardTitle>
                      <CardDescription>Analyse af din nuværende budgetsituation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Månedlig indkomst</h3>
                          <div className="text-2xl font-bold">{formatCurrency(metrics.monthlyIncome)}</div>
                          <p className="text-xs text-muted-foreground">
                            {userData.detailedIncomes.length} indkomstkilder
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Månedlige udgifter</h3>
                          <div className="text-2xl font-bold">{formatCurrency(metrics.totalMonthlyExpenses)}</div>
                          <p className="text-xs text-muted-foreground">
                            {userData.detailedExpenses.length} udgiftsposter
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Månedlig balance</h3>
                          <div className="text-2xl font-bold">
                            {formatCurrency(metrics.monthlyIncome - metrics.totalMonthlyExpenses)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {metrics.cashflowStatus === "positive"
                              ? "Positiv pengestrøm"
                              : metrics.cashflowStatus === "negative"
                                ? "Negativ pengestrøm"
                                : "Neutral pengestrøm"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="debt" className="space-y-6 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gældsanalyse</CardTitle>
                      <CardDescription>Oversigt over din gæld og anbefalinger til afvikling</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Samlet gæld</h3>
                          <div className="text-2xl font-bold">{formatCurrency(metrics.totalDebt)}</div>
                          <p className="text-xs text-muted-foreground">
                            Fordelt på {userData.detailedDebts.length} lån
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Gæld-til-indkomst forhold</h3>
                          <div className="text-2xl font-bold">{(metrics.debtToIncomeRatio * 100).toFixed(1)}%</div>
                          <p className="text-xs text-muted-foreground">
                            {metrics.debtToIncomeRatio > 2 ? "Højt - bør reduceres" : "Moderat - hold øje med det"}
                          </p>
                        </div>
                      </div>

                      <div className="border rounded-md p-4">
                        <h3 className="text-md font-medium mb-2">Gældsposter</h3>
                        <div className="space-y-4">
                          {userData.detailedDebts.map((debt) => (
                            <div key={debt.id} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{debt.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Rente: {debt.interestRate}% | Ydelse: {formatCurrency(debt.minimumPayment)}
                                </p>
                              </div>
                              <div>{formatCurrency(debt.amount)}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-md bg-blue-50 p-3 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                        <p className="font-medium">Anbefaling</p>
                        <p className="text-sm">
                          Overvej at bruge{" "}
                          {userData.debtRepaymentStrategy === "snowball"
                            ? "sneboldsmetoden (fokus på mindste lån)"
                            : "snestormsmetoden (fokus på højeste rente)"}{" "}
                          for at afvikle din gæld hurtigere.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="savings" className="space-y-6 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Opsparingsanalyse</CardTitle>
                      <CardDescription>Oversigt over din opsparing og anbefalinger til forbedring</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Samlet opsparing</h3>
                          <div className="text-2xl font-bold">{formatCurrency(metrics.emergencyFund)}</div>
                          <p className="text-xs text-muted-foreground">
                            Likvide aktiver tilgængelige for nødsituationer
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Opsparingsrate</h3>
                          <div className="text-2xl font-bold">{(metrics.savingsRate * 100).toFixed(1)}%</div>
                          <p className="text-xs text-muted-foreground">Andel af din indkomst, der spares hver måned</p>
                        </div>
                      </div>

                      <div className="border rounded-md p-4">
                        <h3 className="text-md font-medium mb-2">Opsparingsmål</h3>
                        <div className="space-y-4">
                          {userData.financialGoals
                            .filter((goal) => goal.category === "savings")
                            .map((goal) => (
                              <div key={goal.id} className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{goal.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Mål: {formatCurrency(goal.targetAmount)} | Nuværende:{" "}
                                    {formatCurrency(goal.currentAmount)}
                                  </p>
                                </div>
                                <div>
                                  <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-2" />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="rounded-md bg-blue-50 p-3 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                        <p className="font-medium">Anbefaling</p>
                        <p className="text-sm">
                          Sikr en nødopsparing svarende til 3-6 måneders nødvendige udgifter. Overvej derefter at
                          automatisere din opsparing for at nå dine mål hurtigere.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="investments" className="space-y-6 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Investeringsanalyse</CardTitle>
                      <CardDescription>Oversigt over dine investeringer og anbefalinger til optimering</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Samlede investeringer</h3>
                          <div className="text-2xl font-bold">{formatCurrency(userData.savings)}</div>
                          <p className="text-xs text-muted-foreground">Fordelt på forskellige aktivtyper</p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Risikoprofil</h3>
                          <div className="text-2xl font-bold">
                            {userData.riskProfile === "low"
                              ? "Lav"
                              : userData.riskProfile === "medium"
                                ? "Moderat"
                                : "Høj"}
                          </div>
                          <p className="text-xs text-muted-foreground">Baseret på din risikotolerance</p>
                        </div>
                      </div>

                      <div className="border rounded-md p-4">
                        <h3 className="text-md font-medium mb-2">Investeringsmål</h3>
                        <div className="space-y-4">
                          {userData.financialGoals
                            .filter((goal) => goal.category === "investment")
                            .map((goal) => (
                              <div key={goal.id} className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{goal.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Mål: {formatCurrency(goal.targetAmount)} | Nuværende:{" "}
                                    {formatCurrency(goal.currentAmount)}
                                  </p>
                                </div>
                                <div>
                                  <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-2" />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="rounded-md bg-blue-50 p-3 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                        <p className="font-medium">Anbefaling</p>
                        <p className="text-sm">
                          Diversificer dine investeringer på tværs af forskellige aktivklasser for at reducere risikoen.
                          Overvej at investere i indeksfonde eller ETF'er for lavomkostnings diversificering.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="goals" className="space-y-6 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Dine økonomiske mål</CardTitle>
                      <CardDescription>Oversigt over dine definerede mål og anbefalinger</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        {userData.financialGoals.map((goal) => (
                          <div key={goal.id} className="border rounded-md p-4">
                            <h3 className="text-md font-medium mb-2">{goal.name}</h3>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Målbeløb</p>
                                <div className="font-medium">{formatCurrency(goal.targetAmount)}</div>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Nuværende opsparing</p>
                                <div className="font-medium">{formatCurrency(goal.currentAmount)}</div>
                              </div>
                            </div>
                            <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-2 mt-2" />
                            <p className="text-xs text-muted-foreground">
                              {((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}% nået
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-md bg-blue-50 p-3 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                        <p className="font-medium">Anbefaling</p>
                        <p className="text-sm">
                          Prioriter dine mål baseret på vigtighed og tidshorisont. Opdel store mål i mindre, mere
                          håndterbare delmål.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                Start forfra
              </Button>
              <Button onClick={() => window.print()}>Udskriv rådgivning</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function RaadgiverPage() {
  return <PersonalAdvisorContent />
}
