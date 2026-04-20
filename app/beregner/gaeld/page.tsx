"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CalculatorTracker } from "@/components/calculator-tracker"
import { FieldTooltip } from "@/components/field-tooltip"
import { AIRecommendation } from "@/components/ai-recommendation"
import { analyzeGaeld } from "@/lib/ai-engines"
import {
  Calculator,
  CreditCard,
  DollarSign,
  HelpCircle,
  Home,
  Info,
  Lightbulb,
  PiggyBank,
  Plus,
  Trash2,
  TrendingUp,
  Briefcase,
  AlertCircle,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { JSX } from "react"

// Typer for gæld og anbefalinger
type DebtType = "credit_card" | "personal_loan" | "mortgage" | "car_loan" | "student_loan" | "other"

interface Debt {
  id: string
  name: string
  amount: number
  interestRate: number
  minimumPayment: number
  type: DebtType
}

interface IncomeSource {
  id: string
  name: string
  amount: number
  frequency: "monthly" | "yearly"
}

interface Recommendation {
  title: string
  description: string
  impact: "high" | "medium" | "low"
  type: "debt" | "income" | "expense" | "lifestyle"
  icon: JSX.Element
}

// Hjælpefunktioner
const generateId = () => Math.random().toString(36).substring(2, 9)

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK" }).format(amount)
}

const calculateMonthlyPayment = (debt: Debt) => {
  return Math.max(debt.minimumPayment, debt.amount * 0.03)
}

const calculateTotalDebt = (debts: Debt[]) => {
  return debts.reduce((total, debt) => total + debt.amount, 0)
}

const calculateTotalInterest = (debts: Debt[]) => {
  return debts.reduce((total, debt) => total + debt.amount * (debt.interestRate / 100), 0)
}

const calculateTotalMonthlyPayment = (debts: Debt[]) => {
  return debts.reduce((total, debt) => total + calculateMonthlyPayment(debt), 0)
}

const calculateTotalIncome = (incomeSources: IncomeSource[]) => {
  return incomeSources.reduce((total, source) => {
    return total + (source.frequency === "monthly" ? source.amount : source.amount / 12)
  }, 0)
}

const calculateDebtToIncomeRatio = (debts: Debt[], incomeSources: IncomeSource[]) => {
  const totalMonthlyPayment = calculateTotalMonthlyPayment(debts)
  const totalMonthlyIncome = calculateTotalIncome(incomeSources)

  return totalMonthlyIncome > 0 ? (totalMonthlyPayment / totalMonthlyIncome) * 100 : 0
}

const getDebtToIncomeRatioStatus = (ratio: number) => {
  if (ratio < 30) return { status: "Sund", color: "text-green-500" }
  if (ratio < 40) return { status: "Moderat", color: "text-yellow-500" }
  return { status: "Høj", color: "text-red-500" }
}

const getDebtTypeIcon = (type: DebtType) => {
  switch (type) {
    case "credit_card":
      return <CreditCard className="h-5 w-5" />
    case "personal_loan":
      return <DollarSign className="h-5 w-5" />
    case "mortgage":
      return <Home className="h-5 w-5" />
    case "car_loan":
      return <Briefcase className="h-5 w-5" />
    case "student_loan":
      return <Calculator className="h-5 w-5" />
    default:
      return <CreditCard className="h-5 w-5" />
  }
}

const getDebtTypeName = (type: DebtType) => {
  switch (type) {
    case "credit_card":
      return "Kreditkort"
    case "personal_loan":
      return "Personligt lån"
    case "mortgage":
      return "Boliglån"
    case "car_loan":
      return "Billån"
    case "student_loan":
      return "SU-lån"
    default:
      return "Anden gæld"
  }
}

