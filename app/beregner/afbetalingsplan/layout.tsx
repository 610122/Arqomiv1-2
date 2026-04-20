import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Afbetalingsplan",
  description:
    "Lav en konkret plan for at blive gældfri med avalanche- eller snowball-metoden. Se hvor meget du kan spare — med dansk AI-anbefaling.",
  openGraph: {
    title: "Afbetalingsplan · Arqomi",
    description: "Bliv gældfri med avalanche eller snowball — med AI-anbefaling.",
    type: "website",
  },
  alternates: { canonical: "/beregner/afbetalingsplan" },
}

export default function AfbetalingsplanLayout({ children }: { children: React.ReactNode }) {
  return children
}
