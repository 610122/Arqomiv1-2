import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gældsberegner",
  description:
    "Saml al din gæld ét sted. Få overblik over DTI, renteomkostninger og tid til gældsfrihed — med dansk AI-anbefaling.",
  openGraph: {
    title: "Gældsberegner · Arqomi",
    description: "Saml din gæld og få overblik over DTI og renter med AI-anbefaling.",
    type: "website",
  },
  alternates: { canonical: "/beregner/gaeld" },
}

export default function GaeldLayout({ children }: { children: React.ReactNode }) {
  return children
}