// Hovedkomponent
export default function DebtRepaymentCalculator() {
  const [step, setStep] = useState(1)
  const [debts, setDebts] = useState<Debt[]>([])
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([])
  const [monthlyExpenses, setMonthlyExpenses] = useState(0)
  const [availableForDebt, setAvailableForDebt] = useState(0)
  const [newDebt, setNewDebt] = useState<Partial<Debt>>({
    name: "",
    amount: 0,
    interestRate: 0,
    minimumPayment: 0,
    type: "credit_card",
  })
  const [newIncome, setNewIncome] = useState<Partial<IncomeSource>>({
    name: "",
    amount: 0,
    frequency: "monthly",
  })
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [showResults, setShowResults] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const aiRecommendation = useMemo(
    () =>
      analyzeGaeld({
        debts: debts.map((d) => ({
          name: d.name,
          amount: d.amount,
          interestRate: d.interestRate,
          minimumPayment: d.minimumPayment,
        })),
        monthlyIncome: calculateTotalIncome(incomeSources),
        monthlyExpenses,
      }),
    [debts, incomeSources, monthlyExpenses],
  )

  // Håndter tilføjelse af ny gæld
  const handleAddDebt = () => {
    if (
      newDebt.name &&
      newDebt.amount &&
      newDebt.amount > 0 &&
      newDebt.interestRate !== undefined &&
      newDebt.minimumPayment !== undefined &&
      newDebt.type
    ) {
      const debt: Debt = {
        id: generateId(),
        name: newDebt.name,
        amount: newDebt.amount,
        interestRate: newDebt.interestRate,
        minimumPayment: newDebt.minimumPayment,
        type: newDebt.type,
      }

      setDebts([...debts, debt])
      setNewDebt({
        name: "",
        amount: 0,
        interestRate: 0,
        minimumPayment: 0,
        type: "credit_card",
      })
    }
  }

  // Håndter fjernelse af gæld
  const handleRemoveDebt = (id: string) => {
    setDebts(debts.filter((debt) => debt.id !== id))
  }

  // Håndter tilføjelse af ny indkomstkilde
  const handleAddIncome = () => {
    if (newIncome.name && newIncome.amount && newIncome.amount > 0 && newIncome.frequency) {
      const income: IncomeSource = {
        id: generateId(),
        name: newIncome.name,
        amount: newIncome.amount,
        frequency: newIncome.frequency,
      }

      setIncomeSources([...incomeSources, income])
      setNewIncome({
        name: "",
        amount: 0,
        frequency: "monthly",
      })
    }
  }

  // Håndter fjernelse af indkomstkilde
  const handleRemoveIncome = (id: string) => {
    setIncomeSources(incomeSources.filter((income) => income.id !== id))
  }

  // Generer anbefalinger baseret på brugerens data
  const generateRecommendations = () => {
    const recommendations: Recommendation[] = []
    const totalDebt = calculateTotalDebt(debts)
    const totalMonthlyIncome = calculateTotalIncome(incomeSources)
    const debtToIncomeRatio = calculateDebtToIncomeRatio(debts, incomeSources)

    // Sortér gæld efter rente (højeste først)
    const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate)

    // Anbefaling om at betale højrente gæld først
    if (sortedDebts.length > 1 && sortedDebts[0].interestRate > 10) {
      recommendations.push({
        title: "Fokusér på højrente gæld først",
        description: `Prioritér at betale ${sortedDebts[0].name} (${sortedDebts[0].interestRate}%) hurtigst muligt, da den har den højeste rente.`,
        impact: "high",
        type: "debt",
        icon: <TrendingUp className="h-5 w-5 text-red-500" />,
      })
    }

    // Anbefaling om konsolidering af gæld
    if (debts.filter((debt) => debt.type === "credit_card" || debt.type === "personal_loan").length > 1) {
      recommendations.push({
        title: "Overvej gældskonsolidering",
        description:
          "Du har flere forbrugslån og kreditkortgæld. Overvej at konsolidere dem til et enkelt lån med lavere rente.",
        impact: "medium",
        type: "debt",
        icon: <CreditCard className="h-5 w-5 text-yellow-500" />,
      })
    }

    // Anbefaling om at øge indkomst
    if (debtToIncomeRatio > 40) {
      recommendations.push({
        title: "Øg din indkomst",
        description:
          "Din gæld udgør en stor del af din månedlige indkomst. Overvej at søge ekstra arbejde eller forbedre dine kvalifikationer for at øge din indkomst.",
        impact: "high",
        type: "income",
        icon: <DollarSign className="h-5 w-5 text-green-500" />,
      })
    }

    // Anbefaling om nødopsparing
    if (availableForDebt < totalMonthlyIncome * 0.1) {
      recommendations.push({
        title: "Opbyg en nødopsparing",
        description:
          "Sørg for at have en nødopsparing på mindst 3 måneders leveomkostninger, før du accelererer din gældsafdragning.",
        impact: "medium",
        type: "expense",
        icon: <PiggyBank className="h-5 w-5 text-blue-500" />,
      })
    }

    // Anbefaling om budgetlægning
    if (monthlyExpenses > totalMonthlyIncome * 0.7) {
      recommendations.push({
        title: "Reducér dine månedlige udgifter",
        description:
          "Dine månedlige udgifter er høje i forhold til din indkomst. Gennemgå dit budget og find områder, hvor du kan spare.",
        impact: "high",
        type: "expense",
        icon: <Calculator className="h-5 w-5 text-purple-500" />,
      })
    }

    // Anbefaling om at sælge aktiver
    if (totalDebt > totalMonthlyIncome * 12) {
      recommendations.push({
        title: "Overvej at sælge aktiver",
        description:
          "Din samlede gæld er betydelig. Overvej at sælge aktiver som bil, elektronik eller andre værdigenstande for at nedbringe gælden.",
        impact: "medium",
        type: "lifestyle",
        icon: <Home className="h-5 w-5 text-orange-500" />,
      })
    }

    setRecommendations(recommendations)
  }

  // Håndter næste trin
  const handleNextStep = () => {
    if (step === 3) {
      generateRecommendations()
      setShowResults(true)
    } else {
      setStep(step + 1)
    }
  }

  // Håndter forrige trin
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  // Beregn gældsafviklingsplan (Snowball-metoden)
  const calculateSnowballPlan = () => {
    if (debts.length === 0) return []

    // Sortér gæld efter størrelse (mindste først)
    const sortedDebts = [...debts].sort((a, b) => a.amount - b.amount)

    // Beregn månedligt beløb til rådighed for gældsafdragning
    const totalMinimumPayments = sortedDebts.reduce((total, debt) => total + debt.minimumPayment, 0)
    const extraPayment = Math.max(0, availableForDebt - totalMinimumPayments)

    // Opret plan
    return sortedDebts.map((debt, index) => {
      // Første gæld får ekstra betaling
      const payment = index === 0 ? debt.minimumPayment + extraPayment : debt.minimumPayment

      // Beregn måneder til afbetaling
      const monthsToPayOff = debt.amount / payment

      return {
        ...debt,
        payment,
        monthsToPayOff: Math.ceil(monthsToPayOff),
      }
    })
  }

  // Beregn gældsafviklingsplan (Avalanche-metoden)
  const calculateAvalanchePlan = () => {
    if (debts.length === 0) return []

    // Sortér gæld efter rente (højeste først)
    const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate)

    // Beregn månedligt beløb til rådighed for gældsafdragning
    const totalMinimumPayments = sortedDebts.reduce((total, debt) => total + debt.minimumPayment, 0)
    const extraPayment = Math.max(0, availableForDebt - totalMinimumPayments)

    // Opret plan
    return sortedDebts.map((debt, index) => {
      // Første gæld får ekstra betaling
      const payment = index === 0 ? debt.minimumPayment + extraPayment : debt.minimumPayment

      // Beregn måneder til afbetaling
      const monthsToPayOff = debt.amount / payment

      return {
        ...debt,
        payment,
        monthsToPayOff: Math.ceil(monthsToPayOff),
      }
    })
  }

  // Beregn gældsafviklingsplan (Proportionel-metoden)
  const calculateProportionalPlan = () => {
    if (debts.length === 0) return []

    // Beregn total gæld
    const totalDebt = debts.reduce((total, debt) => total + debt.amount, 0)

    // Opret plan
    return debts.map((debt) => {
      // Beregn proportionel betaling baseret på gældens andel af total gæld
      const proportion = debt.amount / totalDebt
      const payment = Math.max(debt.minimumPayment, availableForDebt * proportion)

      // Beregn måneder til afbetaling
      const monthsToPayOff = debt.amount / payment

      return {
        ...debt,
        payment,
        monthsToPayOff: Math.ceil(monthsToPayOff),
      }
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <CalculatorTracker calculatorName="gældsafdragning" />

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Gældsafdragningsberegner
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Få overblik over din gæld og personlige anbefalinger til hvordan du bedst afdrager den.
        </p>
      </div>

      {!showResults ? (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  1
                </span>
                <div className={`h-1 w-12 ${step >= 2 ? "bg-blue-500" : "bg-gray-200"}`}></div>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  2
                </span>
                <div className={`h-1 w-12 ${step >= 3 ? "bg-blue-500" : "bg-gray-200"}`}></div>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  3
                </span>
              </div>
              <div className="text-sm text-gray-500">Trin {step} af 3</div>
            </div>
            <CardTitle>
              {step === 1 && "Tilføj din gæld"}
              {step === 2 && "Tilføj din indkomst"}
              {step === 3 && "Tilføj dine månedlige udgifter"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tilføj alle dine gældsposter for at få et komplet overblik"}
              {step === 2 && "Tilføj dine indkomstkilder for at beregne din betalingsevne"}
              {step === 3 && "Angiv dine månedlige udgifter for at beregne hvor meget du kan afdrage"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <div className="space-y-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle>Hvorfor er dette vigtigt?</AlertTitle>
                  <AlertDescription>
                    Ved at tilføje alle dine gældsposter kan vi hjælpe dig med at prioritere dine afdrag og spare penge
                    på renter.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="debt-name">Beskrivelse</Label>
                      <Input
                        id="debt-name"
                        placeholder="F.eks. Kreditkort"
                        value={newDebt.name}
                        onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="debt-type">Type</Label>
                      <Select
                        value={newDebt.type}
                        onValueChange={(value) => setNewDebt({ ...newDebt, type: value as DebtType })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Vælg type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit_card">Kreditkort</SelectItem>
                          <SelectItem value="personal_loan">Personligt lån</SelectItem>
                          <SelectItem value="mortgage">Boliglån</SelectItem>
                          <SelectItem value="car_loan">Billån</SelectItem>
                          <SelectItem value="student_loan">SU-lån</SelectItem>
                          <SelectItem value="other">Anden gæld</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="debt-amount">Beløb</Label>
                        <FieldTooltip content="Det samlede beløb du skylder" />
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="debt-amount"
                          type="number"
                          className="pl-8"
                          placeholder="0"
                          value={newDebt.amount || ""}
                          onChange={(e) => setNewDebt({ ...newDebt, amount: Number.parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="debt-interest">Rente (%)</Label>
                        <FieldTooltip content="Den årlige rente på gælden" />
                      </div>
                      <div className="relative">
                        <TrendingUp className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="debt-interest"
                          type="number"
                          className="pl-8"
                          placeholder="0"
                          value={newDebt.interestRate || ""}
                          onChange={(e) =>
                            setNewDebt({ ...newDebt, interestRate: Number.parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="debt-payment">Min. betaling</Label>
                        <FieldTooltip content="Det mindste beløb du skal betale hver måned" />
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="debt-payment"
                          type="number"
                          className="pl-8"
                          placeholder="0"
                          value={newDebt.minimumPayment || ""}
                          onChange={(e) =>
                            setNewDebt({ ...newDebt, minimumPayment: Number.parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddDebt}
                    disabled={!newDebt.name || !newDebt.amount || newDebt.amount <= 0}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Tilføj gældspost
                  </Button>
                </div>

                {debts.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Tilføjede gældsposter</h3>
                    <div className="space-y-2">
                      {debts.map((debt) => (
                        <div key={debt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              {getDebtTypeIcon(debt.type)}
                            </div>
                            <div>
                              <div className="font-medium">{debt.name}</div>
                              <div className="text-sm text-gray-500">
                                {formatCurrency(debt.amount)} • {debt.interestRate}% • {getDebtTypeName(debt.type)}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveDebt(debt.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span>Samlet gæld:</span>
                        <span className="font-bold">{formatCurrency(calculateTotalDebt(debts))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Samlede månedlige minimumbetalinger:</span>
                        <span className="font-bold">
                          {formatCurrency(debts.reduce((total, debt) => total + debt.minimumPayment, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <Alert className="bg-green-50 border-green-200">
                  <Info className="h-4 w-4 text-green-500" />
                  <AlertTitle>Hvorfor er dette vigtigt?</AlertTitle>
                  <AlertDescription>
                    Din indkomst er afgørende for at beregne, hvor meget du kan afdrage på din gæld hver måned.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="income-name">Beskrivelse</Label>
                      <Input
                        id="income-name"
                        placeholder="F.eks. Løn"
                        value={newIncome.name}
                        onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="income-frequency">Hyppighed</Label>
                      <Select
                        value={newIncome.frequency}
                        onValueChange={(value) =>
                          setNewIncome({ ...newIncome, frequency: value as "monthly" | "yearly" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Vælg hyppighed" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Månedlig</SelectItem>
                          <SelectItem value="yearly">Årlig</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="income-amount">Beløb</Label>
                      <FieldTooltip content="Indtast beløbet før skat" />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="income-amount"
                        type="number"
                        className="pl-8"
                        placeholder="0"
                        value={newIncome.amount || ""}
                        onChange={(e) => setNewIncome({ ...newIncome, amount: Number.parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddIncome}
                    disabled={!newIncome.name || !newIncome.amount || newIncome.amount <= 0}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Tilføj indkomstkilde
                  </Button>
                </div>

                {incomeSources.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Tilføjede indkomstkilder</h3>
                    <div className="space-y-2">
                      {incomeSources.map((income) => (
                        <div key={income.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div>
                            <div className="font-medium">{income.name}</div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(income.amount)} • {income.frequency === "monthly" ? "Månedlig" : "Årlig"}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveIncome(income.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between">
                        <span>Samlet månedlig indkomst:</span>
                        <span className="font-bold">{formatCurrency(calculateTotalIncome(incomeSources))}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <Alert className="bg-purple-50 border-purple-200">
                  <Info className="h-4 w-4 text-purple-500" />
                  <AlertTitle>Sidste trin!</AlertTitle>
                  <AlertDescription>
                    Angiv dine månedlige udgifter, så vi kan beregne hvor meget du har til rådighed til at afdrage på
                    din gæld.
                  </AlertDescription>
                </Alert>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="monthly-expenses">Månedlige udgifter</Label>
                    <FieldTooltip content="Inkludér alle faste udgifter som husleje, mad, transport, forsikringer, osv." />
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="monthly-expenses"
                      type="number"
                      className="pl-8"
                      placeholder="0"
                      value={monthlyExpenses || ""}
                      onChange={(e) => setMonthlyExpenses(Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="available-for-debt">Beløb til rådighed for gældsafdragning</Label>
                    <FieldTooltip content="Hvor meget kan du afsætte til gældsafdragning hver måned?" />
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="available-for-debt"
                      type="number"
                      className="pl-8"
                      placeholder="0"
                      value={availableForDebt || ""}
                      onChange={(e) => setAvailableForDebt(Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {incomeSources.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span>Samlet månedlig indkomst:</span>
                      <span className="font-bold">{formatCurrency(calculateTotalIncome(incomeSources))}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Månedlige udgifter:</span>
                      <span className="font-bold">{formatCurrency(monthlyExpenses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Til rådighed for gældsafdragning:</span>
                      <span className="font-bold">{formatCurrency(availableForDebt)}</span>
                    </div>

                    {availableForDebt < debts.reduce((total, debt) => total + debt.minimumPayment, 0) && (
                      <Alert className="mt-4 bg-red-50 border-red-200">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <AlertTitle>Advarsel</AlertTitle>
                        <AlertDescription>
                          Det beløb, du har angivet til gældsafdragning, er mindre end dine samlede minimumbetalinger.
                          Dette kan føre til yderligere gæld.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevStep} disabled={step === 1}>
              Tilbage
            </Button>
            <Button onClick={handleNextStep}>{step === 3 ? "Se resultater" : "Næste"}</Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="overview" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overblik</TabsTrigger>
              <TabsTrigger value="recommendations">Anbefalinger</TabsTrigger>
              <TabsTrigger value="repayment-plan">Afdragsplan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Gældsoverblik</CardTitle>
                    <CardDescription>Samlet oversigt over din gældssituation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Samlet gæld:</span>
                        <span className="font-bold">{formatCurrency(calculateTotalDebt(debts))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Samlede årlige renter:</span>
                        <span className="font-bold">{formatCurrency(calculateTotalInterest(debts))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Månedlige minimumbetalinger:</span>
                        <span className="font-bold">
                          {formatCurrency(debts.reduce((total, debt) => total + debt.minimumPayment, 0))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Til rådighed for gældsafdragning:</span>
                        <span className="font-bold">{formatCurrency(availableForDebt)}</span>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center mb-2">
                          <span>Gæld-til-indkomst forhold:</span>
                          <span
                            className={`font-bold ${getDebtToIncomeRatioStatus(calculateDebtToIncomeRatio(debts, incomeSources)).color}`}
                          >
                            {calculateDebtToIncomeRatio(debts, incomeSources).toFixed(1)}% -{" "}
                            {getDebtToIncomeRatioStatus(calculateDebtToIncomeRatio(debts, incomeSources)).status}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(calculateDebtToIncomeRatio(debts, incomeSources), 100)}
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-green-500">0% - Sund</span>
                          <span className="text-yellow-500">30% - Moderat</span>
                          <span className="text-red-500">40%+ - Høj</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Gældsfordeling</CardTitle>
                    <CardDescription>Oversigt over dine forskellige gældsposter</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {debts.length > 0 ? (
                      <div className="space-y-4">
                        {debts.map((debt) => (
                          <div key={debt.id} className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              {getDebtTypeIcon(debt.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="font-medium">{debt.name}</span>
                                <span>{formatCurrency(debt.amount)}</span>
                              </div>
                              <div className="mt-1">
                                <Progress value={(debt.amount / calculateTotalDebt(debts)) * 100} className="h-2" />
                              </div>
                              <div className="flex justify-between text-xs mt-1">
                                <span>{getDebtTypeName(debt.type)}</span>
                                <span>{debt.interestRate}% rente</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Ingen gældsposter tilføjet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Økonomisk sundhed</CardTitle>
                    <CardDescription>Vurdering af din økonomiske situation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">Gæld-til-indkomst forhold</h3>
                        <div className="p-4 rounded-md bg-gray-50">
                          <div className="flex justify-between items-center mb-2">
                            <span>Dit forhold:</span>
                            <span
                              className={`font-bold ${getDebtToIncomeRatioStatus(calculateDebtToIncomeRatio(debts, incomeSources)).color}`}
                            >
                              {calculateDebtToIncomeRatio(debts, incomeSources).toFixed(1)}%
                            </span>
                          </div>
                          <Progress
                            value={Math.min(calculateDebtToIncomeRatio(debts, incomeSources), 100)}
                            className="h-3"
                          />
                          <div className="mt-4 text-sm">
                            <p className="mb-2">
                              <span className="font-medium">Hvad betyder det?</span> Dit gæld-til-indkomst forhold er et
                              nøgletal, der viser hvor stor en del af din månedlige indkomst, der går til at betale
                              gæld.
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>
                                <span className="text-green-500 font-medium">Under 30%:</span> Sund økonomisk situation
                              </li>
                              <li>
                                <span className="text-yellow-500 font-medium">30-40%:</span> Moderat belastet økonomi
                              </li>
                              <li>
                                <span className="text-red-500 font-medium">Over 40%:</span> Højt belastet økonomi -
                                handling påkrævet
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Rådighedsbeløb efter gældsafdragning</h3>
                        <div className="p-4 rounded-md bg-gray-50">
                          <div className="flex justify-between items-center mb-4">
                            <span>Månedlig indkomst:</span>
                            <span className="font-bold">{formatCurrency(calculateTotalIncome(incomeSources))}</span>
                          </div>
                          <div className="flex justify-between items-center mb-4">
                            <span>Månedlige udgifter:</span>
                            <span className="font-bold text-red-500">-{formatCurrency(monthlyExpenses)}</span>
                          </div>
                          <div className="flex justify-between items-center mb-4">
                            <span>Minimumbetalinger på gæld:</span>
                            <span className="font-bold text-red-500">
                              -{formatCurrency(debts.reduce((total, debt) => total + debt.minimumPayment, 0))}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t">
                            <span>Rådighedsbeløb:</span>
                            <span
                              className={`font-bold ${calculateTotalIncome(incomeSources) - monthlyExpenses - debts.reduce((total, debt) => total + debt.minimumPayment, 0) > 0 ? "text-green-500" : "text-red-500"}`}
                            >
                              {formatCurrency(
                                calculateTotalIncome(incomeSources) -
                                  monthlyExpenses -
                                  debts.reduce((total, debt) => total + debt.minimumPayment, 0),
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                    Personlige anbefalinger
                  </CardTitle>
                  <CardDescription>
                    Baseret på din økonomiske situation har vi følgende anbefalinger til dig
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recommendations.length > 0 ? (
                    <div className="space-y-6">
                      {recommendations.map((recommendation, index) => (
                        <div key={index} className="p-4 rounded-md bg-gray-50">
                          <div className="flex items-start">
                            <div className="mr-4 mt-1">{recommendation.icon}</div>
                            <div>
                              <div className="flex items-center mb-1">
                                <h3 className="font-medium">{recommendation.title}</h3>
                                <Badge
                                  className={`ml-2 ${
                                    recommendation.impact === "high"
                                      ? "bg-red-100 text-red-800"
                                      : recommendation.impact === "medium"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {recommendation.impact === "high"
                                    ? "Høj prioritet"
                                    : recommendation.impact === "medium"
                                      ? "Medium prioritet"
                                      : "Lav prioritet"}
                                </Badge>
                              </div>
                              <p className="text-gray-600">{recommendation.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      <Alert className="bg-blue-50 border-blue-200">
                        <HelpCircle className="h-4 w-4 text-blue-500" />
                        <AlertTitle>Vidste du?</AlertTitle>
                        <AlertDescription>
                          Ved at følge disse anbefalinger kan du potentielt spare tusindvis af kroner i renteudgifter og
                          blive gældfri hurtigere.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>
                        Ingen anbefalinger tilgængelige. Tilføj flere oplysninger om din økonomi for at få personlige
                        anbefalinger.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Jobmuligheder</CardTitle>
                    <CardDescription>Øg din indkomst med disse jobmuligheder</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 rounded-md bg-gray-50">
                        <h3 className="font-medium">Freelance arbejde</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Brug dine færdigheder til at tjene ekstra penge i din fritid.
                        </p>
                        <div className="text-sm">
                          <span className="font-medium">Potentiel indkomst:</span> 5.000 - 15.000 kr./md.
                        </div>
                      </div>

                      <div className="p-3 rounded-md bg-gray-50">
                        <h3 className="font-medium">Deltidsarbejde</h3>
                        <p className="text-sm text-gray-600 mb-2">Find et deltidsjob i weekender eller aftener.</p>
                        <div className="text-sm">
                          <span className="font-medium">Potentiel indkomst:</span> 3.000 - 8.000 kr./md.
                        </div>
                      </div>

                      <div className="p-3 rounded-md bg-gray-50">
                        <h3 className="font-medium">Opkvalificering</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Tag kurser eller uddannelse for at øge din værdi på arbejdsmarkedet.
                        </p>
                        <div className="text-sm">
                          <span className="font-medium">Potentiel indkomstforøgelse:</span> 10-30% på længere sigt
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Aktiver at sælge</CardTitle>
                    <CardDescription>Overvej at sælge disse aktiver for at nedbringe gæld</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 rounded-md bg-gray-50">
                        <h3 className="font-medium">Elektronik</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Sælg ubrugt elektronik som gamle telefoner, tablets eller computere.
                        </p>
                        <div className="text-sm">
                          <span className="font-medium">Potentiel værdi:</span> 1.000 - 10.000 kr.
                        </div>
                      </div>

                      <div className="p-3 rounded-md bg-gray-50">
                        <h3 className="font-medium">Møbler og indbo</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Sælg møbler eller andet indbo, du ikke bruger eller kan undvære.
                        </p>
                        <div className="text-sm">
                          <span className="font-medium">Potentiel værdi:</span> 2.000 - 15.000 kr.
                        </div>
                      </div>

                      <div className="p-3 rounded-md bg-gray-50">
                        <h3 className="font-medium">Bil eller andet køretøj</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Overvej at sælge din bil og bruge offentlig transport eller en billigere model.
                        </p>
                        <div className="text-sm">
                          <span className="font-medium">Potentiel værdi:</span> 20.000 - 200.000 kr.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="repayment-plan" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Gældsafviklingsmetoder</CardTitle>
                    <CardDescription>Sammenligning af forskellige metoder til at afvikle din gæld</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="p-4 rounded-md bg-gray-50">
                        <h3 className="font-medium mb-2">Snowball-metoden</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Betal minimumbetalinger på al gæld, og brug ekstra penge på at betale den mindste gæld først.
                          Når den er betalt, går du videre til den næste mindste.
                        </p>
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span>Fordele:</span>
                            <span>Hurtige sejre, psykologisk motivation</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ulemper:</span>
                            <span>Ikke altid den billigste metode</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-md bg-gray-50">
                        <h3 className="font-medium mb-2">Avalanche-metoden</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Betal minimumbetalinger på al gæld, og brug ekstra penge på at betale gælden med den højeste
                          rente først. Når den er betalt, går du videre til den næste højeste.
                        </p>
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span>Fordele:</span>
                            <span>Sparer mest i renter, matematisk optimal</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ulemper:</span>
                            <span>Kan tage længere tid at se resultater</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-md bg-gray-50">
                        <h3 className="font-medium mb-2">Proportionel-metoden</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Fordel dine ekstra betalinger proportionelt på tværs af al din gæld baseret på gældens
                          størrelse.
                        </p>
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span>Fordele:</span>
                            <span>Balanceret tilgang, reducerer alle gældsposter</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ulemper:</span>
                            <span>Ikke optimal for rentebesparelser</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Din optimale afdragsplan</CardTitle>
                    <CardDescription>Baseret på din økonomiske situation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="avalanche">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="avalanche">Avalanche</TabsTrigger>
                        <TabsTrigger value="snowball">Snowball</TabsTrigger>
                        <TabsTrigger value="proportional">Proportionel</TabsTrigger>
                      </TabsList>

                      <TabsContent value="avalanche" className="mt-4">
                        <div className="space-y-4">
                          {calculateAvalanchePlan().map((debt, index) => (
                            <div key={debt.id} className="p-3 rounded-md bg-gray-50">
                              <div className="flex items-center mb-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                  {getDebtTypeIcon(debt.type)}
                                </div>
                                <div>
                                  <div className="font-medium">{debt.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {formatCurrency(debt.amount)} • {debt.interestRate}% rente
                                  </div>
                                </div>
                                {index === 0 && <Badge className="ml-auto bg-green-100 text-green-800">Fokus</Badge>}
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                <div>
                                  <span className="text-gray-500">Månedlig betaling:</span>
                                  <span className="font-medium ml-2">{formatCurrency(debt.payment)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Tid til afbetaling:</span>
                                  <span className="font-medium ml-2">{debt.monthsToPayOff} måneder</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="snowball" className="mt-4">
                        <div className="space-y-4">
                          {calculateSnowballPlan().map((debt, index) => (
                            <div key={debt.id} className="p-3 rounded-md bg-gray-50">
                              <div className="flex items-center mb-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                  {getDebtTypeIcon(debt.type)}
                                </div>
                                <div>
                                  <div className="font-medium">{debt.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {formatCurrency(debt.amount)} • {debt.interestRate}% rente
                                  </div>
                                </div>
                                {index === 0 && <Badge className="ml-auto bg-green-100 text-green-800">Fokus</Badge>}
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                <div>
                                  <span className="text-gray-500">Månedlig betaling:</span>
                                  <span className="font-medium ml-2">{formatCurrency(debt.payment)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Tid til afbetaling:</span>
                                  <span className="font-medium ml-2">{debt.monthsToPayOff} måneder</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="proportional" className="mt-4">
                        <div className="space-y-4">
                          {calculateProportionalPlan().map((debt) => (
                            <div key={debt.id} className="p-3 rounded-md bg-gray-50">
                              <div className="flex items-center mb-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                  {getDebtTypeIcon(debt.type)}
                                </div>
                                <div>
                                  <div className="font-medium">{debt.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {formatCurrency(debt.amount)} • {debt.interestRate}% rente
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                <div>
                                  <span className="text-gray-500">Månedlig betaling:</span>
                                  <span className="font-medium ml-2">{formatCurrency(debt.payment)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Tid til afbetaling:</span>
                                  <span className="font-medium ml-2">{debt.monthsToPayOff} måneder</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Gældsafviklingsplan</CardTitle>
                  <CardDescription>Sådan bliver du gældfri hurtigst muligt</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      <AlertTitle>Vidste du?</AlertTitle>
                      <AlertDescription>
                        Ved at øge dine månedlige afdrag med bare 10% kan du potentielt blive gældfri flere år tidligere
                        og spare tusindvis af kroner i renter.
                      </AlertDescription>
                    </Alert>

                    <div className="p-4 rounded-md bg-gray-50">
                      <h3 className="font-medium mb-4">Trin til at blive gældfri</h3>
                      <ol className="list-decimal list-inside space-y-3">
                        <li className="pl-2">
                          <span className="font-medium">Opret et nødbudget</span>
                          <p className="text-sm text-gray-600 mt-1">
                            Skær ned på unødvendige udgifter og fokuser på at maksimere det beløb, du kan bruge på
                            gældsafdragning.
                          </p>
                        </li>
                        <li className="pl-2">
                          <span className="font-medium">Opbyg en lille nødopsparing</span>
                          <p className="text-sm text-gray-600 mt-1">
                            Spar 5.000-10.000 kr. op til uforudsete udgifter, så du ikke behøver at optage mere gæld ved
                            nødsituationer.
                          </p>
                        </li>
                        <li className="pl-2">
                          <span className="font-medium">Følg din afdragsplan konsekvent</span>
                          <p className="text-sm text-gray-600 mt-1">
                            Vælg den metode, der passer bedst til dig, og hold dig til den. Konsistens er nøglen til
                            succes.
                          </p>
                        </li>
                        <li className="pl-2">
                          <span className="font-medium">Brug uventede penge på gældsafdragning</span>
                          <p className="text-sm text-gray-600 mt-1">
                            Skatterefusion, bonusser, gaver eller andre uventede indkomster bør primært gå til at
                            nedbringe din gæld.
                          </p>
                        </li>
                        <li className="pl-2">
                          <span className="font-medium">Fejr milepæle</span>
                          <p className="text-sm text-gray-600 mt-1">
                            Når du har betalt en gældspost af, så fejr det (billigt) for at holde motivationen oppe.
                          </p>
                        </li>
                      </ol>
                    </div>

                    <div className="p-4 rounded-md bg-gray-50">
                      <h3 className="font-medium mb-2">Hvad du bør undgå</h3>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                        <li>At optage ny gæld mens du afdrager på eksisterende gæld</li>
                        <li>At springe betalinger over eller kun betale minimumbeløb</li>
                        <li>At ignorere højrente gæld til fordel for lavrente gæld</li>
                        <li>At bruge alle dine penge på gældsafdragning uden at have en nødopsparing</li>
                        <li>At give op, hvis du har et tilbagefald eller uforudsete udgifter</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <AIRecommendation data={aiRecommendation} />
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setShowResults(false)}>
              Tilbage til beregner
            </Button>
            <Button>Gem resultater</Button>
          </div>
        </div>
      )}
    </div>
  )
}
