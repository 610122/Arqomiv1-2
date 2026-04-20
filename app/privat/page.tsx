import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Home,
  TrendingUp,
  PiggyBank,
  Wallet,
  Calculator,
  CreditCard,
  Target,
  Shield,
  BarChart3,
  ArrowRight,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Privatøkonomi · Arqomi",
  description:
    "Gratis danske beregnere til din privatøkonomi: lån, investering, opsparing, budget, løn, gæld, afbetalingsplan og risiko. Få personlig AI-anbefaling baseret på dine tal.",
  openGraph: {
    title: "Privatøkonomi · Arqomi",
    description: "Gratis danske beregnere til din privatøkonomi med personlig AI-anbefaling.",
    type: "website",
  },
}

interface Tool {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color: string
  highlight?: boolean
}

const tools: Tool[] = [
  {
    title: "Låneberegner",
    description: "Beregn månedlig ydelse, ÅOP, DTI og samlet omkostning for dit lån.",
    href: "/beregner/laan",
    icon: <Home className="h-6 w-6" />,
    color: "from-blue-500 to-cyan-400",
    highlight: true,
  },
  {
    title: "Investeringsberegner",
    description: "Se hvad din opsparing vokser til med rentes rente over tid.",
    href: "/beregner/investering",
    icon: <TrendingUp className="h-6 w-6" />,
    color: "from-purple-500 to-pink-400",
    highlight: true,
  },
  {
    title: "Opsparingsstrategi",
    description: "Planlæg din opsparing, nødopsparing og opsparingsmål.",
    href: "/beregner/opsparing",
    icon: <PiggyBank className="h-6 w-6" />,
    color: "from-emerald-500 to-teal-400",
  },
  {
    title: "Budgetplanlægger",
    description: "Få overblik over indtægter og udgifter efter 50/30/20-reglen.",
    href: "/beregner/budget",
    icon: <Wallet className="h-6 w-6" />,
    color: "from-amber-500 to-orange-400",
    highlight: true,
  },
  {
    title: "Lønberegner",
    description: "Beregn nettoløn med AM-bidrag, skat, pension og fradrag.",
    href: "/beregner/loen",
    icon: <Calculator className="h-6 w-6" />,
    color: "from-indigo-500 to-violet-400",
  },
  {
    title: "Gældsberegner",
    description: "Saml din gæld og få overblik over DTI og renteomkostninger.",
    href: "/beregner/gaeld",
    icon: <CreditCard className="h-6 w-6" />,
    color: "from-rose-500 to-red-400",
  },
  {
    title: "Afbetalingsplan",
    description: "Lav en konkret plan for at blive gældfri med avalanche eller snowball.",
    href: "/beregner/afbetalingsplan",
    icon: <Target className="h-6 w-6" />,
    color: "from-fuchsia-500 to-pink-400",
  },
  {
    title: "Risikoberegner",
    description: "Vurder risiko, Sharpe-ratio og VaR på din portefølje.",
    href: "/beregner/risiko",
    icon: <Shield className="h-6 w-6" />,
    color: "from-sky-500 to-blue-400",
  },
  {
    title: "Statistik & Økonomi",
    description: "Analyser egne data: middel, median, spredning og outliers.",
    href: "/beregner/statistik",
    icon: <BarChart3 className="h-6 w-6" />,
    color: "from-slate-500 to-gray-400",
  },
]

export default function PrivatPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-block mb-3 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          Til dig som privatperson
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Få styr på din privatøkonomi
        </h1>
        <p className="text-lg text-muted-foreground">
          Vælg et værktøj nedenfor. Hver beregner afsluttes med en personlig AI-anbefaling baseret på
          dine tal — helt gratis og uden login.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group block focus:outline-none">
            <Card
              className={`h-full transition-all group-hover:shadow-lg group-hover:-translate-y-0.5 ${
                tool.highlight ? "border-blue-200 dark:border-blue-800" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-white mb-3`}
                >
                  {tool.icon}
                </div>
                <CardTitle className="text-lg">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                  Åbn beregner
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-14 text-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-3">Driver du virksomhed?</h2>
        <p className="text-muted-foreground mb-5 max-w-xl mx-auto">
          Vi har også værktøjer til virksomhedsøkonomi, nøgletal og strategisk analyse.
        </p>
        <Button asChild size="lg" variant="outline">
          <Link href="/virksomhed">
            Gå til virksomhedsværktøjer
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
