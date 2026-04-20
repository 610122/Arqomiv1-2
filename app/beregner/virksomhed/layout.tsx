import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Virksomhedsrådgiver",
  description:
    "Omfattende analyse af din virksomhed: margin, likviditet, soliditet, runway og benchmarks — med strategisk AI-anbefaling.",
  openGraph: {
    title: "Virksomhedsrådgiver · Arqomi",
    description: "Dansk virksomhedsanalyse med nøgletal og AI-anbefaling.",
    type: "website",
  },
  alternates: { canonical: "/beregner/virksomhed" },
}

export default function VirksomhedCalcLayout({ children }: { children: React.ReactNode }) {
  return children
}
