"use client"

import { useEffect, useState } from "react"
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Target,
  ChevronRight,
  Printer,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type AIPriority = "kritisk" | "høj" | "middel" | "lav"

export interface AIMetric {
  /** Kort label, fx "Potentiel besparelse" */
  label: string
  /** Værdi vises som er. Brug formatCurrency / procent osv. fra calling-side */
  value: string
  /** Valgfri ændring i procent (positiv = bedre, negativ = værre) */
  changePct?: number
  /** Valgfri kort beskrivelse */
  description?: string
  /** Valgfri tone */
  tone?: "positive" | "negative" | "neutral"
}

export interface AIActionItem {
  priority: AIPriority
  title: string
  description: string
  /** Valgfri konkret tal-effekt, fx "Sparer 12.450 kr." */
  impact?: string
}

export interface AIChartSeries {
  name: string
  color?: string
}

export interface AIChartPoint {
  /** X-akse label */
  label: string
  /** Series-værdier keyed på series.name */
  [key: string]: string | number
}

export interface AIRecommendationData {
  /** 0–10 score */
  score: number
  /** Kort overskrift, fx "God økonomi - men plads til forbedring" */
  headline: string
  /** Personlig 2-4 sætninger konklusion */
  summary: string
  /** Vigtige tal (3-6 stk) */
  metrics: AIMetric[]
  /** Hvis sat, vises et diagram med disse data */
  chart?: {
    type: "bar" | "line"
    title: string
    description?: string
    /** Y-akse format, "currency" formaterer som DKK */
    valueFormat?: "currency" | "number" | "percent"
    series: AIChartSeries[]
    data: AIChartPoint[]
  }
  /** Prioriterede handlingspunkter */
  actionItems: AIActionItem[]
}

interface AIRecommendationProps {
  data: AIRecommendationData | null
  /** Vises hvis data er null */
  emptyMessage?: string
  /** Animation-delay før indholdet vises (millisekunder), default 600ms */
  thinkingMs?: number
  /** Titel som vises øverst på print/PDF (fx "Låneberegner · AI-anbefaling") */
  printTitle?: string
}

