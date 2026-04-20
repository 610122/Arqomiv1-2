import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { Mail, Phone, Clock, MessageSquare, FileText, HelpCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "Support - ARQOMI",
  description: "Få hjælp til ARQOMI's finansielle værktøjer og services",
}

export default function SupportPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header - This would normally be a shared component */}
      <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-blue-900 via-blue-700 to-cyan-600 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/arqomi-logo.png" alt="ARQOMI Logo" width={40} height={40} className="rounded-sm" />
              <span className="text-xl font-bold text-white">ARQOMI</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Log ind
            </Button>
            <Button className="bg-white text-blue-700 hover:bg-white/90">Opret konto</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-500 py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Support Center</h1>
            <p className="text-xl text-white/80 mb-8">
              Har du brug for hjælp med vores værktøjer? Vi er her for at hjælpe dig.
            </p>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 max-w-xl mx-auto">
              <h2 className="text-xl font-medium mb-4">Hvordan kan vi hjælpe dig i dag?</h2>
              <div className="grid grid-cols-2 gap-4">
                <Button className="bg-white text-blue-700 hover:bg-white/90 h-auto py-3 flex flex-col">
                  <MessageSquare className="h-5 w-5 mb-1" />
                  <span>Kontakt Support</span>
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 h-auto py-3 flex flex-col"
                >
                  <FileText className="h-5 w-5 mb-1" />
                  <span>Se Dokumentation</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="contact" className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="contact">Kontakt Os</TabsTrigger>
                <TabsTrigger value="faq">Ofte Stillede Spørgsmål</TabsTrigger>
                <TabsTrigger value="tools">Værktøjshjælp</TabsTrigger>
              </TabsList>

              <TabsContent value="contact" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Kontakt Support</CardTitle>
                    <CardDescription>
                      Vores supportteam er klar til at hjælpe dig med eventuelle problemer eller spørgsmål.
                    </CardDescription>
                    <div className="flex justify-end">
                      <Button asChild variant="outline" size="sm" className="gap-1">
                        <Link href="/support/historik">
                          <Clock className="h-4 w-4 mr-1" />
                          Se mine tidligere anmodninger
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                          <Mail className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Email Support</h3>
                        <p className="text-gray-500 mb-4">
                          Send os en email, og vi vender tilbage inden for 24 timer på hverdage.
                        </p>
                        <a
                          href="mailto:aivaekst@arqomi.dk"
                          className="text-blue-600 font-medium hover:underline flex items-center"
                        >
                          aivaekst@arqomi.dk
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </a>
                      </div>

                      <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                          <Phone className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Telefonisk Support</h3>
                        <p className="text-gray-500 mb-4">
                          Ring til os direkte for øjeblikkelig assistance med dine spørgsmål.
                        </p>
                        <a
                          href="tel:+4531311780"
                          className="text-blue-600 font-medium hover:underline flex items-center"
                        >
                          +45 31 31 17 80
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium">Åbningstider</h3>
                          <p className="text-gray-500">Hvornår du kan forvente svar fra os</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="font-medium mb-2">Email Support</h4>
                          <ul className="space-y-1 text-gray-500">
                            <li className="flex justify-between">
                              <span>Mandag - Fredag:</span>
                              <span>09:00 - 17:00</span>
                            </li>
                            <li className="flex justify-between">
                              <span>Weekend & Helligdage:</span>
                              <span>Lukket</span>
                            </li>
                          </ul>
                          <p className="text-sm text-gray-500 mt-2">Svartid: Inden for 24 timer på hverdage</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Telefonisk Support</h4>
                          <ul className="space-y-1 text-gray-500">
                            <li className="flex justify-between">
                              <span>Mandag - Torsdag:</span>
                              <span>10:00 - 16:00</span>
                            </li>
                            <li className="flex justify-between">
                              <span>Fredag:</span>
                              <span>10:00 - 15:00</span>
                            </li>
                            <li className="flex justify-between">
                              <span>Weekend & Helligdage:</span>
                              <span>Lukket</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Rapportér et Problem</CardTitle>
                    <CardDescription>
                      Oplever du fejl eller problemer med et af vores værktøjer? Fortæl os om det, så vi kan hjælpe.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium">
                            Navn
                          </label>
                          <input id="name" className="w-full p-2 border rounded-md" placeholder="Dit navn" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">
                            Email
                          </label>
                          <input
                            id="email"
                            type="email"
                            className="w-full p-2 border rounded-md"
                            placeholder="din@email.dk"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="tool" className="text-sm font-medium">
                          Hvilket værktøj har du problemer med?
                        </label>
                        <select id="tool" className="w-full p-2 border rounded-md">
                          <option value="">Vælg værktøj</option>
                          <option value="investering">Investeringsberegner</option>
                          <option value="laan">Låneberegner</option>
                          <option value="budget">Budgetplanlægger</option>
                          <option value="risiko">Risikoberegner</option>
                          <option value="virksomhed">Virksomhedsrådgivning</option>
                          <option value="raadgiver">Personlig Rådgiver</option>
                          <option value="andet">Andet</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="issue" className="text-sm font-medium">
                          Beskriv problemet
                        </label>
                        <textarea
                          id="issue"
                          className="w-full p-2 border rounded-md min-h-[120px]"
                          placeholder="Fortæl os hvad der skete og hvordan vi kan hjælpe..."
                        ></textarea>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="screenshot" className="text-sm font-medium">
                          Upload screenshot (valgfrit)
                        </label>
                        <input id="screenshot" type="file" className="w-full p-2 border rounded-md" accept="image/*" />
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-gradient-to-r from-blue-700 to-cyan-500 hover:from-blue-800 hover:to-cyan-600">
                      Send Rapport
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="faq" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ofte Stillede Spørgsmål</CardTitle>
                    <CardDescription>
                      Find svar på de mest almindelige spørgsmål om vores værktøjer og services.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>Hvordan nulstiller jeg min adgangskode?</AccordionTrigger>
                        <AccordionContent>
                          Du kan nulstille din adgangskode ved at klikke på "Glemt adgangskode" på login-siden. Du vil
                          modtage en email med instruktioner om, hvordan du opretter en ny adgangskode.
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="item-2">
                        <AccordionTrigger>Hvordan eksporterer jeg mine beregninger?</AccordionTrigger>
                        <AccordionContent>
                          På alle vores beregningsværktøjer finder du en "Eksportér" knap i øverste højre hjørne. Du kan
                          eksportere dine resultater som PDF, Excel eller CSV-fil.
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="item-3">
                        <AccordionTrigger>Er mine data sikre hos ARQOMI?</AccordionTrigger>
                        <AccordionContent>
                          Ja, vi tager datasikkerhed meget alvorligt. Alle data er krypteret både under overførsel og
                          lagring. Vi deler aldrig dine personlige oplysninger med tredjeparter uden dit samtykke.
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="item-4">
                        <AccordionTrigger>Hvordan opdaterer jeg mine kontooplysninger?</AccordionTrigger>
                        <AccordionContent>
                          Du kan opdatere dine kontooplysninger ved at logge ind og gå til "Min Profil" i øverste højre
                          hjørne. Her kan du ændre din email, adgangskode og andre personlige oplysninger.
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="item-5">
                        <AccordionTrigger>Kan jeg bruge ARQOMI på min mobil?</AccordionTrigger>
                        <AccordionContent>
                          Ja, ARQOMI er fuldt responsivt og fungerer på alle enheder, herunder smartphones og tablets.
                          Du kan tilgå alle værktøjer og funktioner fra din mobile browser.
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="item-6">
                        <AccordionTrigger>Hvordan annullerer jeg mit abonnement?</AccordionTrigger>
                        <AccordionContent>
                          Du kan annullere dit abonnement ved at logge ind, gå til "Abonnement" under din profil, og
                          klikke på "Annuller Abonnement". Dit abonnement vil forblive aktivt indtil udløb af den
                          nuværende betalingsperiode.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tools" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Værktøjshjælp</CardTitle>
                    <CardDescription>Find hjælp til specifikke værktøjer og funktioner i ARQOMI.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link href="#" className="block">
                        <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-medium mb-2 flex items-center">
                            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                            Investeringsberegner
                          </h3>
                          <p className="text-gray-500">
                            Lær hvordan du bruger vores investeringsberegner til at planlægge dine investeringer.
                          </p>
                        </div>
                      </Link>

                      <Link href="#" className="block">
                        <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-medium mb-2 flex items-center">
                            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                            Låneberegner
                          </h3>
                          <p className="text-gray-500">
                            Få hjælp til at beregne låneomkostninger og sammenligne forskellige lånetilbud.
                          </p>
                        </div>
                      </Link>

                      <Link href="#" className="block">
                        <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-medium mb-2 flex items-center">
                            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                            Budgetplanlægger
                          </h3>
                          <p className="text-gray-500">
                            Lær hvordan du opretter og administrerer dit personlige budget med vores værktøj.
                          </p>
                        </div>
                      </Link>

                      <Link href="#" className="block">
                        <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-medium mb-2 flex items-center">
                            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                            Risikoberegner
                          </h3>
                          <p className="text-gray-500">
                            Forstå hvordan du vurderer risikoen ved dine investeringer med vores risikoværktøj.
                          </p>
                        </div>
                      </Link>

                      <Link href="#" className="block">
                        <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-medium mb-2 flex items-center">
                            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                            Virksomhedsrådgivning
                          </h3>
                          <p className="text-gray-500">
                            Få hjælp til at analysere din virksomheds nøgletal og få anbefalinger til forbedringer.
                          </p>
                        </div>
                      </Link>

                      <Link href="#" className="block">
                        <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-medium mb-2 flex items-center">
                            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                            Personlig Rådgiver
                          </h3>
                          <p className="text-gray-500">
                            Lær hvordan du får mest ud af vores AI-drevne personlige finansrådgiver.
                          </p>
                        </div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Kendte Problemer</CardTitle>
                    <CardDescription>
                      Her er en liste over kendte problemer, som vi arbejder på at løse.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-md bg-amber-50 border-amber-200">
                        <h3 className="font-medium text-amber-800 mb-1">
                          Investeringsberegner: Grafer vises ikke korrekt på Safari
                        </h3>
                        <p className="text-amber-700 text-sm">
                          Vi er opmærksomme på, at grafer i investeringsberegneren kan vise forkerte værdier i
                          Safari-browseren. Vi arbejder på en løsning. I mellemtiden anbefaler vi at bruge Chrome eller
                          Firefox.
                        </p>
                        <p className="text-xs text-amber-600 mt-2">Sidst opdateret: 15. maj 2025</p>
                      </div>

                      <div className="p-4 border rounded-md bg-amber-50 border-amber-200">
                        <h3 className="font-medium text-amber-800 mb-1">
                          Budgetplanlægger: Problemer med at importere CSV-filer
                        </h3>
                        <p className="text-amber-700 text-sm">
                          Nogle brugere oplever problemer med at importere CSV-filer fra visse banker. Vi arbejder på at
                          forbedre kompatibiliteten. Som en midlertidig løsning kan du prøve at eksportere i
                          Excel-format i stedet.
                        </p>
                        <p className="text-xs text-amber-600 mt-2">Sidst opdateret: 10. maj 2025</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Footer - This would normally be a shared component */}
      <footer className="py-12 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white mt-auto">
        <div className="container">
          <div className="text-center">
            <p className="text-white/70 text-sm">© {new Date().getFullYear()} ARQOMI. Alle rettigheder forbeholdes.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
