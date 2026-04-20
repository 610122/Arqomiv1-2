"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { PiggyBank, TrendingUp, Shield, Calculator, Target, AlertTriangle, CheckCircle, Info } from "lucide-react"

interface InvestmentStrategy {
  name: string
  description: string
  taxAdvantage: string
  maxAmount: number
  expectedReturn: number
  risk: "Lav" | "Medium" | "Høj"
  timeHorizon: string
  pros: string[]
  cons: string[]
  suitableFor: string[]
}

const investmentStrategies: InvestmentStrategy[] = [
  {
    name: "Ratepension",
    description: "Pensionsopsparing med skattefradrag ved indbetaling og beskatning ved udbetaling",
    taxAdvantage: "Skattefradrag ved indbetaling (op til 40% besparelse)",
    maxAmount: 61900, // 2023-tal
    expectedReturn: 7,
    risk: "Medium",
    timeHorizon: "Lang (til pension)",
    pros: [
      "Skattefradrag ved indbetaling",
      "Renters rente effekt over mange år",
      "Beskyttelse mod kreditorer",
      "Automatisk opsparing",
    ],
    cons: [
      "Penge bundet til pensionsalderen",
      "Beskatning ved udbetaling",
      "Begrænsede investeringsmuligheder",
      "Inflation kan udhule værdien",
    ],
    suitableFor: [
      "Personer med høj marginalskattesats",
      "Langsigtet opsparing til pension",
      "Dem der ønsker automatisk opsparing",
    ],
  },
  {
    name: "Aldersopsparing",
    description: "Pensionsopsparing uden skattefradrag, men skattefri udbetaling",
    taxAdvantage: "Skattefri udbetaling ved pensionsalderen",
    maxAmount: 30000, // 2023-tal
    expectedReturn: 7,
    risk: "Medium",
    timeHorizon: "Lang (til pension)",
    pros: [
      "Skattefri udbetaling",
      "Fleksible investeringsmuligheder",
      "Beskyttelse mod kreditorer",
      "Kan kombineres med ratepension",
    ],
    cons: [
      "Intet skattefradrag ved indbetaling",
      "Penge bundet til pensionsalderen",
      "Relativt lavt maksimum beløb",
      "Kræver aktiv forvaltning",
    ],
    suitableFor: [
      "Personer med lav marginalskattesats",
      "Supplement til ratepension",
      "Dem der forventer højere skat i fremtiden",
    ],
  },
  {
    name: "Aktiesparekonto",
    description: "Særlig konto til aktiehandel med lav skat på 17%",
    taxAdvantage: "Kun 17% skat på gevinster (vs. 27/42% på frie midler)",
    maxAmount: 103500, // 2023-tal
    expectedReturn: 8,
    risk: "Medium",
    timeHorizon: "Medium til lang",
    pros: ["Lav skattesats på 17%", "Fleksible investeringsmuligheder", "Kan hæves når som helst", "Ingen binding"],
    cons: [
      "Begrænset maksimum beløb",
      "Kun danske aktier og visse udenlandske",
      "Årlig lagerbeskatning",
      "Kræver aktiv forvaltning",
    ],
    suitableFor: ["Aktive investorer", "Medium til langsigtede mål", "Dem der ønsker fleksibilitet"],
  },
  {
    name: "Frie midler",
    description: "Almindelig investering uden særlige skattefordele",
    taxAdvantage: "Progressionsfradrag på 58.900 kr. (2023)",
    maxAmount: 0, // Ingen grænse
    expectedReturn: 8,
    risk: "Medium til høj",
    timeHorizon: "Alle",
    pros: ["Ingen begrænsninger på beløb", "Alle investeringsmuligheder", "Fuld fleksibilitet", "Progressionsfradrag"],
    cons: [
      "Høj beskatning (27/42%)",
      "Lagerbeskatning på visse produkter",
      "Ingen særlige skattefordele",
      "Kræver god skatteforståelse",
    ],
    suitableFor: ["Store investeringsbeløb", "Erfarne investorer", "Kortsigtede mål"],
  },
  {
    name: "Boligopsparing for unge",
    description: "Særlig opsparingsordning for førstegangskøbere under 34 år",
    taxAdvantage: "Skattefradrag ved indbetaling + skattefri udbetaling til boligkøb",
    maxAmount: 25000, // Årligt, max 200.000 kr. i alt
    expectedReturn: 4,
    risk: "Lav",
    timeHorizon: "Kort til medium",
    pros: ["Dobbelt skattefordel", "Hjælp til boligkøb", "Sikker investering", "Statsgaranti"],
    cons: ["Kun for under 34-årige", "Kun til boligkøb", "Lavt afkast", "Begrænset beløb"],
    suitableFor: ["Unge under 34 år", "Førstegangskøbere", "Dem der sparer op til bolig"],
  },
]

interface InvestmentStrategiesProps {
  monthlyIncome?: number
  age?: number
  riskProfile?: string
}

