import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Statistik & Økonomi",
  description:
    "Analyser dine egne finansielle data: middelværdi, median, spredning, outliers og histogrammer. Med dansk AI-anbefaling.",
  openGraph: {
    title: "Statistik & Økonomi · Arqomi",
    description: "Statistisk analyse af dine tal med AI-anbefaling.",
    type: "website",
  },
  alternates: { canonical: "/beregner/statistik" },
}

export default function StatistikLayout({ children }: { children: React.ReactNode }) {
  return children
}
