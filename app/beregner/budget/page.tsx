"use client"

import type React from "react"
import { ChevronLeft } from "lucide-react"
import { useMemo, useState, useRef, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  FileSpreadsheet,
  AlertCircle,
  FileUp,
  ChevronRight,
  PieChart,
  DollarSign,
  BarChart3,
  FileText,
  Trash2,
  Home,
  Car,
  ShoppingCart,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { utils, read, writeFile } from "xlsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { CalculatorTracker } from "@/components/calculator-tracker"
import { AIRecommendation } from "@/components/ai-recommendation"
import { analyzeBudget } from "@/lib/ai-engines"

// Definerer budgetskema schema med Zod
const budgetSchema = z.object({
  // Generelle oplysninger
  budgetNavn: z.string().min(1, "Budgetnavn er påkrævet"),
  budgetPeriode: z.enum(["månedlig", "kvartalsvis", "årlig"]),
  startDato: z.string().optional(),
  slutDato: z.string().optional(),
  antalPersoner: z.coerce.number().min(1, "Antal personer skal være mindst 1").default(1),

  // Indtægter
  loenEfterSkat: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  pensionIndbetaling: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  boligstoette: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  boerneCheckFamilieYdelse: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  andreIndtaegter: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  kapitalIndkomst: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  lejeindtaegter: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  sideindkomst: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),

  // Boligudgifter
  huslejeAfdrag: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  ejendomsskat: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  ejendomsvaerdiskat: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  el: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  vand: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  varme: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  tv: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  internet: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  forsikringer: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  ejerforeningBidrag: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  vedligeholdelse: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  renovation: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),

  // Transport
  benzin: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  vaegafgift: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  bilforsikring: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  service: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  offentligTransport: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  parkering: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  bilsyn: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  bilafdrag: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),

  // Daglige udgifter
  mad: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  toejtilbehoer: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  mobilAbonnement: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  fritidsaktiviteter: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  frisør: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  gaver: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  ferie: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  underholdning: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  restaurantCafe: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  medicin: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  tandlaege: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  boernepasning: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  uddannelse: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),

  // Lån og opsparing
  afdragLaan: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  opsparing: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  pension: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  andreUdgifter: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  investering: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  kreditkortAfdrag: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  studiegaeld: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  noedsituation: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),

  // Mål og noter
  opsparingsmaal: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  gaeldAfviklingsmaal: z.coerce.number().min(0, "Beløbet skal være positivt").default(0),
  budgetNoter: z.string().optional(),
})

type BudgetFormValues = z.infer<typeof budgetSchema>

// Definerer mappings mellem Excel/Google Sheets kolonnenavne og formfelter
const fieldMappings: Record<string, string> = {
  // Generelle oplysninger
  budgetnavn: "budgetNavn",
  "budget navn": "budgetNavn",
  periode: "budgetPeriode",
  "budget periode": "budgetPeriode",
  startdato: "startDato",
  "start dato": "startDato",
  slutdato: "slutDato",
  "slut dato": "slutDato",
  "antal personer": "antalPersoner",
  personer: "antalPersoner",

  // Indtægter
  "løn efter skat": "loenEfterSkat",
  løn: "loenEfterSkat",
  "pension indbetaling": "pensionIndbetaling",
  boligstøtte: "boligstoette",
  børnecheck: "boerneCheckFamilieYdelse",
  familieydelse: "boerneCheckFamilieYdelse",
  "børnecheck/familieydelse": "boerneCheckFamilieYdelse",
  "andre indtægter": "andreIndtaegter",
  "kapital indkomst": "kapitalIndkomst",
  lejeindtægter: "lejeindtaegter",
  sideindkomst: "sideindkomst",

  // Boligudgifter
  husleje: "huslejeAfdrag",
  "afdrag på lån": "huslejeAfdrag",
  "husleje/afdrag på lån": "huslejeAfdrag",
  ejendomsskat: "ejendomsskat",
  ejendomsværdiskat: "ejendomsvaerdiskat",
  el: "el",
  vand: "vand",
  varme: "varme",
  tv: "tv",
  internet: "internet",
  forsikringer: "forsikringer",
  "ejerforening bidrag": "ejerforeningBidrag",
  vedligeholdelse: "vedligeholdelse",
  renovation: "renovation",

  // Transport
  benzin: "benzin",
  vægtafgift: "vaegafgift",
  bilforsikring: "bilforsikring",
  service: "service",
  "offentlig transport": "offentligTransport",
  parkering: "parkering",
  bilsyn: "bilsyn",
  bilafdrag: "bilafdrag",

  // Daglige udgifter
  mad: "mad",
  tøj: "toejtilbehoer",
  "tøj og tilbehør": "toejtilbehoer",
  mobil: "mobilAbonnement",
  "mobil abonnement": "mobilAbonnement",
  fritidsaktiviteter: "fritidsaktiviteter",
  frisør: "frisør",
  gaver: "gaver",
  ferie: "ferie",
  underholdning: "underholdning",
  "restaurant/cafe": "restaurantCafe",
  medicin: "medicin",
  tandlæge: "tandlaege",
  børnepasning: "boernepasning",
  uddannelse: "uddannelse",

  // Lån og opsparing
  "afdrag lån": "afdragLaan",
  opsparing: "opsparing",
  pension: "pension",
  "andre udgifter": "andreUdgifter",
  investering: "investering",
  "kreditkort afdrag": "kreditkortAfdrag",
  studiegæld: "studiegaeld",
  nødsituation: "noedsituation",

  // Mål og noter
  opsparingsmål: "opsparingsmaal",
  "gæld afviklingsmål": "gaeldAfviklingsmaal",
  "budget noter": "budgetNoter",
}

// Kategorier og deres farver til diagrammer
const kategorier = {
  indtaegter: { navn: "Indtægter", farve: "#4ade80" },
  bolig: { navn: "Bolig", farve: "#f97316" },
  transport: { navn: "Transport", farve: "#3b82f6" },
  daglige: { navn: "Daglige udgifter", farve: "#ec4899" },
  laanOpsparing: { navn: "Lån og opsparing", farve: "#8b5cf6" },
}

// Livssituationer til templates
const livssituationer = [
  { id: "single", navn: "Single", beskrivelse: "Budget for en person der bor alene" },
  { id: "par", navn: "Par uden børn", beskrivelse: "Budget for et par uden børn" },
  { id: "familie", navn: "Familie med børn", beskrivelse: "Budget for en familie med børn" },
  { id: "pensionist", navn: "Pensionist", beskrivelse: "Budget for en pensionist" },
  { id: "studerende", navn: "Studerende", beskrivelse: "Budget for en studerende" },
]

