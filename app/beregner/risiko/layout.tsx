import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Risikoberegner",
  description:
    "Vurder risiko, Sharpe-ratio og Value-at-Risk på din portefølje. Forstå din risikoprofil — med dansk AI-anbefaling.",
  openGraph: {
    title: "Risikoberegner · Arqomi",
    description: "Sharpe-ratio, VaR og volatilitet beregnet for dig med AI-anbefaling.",
    type: "website",
  },
  alternates: { canonical: "/beregner/risiko" },
}

export default function RisikoLayout({ children }: { children: React.ReactNode }) {
  return children
}
