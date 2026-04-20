"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, HelpCircle, ArrowRight, Car, Home, CreditCard, Building, Landmark, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { CalculatorTracker } from "@/components/calculator-tracker"
import { AIRecommendation } from "@/components/ai-recommendation"
import { ScenarioCompare, type Scenario } from "@/components/scenario-compare"
import { analyzeLaan } from "@/lib/ai-engines"

// Definér typer for lånedata
interface LoanData {
  loanAmount: number
  loanTerm: number
  interestRate: number
  loanType: string
  paymentFrequency: string
  setupFee: number
  administrationFee: number
  registrationFee: number
  courseRate: number
  monthlyFee: number
  taxDeduction: boolean
  taxDeductionRate: number
  earlyRepayment: number
  earlyRepaymentYear: number
  inflationRate: number
  propertyValue: number
  propertyValueGrowth: number
  includePropertyTax: boolean
  propertyTaxRate: number
  includePropertyInsurance: boolean
  propertyInsurance: number
  includeHomeownersAssociation: boolean
  homeownersAssociation: number
  loanPurpose: string
  downPayment: number
  interestOnly: boolean
  interestOnlyPeriod: number
  adjustableRateType: string
  adjustableRateSpread: number
  adjustableRateInterval: number
  adjustableRateMax: number
  adjustableRateMin: number
  loanStartDate: string

  // New properties for affordability analysis
  monthlyIncome: number
  otherMonthlyExpenses: number
  existingDebt: number
  existingDebtPayments: number
  creditScore: number // 1-10 scale
  employmentStatus: string // "fast", "midlertidig", "selvstændig", "pensionist", "studerende", "andet"
  employmentYears: number
  savingsAmount: number

  // Car loan specific properties
  carValue?: number
  carAge?: number
  carType?: string // "new", "used"
  carInsurance?: number
  carTax?: number
  carMaintenance?: number
  carFuel?: number

  // Home loan specific properties
  propertyType?: string // "house", "apartment", "summerhouse"
  propertySize?: number
  propertyAge?: number
  energyRating?: string // "A", "B", "C", "D", "E", "F", "G"
  renovationCosts?: number
  propertyLocation?: string // "city", "suburb", "rural"

  // Consumer loan specific properties
  consumerLoanPurpose?: string // "renovation", "electronics", "travel", "education", "other"
  consumerLoanCollateral?: boolean
  consumerLoanCollateralValue?: number

  // Bank loan specific properties
  bankLoanPurpose?: string
  bankLoanCollateral?: boolean
  bankLoanCollateralValue?: number
  bankLoanGuarantor?: boolean

  // Mortgage loan specific properties
  mortgageType?: string // "fast", "variabel", "F1", "F3", "F5"
  mortgageBondType?: string // "traditionel", "flexibel"
  mortgageAuctionDate?: string
  mortgageRefinancing?: boolean
}

// Definér typer for sammenligningslån
interface ComparisonLoan {
  id: string
  name: string
  data: LoanData
  color: string
}

export default function LoanCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <CalculatorTracker calculatorName="laan" />
      <h1 className="text-3xl font-bold mb-6">Låneberegner</h1>
      <LoanCalculator />
    </div>
  )
}

