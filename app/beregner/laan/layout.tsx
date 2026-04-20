import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Låneberegner",
  description:
    "Gratis dansk låneberegner: beregn månedlig ydelse, ÅOP, debitorrente, DTI og samlet omkostning. Sammenlign annuitets- og serielån — med personlig AI-anbefaling.",
  openGraph: {
    title: "Låneberegner · Arqomi",
    description:
      "Beregn månedsydelse, ÅOP, DTI og total omkostning på dit lån med AI-anbefaling.",
    type: "website",
  },
  alternates: { canonical: "/beregner/laan" },
}

export default function LaanLayout({ children }: { children: React.ReactNode }) {
  return children
}
