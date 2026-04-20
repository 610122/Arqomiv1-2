import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Investeringsberegner",
  description:
    "Beregn dit fremtidige afkast med rentes rente. Vælg indskud, månedlig indbetaling, tidshorisont og risikoprofil — få personlig AI-anbefaling.",
  openGraph: {
    title: "Investeringsberegner · Arqomi",
    description:
      "Se hvad din opsparing vokser til med rentes rente og få en AI-analyse af din strategi.",
    type: "website",
  },
  alternates: { canonical: "/beregner/investering" },
}

export default function InvesteringLayout({ children }: { children: React.ReactNode }) {
  return children
}
