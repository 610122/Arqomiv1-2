import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, TrendingUp, Calculator, Lightbulb } from "lucide-react"

export const metadata: Metadata = {
  title: "Rentes rente: Den mest undervurderede kraft i din økonomi",
  description:
    "Forstå hvorfor rentes rente er så kraftfuld — og hvordan du får mest ud af den som dansk investor. Konkrete eksempler og tal.",
  openGraph: {
    title: "Rentes rente · Arqomi guide",
    description:
      "Hvordan rentes rente fungerer, og hvorfor tid er vigtigere end beløb.",
    type: "article",
  },
  alternates: { canonical: "/guides/rentes-rente" },
}

export default function RentesRentePage() {
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
        <div className="inline-flex items-center gap-2 mb-3 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
          <TrendingUp className="h-4 w-4" /> Investering
        </div>
        <h1 className="text-4xl font-bold mb-3">
          Rentes rente: Den mest undervurderede kraft i din økonomi
        </h1>
        <p className="text-lg text-muted-foreground">
          Albert Einstein skulle efter sigende have kaldt rentes rente for verdens ottende vidunder.
          Her er hvorfor — og hvordan du udnytter det.
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-3">Hvad er rentes rente?</h2>
          <p className="leading-relaxed">
            Rentes rente betyder, at det afkast du får i en periode, <em>også</em> begynder at give
            afkast i næste periode. Pengene begynder at avle penge, som så avler endnu flere penge.
            Over lange tidshorisonter vokser pengene eksponentielt — ikke lineært.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Eksempel: 1.000 kr. om måneden</h2>
          <p className="leading-relaxed">
            Lad os sige, du investerer 1.000 kr. om måneden til 7% årligt afkast (historisk
            gennemsnit for globale aktier). Se hvor stor forskel tidshorisonten gør:
          </p>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Tidshorisont</th>
                  <th className="text-right py-2">Indskudt</th>
                  <th className="text-right py-2">Slutværdi</th>
                  <th className="text-right py-2">Heraf afkast</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">10 år</td>
                  <td className="text-right">120.000 kr.</td>
                  <td className="text-right">173.085 kr.</td>
                  <td className="text-right text-emerald-600">+53.085 kr.</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">20 år</td>
                  <td className="text-right">240.000 kr.</td>
                  <td className="text-right">520.930 kr.</td>
                  <td className="text-right text-emerald-600">+280.930 kr.</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">30 år</td>
                  <td className="text-right">360.000 kr.</td>
                  <td className="text-right">1.219.970 kr.</td>
                  <td className="text-right text-emerald-600">+859.970 kr.</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold">40 år</td>
                  <td className="text-right">480.000 kr.</td>
                  <td className="text-right font-semibold">2.622.040 kr.</td>
                  <td className="text-right text-emerald-600 font-semibold">
                    +2.142.040 kr.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="leading-relaxed text-sm text-muted-foreground">
            Bemærk: Ved 40 år er afkastet over <strong>4,4 gange</strong> så stort som det, du
            indskyder. Ved 10 år er afkastet kun 44% af indskuddet. Det er rentes rente.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Hvorfor er tid så vigtig?</h2>
          <p className="leading-relaxed">
            Fordi vækstkurven er eksponentiel. De første 10 år lægger grunden, men de sidste 10 år
            er dér, hvor kurven stiger kraftigst. Hver år du udsætter at begynde, er et år du taber
            helt bagpå kurven — hvor afkastet vokser mest.
          </p>
          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900 my-4">
            <CardContent className="py-4 flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-purple-600 mt-1 shrink-0" />
              <div>
                <p className="font-semibold">Tommelfingerregel: "Reglen om 72"</p>
                <p className="text-sm text-muted-foreground">
                  Dine penge fordobles hver <strong>72 / årlig rente</strong> år. Ved 7% afkast
                  fordobles pengene hver 10,3 år. Ved 10% afkast hver 7,2 år.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Sådan udnytter du rentes rente</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>Start tidligt.</strong> Selv små beløb gror kolossalt over 30+ år.
            </li>
            <li>
              <strong>Invester konsekvent.</strong> Fast månedlig indbetaling (DCA) udnytter både op-
              og nedture.
            </li>
            <li>
              <strong>Brug Aktiesparekontoen.</strong> 17% lagerbeskatning slår 27%/42% aktieskat på
              lang sigt.
            </li>
            <li>
              <strong>Lad afkastet stå.</strong> Reinvester altid udbytter fremfor at hæve dem.
            </li>
            <li>
              <strong>Hold omkostninger nede.</strong> Fondsomkostninger på 1,5% mod 0,3% tager
              hundredtusinder over 30 år.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Omvendt rentes rente: Gæld</h2>
          <p className="leading-relaxed">
            Rentes rente virker præcist ligeså kraftigt imod dig, når du har gæld med høj rente.
            Kreditkortgæld på 20% vokser eksponentielt, hvis du ikke betaler af. Derfor er det ofte
            bedre at afvikle gæld først — især over 8–10% rente — før du investerer aggressivt.
          </p>
        </section>

        <div className="my-8 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 border border-purple-200 dark:border-purple-900">
          <h3 className="font-bold text-lg mb-2">Se rentes rente i praksis</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Prøv investeringsberegneren med dine egne tal. Vælg "Ung der sparer til pension" som
            eksempel og se effekten over 40 år.
          </p>
          <Link
            href="/beregner/investering"
            className="inline-flex items-center text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline"
          >
            Åbn investeringsberegneren <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        <Button asChild size="lg">
          <Link href="/beregner/investering">
            <Calculator className="mr-2 h-5 w-5" /> Beregn din investering
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/guides/gaeldfri">Læs om at blive gældfri</Link>
        </Button>
      </div>
    </article>
  )
}
