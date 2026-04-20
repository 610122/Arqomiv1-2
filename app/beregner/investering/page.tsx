"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { CalculatorTracker } from "@/components/calculator-tracker"
import { FieldTooltip } from "@/components/field-tooltip"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AIRecommendation } from "@/components/ai-recommendation"
import { ScenarioCompare, type Scenario } from "@/components/scenario-compare"
import { analyzeInvestering } from "@/lib/ai-engines"

// Import for charts
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function InvesteringsberegnerPage() {
  // Basic investment parameters
  const [initialInvestment, setInitialInvestment] = useState(100000)
  const [monthlyContribution, setMonthlyContribution] = useState(1000)
  const [investmentPeriod, setInvestmentPeriod] = useState(10)
  const [expectedReturn, setExpectedReturn] = useState(7)

  // Advanced parameters
  const [riskProfile, setRiskProfile] = useState("moderate")
  const [investmentGoal, setInvestmentGoal] = useState("retirement")
  const [age, setAge] = useState(35)
  const [taxStrategy, setTaxStrategy] = useState("aktiesparekonto")
  const [inflationRate, setInflationRate] = useState(2)
  const [rebalancingFrequency, setRebalancingFrequency] = useState("yearly")
  const [reinvestDividends, setReinvestDividends] = useState(true)
  const [feePercentage, setFeePercentage] = useState(0.5)

  // UI state
  const [showResults, setShowResults] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [scenarioView, setScenarioView] = useState("realistic")

  const aiRecommendation = useMemo(
    () =>
      analyzeInvestering({
        initialAmount: initialInvestment,
        monthlyContribution,
        years: investmentPeriod,
        expectedReturn,
        riskProfile:
          riskProfile === "conservative"
            ? "lav"
            : riskProfile === "aggressive"
              ? "høj"
              : "mellem",
      }),
    [initialInvestment, monthlyContribution, investmentPeriod, expectedReturn, riskProfile],
  )

  // Historical interest rates data (Danish market average returns)
  const historicalRates = [
    { year: "1990-1999", rate: 10.2 },
    { year: "2000-2009", rate: 2.3 },
    { year: "2010-2019", rate: 8.5 },
    { year: "2020-2021", rate: 14.2 },
    { year: "2022", rate: -14.5 },
    { year: "2023", rate: 16.8 },
    { year: "10-Year Avg", rate: 7.2 },
    { year: "20-Year Avg", rate: 6.8 },
    { year: "30-Year Avg", rate: 7.5 },
  ]

  // Asset allocation recommendations based on risk profile
  const assetAllocations = {
    conservative: [
      { name: "Obligationer", value: 60 },
      { name: "Aktier", value: 30 },
      { name: "Alternative", value: 5 },
      { name: "Kontanter", value: 5 },
    ],
    moderate: [
      { name: "Obligationer", value: 40 },
      { name: "Aktier", value: 50 },
      { name: "Alternative", value: 7 },
      { name: "Kontanter", value: 3 },
    ],
    aggressive: [
      { name: "Obligationer", value: 20 },
      { name: "Aktier", value: 70 },
      { name: "Alternative", value: 8 },
      { name: "Kontanter", value: 2 },
    ],
    very_aggressive: [
      { name: "Obligationer", value: 5 },
      { name: "Aktier", value: 85 },
      { name: "Alternative", value: 10 },
      { name: "Kontanter", value: 0 },
    ],
  }

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  // Calculate future value with different scenarios
  const calculateFutureValue = (scenario = "realistic") => {
    let annualReturn

    switch (scenario) {
      case "pessimistic":
        annualReturn = expectedReturn - 3
        break
      case "optimistic":
        annualReturn = expectedReturn + 2
        break
      case "realistic":
      default:
        annualReturn = expectedReturn
        break
    }

    // Adjust for fees
    const netReturn = annualReturn - feePercentage

    const monthlyRate = netReturn / 100 / 12
    const months = investmentPeriod * 12

    let futureValue = initialInvestment * Math.pow(1 + monthlyRate, months)

    if (monthlyContribution > 0) {
      futureValue += monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    }

    return futureValue
  }

  // Calculate inflation-adjusted value
  const calculateRealValue = (scenario = "realistic") => {
    const futureValue = calculateFutureValue(scenario)
    return futureValue / Math.pow(1 + inflationRate / 100, investmentPeriod)
  }

  // Calculate total invested
  const calculateTotalInvested = () => {
    return initialInvestment + monthlyContribution * investmentPeriod * 12
  }

  // Calculate compound interest
  const calculateCompoundInterest = (scenario = "realistic") => {
    return calculateFutureValue(scenario) - calculateTotalInvested()
  }

  // Calculate annual return after fees
  const calculateNetAnnualReturn = () => {
    return expectedReturn - feePercentage
  }

  // Calculate tax impact based on selected strategy
  const calculateAfterTaxValue = (scenario = "realistic") => {
    const futureValue = calculateFutureValue(scenario)
    const totalInvested = calculateTotalInvested()
    const gains = futureValue - totalInvested

    let taxRate
    switch (taxStrategy) {
      case "aktiesparekonto":
        taxRate = 0.17
        break
      case "frie_midler":
        taxRate = 0.27 // Simplified, in reality it's 27% up to threshold, then 42%
        break
      case "pension":
        taxRate = 0.15 // PAL tax
        break
      case "ask_and_pension":
        taxRate = 0.16 // Blended rate
        break
      default:
        taxRate = 0.27
    }

    const taxAmount = gains * taxRate
    return futureValue - taxAmount
  }

  // Generate year-by-year data for charts
  const generateYearlyData = () => {
    const data = []

    for (let year = 0; year <= investmentPeriod; year++) {
      const monthlyRateRealistic = (expectedReturn - feePercentage) / 100 / 12
      const monthlyRatePessimistic = (expectedReturn - 3 - feePercentage) / 100 / 12
      const monthlyRateOptimistic = (expectedReturn + 2 - feePercentage) / 100 / 12

      const months = year * 12

      let realisticValue = initialInvestment * Math.pow(1 + monthlyRateRealistic, months)
      let pessimisticValue = initialInvestment * Math.pow(1 + monthlyRatePessimistic, months)
      let optimisticValue = initialInvestment * Math.pow(1 + monthlyRateOptimistic, months)

      if (monthlyContribution > 0) {
        realisticValue +=
          monthlyContribution * ((Math.pow(1 + monthlyRateRealistic, months) - 1) / monthlyRateRealistic)
        pessimisticValue +=
          monthlyContribution * ((Math.pow(1 + monthlyRatePessimistic, months) - 1) / monthlyRatePessimistic)
        optimisticValue +=
          monthlyContribution * ((Math.pow(1 + monthlyRateOptimistic, months) - 1) / monthlyRateOptimistic)
      }

      const totalInvested = initialInvestment + monthlyContribution * months

      data.push({
        year,
        realistic: Math.round(realisticValue),
        pessimistic: Math.round(pessimisticValue),
        optimistic: Math.round(optimisticValue),
        invested: Math.round(totalInvested),
      })
    }

    return data
  }

  // Generate investment recommendation
  const generateRecommendation = () => {
    // Base recommendation on risk profile, age, investment period, and goal
    let recommendation = ""

    // Risk profile specific advice
    if (riskProfile === "conservative") {
      recommendation +=
        "Med din konservative risikoprofil anbefaler vi en portefølje med fokus på stabilitet og kapitalbevarelse. "
      recommendation +=
        "Obligationer bør udgøre hovedparten af din portefølje (60%), suppleret med kvalitetsaktier (30%) og mindre allokeringer til alternative investeringer og kontanter. "
    } else if (riskProfile === "moderate") {
      recommendation +=
        "Med din moderate risikoprofil anbefaler vi en balanceret portefølje med en god blanding af vækst og stabilitet. "
      recommendation +=
        "En fordeling med 50% aktier og 40% obligationer giver dig mulighed for vækst samtidig med en rimelig beskyttelse mod markedsudsving. "
    } else if (riskProfile === "aggressive") {
      recommendation +=
        "Med din aggressive risikoprofil anbefaler vi en vækstorienteret portefølje med hovedvægt på aktier. "
      recommendation +=
        "En høj allokering til aktier (70%) giver dig mulighed for betydelig vækst over tid, mens en mindre andel i obligationer (20%) giver en vis stabilitet. "
    } else if (riskProfile === "very_aggressive") {
      recommendation +=
        "Med din meget aggressive risikoprofil anbefaler vi en portefølje næsten udelukkende fokuseret på vækst. "
      recommendation +=
        "En meget høj allokering til aktier (85%) maksimerer dit vækstpotentiale, med minimale allokeringer til obligationer og alternative investeringer for diversificering. "
    }

    // Age-based advice
    if (age < 30) {
      recommendation +=
        "I din alder har du en lang tidshorisont, hvilket giver dig mulighed for at tage større risici for potentielt højere afkast. "
      recommendation += "Overvej at øge din aktieallokering yderligere, da du har tid til at ride markedsudsving ud. "
    } else if (age >= 30 && age < 50) {
      recommendation +=
        "I din alder er en balanceret tilgang fornuftig, men du har stadig tid til at udnytte aktiemarkedets vækstpotentiale. "
      recommendation +=
        "Sørg for regelmæssig rebalancering af din portefølje for at fastholde din ønskede risikoprofil. "
    } else {
      recommendation += "I din alder bør du gradvist begynde at reducere risikoen i din portefølje. "
      recommendation +=
        "Overvej at øge andelen af obligationer og reducere aktieeksponeringen for at beskytte din opsparing mod markedsudsving. "
    }

    // Investment goal specific advice
    if (investmentGoal === "retirement") {
      recommendation +=
        "For pensionsopsparing anbefaler vi at udnytte skattefordelene ved pensionsordninger som ratepension eller livrente. "
      recommendation += "Overvej at kombinere dette med Aktiesparekonto for at optimere din skatteposition. "
    } else if (investmentGoal === "house") {
      recommendation +=
        "For boligopsparing anbefaler vi en mere konservativ tilgang, især hvis købet er planlagt inden for de næste 5 år. "
      recommendation +=
        "Overvej at placere en større del af opsparingen i obligationer eller endda højrentekonti for at beskytte kapitalen. "
    } else if (investmentGoal === "education") {
      recommendation +=
        "For uddannelsesopsparing anbefaler vi en tilgang baseret på tidshorisonten til uddannelsesstart. "
      recommendation += "Jo tættere på uddannelsesstart, jo mere konservativ bør porteføljen være. "
    } else if (investmentGoal === "wealth") {
      recommendation +=
        "For generel formueforøgelse anbefaler vi en diversificeret tilgang med fokus på langsigtet vækst. "
      recommendation +=
        "Udnyt forskellige investeringsvehikler som Aktiesparekonto, frie midler og pensionsordninger for at optimere skatten. "
    }

    // Tax optimization advice
    recommendation += "\n\nSkatteoptimering: "
    if (taxStrategy === "aktiesparekonto") {
      recommendation +=
        "Aktiesparekontoen er et godt valg med sin faste skattesats på 17%, men husk at der er et loft på indskud (127.800 kr. i 2024). "
      recommendation += "Når dette loft er nået, bør du overveje at supplere med andre investeringsformer. "
    } else if (taxStrategy === "frie_midler") {
      recommendation +=
        "Ved investering for frie midler bør du være opmærksom på progressionsgrænsen for aktieindkomst (58.900 kr. i 2024), "
      recommendation +=
        "hvor skattesatsen stiger fra 27% til 42%. Overvej investeringsforeninger med minimumsbeskatning for at udskyde beskatningen. "
    } else if (taxStrategy === "pension") {
      recommendation += "Pensionsopsparing giver skattefradrag nu og beskattes kun med 15,3% PAL-skat årligt. "
      recommendation += "Dette er særligt fordelagtigt for personer med høj marginalbeskatning. "
    } else if (taxStrategy === "ask_and_pension") {
      recommendation += "Kombinationen af Aktiesparekonto og pensionsopsparing er en skatteeffektiv strategi. "
      recommendation +=
        "Fyld først Aktiesparekontoen op til maksimum, og placer derefter yderligere midler i pensionsordninger. "
    }

    // Fee advice
    if (feePercentage > 1) {
      recommendation +=
        "\n\nVær opmærksom på, at dine investeringsomkostninger på " + feePercentage + "% er relativt høje. "
      recommendation +=
        "Overvej at skifte til lavomkostnings-ETF'er eller indeksfonde, da høje omkostninger betydeligt reducerer dit langsigtede afkast. "
      recommendation +=
        "En reduktion af omkostningerne med bare 0,5% kan øge din slutværdi med adskillige procent over en lang investeringsperiode. "
    } else if (feePercentage <= 0.5) {
      recommendation +=
        "\n\nDine lave investeringsomkostninger på " + feePercentage + "% er en fordel for dit langsigtede afkast. "
      recommendation +=
        "Fortsæt med at fokusere på lavomkostningsinvesteringer, da dette er en af de faktorer, du faktisk kan kontrollere. "
    }

    // Final advice based on calculations
    const totalInvested = calculateTotalInvested()
    const futureValue = calculateFutureValue()
    const returnMultiple = futureValue / totalInvested

    if (returnMultiple > 2) {
      recommendation +=
        "\n\nDin investeringsstrategi har potentiale til at mere end fordoble din investering over tid. "
      recommendation += "Dette understreger værdien af langsigtet investering og renters rente-effekten. "
    }

    if (monthlyContribution < 1000 && age < 40) {
      recommendation +=
        "\n\nOvervej at øge dit månedlige bidrag, hvis muligt. Selv små forøgelser kan have stor effekt over tid pga. renters rente. "
    }

    return recommendation
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK" }).format(value)
  }

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <CalculatorTracker calculatorName="investering" />

      <div className="mb-8 flex items-center">
        <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbage til forsiden
        </Link>
        <h1 className="ml-auto text-2xl font-bold tracking-tight">Avanceret Investeringsberegner</h1>
      </div>

      {!showResults && (
        <Card className="mb-6 bg-gradient-to-br from-purple-50/60 to-pink-50/60 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-900">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold">Indlæs eksempel:</p>
                <p className="text-xs text-muted-foreground">Start fra et typisk scenarie og juster</p>
              </div>
              <div className="flex flex-wrap gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInitialInvestment(10000)
                    setMonthlyContribution(1500)
                    setInvestmentPeriod(40)
                    setExpectedReturn(7)
                    setRiskProfile("moderate")
                    setAge(25)
                    setTaxStrategy("aktiesparekonto")
                  }}
                >
                  Ung der sparer til pension
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInitialInvestment(300000)
                    setMonthlyContribution(5000)
                    setInvestmentPeriod(20)
                    setExpectedReturn(6.5)
                    setRiskProfile("moderate")
                    setAge(40)
                    setTaxStrategy("aktiesparekonto")
                  }}
                >
                  Familie med opsparing
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInitialInvestment(500000)
                    setMonthlyContribution(2000)
                    setInvestmentPeriod(10)
                    setExpectedReturn(5)
                    setRiskProfile("conservative")
                    setAge(55)
                    setTaxStrategy("aktiesparekonto")
                  }}
                >
                  Senior før pension
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInitialInvestment(50000)
                    setMonthlyContribution(3000)
                    setInvestmentPeriod(15)
                    setExpectedReturn(8)
                    setRiskProfile("aggressive")
                    setAge(30)
                    setTaxStrategy("aktiesparekonto")
                  }}
                >
                  Aggressiv vækststrategi
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!showResults ? (
        <Card>
          <CardHeader>
            <CardTitle>Investeringsoplysninger</CardTitle>
            <CardDescription>Indtast dine investeringsoplysninger for at få personlige anbefalinger</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="initial-investment" className="flex items-center">
                  Startbeløb: {formatCurrency(initialInvestment)}
                  <FieldTooltip content="Det beløb du starter med at investere" />
                </Label>
                <Slider
                  id="initial-investment"
                  min={0}
                  max={1000000}
                  step={10000}
                  value={[initialInvestment]}
                  onValueChange={(value) => setInitialInvestment(value[0])}
                  className="py-4"
                />
              </div>

              <div>
                <Label htmlFor="monthly-contribution" className="flex items-center">
                  Månedligt bidrag: {formatCurrency(monthlyContribution)}
                  <FieldTooltip content="Det beløb du investerer hver måned" />
                </Label>
                <Slider
                  id="monthly-contribution"
                  min={0}
                  max={10000}
                  step={100}
                  value={[monthlyContribution]}
                  onValueChange={(value) => setMonthlyContribution(value[0])}
                  className="py-4"
                />
              </div>

              <div>
                <Label htmlFor="investment-period" className="flex items-center">
                  Investeringsperiode: {investmentPeriod} år
                  <FieldTooltip content="Hvor mange år planlægger du at investere" />
                </Label>
                <Slider
                  id="investment-period"
                  min={1}
                  max={40}
                  step={1}
                  value={[investmentPeriod]}
                  onValueChange={(value) => setInvestmentPeriod(value[0])}
                  className="py-4"
                />
              </div>

              <div>
                <Label htmlFor="expected-return" className="flex items-center">
                  Forventet årligt afkast: {expectedReturn}%
                  <FieldTooltip content="Det gennemsnitlige årlige afkast du forventer på dine investeringer" />
                </Label>
                <Slider
                  id="expected-return"
                  min={1}
                  max={15}
                  step={0.5}
                  value={[expectedReturn]}
                  onValueChange={(value) => setExpectedReturn(value[0])}
                  className="py-4"
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="w-full flex items-center justify-between"
                >
                  <span>Avancerede indstillinger</span>
                  {showAdvancedOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {showAdvancedOptions && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="risk-profile" className="flex items-center">
                      Risikoprofil
                      <FieldTooltip content="Din tolerance for investeringsrisiko" />
                    </Label>
                    <RadioGroup
                      id="risk-profile"
                      value={riskProfile}
                      onValueChange={setRiskProfile}
                      className="grid grid-cols-2 gap-4 pt-2"
                    >
                      <div>
                        <RadioGroupItem value="conservative" id="conservative" className="peer sr-only" />
                        <Label
                          htmlFor="conservative"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span>Konservativ</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="moderate" id="moderate" className="peer sr-only" />
                        <Label
                          htmlFor="moderate"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span>Moderat</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="aggressive" id="aggressive" className="peer sr-only" />
                        <Label
                          htmlFor="aggressive"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span>Aggressiv</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="very_aggressive" id="very_aggressive" className="peer sr-only" />
                        <Label
                          htmlFor="very_aggressive"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span>Meget aggressiv</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="investment-goal" className="flex items-center">
                      Investeringsmål
                      <FieldTooltip content="Hvad er formålet med din investering" />
                    </Label>
                    <Select value={investmentGoal} onValueChange={setInvestmentGoal}>
                      <SelectTrigger id="investment-goal" className="w-full">
                        <SelectValue placeholder="Vælg investeringsmål" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retirement">Pension</SelectItem>
                        <SelectItem value="house">Boligkøb</SelectItem>
                        <SelectItem value="education">Uddannelse</SelectItem>
                        <SelectItem value="wealth">Formueforøgelse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="age" className="flex items-center">
                      Alder
                      <FieldTooltip content="Din nuværende alder" />
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      min={18}
                      max={100}
                      value={age}
                      onChange={(e) => setAge(Number.parseInt(e.target.value) || 35)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tax-strategy" className="flex items-center">
                      Skattestrategi
                      <FieldTooltip content="Hvilken investeringsform du primært bruger" />
                    </Label>
                    <Select value={taxStrategy} onValueChange={setTaxStrategy}>
                      <SelectTrigger id="tax-strategy" className="w-full">
                        <SelectValue placeholder="Vælg skattestrategi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aktiesparekonto">Aktiesparekonto (17% skat)</SelectItem>
                        <SelectItem value="frie_midler">Frie midler (27%/42% skat)</SelectItem>
                        <SelectItem value="pension">Pension (PAL-skat 15,3%)</SelectItem>
                        <SelectItem value="ask_and_pension">Kombination af ASK og pension</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="inflation-rate" className="flex items-center">
                      Forventet inflation: {inflationRate}%
                      <FieldTooltip content="Den årlige inflationsrate du forventer" />
                    </Label>
                    <Slider
                      id="inflation-rate"
                      min={0}
                      max={5}
                      step={0.1}
                      value={[inflationRate]}
                      onValueChange={(value) => setInflationRate(value[0])}
                      className="py-4"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fee-percentage" className="flex items-center">
                      Årlige omkostninger (ÅOP): {feePercentage}%
                      <FieldTooltip content="De samlede årlige omkostninger for dine investeringer" />
                    </Label>
                    <Slider
                      id="fee-percentage"
                      min={0}
                      max={2}
                      step={0.05}
                      value={[feePercentage]}
                      onValueChange={(value) => setFeePercentage(value[0])}
                      className="py-4"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rebalancing-frequency" className="flex items-center">
                      Rebalanceringsfrekvens
                      <FieldTooltip content="Hvor ofte du rebalancerer din portefølje" />
                    </Label>
                    <Select value={rebalancingFrequency} onValueChange={setRebalancingFrequency}>
                      <SelectTrigger id="rebalancing-frequency" className="w-full">
                        <SelectValue placeholder="Vælg frekvens" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Månedlig</SelectItem>
                        <SelectItem value="quarterly">Kvartalsvis</SelectItem>
                        <SelectItem value="yearly">Årlig</SelectItem>
                        <SelectItem value="never">Aldrig</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reinvest-dividends"
                      checked={reinvestDividends}
                      onCheckedChange={setReinvestDividends}
                    />
                    <Label htmlFor="reinvest-dividends" className="flex items-center">
                      Geninvestér udbytter
                      <FieldTooltip content="Om udbytter automatisk geninvesteres" />
                    </Label>
                  </div>
                </div>
              )}
            </div>

            <Button onClick={() => setShowResults(true)} className="w-full">
              Beregn resultat
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="overview">Overblik</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarier</TabsTrigger>
            <TabsTrigger value="allocation">Allokering</TabsTrigger>
            <TabsTrigger value="historical">Historiske renter</TabsTrigger>
            <TabsTrigger value="recommendation">Anbefaling</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Investeringsoverblik</CardTitle>
                <CardDescription>Baseret på dine indtastede oplysninger</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">Fremtidig værdi</div>
                    <div className="mt-1 text-2xl font-bold">{formatCurrency(calculateFutureValue())}</div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">Samlet investeret</div>
                    <div className="mt-1 text-2xl font-bold">{formatCurrency(calculateTotalInvested())}</div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">Forventet afkast</div>
                    <div className="mt-1 text-2xl font-bold">{formatCurrency(calculateCompoundInterest())}</div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">Afkast i procent</div>
                    <div className="mt-1 text-2xl font-bold">
                      {((calculateFutureValue() / calculateTotalInvested() - 1) * 100).toFixed(2)}%
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">Inflationsjusteret værdi</div>
                    <div className="mt-1 text-2xl font-bold">{formatCurrency(calculateRealValue())}</div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">Værdi efter skat</div>
                    <div className="mt-1 text-2xl font-bold">{formatCurrency(calculateAfterTaxValue())}</div>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-4">Værdiudvikling over tid</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={generateYearlyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" label={{ value: "År", position: "insideBottom", offset: -5 }} />
                      <YAxis
                        tickFormatter={(value) =>
                          new Intl.NumberFormat("da-DK", {
                            notation: "compact",
                            compactDisplay: "short",
                            maximumFractionDigits: 1,
                          }).format(value)
                        }
                        label={{ value: "Værdi (DKK)", angle: -90, position: "insideLeft" }}
                      />
                      <RechartsTooltip
                        formatter={(value) => formatCurrency(value)}
                        labelFormatter={(value) => `År ${value}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="realistic"
                        name="Forventet værdi"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      <Line type="monotone" dataKey="invested" name="Investeret beløb" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setShowResults(false)} variant="outline" className="w-full">
                  Tilbage til beregner
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Investeringsscenarier</CardTitle>
                <CardDescription>Sammenligning af forskellige markedsscenarier</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center space-x-4 mb-4">
                  <Button
                    variant={scenarioView === "pessimistic" ? "default" : "outline"}
                    onClick={() => setScenarioView("pessimistic")}
                  >
                    Pessimistisk
                  </Button>
                  <Button
                    variant={scenarioView === "realistic" ? "default" : "outline"}
                    onClick={() => setScenarioView("realistic")}
                  >
                    Realistisk
                  </Button>
                  <Button
                    variant={scenarioView === "optimistic" ? "default" : "outline"}
                    onClick={() => setScenarioView("optimistic")}
                  >
                    Optimistisk
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">Scenarie</div>
                    <div className="mt-1 text-xl font-bold">
                      {scenarioView === "pessimistic"
                        ? "Pessimistisk"
                        : scenarioView === "optimistic"
                          ? "Optimistisk"
                          : "Realistisk"}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {scenarioView === "pessimistic"
                        ? `${expectedReturn - 3}% årligt afkast`
                        : scenarioView === "optimistic"
                          ? `${expectedReturn + 2}% årligt afkast`
                          : `${expectedReturn}% årligt afkast`}
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">Fremtidig værdi</div>
                    <div className="mt-1 text-xl font-bold">{formatCurrency(calculateFutureValue(scenarioView))}</div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">Inflationsjusteret værdi</div>
                    <div className="mt-1 text-xl font-bold">{formatCurrency(calculateRealValue(scenarioView))}</div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">Værdi efter skat</div>
                    <div className="mt-1 text-xl font-bold">{formatCurrency(calculateAfterTaxValue(scenarioView))}</div>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-4">Sammenligning af scenarier</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={generateYearlyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" label={{ value: "År", position: "insideBottom", offset: -5 }} />
                      <YAxis
                        tickFormatter={(value) =>
                          new Intl.NumberFormat("da-DK", {
                            notation: "compact",
                            compactDisplay: "short",
                            maximumFractionDigits: 1,
                          }).format(value)
                        }
                        label={{ value: "Værdi (DKK)", angle: -90, position: "insideLeft" }}
                      />
                      <RechartsTooltip
                        formatter={(value) => formatCurrency(value)}
                        labelFormatter={(value) => `År ${value}`}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="pessimistic" name="Pessimistisk" stroke="#ff7300" />
                      <Line type="monotone" dataKey="realistic" name="Realistisk" stroke="#8884d8" />
                      <Line type="monotone" dataKey="optimistic" name="Optimistisk" stroke="#82ca9d" />
                      <Line
                        type="monotone"
                        dataKey="invested"
                        name="Investeret beløb"
                        stroke="#999"
                        strokeDasharray="3 3"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="pt-4 space-y-4">
                  <h3 className="text-lg font-medium">Scenariebeskrivelser</h3>

                  <div className="rounded-lg border p-4">
                    <div className="font-medium">Pessimistisk scenarie ({expectedReturn - 3}% årligt afkast)</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Dette scenarie repræsenterer et marked med lavere afkast end forventet. Det kan skyldes økonomiske
                      nedgangstider, højere inflation end forventet, eller andre negative markedsfaktorer. Dette
                      scenarie er 3 procentpoint lavere end dit forventede afkast.
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="font-medium">Realistisk scenarie ({expectedReturn}% årligt afkast)</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Dette scenarie repræsenterer dit forventede afkast baseret på historiske gennemsnit og dine
                      investeringsvalg. Det er det mest sandsynlige udfald over den angivne tidsperiode.
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="font-medium">Optimistisk scenarie ({expectedReturn + 2}% årligt afkast)</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Dette scenarie repræsenterer et marked med højere afkast end forventet. Det kan skyldes stærk
                      økonomisk vækst, teknologiske gennembrud, eller andre positive markedsfaktorer. Dette scenarie er
                      2 procentpoint højere end dit forventede afkast.
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setShowResults(false)} variant="outline" className="w-full">
                  Tilbage til beregner
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Anbefalet aktivallokering</CardTitle>
                <CardDescription>
                  Baseret på din risikoprofil:{" "}
                  {riskProfile === "conservative"
                    ? "Konservativ"
                    : riskProfile === "moderate"
                      ? "Moderat"
                      : riskProfile === "aggressive"
                        ? "Aggressiv"
                        : "Meget aggressiv"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={assetAllocations[riskProfile]}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {assetAllocations[riskProfile].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-medium">Aktivklassebeskrivelser</h3>

                  <div className="rounded-lg border p-4">
                    <div className="font-medium">Aktier</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Aktier repræsenterer ejerskab i virksomheder og har historisk givet det højeste afkast over tid,
                      men med større udsving. Anbefales som kernen i langsigtede investeringsporteføljer.
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="font-medium">Obligationer</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Obligationer er lån til virksomheder eller stater og giver typisk lavere, men mere stabile afkast
                      end aktier. De fungerer som en stabilisator i porteføljen og reducerer den samlede risiko.
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="font-medium">Alternative investeringer</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Alternative investeringer inkluderer ejendomme, råvarer, private equity og andre aktiver, der ikke
                      er traditionelle aktier eller obligationer. De kan give diversificering og potentielt højere
                      afkast.
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="font-medium">Kontanter</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Kontanter og kontantlignende investeringer som indlånskonti giver lav risiko og høj likviditet,
                      men typisk også lavt afkast. Bruges primært som buffer eller til kortsigtede mål.
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-4">Effekt af omkostninger over tid</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          name: "0.25%",
                          value: calculateFutureValue() * (1 + (0.25 - feePercentage) / 100) ** investmentPeriod,
                        },
                        {
                          name: "0.5%",
                          value: calculateFutureValue() * (1 + (0.5 - feePercentage) / 100) ** investmentPeriod,
                        },
                        {
                          name: "1.0%",
                          value: calculateFutureValue() * (1 + (1.0 - feePercentage) / 100) ** investmentPeriod,
                        },
                        {
                          name: "1.5%",
                          value: calculateFutureValue() * (1 + (1.5 - feePercentage) / 100) ** investmentPeriod,
                        },
                        {
                          name: "2.0%",
                          value: calculateFutureValue() * (1 + (2.0 - feePercentage) / 100) ** investmentPeriod,
                        },
                        { name: "Din ÅOP", value: calculateFutureValue() },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis
                        tickFormatter={(value) =>
                          new Intl.NumberFormat("da-DK", {
                            notation: "compact",
                            compactDisplay: "short",
                            maximumFractionDigits: 1,
                          }).format(value)
                        }
                      />
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="value" name="Slutværdi" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="text-sm text-muted-foreground mt-2 text-center">
                    Sammenligning af slutværdi med forskellige årlige omkostninger i procent (ÅOP)
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setShowResults(false)} variant="outline" className="w-full">
                  Tilbage til beregner
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="historical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historiske afkast</CardTitle>
                <CardDescription>Historiske afkast på det danske aktiemarked</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-4">Historiske afkast over tid</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={historicalRates}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis label={{ value: "Afkast (%)", angle: -90, position: "insideLeft" }} />
                      <RechartsTooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="rate" name="Årligt afkast" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-medium">Historiske perioder</h3>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Periode
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Gennemsnitligt årligt afkast
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Bemærkninger
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1990-1999</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10.2%</td>
                          <td className="px-6 py-4 text-sm text-gray-500">Dot-com boom, stærk økonomisk vækst</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2000-2009</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2.3%</td>
                          <td className="px-6 py-4 text-sm text-gray-500">Dot-com krak, finanskrise</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2010-2019</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8.5%</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            Genopretning efter finanskrisen, lavrentemiljø
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2020-2021</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">14.2%</td>
                          <td className="px-6 py-4 text-sm text-gray-500">COVID-19 genopretning, stimuluspakker</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2022</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-14.5%</td>
                          <td className="px-6 py-4 text-sm text-gray-500">Inflation, rentestigninger, Ukraine-krig</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2023</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">16.8%</td>
                          <td className="px-6 py-4 text-sm text-gray-500">Teknologiaktier, AI-boom</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <h3 className="text-lg font-medium">Langsigtede gennemsnit</h3>

                  <div className="rounded-lg border p-4">
                    <div className="font-medium">10-års gennemsnit: 7.2%</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Det gennemsnitlige årlige afkast på det danske aktiemarked over de seneste 10 år.
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="font-medium">20-års gennemsnit: 6.8%</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Det gennemsnitlige årlige afkast på det danske aktiemarked over de seneste 20 år, inklusiv både
                      finanskrisen og COVID-19 pandemien.
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="font-medium">30-års gennemsnit: 7.5%</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Det gennemsnitlige årlige afkast på det danske aktiemarked over de seneste 30 år, hvilket giver et
                      godt langsigtet perspektiv på markedets præstation.
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">
                      <strong>Bemærk:</strong> Historiske afkast er ikke en garanti for fremtidige afkast. Investeringer
                      indebærer altid en risiko for tab.
                    </p>
                    <p>
                      Data er baseret på det danske aktiemarked (OMX C25) og inkluderer ikke udbytter. Reelle afkast med
                      geninvesterede udbytter kan være højere.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setShowResults(false)} variant="outline" className="w-full">
                  Tilbage til beregner
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="recommendation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personlig investeringsanbefaling</CardTitle>
                <CardDescription>Skræddersyet til din finansielle situation og mål</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-6">
                  <h3 className="text-lg font-medium mb-4">Din investeringsprofil</h3>

                  <div className="grid gap-4 md:grid-cols-2 mb-6">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Risikoprofil</div>
                      <div className="mt-1 font-medium">
                        {riskProfile === "conservative"
                          ? "Konservativ"
                          : riskProfile === "moderate"
                            ? "Moderat"
                            : riskProfile === "aggressive"
                              ? "Aggressiv"
                              : "Meget aggressiv"}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Investeringsmål</div>
                      <div className="mt-1 font-medium">
                        {investmentGoal === "retirement"
                          ? "Pension"
                          : investmentGoal === "house"
                            ? "Boligkøb"
                            : investmentGoal === "education"
                              ? "Uddannelse"
                              : "Formueforøgelse"}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Tidshorisont</div>
                      <div className="mt-1 font-medium">{investmentPeriod} år</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Alder</div>
                      <div className="mt-1 font-medium">{age} år</div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium mb-4">Investeringsanbefaling</h3>
                  <div className="text-sm space-y-4 whitespace-pre-line">{generateRecommendation()}</div>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-4">Sammenligning af scenarier</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Scenarie
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Årligt afkast
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Slutværdi
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Efter inflation
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Efter skat
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Pessimistisk
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expectedReturn - 3}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(calculateFutureValue("pessimistic"))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(calculateRealValue("pessimistic"))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(calculateAfterTaxValue("pessimistic"))}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Realistisk</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expectedReturn}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(calculateFutureValue("realistic"))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(calculateRealValue("realistic"))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(calculateAfterTaxValue("realistic"))}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Optimistisk</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expectedReturn + 2}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(calculateFutureValue("optimistic"))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(calculateRealValue("optimistic"))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(calculateAfterTaxValue("optimistic"))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-4">Næste skridt</h3>
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="font-medium">1. Opret en investeringskonto</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Baseret på din skattestrategi (
                        {taxStrategy === "aktiesparekonto"
                          ? "Aktiesparekonto"
                          : taxStrategy === "frie_midler"
                            ? "Frie midler"
                            : taxStrategy === "pension"
                              ? "Pension"
                              : "Kombination af ASK og pension"}
                        ), bør du oprette den relevante investeringskonto hos en bank eller børsmægler.
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="font-medium">2. Vælg investeringsprodukter</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Implementer den anbefalede aktivallokering gennem indeksfonde eller ETF'er med lave
                        omkostninger. Fokuser på bred diversificering inden for hver aktivklasse.
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="font-medium">3. Opsæt automatisk investering</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Automatiser dine månedlige bidrag på {formatCurrency(monthlyContribution)} for at sikre
                        konsistens og udnytte dollar cost averaging-effekten.
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="font-medium">4. Planlæg regelmæssig opfølgning</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Rebalancer din portefølje{" "}
                        {rebalancingFrequency === "monthly"
                          ? "månedligt"
                          : rebalancingFrequency === "quarterly"
                            ? "kvartalsvis"
                            : rebalancingFrequency === "yearly"
                              ? "årligt"
                              : "efter behov"}{" "}
                        for at fastholde din ønskede aktivallokering.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">
                      <strong>Bemærk:</strong> Denne anbefaling er baseret på de oplysninger, du har angivet, og er kun
                      vejledende. Konsulter altid med en professionel finansiel rådgiver før du træffer
                      investeringsbeslutninger.
                    </p>
                    <p>
                      Investeringer indebærer risiko, og historiske afkast er ikke en garanti for fremtidige resultater.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button onClick={() => setShowResults(false)} variant="outline" className="w-full">
                  Tilbage til beregner
                </Button>
                <Button className="w-full flex items-center">
                  <Download className="mr-2 h-4 w-4" />
                  Download investeringsrapport
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      {showResults && (
        <div className="mt-8 space-y-6">
          {/* Sammenlign scenarier side-om-side: effekten af forskellige månedlige indbetalinger */}
          {(() => {
            const dkk = (n: number) =>
              new Intl.NumberFormat("da-DK", {
                style: "currency",
                currency: "DKK",
                maximumFractionDigits: 0,
              }).format(n)

            const computeFV = (monthly: number) => {
              const netReturn = expectedReturn - feePercentage
              const mRate = netReturn / 100 / 12
              const months = investmentPeriod * 12
              let fv = initialInvestment * Math.pow(1 + mRate, months)
              if (monthly > 0) {
                fv += monthly * ((Math.pow(1 + mRate, months) - 1) / mRate)
              }
              return fv
            }

            const base = computeFV(monthlyContribution)
            const halfContribution = Math.max(0, Math.round(monthlyContribution / 2))
            const doubleContribution = monthlyContribution * 2
            const plus500 = monthlyContribution + 500

            const contributionScenarios: Scenario[] = [
              {
                label: "Halv indbetaling",
                description: `${dkk(halfContribution)}/md i ${investmentPeriod} år`,
                value: dkk(computeFV(halfContribution)),
                delta: `${dkk(computeFV(halfContribution) - base)} vs. dit valg`,
                tone: "negative",
              },
              {
                label: "Dit valg",
                description: `${dkk(monthlyContribution)}/md i ${investmentPeriod} år`,
                value: dkk(base),
                highlight: true,
                tone: "neutral",
              },
              {
                label: `+500 kr./md`,
                description: `${dkk(plus500)}/md i ${investmentPeriod} år`,
                value: dkk(computeFV(plus500)),
                delta: `+${dkk(computeFV(plus500) - base)} vs. dit valg`,
                tone: "positive",
              },
              {
                label: "Dobbelt indbetaling",
                description: `${dkk(doubleContribution)}/md i ${investmentPeriod} år`,
                value: dkk(computeFV(doubleContribution)),
                delta: `+${dkk(computeFV(doubleContribution) - base)} vs. dit valg`,
                tone: "positive",
              },
            ]

            const computeFVWithHorizon = (years: number) => {
              const netReturn = expectedReturn - feePercentage
              const mRate = netReturn / 100 / 12
              const months = years * 12
              let fv = initialInvestment * Math.pow(1 + mRate, months)
              if (monthlyContribution > 0) {
                fv += monthlyContribution * ((Math.pow(1 + mRate, months) - 1) / mRate)
              }
              return fv
            }

            const horizonScenarios: Scenario[] = [
              {
                label: "10 år",
                description: `${dkk(monthlyContribution)}/md`,
                value: dkk(computeFVWithHorizon(10)),
                tone: "neutral",
              },
              {
                label: "20 år",
                description: `${dkk(monthlyContribution)}/md`,
                value: dkk(computeFVWithHorizon(20)),
                tone: "neutral",
              },
              {
                label: "30 år",
                description: `${dkk(monthlyContribution)}/md`,
                value: dkk(computeFVWithHorizon(30)),
                tone: "positive",
              },
              {
                label: "40 år",
                description: `${dkk(monthlyContribution)}/md`,
                value: dkk(computeFVWithHorizon(40)),
                tone: "positive",
              },
            ]

            return (
              <>
                <ScenarioCompare
                  title="Hvad hvis du indbetaler mere?"
                  description="Effekten af forskellige månedlige indbetalinger med dine øvrige valg"
                  scenarios={contributionScenarios}
                />
                <ScenarioCompare
                  title="Effekten af tid (rentes rente)"
                  description="Samme månedlige indbetaling over forskellige tidshorisonter"
                  scenarios={horizonScenarios}
                />
              </>
            )
          })()}

          <AIRecommendation
            data={aiRecommendation}
            printTitle="Investeringsberegner · AI-anbefaling"
          />
        </div>
      )}
    </div>
  )
}
