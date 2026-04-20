import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  Calculator,
  TrendingUp,
  PieChart,
  User,
  Building2,
  Sparkles,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Arqomi · Gratis danske finansielle beregnere med AI-anbefaling",
  description:
    "Gratis danske finansielle værktøjer til privatøkonomi og virksomhed. Lån, investering, opsparing, budget, risiko og meget mere — med personlig AI-anbefaling baseret på dine tal.",
  openGraph: {
    title: "Arqomi · Gratis danske finansielle beregnere",
    description:
      "Danske beregnere til privat og virksomhed med personlig AI-anbefaling. Helt gratis og uden login.",
    type: "website",
  },
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Simpel menu */}
      <nav className="absolute top-0 left-0 right-0 z-30 bg-transparent">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-white text-xl font-bold">
                ARQOMI
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/privat" className="text-white hover:text-yellow-300 transition-colors">
                  Privat
                </Link>
                <Link
                  href="/virksomhed"
                  className="text-white hover:text-yellow-300 transition-colors"
                >
                  Virksomhed
                </Link>
                <Link href="/guides" className="text-white hover:text-yellow-300 transition-colors">
                  Guides
                </Link>
                <Link href="/ordbog" className="text-white hover:text-yellow-300 transition-colors">
                  Ordbog
                </Link>
                <Link href="/support" className="text-white hover:text-yellow-300 transition-colors">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero-sektion */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 min-h-screen flex flex-col justify-center">
        <div className="absolute inset-0 z-0 opacity-10">
          <Image src="/images/tech-pattern.png" alt="Tech Pattern Background" fill className="object-cover" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-2">Arqomi</h2>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
              Din økonomiske <span className="text-yellow-400">fremtid</span> starter her
            </h1>

            <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-2xl mx-auto">
              Gratis danske beregnere til privat og virksomhed — med personlig AI-anbefaling
              baseret på dine tal.
            </p>

            {/* To store CTA-knapper: Privat + Virksomhed */}
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
              <Button
                asChild
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-7 text-lg rounded-xl shadow-xl"
              >
                <Link href="/privat">
                  <span className="flex items-center justify-center gap-3">
                    <User className="h-6 w-6" />
                    Jeg er privat
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-white hover:bg-gray-100 text-indigo-900 px-8 py-7 text-lg rounded-xl shadow-xl"
              >
                <Link href="/virksomhed">
                  <span className="flex items-center justify-center gap-3">
                    <Building2 className="h-6 w-6" />
                    Jeg har virksomhed
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </Link>
              </Button>
            </div>

            {/* Trust-indikatorer */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-12 mt-8">
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 p-2 rounded-full">
                  <Check className="h-5 w-5 text-green-400" />
                </div>
                <span className="text-gray-100">Helt gratis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 p-2 rounded-full">
                  <Check className="h-5 w-5 text-green-400" />
                </div>
                <span className="text-gray-100">Ingen login</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 p-2 rounded-full">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                </div>
                <span className="text-gray-100">AI-anbefaling på dine tal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Svævende ikoner */}
        <div className="absolute bottom-10 left-10 md:left-20 z-10 opacity-70">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl rotate-12 shadow-lg">
            <Calculator className="h-12 w-12 text-white" />
          </div>
        </div>

        <div className="absolute top-1/4 right-10 md:right-20 z-10 opacity-70">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl -rotate-12 shadow-lg">
            <PieChart className="h-12 w-12 text-white" />
          </div>
        </div>

        <div className="absolute bottom-1/3 right-1/4 z-10 opacity-70">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl rotate-6 shadow-lg">
            <TrendingUp className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Scroll-indikator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="flex flex-col items-center">
            <span className="text-white text-sm mb-2">Scroll ned</span>
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-2 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Privat vs Virksomhed sektion */}
      <div className="bg-white dark:bg-gray-950 py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              Vælg hvad der passer til dig
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-500 dark:text-gray-400">
              Vi har delt værktøjerne op i to klare sektioner, så du hurtigt finder det, du har
              brug for — uanset om det er til din privatøkonomi eller din virksomhed.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {/* Privat kort */}
            <Card className="overflow-hidden hover:shadow-xl transition-all border-2 hover:border-blue-400">
              <div className="h-32 bg-gradient-to-br from-blue-500 to-cyan-400 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <User className="h-16 w-16 text-white" />
                </div>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-3">Privatøkonomi</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-5">
                  9 beregnere til lån, investering, opsparing, budget, løn, gæld, afbetalingsplan,
                  risiko og statistik. Få personlig AI-anbefaling på dine tal.
                </p>
                <ul className="space-y-2 mb-6 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Beregn månedsydelse, ÅOP og DTI på dine lån</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Se rentes rente og pensionsfremskrivning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Budget efter 50/30/20 og nettoløn</span>
                  </li>
                </ul>
                <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 py-6 text-base">
                  <Link href="/privat">
                    <span className="flex items-center justify-center gap-2">
                      Se private værktøjer <ArrowRight className="h-5 w-5" />
                    </span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Virksomhed kort */}
            <Card className="overflow-hidden hover:shadow-xl transition-all border-2 hover:border-indigo-400">
              <div className="h-32 bg-gradient-to-br from-indigo-500 to-blue-500 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-white" />
                </div>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-3">Virksomhedsøkonomi</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-5">
                  Værktøjer til iværksættere og SMV: nøgletal, margin, runway, dataanalyse,
                  erhvervslån og strategisk AI-rådgivning.
                </p>
                <ul className="space-y-2 mb-6 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Fuld virksomhedsanalyse med benchmarks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>KPI'er og statistik på salgsdata</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Cash-flow, erhvervslån og afbetalingsplan</span>
                  </li>
                </ul>
                <Button asChild className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 py-6 text-base">
                  <Link href="/virksomhed">
                    <span className="flex items-center justify-center gap-2">
                      Se virksomhedsværktøjer <ArrowRight className="h-5 w-5" />
                    </span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Populære beregnere */}
      <div className="bg-gray-50 dark:bg-gray-900 py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              Populære beregnere
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-500 dark:text-gray-400">
              De mest brugte værktøjer — klik og start uden login.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="overflow-hidden hover:shadow-lg transition-all border-0 shadow">
              <div className="h-40 bg-gradient-to-r from-blue-500 to-cyan-400 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calculator className="h-16 w-16 text-white" />
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Låneberegner</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Beregn dine månedlige afdrag, renter og den samlede omkostning ved forskellige lån.
                </p>
                <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-cyan-500">
                  <Link href="/beregner/laan">Åbn beregner</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-all border-0 shadow">
              <div className="h-40 bg-gradient-to-r from-purple-500 to-pink-400 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <TrendingUp className="h-16 w-16 text-white" />
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Investeringsberegner</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Beregn potentielle afkast på dine investeringer over tid med forskellige scenarier.
                </p>
                <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-pink-500">
                  <Link href="/beregner/investering">Åbn beregner</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-all border-0 shadow">
              <div className="h-40 bg-gradient-to-r from-amber-500 to-orange-400 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <PieChart className="h-16 w-16 text-white" />
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Budgetplanlægger</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Opret og administrer dit budget med vores intuitive værktøj og få overblik over din økonomi.
                </p>
                <Button asChild className="w-full bg-gradient-to-r from-amber-600 to-orange-500">
                  <Link href="/beregner/budget">Åbn beregner</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-14">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-6 text-lg rounded-xl shadow-lg"
            >
              <Link href="/privat">
                <span className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Se alle private beregnere
                </span>
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-8 py-6 text-lg rounded-xl shadow-lg"
            >
              <Link href="/virksomhed">
                <span className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Se alle virksomhedsværktøjer
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Nederste CTA */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
              Klar til at optimere din finansielle fremtid?
            </h2>
            <p className="mx-auto max-w-xl text-lg text-gray-100 mb-8">
              Alle vores værktøjer er helt gratis og kræver ingen oprettelse. Vælg Privat eller
              Virksomhed og kom i gang på få sekunder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Link href="/privat">
                  <span className="flex items-center gap-2">
                    <User className="h-5 w-5" /> Start som privat
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white hover:bg-gray-100 text-indigo-900">
                <Link href="/virksomhed">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" /> Start som virksomhed
                  </span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link href="/guides">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" /> Læs guides
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
