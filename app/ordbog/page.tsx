"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BookOpen, Search, ArrowRight } from "lucide-react"

interface Term {
  term: string
  short: string
  long: string
  category: "lån" | "investering" | "opsparing" | "skat" | "risiko" | "virksomhed"
  relatedHref?: string
  relatedLabel?: string
}

const terms: Term[] = [
  {
    term: "ÅOP",
    short: "Årlige Omkostninger i Procent",
    long: "ÅOP viser de samlede årlige omkostninger ved et lån i procent — inkl. rente, gebyrer og stiftelsesomkostninger. ÅOP er det eneste tal, der gør det muligt at sammenligne forskellige lån direkte. Jo lavere ÅOP, jo billigere er lånet.",
    category: "lån",
    relatedHref: "/beregner/laan",
    relatedLabel: "Beregn ÅOP",
  },
  {
    term: "Debitorrente",
    short: "Den rene rentesats på lånet",
    long: "Debitorrenten er den nominelle rente, du betaler på restgælden — uden gebyrer. To lån med samme debitorrente kan have forskellig ÅOP, hvis gebyrerne er forskellige.",
    category: "lån",
  },
  {
    term: "DTI",
    short: "Debt-to-Income (gæld i forhold til indkomst)",
    long: "DTI er forholdet mellem dine månedlige gældsydelser og din månedlige bruttoindkomst. Banker bruger DTI som nøgletal ved kreditvurdering. Under 30% regnes typisk som sundt, over 40% som bekymrende.",
    category: "lån",
    relatedHref: "/beregner/gaeld",
    relatedLabel: "Beregn DTI",
  },
  {
    term: "Annuitetslån",
    short: "Lån med fast månedsydelse",
    long: "Ved et annuitetslån er den samlede månedsydelse konstant i hele lånets løbetid. I starten går en større del til rente, senere til afdrag. Typisk brugt ved boliglån og billån.",
    category: "lån",
  },
  {
    term: "Serielån",
    short: "Lån med faldende ydelse",
    long: "Ved et serielån er afdraget det samme hver måned, mens renten falder i takt med restgælden. Ydelsen er høj i starten, men falder over tid. Den samlede renteomkostning er lavere end ved annuitetslån.",
    category: "lån",
  },
  {
    term: "LTV",
    short: "Loan-to-Value (belåningsgrad)",
    long: "LTV viser, hvor stor en del af ejendommens værdi, der er finansieret med lån. I Danmark kan realkredit maksimalt dække 80% af boligens værdi. Resten skal finansieres med banklån eller egenkapital.",
    category: "lån",
  },
  {
    term: "Rentes rente",
    short: "Renter af renter",
    long: "Rentes rente er princippet om, at afkastet i en periode også genererer afkast i næste periode. Over lange tidshorisonter skaber rentes rente eksponentiel vækst — et af de stærkeste principper i privatøkonomi.",
    category: "investering",
    relatedHref: "/beregner/investering",
    relatedLabel: "Se rentes rente i praksis",
  },
  {
    term: "Dollar-cost averaging",
    short: "Månedlig investering af fast beløb",
    long: "DCA er en strategi, hvor du investerer det samme beløb med faste intervaller — fx 2.000 kr om måneden. Det giver gennemsnitlige købspriser og reducerer risikoen for at ramme en top dårligt.",
    category: "investering",
  },
  {
    term: "Volatilitet",
    short: "Hvor meget prisen svinger",
    long: "Volatilitet (standardafvigelse) måler, hvor meget et aktivs afkast svinger omkring gennemsnittet. Høj volatilitet = store udsving = højere risiko, men potentielt også højere afkast.",
    category: "risiko",
    relatedHref: "/beregner/risiko",
    relatedLabel: "Beregn volatilitet",
  },
  {
    term: "Sharpe-ratio",
    short: "Risikojusteret afkast",
    long: "Sharpe-ratio = (afkast − risikofri rente) / volatilitet. Den viser, hvor meget afkast du får per enhed risiko. Over 1 er godt, over 2 er fremragende.",
    category: "risiko",
    relatedHref: "/beregner/risiko",
    relatedLabel: "Beregn Sharpe-ratio",
  },
  {
    term: "VaR",
    short: "Value at Risk",
    long: "VaR (Value at Risk) er et mål for, hvor meget du med fx 95% sandsynlighed maksimalt vil tabe over en given periode. Bruges til at kvantificere downside-risiko i en portefølje.",
    category: "risiko",
  },
  {
    term: "AM-bidrag",
    short: "Arbejdsmarkedsbidrag (8%)",
    long: "AM-bidraget er en fast afgift på 8% af din bruttoløn, der trækkes før skatteberegning. Det finansierer dagpenge, efterløn og andre arbejdsmarkedsordninger.",
    category: "skat",
    relatedHref: "/beregner/loen",
    relatedLabel: "Beregn nettoløn",
  },
  {
    term: "Personfradrag",
    short: "Det beløb du må tjene skattefrit",
    long: "Personfradraget er det årlige beløb, du kan tjene uden at betale skat. I 2026 er personfradraget ca. 51.600 kr. for voksne. Alt herover beskattes efter din trækprocent.",
    category: "skat",
  },
  {
    term: "Topskat",
    short: "Ekstra skat på høje indkomster",
    long: "Topskat er en progressiv skat på 15% af den del af din personlige indkomst, der overstiger topskattegrænsen (ca. 640.000 kr i 2026 efter AM-bidrag).",
    category: "skat",
  },
  {
    term: "Aktieskat",
    short: "Skat af gevinst og udbytte",
    long: "I Danmark beskattes aktieindkomst med 27% op til progressionsgrænsen (ca. 63.300 kr i 2026) og 42% herover. Gælder både realiseret gevinst og udbytte.",
    category: "skat",
  },
  {
    term: "Aktiesparekonto",
    short: "Særlig lempelig aktiebeskatning",
    long: "Aktiesparekontoen beskattes med 17% lagerbeskatning (på årlig værdistigning). Maksimalt indskud er ca. 135.900 kr (2026). God til langsigtet investering i aktier og ETF'er.",
    category: "skat",
  },
  {
    term: "Nødopsparing",
    short: "3–6 måneders faste udgifter",
    long: "En nødopsparing bør svare til 3–6 måneders faste udgifter og stå på en lettilgængelig konto. Den dækker ved jobtab, pludselig reparation eller sygdom — uden at du skal sælge investeringer i bund.",
    category: "opsparing",
    relatedHref: "/beregner/opsparing",
    relatedLabel: "Planlæg opsparing",
  },
  {
    term: "50/30/20-reglen",
    short: "Budget-tommelfingerregel",
    long: "50% af din nettoløn går til behov (bolig, mad, transport), 30% til ønsker (underholdning, rejser) og 20% til opsparing og gældsafvikling. En simpel men effektiv model.",
    category: "opsparing",
    relatedHref: "/beregner/budget",
    relatedLabel: "Lav dit budget",
  },
  {
    term: "Avalanche-metoden",
    short: "Betal den dyreste gæld først",
    long: "Ved avalanche-metoden prioriterer du ekstrabetalinger på den gæld med højeste rente, uanset beløbets størrelse. Matematisk den billigste strategi — sparer mest i renter.",
    category: "opsparing",
    relatedHref: "/beregner/afbetalingsplan",
    relatedLabel: "Se afbetalingsplan",
  },
  {
    term: "Snowball-metoden",
    short: "Betal den mindste gæld først",
    long: "Ved snowball-metoden prioriterer du ekstrabetalinger på den mindste gæld først — uanset rente. Psykologisk motiverende, men lidt dyrere end avalanche over tid.",
    category: "opsparing",
    relatedHref: "/beregner/afbetalingsplan",
    relatedLabel: "Se afbetalingsplan",
  },
  {
    term: "Dækningsbidrag",
    short: "Omsætning minus variable omkostninger",
    long: "Dækningsbidraget er det, der er tilbage efter variable omkostninger, og som skal dække faste omkostninger og profit. Nøgletal for virksomhedsrentabilitet.",
    category: "virksomhed",
    relatedHref: "/beregner/virksomhed",
    relatedLabel: "Analyser virksomhed",
  },
  {
    term: "Runway",
    short: "Måneder til kassen er tom",
    long: "Runway = kassebeholdning / månedligt burn rate. Viser hvor mange måneder virksomheden kan fortsætte uden nye indtægter eller kapitaltilførsel. Kritisk nøgletal for startups.",
    category: "virksomhed",
    relatedHref: "/beregner/virksomhed",
    relatedLabel: "Beregn runway",
  },
  {
    term: "Break-even",
    short: "Nulpunktsomsætning",
    long: "Break-even er den omsætning, hvor dækningsbidraget netop svarer til faste omkostninger. Alt herover er profit. Formel: Faste omkostninger / dækningsgrad.",
    category: "virksomhed",
  },
  {
    term: "Soliditetsgrad",
    short: "Egenkapitalens andel af balancen",
    long: "Soliditetsgrad = egenkapital / samlede aktiver. Viser virksomhedens finansielle robusthed. Over 30% regnes typisk som sundt, under 15% som risikabelt.",
    category: "virksomhed",
  },
  {
    term: "Likviditetsgrad",
    short: "Evne til at betale kortsigtet gæld",
    long: "Likviditetsgrad = omsætningsaktiver / kortfristet gæld. Skal gerne være over 1,5. Viser om virksomheden kan møde sine forpligtelser på kort sigt uden nødlån.",
    category: "virksomhed",
  },
]