// Budgetskabeloner baseret på livssituation
const budgetSkabeloner: Record<string, Partial<BudgetFormValues>> = {
  single: {
    budgetNavn: "Mit budget - Single",
    budgetPeriode: "månedlig",
    antalPersoner: 1,
    loenEfterSkat: 25000,
    huslejeAfdrag: 7000,
    el: 500,
    vand: 300,
    varme: 800,
    tv: 200,
    internet: 300,
    forsikringer: 500,
    mad: 3000,
    toejtilbehoer: 1000,
    mobilAbonnement: 200,
    opsparing: 2000,
  },
  par: {
    budgetNavn: "Mit budget - Par uden børn",
    budgetPeriode: "månedlig",
    antalPersoner: 2,
    loenEfterSkat: 45000,
    huslejeAfdrag: 9000,
    el: 700,
    vand: 500,
    varme: 1000,
    tv: 300,
    internet: 300,
    forsikringer: 800,
    mad: 5000,
    toejtilbehoer: 2000,
    mobilAbonnement: 400,
    opsparing: 5000,
  },
  familie: {
    budgetNavn: "Mit budget - Familie med børn",
    budgetPeriode: "månedlig",
    antalPersoner: 4,
    loenEfterSkat: 50000,
    boerneCheckFamilieYdelse: 2800,
    huslejeAfdrag: 12000,
    el: 1000,
    vand: 800,
    varme: 1500,
    tv: 400,
    internet: 400,
    forsikringer: 1200,
    mad: 8000,
    toejtilbehoer: 3000,
    mobilAbonnement: 600,
    boernepasning: 3000,
    opsparing: 3000,
  },
  pensionist: {
    budgetNavn: "Mit budget - Pensionist",
    budgetPeriode: "månedlig",
    antalPersoner: 1,
    loenEfterSkat: 18000,
    boligstoette: 1500,
    huslejeAfdrag: 6000,
    el: 500,
    vand: 300,
    varme: 800,
    tv: 300,
    internet: 300,
    forsikringer: 600,
    mad: 2500,
    medicin: 500,
    opsparing: 1000,
  },
  studerende: {
    budgetNavn: "Mit budget - Studerende",
    budgetPeriode: "månedlig",
    antalPersoner: 1,
    loenEfterSkat: 6000,
    boligstoette: 1000,
    andreIndtaegter: 6000, // SU
    huslejeAfdrag: 4000,
    el: 300,
    vand: 200,
    varme: 500,
    internet: 200,
    mad: 2000,
    toejtilbehoer: 500,
    mobilAbonnement: 100,
    uddannelse: 500,
    opsparing: 500,
  },
}

// Hjælpefunktion til at formatere tal som valuta
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Hjælpefunktion til at beregne procentdel
const calculatePercentage = (amount: number, total: number) => {
  if (total === 0) return 0
  return Math.round((amount / total) * 100)
}

