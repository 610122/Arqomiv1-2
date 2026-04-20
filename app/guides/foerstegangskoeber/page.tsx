import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Home, Calculator, CheckCircle2, AlertTriangle } from "lucide-react"

export const metadata: Metadata = {
  title: "Førstegangskøber-guide: Sådan køber du din første bolig i Danmark",
  description:
    "Komplet dansk guide til førstegangskøbere: udbetaling, realkredit, banklån, ÅOP, boligskat og typiske faldgruber. Beregn din bolig med Arqomi.",
  openGraph: {
    title: "Førstegangskøber-guide · Arqomi",
    description:
      "Alt du skal vide om din første bolig i Danmark — udbetaling, lån, skat og faldgruber.",
    type: "article",
  },
  alternates: { canonical: "/guides/foerstegangskoeber" },
}

export default function FoerstegangskoeberPage() {
  return (
    <article className="container py-10 max-w-3xl">
      <div className="mb-6">
        <Link href="/guides">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Tilbage til guides
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 mb-3 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          <Home className="h-4 w-4" /> Førstegangskøber
        </div>
        <h1 className="text-4xl font-bold mb-3">
          Sådan køber du din første bolig i Danmark
        </h1>
        <p className="text-lg text-muted-foreground">
          En gennemgang af udbetaling, realkredit, banklån, skat og de typiske faldgruber — skrevet
          til dig, der skal købe bolig for første gang.
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-3">1. Hvor meget skal du selv lægge?</h2>
          <p className="leading-relaxed">
            I Danmark kræver loven, at du selv skal lægge mindst <strong>5% af købesummen</strong>{" "}
            som udbetaling. Resten — op til 80% — kan finansieres med realkreditlån, mens de
            sidste 15% typisk dækkes af banklån (det kaldes ofte et boliglån eller topfinansiering).
          </p>
          <p className="leading-relaxed">
            Eksempel: En lejlighed til 2.500.000 kr. kræver mindst 125.000 kr. i udbetaling. Men de
            fleste rådgivere anbefaler 10–15% (dvs. 250.000–375.000 kr.), fordi det både giver
            billigere lån og en buffer til flytning, indflytning og uforudsete udgifter.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">2. Realkredit vs. banklån</h2>
          <p className="leading-relaxed">
            Realkreditlån er altid det billigste, fordi de er sikret i din bolig og har lav rente.
            Til gengæld kan du kun låne <strong>op til 80% af boligens værdi</strong> via
            realkredit. De resterende 0–20% skal typisk finansieres som almindeligt banklån — med
            højere rente (ofte 6–10% mod realkredits 4–5%).
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Fastforrentet realkredit:</strong> Du kender ydelsen for hele løbetiden. Godt
              til trygheden.
            </li>
            <li>
              <strong>F3/F5 rentetilpasning:</strong> Renten justeres hvert 3.–5. år. Typisk billigere
              start, men risiko for rentestigning.
            </li>
            <li>
              <strong>Banklån:</strong> Til topfinansieringen. Husk at det som regel har kort løbetid
              og høj rente.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">3. Hvad koster det om måneden?</h2>
          <p className="leading-relaxed">
            Månedsydelsen afhænger af lånetype, løbetid og rente. For en bolig til 2.500.000 kr. med
            15% udbetaling og 30-årigt fastforrentet lån til 4,5% ligger månedsydelsen på cirka{" "}
            <strong>10.800 kr. før rentefradrag</strong>. Dertil kommer ejendomsværdiskat,
            grundskyld, forsikring, vedligeholdelse og evt. ejerforeningsbidrag.
          </p>
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 my-4">
            <CardContent className="py-4 flex items-start gap-3">
              <Calculator className="h-5 w-5 text-blue-600 mt-1 shrink-0" />
              <div>
                <p className="font-semibold">Beregn dit konkrete tilfælde</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Brug Låneberegneren — den viser månedsydelse, ÅOP, DTI og samlet rente over hele
                  løbetiden, og giver en AI-anbefaling baseret på din indkomst.
                </p>
                <Link
                  href="/beregner/laan"
                  className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Åbn låneberegneren <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">4. Skat og fradrag</h2>
          <p className="leading-relaxed">
            Renter på dine boliglån er fradragsberettigede. Ved en trækprocent på 33% reducerer det
            reelt din rentebetaling med en tredjedel. Til gengæld skal du betale{" "}
            <strong>ejendomsværdiskat</strong> (0,51% af offentlig vurdering op til 9,4 mio. kr.
            efter de nye regler) og <strong>grundskyld</strong> til kommunen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">5. Typiske faldgruber</h2>
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 my-4">
            <CardContent className="py-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-1 shrink-0" />
                <span>
                  <strong>Glemte flytte- og indflytningsudgifter.</strong> Tinglysning (1.850 kr + 0,6%
                  af købesum), advokat/boligrådgiver (15.000–25.000 kr), flytning og møbler.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-1 shrink-0" />
                <span>
                  <strong>For stramt budget.</strong> Beregn ydelsen ved 2 procentpoint højere rente
                  for at teste om du kan holde til en renteopgang.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-1 shrink-0" />
                <span>
                  <strong>Ingen tilstandsrapport?</strong> Køb aldrig uden. Skjulte skader kan koste
                  hundredtusinder at udbedre.
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">6. Tjekliste før du skriver under</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <span>Du har godkendt lånetilbud fra mindst 2 realkreditinstitutter</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <span>Du har læst og forstået tilstandsrapporten</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <span>Din DTI (gæld ift. indkomst) er under 35%</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <span>Du har en nødopsparing på min. 3 måneders faste udgifter</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <span>Du har budget efter indflytning inkl. skat og forsikring</span>
            </li>
          </ul>
        </section>
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        <Button asChild size="lg">
          <Link href="/beregner/laan">
            <Calculator className="mr-2 h-5 w-5" /> Beregn dit boliglån
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/ordbog">Slå begreber op i ordbogen</Link>
        </Button>
      </div>
    </article>
  )
}