const categoryLabels: Record<Term["category"], string> = {
  lån: "Lån & boligfinansiering",
  investering: "Investering",
  opsparing: "Opsparing & budget",
  skat: "Skat & løn",
  risiko: "Risiko",
  virksomhed: "Virksomhed",
}

const categoryColors: Record<Term["category"], string> = {
  lån: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  investering: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  opsparing: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  skat: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  risiko: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  virksomhed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
}

export default function OrdbogPage() {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<Term["category"] | "alle">("alle")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return terms.filter((t) => {
      if (activeCategory !== "alle" && t.category !== activeCategory) return false
      if (!q) return true
      return (
        t.term.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q) ||
        t.long.toLowerCase().includes(q)
      )
    })
  }, [query, activeCategory])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => a.term.localeCompare(b.term, "da-DK")),
    [filtered],
  )

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="mb-8 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 mb-3 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          <BookOpen className="h-4 w-4" />
          Finansiel ordbog
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Ordbog
        </h1>
        <p className="text-lg text-muted-foreground">
          Forklaringer på danske finansielle begreber — kort og forståeligt. Søg, filtrér, og spring
          direkte til den beregner, der bruger begrebet.
        </p>
      </div>

      <div className="mb-6 relative max-w-xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søg f.eks. ÅOP, Sharpe, runway…"
          className="pl-9"
          aria-label="Søg i ordbog"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-2 justify-center">
        <Button
          size="sm"
          variant={activeCategory === "alle" ? "default" : "outline"}
          onClick={() => setActiveCategory("alle")}
        >
          Alle
        </Button>
        {(Object.keys(categoryLabels) as Term["category"][]).map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={activeCategory === cat ? "default" : "outline"}
            onClick={() => setActiveCategory(cat)}
          >
            {categoryLabels[cat]}
          </Button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Ingen begreber matcher din søgning.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.map((t) => (
            <Card key={t.term} className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl">{t.term}</CardTitle>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[t.category]}`}
                  >
                    {categoryLabels[t.category]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground italic mt-1">{t.short}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed mb-4">{t.long}</p>
                {t.relatedHref && (
                  <Link
                    href={t.relatedHref}
                    className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t.relatedLabel ?? "Gå til beregner"}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-14 text-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-3">Mangler du et begreb?</h2>
        <p className="text-muted-foreground mb-5 max-w-xl mx-auto">
          Vi udvider løbende ordbogen. Skriv til os på support, hvis du savner et dansk finansielt
          begreb forklaret her.
        </p>
        <Button asChild size="lg" variant="outline">
          <Link href="/support">
            Kontakt support
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
