import type { Metadata } from "next"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Calculator,
  Home,
  PiggyBank,
  LineChart,
  Wallet,
  CreditCard,
  BarChart3,
  Building2,
  User,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Alle beregnere · Arqomi",
  description:
    "Se alle Arqomi's gratis danske finansielle beregnere samlet ét sted — eller vælg sektion efter Privat eller Virksomhed.",
}

export default function BeregnerPage() {
  const beregnere = [
    {
      title: "Låneberegner",
      description: "Beregn månedlig ydelse, ÅOP og samlet omkostning for dit lån",
      icon: <Home className="h-8 w-8 text-blue-500" />,
      href: "/beregner/laan",
    },
    {
      title: "Investeringsberegner",
      description: "Beregn afkast på dine investeringer over tid",
      icon: <LineChart className="h-8 w-8 text-blue-500" />,
      href: "/beregner/investering",
    },
    {
      title: "Risikoberegner",
      description: "Vurder risiko, Sharpe-ratio og VaR på din portefølje",
      icon: <PiggyBank className="h-8 w-8 text-blue-500" />,
      href: "/beregner/risiko",
    },
    {
      title: "Opsparingsstrategi",
      description: "Planlæg din opsparing og nå dine økonomiske mål",
      icon: <Wallet className="h-8 w-8 text-blue-500" />,
      href: "/beregner/opsparing",
    },
    {
      title: "Budgetplanlægger",
      description: "Opret dit personlige budget og få overblik over din økonomi",
      icon: <Calculator className="h-8 w-8 text-blue-500" />,
      href: "/beregner/budget",
    },
    {
      title: "Lønberegner",
      description: "Beregn nettoløn med AM-bidrag, skat, pension og fradrag",
      icon: <Calculator className="h-8 w-8 text-blue-500" />,
      href: "/beregner/loen",
    },
    {
      title: "Gældsberegner",
      description: "Saml din gæld og få overblik over DTI og renteomkostninger",
      icon: <CreditCard className="h-8 w-8 text-blue-500" />,
      href: "/beregner/gaeld",
    },
    {
      title: "Afbetalingsplan",
      description: "Lav en konkret plan for at blive gældfri",
      icon: <CreditCard className="h-8 w-8 text-blue-500" />,
      href: "/beregner/afbetalingsplan",
    },
    {
      title: "Statistik & Økonomi",
      description: "Analyser egne data: middel, median, spredning og outliers",
      icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
      href: "/beregner/statistik",
    },
    {
      title: "Virksomhedsrådgiver",
      description: "Få overblik over din virksomheds økonomi og nøgletal",
      icon: <Building2 className="h-8 w-8 text-blue-500" />,
      href: "/beregner/virksomhed",
    },
  ]

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Alle beregnere
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Alle Arqomi's værktøjer samlet ét sted. Foretrækker du at vælge efter, om det er til
          dig privat eller din virksomhed?
        </p>
      </div>

      {/* Privat / Virksomhed genvej */}
      <div className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto mb-10">
        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-cyan-500 py-6 text-base"
        >
          <Link href="/privat">
            <span className="flex items-center justify-center gap-2">
              <User className="h-5 w-5" /> Gå til privatøkonomi
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-indigo-600 to-blue-500 py-6 text-base"
        >
          <Link href="/virksomhed">
            <span className="flex items-center justify-center gap-2">
              <Building2 className="h-5 w-5" /> Gå til virksomhedsværktøjer
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {beregnere.map((beregner) => (
          <Link href={beregner.href} key={beregner.title} className="block group">
            <Card className="h-full transition-all group-hover:shadow-md group-hover:border-blue-200 dark:group-hover:border-blue-800">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">{beregner.icon}</div>
                <CardTitle className="mt-4">{beregner.title}</CardTitle>
                <CardDescription>{beregner.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2" />
              <CardFooter>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                  Åbn beregner
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
