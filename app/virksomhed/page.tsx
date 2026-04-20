import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, BarChart3, TrendingUp, Shield, ArrowRight, Calculator, Target } from "lucide-react"

export const metadata: Metadata = {
  title: "Virksomhedsøkonomi · Arqomi",
  description:
    "Gratis danske værktøjer til virksomhedsøkonomi: nøgletal, margin, runway, break-even og AI-drevet strategisk analyse. Perfekt for iværksættere og SMV.",
  openGraph: {
    title: "Virksomhedsøkonomi · Arqomi",
    description: "Danske værktøjer til virksomhedsanalyse med AI-anbefalinger.",
    type: "website",
  },
}

interface Tool {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color: string
  tag?: string
}

const tools: Tool[] = [
  {
    title: "Virksomhedsrådgiver",
    description:
      "Omfattende analyse af din virksomheds økonomi: margin, likviditet, soliditet, benchmarks og strategiske anbefalinger.",
    href: "/beregner/virksomhed",
    icon: <Building2 className="h-6 w-6" />,
    color: "from-indigo-500 to-blue-400",
    tag: "Flagskib",
  },
  {
    title: "Statistik & Dataanalyse",
    description:
      "Analyser salgsdata, KPI'er og finansielle tal: middel, median, spredning, outliers og histogrammer.",
    href: "/beregner/statistik",
    icon: <BarChart3 className="h-6 w-6" />,
    color: "from-slate-500 to-gray-400",
  },
  {
    title: "Investeringsberegner",
    description: "Beregn afkast på kapitalopsparing i virksomheden eller reinvesteringer.",
    href: "/beregner/investering",
    icon: <TrendingUp className="h-6 w-6" />,
    color: "from-purple-500 to-pink-400",
  },
  {
    title: "Risikoberegner",
    description: "Vurder finansiel risiko på virksomhedens portefølje eller overskudskapital.",
    href: "/beregner/risiko",
    icon: <Shield className="h-6 w-6" />,
    color: "from-sky-500 to-blue-400",
  },
  {
    title: "Lånberegner",
    description: "Analyser erhvervslån, kassekredit eller finansiering af investering.",
    href: "/beregner/laan",
    icon: <Calculator className="h-6 w-6" />,
    color: "from-blue-500 to-cyan-400",
  },
  {
    title: "Afbetalingsplan",
    description: "Strategi for afvikling af virksomhedsgæld og cash-flow-optimering.",
    href: "/beregner/afbetalingsplan",
    icon: <Target className="h-6 w-6" />,
    color: "from-fuchsia-500 to-pink-400",
  },
]

export default function VirksomhedPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-block mb-3 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          Til iværksættere og virksomheder
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
          Værktøjer til din virksomhed
        </h1>
        <p className="text-lg text-muted-foreground">
          Få et skarpt overblik over nøgletal, rentabilitet, likviditet og risiko. Alle analyser
          afsluttes med en konkret AI-anbefaling baseret på dine tal.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group block focus:outline-none">
            <Card className="h-full transition-all group-hover:shadow-lg group-hover:-translate-y-0.5">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-white mb-3`}
                  >
                    {tool.icon}
                  </div>
                  {tool.tag && (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {tool.tag}
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  Åbn værktøj
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-14 text-center bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-3">Leder du efter privatøkonomi?</h2>
        <p className="text-muted-foreground mb-5 max-w-xl mx-auto">
          Alle vores personlige økonomiværktøjer er samlet under Privat.
        </p>
        <Button asChild size="lg" variant="outline">
          <Link href="/privat">
            Gå til privatøkonomi
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
