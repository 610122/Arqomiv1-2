"use client"

interface CalculatorTrackerProps {
  calculatorName?: string
  children?: React.ReactNode
}

/**
 * Tidligere sporing af beregner-brug via Supabase. Da sitet nu er gratis og
 * anonymt, gør komponenten intet – den holdes kun for at undgå at skulle
 * rette alle beregner-sider. Returnerer eventuelle children som de er.
 */
export function CalculatorTracker({ children }: CalculatorTrackerProps) {
  return <>{children ?? null}</>
}