function BudgetPageContent() {
  const [activeTab, setActiveTab] = useState("oversigt")
  const [budgetSummary, setBudgetSummary] = useState<{
    totalIndtaegter: number
    totalUdgifter: number
    raadighed: number
    kategoriTotaler: Record<string, number>
    udgiftsfordeling: Array<{ name: string; value: number; color: string }>
    indkomstfordeling: Array<{ name: string; value: number; color: string }>
    opsparingsMaal: number
    gaeldAfviklingsMaal: number
    finansielScore: number
  } | null>(null)
  const [importedData, setImportedData] = useState<any[] | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [savedBudgets, setSavedBudgets] = useState<Array<{ id: string; name: string; date: string }>>([])
  const [loadBudgetDialogOpen, setLoadBudgetDialogOpen] = useState(false)
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null)
  const [budgetPerioder, setBudgetPerioder] = useState<
    Array<{ periode: string; indtaegter: number; udgifter: number; raadighed: number }>
  >([])
  const [visDetaljer, setVisDetaljer] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const aiRecommendation = useMemo(() => {
    if (!budgetSummary) return null
    const values = form.getValues()
    return analyzeBudget({
      income: budgetSummary.totalIndtaegter,
      fixedExpenses:
        budgetSummary.kategoriTotaler.bolig + budgetSummary.kategoriTotaler.laanOpsparing,
      variableExpenses:
        budgetSummary.kategoriTotaler.transport + budgetSummary.kategoriTotaler.daglige,
      savings: (values.opsparing ?? 0) + (values.investering ?? 0) + (values.pension ?? 0),
      housing: budgetSummary.kategoriTotaler.bolig,
      transport: budgetSummary.kategoriTotaler.transport,
      food: values.mad ?? 0,
    })
  }, [budgetSummary, form])

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budgetNavn: "Mit budget",
      budgetPeriode: "månedlig",
      startDato: new Date().toISOString().split("T")[0],
      slutDato: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString().split("T")[0],
      antalPersoner: 1,

      loenEfterSkat: 0,
      pensionIndbetaling: 0,
      boligstoette: 0,
      boerneCheckFamilieYdelse: 0,
      andreIndtaegter: 0,
      kapitalIndkomst: 0,
      lejeindtaegter: 0,
      sideindkomst: 0,

      huslejeAfdrag: 0,
      ejendomsskat: 0,
      ejendomsvaerdiskat: 0,
      el: 0,
      vand: 0,
      varme: 0,
      tv: 0,
      internet: 0,
      forsikringer: 0,
      ejerforeningBidrag: 0,
      vedligeholdelse: 0,
      renovation: 0,

      benzin: 0,
      vaegafgift: 0,
      bilforsikring: 0,
      service: 0,
      offentligTransport: 0,
      parkering: 0,
      bilsyn: 0,
      bilafdrag: 0,

      mad: 0,
      toejtilbehoer: 0,
      mobilAbonnement: 0,
      fritidsaktiviteter: 0,
      frisør: 0,
      gaver: 0,
      ferie: 0,
      underholdning: 0,
      restaurantCafe: 0,
      medicin: 0,
      tandlaege: 0,
      boernepasning: 0,
      uddannelse: 0,

      afdragLaan: 0,
      opsparing: 0,
      pension: 0,
      andreUdgifter: 0,
      investering: 0,
      kreditkortAfdrag: 0,
      studiegaeld: 0,
      noedsituation: 0,

      opsparingsmaal: 0,
      gaeldAfviklingsmaal: 0,
      budgetNoter: "",
    },
  })

  // Indlæs gemte budgetter fra localStorage ved komponentindlæsning
  useEffect(() => {
    const loadSavedBudgets = () => {
      try {
        const savedBudgetsString = localStorage.getItem("gemteBudgetter")
        if (savedBudgetsString) {
          const budgets = JSON.parse(savedBudgetsString)
          setSavedBudgets(budgets)
        }
      } catch (error) {
        console.error("Fejl ved indlæsning af gemte budgetter:", error)
      }
    }

    loadSavedBudgets()
  }, [])

  // Beregn budget og opdater budgetSummary
  const calculateBudget = (data: BudgetFormValues) => {
    // Beregn indtægter
    const totalIndtaegter =
      data.loenEfterSkat +
      data.pensionIndbetaling +
      data.boligstoette +
      data.boerneCheckFamilieYdelse +
      data.andreIndtaegter +
      data.kapitalIndkomst +
      data.lejeindtaegter +
      data.sideindkomst

    // Beregn udgifter per kategori
    const totalBoligudgifter =
      data.huslejeAfdrag +
      data.ejendomsskat +
      data.ejendomsvaerdiskat +
      data.el +
      data.vand +
      data.varme +
      data.tv +
      data.internet +
      data.forsikringer +
      data.ejerforeningBidrag +
      data.vedligeholdelse +
      data.renovation

    const totalTransport =
      data.benzin +
      data.vaegafgift +
      data.bilforsikring +
      data.service +
      data.offentligTransport +
      data.parkering +
      data.bilsyn +
      data.bilafdrag

    const totalDagligeUdgifter =
      data.mad +
      data.toejtilbehoer +
      data.mobilAbonnement +
      data.fritidsaktiviteter +
      data.frisør +
      data.gaver +
      data.ferie +
      data.underholdning +
      data.restaurantCafe +
      data.medicin +
      data.tandlaege +
      data.boernepasning +
      data.uddannelse

    const totalLaanOpsparing =
      data.afdragLaan +
      data.opsparing +
      data.pension +
      data.andreUdgifter +
      data.investering +
      data.kreditkortAfdrag +
      data.studiegaeld +
      data.noedsituation

    // Beregn totale udgifter og rådighedsbeløb
    const totalUdgifter = totalBoligudgifter + totalTransport + totalDagligeUdgifter + totalLaanOpsparing
    const raadighed = totalIndtaegter - totalUdgifter

    // Opret data til udgiftsfordelings-diagram
    const udgiftsfordeling = [
      { name: "Bolig", value: totalBoligudgifter, color: kategorier.bolig.farve },
      { name: "Transport", value: totalTransport, color: kategorier.transport.farve },
      { name: "Daglige udgifter", value: totalDagligeUdgifter, color: kategorier.daglige.farve },
      { name: "Lån og opsparing", value: totalLaanOpsparing, color: kategorier.laanOpsparing.farve },
    ]

    // Opret data til indkomstfordelings-diagram
    const indkomstfordeling = [
      { name: "Løn efter skat", value: data.loenEfterSkat, color: "#4ade80" },
      { name: "Pension", value: data.pensionIndbetaling, color: "#22c55e" },
      { name: "Boligstøtte", value: data.boligstoette, color: "#16a34a" },
      { name: "Børnecheck", value: data.boerneCheckFamilieYdelse, color: "#15803d" },
      { name: "Kapitalindkomst", value: data.kapitalIndkomst, color: "#166534" },
      { name: "Lejeindtægter", value: data.lejeindtaegter, color: "#14532d" },
      { name: "Sideindkomst", value: data.sideindkomst, color: "#052e16" },
      { name: "Andre indtægter", value: data.andreIndtaegter, color: "#86efac" },
    ].filter((item) => item.value > 0)

    // Beregn finansiel score (0-100)
    let finansielScore = 50 // Udgangspunkt

    // Justér score baseret på rådighedsbeløb
    const raadighetsPercentage = (raadighed / totalIndtaegter) * 100
    if (raadighetsPercentage >= 20) finansielScore += 20
    else if (raadighetsPercentage >= 10) finansielScore += 10
    else if (raadighetsPercentage < 0) finansielScore -= 20

    // Justér score baseret på opsparing
    const opsparingsPercentage = ((data.opsparing + data.investering + data.noedsituation) / totalIndtaegter) * 100
    if (opsparingsPercentage >= 15) finansielScore += 15
    else if (opsparingsPercentage >= 10) finansielScore += 10
    else if (opsparingsPercentage >= 5) finansielScore += 5

    // Justér score baseret på gæld
    const gaeldsPercentage = ((data.afdragLaan + data.kreditkortAfdrag + data.studiegaeld) / totalIndtaegter) * 100
    if (gaeldsPercentage >= 40) finansielScore -= 15
    else if (gaeldsPercentage >= 30) finansielScore -= 10
    else if (gaeldsPercentage >= 20) finansielScore -= 5

    // Begræns score til 0-100
    finansielScore = Math.max(0, Math.min(100, finansielScore))

    // Opdater budgetSummary
    return {
      totalIndtaegter,
      totalUdgifter,
      raadighed,
      kategoriTotaler: {
        bolig: totalBoligudgifter,
        transport: totalTransport,
        daglige: totalDagligeUdgifter,
        laanOpsparing: totalLaanOpsparing,
      },
      udgiftsfordeling,
      indkomstfordeling,
      opsparingsMaal: data.opsparingsmaal,
      gaeldAfviklingsMaal: data.gaeldAfviklingsmaal,
      finansielScore,
    }
  }

  // Generer budgetperioder for fremtidsprognose
  const generateBudgetPerioder = (data: BudgetFormValues) => {
    const perioder = []
    const antalPerioder = 12 // 12 måneder/kvartaler/år frem

    // Basisværdier fra nuværende budget
    const basisIndtaegter = calculateBudget(data).totalIndtaegter
    const basisUdgifter = calculateBudget(data).totalUdgifter

    // Generer perioder med små variationer
    for (let i = 0; i < antalPerioder; i++) {
      // Tilføj små tilfældige variationer for at simulere ændringer over tid
      const variation = 0.98 + Math.random() * 0.04 // 0.98 til 1.02 (±2%)
      const indtaegter = Math.round(basisIndtaegter * variation)

      // Udgifter stiger lidt mere i vinterperioder (for månedlige budgetter)
      let saesonVariation = 1.0
      if (data.budgetPeriode === "månedlig" && (i === 0 || i === 1 || i === 11)) {
        saesonVariation = 1.05 // 5% højere udgifter i vintermåneder
      }

      const udgifter = Math.round(basisUdgifter * variation * saesonVariation)
      const raadighed = indtaegter - udgifter

      // Bestem periodenavn baseret på budgetperiode
      let periodeNavn = ""
      if (data.budgetPeriode === "månedlig") {
        const dato = new Date()
        dato.setMonth(dato.getMonth() + i)
        periodeNavn = dato.toLocaleString("da-DK", { month: "long", year: "numeric" })
      } else if (data.budgetPeriode === "kvartalsvis") {
        const dato = new Date()
        dato.setMonth(dato.getMonth() + i * 3)
        const kvartal = Math.floor(dato.getMonth() / 3) + 1
        periodeNavn = `Q${kvartal} ${dato.getFullYear()}`
      } else {
        const dato = new Date()
        dato.setFullYear(dato.getFullYear() + i)
        periodeNavn = dato.getFullYear().toString()
      }

      perioder.push({
        periode: periodeNavn,
        indtaegter,
        udgifter,
        raadighed,
      })
    }

    return perioder
  }

  const onSubmit = (data: BudgetFormValues) => {
    // Beregn budget
    const summary = calculateBudget(data)
    setBudgetSummary(summary)

    // Generer budgetperioder til fremtidsprognose
    const perioder = generateBudgetPerioder(data)
    setBudgetPerioder(perioder)

    // Skift til resultat-fanen
    setActiveTab("resultat")

    toast({
      title: "Budget beregnet",
      description: "Dit budget er nu beregnet og klar til gennemgang.",
    })
  }

  // Gem budget i localStorage
  const saveBudget = () => {
    try {
      const currentData = form.getValues()
      const budgetId = Date.now().toString()
      const budgetName = currentData.budgetNavn
      const currentDate = new Date().toLocaleDateString("da-DK")

      // Gem budget data
      localStorage.setItem(
        `budget_${budgetId}`,
        JSON.stringify({
          data: currentData,
          summary: budgetSummary,
          perioder: budgetPerioder,
        }),
      )

      // Opdater liste over gemte budgetter
      const updatedBudgets = [...savedBudgets, { id: budgetId, name: budgetName, date: currentDate }]

      localStorage.setItem("gemteBudgetter", JSON.stringify(updatedBudgets))
      setSavedBudgets(updatedBudgets)

      toast({
        title: "Budget gemt",
        description: `Budgettet "${budgetName}" er blevet gemt.`,
      })
    } catch (error) {
      console.error("Fejl ved gemning af budget:", error)
      toast({
        title: "Fejl ved gemning",
        description: "Der opstod en fejl ved gemning af budgettet.",
        variant: "destructive",
      })
    }
  }

  // Indlæs gemt budget
  const loadBudget = (budgetId: string) => {
    try {
      const budgetString = localStorage.getItem(`budget_${budgetId}`)
      if (!budgetString) {
        toast({
          title: "Fejl ved indlæsning",
          description: "Budgettet kunne ikke findes.",
          variant: "destructive",
        })
        return
      }

      const budget = JSON.parse(budgetString)

      // Indlæs budgetdata i formularen
      form.reset(budget.data)

      // Indlæs budgetopsummering og perioder
      setBudgetSummary(budget.summary)
      setBudgetPerioder(budget.perioder)

      setLoadBudgetDialogOpen(false)
      setActiveTab("resultat")

      toast({
        title: "Budget indlæst",
        description: `Budgettet "${budget.data.budgetNavn}" er blevet indlæst.`,
      })
    } catch (error) {
      console.error("Fejl ved indlæsning af budget:", error)
      toast({
        title: "Fejl ved indlæsning",
        description: "Der opstod en fejl ved indlæsning af budgettet.",
        variant: "destructive",
      })
    }
  }

  // Slet gemt budget
  const deleteBudget = (budgetId: string) => {
    try {
      // Fjern budget fra localStorage
      localStorage.removeItem(`budget_${budgetId}`)

      // Opdater liste over gemte budgetter
      const updatedBudgets = savedBudgets.filter((budget) => budget.id !== budgetId)
      localStorage.setItem("gemteBudgetter", JSON.stringify(updatedBudgets))
      setSavedBudgets(updatedBudgets)

      toast({
        title: "Budget slettet",
        description: "Budgettet er blevet slettet.",
      })
    } catch (error) {
      console.error("Fejl ved sletning af budget:", error)
      toast({
        title: "Fejl ved sletning",
        description: "Der opstod en fejl ved sletning af budgettet.",
        variant: "destructive",
      })
    }
  }

  // Anvend budgetskabelon
  const applyTemplate = (templateId: string) => {
    const template = budgetSkabeloner[templateId]
    if (template) {
      form.reset({
        ...form.getValues(),
        ...template,
      })
      setTemplateDialogOpen(false)

      toast({
        title: "Skabelon anvendt",
        description: `Budgetskabelonen "${template.budgetNavn}" er blevet anvendt.`,
      })
    }
  }

  const downloadExcel = () => {
    const formData = form.getValues()
    const summary = budgetSummary || calculateBudget(formData)

    // Opret workbook med flere ark
    const wb = utils.book_new()

    // Ark 1: Oversigt
    const oversigtData = [
      ["Budgetoversigt"],
      ["Budgetnavn", formData.budgetNavn],
      ["Budgetperiode", formData.budgetPeriode],
      ["Antal personer", formData.antalPersoner],
      [""],
      ["ØKONOMISK OVERSIGT"],
      ["Samlede indtægter", summary.totalIndtaegter],
      ["Samlede udgifter", summary.totalUdgifter],
      ["Rådighedsbeløb", summary.raadighed],
      ["Rådighedsbeløb pr. person", Math.round(summary.raadighed / formData.antalPersoner)],
      [""],
      ["UDGIFTSFORDELING"],
      [
        "Boligudgifter",
        summary.kategoriTotaler.bolig,
        `${calculatePercentage(summary.kategoriTotaler.bolig, summary.totalUdgifter)}%`,
      ],
      [
        "Transport",
        summary.kategoriTotaler.transport,
        `${calculatePercentage(summary.kategoriTotaler.transport, summary.totalUdgifter)}%`,
      ],
      [
        "Daglige udgifter",
        summary.kategoriTotaler.daglige,
        `${calculatePercentage(summary.kategoriTotaler.daglige, summary.totalUdgifter)}%`,
      ],
      [
        "Lån og opsparing",
        summary.kategoriTotaler.laanOpsparing,
        `${calculatePercentage(summary.kategoriTotaler.laanOpsparing, summary.totalUdgifter)}%`,
      ],
      [""],
      ["FINANSIEL SUNDHED"],
      ["Finansiel score", summary.finansielScore],
      ["Opsparingsmål", formData.opsparingsmaal],
      ["Gældsafviklingsmål", formData.gaeldAfviklingsmaal],
      [""],
      ["NOTER"],
      [formData.budgetNoter || "Ingen noter"],
    ]

    const wsOversigt = utils.aoa_to_sheet(oversigtData)
    utils.book_append_sheet(wb, wsOversigt, "Oversigt")

    // Ark 2: Detaljeret budget
    const detailData = [
      ["Detaljeret Budget"],
      [""],
      ["INDTÆGTER", "Beløb (kr.)"],
      ["Løn efter skat", formData.loenEfterSkat],
      ["Pension indbetaling", formData.pensionIndbetaling],
      ["Boligstøtte", formData.boligstoette],
      ["Børnecheck/familieydelse", formData.boerneCheckFamilieYdelse],
      ["Kapitalindkomst", formData.kapitalIndkomst],
      ["Lejeindtægter", formData.lejeindtaegter],
      ["Sideindkomst", formData.sideindkomst],
      ["Andre indtægter", formData.andreIndtaegter],
      ["Total indtægter", summary.totalIndtaegter],
      [""],
      ["UDGIFTER"],
      [""],
      ["Boligudgifter"],
      ["Husleje/afdrag på lån", formData.huslejeAfdrag],
      ["Ejendomsskat", formData.ejendomsskat],
      ["Ejendomsværdiskat", formData.ejendomsvaerdiskat],
      ["El", formData.el],
      ["Vand", formData.vand],
      ["Varme", formData.varme],
      ["TV", formData.tv],
      ["Internet", formData.internet],
      ["Forsikringer", formData.forsikringer],
      ["Ejerforening/grundejerforening", formData.ejerforeningBidrag],
      ["Vedligeholdelse", formData.vedligeholdelse],
      ["Renovation", formData.renovation],
      ["Total boligudgifter", summary.kategoriTotaler.bolig],
      [""],
      ["Transport"],
      ["Benzin", formData.benzin],
      ["Vægtafgift", formData.vaegafgift],
      ["Bilforsikring", formData.bilforsikring],
      ["Service", formData.service],
      ["Offentlig transport", formData.offentligTransport],
      ["Parkering", formData.parkering],
      ["Bilsyn", formData.bilsyn],
      ["Bilafdrag", formData.bilafdrag],
      ["Total transport", summary.kategoriTotaler.transport],
      [""],
      ["Daglige udgifter"],
      ["Mad", formData.mad],
      ["Tøj og tilbehør", formData.toejtilbehoer],
      ["Mobil abonnement", formData.mobilAbonnement],
      ["Fritidsaktiviteter", formData.fritidsaktiviteter],
      ["Frisør", formData.frisør],
      ["Gaver", formData.gaver],
      ["Ferie", formData.ferie],
      ["Underholdning", formData.underholdning],
      ["Restaurant/cafe", formData.restaurantCafe],
      ["Medicin", formData.medicin],
      ["Tandlæge", formData.tandlaege],
      ["Børnepasning", formData.boernepasning],
      ["Uddannelse", formData.uddannelse],
      ["Total daglige udgifter", summary.kategoriTotaler.daglige],
      [""],
      ["Lån og opsparing"],
      ["Afdrag på lån", formData.afdragLaan],
      ["Opsparing", formData.opsparing],
      ["Pension", formData.pension],
      ["Investering", formData.investering],
      ["Kreditkort afdrag", formData.kreditkortAfdrag],
      ["Studiegæld", formData.studiegaeld],
      ["Nødsituation", formData.noedsituation],
      ["Andre udgifter", formData.andreUdgifter],
      ["Total lån og opsparing", summary.kategoriTotaler.laanOpsparing],
      [""],
      ["Total udgifter", summary.totalUdgifter],
      [""],
      ["RÅDIGHEDSBELØB", summary.raadighed],
    ]

    const wsDetail = utils.aoa_to_sheet(detailData)
    utils.book_append_sheet(wb, wsDetail, "Detaljeret Budget")

    // Ark 3: Fremtidsprognose
    const prognoseData = [["Fremtidsprognose"], [""], ["Periode", "Indtægter", "Udgifter", "Rådighedsbeløb"]]

    budgetPerioder.forEach((periode) => {
      prognoseData.push([periode.periode, periode.indtaegter, periode.udgifter, periode.raadighed])
    })

    const wsPrognose = utils.aoa_to_sheet(prognoseData)
    utils.book_append_sheet(wb, wsPrognose, "Fremtidsprognose")

    // Ark 4: Anbefalinger
    const anbefalingerData = [["Anbefalinger og Handlingsplan"], [""], ["ØKONOMISK VURDERING"]]

    // Tilføj vurdering baseret på rådighedsbeløb
    if (summary.raadighed >= 5000) {
      anbefalingerData.push(
        ["Din økonomi ser sund ud!"],
        ["Du har et godt rådighedsbeløb på " + formatCurrency(summary.raadighed) + " om måneden."],
        ["Dette giver dig mulighed for at spare op eller investere."],
        [""],
      )
    } else if (summary.raadighed >= 0) {
      anbefalingerData.push(
        ["Din økonomi er balanceret"],
        ["Du har et rådighedsbeløb på " + formatCurrency(summary.raadighed) + " om måneden."],
        ["Det er positivt, men du kunne overveje at se på muligheder for at øge din opsparing."],
        [""],
      )
    } else {
      anbefalingerData.push(
        ["Din økonomi er under pres"],
        ["Du har et negativt rådighedsbeløb på " + formatCurrency(summary.raadighed) + " om måneden."],
        ["Det anbefales at gennemgå dine udgifter og se, hvor du kan reducere dem."],
        [""],
      )
    }

    // Tilføj anbefalinger baseret på økonomisk situation
    anbefalingerData.push(["ANBEFALINGER:"])

    if (summary.raadighed < 0) {
      anbefalingerData.push(
        ["1. Gennemgå dine faste udgifter og se, hvor du kan spare"],
        ["2. Overvej at refinansiere dine lån for at få lavere ydelser"],
        ["3. Undersøg om du er berettiget til offentlige ydelser"],
        ["4. Overvej midlertidigt at reducere din opsparing"],
        ["5. Se på muligheder for at øge din indkomst"],
      )
    } else if (summary.raadighed >= 0 && summary.raadighed < 5000) {
      anbefalingerData.push(
        ["1. Opret en fast opsparing hver måned"],
        ["2. Overvej at øge din pensionsopsparing"],
        ["3. Se på muligheder for at reducere dine faste udgifter"],
        ["4. Opbyg en nødopsparing svarende til 3 måneders udgifter"],
        ["5. Undgå at optage nye lån"],
      )
    } else {
      anbefalingerData.push(
        ["1. Overvej at investere en del af dit rådighedsbeløb"],
        ["2. Øg din pensionsopsparing for at sikre din fremtid"],
        ["3. Opret en nødopsparing svarende til 3-6 måneders udgifter"],
        ["4. Overvej at afvikle gæld hurtigere"],
        ["5. Sæt penge af til større fremtidige udgifter"],
      )
    }

    anbefalingerData.push(
      [""],
      ["HANDLINGSPLAN"],
      [""],
      ["Kortsigtet (1-3 måneder):"],
      ["- Gennemgå alle abonnementer og opsig dem du ikke bruger"],
      ["- Sammenlign priser på forsikringer og skift hvis du kan spare"],
      ["- Lav en madplan for at reducere madspild og udgifter"],
      [""],
      ["Mellemsigtet (3-12 måneder):"],
      ["- Opbyg en nødopsparing"],
      ["- Undersøg muligheder for at reducere boligudgifter"],
      ["- Overvej at omlægge dyre lån"],
      [""],
      ["Langsigtet (1-5 år):"],
      ["- Øg pensionsopsparingen"],
      ["- Invester i aktier eller obligationer"],
      ["- Afbetal gæld systematisk"],
      ["- Planlæg større investeringer (bolig, bil, etc.)"],
    )

    const wsAnbefalinger = utils.aoa_to_sheet(anbefalingerData)
    utils.book_append_sheet(wb, wsAnbefalinger, "Anbefalinger")

    // Tilpas kolonnebredder for alle ark
    const wscols = [
      { wch: 35 }, // A
      { wch: 15 }, // B
      { wch: 15 }, // C
    ]

    wb.Sheets["Oversigt"]["!cols"] = wscols
    wb.Sheets["Detaljeret Budget"]["!cols"] = wscols
    wb.Sheets["Fremtidsprognose"]["!cols"] = wscols
    wb.Sheets["Anbefalinger"]["!cols"] = wscols

    // Generer Excel-filen og download
    writeFile(wb, `${formData.budgetNavn.replace(/\s+/g, "_")}.xlsx`)

    toast({
      title: "Excel-fil downloadet",
      description: "Dit budget er blevet downloadet som en Excel-fil med flere ark.",
    })
  }

  // Funktion til at håndtere fil upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null)
    const file = event.target.files?.[0]

    if (!file) return

    // Tjek filtypen
    const fileType = file.name.split(".").pop()?.toLowerCase()
    if (fileType !== "xlsx" && fileType !== "xls" && fileType !== "csv") {
      setImportError("Filen skal være i Excel-format (.xlsx, .xls) eller CSV-format (.csv)")
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          setImportError("Kunne ikke læse filen")
          return
        }

        // Parse Excel/CSV data
        const workbook = read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Konverter til JSON
        const jsonData = utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) {
          setImportError("Ingen data fundet i filen")
          return
        }

        setImportedData(jsonData)
        setImportDialogOpen(true)
      } catch (error) {
        console.error("Fejl ved import af fil:", error)
        setImportError("Der opstod en fejl ved import af filen. Kontroller at filen er i korrekt format.")
      }
    }

    reader.onerror = () => {
      setImportError("Der opstod en fejl ved læsning af filen")
    }

    // Læs filen som binær
    reader.readAsBinaryString(file)
  }

  // Funktion til at anvende importeret data til formularen
  const applyImportedData = () => {
    if (!importedData) return

    const newFormData: Partial<BudgetFormValues> = {}

    // Gennemgå alle rækker i det importerede data
    importedData.forEach((row: any) => {
      // Gennemgå alle felter i rækken
      Object.entries(row).forEach(([key, value]) => {
        // Konverter nøglen til lowercase for case-insensitive sammenligning
        const lowerKey = key.toLowerCase().trim()

        // Find det matchende formfelt baseret på mappings
        const formField = fieldMappings[lowerKey]

        if (formField) {
          // Konverter værdien til et tal hvis det er en streng
          let numValue =
            typeof value === "string"
              ? Number.parseFloat(value.replace(/[^\d.,]/g, "").replace(",", "."))
              : Number(value)

          // Hvis værdien er NaN, sæt den til 0
          if (isNaN(numValue)) numValue = 0

          // Tilføj værdien til formdata
          newFormData[formField as keyof BudgetFormValues] = numValue
        }
      })
    })

    // Opdater formularen med de importerede værdier
    form.reset({
      ...form.getValues(),
      ...newFormData,
    })

    setImportDialogOpen(false)
    setImportedData(null)

    toast({
      title: "Data importeret",
      description: "Dit budget er blevet importeret fra filen.",
    })
  }

  // Funktion til at åbne fil-vælgeren
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Avanceret Budgetplanlægning
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Få fuldt overblik over din økonomi med vores avancerede budgetværktøj. Planlæg din økonomi, sæt mål, og få
          personlige anbefalinger til at forbedre din finansielle situation.
        </p>
      </div>

      <div className="flex flex-wrap justify-center mb-6 gap-4">
        <Button onClick={triggerFileInput} variant="outline" className="flex items-center gap-2">
          <FileUp className="h-4 w-4" />
          Importer fra Excel/Google Sheets
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
        </Button>

        <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Brug skabelon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vælg budgetskabelon</DialogTitle>
              <DialogDescription>
                Vælg en skabelon baseret på din livssituation for at komme hurtigt i gang.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <RadioGroup value={selectedTemplate || ""} onValueChange={setSelectedTemplate}>
                {livssituationer.map((situation) => (
                  <div key={situation.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={situation.id} id={situation.id} />
                    <Label htmlFor={situation.id} className="flex flex-col">
                      <span className="font-medium">{situation.navn}</span>
                      <span className="text-sm text-muted-foreground">{situation.beskrivelse}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                Annuller
              </Button>
              <Button onClick={() => selectedTemplate && applyTemplate(selectedTemplate)} disabled={!selectedTemplate}>
                Anvend skabelon
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {savedBudgets.length > 0 && (
          <Dialog open={loadBudgetDialogOpen} onOpenChange={setLoadBudgetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Indlæs gemt budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Indlæs gemt budget</DialogTitle>
                <DialogDescription>Vælg et af dine gemte budgetter for at indlæse det.</DialogDescription>
              </DialogHeader>
              <div className="max-h-[300px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Navn</TableHead>
                      <TableHead>Dato</TableHead>
                      <TableHead className="text-right">Handling</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedBudgets.map((budget) => (
                      <TableRow key={budget.id}>
                        <TableCell>{budget.name}</TableCell>
                        <TableCell>{budget.date}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => deleteBudget(budget.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedBudgetId(budget.id)
                                loadBudget(budget.id)
                              }}
                            >
                              Indlæs
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLoadBudgetDialogOpen(false)}>
                  Annuller
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {importError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fejl ved import</AlertTitle>
          <AlertDescription>{importError}</AlertDescription>
        </Alert>
      )}

      <Card className="border-t-4 border-t-blue-500 shadow-lg">
        <CardHeader>
          <CardTitle>Opret dit budget</CardTitle>
          <CardDescription>
            Udfyld dit budgetskema og få nemt og hurtigt overblik over din privatøkonomi. Få personlige anbefalinger og
            download en komplet budgetrapport.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-6 mb-8">
                  <TabsTrigger value="oversigt" className="flex items-center gap-1">
                    <PieChart className="h-4 w-4" />
                    <span className="hidden sm:inline">Oversigt</span>
                  </TabsTrigger>
                  <TabsTrigger value="indtaegter" className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="hidden sm:inline">Indtægter</span>
                  </TabsTrigger>
                  <TabsTrigger value="bolig" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">Bolig</span>
                  </TabsTrigger>
                  <TabsTrigger value="transport" className="flex items-center gap-1">
                    <Car className="h-4 w-4" />
                    <span className="hidden sm:inline">Transport</span>
                  </TabsTrigger>
                  <TabsTrigger value="daglige" className="flex items-center gap-1">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="hidden sm:inline">Daglige</span>
                  </TabsTrigger>
                  <TabsTrigger value="resultat" className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Resultat</span>
                  </TabsTrigger>
                </TabsList>

                {/* Oversigt */}
                <TabsContent value="oversigt" className="space-y-4">
                  <div className="grid gap-6">
                    <div className="grid gap-4">
                      <h3 className="text-lg font-medium">Generelle oplysninger</h3>
                      <Separator />

                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="budgetNavn"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budgetnavn</FormLabel>
                              <FormControl>
                                <Input placeholder="Mit budget" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="budgetPeriode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budgetperiode</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Vælg periode" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="månedlig">Månedlig</SelectItem>
                                  <SelectItem value="kvartalsvis">Kvartalsvis</SelectItem>
                                  <SelectItem value="årlig">Årlig</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="startDato"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Startdato</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="slutDato"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slutdato</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="antalPersoner"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Antal personer i husstanden</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <h3 className="text-lg font-medium">Mål og noter</h3>
                      <Separator />

                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="opsparingsmaal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Opsparingsmål (pr. måned)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gaeldAfviklingsmaal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gældsafviklingsmål (pr. måned)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="sm:col-span-2">
                          <FormField
                            control={form.control}
                            name="budgetNoter"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Noter til budgettet</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Skriv eventuelle noter til dit budget her..."
                                    className="min-h-[100px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button
                        type="button"
                        onClick={() => setActiveTab("indtaegter")}
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                      >
                        Næste: Indtægter
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Indtægter */}
                <TabsContent value="indtaegter" className="space-y-4">
                  <div className="grid gap-6">
                    <div className="grid gap-4">
                      <h3 className="text-lg font-medium">Indtægter</h3>
                      <Separator />

                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="loenEfterSkat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Løn efter skat</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pensionIndbetaling"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pension indbetaling</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="boligstoette"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Boligstøtte</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="boerneCheckFamilieYdelse"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Børnecheck/familieydelse</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="kapitalIndkomst"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kapitalindkomst</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lejeindtaegter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lejeindtægter</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sideindkomst"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sideindkomst</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="andreIndtaegter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Andre indtægter</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("oversigt")}
                        className="flex items-center"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Tilbage: Oversigt
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setActiveTab("bolig")}
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                      >
                        Næste: Bolig
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Bolig */}
                <TabsContent value="bolig" className="space-y-4">
                  <div className="grid gap-6">
                    <div className="grid gap-4">
                      <h3 className="text-lg font-medium">Boligudgifter</h3>
                      <Separator />

                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="huslejeAfdrag"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Husleje/afdrag på lån</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ejendomsskat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ejendomsskat</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ejendomsvaerdiskat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ejendomsværdiskat</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="el"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>El</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="vand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vand</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="varme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Varme</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="tv"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>TV</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="internet"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Internet</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="forsikringer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Forsikringer</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ejerforeningBidrag"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ejerforening/grundejerforening</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="vedligeholdelse"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vedligeholdelse</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="renovation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Renovation</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("indtaegter")}
                        className="flex items-center"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Tilbage: Indtægter
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setActiveTab("transport")}
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                      >
                        Næste: Transport
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Transport */}
                <TabsContent value="transport" className="space-y-4">
                  <div className="grid gap-6">
                    <div className="grid gap-4">
                      <h3 className="text-lg font-medium">Transportudgifter</h3>
                      <Separator />

                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="benzin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Benzin/diesel</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="vaegafgift"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vægtafgift</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bilforsikring"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bilforsikring</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="service"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service/reparation</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="offentligTransport"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Offentlig transport</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="parkering"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Parkering</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bilsyn"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bilsyn</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bilafdrag"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bilafdrag</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("bolig")}
                        className="flex items-center"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Tilbage: Bolig
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setActiveTab("daglige")}
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                      >
                        Næste: Daglige udgifter
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Daglige udgifter */}
                <TabsContent value="daglige" className="space-y-4">
                  <div className="grid gap-6">
                    <div className="grid gap-4">
                      <h3 className="text-lg font-medium">Daglige udgifter</h3>
                      <Separator />

                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="mad"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mad og dagligvarer</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="toejtilbehoer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tøj og tilbehør</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="mobilAbonnement"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobil abonnement</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="fritidsaktiviteter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fritidsaktiviteter</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="frisør"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frisør</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gaver"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gaver</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ferie"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ferie</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="underholdning"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Underholdning</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="restaurantCafe"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Restaurant/cafe</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="medicin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medicin</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="tandlaege"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tandlæge</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="boernepasning"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Børnepasning</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="uddannelse"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Uddannelse</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="afdragLaan"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Afdrag på lån</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="opsparing"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Opsparing</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pension"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pension</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="investering"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Investering</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="kreditkortAfdrag"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kreditkort afdrag</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="studiegaeld"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Studiegæld</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="noedsituation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nødsituation</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="andreUdgifter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Andre udgifter</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("transport")}
                        className="flex items-center"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Tilbage: Transport
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                      >
                        Beregn budget
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Resultat */}
                <TabsContent value="resultat" className="space-y-6">
                  {budgetSummary ? (
                    <div className="grid gap-6">
                      <div className="grid gap-4">
                        <h3 className="text-lg font-medium">Budgetoversigt</h3>
                        <Separator />

                        <div className="grid gap-6 md:grid-cols-3">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">Indtægter</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-green-500">
                                {formatCurrency(budgetSummary.totalIndtaegter)}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">Udgifter</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-red-500">
                                {formatCurrency(budgetSummary.totalUdgifter)}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">Rådighedsbeløb</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div
                                className={`text-2xl font-bold ${
                                  budgetSummary.raadighed >= 0 ? "text-green-500" : "text-red-500"
                                }`}
                              >
                                {formatCurrency(budgetSummary.raadighed)}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatCurrency(Math.round(budgetSummary.raadighed / form.getValues().antalPersoner))}{" "}
                                pr. person
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        <h3 className="text-lg font-medium">Udgiftsfordeling</h3>
                        <Separator />

                        <div className="grid gap-6 md:grid-cols-2">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">Fordeling af udgifter</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {Object.entries(budgetSummary.kategoriTotaler).map(([key, value]) => {
                                  const kategori = key as keyof typeof kategorier
                                  const procent = calculatePercentage(value, budgetSummary.totalUdgifter)
                                  return (
                                    <div key={key}>
                                      <div className="flex justify-between mb-1">
                                        <span>{kategorier[kategori].navn}</span>
                                        <span>
                                          {formatCurrency(value)} ({procent}%)
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                          className="h-2.5 rounded-full"
                                          style={{
                                            width: `${procent}%`,
                                            backgroundColor: kategorier[kategori].farve,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">Finansiel sundhed</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span>Finansiel score</span>
                                    <span
                                      className={
                                        budgetSummary.finansielScore >= 70
                                          ? "text-green-500"
                                          : budgetSummary.finansielScore >= 40
                                            ? "text-yellow-500"
                                            : "text-red-500"
                                      }
                                    >
                                      {budgetSummary.finansielScore}/100
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                      className={`h-2.5 rounded-full ${
                                        budgetSummary.finansielScore >= 70
                                          ? "bg-green-500"
                                          : budgetSummary.finansielScore >= 40
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                      }`}
                                      style={{ width: `${budgetSummary.finansielScore}%` }}
                                    ></div>
                                  </div>
                                </div>

                                <div className="pt-4">
                                  <h4 className="font-medium mb-2">Anbefalinger</h4>
                                  <ul className="space-y-2 text-sm">
                                    {budgetSummary.raadighed < 0 && (
                                      <li className="flex items-start">
                                        <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                                        <span>
                                          Dit budget viser et underskud. Overvej at reducere dine udgifter eller øge
                                          dine indtægter.
                                        </span>
                                      </li>
                                    )}
                                    {budgetSummary.raadighed >= 0 &&
                                      budgetSummary.raadighed < budgetSummary.totalIndtaegter * 0.1 && (
                                        <li className="flex items-start">
                                          <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                                          <span>
                                            Dit rådighedsbeløb er lavt. Prøv at finde områder hvor du kan spare.
                                          </span>
                                        </li>
                                      )}
                                    {form.getValues().opsparing < budgetSummary.totalIndtaegter * 0.1 && (
                                      <li className="flex items-start">
                                        <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                                        <span>
                                          Din opsparing er under 10% af din indkomst. Overvej at øge din månedlige
                                          opsparing.
                                        </span>
                                      </li>
                                    )}
                                    {budgetSummary.kategoriTotaler.bolig > budgetSummary.totalIndtaegter * 0.4 && (
                                      <li className="flex items-start">
                                        <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                                        <span>Dine boligudgifter udgør over 40% af din indkomst, hvilket er højt.</span>
                                      </li>
                                    )}
                                    {budgetSummary.raadighed >= budgetSummary.totalIndtaegter * 0.2 && (
                                      <li className="flex items-start">
                                        <AlertCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                        <span>
                                          Du har et godt rådighedsbeløb. Overvej at øge din opsparing eller investering.
                                        </span>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        <h3 className="text-lg font-medium">Fremtidsprognose</h3>
                        <Separator />

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Udvikling over tid</CardTitle>
                            <CardDescription>
                              Estimeret udvikling i din økonomi over de næste{" "}
                              {form.getValues().budgetPeriode === "månedlig"
                                ? "12 måneder"
                                : form.getValues().budgetPeriode === "kvartalsvis"
                                  ? "12 kvartaler"
                                  : "12 år"}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Periode</TableHead>
                                    <TableHead>Indtægter</TableHead>
                                    <TableHead>Udgifter</TableHead>
                                    <TableHead>Rådighedsbeløb</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {budgetPerioder.map((periode, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{periode.periode}</TableCell>
                                      <TableCell>{formatCurrency(periode.indtaegter)}</TableCell>
                                      <TableCell>{formatCurrency(periode.udgifter)}</TableCell>
                                      <TableCell className={periode.raadighed >= 0 ? "text-green-500" : "text-red-500"}>
                                        {formatCurrency(periode.raadighed)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="flex justify-between mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab("daglige")}
                          className="flex items-center"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Tilbage: Daglige udgifter
                        </Button>
                        <div className="space-x-2">
                          <Button type="button" variant="outline" onClick={saveBudget}>
                            Gem budget
                          </Button>
                          <Button type="button" onClick={downloadExcel}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Excel
                          </Button>
                        </div>
                      </div>

                      {aiRecommendation && (
                        <div className="mt-6">
                          <AIRecommendation data={aiRecommendation} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        Udfyld budgettet og klik på "Beregn budget" for at se resultatet.
                      </p>
                      <Button type="button" onClick={() => setActiveTab("oversigt")} variant="outline" className="mt-4">
                        Gå til budgetformular
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center pt-4">
          <CalculatorTracker />
        </CardFooter>
      </Card>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bekræft import af data</DialogTitle>
            <DialogDescription>
              Er du sikker på, at du vil importere data fra den valgte fil? Dette vil overskrive de nuværende værdier i
              budgettet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Annuller
            </Button>
            <Button onClick={applyImportedData}>Importer data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BudgetPageContent
