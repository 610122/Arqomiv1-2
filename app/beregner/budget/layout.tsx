import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Budgetplanlægger",
  description:
    "Opret dit personlige budget efter 50/30/20-reglen. Se fordelingen af bolig, mad, transport og opsparing — med dansk AI-anbefaling.",
  openGraph: {
    title: "Budgetplanlægger · Arqomi",
    description: "Dansk budgetskema med 50/30/20-regel og AI-anbefaling.",
    type: "website",
  },
  alternates: { canonical: "/beregner/budget" },
}

export default function BudgetLayout({ children }: { children: React.ReactNode }) {
  return children
}