const priorityStyles: Record<AIPriority, { color: string; bg: string; label: string }> = {
  kritisk: { color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900", label: "Kritisk" },
  høj: { color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900", label: "Høj" },
  middel: { color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900", label: "Middel" },
  lav: { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900", label: "Lav" },
}

const formatChartValue = (v: number, fmt?: "currency" | "number" | "percent") => {
  if (fmt === "currency") {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(v)
  }
  if (fmt === "percent") return `${v.toFixed(1)}%`
  return new Intl.NumberFormat("da-DK", { maximumFractionDigits: 0 }).format(v)
}

const getScoreInfo = (score: number) => {
  if (score >= 8) return { label: "Stærk", color: "text-emerald-600", bar: "bg-emerald-500" }
  if (score >= 6) return { label: "God", color: "text-blue-600", bar: "bg-blue-500" }
  if (score >= 4) return { label: "Acceptabel", color: "text-amber-600", bar: "bg-amber-500" }
  return { label: "Bør forbedres", color: "text-red-600", bar: "bg-red-500" }
}

const SERIES_COLORS = ["#2563eb", "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"]

export function AIRecommendation({
  data,
  emptyMessage,
  thinkingMs = 600,
  printTitle,
}: AIRecommendationProps) {
  const [thinking, setThinking] = useState(true)

  useEffect(() => {
    setThinking(true)
    const t = setTimeout(() => setThinking(false), thinkingMs)
    return () => clearTimeout(t)
  }, [data, thinkingMs])

  const handlePrint = () => {
    if (typeof window === "undefined") return
    const previousTitle = document.title
    if (printTitle) {
      document.title = `${printTitle} · Arqomi`
    }
    window.print()
    if (printTitle) {
      // Gendan titel efter print-dialog er lukket
      setTimeout(() => {
        document.title = previousTitle
      }, 500)
    }
  }

  if (!data) {
    return (
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Kunstig intelligens anbefaling
          </CardTitle>
          <CardDescription>
            {emptyMessage ??
              "Udfyld beregneren med dine oplysninger for at få en personlig AI-anbefaling baseret på dine tal."}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (thinking) {
    return (
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
            AI analyserer dine oplysninger...
          </CardTitle>
          <CardDescription>Et øjeblik mens vi gennemgår tallene og finder de bedste anbefalinger.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" />
              Læser inputdata
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "120ms" }} />
              Sammenligner med scenarier
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "240ms" }} />
              Genererer anbefalinger
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const scoreInfo = getScoreInfo(data.score)
  const sortedActions = [...data.actionItems].sort((a, b) => {
    const order: AIPriority[] = ["kritisk", "høj", "middel", "lav"]
    return order.indexOf(a.priority) - order.indexOf(b.priority)
  })

  return (
    <div className="space-y-6 ai-print-region">
      {/* Print-venlig overskrift — vises KUN på print */}
      <div className="hidden print:block mb-4">
        <h1 className="text-2xl font-bold">{printTitle ?? "AI-anbefaling"} · Arqomi</h1>
        <p className="text-sm text-gray-600">
          Genereret {new Date().toLocaleDateString("da-DK", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Hovedkort med score + konklusion */}
      <Card data-ai-card className="border-t-4 border-t-blue-500 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Kunstig intelligens anbefaling
              </CardTitle>
              <CardDescription className="mt-1">
                Personlig analyse baseret på de oplysninger du har indtastet
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 no-print">
              <Badge variant="outline" className="bg-white dark:bg-gray-900 shadow-sm">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-genereret
              </Badge>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handlePrint}
                className="bg-white dark:bg-gray-900 shadow-sm"
                aria-label="Udskriv eller gem som PDF"
              >
                <Printer className="h-4 w-4 mr-1.5" />
                Gem som PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-[180px_1fr]">
            {/* Score */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-gray-200 dark:text-gray-800"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="2.5"
                    strokeDasharray={`${(data.score / 10) * 100}, 100`}
                    strokeLinecap="round"
                    className={cn(scoreInfo.color)}
                    stroke="currentColor"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("text-3xl font-bold", scoreInfo.color)}>{data.score.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">/ 10</span>
                </div>
              </div>
              <p className={cn("mt-2 text-sm font-medium", scoreInfo.color)}>{scoreInfo.label}</p>
            </div>
            {/* Konklusion */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">{data.headline}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{data.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nøgletal */}
      {data.metrics.length > 0 && (
        <Card data-ai-card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-blue-500" />
              Nøgletal fra din analyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.metrics.map((metric, idx) => {
                const tone = metric.tone ?? "neutral"
                const Icon = tone === "positive" ? TrendingUp : tone === "negative" ? TrendingDown : ArrowRight
                const toneColor =
                  tone === "positive"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : tone === "negative"
                      ? "text-red-600 dark:text-red-400"
                      : "text-blue-600 dark:text-blue-400"
                return (
                  <div
                    key={idx}
                    className="rounded-lg border p-4 bg-white dark:bg-gray-900/40 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {metric.label}
                      </span>
                      <Icon className={cn("h-4 w-4", toneColor)} />
                    </div>
                    <p className={cn("text-2xl font-bold mb-1", toneColor)}>{metric.value}</p>
                    {typeof metric.changePct === "number" && (
                      <p className="text-xs text-muted-foreground">
                        {metric.changePct > 0 ? "+" : ""}
                        {metric.changePct.toFixed(1)}% vs. udgangspunkt
                      </p>
                    )}
                    {metric.description && (
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{metric.description}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagram */}
      {data.chart && data.chart.data.length > 0 && (
        <Card data-ai-card>
          <CardHeader>
            <CardTitle className="text-base">{data.chart.title}</CardTitle>
            {data.chart.description && <CardDescription>{data.chart.description}</CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                {data.chart.type === "line" ? (
                  <LineChart data={data.chart.data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => formatChartValue(Number(v), data.chart!.valueFormat)}
                    />
                    <Tooltip
                      formatter={(v: number) => formatChartValue(Number(v), data.chart!.valueFormat)}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {data.chart.series.map((s, i) => (
                      <Line
                        key={s.name}
                        type="monotone"
                        dataKey={s.name}
                        stroke={s.color ?? SERIES_COLORS[i % SERIES_COLORS.length]}
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                ) : (
                  <BarChart data={data.chart.data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => formatChartValue(Number(v), data.chart!.valueFormat)}
                    />
                    <Tooltip
                      formatter={(v: number) => formatChartValue(Number(v), data.chart!.valueFormat)}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {data.chart.series.map((s, i) => (
                      <Bar
                        key={s.name}
                        dataKey={s.name}
                        fill={s.color ?? SERIES_COLORS[i % SERIES_COLORS.length]}
                        radius={[4, 4, 0, 0]}
                      >
                        {data.chart!.data.map((_, idx) => (
                          <Cell key={`cell-${idx}`} />
                        ))}
                      </Bar>
                    ))}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Handlingspunkter */}
      {sortedActions.length > 0 && (
        <Card data-ai-card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Anbefalede handlinger
            </CardTitle>
            <CardDescription>Sorteret efter vigtighed - start fra toppen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedActions.map((item, idx) => {
              const style = priorityStyles[item.priority]
              const Icon =
                item.priority === "kritisk"
                  ? AlertCircle
                  : item.priority === "høj"
                    ? AlertCircle
                    : item.priority === "middel"
                      ? ChevronRight
                      : CheckCircle2
              return (
                <div key={idx} className={cn("rounded-lg border p-4", style.bg)}>
                  <div className="flex items-start gap-3">
                    <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", style.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <Badge variant="outline" className={cn("text-xs", style.color)}>
                          {style.label} prioritet
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      {item.impact && (
                        <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded">
                          <TrendingUp className="h-3 w-3" />
                          {item.impact}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground italic px-2">
        Denne analyse er genereret automatisk baseret på dine input og generelle finansielle principper. Den udgør ikke
        personlig rådgivning - tag altid kontakt til en autoriseret rådgiver ved større økonomiske beslutninger.
      </p>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Hjælpefunktioner som beregnerne kan bruge når de bygger AIRecommendationData
 * -------------------------------------------------------------------------- */

export const formatDKK = (n: number) =>
  new Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK", maximumFractionDigits: 0 }).format(n)

export const formatPct = (n: number, decimals = 1) => `${n.toFixed(decimals)}%`

export const clampScore = (n: number) => Math.max(0, Math.min(10, Math.round(n * 10) / 10))
