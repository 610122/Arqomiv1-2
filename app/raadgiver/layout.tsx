import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Rådgiver",
  description:
    "Personlig finansiel rådgivning til livsfaser: første bolig, familie, forældre, pension og risikostyring — med Arqomi's værktøjer.",
  openGraph: {
    title: "Rådgiver · Arqomi",
    description: "Rådgivning tilpasset din livsfase.",
    type: "website",
  },
  alternates: { canonical: "/raadgiver" },
}

export default function RaadgiverLayout({ children }: { children: React.ReactNode }) {
  return children
}
