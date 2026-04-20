import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, CreditCard, Calculator, Target, Mountain } from "lucide-react"

export const metadata: Metadata = {
  title: "Bliv gældfri: Avalanche vs. Snowball-metoden",
  description:
    "Dansk guide til at blive gældfri: sammenlign avalanche- og snowball-metoden, se hvilken der passer til dig, og lav en konkret plan med Arqomi.",
  openGraph: {
    title: "Bliv gældfri · Arqomi guide",
    description:
      "Avalanche eller snowball — hvordan bliver du hurtigst gældfri?",
    type: "article",
  },
  alternates: { canonical: "/guides/gaeldfri" },
}

export default function GaeldfriPage() {
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
        <div className="inline-flex items-center gap-2 mb-3 rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
          <CreditCard className="h-4 w-4" /> Gæld
        </div>
        <h1 className="text-4xl font-bold mb-3">
          Bliv gældfri: Avalanche vs. snowball
        </h1>
        <p className="text-lg text-muted-foreground">
          Der findes to veldokumenterede metoder til at afvikle gæld hurtigst muligt. Vi
          sammenligner dem og viser, hvilken der passer bedst til dig.
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-3">Først: Afklar din samlede gæld</h2>
          <p className="leading-relaxed">
            Lav en liste over al din gæld: kreditkort, forbrugslån, studielån, banklån, billån.
            Skriv for hver: <strong>beløb, rente, minimumsydelse og kreditor</strong>. Det er
            nemmest med Gældsberegneren, som samler alt og viser DTI og den samlede månedlige
            renteomkostning.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Avalanche-metoden: Matematisk optimal</h2>
          <Card className="bg-slate-50 dark:bg-slate-900/40 border my-4">
            <CardContent className="py-5 flex items-start gap-3">
              <Mountain className="h-6 w-6 text-slate-600 dark:text-slate-300 mt-1 shrink-0" />
              <div>
                <p className="font-semibold mb-1">Princip</p>
                <p className="text-sm">
                  Betal minimumsydelsen på al gæld. Brug al ekstra kapital på gælden med{" "}
                  <strong>højeste rente</strong> — uanset beløbets størrelse. Når den er væk, gå
                  videre til den med næsthøjeste rente.
                </p>
              </div>
            </CardContent>
          </Card>
          <p className="leading-relaxed">
            <strong>Fordele:</strong> Sparer mest i renter. Matematisk den billigste vej til
            gældsfrihed.
          </p>
          <p className="leading-relaxed">
            <strong>Ulemper:</strong> Hvis den højeste rente sidder på en stor gæld, kan det tage
            lang tid at se fremgang. Nogle mister motivationen undervejs.
          </p>
          <p className="leading-relaxed">
            <strong>Passer til dig, hvis:</strong> Du er drevet af tal og resultater, og tålmodigt
            kan holde ud med at se den samme gæld i lang tid.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Snowball-metoden: Psykologisk stærkest</h2>
          <Card className="bg-slate-50 dark:bg-slate-900/40 border my-4">
            <CardContent className="py-5 flex items-start gap-3">
              <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mt-1 shrink-0" />
              <div>
                <p className="font-semibold mb-1">Princip</p>
                <p className="text-sm">
                  Betal minimumsydelsen på al gæld. Brug al ekstra kapital på gælden med{" "}
                  <strong>mindste beløb</strong> — uanset rente. Når den er væk, rul "snebolden"
                  videre til næste mindste.
                </p>
              </div>
            </CardContent>
          </Card>
          <p className="leading-relaxed">
            <strong>Fordele:</strong> Hurtige sejre giver motivation. Du ser én gæld efter den
            anden forsvinde, hvilket øger sandsynligheden for at holde kursen.
          </p>
          <p className="leading-relaxed">
            <strong>Ulemper:</strong> Du betaler lidt mere i renter undervejs, hvis den mindste
            gæld har lav rente.
          </p>
          <p className="leading-relaxed">
            <strong>Passer til dig, hvis:</strong> Du har brug for synlig fremgang for at holde
            motivationen oppe. Studier viser, at snowball ofte fører til højere succesrate selvom
            den er matematisk dyrere.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Eksempel: 3 gældsposter</h2>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Gæld</th>
                  <th className="text-right py-2">Beløb</th>
                  <th className="text-right py-2">Rente</th>
                  <th className="text-right py-2">Min. ydelse</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Kreditkort A</td>
                  <td className="text-right">8.000 kr.</td>
                  <td className="text-right">22%</td>
                  <td className="text-right">400 kr.</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Forbrugslån</td>
                  <td className="text-right">40.000 kr.</td>
                  <td className="text-right">12%</td>
                  <td className="text-right">1.500 kr.</td>
                </tr>
                <tr>
                  <td className="py-2">Banklån</td>
                  <td className="text-right">120.000 kr.</td>
                  <td className="text-right">7%</td>
                  <td className="text-right">2.200 kr.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="leading-relaxed text-sm">
            <strong>Avalanche-rækkefølge:</strong> Kreditkort (22%) → Forbrugslån (12%) → Banklån
            (7%). Her matcher det tilfældigvis også snowball, fordi kreditkortet er både det
            dyreste og mindste.
          </p>
          <p className="leading-relaxed text-sm mt-2">
            Hvis kreditkortet var på 40.000 kr. og forbrugslånet på 8.000 kr., ville snowball tage
            forbrugslånet først — selvom avalanche ville tage kreditkortet.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Praktiske tips</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Undgå ny gæld</strong>, mens du afvikler. Læg kreditkortet væk.
            </li>
            <li>
              <strong>Afsæt et fast ekstrabeløb.</strong> Selv 500 kr./md kan forkorte gældstid
              markant.
            </li>
            <li>
              <strong>Kontakt kreditor ved dyre lån.</strong> Du kan ofte forhandle renten ned,
              især hvis du har betalt til tiden.
            </li>
            <li>
              <strong>Byg en lille nødopsparing</strong> (fx 10.000 kr.) før du kaster al energi
              på gæld, så du ikke skal optage ny gæld ved uforudsete udgifter.
            </li>
          </ul>
        </section>

        <div className="my-8 rounded-lg bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 p-6 border border-rose-200 dark:border-rose-900">
          <h3 className="font-bold text-lg mb-2">Lav din konkrete plan</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Afbetalingsplan-værktøjet lader dig teste begge metoder med dine egne tal og viser,
            præcis hvor meget og hvornår du bliver gældfri.
          </p>
          <Link
            href="/beregner/afbetalingsplan"
            className="inline-flex items-center text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline"
          >
            Åbn afbetalingsplan <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        <Button asChild size="lg">
          <Link href="/beregner/afbetalingsplan">
            <Calculator className="mr-2 h-5 w-5" /> Lav afbetalingsplan
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/beregner/gaeld">Saml din gæld først</Link>
        </Button>
      </div>
    </article>
  )
}
