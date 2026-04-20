import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Opsparingsstrategi",
  description:
    "Planlæg din opsparing, nødopsparing og opsparingsmål med vores danske opsparingsberegner — og få personlig AI-anbefaling til din strategi.",
  openGraph: {
    title: "Opsparingsstrategi · Arqomi",
    description: "Planlæg nødopsparing og opsparingsmål med AI-anbefaling.",
    type: "website",
  },
  alternates: { canonical: "/beregner/opsparing" },
}

export default function OpsparingLayout({ children }: { children: React.ReactNode }) {
  return children
}
