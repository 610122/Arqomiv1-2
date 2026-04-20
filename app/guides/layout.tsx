import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Gratis danske guides til privatøkonomi og virksomhed: lån, investering, opsparing, skat, pension, budget og mere. Letforståelige forklaringer og konkrete eksempler.",
  openGraph: {
    title: "Guides · Arqomi",
    description:
      "Gratis danske finansielle guides til privat og virksomhed.",
    type: "website",
  },
  alternates: { canonical: "/guides" },
}

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children
}
