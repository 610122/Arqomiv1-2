"use client"

import { useState } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Calculator,
  LineChart,
  PiggyBank,
  BarChart3,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Info,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Home,
} from "lucide-react"

export default function GuidesPage() {
  const [activeTab, setActiveTab] = useState("investering")

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        {/* Tilbage til forsiden knap */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4" />
              Tilbage til forsiden
            </Button>
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Sådan bruger du ARQOMI's værktøjer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Detaljerede guides til alle vores finansielle værktøjer og hvordan de kan bruges sammen
          </p>
        </div>

        {/* Fokus-artikler */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">Læs vores fokus-artikler</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/guides/foerstegangskoeber" className="group">
              <Card className="h-full transition-all group-hover:shadow-md group-hover:border-blue-300">
                <CardContent className="p-5">
                  <div className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 font-semibold mb-2">
                    Bolig
                  </div>
                  <h3 className="font-bold mb-1">Førstegangskøber-guide</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Udbetaling, realkredit, skat og typiske faldgruber ved dit første boligkøb.
                  </p>
                  <span className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                    Læs artikel <ChevronRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/guides/rentes-rente" className="group">
              <Card className="h-full transition-all group-hover:shadow-md group-hover:border-purple-300">
                <CardContent className="p-5">
                  <div className="text-xs uppercase tracking-wide text-purple-600 dark:text-purple-400 font-semibold mb-2">
                    Investering
                  </div>
                  <h3 className="font-bold mb-1">Rentes rente forklaret</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Hvorfor tid er vigtigere end beløb — med konkrete danske tal.
                  </p>
                  <span className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400">
                    Læs artikel <ChevronRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/guides/gaeldfri" className="group">
              <Card className="h-full transition-all group-hover:shadow-md group-hover:border-rose-300">
                <CardContent className="p-5">
                  <div className="text-xs uppercase tracking-wide text-rose-600 dark:text-rose-400 font-semibold mb-2">
                    Gæld
                  </div>
                  <h3 className="font-bold mb-1">Bliv gældfri</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Avalanche vs. snowball — find den metode, der passer til dig.
                  </p>
                  <span className="inline-flex items-center text-sm font-medium text-rose-600 dark:text-rose-400">
                    Læs artikel <ChevronRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="investering" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full mb-8">
            <TabsTrigger value="investering" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              <span className="hidden md:inline">Investering</span>
            </TabsTrigger>
            <TabsTrigger value="laan" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden md:inline">Lån</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              <span className="hidden md:inline">Budget</span>
            </TabsTrigger>
            <TabsTrigger value="risiko" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden md:inline">Risiko</span>
            </TabsTrigger>
            <TabsTrigger value="virksomhed" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden md:inline">Virksomhed</span>
            </TabsTrigger>
            <TabsTrigger value="kombination" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Kombination</span>
            </TabsTrigger>
          </TabsList>

          {/* Investeringsberegner Guide */}
          <TabsContent value="investering">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <LineChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Investeringsberegneren</CardTitle>
                    <CardDescription>
                      Beregn potentielle afkast og sammenlign forskellige investeringsstrategier
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Sådan kommer du i gang</h3>

                  <div className="grid gap-4">
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Indtast startkapital</h4>
                        <p className="text-muted-foreground">
                          Indtast det beløb, du ønsker at investere fra start. Dette kan være alt fra 100 kr. til flere
                          millioner.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Vælg månedligt indskud</h4>
                        <p className="text-muted-foreground">
                          Angiv hvor meget du ønsker at investere hver måned. Regelmæssige indskud kan have en betydelig
                          effekt på dit afkast over tid.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Indstil tidshorisont</h4>
                        <p className="text-muted-foreground">
                          Vælg hvor mange år du planlægger at investere. Længere tidshorisonter giver typisk bedre
                          mulighed for at udnytte renters rente-effekten.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Angiv forventet årligt afkast</h4>
                        <p className="text-muted-foreground">
                          Indtast dit forventede årlige afkast i procent. Du kan bruge historiske gennemsnit eller
                          justere baseret på din risikoprofil.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">5</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Gennemgå resultater</h4>
                        <p className="text-muted-foreground">
                          Analyser de detaljerede resultater, der viser din potentielle formue over tid, opdelt i
                          indskud og afkast. Grafen viser udviklingen visuelt.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tips">
                    <AccordionTrigger>Tips til investeringsberegneren</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>
                          Prøv forskellige scenarier med varierende afkastprocenter for at se effekten af forskellige
                          risikoprofiler.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>
                          Sammenlign effekten af at øge dine månedlige indskud versus at starte med en større
                          startkapital.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>
                          Brug "Avancerede indstillinger" til at inkludere inflation og omkostninger for et mere
                          realistisk billede.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>
                          Eksportér dine resultater til PDF eller Excel for at gemme eller dele dem med din finansielle
                          rådgiver.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="advanced">
                    <AccordionTrigger>Avancerede funktioner</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Skatteberegning:</strong> Aktivér denne funktion for at se effekten af forskellige
                          skattemodeller på dit afkast.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Porteføljesammensætning:</strong> Definer din egen portefølje med forskellige
                          aktivklasser og deres forventede afkast.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Monte Carlo-simulation:</strong> Kør tusindvis af scenarier for at se
                          sandsynlighedsfordelingen af mulige udfald.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Pensionsplanlægning:</strong> Inkluder pensionsopsparing og se hvordan det påvirker
                          din samlede formue ved pensionsalderen.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setActiveTab("kombination")}>
                    Se hvordan værktøjerne kan kombineres
                  </Button>
                  <Button onClick={() => window.open("/beregner/investering", "_blank")}>
                    Prøv investeringsberegneren
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Låneberegner Guide */}
          <TabsContent value="laan">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Låneberegneren</CardTitle>
                    <CardDescription>Beregn låneomkostninger og sammenlign forskellige lånemuligheder</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Sådan kommer du i gang</h3>

                  <div className="grid gap-4">
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Vælg lånetype</h4>
                        <p className="text-muted-foreground">
                          Start med at vælge den type lån, du er interesseret i: boliglån, billån, forbrugslån eller
                          andet.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Indtast lånebeløb</h4>
                        <p className="text-muted-foreground">
                          Angiv det beløb, du ønsker at låne. For boliglån kan du også angive boligens værdi for at
                          beregne belåningsgraden.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Angiv løbetid</h4>
                        <p className="text-muted-foreground">
                          Vælg hvor mange år lånet skal løbe over. Længere løbetid giver lavere månedlige ydelser, men
                          højere samlede renteomkostninger.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Indtast rente og omkostninger</h4>
                        <p className="text-muted-foreground">
                          Angiv den årlige rente og eventuelle etableringsomkostninger. Du kan også vælge mellem fast og
                          variabel rente.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">5</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Gennemgå resultater</h4>
                        <p className="text-muted-foreground">
                          Se din månedlige ydelse, samlede renteomkostninger og en detaljeret afdragsprofil. Du kan også
                          sammenligne forskellige lånetyper side om side.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tips">
                    <AccordionTrigger>Tips til låneberegneren</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>
                          Sammenlign forskellige lånetyper (f.eks. fastforrentet vs. variabelt forrentet) for at se
                          forskellen i ydelser og total omkostning.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>
                          Prøv at justere løbetiden for at se, hvordan det påvirker både månedlige ydelser og samlede
                          renteomkostninger.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>
                          Brug "Ekstra afdrag"-funktionen til at se, hvordan ekstraordinære afdrag kan forkorte
                          løbetiden og spare renteomkostninger.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>
                          Eksportér låneberegningen til PDF for at dele den med din bank eller finansielle rådgiver.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="advanced">
                    <AccordionTrigger>Avancerede funktioner</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Rentesimulation:</strong> Se hvordan potentielle renteændringer kan påvirke dit lån
                          over tid.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Låneomlægning:</strong> Beregn om det kan betale sig at omlægge eksisterende lån
                          baseret på aktuelle renter.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Skattefradrag:</strong> Inkluder effekten af rentefradrag i dine beregninger for et
                          mere præcist billede af de reelle omkostninger.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Afdragsfrihed:</strong> Simuler effekten af afdragsfrie perioder på dit lån og se,
                          hvordan det påvirker den samlede økonomi.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setActiveTab("kombination")}>
                    Se hvordan værktøjerne kan kombineres
                  </Button>
                  <Button onClick={() => window.open("/beregner/laan", "_blank")}>
                    Prøv låneberegneren
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Guide */}
          <TabsContent value="budget">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <PiggyBank className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Budgetplanlæggeren</CardTitle>
                    <CardDescription>Få overblik over din økonomi og optimer dine udgifter</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Sådan kommer du i gang</h3>

                  <div className="grid gap-4">
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Indtast dine indtægter</h4>
                        <p className="text-muted-foreground">
                          Start med at registrere alle dine indtægtskilder, såsom løn, SU, pension eller andre
                          indkomster.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Tilføj faste udgifter</h4>
                        <p className="text-muted-foreground">
                          Registrer alle dine faste månedlige udgifter som husleje, forsikringer, abonnementer og lån.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Tilføj variable udgifter</h4>
                        <p className="text-muted-foreground">
                          Registrer dine variable udgifter som mad, transport, underholdning og shopping. Du kan enten
                          indtaste faktiske beløb eller sætte budgetmål.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Sæt opsparingsmål</h4>
                        <p className="text-muted-foreground">
                          Definer dine opsparingsmål, hvad enten det er til nødopsparing, bolig, rejser eller pension.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">5</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Analyser dit budget</h4>
                        <p className="text-muted-foreground">
                          Gennemgå de detaljerede visualiseringer og rapporter, der viser din økonomiske situation.
                          Identificer områder, hvor du kan spare eller optimere.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tips">
                    <AccordionTrigger>Tips til budgetplanlæggeren</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>Brug kategorier konsekvent for at få det mest præcise overblik over dine udgiftsmønstre.</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>Opdater dit budget regelmæssigt for at holde det relevant og præcist.</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>
                          Brug "50/30/20"-reglen som udgangspunkt: 50% til nødvendigheder, 30% til ønsker og 20% til
                          opsparing.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>
                          Eksportér dit budget til Excel eller PDF for at dele det med din partner eller finansielle
                          rådgiver.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="advanced">
                    <AccordionTrigger>Avancerede funktioner</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Automatisk kategorisering:</strong> Upload dine kontoudtog, og systemet vil automatisk
                          kategorisere dine udgifter.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Udgiftstrends:</strong> Se hvordan dine udgifter udvikler sig over tid med detaljerede
                          grafer og analyser.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Besparelsesforslag:</strong> Få personlige anbefalinger til, hvor du kan spare penge
                          baseret på dine forbrugsmønstre.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Delt budget:</strong> Inviter din partner eller familiemedlemmer til at samarbejde om
                          et fælles budget.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setActiveTab("kombination")}>
                    Se hvordan værktøjerne kan kombineres
                  </Button>
                  <Button onClick={() => window.open("/beregner/budget", "_blank")}>
                    Prøv budgetplanlæggeren
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risikoberegner Guide */}
          <TabsContent value="risiko">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Risikoberegneren</CardTitle>
                    <CardDescription>Vurdér og forstå risikoen ved dine investeringer</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Sådan kommer du i gang</h3>

                  <div className="grid gap-4">
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Besvar risikoprofil-spørgeskemaet</h4>
                        <p className="text-muted-foreground">
                          Start med at besvare spørgsmål om din investeringshorisont, erfaring, mål og tolerance over
                          for tab.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Indtast din portefølje</h4>
                        <p className="text-muted-foreground">
                          Tilføj dine nuværende investeringer eller de investeringer, du overvejer. Du kan vælge mellem
                          aktier, obligationer, fonde og andre aktivklasser.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Gennemgå risikoanalysen</h4>
                        <p className="text-muted-foreground">
                          Se en detaljeret analyse af din porteføljes risiko, herunder volatilitet, Value at Risk (VaR)
                          og maksimalt historisk tab.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Forstå diversificeringseffekten</h4>
                        <p className="text-muted-foreground">
                          Se hvordan dine investeringer korrelerer med hinanden, og hvordan diversificering påvirker din
                          samlede risiko.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">5</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Få anbefalinger</h4>
                        <p className="text-muted-foreground">
                          Modtag personlige anbefalinger til, hvordan du kan optimere din portefølje for at opnå et
                          bedre forhold mellem risiko og afkast.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tips">
                    <AccordionTrigger>Tips til risikoberegneren</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>
                          Vær ærlig, når du besvarer risikoprofil-spørgeskemaet for at få de mest præcise anbefalinger.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>
                          Brug "Stress test"-funktionen til at se, hvordan din portefølje ville klare sig under
                          forskellige markedsscenarier.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>
                          Sammenlign din portefølje med forskellige benchmark-indeks for at se, hvordan du klarer dig i
                          forhold til markedet.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>
                          Genbesøg din risikoprofil regelmæssigt, da din risikotolerance kan ændre sig med tiden og
                          livsomstændigheder.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="advanced">
                    <AccordionTrigger>Avancerede funktioner</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Monte Carlo-simulationer:</strong> Kør tusindvis af scenarier for at se
                          sandsynlighedsfordelingen af mulige udfald.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Faktoranalyse:</strong> Se hvordan din portefølje er eksponeret mod forskellige
                          risikofaktorer som vækst, værdi, momentum osv.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Efficient Frontier:</strong> Visualiser den optimale porteføljesammensætning baseret
                          på moderne porteføljeteori.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Tail Risk Analysis:</strong> Få en dybere forståelse af ekstreme hændelsers
                          potentielle påvirkning på din portefølje.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setActiveTab("kombination")}>
                    Se hvordan værktøjerne kan kombineres
                  </Button>
                  <Button onClick={() => window.open("/beregner/risiko", "_blank")}>
                    Prøv risikoberegneren
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Virksomhedsrådgivning Guide */}
          <TabsContent value="virksomhed">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Virksomhedsrådgivning</CardTitle>
                    <CardDescription>Få indsigt i din virksomheds finansielle sundhed og potentiale</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Sådan kommer du i gang</h3>

                  <div className="grid gap-4">
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Upload regnskabsdata</h4>
                        <p className="text-muted-foreground">
                          Start med at uploade din virksomheds regnskabsdata. Du kan enten uploade en fil eller indtaste
                          tallene manuelt.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Vælg branche og størrelse</h4>
                        <p className="text-muted-foreground">
                          Angiv din virksomheds branche og størrelse for at få relevante sammenligninger og benchmarks.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Gennemgå nøgletal</h4>
                        <p className="text-muted-foreground">
                          Se en detaljeret analyse af din virksomheds nøgletal, herunder likviditet, soliditet,
                          rentabilitet og aktivernes omsætningshastighed.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Sammenlign med branchen</h4>
                        <p className="text-muted-foreground">
                          Se hvordan din virksomhed klarer sig i forhold til branchegennemsnittet og de bedste i
                          branchen.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="font-medium text-blue-600 dark:text-blue-400">5</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Få anbefalinger</h4>
                        <p className="text-muted-foreground">
                          Modtag konkrete anbefalinger til, hvordan du kan forbedre din virksomheds finansielle sundhed
                          og vækstpotentiale.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tips">
                    <AccordionTrigger>Tips til virksomhedsrådgivningen</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>Upload data fra flere år for at se udviklingen i din virksomheds nøgletal over tid.</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>
                          Brug "What-if"-analysen til at se, hvordan forskellige scenarier kan påvirke din virksomheds
                          økonomi.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>
                          Del rapporten med din revisor eller bestyrelse for at få yderligere indsigt og diskussion.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <p>Sæt konkrete mål for forbedring af nøgletal og følg udviklingen over tid.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="advanced">
                    <AccordionTrigger>Avancerede funktioner</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Likviditetsbudget:</strong> Opret og følg et detaljeret likviditetsbudget for din
                          virksomhed.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Værdiansættelse:</strong> Få en estimeret værdiansættelse af din virksomhed baseret på
                          forskellige metoder.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Vækstanalyse:</strong> Identificer vækstdrivere og potentielle flaskehalse i din
                          virksomhed.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Konkurrentanalyse:</strong> Sammenlign din virksomhed med specifikke konkurrenter
                          baseret på offentligt tilgængelige data.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setActiveTab("kombination")}>
                    Se hvordan værktøjerne kan kombineres
                  </Button>
                  <Button onClick={() => window.open("/beregner/virksomhed", "_blank")}>
                    Prøv virksomhedsrådgivningen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kombination af værktøjer */}
          <TabsContent value="kombination">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Kombination af værktøjer</CardTitle>
                    <CardDescription>
                      Sådan kan du bruge værktøjerne sammen for at opnå de bedste resultater
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Effektive kombinationer af værktøjer</h3>

                  <div className="grid gap-6">
                    <div className="border rounded-lg p-6 bg-blue-50/50 dark:bg-blue-900/10">
                      <h4 className="text-lg font-medium mb-3">Budget + Investering</h4>
                      <p className="mb-4 text-muted-foreground">
                        Ved at kombinere budgetplanlæggeren med investeringsberegneren kan du identificere, hvor meget
                        du kan spare op hver måned, og derefter se, hvordan disse opsparinger kan vokse over tid gennem
                        investeringer.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <span className="font-medium text-blue-600 dark:text-blue-400">1</span>
                          </div>
                          <ChevronRight className="h-5 w-5 mx-2 text-muted-foreground" />
                          <p>
                            <strong>Brug budgetplanlæggeren</strong> til at identificere potentielle besparelser
                          </p>
                        </div>

                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <span className="font-medium text-blue-600 dark:text-blue-400">2</span>
                          </div>
                          <ChevronRight className="h-5 w-5 mx-2 text-muted-foreground" />
                          <p>
                            <strong>Overfør det månedlige opsparingsbeløb</strong> til investeringsberegneren
                          </p>
                        </div>

                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <span className="font-medium text-blue-600 dark:text-blue-400">3</span>
                          </div>
                          <ChevronRight className="h-5 w-5 mx-2 text-muted-foreground" />
                          <p>
                            <strong>Se hvordan dine besparelser kan vokse</strong> over tid gennem forskellige
                            investeringsstrategier
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-6 bg-blue-50/50 dark:bg-blue-900/10">
                      <h4 className="text-lg font-medium mb-3">Lån + Budget</h4>
                      <p className="mb-4 text-muted-foreground">
                        Kombinér låneberegneren med budgetplanlæggeren for at se, hvordan forskellige låneydelser
                        påvirker dit månedlige budget, og find den optimale låneløsning, der passer til din økonomi.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <span className="font-medium text-blue-600 dark:text-blue-400">1</span>
                          </div>
                          <ChevronRight className="h-5 w-5 mx-2 text-muted-foreground" />
                          <p>
                            <strong>Brug låneberegneren</strong> til at beregne månedlige ydelser for forskellige
                            lånemuligheder
                          </p>
                        </div>

                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <span className="font-medium text-blue-600 dark:text-blue-400">2</span>
                          </div>
                          <ChevronRight className="h-5 w-5 mx-2 text-muted-foreground" />
                          <p>
                            <strong>Overfør låneydelsen</strong> til budgetplanlæggeren som en fast udgift
                          </p>
                        </div>

                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <span className="font-medium text-blue-600 dark:text-blue-400">3</span>
                          </div>
                          <ChevronRight className="h-5 w-5 mx-2 text-muted-foreground" />
                          <p>
                            <strong>Analysér</strong> hvordan forskellige låneydelser påvirker dit rådighedsbeløb og
                            opsparingsmuligheder
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-6 bg-blue-50/50 dark:bg-blue-900/10">
                      <h4 className="text-lg font-medium mb-3">Investering + Risiko</h4>
                      <p className="mb-4 text-muted-foreground">
                        Ved at kombinere investeringsberegneren med risikoberegneren kan du skabe en
                        investeringsstrategi, der både giver det ønskede afkast og passer til din risikoprofil.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <span className="font-medium text-blue-600 dark:text-blue-400">1</span>
                          </div>
                          <ChevronRight className="h-5 w-5 mx-2 text-muted-foreground" />
                          <p>
                            <strong>Brug risikoberegneren</strong> til at fastlægge din risikoprofil og optimale
                            aktivallokering
                          </p>
                        </div>

                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <span className="font-medium text-blue-600 dark:text-blue-400">2</span>
                          </div>
                          <ChevronRight className="h-5 w-5 mx-2 text-muted-foreground" />
                          <p>
                            <strong>Overfør den anbefalede aktivallokering</strong> til investeringsberegneren
                          </p>
                        </div>

                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <span className="font-medium text-blue-600 dark:text-blue-400">3</span>
                          </div>
                          <ChevronRight className="h-5 w-5 mx-2 text-muted-foreground" />
                          <p>
                            <strong>Beregn det forventede afkast</strong> baseret på din risikojusterede portefølje
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-6 bg-blue-50/50 dark:bg-blue-900/10">
                      <h4 className="text-lg font-medium mb-3">Virksomhed + Risiko</h4>
                      <p className="mb-4 text-muted-foreground">
                        Kombiner virksomhedsrådgivningen med risikoberegneren for at få et helhedsbillede af din
                        virksomheds finansielle sundhed og risikoprofil.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <span className="font-medium text-blue-600 dark:text-blue-400">1</span>
                          </div>
                          <ChevronRight className="h-5 w-5 mx-2 text-muted-foreground" />
                          <p>
                            <strong>Brug virksomhedsrådgivningen</strong> til at analysere din virksomheds nøgletal og
                            identificere potentielle risici
                          </p>
                        </div>

                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <span className="font-medium text-blue-600 dark:text-blue-400">2</span>
                          </div>
                          <ChevronRight className="h-5 w-5 mx-2 text-muted-foreground" />
                          <p>
                            <strong>Overfør de identificerede risici</strong> til risikoberegneren
                          </p>
                        </div>

                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <span className="font-medium text-blue-600 dark:text-blue-400">3</span>
                          </div>
                          <ChevronRight className="h-5 w-5 mx-2 text-muted-foreground" />
                          <p>
                            <strong>Beregn den samlede risiko</strong> for din virksomhed og identificer strategier til
                            at reducere den
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setActiveTab("investering")}>
                    Gå til investeringsberegneren
                  </Button>
                  <Button onClick={() => setActiveTab("budget")}>Gå til budgetplanlæggeren</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
