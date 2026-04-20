import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Lønberegner",
  description:
    "Beregn din nettoløn med AM-bidrag, trækprocent, pension og fradrag. Se hvor meget du har tilbage efter skat — med dansk AI-anbefaling.",
  openGraph: {
    title: "Lønberegner · Arqomi",
    description: "Beregn nettoløn, AM-bidrag, skat og pension med AI-anbefaling.",
    type: "website",
  },
  alternates: { canonical: "/beregner/loen" },
}

export default function LoenLayout({ children }: { children: React.ReactNode }) {
  return children
}