function LoanCalculator() {
  const [step, setStep] = useState(1)
  const [showResults, setShowResults] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [activeTab, setActiveTab] = useState("oversigt")
  const [comparisonLoans, setComparisonLoans] = useState<ComparisonLoan[]>([])
  const [currentLoanId, setCurrentLoanId] = useState("primary")
  const { toast } = useToast()

  // Standardfarver til sammenligning
  const comparisonColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"]

  // Initialiser lånedata med standardværdier
  const initialLoanData: LoanData = {
    loanAmount: 1000000,
    loanTerm: 30,
    interestRate: 3.5,
    loanType: "annuitet",
    paymentFrequency: "monthly",
    setupFee: 10000,
    administrationFee: 0.5,
    registrationFee: 4500,
    courseRate: 98.5,
    monthlyFee: 30,
    taxDeduction: true,
    taxDeductionRate: 33,
    earlyRepayment: 0,
    earlyRepaymentYear: 0,
    inflationRate: 2,
    propertyValue: 1250000,
    propertyValueGrowth: 2,
    includePropertyTax: false,
    propertyTaxRate: 1.2,
    includePropertyInsurance: false,
    propertyInsurance: 3600,
    includeHomeownersAssociation: false,
    homeownersAssociation: 2400,
    loanPurpose: "boligkøb",
    downPayment: 250000,
    interestOnly: false,
    interestOnlyPeriod: 10,
    adjustableRateType: "none",
    adjustableRateSpread: 1,
    adjustableRateInterval: 5,
    adjustableRateMax: 6,
    adjustableRateMin: 1,
    loanStartDate: new Date().toISOString().split("T")[0],

    // Default values for new fields
    monthlyIncome: 35000,
    otherMonthlyExpenses: 10000,
    existingDebt: 200000,
    existingDebtPayments: 3000,
    creditScore: 7,
    employmentStatus: "fast",
    employmentYears: 5,
    savingsAmount: 300000,
  }

  const [loanData, setLoanData] = useState<LoanData>(initialLoanData)
  const [loanCategory, setLoanCategory] = useState<string>("general")

  const aiRecommendation = useMemo(
    () =>
      analyzeLaan({
        loanAmount: loanData.loanAmount,
        interestRate: loanData.interestRate,
        loanTerm: loanData.loanTerm,
        monthlyIncome: loanData.monthlyIncome,
        monthlyExpenses: loanData.otherMonthlyExpenses + loanData.existingDebtPayments,
        downPayment: loanData.downPayment,
        propertyValue: loanData.propertyValue,
      }),
    [
      loanData.loanAmount,
      loanData.interestRate,
      loanData.loanTerm,
      loanData.monthlyIncome,
      loanData.otherMonthlyExpenses,
      loanData.existingDebtPayments,
      loanData.downPayment,
      loanData.propertyValue,
    ],
  )

  // Beregn månedlig ydelse for annuitetslån
  const calculateMonthlyPayment = (data: LoanData = loanData) => {
    if (data.interestOnly && data.loanTerm <= data.interestOnlyPeriod) {
      // Hvis hele lånet er afdragsfrit
      return (data.loanAmount * data.interestRate) / 100 / 12
    }

    const monthlyRate = data.interestRate / 100 / 12
    const numberOfPayments = data.loanTerm * 12

    // Sikring mod division-by-zero når renten er 0 %
    if (monthlyRate === 0) {
      if (numberOfPayments === 0) return 0
      if (data.interestOnly && data.interestOnlyPeriod > 0) {
        const remainingPayments = (data.loanTerm - data.interestOnlyPeriod) * 12
        if (remainingPayments <= 0) return 0
        return data.loanAmount / remainingPayments
      }
      return data.loanAmount / numberOfPayments
    }

    if (data.interestOnly && data.interestOnlyPeriod > 0) {
      // Beregn for afdragsfri periode + afdragsperiode
      const remainingTerm = data.loanTerm - data.interestOnlyPeriod
      const remainingPayments = remainingTerm * 12

      if (data.interestOnlyPeriod >= data.loanTerm) {
        return data.loanAmount * monthlyRate
      } else {
        return (data.loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -remainingPayments))
      }
    } else {
      // Standard annuitetslån
      return (data.loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numberOfPayments))
    }
  }

  // Beregn månedlig ydelse for serielån
  const calculateSerialLoanPayment = (month: number, data: LoanData = loanData) => {
    if (data.interestOnly && month < data.interestOnlyPeriod * 12) {
      // Afdragsfri periode
      return (data.loanAmount * data.interestRate) / 100 / 12
    }

    let effectiveMonth = month
    if (data.interestOnly) {
      effectiveMonth = month - data.interestOnlyPeriod * 12
      if (effectiveMonth < 0) effectiveMonth = 0
    }

    const totalPayments = data.loanTerm * 12
    const effectivePayments = data.interestOnly ? (data.loanTerm - data.interestOnlyPeriod) * 12 : totalPayments

    if (data.interestOnly && month < data.interestOnlyPeriod * 12) {
      // Afdragsfri periode
      const monthlyInterest = (data.loanAmount * data.interestRate) / 100 / 12
      return monthlyInterest
    } else {
      // Afdragsperiode
      const monthlyPrincipal = data.loanAmount / effectivePayments
      const remainingPrincipal =
        data.interestOnly && month >= data.interestOnlyPeriod * 12
          ? data.loanAmount - monthlyPrincipal * effectiveMonth
          : data.loanAmount - monthlyPrincipal * month
      const monthlyInterest = (remainingPrincipal * data.interestRate) / 100 / 12
      return monthlyPrincipal + monthlyInterest
    }
  }

  // Beregn stiftelsesomkostninger
  const calculateSetupCosts = (data: LoanData = loanData) => {
    return data.setupFee + data.registrationFee + (data.loanAmount * (100 - data.courseRate)) / 100
  }

  // Beregn bidragssats i kroner
  const calculateAdministrationFeeAmount = (data: LoanData = loanData) => {
    return (data.loanAmount * data.administrationFee) / 100 / 12
  }

  // Beregn loan-to-value ratio
  const calculateLTV = (data: LoanData = loanData) => {
    if (data.propertyValue <= 0) return 100
    return (data.loanAmount / data.propertyValue) * 100
  }

  // Beregn gæld-til-indkomst forhold (DTI)
  const calculateDTI = (data: LoanData = loanData) => {
    const monthlyPayment = calculateMonthlyPayment(data) + calculateAdministrationFeeAmount(data) + data.monthlyFee
    const totalMonthlyDebtPayments = monthlyPayment + data.existingDebtPayments
    return (totalMonthlyDebtPayments / data.monthlyIncome) * 100
  }

  // Beregn boligudgifter-til-indkomst forhold (PITI)
  const calculatePITI = (data: LoanData = loanData) => {
    const monthlyPayment = calculateMonthlyPayment(data) + calculateAdministrationFeeAmount(data) + data.monthlyFee

    let additionalCosts = 0
    if (data.includePropertyTax) {
      additionalCosts += (data.propertyValue * data.propertyTaxRate) / 100 / 12
    }
    if (data.includePropertyInsurance) {
      additionalCosts += data.propertyInsurance / 12
    }
    if (data.includeHomeownersAssociation) {
      additionalCosts += data.homeownersAssociation / 12
    }

    // Add car specific costs if applicable
    if (loanCategory === "car" && data.carInsurance) {
      additionalCosts += data.carInsurance / 12
    }
    if (loanCategory === "car" && data.carTax) {
      additionalCosts += data.carTax / 12
    }
    if (loanCategory === "car" && data.carMaintenance) {
      additionalCosts += data.carMaintenance / 12
    }
    if (loanCategory === "car" && data.carFuel) {
      additionalCosts += data.carFuel / 12
    }

    const totalHousingPayment = monthlyPayment + additionalCosts
    return (totalHousingPayment / data.monthlyIncome) * 100
  }

  // Beregn rådighedsbeløb efter alle udgifter
  const calculateDisposableIncome = (data: LoanData = loanData) => {
    const monthlyPayment = calculateMonthlyPayment(data) + calculateAdministrationFeeAmount(data) + data.monthlyFee

    let additionalCosts = 0
    if (data.includePropertyTax) {
      additionalCosts += (data.propertyValue * data.propertyTaxRate) / 100 / 12
    }
    if (data.includePropertyInsurance) {
      additionalCosts += data.propertyInsurance / 12
    }
    if (data.includeHomeownersAssociation) {
      additionalCosts += data.homeownersAssociation / 12
    }

    return data.monthlyIncome - monthlyPayment - additionalCosts - data.otherMonthlyExpenses - data.existingDebtPayments
  }

  // Beregn samlet renteomkostning
  const calculateTotalInterest = (data: LoanData = loanData) => {
    // Simplified calculation for demo purposes
    const monthlyRate = data.interestRate / 100 / 12
    const totalPayments = data.loanTerm * 12
    const monthlyPayment = calculateMonthlyPayment(data)

    return monthlyPayment * totalPayments - data.loanAmount
  }

  // Beregn samlet tilbagebetaling
  const calculateTotalPayment = (data: LoanData = loanData) => {
    return calculateTotalInterest(data) + data.loanAmount
  }

  // Beregn samlet skattefradrag
  const calculateTotalTaxDeduction = (data: LoanData = loanData) => {
    if (!data.taxDeduction) return 0
    return calculateTotalInterest(data) * (data.taxDeductionRate / 100)
  }

  // Beregn netto tilbagebetaling efter skattefradrag
  const calculateNetTotalPayment = (data: LoanData = loanData) => {
    return calculateTotalPayment(data) - calculateTotalTaxDeduction(data)
  }

  // Beregn ÅOP (Årlige Omkostninger i Procent)
  const calculateAPR = (data: LoanData = loanData) => {
    // Simplified calculation for demo purposes
    return data.interestRate + 1.5
  }

  // Vurder låneværdighed baseret på forskellige faktorer
  const assessLoanEligibility = (data: LoanData = loanData) => {
    const dti = calculateDTI(data)
    const piti = calculatePITI(data)
    const disposableIncome = calculateDisposableIncome(data)
    const ltv = calculateLTV(data)

    const recommendations = []
    let eligibilityScore = 10 // Start med maksimum score
    let isEligible = true

    // Vurder gæld-til-indkomst forhold
    if (dti > 40) {
      recommendations.push(
        "Din gæld-til-indkomst ratio er for høj (over 40%). Overvej at reducere din eksisterende gæld eller øge din indkomst.",
      )
      eligibilityScore -= 3
      isEligible = false
    } else if (dti > 30) {
      recommendations.push(
        "Din gæld-til-indkomst ratio er høj (over 30%). Det kan være svært at få godkendt lånet med disse betingelser.",
      )
      eligibilityScore -= 2
    }

    // Vurder boligudgifter-til-indkomst forhold
    if (piti > 35) {
      recommendations.push(
        "Dine boligudgifter udgør en for stor del af din indkomst (over 35%). Overvej et billigere hus eller en større udbetaling.",
      )
      eligibilityScore -= 3
      isEligible = false
    } else if (piti > 28) {
      recommendations.push(
        "Dine boligudgifter udgør en betydelig del af din indkomst (over 28%). Dette kan begrænse dine lånemuligheder.",
      )
      eligibilityScore -= 1
    }

    // Vurder rådighedsbeløb
    const minDisposableIncome = data.monthlyIncome * 0.2 // Minimum 20% af indkomst bør være til rådighed
    if (disposableIncome < 0) {
      recommendations.push("Dit budget viser et underskud. Du har ikke råd til dette lån med din nuværende økonomi.")
      eligibilityScore -= 4
      isEligible = false
    } else if (disposableIncome < minDisposableIncome) {
      recommendations.push(
        `Dit rådighedsbeløb efter alle udgifter (${formatCurrency(
          disposableIncome,
        )}) er lavt. Overvej at reducere lånebeløbet eller andre udgifter.`,
      )
      eligibilityScore -= 2
    }

    return {
      isEligible,
      eligibilityScore,
      recommendations,
      metrics: {
        dti,
        piti,
        disposableIncome,
        ltv,
      },
    }
  }

  // Update the totalSteps variable based on loan category
  const getTotalSteps = () => {
    switch (loanCategory) {
      case "car":
        return 6
      case "home":
        return 7
      case "consumer":
        return 5
      case "bank":
        return 5
      case "mortgage":
        return 6
      default:
        return 6
    }
  }

  const totalSteps = getTotalSteps()

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
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
    setShowAdvanced(false)
    setShowComparison(false)
    setComparisonLoans([])
    setCurrentLoanId("primary")
    setLoanData(initialLoanData)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK" }).format(value)
  }

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100)
  }

  // Function to handle loan category selection
  const handleLoanCategoryChange = (category: string) => {
    setLoanCategory(category)
    setStep(1)

    // Reset loan data with category-specific defaults
    let newLoanData = { ...initialLoanData }

    switch (category) {
      case "car":
        newLoanData = {
          ...newLoanData,
          loanAmount: 300000,
          loanTerm: 7,
          interestRate: 5.5,
          loanPurpose: "bil",
          carValue: 350000,
          carAge: 0,
          carType: "new",
          carInsurance: 6000,
          carTax: 4000,
          carMaintenance: 5000,
          carFuel: 2000,
        }
        break
      case "home":
        newLoanData = {
          ...newLoanData,
          loanAmount: 2000000,
          loanTerm: 30,
          interestRate: 3.0,
          loanPurpose: "boligkøb",
          propertyValue: 2500000,
          propertyType: "house",
          propertySize: 120,
          propertyAge: 25,
          energyRating: "C",
          renovationCosts: 0,
          propertyLocation: "suburb",
        }
        break
      case "consumer":
        newLoanData = {
          ...newLoanData,
          loanAmount: 100000,
          loanTerm: 5,
          interestRate: 8.0,
          loanPurpose: "forbrugslån",
          consumerLoanPurpose: "renovation",
          consumerLoanCollateral: false,
          consumerLoanCollateralValue: 0,
        }
        break
      case "bank":
        newLoanData = {
          ...newLoanData,
          loanAmount: 500000,
          loanTerm: 10,
          interestRate: 6.0,
          loanPurpose: "banklån",
          bankLoanPurpose: "renovation",
          bankLoanCollateral: true,
          bankLoanCollateralValue: 600000,
          bankLoanGuarantor: false,
        }
        break
      case "mortgage":
        newLoanData = {
          ...newLoanData,
          loanAmount: 2500000,
          loanTerm: 30,
          interestRate: 2.5,
          loanPurpose: "realkreditlån",
          propertyValue: 3125000,
          mortgageType: "fast",
          mortgageBondType: "traditionel",
          mortgageAuctionDate: "",
          mortgageRefinancing: false,
        }
        break
    }

    setLoanData(newLoanData)
  }

  // Pre-fill eksempler — typiske danske scenarier
  const loadExample = (example: "foerstegangskoeber" | "familieVilla" | "sommerhus" | "bilfinansiering") => {
    if (example === "foerstegangskoeber") {
      setLoanCategory("home")
      setLoanData({
        ...initialLoanData,
        loanAmount: 1800000,
        loanTerm: 30,
        interestRate: 4.5,
        loanType: "annuitet",
        propertyValue: 2250000,
        downPayment: 450000,
        monthlyIncome: 42000,
        otherMonthlyExpenses: 11000,
        existingDebt: 50000,
        existingDebtPayments: 1500,
        savingsAmount: 80000,
        loanPurpose: "boligkøb",
      })
      setStep(2)
    } else if (example === "familieVilla") {
      setLoanCategory("home")
      setLoanData({
        ...initialLoanData,
        loanAmount: 3200000,
        loanTerm: 30,
        interestRate: 4.25,
        loanType: "annuitet",
        propertyValue: 4000000,
        downPayment: 800000,
        monthlyIncome: 72000,
        otherMonthlyExpenses: 22000,
        existingDebt: 250000,
        existingDebtPayments: 4500,
        savingsAmount: 200000,
        loanPurpose: "boligkøb",
      })
      setStep(2)
    } else if (example === "sommerhus") {
      setLoanCategory("mortgage")
      setLoanData({
        ...initialLoanData,
        loanAmount: 1400000,
        loanTerm: 20,
        interestRate: 5.0,
        loanType: "annuitet",
        propertyValue: 2000000,
        downPayment: 600000,
        monthlyIncome: 60000,
        otherMonthlyExpenses: 18000,
        existingDebtPayments: 3000,
        loanPurpose: "sommerhus",
      })
      setStep(2)
    } else if (example === "bilfinansiering") {
      setLoanCategory("car")
      setLoanData({
        ...initialLoanData,
        loanAmount: 250000,
        loanTerm: 7,
        interestRate: 6.5,
        loanType: "annuitet",
        propertyValue: 280000,
        downPayment: 30000,
        monthlyIncome: 35000,
        otherMonthlyExpenses: 10000,
        existingDebtPayments: 1000,
        loanPurpose: "bil",
      })
      setStep(2)
    }
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 flex items-center">
        <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbage til forsiden
        </Link>
        <h1 className="ml-auto text-2xl font-bold tracking-tight">Avanceret Lånberegner</h1>
      </div>

      {/* Hurtige eksempler */}
      {!showResults && step === 1 && (
        <Card className="mb-6 bg-gradient-to-br from-blue-50/60 to-cyan-50/60 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-shrink-0">
                <p className="text-sm font-semibold">Indlæs eksempel:</p>
                <p className="text-xs text-muted-foreground">
                  Spring direkte til tal — du kan justere bagefter
                </p>
              </div>
              <div className="flex flex-wrap gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loadExample("foerstegangskoeber")}
                >
                  Førstegangskøber i lejlighed
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loadExample("familieVilla")}
                >
                  Familie i villa
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loadExample("sommerhus")}
                >
                  Sommerhus-køber
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loadExample("bilfinansiering")}
                >
                  Billån
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!showResults ? (
        <div className="space-y-8">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Vælg lånetype</CardTitle>
                <CardDescription>Vælg den type lån du ønsker at beregne</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant={loanCategory === "car" ? "default" : "outline"}
                    className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleLoanCategoryChange("car")}
                  >
                    <Car className="h-8 w-8" />
                    <span className="text-lg font-medium">Billån</span>
                    <span className="text-xs text-muted-foreground">Beregn finansiering af bil</span>
                  </Button>

                  <Button
                    variant={loanCategory === "home" ? "default" : "outline"}
                    className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleLoanCategoryChange("home")}
                  >
                    <Home className="h-8 w-8" />
                    <span className="text-lg font-medium">Boliglån</span>
                    <span className="text-xs text-muted-foreground">Beregn finansiering af bolig</span>
                  </Button>

                  <Button
                    variant={loanCategory === "consumer" ? "default" : "outline"}
                    className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleLoanCategoryChange("consumer")}
                  >
                    <ShoppingBag className="h-8 w-8" />
                    <span className="text-lg font-medium">Forbrugslån</span>
                    <span className="text-xs text-muted-foreground">Beregn lån til forbrug</span>
                  </Button>

                  <Button
                    variant={loanCategory === "bank" ? "default" : "outline"}
                    className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleLoanCategoryChange("bank")}
                  >
                    <Building className="h-8 w-8" />
                    <span className="text-lg font-medium">Banklån</span>
                    <span className="text-xs text-muted-foreground">Beregn almindeligt banklån</span>
                  </Button>

                  <Button
                    variant={loanCategory === "mortgage" ? "default" : "outline"}
                    className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleLoanCategoryChange("mortgage")}
                  >
                    <Landmark className="h-8 w-8" />
                    <span className="text-lg font-medium">Realkreditlån</span>
                    <span className="text-xs text-muted-foreground">Beregn realkreditlån</span>
                  </Button>

                  <Button
                    variant={loanCategory === "general" ? "default" : "outline"}
                    className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                    onClick={() => handleLoanCategoryChange("general")}
                  >
                    <CreditCard className="h-8 w-8" />
                    <span className="text-lg font-medium">Generelt lån</span>
                    <span className="text-xs text-muted-foreground">Beregn et generelt lån</span>
                  </Button>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleNext}>Næste</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Hvor stort et lån har du brug for?</CardTitle>
                <CardDescription>Angiv det ønskede lånebeløb og formål</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="loan-amount">Lånebeløb: {formatCurrency(loanData.loanAmount)}</Label>
                  </div>
                  <Slider
                    id="loan-amount"
                    min={10000}
                    max={loanCategory === "home" || loanCategory === "mortgage" ? 10000000 : 1000000}
                    step={10000}
                    value={[loanData.loanAmount]}
                    onValueChange={(value) => setLoanData({ ...loanData, loanAmount: value[0] })}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10.000 kr.</span>
                    <span>
                      {loanCategory === "home" || loanCategory === "mortgage" ? "10.000.000 kr." : "1.000.000 kr."}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Tilbage
                  </Button>
                  <Button onClick={handleNext}>Næste</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Hvor lang tid vil du betale lånet over?</CardTitle>
                <CardDescription>Vælg løbetiden for dit lån</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="loan-term">Løbetid: {loanData.loanTerm} år</Label>
                  </div>
                  <Slider
                    id="loan-term"
                    min={1}
                    max={loanCategory === "home" || loanCategory === "mortgage" ? 30 : 10}
                    step={1}
                    value={[loanData.loanTerm]}
                    onValueChange={(value) => setLoanData({ ...loanData, loanTerm: value[0] })}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 år</span>
                    <span>{loanCategory === "home" || loanCategory === "mortgage" ? "30 år" : "10 år"}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Tilbage
                  </Button>
                  <Button onClick={handleNext}>Næste</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Hvilken rente forventer du?</CardTitle>
                <CardDescription>Angiv den forventede rente på dit lån</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="interest-rate">Rente: {loanData.interestRate}%</Label>
                  </div>
                  <Slider
                    id="interest-rate"
                    min={0.5}
                    max={loanCategory === "consumer" ? 15 : 10}
                    step={0.1}
                    value={[loanData.interestRate]}
                    onValueChange={(value) => setLoanData({ ...loanData, interestRate: value[0] })}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0,5%</span>
                    <span>{loanCategory === "consumer" ? "15%" : "10%"}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Tilbage
                  </Button>
                  <Button onClick={handleNext}>Næste</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Hvilken type lån ønsker du?</CardTitle>
                <CardDescription>Vælg den type lån, der passer bedst til dine behov</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={loanData.loanType}
                  onValueChange={(value) => setLoanData({ ...loanData, loanType: value })}
                  className="space-y-4"
                >
                  <div className="flex items-start space-x-3 rounded-md border p-4">
                    <RadioGroupItem value="annuitet" id="annuitet" className="mt-1" />
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Label htmlFor="annuitet" className="font-medium">
                          Annuitetslån
                        </Label>
                        <TooltipProvider>
                          <UITooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <HelpCircle className="h-4 w-4" />
                                <span className="sr-only">Mere information</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Ved et annuitetslån er den månedlige ydelse konstant gennem hele lånets løbetid. I
                                starten går en større del af ydelsen til renter, mens en større del går til afdrag
                                senere i lånets løbetid.
                              </p>
                            </TooltipContent>
                          </UITooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-sm text-muted-foreground">Fast månedlig ydelse gennem hele lånets løbetid</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 rounded-md border p-4">
                    <RadioGroupItem value="serielaan" id="serielaan" className="mt-1" />
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Label htmlFor="serielaan" className="font-medium">
                          Serielån
                        </Label>
                        <TooltipProvider>
                          <UITooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <HelpCircle className="h-4 w-4" />
                                <span className="sr-only">Mere information</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Ved et serielån er afdraget konstant gennem hele lånets løbetid. Den månedlige ydelse er
                                højest i starten og falder i takt med, at restgælden reduceres.
                              </p>
                            </TooltipContent>
                          </UITooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Fast afdrag og faldende ydelse gennem lånets løbetid
                      </p>
                    </div>
                  </div>
                </RadioGroup>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Tilbage
                  </Button>
                  <Button onClick={handleNext}>Næste</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 6 && (
            <Card>
              <CardHeader>
                <CardTitle>Din økonomiske situation</CardTitle>
                <CardDescription>Disse oplysninger hjælper os med at vurdere lånemulighederne</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="monthly-income">
                      Månedlig indkomst efter skat: {formatCurrency(loanData.monthlyIncome)}
                    </Label>
                    <Slider
                      id="monthly-income"
                      min={10000}
                      max={100000}
                      step={1000}
                      value={[loanData.monthlyIncome]}
                      onValueChange={(value) => setLoanData({ ...loanData, monthlyIncome: value[0] })}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>10.000 kr.</span>
                      <span>100.000 kr.</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="other-monthly-expenses">
                      Andre månedlige udgifter: {formatCurrency(loanData.otherMonthlyExpenses)}
                    </Label>
                    <Slider
                      id="other-monthly-expenses"
                      min={0}
                      max={50000}
                      step={1000}
                      value={[loanData.otherMonthlyExpenses]}
                      onValueChange={(value) => setLoanData({ ...loanData, otherMonthlyExpenses: value[0] })}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0 kr.</span>
                      <span>50.000 kr.</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Tilbage
                  </Button>
                  <Button onClick={handleNext}>
                    Beregn resultat
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">
                Trin {step} af {totalSteps}
              </h2>
              <span className="text-sm text-muted-foreground">{Math.round((step / totalSteps) * 100)}% fuldført</span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-2" />
          </div>
        </div>
      ) : (
        <div>
          {/* Results section */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>
                  Låneberegning -{" "}
                  {loanCategory === "car"
                    ? "Billån"
                    : loanCategory === "home"
                      ? "Boliglån"
                      : loanCategory === "consumer"
                        ? "Forbrugslån"
                        : loanCategory === "bank"
                          ? "Banklån"
                          : loanCategory === "mortgage"
                            ? "Realkreditlån"
                            : "Generelt lån"}
                </CardTitle>
                <CardDescription>Resultat af din låneberegning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="oversigt" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="oversigt">Oversigt</TabsTrigger>
                    <TabsTrigger value="afdrag">Afdragsprofil</TabsTrigger>
                    <TabsTrigger value="omkostninger">Omkostninger</TabsTrigger>
                    <TabsTrigger value="analyse">Låneanalyse</TabsTrigger>
                  </TabsList>

                  <TabsContent value="oversigt" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Lånebeløb</p>
                        <p className="font-medium">{formatCurrency(loanData.loanAmount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Løbetid</p>
                        <p className="font-medium">{loanData.loanTerm} år</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rente</p>
                        <p className="font-medium">{loanData.interestRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lånetype</p>
                        <p className="font-medium">{loanData.loanType === "annuitet" ? "Annuitetslån" : "Serielån"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Månedlig ydelse</p>
                        <p className="font-medium">{formatCurrency(calculateMonthlyPayment())}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Samlede renteomkostninger</p>
                        <p className="font-medium">{formatCurrency(calculateTotalInterest())}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Samlet tilbagebetaling</p>
                        <p className="font-medium">{formatCurrency(calculateTotalPayment())}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ÅOP</p>
                        <p className="font-medium">{calculateAPR().toFixed(2)}%</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="afdrag" className="space-y-4">
                    <p>Her vil afdragsprofilen blive vist (kommer snart)</p>
                  </TabsContent>

                  <TabsContent value="omkostninger" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Stiftelsesomkostninger</p>
                        <p className="font-medium">{formatCurrency(loanData.setupFee)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bidragssats (årligt)</p>
                        <p className="font-medium">{loanData.administrationFee}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tinglysningsafgift</p>
                        <p className="font-medium">{formatCurrency(loanData.registrationFee)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Kurs</p>
                        <p className="font-medium">{loanData.courseRate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Månedligt gebyr</p>
                        <p className="font-medium">{formatCurrency(loanData.monthlyFee)}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="analyse" className="space-y-4">
                    {(() => {
                      const eligibility = assessLoanEligibility()
                      const { dti, piti, disposableIncome, ltv } = eligibility.metrics

                      return (
                        <>
                          <div className="rounded-lg border p-4">
                            <h3 className="text-lg font-semibold mb-4">Låneværdighedsvurdering</h3>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span>Samlet vurdering</span>
                                  <span
                                    className={
                                      eligibility.eligibilityScore >= 8
                                        ? "text-green-600"
                                        : eligibility.eligibilityScore >= 5
                                          ? "text-yellow-600"
                                          : "text-red-600"
                                    }
                                  >
                                    {eligibility.eligibilityScore}/10
                                  </span>
                                </div>
                                <Progress value={eligibility.eligibilityScore * 10} className="h-2" />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Gæld-til-indkomst (DTI)</p>
                                  <p
                                    className={`font-medium ${
                                      dti > 40 ? "text-red-600" : dti > 30 ? "text-yellow-600" : "text-green-600"
                                    }`}
                                  >
                                    {dti.toFixed(1)}%
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {dti > 40 ? "For høj" : dti > 30 ? "Høj" : "God"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm text-muted-foreground">Boligudgifter-til-indkomst (PITI)</p>
                                  <p
                                    className={`font-medium ${
                                      piti > 35 ? "text-red-600" : piti > 28 ? "text-yellow-600" : "text-green-600"
                                    }`}
                                  >
                                    {piti.toFixed(1)}%
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {piti > 35 ? "For høj" : piti > 28 ? "Høj" : "God"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm text-muted-foreground">Rådighedsbeløb</p>
                                  <p
                                    className={`font-medium ${
                                      disposableIncome < 0
                                        ? "text-red-600"
                                        : disposableIncome < loanData.monthlyIncome * 0.2
                                          ? "text-yellow-600"
                                          : "text-green-600"
                                    }`}
                                  >
                                    {formatCurrency(disposableIncome)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {disposableIncome < 0
                                      ? "Negativt"
                                      : disposableIncome < loanData.monthlyIncome * 0.2
                                        ? "Lavt"
                                        : "Godt"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm text-muted-foreground">Belåningsgrad (LTV)</p>
                                  <p
                                    className={`font-medium ${
                                      ltv > 95 ? "text-red-600" : ltv > 80 ? "text-yellow-600" : "text-green-600"
                                    }`}
                                  >
                                    {ltv.toFixed(1)}%
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {ltv > 95 ? "For høj" : ltv > 80 ? "Høj" : "God"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-lg border p-4">
                            <h3 className="text-lg font-semibold mb-4">Anbefalinger</h3>
                            <div className="space-y-4">
                              {eligibility.recommendations.length > 0 ? (
                                <ul className="space-y-2">
                                  {eligibility.recommendations.map((recommendation, index) => (
                                    <li key={index} className="flex items-start">
                                      <div
                                        className={`mr-2 mt-1 h-2 w-2 rounded-full ${
                                          recommendation.includes("ikke") ||
                                          recommendation.includes("svært") ||
                                          recommendation.includes("for høj")
                                            ? "bg-red-600"
                                            : recommendation.includes("kan være") || recommendation.includes("høj")
                                              ? "bg-yellow-600"
                                              : "bg-green-600"
                                        }`}
                                      />
                                      <span>{recommendation}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p>
                                  Baseret på de angivne oplysninger ser dit lån ud til at være overkommeligt for din
                                  økonomiske situation.
                                </p>
                              )}
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleReset}>
                  Start forfra
                </Button>
              </CardFooter>
            </Card>

            {/* Scenarie-sammenligning: forskellige renter og løbetider */}
            {(() => {
              const dkk = (n: number) =>
                new Intl.NumberFormat("da-DK", {
                  style: "currency",
                  currency: "DKK",
                  maximumFractionDigits: 0,
                }).format(n)

              const monthlyFor = (rate: number, term: number) => {
                const r = rate / 100 / 12
                const n = term * 12
                if (r === 0) return loanData.loanAmount / n
                return (loanData.loanAmount * r) / (1 - Math.pow(1 + r, -n))
              }

              const totalFor = (rate: number, term: number) =>
                monthlyFor(rate, term) * term * 12

              const baseMonthly = monthlyFor(loanData.interestRate, loanData.loanTerm)
              const baseTotal = totalFor(loanData.interestRate, loanData.loanTerm)

              const rateScenarios: Scenario[] = [
                {
                  label: `${(loanData.interestRate - 1).toFixed(1)}% rente`,
                  description: `${loanData.loanTerm} år løbetid`,
                  value: dkk(monthlyFor(loanData.interestRate - 1, loanData.loanTerm)),
                  delta: `Total: ${dkk(totalFor(loanData.interestRate - 1, loanData.loanTerm))}`,
                  tone: "positive",
                },
                {
                  label: `${loanData.interestRate.toFixed(1)}% rente`,
                  description: `${loanData.loanTerm} år løbetid`,
                  value: dkk(baseMonthly),
                  delta: `Total: ${dkk(baseTotal)}`,
                  highlight: true,
                  tone: "neutral",
                },
                {
                  label: `${(loanData.interestRate + 1).toFixed(1)}% rente`,
                  description: `${loanData.loanTerm} år løbetid`,
                  value: dkk(monthlyFor(loanData.interestRate + 1, loanData.loanTerm)),
                  delta: `Total: ${dkk(totalFor(loanData.interestRate + 1, loanData.loanTerm))}`,
                  tone: "negative",
                },
              ]

              const termScenarios: Scenario[] = [20, 25, 30]
                .filter((term, i, arr) => term <= 30)
                .map((term) => ({
                  label: `${term} år`,
                  description: `${loanData.interestRate.toFixed(1)}% rente`,
                  value: dkk(monthlyFor(loanData.interestRate, term)),
                  delta: `Total: ${dkk(totalFor(loanData.interestRate, term))}`,
                  highlight: term === loanData.loanTerm,
                  tone: term < loanData.loanTerm ? "positive" : term > loanData.loanTerm ? "negative" : "neutral",
                }))

              return (
                <div className="mt-8 space-y-6">
                  <ScenarioCompare
                    title="Sammenlign renter"
                    description="Samme løbetid og beløb, forskellig rente"
                    scenarios={rateScenarios}
                  />
                  <ScenarioCompare
                    title="Sammenlign løbetid"
                    description="Samme rente og beløb, forskellig løbetid"
                    scenarios={termScenarios}
                  />
                </div>
              )
            })()}

            <div className="mt-8">
              <AIRecommendation
                data={aiRecommendation}
                printTitle="Låneberegner · AI-anbefaling"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