export function InvestmentStrategies({
  monthlyIncome = 0,
  age = 30,
  riskProfile = "moderat",
}: InvestmentStrategiesProps) {
  const getRecommendationScore = (strategy: InvestmentStrategy): number => {
    let score = 50

    // Alder påvirker anbefalingen
    if (strategy.name === "Ratepension" && age < 40) score += 20
    if (strategy.name === "Aldersopsparing" && age > 50) score += 15
    if (strategy.name === "Aktiesparekonto" && age >= 25 && age <= 50) score += 15
    if (strategy.name === "Boligopsparing for unge" && age < 34) score += 30

    // Risikoprofil påvirker anbefalingen
    if (riskProfile === "konservativ" && strategy.risk === "Lav") score += 15
    if (riskProfile === "moderat" && strategy.risk === "Medium") score += 15
    if (riskProfile === "aggressiv" && strategy.risk === "Høj") score += 15

    // Indkomst påvirker anbefalingen
    if (monthlyIncome > 50000 && strategy.name === "Ratepension") score += 10
    if (monthlyIncome < 30000 && strategy.name === "Aktiesparekonto") score += 10

    return Math.min(100, Math.max(0, score))
  }

  const getRecommendationLevel = (score: number): { level: string; color: string } => {
    if (score >= 80)
      return { level: "Stærkt anbefalet", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" }
    if (score >= 60)
      return { level: "Anbefalet", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" }
    if (score >= 40)
      return { level: "Overvej", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" }
    return { level: "Mindre relevant", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" }
  }

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case "Lav":
        return "text-green-600"
      case "Medium":
        return "text-yellow-600"
      case "Høj":
        return "text-red-600"
      default:
        return "text-gray-600"
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

  // Sorter strategier efter anbefaling
  const sortedStrategies = [...investmentStrategies].sort(
    (a, b) => getRecommendationScore(b) - getRecommendationScore(a),
  )

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Skatteoptimerede Investeringsstrategier</h2>
        <p className="text-muted-foreground">
          Personlige anbefalinger baseret på din alder ({age} år), indkomst og risikoprofil
        </p>
      </div>

      <div className="grid gap-6">
        {sortedStrategies.map((strategy, index) => {
          const score = getRecommendationScore(strategy)
          const recommendation = getRecommendationLevel(score)

          return (
            <Card key={strategy.name} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      {strategy.name.includes("pension") ? (
                        <PiggyBank className="h-5 w-5 text-blue-600" />
                      ) : strategy.name.includes("aktie") ? (
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      ) : strategy.name.includes("bolig") ? (
                        <Target className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Calculator className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{strategy.name}</CardTitle>
                      <CardDescription className="mt-1">{strategy.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className={recommendation.color}>{recommendation.level}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Nøgletal */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-muted-foreground">Max årligt</p>
                    <p className="font-bold">
                      {strategy.maxAmount > 0 ? formatCurrency(strategy.maxAmount) : "Ingen grænse"}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-muted-foreground">Forventet afkast</p>
                    <p className="font-bold text-green-600">{strategy.expectedReturn}% årligt</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-muted-foreground">Risiko</p>
                    <p className={`font-bold ${getRiskColor(strategy.risk)}`}>{strategy.risk}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-muted-foreground">Tidshorisont</p>
                    <p className="font-bold">{strategy.timeHorizon}</p>
                  </div>
                </div>

                {/* Skattefordel */}
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-green-800 dark:text-green-200">Skattefordel</h4>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">{strategy.taxAdvantage}</p>
                </div>

                {/* Anbefaling score */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Anbefaling for dig</span>
                    <span className="text-sm font-bold">{score}/100</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>

                {/* Fordele og ulemper */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="h-4 w-4" />
                      Fordele
                    </h4>
                    <ul className="space-y-1">
                      {strategy.pros.map((pro, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <div className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-4 w-4" />
                      Ulemper
                    </h4>
                    <ul className="space-y-1">
                      {strategy.cons.map((con, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <div className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Egnet til */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Egnet til
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {strategy.suitableFor.map((suitable, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {suitable}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Samlet anbefaling */}
      <Card className="border-2 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Din personlige investeringsstrategi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Baseret på din profil anbefaler vi følgende prioritering:</p>

            <div className="space-y-3">
              {sortedStrategies.slice(0, 3).map((strategy, index) => {
                const score = getRecommendationScore(strategy)
                const monthlyAmount =
                  strategy.maxAmount > 0 ? Math.min(strategy.maxAmount / 12, monthlyIncome * 0.1) : monthlyIncome * 0.05

                return (
                  <div
                    key={strategy.name}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{strategy.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Anbefalet månedligt: {formatCurrency(monthlyAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{score}/100</p>
                      <p className="text-xs text-muted-foreground">match</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <Separator />

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-medium mb-2">💡 Pro tip</h4>
              <p className="text-sm">
                Start med den højest anbefalede strategi og byg gradvist din portefølje op. Diversificering på tværs af
                flere strategier kan optimere både afkast og skattefordele.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
