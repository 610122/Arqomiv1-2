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
    <div className="relative min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-lg font-semibold text-foreground">
              ARQOMI
            </Link>
            <div className="hidden md:flex gap-8">
              <Link href="/privat" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privat
              </Link>
              <Link href="/virksomhed" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Virksomhed
              </Link>
              <Link href="/guides" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Guides
              </Link>
              <Link href="/ordbog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Ordbog
              </Link>
              <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-pretty">
                Din økonomiske fremtid starter her
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Gratis danske beregnere til privat og virksomhed — med personlig AI-anbefaling baseret på dine tal.
              </p>
            </div>

            {/* Primary CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <Link href="/privat">
                  <span className="flex items-center justify-center gap-2">
                    <User className="h-5 w-5" />
                    Jeg er privat
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary/5 px-8 py-6 text-base rounded-lg transition-all"
              >
                <Link href="/virksomhed">
                  <span className="flex items-center justify-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Jeg har virksomhed
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 md:gap-12 pt-8">
              <div className="flex items-center justify-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">Helt gratis</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">Ingen login</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">AI-anbefaling på dine tal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privat vs Virksomhed Section */}
      <div className="border-t border-border py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Vælg hvad der passer til dig
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Vi har delt værktøjerne op i to klare sektioner, så du hurtigt finder det, du har brug for — uanset om det er til din privatøkonomi eller din virksomhed.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Privat Card */}
              <Card className="overflow-hidden border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <div className="h-1 bg-primary" />
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Privatøkonomi</h3>
                  </div>
                  <p className="text-foreground/80 leading-relaxed">
                    9 berechnere til lån, investering, opsparing, budget, løn, gæld, afbetalingsplan, risiko og statistik. Få personlig AI-anbefaling på dine tal.
                  </p>
                  <ul className="space-y-3 pt-2">
                    <li className="flex gap-2 text-sm text-foreground/80">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Beregn månedsydelse, ÅOP og DTI på dine lån</span>
                    </li>
                    <li className="flex gap-2 text-sm text-foreground/80">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Se rentes rente og pensionsfremskrivning</span>
                    </li>
                    <li className="flex gap-2 text-sm text-foreground/80">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Budget efter 50/30/20 og nettoløn</span>
                    </li>
                  </ul>
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-6">
                    <Link href="/privat">
                      Se private værktøjer
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Virksomhed Card */}
              <Card className="overflow-hidden border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <div className="h-1 bg-secondary" />
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-secondary/10 rounded-lg">
                      <Building2 className="h-6 w-6 text-secondary" />
                    </div>
                    <h3 className="text-2xl font-bold">Virksomhedsøkonomi</h3>
                  </div>
                  <p className="text-foreground/80 leading-relaxed">
                    Værktøjer til iværksættere og SMV: nøgletal, margin, runway, dataanalyse, erhvervslån og strategisk AI-rådgivning.
                  </p>
                  <ul className="space-y-3 pt-2">
                    <li className="flex gap-2 text-sm text-foreground/80">
                      <Check className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                      <span>Fuld virksomhedsanalyse med benchmarks</span>
                    </li>
                    <li className="flex gap-2 text-sm text-foreground/80">
                      <Check className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                      <span>KPI'er og statistik på salgsdata</span>
                    </li>
                    <li className="flex gap-2 text-sm text-foreground/80">
                      <Check className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                      <span>Cash-flow, erhvervslån og afbetalingsplan</span>
                    </li>
                  </ul>
                  <Button asChild className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground mt-6">
                    <Link href="/virksomhed">
                      Se virksomhedsværktøjer
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Calculators Section */}
      <div className="border-t border-border py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Populære beregnere
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                De mest brugte værktøjer — klik og start uden login.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 pb-8">
              {/* Loan Calculator Card */}
              <Card className="overflow-hidden border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 flex flex-col">
                <div className="p-8 flex-1 space-y-4">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit">
                    <Calculator className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-left">Låneberegner</h3>
                  <p className="text-sm text-muted-foreground text-left leading-relaxed">
                    Beregn dine månedlige afdrag, renter og den samlede omkostning ved forskellige lån.
                  </p>
                </div>
                <CardContent className="p-8 pt-0">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/beregner/laan">Åbn beregner</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Investment Calculator Card */}
              <Card className="overflow-hidden border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 flex flex-col">
                <div className="p-8 flex-1 space-y-4">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-left">Investeringsberegner</h3>
                  <p className="text-sm text-muted-foreground text-left leading-relaxed">
                    Beregn potentielle afkast på dine investeringer over tid med forskellige scenarier.
                  </p>
                </div>
                <CardContent className="p-8 pt-0">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/beregner/investering">Åbn beregner</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Budget Planner Card */}
              <Card className="overflow-hidden border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 flex flex-col">
                <div className="p-8 flex-1 space-y-4">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit">
                    <PieChart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-left">Budgetplanlægger</h3>
                  <p className="text-sm text-muted-foreground text-left leading-relaxed">
                    Opret og administrer dit budget med vores intuitive værktøj og få overblik over din økonomi.
                  </p>
                </div>
                <CardContent className="p-8 pt-0">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/beregner/budget">Åbn beregner</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Secondary CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-lg"
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
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 rounded-lg"
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
      </div>

      {/* Final CTA Section */}
      <div className="border-t border-border bg-primary/5 py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Klar til at optimere din finansielle fremtid?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Alle vores værktøjer er helt gratis og kræver ingen oprettelse. Vælg Privat eller Virksomhed og kom i gang på få sekunder.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-lg">
                <Link href="/privat">
                  <span className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Start som privat
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 rounded-lg">
                <Link href="/virksomhed">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Start som virksomhed
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5 px-8 py-6 rounded-lg">
                <Link href="/guides">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Læs guides
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
}
