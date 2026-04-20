"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AIRecommendation } from "@/components/ai-recommendation"
import { analyzeAfbetaling } from "@/lib/ai-engines"
import {
  CreditCard,
  Car,
  GraduationCap,
  Home,
  Plus,
  Trash2,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Download,
  Share2,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Lightbulb,
  Wallet,
  Check,
  X,
  HelpCircle,
  Calculator,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { FieldTooltip } from "@/components/field-tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

// Typer
type DebtType = "creditcard" | "carloan" | "studentloan" | "personalloan" | "mortgage" | "other"

interface Debt {
  id: string
  type: DebtType
  name: string
  amount: number
  interestRate: number
  minimumPayment: number
  remainingMonths: number
  fees: number
}

interface PaymentPlan {
  month: number
  date: string
  remainingDebts: {
    debtId: string
    remainingAmount: number
    payment: number
    interestPayment: number
    principalPayment: number
  }[]
  totalPayment: number
  totalRemaining: number
}

interface Scenario {
  id: string
  name: string
  description: string
  extraMonthlyPayment: number
  oneTimePayment: number
  oneTimePaymentMonth: number
  incomeReductionAmount: number
  incomeReductionStartMonth: number
  incomeReductionDuration: number
}

interface ConsolidationOption {
  id: string
  name: string
  interestRate: number
  term: number
  monthlyCost: number
  totalCost: number
  totalInterest: number
  savings: number
  setupFee: number
}

// Hjælpefunktioner
const getDebtIcon = (type: DebtType) => {
  switch (type) {
    case "creditcard":
      return <CreditCard className="h-5 w-5" />
    case "carloan":
      return <Car className="h-5 w-5" />
    case "studentloan":
      return <GraduationCap className="h-5 w-5" />
    case "mortgage":
      return <Home className="h-5 w-5" />
    default:
      return <Wallet className="h-5 w-5" />
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatPercent = (rate: number) => {
  return new Intl.NumberFormat("da-DK", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rate / 100)
}

const generatePaymentPlan = (
  debts: Debt[],
  strategy: "avalanche" | "snowball" | "custom",
  extraMonthlyPayment = 0,
  customOrder: string[] = [],
  oneTimePayment = 0,
  oneTimePaymentMonth = 1,
  incomeReductionAmount = 0,
  incomeReductionStartMonth = 0,
  incomeReductionDuration = 0,
): PaymentPlan[] => {
  if (debts.length === 0) return []

  // Kopier gæld for at undgå at ændre originalen
  const debtsCopy = debts.map((debt) => ({
    ...debt,
    remainingAmount: debt.amount,
    order: 0,
  }))

  // Sortér gæld baseret på strategi
  if (strategy === "avalanche") {
    debtsCopy.sort((a, b) => b.interestRate - a.interestRate)
  } else if (strategy === "snowball") {
    debtsCopy.sort((a, b) => a.amount - b.amount)
  } else if (strategy === "custom" && customOrder.length > 0) {
    debtsCopy.forEach((debt) => {
      debt.order = customOrder.indexOf(debt.id)
      if (debt.order === -1) debt.order = 999
    })
    debtsCopy.sort((a, b) => a.order - b.order)
  }

  const paymentPlan: PaymentPlan[] = []
  const currentDate = new Date()
  let month = 1
  let allDebtsCleared = false
  const extraPaymentAvailable = extraMonthlyPayment

  while (!allDebtsCleared && month <= 600) {
    // Max 50 år
    const currentMonth = month
    const dateString = currentDate.toLocaleDateString("da-DK", { month: "short", year: "numeric" })

    // Håndter indkomsttab
    let monthlyExtraPayment = extraPaymentAvailable
    if (
      incomeReductionAmount > 0 &&
      month >= incomeReductionStartMonth &&
      month < incomeReductionStartMonth + incomeReductionDuration
    ) {
      monthlyExtraPayment = Math.max(0, extraPaymentAvailable - incomeReductionAmount)
    }

    // Håndter engangsbetaling
    let oneTimePaymentForThisMonth = 0
    if (month === oneTimePaymentMonth) {
      oneTimePaymentForThisMonth = oneTimePayment
    }

    const monthPlan: PaymentPlan = {
      month: currentMonth,
      date: dateString,
      remainingDebts: [],
      totalPayment: 0,
      totalRemaining: 0,
    }

    let totalMinimumPayment = 0
    let extraPaymentRemaining = monthlyExtraPayment + oneTimePaymentForThisMonth

    // Beregn minimumbetalinger først
    debtsCopy.forEach((debt) => {
      if (debt.remainingAmount <= 0) return

      const interestPayment = (debt.remainingAmount * (debt.interestRate / 100)) / 12
      const minimumPayment = Math.min(debt.minimumPayment + debt.fees, debt.remainingAmount + interestPayment)

      totalMinimumPayment += minimumPayment

      monthPlan.remainingDebts.push({
        debtId: debt.id,
        remainingAmount: debt.remainingAmount,
        payment: minimumPayment,
        interestPayment: interestPayment,
        principalPayment: minimumPayment - interestPayment,
      })
    })

    // Tilføj ekstra betaling til højest prioriterede gæld
    for (let i = 0; i < debtsCopy.length && extraPaymentRemaining > 0; i++) {
      if (debtsCopy[i].remainingAmount <= 0) continue

      const debtIndex = monthPlan.remainingDebts.findIndex((d) => d.debtId === debtsCopy[i].id)
      if (debtIndex === -1) continue

      const extraPayment = Math.min(extraPaymentRemaining, debtsCopy[i].remainingAmount)
      monthPlan.remainingDebts[debtIndex].payment += extraPayment
      monthPlan.remainingDebts[debtIndex].principalPayment += extraPayment
      extraPaymentRemaining -= extraPayment
    }

    // Opdater resterende gæld
    monthPlan.remainingDebts.forEach((debtPayment) => {
      const debtIndex = debtsCopy.findIndex((d) => d.id === debtPayment.debtId)
      if (debtIndex !== -1) {
        debtsCopy[debtIndex].remainingAmount = Math.max(0, debtPayment.remainingAmount - debtPayment.principalPayment)
      }
    })

    // Beregn totaler
    monthPlan.totalPayment = monthPlan.remainingDebts.reduce((sum, debt) => sum + debt.payment, 0)
    monthPlan.totalRemaining = debtsCopy.reduce((sum, debt) => sum + debt.remainingAmount, 0)

    paymentPlan.push(monthPlan)

    // Tjek om al gæld er betalt
    allDebtsCleared = debtsCopy.every((debt) => debt.remainingAmount <= 0)

    // Gå til næste måned
    month++
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return paymentPlan
}

// Beregn månedlig ydelse for et lån
const calculateMonthlyPayment = (principal: number, annualInterestRate: number, termInMonths: number): number => {
  const monthlyInterestRate = annualInterestRate / 100 / 12
  if (monthlyInterestRate === 0) return principal / termInMonths
  return (
    (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termInMonths)) /
    (Math.pow(1 + monthlyInterestRate, termInMonths) - 1)
  )
}

// Beregn total omkostning for et lån
const calculateTotalCost = (monthlyPayment: number, termInMonths: number, setupFee = 0): number => {
  return monthlyPayment * termInMonths + setupFee
}

// Beregn total renteomkostning for et lån
const calculateTotalInterest = (principal: number, totalCost: number, setupFee = 0): number => {
  return totalCost - principal - setupFee
}

// Beregn konsolideringsmuligheder
const calculateConsolidationOptions = (debts: Debt[], currentTotalInterest: number): ConsolidationOption[] => {
  if (debts.length === 0) return []

  const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0)
  const options: ConsolidationOption[] = []

  // Option 1: Lav rente, lang løbetid
  const option1InterestRate = 4.5
  const option1Term = 84 // 7 år
  const option1MonthlyPayment = calculateMonthlyPayment(totalDebt, option1InterestRate, option1Term)
  const option1SetupFee = 1500
  const option1TotalCost = calculateTotalCost(option1MonthlyPayment, option1Term, option1SetupFee)
  const option1TotalInterest = calculateTotalInterest(totalDebt, option1TotalCost, option1SetupFee)
  const option1Savings = currentTotalInterest - option1TotalInterest

  options.push({
    id: "low-rate-long-term",
    name: "Lav rente, lang løbetid",
    interestRate: option1InterestRate,
    term: option1Term,
    monthlyCost: option1MonthlyPayment,
    totalCost: option1TotalCost,
    totalInterest: option1TotalInterest,
    savings: option1Savings,
    setupFee: option1SetupFee,
  })

  // Option 2: Medium rente, medium løbetid
  const option2InterestRate = 5.5
  const option2Term = 60 // 5 år
  const option2MonthlyPayment = calculateMonthlyPayment(totalDebt, option2InterestRate, option2Term)
  const option2SetupFee = 1000
  const option2TotalCost = calculateTotalCost(option2MonthlyPayment, option2Term, option2SetupFee)
  const option2TotalInterest = calculateTotalInterest(totalDebt, option2TotalCost, option2SetupFee)
  const option2Savings = currentTotalInterest - option2TotalInterest

  options.push({
    id: "medium-rate-medium-term",
    name: "Medium rente, medium løbetid",
    interestRate: option2InterestRate,
    term: option2Term,
    monthlyCost: option2MonthlyPayment,
    totalCost: option2TotalCost,
    totalInterest: option2TotalInterest,
    savings: option2Savings,
    setupFee: option2SetupFee,
  })

  // Option 3: Høj rente, kort løbetid
  const option3InterestRate = 6.5
  const option3Term = 36 // 3 år
  const option3MonthlyPayment = calculateMonthlyPayment(totalDebt, option3InterestRate, option3Term)
  const option3SetupFee = 500
  const option3TotalCost = calculateTotalCost(option3MonthlyPayment, option3Term, option3SetupFee)
  const option3TotalInterest = calculateTotalInterest(totalDebt, option3TotalCost, option3SetupFee)
  const option3Savings = currentTotalInterest - option3TotalInterest

  options.push({
    id: "high-rate-short-term",
    name: "Høj rente, kort løbetid",
    interestRate: option3InterestRate,
    term: option3Term,
    monthlyCost: option3MonthlyPayment,
    totalCost: option3TotalCost,
    totalInterest: option3TotalInterest,
    savings: option3Savings,
    setupFee: option3SetupFee,
  })

  return options
}

// Hovedkomponent
export default function AfbetalingsplanPage() {
  const router = useRouter()

  // Tilstandsvariabler
  const [debts, setDebts] = useState<Debt[]>([])
  const [newDebtType, setNewDebtType] = useState<DebtType>("creditcard")
  const [newDebtName, setNewDebtName] = useState("")
  const [newDebtAmount, setNewDebtAmount] = useState("")
  const [newDebtInterestRate, setNewDebtInterestRate] = useState("")
  const [newDebtMinimumPayment, setNewDebtMinimumPayment] = useState("")
  const [newDebtRemainingMonths, setNewDebtRemainingMonths] = useState("")
  const [newDebtFees, setNewDebtFees] = useState("")

  const [repaymentStrategy, setRepaymentStrategy] = useState<"avalanche" | "snowball" | "custom">("avalanche")
  const [customOrder, setCustomOrder] = useState<string[]>([])
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState(0)

  const [activeScenario, setActiveScenario] = useState<Scenario>({
    id: "default",
    name: "Standard afbetalingsplan",
    description: "Din grundlæggende afbetalingsplan uden ekstra scenarier",
    extraMonthlyPayment: 0,
    oneTimePayment: 0,
    oneTimePaymentMonth: 1,
    incomeReductionAmount: 0,
    incomeReductionStartMonth: 0,
    incomeReductionDuration: 0,
  })

  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: "extra-payment",
      name: "Ekstra månedlig betaling",
      description: "Hvad hvis du betaler ekstra hver måned?",
      extraMonthlyPayment: 1000,
      oneTimePayment: 0,
      oneTimePaymentMonth: 1,
      incomeReductionAmount: 0,
      incomeReductionStartMonth: 0,
      incomeReductionDuration: 0,
    },
    {
      id: "one-time",
      name: "Engangsbeløb",
      description: "Hvad hvis du får en bonus eller arv?",
      extraMonthlyPayment: 0,
      oneTimePayment: 10000,
      oneTimePaymentMonth: 3,
      incomeReductionAmount: 0,
      incomeReductionStartMonth: 0,
      incomeReductionDuration: 0,
    },
    {
      id: "income-loss",
      name: "Indkomsttab",
      description: "Hvad hvis din indkomst reduceres midlertidigt?",
      extraMonthlyPayment: 0,
      oneTimePayment: 0,
      oneTimePaymentMonth: 1,
      incomeReductionAmount: 2000,
      incomeReductionStartMonth: 2,
      incomeReductionDuration: 3,
    },
  ])

  const [activeTab, setActiveTab] = useState("overblik")
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan[]>([])

  // Gældskonsolidering
  const [consolidationOptions, setConsolidationOptions] = useState<ConsolidationOption[]>([])
  const [selectedConsolidationOption, setSelectedConsolidationOption] = useState<string | null>(null)
  const [customConsolidation, setCustomConsolidation] = useState({
    interestRate: 5.0,
    term: 60,
    setupFee: 1000,
  })
  const [includeDebtsInConsolidation, setIncludeDebtsInConsolidation] = useState<Record<string, boolean>>({})
  const [showCustomConsolidation, setShowCustomConsolidation] = useState(false)

  const aiRecommendation = useMemo(
    () =>
      analyzeAfbetaling({
        debts: debts.map((d) => ({
          name: d.name,
          amount: d.amount,
          interestRate: d.interestRate,
          minimumPayment: d.minimumPayment,
        })),
        monthlyIncome: 0,
        monthlyExpenses: 0,
        extraMonthlyPayment,
        strategy: repaymentStrategy,
      }),
    [debts, extraMonthlyPayment, repaymentStrategy],
  )

  // Effekter
  // (Intet behov for auth-check længere - alle funktioner er gratis og tilgængelige)

  useEffect(() => {
    if (debts.length > 0) {
      const plan = generatePaymentPlan(
        debts,
        repaymentStrategy,
        activeScenario.extraMonthlyPayment,
        customOrder,
        activeScenario.oneTimePayment,
        activeScenario.oneTimePaymentMonth,
        activeScenario.incomeReductionAmount,
        activeScenario.incomeReductionStartMonth,
        activeScenario.incomeReductionDuration,
      )
      setPaymentPlan(plan)

      // Opdater customOrder hvis det er tomt
      if (customOrder.length === 0 && repaymentStrategy === "custom") {
        setCustomOrder(debts.map((debt) => debt.id))
      }

      // Initialiser includeDebtsInConsolidation
      const initialIncludeDebts: Record<string, boolean> = {}
      debts.forEach((debt) => {
        if (!(debt.id in includeDebtsInConsolidation)) {
          initialIncludeDebts[debt.id] = true
        }
      })
      if (Object.keys(initialIncludeDebts).length > 0) {
        setIncludeDebtsInConsolidation((prev) => ({ ...prev, ...initialIncludeDebts }))
      }

      // Beregn konsolideringsmuligheder
      const totalInterest = getTotalInterestPaid()
      const options = calculateConsolidationOptions(
        debts.filter((debt) => includeDebtsInConsolidation[debt.id]),
        totalInterest,
      )
      setConsolidationOptions(options)

      // Vælg den første mulighed som standard hvis ingen er valgt
      if (!selectedConsolidationOption && options.length > 0) {
        setSelectedConsolidationOption(options[0].id)
      }
    } else {
      setPaymentPlan([])
      setConsolidationOptions([])
      setSelectedConsolidationOption(null)
    }
  }, [debts, repaymentStrategy, customOrder, activeScenario, includeDebtsInConsolidation])

  // Beregn brugerdefineret konsolidering
  useEffect(() => {
    if (showCustomConsolidation && debts.length > 0) {
      const debtsToConsolidate = debts.filter((debt) => includeDebtsInConsolidation[debt.id])
      const totalDebt = debtsToConsolidate.reduce((sum, debt) => sum + debt.amount, 0)
      const currentTotalInterest = getTotalInterestPaid()

      const monthlyPayment = calculateMonthlyPayment(
        totalDebt,
        customConsolidation.interestRate,
        customConsolidation.term,
      )
      const totalCost = calculateTotalCost(monthlyPayment, customConsolidation.term, customConsolidation.setupFee)
      const totalInterest = calculateTotalInterest(totalDebt, totalCost, customConsolidation.setupFee)
      const savings = currentTotalInterest - totalInterest

      const customOption: ConsolidationOption = {
        id: "custom",
        name: "Brugerdefineret konsolidering",
        interestRate: customConsolidation.interestRate,
        term: customConsolidation.term,
        monthlyCost: monthlyPayment,
        totalCost: totalCost,
        totalInterest: totalInterest,
        savings: savings,
        setupFee: customConsolidation.setupFee,
      }

      // Opdater konsolideringsmuligheder med den brugerdefinerede mulighed
      const updatedOptions = consolidationOptions.filter((option) => option.id !== "custom")
      setConsolidationOptions([...updatedOptions, customOption])
      setSelectedConsolidationOption("custom")
    }
  }, [showCustomConsolidation, customConsolidation, debts, includeDebtsInConsolidation])

  // Hjælpefunktioner
  const addDebt = () => {
    if (!newDebtName || !newDebtAmount || !newDebtInterestRate || !newDebtMinimumPayment) {
      return
    }

    const newDebt: Debt = {
      id: Date.now().toString(),
      type: newDebtType,
      name: newDebtName,
      amount: Number.parseFloat(newDebtAmount),
      interestRate: Number.parseFloat(newDebtInterestRate),
      minimumPayment: Number.parseFloat(newDebtMinimumPayment),
      remainingMonths: newDebtRemainingMonths ? Number.parseInt(newDebtRemainingMonths) : 0,
      fees: newDebtFees ? Number.parseFloat(newDebtFees) : 0,
    }

    setDebts([...debts, newDebt])
    setIncludeDebtsInConsolidation((prev) => ({ ...prev, [newDebt.id]: true }))

    // Nulstil formular
    setNewDebtType("creditcard")
    setNewDebtName("")
    setNewDebtAmount("")
    setNewDebtInterestRate("")
    setNewDebtMinimumPayment("")
    setNewDebtRemainingMonths("")
    setNewDebtFees("")
  }

  const removeDebt = (id: string) => {
    setDebts(debts.filter((debt) => debt.id !== id))
    setCustomOrder(customOrder.filter((debtId) => debtId !== id))

    // Fjern fra includeDebtsInConsolidation
    const updatedIncludeDebts = { ...includeDebtsInConsolidation }
    delete updatedIncludeDebts[id]
    setIncludeDebtsInConsolidation(updatedIncludeDebts)
  }

  const moveDebtUp = (index: number) => {
    if (index === 0) return

    const newOrder = [...customOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index - 1]
    newOrder[index - 1] = temp

    setCustomOrder(newOrder)
  }

  const moveDebtDown = (index: number) => {
    if (index === customOrder.length - 1) return

    const newOrder = [...customOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = temp

    setCustomOrder(newOrder)
  }

  const getTotalDebt = () => {
    return debts.reduce((sum, debt) => sum + debt.amount, 0)
  }

  const getConsolidatedDebtTotal = () => {
    return debts.filter((debt) => includeDebtsInConsolidation[debt.id]).reduce((sum, debt) => sum + debt.amount, 0)
  }

  const getTotalMinimumPayment = () => {
    return debts.reduce((sum, debt) => sum + debt.minimumPayment + debt.fees, 0)
  }

  const getConsolidatedMinimumPayment = () => {
    return debts
      .filter((debt) => includeDebtsInConsolidation[debt.id])
      .reduce((sum, debt) => sum + debt.minimumPayment + debt.fees, 0)
  }

  const getNonConsolidatedMinimumPayment = () => {
    return debts
      .filter((debt) => !includeDebtsInConsolidation[debt.id])
      .reduce((sum, debt) => sum + debt.minimumPayment + debt.fees, 0)
  }

  const getAverageInterestRate = () => {
    if (debts.length === 0) return 0

    const totalDebt = getTotalDebt()
    if (totalDebt === 0) return 0

    const weightedSum = debts.reduce((sum, debt) => sum + (debt.amount / totalDebt) * debt.interestRate, 0)

    return weightedSum
  }

  const getConsolidatedAverageInterestRate = () => {
    const debtsToConsolidate = debts.filter((debt) => includeDebtsInConsolidation[debt.id])
    if (debtsToConsolidate.length === 0) return 0

    const totalDebt = debtsToConsolidate.reduce((sum, debt) => sum + debt.amount, 0)
    if (totalDebt === 0) return 0

    const weightedSum = debtsToConsolidate.reduce((sum, debt) => sum + (debt.amount / totalDebt) * debt.interestRate, 0)

    return weightedSum
  }

  const getTotalInterestPaid = () => {
    if (paymentPlan.length === 0) return 0

    let totalInterest = 0
    paymentPlan.forEach((month) => {
      month.remainingDebts.forEach((debt) => {
        totalInterest += debt.interestPayment
      })
    })

    return totalInterest
  }

  const getPayoffTime = () => {
    return paymentPlan.length
  }

  const getSelectedConsolidationOption = () => {
    if (!selectedConsolidationOption) return null
    return consolidationOptions.find((option) => option.id === selectedConsolidationOption) || null
  }

  const toggleDebtInConsolidation = (debtId: string) => {
    setIncludeDebtsInConsolidation((prev) => ({
      ...prev,
      [debtId]: !prev[debtId],
    }))
  }

  const getMonthlyPaymentAfterConsolidation = () => {
    const option = getSelectedConsolidationOption()
    if (!option) return getTotalMinimumPayment()

    return option.monthlyCost + getNonConsolidatedMinimumPayment()
  }

  const getMonthlySavingsAfterConsolidation = () => {
    return getTotalMinimumPayment() - getMonthlyPaymentAfterConsolidation()
  }

  const getTotalSavingsAfterConsolidation = () => {
    const option = getSelectedConsolidationOption()
    if (!option) return 0

    return option.savings
  }

  const getPayoffTimeAfterConsolidation = () => {
    const option = getSelectedConsolidationOption()
    if (!option) return getPayoffTime()

    return option.term
  }

  const getTimesSavedAfterConsolidation = () => {
    return getPayoffTime() - getPayoffTimeAfterConsolidation()
  }

  const getRecommendations = () => {
    const recommendations = []

    // Høj rente anbefalinger
    const highInterestDebts = debts.filter((debt) => debt.interestRate > 15)
    if (highInterestDebts.length > 0) {
      recommendations.push({
        priority: "high",
        title: "Refinansier højrente gæld",
        description: `Du har ${highInterestDebts.length} gældsposter med rente over 15%. Overvej at refinansiere disse for at spare penge.`,
        icon: <TrendingDown className="h-5 w-5 text-red-500" />,
      })
    }

    // Små gældsposter
    const smallDebts = debts.filter((debt) => debt.amount < 5000)
    if (smallDebts.length > 0) {
      recommendations.push({
        priority: "medium",
        title: "Betal små gældsposter først",
        description: `Du har ${smallDebts.length} små gældsposter under 5.000 kr. Overvej at betale disse af først for hurtige sejre.`,
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      })
    }

    // Ekstra betaling anbefaling
    if (getTotalDebt() > 0 && extraMonthlyPayment < 500) {
      recommendations.push({
        priority: "medium",
        title: "Øg dine månedlige betalinger",
        description: "Selv en lille ekstra betaling hver måned kan reducere din gæld betydeligt hurtigere.",
        icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
      })
    }

    // Konsolideringsanbefaling
    if (debts.length > 3) {
      recommendations.push({
        priority: "medium",
        title: "Overvej gældskonsolidering",
        description:
          "Du har mange forskellige gældsposter. Det kan være fordelagtigt at konsolidere dem til ét lån med lavere rente.",
        icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
      })
    }

    // Generel anbefaling
    recommendations.push({
      priority: "low",
      title: "Opret en nødfond",
      description: "Sørg for at have en nødfond på 3-6 måneders udgifter, før du betaler ekstra af på gæld.",
      icon: <AlertCircle className="h-5 w-5 text-purple-500" />,
    })

    return recommendations
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Afbetalingsplan</h1>
        <p className="text-gray-500 max-w-3xl">
          Få overblik over din gæld og lav en personlig afbetalingsplan. Vores værktøj hjælper dig med at blive gældfri
          hurtigere og spare penge på renter.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overblik">Gældsoverblik</TabsTrigger>
          <TabsTrigger value="strategi">Afbetalingsstrategi</TabsTrigger>
          <TabsTrigger value="plan">Afbetalingsplan</TabsTrigger>
          <TabsTrigger value="konsolidering">Gældskonsolidering</TabsTrigger>
          <TabsTrigger value="raadgivning">Rådgivning</TabsTrigger>
          <TabsTrigger value="ai">AI-anbefaling</TabsTrigger>
        </TabsList>

        {/* Gældsoverblik */}
        <TabsContent value="overblik">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tilføj gældspost</CardTitle>
                <CardDescription>Indtast detaljer om din gæld for at få en personlig afbetalingsplan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="debt-type">Gældstype</Label>
                    <Select value={newDebtType} onValueChange={(value: DebtType) => setNewDebtType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg gældstype" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="creditcard">Kreditkort</SelectItem>
                        <SelectItem value="carloan">Billån</SelectItem>
                        <SelectItem value="studentloan">SU-lån</SelectItem>
                        <SelectItem value="personalloan">Privatlån</SelectItem>
                        <SelectItem value="mortgage">Boliglån</SelectItem>
                        <SelectItem value="other">Anden gæld</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="debt-name">Navn på gæld</Label>
                    <Input
                      id="debt-name"
                      placeholder="F.eks. Nordea billån"
                      value={newDebtName}
                      onChange={(e) => setNewDebtName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="debt-amount">Restgæld (kr)</Label>
                      <FieldTooltip content="Det samlede beløb, du skylder på denne gældspost" />
                    </div>
                    <Input
                      id="debt-amount"
                      placeholder="F.eks. 50000"
                      value={newDebtAmount}
                      onChange={(e) => setNewDebtAmount(e.target.value)}
                      type="number"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="debt-interest">Rente (%)</Label>
                      <FieldTooltip content="Den årlige rente på gælden i procent" />
                    </div>
                    <Input
                      id="debt-interest"
                      placeholder="F.eks. 5.5"
                      value={newDebtInterestRate}
                      onChange={(e) => setNewDebtInterestRate(e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="debt-payment">Minimumsbetaling (kr/md)</Label>
                      <FieldTooltip content="Det mindste beløb, du skal betale hver måned" />
                    </div>
                    <Input
                      id="debt-payment"
                      placeholder="F.eks. 1500"
                      value={newDebtMinimumPayment}
                      onChange={(e) => setNewDebtMinimumPayment(e.target.value)}
                      type="number"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="debt-months">Restløbetid (måneder)</Label>
                      <FieldTooltip content="Valgfrit: Antal måneder til gælden er betalt ud" />
                    </div>
                    <Input
                      id="debt-months"
                      placeholder="Valgfrit"
                      value={newDebtRemainingMonths}
                      onChange={(e) => setNewDebtRemainingMonths(e.target.value)}
                      type="number"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="debt-fees">Månedlige gebyrer (kr)</Label>
                    <FieldTooltip content="Valgfrit: Eventuelle faste gebyrer, der betales hver måned" />
                  </div>
                  <Input
                    id="debt-fees"
                    placeholder="Valgfrit"
                    value={newDebtFees}
                    onChange={(e) => setNewDebtFees(e.target.value)}
                    type="number"
                    min="0"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={addDebt} className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Tilføj gældspost
                </Button>
              </CardFooter>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gældsoversigt</CardTitle>
                  <CardDescription>Oversigt over dine gældsposter og deres detaljer</CardDescription>
                </CardHeader>
                <CardContent>
                  {debts.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p>Du har ikke tilføjet nogen gældsposter endnu.</p>
                      <p className="text-sm mt-2">Tilføj din gæld i formularen til venstre for at komme i gang.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {debts.map((debt) => (
                        <div
                          key={debt.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              {getDebtIcon(debt.type)}
                            </div>
                            <div>
                              <p className="font-medium">{debt.name}</p>
                              <p className="text-sm text-gray-500">
                                {formatCurrency(debt.amount)} • {formatPercent(debt.interestRate)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDebt(debt.id)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {debts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Samlet gældsoverblik</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Samlet gæld</p>
                        <p className="text-2xl font-bold">{formatCurrency(getTotalDebt())}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Månedlig minimumsbetaling</p>
                        <p className="text-2xl font-bold">{formatCurrency(getTotalMinimumPayment())}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Gennemsnitlig rente</p>
                        <p className="text-2xl font-bold">{formatPercent(getAverageInterestRate())}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Antal gældsposter</p>
                        <p className="text-2xl font-bold">{debts.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Afbetalingsstrategi */}
        <TabsContent value="strategi">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Vælg afbetalingsstrategi</CardTitle>
                <CardDescription>
                  Forskellige strategier kan hjælpe dig med at blive gældfri på den måde, der passer bedst til dig
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={repaymentStrategy}
                  onValueChange={(value: "avalanche" | "snowball" | "custom") => setRepaymentStrategy(value)}
                >
                  <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="avalanche" id="avalanche" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="avalanche" className="font-medium">
                        Avalanche-metoden
                      </Label>
                      <p className="text-sm text-gray-500">
                        Betal gæld med højeste rente først. Dette sparer flest penge i renter over tid.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="snowball" id="snowball" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="snowball" className="font-medium">
                        Snowball-metoden
                      </Label>
                      <p className="text-sm text-gray-500">
                        Betal mindste gæld først. Dette giver hurtige sejre og psykologisk motivation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="custom" id="custom" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="custom" className="font-medium">
                        Brugerdefineret rækkefølge
                      </Label>
                      <p className="text-sm text-gray-500">Prioriter gælden i den rækkefølge, du selv ønsker.</p>
                    </div>
                  </div>
                </RadioGroup>

                {repaymentStrategy === "custom" && debts.length > 0 && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium">Prioriter din gæld</h3>
                    <p className="text-sm text-gray-500">
                      Træk gældsposterne i den rækkefølge, du ønsker at betale dem af. Den øverste betales først.
                    </p>

                    <div className="space-y-2">
                      {customOrder.length > 0 &&
                        customOrder.map((debtId, index) => {
                          const debt = debts.find((d) => d.id === debtId)
                          if (!debt) return null

                          return (
                            <div
                              key={debt.id}
                              className="flex items-center justify-between p-3 border rounded-lg bg-white"
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-gray-500 font-medium">{index + 1}</div>
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  {getDebtIcon(debt.type)}
                                </div>
                                <div>
                                  <p className="font-medium">{debt.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {formatCurrency(debt.amount)} • {formatPercent(debt.interestRate)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => moveDebtUp(index)}
                                  disabled={index === 0}
                                  className="text-gray-500"
                                >
                                  <ArrowUpWideNarrow className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => moveDebtDown(index)}
                                  disabled={index === customOrder.length - 1}
                                  className="text-gray-500"
                                >
                                  <ArrowDownWideNarrow className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Ekstra månedlig betaling</h3>
                      <p className="text-sm text-gray-500">Hvor meget ekstra kan du betale hver måned?</p>
                    </div>
                    <div className="font-medium">{formatCurrency(extraMonthlyPayment)}</div>
                  </div>

                  <Slider
                    value={[extraMonthlyPayment]}
                    min={0}
                    max={5000}
                    step={100}
                    onValueChange={(value) => {
                      setExtraMonthlyPayment(value[0])
                      setActiveScenario({
                        ...activeScenario,
                        extraMonthlyPayment: value[0],
                      })
                    }}
                  />

                  <div className="grid grid-cols-5 text-xs text-gray-500">
                    <div>0 kr</div>
                    <div className="text-center">1.000 kr</div>
                    <div className="text-center">2.000 kr</div>
                    <div className="text-center">3.000 kr</div>
                    <div className="text-right">5.000 kr</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Afbetalingsoversigt</CardTitle>
                  <CardDescription>Baseret på din valgte strategi og ekstra betalinger</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {debts.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p>Tilføj gældsposter for at se din afbetalingsplan.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Tid til gældfrihed</p>
                          <p className="text-2xl font-bold">
                            {getPayoffTime()} {getPayoffTime() === 1 ? "måned" : "måneder"}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Samlede renteudgifter</p>
                          <p className="text-2xl font-bold">{formatCurrency(getTotalInterestPaid())}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-medium">Månedlig betaling</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span>Minimumsbetaling:</span>
                            <span>{formatCurrency(getTotalMinimumPayment())}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span>Ekstra betaling:</span>
                            <span>{formatCurrency(extraMonthlyPayment)}</span>
                          </div>
                          <div className="flex justify-between font-bold pt-2 border-t">
                            <span>Total månedlig betaling:</span>
                            <span>{formatCurrency(getTotalMinimumPayment() + extraMonthlyPayment)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-medium">Besparelse med ekstra betaling</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          {extraMonthlyPayment > 0 ? (
                            <>
                              <p className="mb-1">
                                Med din ekstra betaling på {formatCurrency(extraMonthlyPayment)} om måneden:
                              </p>
                              <ul className="space-y-1 text-sm">
                                <li className="flex justify-between">
                                  <span>• Sparer du:</span>
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(getTotalInterestPaid() * 0.2)}
                                  </span>
                                </li>
                                <li className="flex justify-between">
                                  <span>• Bliver gældfri:</span>
                                  <span className="font-medium text-green-600">
                                    {Math.round(getPayoffTime() * 0.3)} måneder tidligere
                                  </span>
                                </li>
                              </ul>
                            </>
                          ) : (
                            <p className="text-gray-500">
                              Tilføj en ekstra månedlig betaling for at se potentielle besparelser.
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {debts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Scenarier</CardTitle>
                    <CardDescription>Udforsk forskellige scenarier for din gældsafvikling</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                      {scenarios.map((scenario) => (
                        <button
                          key={scenario.id}
                          className={`p-3 text-left border rounded-lg hover:bg-gray-50 ${
                            activeScenario.id === scenario.id ? "border-blue-500 bg-blue-50" : ""
                          }`}
                          onClick={() => setActiveScenario(scenario)}
                        >
                          <p className="font-medium">{scenario.name}</p>
                          <p className="text-sm text-gray-500">{scenario.description}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Afbetalingsplan */}
        <TabsContent value="plan">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Detaljeret afbetalingsplan</CardTitle>
                    <CardDescription>Måned-for-måned oversigt over din gældsafvikling</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" /> Eksportér
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="mr-2 h-4 w-4" /> Del
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {debts.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p>Tilføj gældsposter for at se din afbetalingsplan.</p>
                    </div>
                  ) : paymentPlan.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p>Beregner din afbetalingsplan...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Måned
                                </th>
                                {debts.map((debt) => (
                                  <th
                                    key={debt.id}
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    {debt.name}
                                  </th>
                                ))}
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Total betaling
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Restgæld
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {paymentPlan.slice(0, 24).map((month) => (
                                <tr key={month.month} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{month.date}</td>
                                  {debts.map((debt) => {
                                    const debtPayment = month.remainingDebts.find((d) => d.debtId === debt.id)
                                    return (
                                      <td key={debt.id} className="px-4 py-3 whitespace-nowrap text-sm">
                                        {debtPayment
                                          ? debtPayment.remainingAmount > 0
                                            ? `${formatCurrency(debtPayment.payment)}`
                                            : "Betalt"
                                          : "Betalt"}
                                      </td>
                                    )
                                  })}
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                    {formatCurrency(month.totalPayment)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {formatCurrency(month.totalRemaining)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {paymentPlan.length > 24 && (
                          <div className="p-4 text-center text-sm text-gray-500 border-t">
                            Viser de første 24 måneder af din afbetalingsplan.
                            <Button variant="link" className="h-auto p-0 ml-1">
                              Vis alle {paymentPlan.length} måneder
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Afbetalingsoversigt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {debts.length > 0 && paymentPlan.length > 0 && (
                    <>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Samlet fremskridt</p>
                          <div className="space-y-2">
                            <Progress value={(1 - paymentPlan[0].totalRemaining / getTotalDebt()) * 100} />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>0%</span>
                              <span>50%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-500">Oprindelig gæld:</span>
                            <span>{formatCurrency(getTotalDebt())}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-500">Resterende gæld:</span>
                            <span>{formatCurrency(paymentPlan[0].totalRemaining)}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-500">Betalt af:</span>
                            <span>{formatCurrency(getTotalDebt() - paymentPlan[0].totalRemaining)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-medium">Gældfri dato</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-xl font-bold">{paymentPlan[paymentPlan.length - 1].date}</p>
                          <p className="text-sm text-gray-500">{getPayoffTime()} måneder fra nu</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-medium">Rentebesparelse</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          {extraMonthlyPayment > 0 ? (
                            <>
                              <p className="text-xl font-bold text-green-600">
                                {formatCurrency(getTotalInterestPaid() * 0.2)}
                              </p>
                              <p className="text-sm text-gray-500">Sammenlignet med kun at betale minimumbetalinger</p>
                            </>
                          ) : (
                            <p className="text-gray-500">
                              Tilføj en ekstra månedlig betaling for at se potentielle besparelser.
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {debts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hvad nu hvis...?</CardTitle>
                    <CardDescription>Se hvordan forskellige ændringer påvirker din afbetalingsplan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="font-medium">Hvis du betaler 500 kr. ekstra om måneden</p>
                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-500">Tid sparet:</span>
                          <span className="font-medium text-green-600">
                            {Math.round(getPayoffTime() * 0.15)} måneder
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Rentebesparelse:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(getTotalInterestPaid() * 0.1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium">Hvis du får 10.000 kr. ekstra nu</p>
                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-500">Tid sparet:</span>
                          <span className="font-medium text-green-600">
                            {Math.round(getPayoffTime() * 0.08)} måneder
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Rentebesparelse:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(getTotalInterestPaid() * 0.05)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium">Hvis du refinansierer til 5% rente</p>
                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-500">Tid sparet:</span>
                          <span className="font-medium text-green-600">
                            {getAverageInterestRate() > 5
                              ? `${Math.round(getPayoffTime() * 0.12)} måneder`
                              : "0 måneder"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Rentebesparelse:</span>
                          <span className="font-medium text-green-600">
                            {getAverageInterestRate() > 5 ? formatCurrency(getTotalInterestPaid() * 0.25) : "0 kr"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Gældskonsolidering */}
        <TabsContent value="konsolidering">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Gældskonsolidering</CardTitle>
                  <CardDescription>
                    Beregn fordele ved at samle dine gældsposter i ét lån med lavere rente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {debts.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p>Tilføj gældsposter for at beregne fordele ved gældskonsolidering.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <Alert className="bg-blue-50 border-blue-200">
                        <HelpCircle className="h-4 w-4 text-blue-500" />
                        <AlertTitle>Hvad er gældskonsolidering?</AlertTitle>
                        <AlertDescription>
                          Gældskonsolidering betyder, at du samler flere gældsposter i ét nyt lån, typisk med lavere
                          rente. Dette kan gøre det nemmere at holde styr på dine betalinger og potentielt spare dig
                          penge i renter.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        <h3 className="font-medium">Vælg gældsposter til konsolidering</h3>
                        <p className="text-sm text-gray-500">
                          Marker de gældsposter, du ønsker at konsolidere. Typisk giver det mest mening at konsolidere
                          gæld med høj rente.
                        </p>

                        <div className="space-y-2">
                          {debts.map((debt) => (
                            <div key={debt.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={includeDebtsInConsolidation[debt.id] || false}
                                  onCheckedChange={() => toggleDebtInConsolidation(debt.id)}
                                />
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  {getDebtIcon(debt.type)}
                                </div>
                                <div>
                                  <p className="font-medium">{debt.name}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>{formatCurrency(debt.amount)}</span>
                                    <Badge
                                      className={
                                        debt.interestRate > 10 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                                      }
                                    >
                                      {formatPercent(debt.interestRate)}
                                    </Badge>
                                    <span>{formatCurrency(debt.minimumPayment)}/md</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Gæld til konsolidering</p>
                            <p className="text-2xl font-bold">{formatCurrency(getConsolidatedDebtTotal())}</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Nuværende gns. rente</p>
                            <p className="text-2xl font-bold">{formatPercent(getConsolidatedAverageInterestRate())}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-medium">Konsolideringsmuligheder</h3>
                          <p className="text-sm text-gray-500">
                            Vælg mellem forskellige konsolideringsmuligheder eller opret din egen.
                          </p>

                          <div className="grid gap-4 md:grid-cols-3">
                            {consolidationOptions
                              .filter((option) => option.id !== "custom")
                              .map((option) => (
                                <div
                                  key={option.id}
                                  className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 ${
                                    selectedConsolidationOption === option.id ? "border-blue-500 bg-blue-50" : ""
                                  }`}
                                  onClick={() => setSelectedConsolidationOption(option.id)}
                                >
                                  <h4 className="font-medium mb-2">{option.name}</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Rente:</span>
                                      <span className="font-medium">{formatPercent(option.interestRate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Løbetid:</span>
                                      <span className="font-medium">{option.term} måneder</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Md. betaling:</span>
                                      <span className="font-medium">{formatCurrency(option.monthlyCost)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Oprettelsesgebyr:</span>
                                      <span className="font-medium">{formatCurrency(option.setupFee)}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}

                            <div
                              className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 ${
                                showCustomConsolidation ? "border-blue-500 bg-blue-50" : ""
                              }`}
                              onClick={() => setShowCustomConsolidation(!showCustomConsolidation)}
                            >
                              <h4 className="font-medium mb-2">Brugerdefineret</h4>
                              <p className="text-sm text-gray-500">
                                Opret din egen konsolideringsmulighed med dine egne parametre.
                              </p>
                              <div className="mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => setShowCustomConsolidation(!showCustomConsolidation)}
                                >
                                  {showCustomConsolidation ? "Skjul indstillinger" : "Tilpas indstillinger"}
                                </Button>
                              </div>
                            </div>
                          </div>

                          {showCustomConsolidation && (
                            <div className="p-4 border rounded-lg mt-4">
                              <h4 className="font-medium mb-4">Tilpas konsolideringsmulighed</h4>
                              <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                  <Label htmlFor="custom-interest-rate">Rente (%)</Label>
                                  <Input
                                    id="custom-interest-rate"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={customConsolidation.interestRate}
                                    onChange={(e) =>
                                      setCustomConsolidation({
                                        ...customConsolidation,
                                        interestRate: Number.parseFloat(e.target.value) || 0,
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="custom-term">Løbetid (måneder)</Label>
                                  <Input
                                    id="custom-term"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={customConsolidation.term}
                                    onChange={(e) =>
                                      setCustomConsolidation({
                                        ...customConsolidation,
                                        term: Number.parseInt(e.target.value) || 0,
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="custom-setup-fee">Oprettelsesgebyr (kr)</Label>
                                  <Input
                                    id="custom-setup-fee"
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={customConsolidation.setupFee}
                                    onChange={(e) =>
                                      setCustomConsolidation({
                                        ...customConsolidation,
                                        setupFee: Number.parseFloat(e.target.value) || 0,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {debts.length > 0 && getSelectedConsolidationOption() && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Sammenligning</CardTitle>
                    <CardDescription>Sammenligning af din nuværende situation med gældskonsolidering</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <h3 className="font-medium">Nuværende situation</h3>
                        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Månedlig betaling:</span>
                            <span className="font-medium">{formatCurrency(getTotalMinimumPayment())}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tid til gældfrihed:</span>
                            <span className="font-medium">{getPayoffTime()} måneder</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Samlede renteudgifter:</span>
                            <span className="font-medium">{formatCurrency(getTotalInterestPaid())}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Gennemsnitlig rente:</span>
                            <span className="font-medium">{formatPercent(getAverageInterestRate())}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Med gældskonsolidering</h3>
                        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Månedlig betaling:</span>
                            <span className="font-medium">{formatCurrency(getMonthlyPaymentAfterConsolidation())}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tid til gældfrihed:</span>
                            <span className="font-medium">{getPayoffTimeAfterConsolidation()} måneder</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Samlede renteudgifter:</span>
                            <span className="font-medium">
                              {formatCurrency(getSelectedConsolidationOption()?.totalInterest || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Ny rente:</span>
                            <span className="font-medium">
                              {formatPercent(getSelectedConsolidationOption()?.interestRate || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-medium flex items-center text-green-800">
                        <Check className="h-5 w-5 mr-2 text-green-600" />
                        Potentielle besparelser
                      </h3>
                      <div className="grid gap-4 md:grid-cols-3 mt-4">
                        <div className="p-3 bg-white rounded-lg text-center">
                          <p className="text-sm text-gray-500 mb-1">Månedlig besparelse</p>
                          <p
                            className={`text-xl font-bold ${getMonthlySavingsAfterConsolidation() > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(getMonthlySavingsAfterConsolidation())}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg text-center">
                          <p className="text-sm text-gray-500 mb-1">Total rentebesparelse</p>
                          <p
                            className={`text-xl font-bold ${getTotalSavingsAfterConsolidation() > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(getTotalSavingsAfterConsolidation())}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg text-center">
                          <p className="text-sm text-gray-500 mb-1">Tid sparet</p>
                          <p
                            className={`text-xl font-bold ${getTimesSavedAfterConsolidation() > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {getTimesSavedAfterConsolidation()} måneder
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fordele og ulemper</CardTitle>
                  <CardDescription>Ved gældskonsolidering</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center">
                      <Check className="h-5 w-5 mr-2 text-green-600" />
                      Fordele
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 text-green-600 mt-1" />
                        <span className="text-sm">Én månedlig betaling i stedet for flere</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 text-green-600 mt-1" />
                        <span className="text-sm">Potentielt lavere samlet rente</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 text-green-600 mt-1" />
                        <span className="text-sm">Nemmere at holde styr på din gæld</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 text-green-600 mt-1" />
                        <span className="text-sm">Mulighed for lavere månedlig betaling</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 text-green-600 mt-1" />
                        <span className="text-sm">Potentielt forbedret kreditværdighed over tid</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center">
                      <X className="h-5 w-5 mr-2 text-red-600" />
                      Ulemper
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <X className="h-4 w-4 mr-2 text-red-600 mt-1" />
                        <span className="text-sm">Mulige oprettelsesgebyrer</span>
                      </li>
                      <li className="flex items-start">
                        <X className="h-4 w-4 mr-2 text-red-600 mt-1" />
                        <span className="text-sm">Potentielt længere afbetalingstid</span>
                      </li>
                      <li className="flex items-start">
                        <X className="h-4 w-4 mr-2 text-red-600 mt-1" />
                        <span className="text-sm">Kræver god kreditværdighed for at få gode vilkår</span>
                      </li>
                      <li className="flex items-start">
                        <X className="h-4 w-4 mr-2 text-red-600 mt-1" />
                        <span className="text-sm">Risiko for at optage ny gæld på de betalte kreditkort</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Næste skridt</CardTitle>
                  <CardDescription>Sådan kommer du videre med gældskonsolidering</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="space-y-4">
                    <li className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <span className="text-blue-800 text-sm font-medium">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Tjek din kreditværdighed</p>
                        <p className="text-sm text-gray-500">
                          Før du ansøger om et konsolideringslån, er det en god idé at tjekke din kreditværdighed.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <span className="text-blue-800 text-sm font-medium">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Sammenlign lånetilbud</p>
                        <p className="text-sm text-gray-500">
                          Indhent tilbud fra flere banker og låneudbydere for at finde den bedste rente og vilkår.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <span className="text-blue-800 text-sm font-medium">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Læs det med småt</p>
                        <p className="text-sm text-gray-500">
                          Vær opmærksom på gebyrer, variabel vs. fast rente, og eventuelle strafrenter ved for sen
                          betaling.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <span className="text-blue-800 text-sm font-medium">4</span>
                      </div>
                      <div>
                        <p className="font-medium">Ansøg om lånet</p>
                        <p className="text-sm text-gray-500">
                          Når du har fundet det bedste tilbud, kan du ansøge om lånet og bruge det til at betale din
                          eksisterende gæld.
                        </p>
                      </div>
                    </li>
                  </ol>

                  <div className="pt-4">
                    <Button className="w-full">
                      <Calculator className="mr-2 h-4 w-4" />
                      Få personligt lånetilbud
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Rådgivning */}
        <TabsContent value="raadgivning">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personlige anbefalinger</CardTitle>
                  <CardDescription>Baseret på din gældssituation har vi følgende anbefalinger til dig</CardDescription>
                </CardHeader>
                <CardContent>
                  {debts.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p>Tilføj gældsposter for at få personlige anbefalinger.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {getRecommendations()
                        .filter((rec) => rec.priority === "high")
                        .map((rec, index) => (
                          <div key={index} className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                            <div className="flex gap-3">
                              <div className="mt-1">{rec.icon}</div>
                              <div>
                                <h3 className="font-medium">{rec.title}</h3>
                                <p className="text-sm text-gray-600">{rec.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}

                      {getRecommendations()
                        .filter((rec) => rec.priority === "medium")
                        .map((rec, index) => (
                          <div key={index} className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg">
                            <div className="flex gap-3">
                              <div className="mt-1">{rec.icon}</div>
                              <div>
                                <h3 className="font-medium">{rec.title}</h3>
                                <p className="text-sm text-gray-600">{rec.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}

                      {getRecommendations()
                        .filter((rec) => rec.priority === "low")
                        .map((rec, index) => (
                          <div key={index} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                            <div className="flex gap-3">
                              <div className="mt-1">{rec.icon}</div>
                              <div>
                                <h3 className="font-medium">{rec.title}</h3>
                                <p className="text-sm text-gray-600">{rec.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Praktiske strategier</CardTitle>
                    <CardDescription>Konkrete trin du kan tage for at blive gældfri hurtigere</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-2">1. Skab et nødbudget</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Gennemgå dine udgifter og skab et stramt budget, der prioriterer gældsafvikling. Find områder,
                          hvor du kan skære ned, og omdirigér disse penge til ekstra gældsbetalinger.
                        </p>
                        <Button variant="outline" className="w-full">
                          Gå til budgetplanlægger
                        </Button>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-2">2. Forhandl med kreditorer</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Kontakt dine kreditorer og forsøg at forhandle lavere renter eller bedre vilkår. Mange er
                          villige til at hjælpe, hvis du viser initiativ til at betale din gæld.
                        </p>
                        <div className="text-sm bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium mb-1">Forslag til samtale:</p>
                          <p className="text-gray-600">
                            "Jeg arbejder på at forbedre min økonomiske situation og betale min gæld. Jeg har været
                            kunde hos jer i [tid] og vil gerne høre, om I kan tilbyde mig en lavere rente på min gæld?"
                          </p>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-2">3. Overvej gældskonsolidering</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Hvis du har flere gældsposter med høje renter, kan det være fordelagtigt at konsolidere dem
                          til ét lån med lavere rente. Dette kan gøre det nemmere at holde styr på dine betalinger og
                          potentielt spare dig penge i renter.
                        </p>
                        <Button variant="outline" className="w-full">
                          Beregn potentielle besparelser ved konsolidering
                        </Button>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-2">4. Skab ekstra indkomst</h3>
                        <p className="text-sm text-gray-600">
                          Overvej midlertidige måder at øge din indkomst på, såsom freelancearbejde, salg af ubrugte
                          ting eller et deltidsjob. Dedikér denne ekstra indkomst direkte til gældsafvikling for
                          hurtigere resultater.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Din gældsrådgiver</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <Lightbulb className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="font-medium">Personlig rådgivning</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">
                      Få personlig rådgivning om din gældssituation fra vores eksperter
                    </p>
                    <Button className="w-full">Book en samtale</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gældsordliste</CardTitle>
                  <CardDescription>Forstå de vigtigste begreber om gæld og afbetaling</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">ÅOP (Årlig Omkostning i Procent)</h3>
                      <p className="text-sm text-gray-600">
                        Det samlede udtryk for alle omkostninger ved et lån, inklusiv renter og gebyrer, omregnet til en
                        årlig procentsats.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium">Snowball-metoden</h3>
                      <p className="text-sm text-gray-600">
                        En gældsafviklingsstrategi, hvor du betaler den mindste gæld først for at opnå hurtige sejre og
                        motivation.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium">Avalanche-metoden</h3>
                      <p className="text-sm text-gray-600">
                        En gældsafviklingsstrategi, hvor du betaler gælden med højeste rente først for at minimere de
                        samlede renteomkostninger.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium">Gældskonsolidering</h3>
                      <p className="text-sm text-gray-600">
                        At kombinere flere gældsposter til ét lån, typisk med lavere rente og én månedlig betaling.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ressourcer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" /> Gældsafviklingsguide
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" /> Forhandlingsskabeloner
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" /> Budgetskabelon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* AI-anbefaling */}
        <TabsContent value="ai">
          <AIRecommendation data={aiRecommendation} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
