import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SupportButton } from "@/components/support-button"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { Header } from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Arqomi · Gratis danske finansielle beregnere med AI-anbefaling",
    template: "%s · Arqomi",
  },
  description:
    "Gratis danske finansielle værktøjer til privatøkonomi og virksomhed. Lån, investering, opsparing, budget, risiko og meget mere — med personlig AI-anbefaling baseret på dine tal.",
  keywords: [
    "dansk finansiel beregner",
    "låneberegner",
    "investeringsberegner",
    "budgetplanlægger",
    "opsparing",
    "pension",
    "privatøkonomi",
    "virksomhedsøkonomi",
    "AI-rådgivning",
    "ÅOP",
    "nettoløn",
    "DTI",
    "afbetalingsplan",
    "Arqomi",
  ],
  authors: [{ name: "Arqomi" }],
  creator: "Arqomi",
  publisher: "Arqomi",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "da_DK",
    siteName: "Arqomi",
    title: "Arqomi · Gratis danske finansielle beregnere",
    description:
      "Danske beregnere til privat og virksomhed med personlig AI-anbefaling. Helt gratis og uden login.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arqomi · Gratis danske finansielle beregnere",
    description:
      "Danske beregnere til privat og virksomhed med personlig AI-anbefaling.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="da">
      <body className={inter.className}>
        <Header />
        {children}
        <SupportButton />
        <Toaster />
      </body>
    </html>
  )
}
