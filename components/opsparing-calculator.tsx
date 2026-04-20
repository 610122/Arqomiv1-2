"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Wallet, PiggyBank, Target, HelpCircle, Plus, Trash2, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AIRecommendation } from "@/components/ai-recommendation"
import { analyzeOpsparing } from "@/lib/ai-engines"

// Typer
type SavingsGoal = {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  priority: "høj" | "mellem" | "lav"
  timeframe: number // måneder
}

type SavingsStrategy = "ligeligt" | "prioriteret" | "snowball" | "tidsstyret"

type SavingsProfile = "konservativ" | "moderat" | "aggressiv"

type SavingsVehicle = "opsparingskonto" | "aktiesparekonto" | "pensionsopsparing" | "investeringsforening" | "andet"

export function OpsparingsCalculator() {
  // State
  const [step, setStep] = useState(1)
  const [monthlyIncome, setMonthlyIncome] = useState<number>(30000)
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(20000)
  const [currentSavings, setCurrentSavings] = useState<number>(50000)
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([
    {
      id: "1",
      name: "Nødopsparing",
      targetAmount: 50000,
      currentAmount: 10000,
      priority: "høj",
      timeframe: 12,
    },
  ])
  const [savingsStrategy, setSavingsStrategy] = useState<SavingsStrategy>("ligeligt")
  const [savingsProfile, setSavingsProfile] = useState<SavingsProfile>("moderat")
  const [savingsVehicles, setSavingsVehicles] = useState<SavingsVehicle[]>(["opsparingskonto"])
  const [automaticTransfer, setAutomaticTransfer] = useState<boolean>(true)
  const [savingsPercentage, setSavingsPercentage] = useState<number>(15)
  const [showResults, setShowResults] = useState<boolean>(false)

  // Beregnet månedlig opsparingskapacitet
  const monthlySavingsCapacity = monthlyIncome - monthlyExpenses
  const recommendedEmergencyFund = monthlyExpenses * 6

  const aiRecommendation = useMemo(
    () =>
      analyzeOpsparing({
        monthlyIncome,
        monthlyExpenses,
        currentSavings,
        savingsGoals: savingsGoals.map((g) => ({
          name: g.name,
          targetAmount: g.targetAmount,
          currentAmount: g.currentAmount,
          timeframe: g.timeframe,
        })),
        savingsPercentage,
      }),
    [monthlyIncome, monthlyExpenses, currentSavings, savingsGoals, savingsPercentage],
  )

  // Hjælpefunktioner
  const addSavingsGoal = () => {
    const newGoal: SavingsGoal = {
      id: Date.now().toString(),
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      priority: "mellem",
      timeframe: 24,
    }
    setSavingsGoals([...savingsGoals, newGoal])
  }

  const updateSavingsGoal = (id: string, field: keyof SavingsGoal, value: any) => {
    setSavingsGoals(savingsGoals.map((goal) => (goal.id === id ? { ...goal, [field]: value } : goal)))
  }

  const removeSavingsGoal = (id: string) => {
    setSavingsGoals(savingsGoals.filter((goal) => goal.id !== id))
  }

  const calculateTotalSavingsNeeded = () => {
    return savingsGoals.reduce((total, goal) => total + (goal.targetAmount - goal.currentAmount), 0)
  }

  const calculateTimeToReachGoals = () => {
    if (monthlySavingsCapacity <= 0) return Number.POSITIVE_INFINITY

    const totalNeeded = calculateTotalSavingsNeeded()
    return Math.ceil(totalNeeded / monthlySavingsCapacity)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getRecommendedSavingsVehicles = (profile: SavingsProfile, goal: SavingsGoal) => {
    // Baseret på risikoprofil og tidshorisont
    if (goal.timeframe < 12) {
      return ["opsparingskonto"]
    } else if (goal.timeframe < 36) {
      return profile === "konservativ"
        ? ["opsparingskonto", "investeringsforening"]
        : ["aktiesparekonto", "investeringsforening"]
    } else {
      return profile === "konservativ"
        ? ["investeringsforening", "pensionsopsparing"]
        : profile === "moderat"
          ? ["aktiesparekonto", "investeringsforening", "pensionsopsparing"]
          : ["aktiesparekonto", "investeringsforening"]
    }
  }

  const getExpectedReturnRate = (profile: SavingsProfile) => {
    switch (profile) {
      case "konservativ":
        return 2.5
      case "moderat":
        return 5
      case "aggressiv":
        return 7.5
      default:
        return 5
    }
  }

  const calculateMonthlyAllocation = () => {
    if (monthlySavingsCapacity <= 0) return []

    let allocations: { goalId: string; amount: number }[] = []

    switch (savingsStrategy) {
      case "ligeligt":
        // Fordel ligeligt mellem alle mål
        const equalAmount = monthlySavingsCapacity / savingsGoals.length
        allocations = savingsGoals.map((goal) => ({
          goalId: goal.id,
          amount: equalAmount,
        }))
        break

      case "prioriteret":
        // Fordel baseret på prioritet
        const priorityWeights = { høj: 3, mellem: 2, lav: 1 }
        const totalWeight = savingsGoals.reduce((sum, goal) => {
          return sum + (priorityWeights[goal.priority] || 1)
        }, 0)

        allocations = savingsGoals.map((goal) => {
          const weight = priorityWeights[goal.priority] || 1
          return {
            goalId: goal.id,
            amount: (monthlySavingsCapacity * weight) / totalWeight,
          }
        })
        break

      case "snowball":
        // Fokuser på et mål ad gangen (mindste beløb først)
        const sortedGoals = [...savingsGoals].sort(
          (a, b) => a.targetAmount - a.currentAmount - (b.targetAmount - b.currentAmount),
        )

        allocations = sortedGoals.map((goal, index) => ({
          goalId: goal.id,
          amount: index === 0 ? monthlySavingsCapacity : 0,
        }))
        break

      case "tidsstyret":
        // Fordel baseret på tidsramme (kortere tidsramme får mere)
        const totalTimeInverse = savingsGoals.reduce((sum, goal) => {
          return sum + 1 / Math.max(goal.timeframe, 1)
        }, 0)

        allocations = savingsGoals.map((goal) => {
          const weight = 1 / Math.max(goal.timeframe, 1)
          return {
            goalId: goal.id,
            amount: (monthlySavingsCapacity * weight) / totalTimeInverse,
          }
        })
        break
    }

    return allocations
  }

  const handleCalculate = () => {
    setShowResults(true)
    setStep(4)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage < 25) return "bg-red-500"
    if (percentage < 50) return "bg-yellow-500"
    if (percentage < 75) return "bg-blue-500"
    return "bg-green-500"
  }

  const getRecommendedSavingsPercentage = () => {
    // Baseret på alder, indkomst og udgifter
    const savingsRatio = (monthlyIncome - monthlyExpenses) / monthlyIncome

    if (savingsRatio < 0.1) return 10
    if (savingsRatio < 0.2) return 15
    if (savingsRatio < 0.3) return 20
    return 25
  }

  const handleReset = () => {
    setStep(1)
    setMonthlyIncome(30000)
    setMonthlyExpenses(20000)
    setCurrentSavings(50000)
    setSavingsGoals([
      {
        id: "1",
        name: "Nødopsparing",
        targetAmount: 50000,
        currentAmount: 10000,
        priority: "høj",
        timeframe: 12,
      },
    ])
    setSavingsStrategy("ligeligt")
    setSavingsProfile("moderat")
    setSavingsVehicles(["opsparingskonto"])
    setAutomaticTransfer(true)
    setSavingsPercentage(15)
    setShowResults(false)
  }

  return (
    <Card className="mb-8 border-t-4 border-t-primary shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardTitle className="flex items-center text-2xl">
          <Wallet className="mr-2 h-6 w-6 text-primary" />
          Planlæg din opsparingsstrategi
        </CardTitle>
        <CardDescription className="text-base">
          Få hjælp til at planlægge din opsparing og nå dine økonomiske mål
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Fremskridtsindikator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex flex-col items-center ${step >= stepNumber ? "text-primary" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 
                  ${step >= stepNumber ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                >
                  {step > stepNumber ? <Check className="h-4 w-4" /> : stepNumber}
                </div>
                <span className="text-xs">
                  {stepNumber === 1
                    ? "Økonomi"
                    : stepNumber === 2
                      ? "Mål"
                      : stepNumber === 3
                        ? "Strategi"
                        : "Resultater"}
                </span>
              </div>
            ))}
          </div>
          <Progress value={((step - 1) / 3) * 100} className="h-2" />
        </div>

        {/* Trin 1: Økonomisk information */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium">Din økonomiske situation</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>
                        Vi bruger disse oplysninger til at beregne din opsparingskapacitet og give personlige
                        anbefalinger.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="monthly-income">Månedlig indkomst efter skat</Label>
                  <div className="relative">
                    <Input
                      id="monthly-income"
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                      className="pl-8"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">kr</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly-expenses">Månedlige udgifter</Label>
                  <div className="relative">
                    <Input
                      id="monthly-expenses"
                      type="number"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                      className="pl-8"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">kr</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="current-savings">Nuværende opsparing</Label>
                <div className="relative">
                  <Input
                    id="current-savings"
                    type="number"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(Number(e.target.value))}
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">kr</span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg mt-4">
                <h4 className="font-medium mb-2 flex items-center">
                  <PiggyBank className="mr-2 h-4 w-4 text-primary" />
                  Din månedlige opsparingskapacitet
                </h4>
                <div className="text-2xl font-bold">{formatCurrency(monthlySavingsCapacity)}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Dette er beløbet, du potentielt kan spare op hver måned.
                </p>

                {monthlySavingsCapacity <= 0 && (
                  <div className="mt-2 text-red-500 text-sm">
                    Dine udgifter overstiger din indkomst. Overvej at reducere dine udgifter eller øge din indkomst.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={monthlySavingsCapacity <= 0}>
                Fortsæt til opsparingsmål
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Trin 2: Opsparingsmål */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium">Dine opsparingsmål</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>
                        Definer dine opsparingsmål for at skabe en målrettet opsparingsstrategi. Vi anbefaler at have en
                        nødopsparing på mindst 3-6 måneders udgifter.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {savingsGoals.map((goal, index) => (
                <Card
                  key={goal.id}
                  className="border-l-4"
                  style={{
                    borderLeftColor:
                      goal.priority === "høj" ? "#ef4444" : goal.priority === "mellem" ? "#f59e0b" : "#3b82f6",
                  }}
                >
                  <CardContent className="pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`goal-name-${goal.id}`}>Navn på mål</Label>
                        <Input
                          id={`goal-name-${goal.id}`}
                          value={goal.name}
                          onChange={(e) => updateSavingsGoal(goal.id, "name", e.target.value)}
                          placeholder="F.eks. Nødopsparing, Boligindskud, Ferie"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`goal-priority-${goal.id}`}>Prioritet</Label>
                        <Select
                          value={goal.priority}
                          onValueChange={(value) => updateSavingsGoal(goal.id, "priority", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Vælg prioritet" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="høj">Høj prioritet</SelectItem>
                            <SelectItem value="mellem">Mellem prioritet</SelectItem>
                            <SelectItem value="lav">Lav prioritet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`goal-target-${goal.id}`}>Målbeløb</Label>
                        <div className="relative">
                          <Input
                            id={`goal-target-${goal.id}`}
                            type="number"
                            value={goal.targetAmount}
                            onChange={(e) => updateSavingsGoal(goal.id, "targetAmount", Number(e.target.value))}
                            className="pl-8"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">kr</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`goal-current-${goal.id}`}>Nuværende opsparing til dette mål</Label>
                        <div className="relative">
                          <Input
                            id={`goal-current-${goal.id}`}
                            type="number"
                            value={goal.currentAmount}
                            onChange={(e) => updateSavingsGoal(goal.id, "currentAmount", Number(e.target.value))}
                            className="pl-8"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">kr</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`goal-timeframe-${goal.id}`}>Tidshorisont (måneder)</Label>
                        <Input
                          id={`goal-timeframe-${goal.id}`}
                          type="number"
                          value={goal.timeframe}
                          onChange={(e) => updateSavingsGoal(goal.id, "timeframe", Number(e.target.value))}
                        />
                      </div>

                      <div className="flex items-end">
                        {savingsGoals.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSavingsGoal(goal.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label className="mb-2 block">Fremskridt</Label>
                      <div className="flex items-center space-x-4">
                        <Progress
                          value={(goal.currentAmount / goal.targetAmount) * 100}
                          className="h-2 flex-1"
                          indicatorClassName={getProgressColor((goal.currentAmount / goal.targetAmount) * 100)}
                        />
                        <span className="text-sm font-medium">
                          {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" onClick={addSavingsGoal} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Tilføj opsparingsmål
              </Button>

              {savingsGoals.some((goal) => goal.name === "Nødopsparing" || goal.name.toLowerCase().includes("nød")) && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Anbefaling til nødopsparing</h4>
                  <p className="text-sm">
                    Vi anbefaler en nødopsparing på {formatCurrency(recommendedEmergencyFund)}, hvilket svarer til 6
                    måneders udgifter.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tilbage
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={savingsGoals.some((goal) => !goal.name || goal.targetAmount <= 0)}
              >
                Fortsæt til strategi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Trin 3: Opsparingsstrategi */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium">Vælg din opsparingsstrategi</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Din opsparingsstrategi bestemmer, hvordan du fordeler dine penge mellem forskellige mål.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card
                  className={`cursor-pointer transition-all ${savingsStrategy === "ligeligt" ? "border-primary" : ""}`}
                  onClick={() => setSavingsStrategy("ligeligt")}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">Ligelig fordeling</CardTitle>
                    <CardDescription>Fordel din månedlige opsparing ligeligt mellem alle dine mål</CardDescription>
                  </CardHeader>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${savingsStrategy === "prioriteret" ? "border-primary" : ""}`}
                  onClick={() => setSavingsStrategy("prioriteret")}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">Prioritetsbaseret</CardTitle>
                    <CardDescription>Fordel din opsparing baseret på prioriteten af hvert mål</CardDescription>
                  </CardHeader>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${savingsStrategy === "snowball" ? "border-primary" : ""}`}
                  onClick={() => setSavingsStrategy("snowball")}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">Snowball-metoden</CardTitle>
                    <CardDescription>Fokuser på ét mål ad gangen, start med det mindste beløb</CardDescription>
                  </CardHeader>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${savingsStrategy === "tidsstyret" ? "border-primary" : ""}`}
                  onClick={() => setSavingsStrategy("tidsstyret")}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">Tidsstyret</CardTitle>
                    <CardDescription>Fordel baseret på tidsrammen for hvert mål</CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <div className="space-y-4 mt-6">
                <h3 className="text-xl font-medium">Din risikoprofil</h3>
                <RadioGroup
                  value={savingsProfile}
                  onValueChange={(value) => setSavingsProfile(value as SavingsProfile)}
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="konservativ" id="konservativ" />
                    <div>
                      <Label htmlFor="konservativ" className="font-medium">
                        Konservativ
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Lav risiko, stabil men lavere forventet afkast (ca. 2-3% årligt)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="moderat" id="moderat" />
                    <div>
                      <Label htmlFor="moderat" className="font-medium">
                        Moderat
                      </Label>
                      <p className="text-sm text-muted-foreground">Balanceret risiko og afkast (ca. 4-6% årligt)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="aggressiv" id="aggressiv" />
                    <div>
                      <Label htmlFor="aggressiv" className="font-medium">
                        Aggressiv
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Højere risiko, potentielt højere afkast (ca. 7-10% årligt)
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium">Opsparingsmetoder</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>
                          Vælg hvor du vil placere dine opsparinger. Forskellige opsparingsformer har forskellige
                          fordele og risici.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="opsparingskonto"
                      checked={savingsVehicles.includes("opsparingskonto")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSavingsVehicles([...savingsVehicles, "opsparingskonto"])
                        } else {
                          setSavingsVehicles(savingsVehicles.filter((v) => v !== "opsparingskonto"))
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="opsparingskonto">Opsparingskonto</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="aktiesparekonto"
                      checked={savingsVehicles.includes("aktiesparekonto")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSavingsVehicles([...savingsVehicles, "aktiesparekonto"])
                        } else {
                          setSavingsVehicles(savingsVehicles.filter((v) => v !== "aktiesparekonto"))
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="aktiesparekonto">Aktiesparekonto</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="pensionsopsparing"
                      checked={savingsVehicles.includes("pensionsopsparing")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSavingsVehicles([...savingsVehicles, "pensionsopsparing"])
                        } else {
                          setSavingsVehicles(savingsVehicles.filter((v) => v !== "pensionsopsparing"))
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="pensionsopsparing">Pensionsopsparing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="investeringsforening"
                      checked={savingsVehicles.includes("investeringsforening")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSavingsVehicles([...savingsVehicles, "investeringsforening"])
                        } else {
                          setSavingsVehicles(savingsVehicles.filter((v) => v !== "investeringsforening"))
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="investeringsforening">Investeringsforening</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <h3 className="text-xl font-medium">Automatisering</h3>
                <div className="flex items-center space-x-2">
                  <Switch id="automatic-transfer" checked={automaticTransfer} onCheckedChange={setAutomaticTransfer} />
                  <Label htmlFor="automatic-transfer">Automatisk overførsel til opsparing</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatiske overførsler hjælper dig med at spare op konsekvent uden at skulle tænke over det.
                </p>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium">Opsparingsprocent</h3>
                  <span className="font-medium">{savingsPercentage}%</span>
                </div>
                <Slider
                  value={[savingsPercentage]}
                  min={5}
                  max={50}
                  step={1}
                  onValueChange={(value) => setSavingsPercentage(value[0])}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>5%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Anbefalet opsparingsprocent: {getRecommendedSavingsPercentage()}% af din indkomst
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tilbage
              </Button>
              <Button onClick={handleCalculate}>
                Beregn min opsparingsstrategi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Trin 4: Resultater */}
        {step === 4 && showResults && (
          <div className="space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overblik</TabsTrigger>
                <TabsTrigger value="allocation">Fordeling</TabsTrigger>
                <TabsTrigger value="timeline">Tidsplan</TabsTrigger>
                <TabsTrigger value="recommendations">Anbefalinger</TabsTrigger>
              </TabsList>

              {/* Overblik */}
              <TabsContent value="overview" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Din opsparingsoversigt</CardTitle>
                    <CardDescription>Baseret på dine indtastede oplysninger og valgte strategi</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Månedlig opsparingskapacitet</h4>
                        <div className="text-2xl font-bold">{formatCurrency(monthlySavingsCapacity)}</div>
                        <p className="text-sm text-muted-foreground mt-1">{savingsPercentage}% af din indkomst</p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Total opsparingsmål</h4>
                        <div className="text-2xl font-bold">{formatCurrency(calculateTotalSavingsNeeded())}</div>
                        <p className="text-sm text-muted-foreground mt-1">Manglende beløb på tværs af alle mål</p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Estimeret tid til alle mål</h4>
                        <div className="text-2xl font-bold">
                          {calculateTimeToReachGoals() === Number.POSITIVE_INFINITY
                            ? "Ubestemt"
                            : `${calculateTimeToReachGoals()} måneder`}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Med din nuværende opsparingskapacitet</p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Forventet årligt afkast</h4>
                        <div className="text-2xl font-bold">{getExpectedReturnRate(savingsProfile)}%</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Baseret på din {savingsProfile} risikoprofil
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-medium mb-4">Dine opsparingsmål</h4>
                      <div className="space-y-4">
                        {savingsGoals.map((goal) => (
                          <div key={goal.id} className="flex items-center space-x-4">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor:
                                  goal.priority === "høj"
                                    ? "#ef4444"
                                    : goal.priority === "mellem"
                                      ? "#f59e0b"
                                      : "#3b82f6",
                              }}
                            ></div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="font-medium">{goal.name}</span>
                                <span>
                                  {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                                </span>
                              </div>
                              <Progress
                                value={(goal.currentAmount / goal.targetAmount) * 100}
                                className="h-2 mt-1"
                                indicatorClassName={getProgressColor((goal.currentAmount / goal.targetAmount) * 100)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Fordeling */}
              <TabsContent value="allocation" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Månedlig fordeling af opsparing</CardTitle>
                    <CardDescription>Sådan fordeles din månedlige opsparing mellem dine mål</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      {calculateMonthlyAllocation().map((allocation) => {
                        const goal = savingsGoals.find((g) => g.id === allocation.goalId)
                        if (!goal) return null

                        return (
                          <div key={allocation.goalId} className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{goal.name}</h4>
                              <div className="text-lg font-bold">{formatCurrency(allocation.amount)}</div>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground mt-1">
                              <span>Prioritet: {goal.priority}</span>
                              <span>
                                {Math.round((allocation.amount / monthlySavingsCapacity) * 100)}% af din opsparing
                              </span>
                            </div>
                            <div className="mt-2">
                              <Label className="mb-1 block text-sm">Anbefalet opsparingsform:</Label>
                              <div className="flex flex-wrap gap-2">
                                {getRecommendedSavingsVehicles(savingsProfile, goal).map((vehicle) => (
                                  <span
                                    key={vehicle}
                                    className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-xs px-2 py-1 rounded-full"
                                  >
                                    {vehicle === "opsparingskonto"
                                      ? "Opsparingskonto"
                                      : vehicle === "aktiesparekonto"
                                        ? "Aktiesparekonto"
                                        : vehicle === "pensionsopsparing"
                                          ? "Pensionsopsparing"
                                          : vehicle === "investeringsforening"
                                            ? "Investeringsforening"
                                            : vehicle}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg mt-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Target className="mr-2 h-4 w-4 text-primary" />
                        Strategi:{" "}
                        {savingsStrategy === "ligeligt"
                          ? "Ligelig fordeling"
                          : savingsStrategy === "prioriteret"
                            ? "Prioritetsbaseret"
                            : savingsStrategy === "snowball"
                              ? "Snowball-metoden"
                              : "Tidsstyret"}
                      </h4>
                      <p className="text-sm">
                        {savingsStrategy === "ligeligt"
                          ? "Din opsparing fordeles ligeligt mellem alle dine mål, uanset prioritet eller størrelse."
                          : savingsStrategy === "prioriteret"
                            ? "Din opsparing fordeles baseret på prioriteten af hvert mål. Højere prioritet får mere."
                            : savingsStrategy === "snowball"
                              ? "Din opsparing fokuserer på ét mål ad gangen, startende med det mindste beløb for hurtige succeser."
                              : "Din opsparing fordeles baseret på tidsrammen for hvert mål. Kortere tidsrammer får mere."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tidsplan */}
              <TabsContent value="timeline" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tidsplan for dine opsparingsmål</CardTitle>
                    <CardDescription>Estimeret tid til at nå hvert af dine mål</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {calculateMonthlyAllocation().map((allocation) => {
                      const goal = savingsGoals.find((g) => g.id === allocation.goalId)
                      if (!goal) return null

                      const remainingAmount = goal.targetAmount - goal.currentAmount
                      const monthsToGoal =
                        allocation.amount > 0
                          ? Math.ceil(remainingAmount / allocation.amount)
                          : Number.POSITIVE_INFINITY

                      const estimatedDate = new Date()
                      estimatedDate.setMonth(estimatedDate.getMonth() + monthsToGoal)

                      return (
                        <div key={allocation.goalId} className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{goal.name}</h4>
                            <div className="text-lg font-bold">
                              {monthsToGoal === Number.POSITIVE_INFINITY ? "Ubestemt" : `${monthsToGoal} måneder`}
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground mt-1">
                            <span>Mangler: {formatCurrency(remainingAmount)}</span>
                            <span>
                              {monthsToGoal === Number.POSITIVE_INFINITY
                                ? ""
                                : `Estimeret dato: ${estimatedDate.toLocaleDateString("da-DK", { month: "long", year: "numeric" })}`}
                            </span>
                          </div>

                          {goal.timeframe > 0 && monthsToGoal > goal.timeframe && (
                            <div className="mt-2 text-amber-600 dark:text-amber-400 text-sm">
                              Dette mål vil tage længere tid end din ønskede tidsramme på {goal.timeframe} måneder.
                            </div>
                          )}

                          {goal.timeframe > 0 && monthsToGoal <= goal.timeframe && (
                            <div className="mt-2 text-green-600 dark:text-green-400 text-sm">
                              Dette mål er på rette vej til at blive nået inden for din tidsramme.
                            </div>
                          )}
                        </div>
                      )
                    })}

                    <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg mt-4">
                      <h4 className="font-medium mb-2">Sådan kan du nå dine mål hurtigere</h4>
                      <ul className="text-sm space-y-2 list-disc pl-5">
                        <li>Øg din månedlige opsparingskapacitet ved at reducere udgifter eller øge indkomst</li>
                        <li>Overvej at justere din opsparingsstrategi baseret på ændrede prioriteter</li>
                        <li>Udnyt renters rente ved at investere din opsparing (baseret på din risikoprofil)</li>
                        <li>Sæt realistiske mål og juster dem efter behov</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Anbefalinger */}
              <TabsContent value="recommendations" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Personlige anbefalinger</CardTitle>
                    <CardDescription>Skræddersyede råd baseret på din økonomiske situation og mål</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-lg">Generelle anbefalinger</h4>

                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <h5 className="font-medium mb-2">Opsparingskapacitet</h5>
                        {monthlySavingsCapacity < monthlyIncome * 0.1 ? (
                          <p className="text-sm">
                            Din opsparingskapacitet er relativt lav. Overvej at gennemgå dit budget for at finde
                            områder, hvor du kan reducere udgifter. Selv små besparelser kan gøre en stor forskel over
                            tid.
                          </p>
                        ) : monthlySavingsCapacity < monthlyIncome * 0.2 ? (
                          <p className="text-sm">
                            Din opsparingskapacitet er god, men der kan være mulighed for at øge den yderligere. Prøv at
                            identificere unødvendige udgifter, der kan reduceres.
                          </p>
                        ) : (
                          <p className="text-sm">
                            Du har en stærk opsparingskapacitet! Dette giver dig gode muligheder for at nå dine
                            finansielle mål hurtigere eller overveje at investere en del af din opsparing.
                          </p>
                        )}
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <h5 className="font-medium mb-2">Nødopsparing</h5>
                        {savingsGoals.some(
                          (goal) =>
                            (goal.name === "Nødopsparing" || goal.name.toLowerCase().includes("nød")) &&
                            goal.currentAmount >= recommendedEmergencyFund,
                        ) ? (
                          <p className="text-sm">
                            Din nødopsparing er på et godt niveau! Du har en solid buffer til uforudsete udgifter.
                          </p>
                        ) : savingsGoals.some(
                            (goal) => goal.name === "Nødopsparing" || goal.name.toLowerCase().includes("nød"),
                          ) ? (
                          <p className="text-sm">
                            Fortsæt med at opbygge din nødopsparing til den når{" "}
                            {formatCurrency(recommendedEmergencyFund)}, hvilket svarer til 6 måneders udgifter. Dette
                            bør være en høj prioritet.
                          </p>
                        ) : (
                          <p className="text-sm">
                            Vi anbefaler at oprette en nødopsparing på {formatCurrency(recommendedEmergencyFund)}
                            (6 måneders udgifter) som et af dine første mål. Dette giver økonomisk tryghed.
                          </p>
                        )}
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <h5 className="font-medium mb-2">Opsparingsstrategi</h5>
                        <p className="text-sm">
                          {savingsStrategy === "ligeligt"
                            ? "Din valgte strategi med ligelig fordeling er enkel at følge, men overvej om nogle mål burde prioriteres højere end andre."
                            : savingsStrategy === "prioriteret"
                              ? "Din prioritetsbaserede strategi er god til at sikre, at de vigtigste mål nås først. Husk at revurdere prioriteterne regelmæssigt."
                              : savingsStrategy === "snowball"
                                ? "Snowball-metoden giver hurtige succeser, hvilket kan være motiverende. Når et mål er nået, kan du overføre det beløb til det næste mål."
                                : "Din tidsstyrede strategi sikrer, at kortsigtede mål nås til tiden. Vær opmærksom på, at langsigtede mål kan få mindre fokus."}
                        </p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <h5 className="font-medium mb-2">Investeringsstrategi</h5>
                        <p className="text-sm">
                          Med din {savingsProfile} risikoprofil anbefaler vi følgende fordeling:
                        </p>
                        <ul className="text-sm mt-2 space-y-1">
                          {savingsProfile === "konservativ" ? (
                            <>
                              <li>60-70% i lavrisiko investeringer (obligationer, pengemarkedsfonde)</li>
                              <li>20-30% i mellemrisiko investeringer (blandede fonde)</li>
                              <li>0-10% i højrisiko investeringer (aktier)</li>
                            </>
                          ) : savingsProfile === "moderat" ? (
                            <>
                              <li>30-40% i lavrisiko investeringer (obligationer, pengemarkedsfonde)</li>
                              <li>40-50% i mellemrisiko investeringer (blandede fonde)</li>
                              <li>10-30% i højrisiko investeringer (aktier)</li>
                            </>
                          ) : (
                            <>
                              <li>0-20% i lavrisiko investeringer (obligationer, pengemarkedsfonde)</li>
                              <li>20-40% i mellemrisiko investeringer (blandede fonde)</li>
                              <li>40-80% i højrisiko investeringer (aktier)</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-lg">Næste skridt</h4>
                      <ol className="space-y-2 list-decimal pl-5">
                        <li className="text-sm">
                          <span className="font-medium">Opret automatiske overførsler:</span> Opsæt automatiske
                          overførsler til din opsparing på din lønningsdag for at sikre konsistent opsparing.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Gennemgå dine opsparingsmål kvartalsvis:</span> Revurder dine
                          mål og fremskridt hver tredje måned for at sikre, at din strategi stadig passer til din
                          situation.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Undersøg opsparingskonti med højere rente:</span> Sammenlign
                          renter på forskellige banker for at maksimere afkastet på din opsparing.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Overvej skattefordele:</span> Udnyt skattefradrag ved
                          pensionsopsparing eller aktiesparekonto, hvis det passer til dine mål.
                        </li>
                        <li className="text-sm">
                          <span className="font-medium">Hold udgifter under kontrol:</span> Fortsæt med at overvåge dine
                          månedlige udgifter for at sikre, at din opsparingskapacitet forbliver høj.
                        </li>
                      </ol>
                    </div>

                    <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg mt-4">
                      <h4 className="font-medium mb-2">Husk</h4>
                      <p className="text-sm">
                        Opsparingsstrategier er ikke statiske. Når din økonomiske situation ændrer sig, bør din strategi
                        også tilpasses. Genbesøg denne beregner regelmæssigt for at holde din plan opdateret.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <AIRecommendation data={aiRecommendation} />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tilbage
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Start forfra
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
