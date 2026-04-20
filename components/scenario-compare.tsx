"use client"

import { ArrowRight, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface Scenario {
  /** Scenario label — fx "Realistisk", "Halv indbetaling" */
  label: string
  /** Kort underbeskrivelse — fx "1.000 kr./md, 20 år, 7% afkast" */
  description?: string
  /** Hovedværdien der vises stort */
  value: string
  /** Valgfri sammenligningsværdi ift. basislinje, fx "-42.000 kr. vs. basis" */
  delta?: string
  /** Valgfri ekstra tal-linjer — fx { "Afkast": "210.000 kr.", "Indbetalt": "240.000 kr." } */
  breakdown?: Record<string, string>
  /** Hvis true, fremhæves kortet som basisscenariet */
  highlight?: boolean
  /** Tone på delta-værdien */
  tone?: "positive" | "negative" | "neutral"
}

interface ScenarioCompareProps {
  title?: string
  description?: string
  scenarios: Scenario[]
}

export function ScenarioCompare({
  title = "Sammenlign scenarier",
  description = "Se effekten side-om-side af forskellige valg",
  scenarios,
}: ScenarioCompareProps) {
  if (scenarios.length === 0) return null

  return (
    <Card data-ai-card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "grid gap-4",
            scenarios.length === 2 && "sm:grid-cols-2",
            scenarios.length === 3 && "sm:grid-cols-3",
            scenarios.length >= 4 && "sm:grid-cols-2 lg:grid-cols-4",
          )}
        >
          {scenarios.map((s, idx) => {
            const toneClass =
              s.tone === "positive"
                ? "text-emerald-600 dark:text-emerald-400"
                : s.tone === "negative"
                  ? "text-red-600 dark:text-red-400"
                  : "text-blue-600 dark:text-blue-400"
            return (
              <div
                key={idx}
                className={cn(
                  "rounded-lg border p-4 bg-white dark:bg-gray-900/40 transition-all",
                  s.highlight &&
                    "border-blue-400 ring-1 ring-blue-200 dark:ring-blue-900 bg-blue-50/50 dark:bg-blue-950/20",
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </p>
                  {s.highlight && (
                    <span className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-[10px] px-1.5 py-0.5 font-medium">
                      Dit valg
                    </span>
                  )}
                </div>
                {s.description && (
                  <p className="text-xs text-muted-foreground mb-2">{s.description}</p>
                )}
                <p className={cn("text-2xl font-bold mb-1", toneClass)}>{s.value}</p>
                {s.delta && (
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />
                    {s.delta}
                  </p>
                )}
                {s.breakdown && (
                  <dl className="mt-3 space-y-1 border-t pt-2 text-xs">
                    {Object.entries(s.breakdown).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <dt className="text-muted-foreground">{key}</dt>
                        <dd className="font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
