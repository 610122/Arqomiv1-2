/**
 * Regelbaserede "AI"-analyse-engines for hver beregner.
 *
 * Hver funktion tager en løst typet input-struct og returnerer et AIRecommendationData
 * objekt, som <AIRecommendation /> kan rendere.
 *
 * Alt er deterministisk - ingen netværkskald.
 */

import type { AIRecommendationData } from "@/components/ai-recommendation"
import { clampScore, formatDKK, formatPct } from "@/components/ai-recommendation"

/* -------------------------------------------------------------------------- */
/* Hjælpere                                                                   */
/* -------------------------------------------------------------------------- */

const safeNum = (v: unknown, fallback = 0): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const annuityMonthly = (principal: number, annualRatePct: number, termYears: number): number => {
  const n = termYears * 12
  if (n <= 0 || principal <= 0) return 0
  const r = annualRatePct / 100 / 12
  if (r === 0) return principal / n
  return (principal * r) / (1 - Math.pow(1 + r, -n))
}

const futureValue = (
  initial: number,
  monthlyContribution: number,
  annualRatePct: number,
  years: number,
): number => {
  const n = years * 12
  const r = annualRatePct / 100 / 12
  if (r === 0) return initial + monthlyContribution * n
  const fvInitial = initial * Math.pow(1 + r, n)
  const fvContrib = monthlyContribution * ((Math.pow(1 + r, n) - 1) / r)
  return fvInitial + fvContrib
}

/* -------------------------------------------------------------------------- */
/* Lån                                                                        */
/* -------------------------------------------------------------------------- */

export interface LaanInput {
  loanAmount: number
  interestRate: number
  loanTerm: number
  monthlyIncome: number
  monthlyExpenses: number
  downPayment?: number
  propertyValue?: number
}

export function analyzeLaan(input: LaanInput): AIRecommendationData {
  const loanAmount = safeNum(input.loanAmount)
  const rate = safeNum(input.interestRate)
  const term = safeNum(input.loanTerm)
  const income = Math.max(1, safeNum(input.monthlyIncome))
  const expenses = safeNum(input.monthlyExpenses)
  const downPayment = safeNum(input.downPayment)
  const propertyValue = safeNum(input.propertyValue)

  const monthlyPayment = annuityMonthly(loanAmount, rate, term)
  const totalPaid = monthlyPayment * term * 12
  const totalInterest = Math.max(0, totalPaid - loanAmount)
  const disposable = income - expenses - monthlyPayment
  const dti = (monthlyPayment / income) * 100
  const ltv = propertyValue > 0 ? ((loanAmount) / propertyValue) * 100 : 0

  // Scenario: 2 år kortere løbetid
  const shorterTerm = Math.max(1, term - 2)
  const monthlyShorter = annuityMonthly(loanAmount, rate, shorterTerm)
  const interestShorter = Math.max(0, monthlyShorter * shorterTerm * 12 - loanAmount)
  const interestSaved = Math.max(0, totalInterest - interestShorter)

  // Score-beregning
  let score = 10
  if (dti > 35) score -= 3
  else if (dti > 28) score -= 1.5
  if (disposable < 0) score -= 3
  else if (disposable < income * 0.1) score -= 1.5
  if (ltv > 95) score -= 2
  else if (ltv > 80) score -= 0.5
  if (rate > 7) score -= 1
  if (rate < 3 && rate > 0) score += 0.5
  score = clampScore(score)

  let headline = "Lånet ser fornuftigt ud i forhold til din økonomi"
  if (score < 5) headline = "Lånet er stramt i forhold til din økonomi - overvej justeringer"
  else if (score < 7) headline = "Lånet er overkommeligt, men der er plads til optimering"
  else if (score >= 8.5) headline = "Stærk økonomi til dette lån - god position"

  const summary = [
    `Du låner ${formatDKK(loanAmount)} over ${term} år til ${formatPct(rate)} rente, hvilket giver en månedlig ydelse på ${formatDKK(monthlyPayment)}.`,
    `Dine boligudgifter udgør ${formatPct(dti)} af din indkomst${dti > 28 ? " - det er i den høje ende (under 28 % anbefales)" : dti < 20 ? " - det er komfortabelt lavt" : ""}.`,
    disposable < 0
      ? `Dit rådighedsbeløb bliver negativt (${formatDKK(disposable)}) - lånet er ikke bæredygtigt uden ændringer.`
      : `Efter afdrag har du ${formatDKK(disposable)} tilbage hver måned til øvrige formål.`,
    `Over hele lånets løbetid betaler du ${formatDKK(totalInterest)} i renter oven i selve lånet.`,
  ].join(" ")

  const metrics = [
    {
      label: "Månedlig ydelse",
      value: formatDKK(monthlyPayment),
      description: `${formatPct(dti)} af din bruttoindkomst`,
      tone: dti > 35 ? ("negative" as const) : dti < 25 ? ("positive" as const) : ("neutral" as const),
    },
    {
      label: "Rente i alt",
      value: formatDKK(totalInterest),
      description: `${formatPct((totalInterest / Math.max(1, loanAmount)) * 100)} af lånebeløbet`,
      tone: "neutral" as const,
    },
    {
      label: "Rådighedsbeløb",
      value: formatDKK(disposable),
      description: disposable < 0 ? "Underskud hver måned" : "Til øvrige udgifter og opsparing",
      tone: disposable < 0 ? ("negative" as const) : ("positive" as const),
    },
    {
      label: "Potentiel rentebesparelse",
      value: formatDKK(interestSaved),
      description: `Ved at afdrage lånet på ${shorterTerm} år i stedet for ${term}`,
      tone: "positive" as const,
    },
  ]

  // Chart: udvikling af renter + restgæld over årene
  const chartData = Array.from({ length: Math.min(term, 30) + 1 }).map((_, year) => {
    const monthsPassed = year * 12
    const r = rate / 100 / 12
    let remaining = loanAmount
    if (r === 0) {
      remaining = Math.max(0, loanAmount - monthlyPayment * monthsPassed)
    } else {
      remaining = Math.max(0, loanAmount * Math.pow(1 + r, monthsPassed) - monthlyPayment * ((Math.pow(1 + r, monthsPassed) - 1) / r))
    }
    const paid = monthlyPayment * monthsPassed
    const interestPaid = Math.max(0, paid - (loanAmount - remaining))
    return {
      label: `År ${year}`,
      "Restgæld": Math.round(remaining),
      "Betalt rente i alt": Math.round(interestPaid),
    }
  })

  const actionItems: AIRecommendationData["actionItems"] = []
  if (dti > 35 || disposable < 0) {
    actionItems.push({
      priority: "kritisk",
      title: "Reducér lånebeløbet eller forlæng løbetiden",
      description:
        "Din månedlige ydelse er for høj i forhold til din indkomst. Overvej en lavere lånesum, længere løbetid eller at øge din indkomst inden du låner.",
      impact: `Sænk ydelse til under ${formatDKK(income * 0.28)}`,
    })
  }
  if (interestSaved > 20000) {
    actionItems.push({
      priority: "høj",
      title: `Overvej ${shorterTerm} års løbetid i stedet for ${term} år`,
      description:
        "Ved at forkorte løbetiden med to år stiger din månedlige ydelse, men du sparer et stort beløb i samlede renter.",
      impact: `Sparer ${formatDKK(interestSaved)} i renter`,
    })
  }
  if (ltv > 80) {
    actionItems.push({
      priority: "høj",
      title: "Øg udbetaling hvis muligt",
      description:
        "Med en belåningsgrad over 80 % betaler du ofte højere rente og kan ikke undgå kurstab. En større udbetaling giver bedre vilkår.",
    })
  }
  if (rate > 5) {
    actionItems.push({
      priority: "middel",
      title: "Hent tilbud fra mindst 2-3 banker",
      description:
        "Din rente er i den høje ende. Selv 0,5 % lavere rente kan spare dig for betydelige beløb over lånets løbetid.",
      impact: "0,5 % lavere rente kan spare 10.000–50.000 kr.",
    })
  }
  actionItems.push({
    priority: "lav",
    title: "Opbyg en buffer på 3-6 måneders ydelse",
    description:
      "En likvid opsparing sikrer, at du kan betale lånet selv ved sygdom eller jobskift. Det er den vigtigste sikring mod renteforhøjelser.",
  })

  return {
    score,
    headline,
    summary,
    metrics,
    chart: {
      type: "line",
      title: "Lånets udvikling over tid",
      description: "Hvordan din restgæld falder og hvor meget rente du har betalt",
      valueFormat: "currency",
      series: [
        { name: "Restgæld", color: "#2563eb" },
        { name: "Betalt rente i alt", color: "#f59e0b" },
      ],
      data: chartData,
    },
    actionItems,
  }
}

/* -------------------------------------------------------------------------- */
/* Investering                                                                */
/* -------------------------------------------------------------------------- */

export interface InvesteringInput {
  initialAmount: number
  monthlyContribution: number
  years: number
  expectedReturn: number
  riskProfile?: "lav" | "mellem" | "høj"
}

export function analyzeInvestering(input: InvesteringInput): AIRecommendationData {
  const init = safeNum(input.initialAmount)
  const monthly = safeNum(input.monthlyContribution)
  const years = Math.max(1, safeNum(input.years))
  const rate = safeNum(input.expectedReturn)
  const risk = input.riskProfile ?? "mellem"

  const totalInvested = init + monthly * years * 12
  const fv = futureValue(init, monthly, rate, years)
  const gain = fv - totalInvested

  // Scenarier: 1 % højere/lavere afkast
  const fvLow = futureValue(init, monthly, Math.max(0, rate - 2), years)
  const fvHigh = futureValue(init, monthly, rate + 2, years)

  // Scenarie: 500 kr. ekstra om måneden
  const fvExtra = futureValue(init, monthly + 500, rate, years)
  const extraGain = fvExtra - fv

  let score = 7
  if (monthly > 2000) score += 1
  if (years >= 15) score += 1.5
  else if (years >= 10) score += 0.5
  if (rate > 8) score -= 0.5 // urealistisk optimistisk
  if (init === 0 && monthly === 0) score = 0
  if (risk === "høj" && years < 5) score -= 2
  score = clampScore(score)

  const headline =
    years >= 10 && monthly >= 1500
      ? "God investeringsplan med stærkt langsigtet potentiale"
      : years < 5
        ? "Kort tidshorisont - overvej at investere længere"
        : "Fornuftig plan - kan optimeres yderligere"

  const summary = [
    `Med ${formatDKK(init)} som startkapital og ${formatDKK(monthly)} om måneden investeret til ${formatPct(rate)} årligt afkast forventes din portefølje at vokse til ${formatDKK(fv)} efter ${years} år.`,
    `Du indbetaler i alt ${formatDKK(totalInvested)}, og renters rente genererer ${formatDKK(gain)} i afkast - det svarer til ${formatPct((gain / Math.max(1, totalInvested)) * 100)} af dine indbetalinger.`,
    years < 5
      ? "En kort tidshorisont gør dig mere sårbar over for markedsudsving - overvej at skrue ned for risikoen."
      : years >= 15
        ? "Din lange tidshorisont er din største styrke - renters rente får tid til at arbejde."
        : "Tidshorisonten er fornuftig, men endnu længere tid ville øge effekten af renters rente markant.",
  ].join(" ")

  const metrics = [
    {
      label: "Forventet slutværdi",
      value: formatDKK(fv),
      description: `Efter ${years} år`,
      tone: "positive" as const,
    },
    {
      label: "Samlet afkast",
      value: formatDKK(gain),
      description: `${formatPct((gain / Math.max(1, totalInvested)) * 100)} udover indbetalinger`,
      tone: "positive" as const,
    },
    {
      label: "Hvis du sparer 500 kr. ekstra/mdr.",
      value: formatDKK(fvExtra),
      description: `Ekstra ${formatDKK(extraGain)} i slutværdi`,
      tone: "positive" as const,
    },
    {
      label: "Ved 2 % lavere afkast",
      value: formatDKK(fvLow),
      description: "Pessimistisk scenarie",
      tone: "neutral" as const,
    },
  ]

  // Chart: værdiudvikling over år med 3 afkast-niveauer
  const chartData = Array.from({ length: years + 1 }).map((_, y) => ({
    label: `År ${y}`,
    "Pessimistisk (−2 %)": Math.round(futureValue(init, monthly, Math.max(0, rate - 2), y)),
    "Forventet": Math.round(futureValue(init, monthly, rate, y)),
    "Optimistisk (+2 %)": Math.round(futureValue(init, monthly, rate + 2, y)),
  }))

  const actionItems: AIRecommendationData["actionItems"] = []
  if (monthly < 1000 && init < 50000) {
    actionItems.push({
      priority: "høj",
      title: "Øg den månedlige indbetaling",
      description:
        "Selv 500-1000 kr. mere om måneden har en stor effekt over mange år på grund af renters rente. Automatiske overførsler på lønningsdagen gør det nemmere.",
      impact: `500 kr. mere/mdr. = ${formatDKK(extraGain)} mere om ${years} år`,
    })
  }
  if (years < 10) {
    actionItems.push({
      priority: "middel",
      title: "Forlæng din investeringshorisont",
      description:
        "Renters rente virker først for alvor over 10-15+ år. Hvis du kan binde pengene længere, øger du forventet afkast markant.",
    })
  }
  if (rate > 8) {
    actionItems.push({
      priority: "middel",
      title: "Juster dine afkastforventninger",
      description:
        "Historisk gennemsnit for bredt diversificerede aktieporteføljer ligger på 6-8 % før inflation. Højere forventninger kan føre til skuffelser.",
    })
  }
  actionItems.push({
    priority: "middel",
    title: "Spred investeringerne",
    description:
      "Fordel mellem brede indeksfonde (fx globale aktier og obligationer) for at minimere risiko uden at ofre afkast. Aktiesparekonto giver lav beskatning.",
  })
  actionItems.push({
    priority: "lav",
    title: "Gennemgå porteføljen årligt",
    description:
      "Rebalancer en gang om året så din fordeling stemmer med din risikoprofil. Undgå at tjekke dagligt - det fører ofte til dårlige beslutninger.",
  })

  return {
    score,
    headline,
    summary,
    metrics,
    chart: {
      type: "line",
      title: "Værdiudvikling over tid i 3 scenarier",
      description: "Hvordan din investering kan udvikle sig afhængigt af markedsafkast",
      valueFormat: "currency",
      series: [
        { name: "Pessimistisk (−2 %)", color: "#ef4444" },
        { name: "Forventet", color: "#2563eb" },
        { name: "Optimistisk (+2 %)", color: "#10b981" },
      ],
      data: chartData,
    },
    actionItems,
  }
}

/* -------------------------------------------------------------------------- */
/* Opsparing                                                                  */
/* -------------------------------------------------------------------------- */

export interface OpsparingInput {
  monthlyIncome: number
  monthlyExpenses: number
  currentSavings: number
  savingsGoals: Array<{ name: string; targetAmount: number; currentAmount: number; timeframe: number }>
  savingsPercentage: number
}

export function analyzeOpsparing(input: OpsparingInput): AIRecommendationData {
  const income = Math.max(1, safeNum(input.monthlyIncome))
  const expenses = safeNum(input.monthlyExpenses)
  const savings = safeNum(input.currentSavings)
  const pct = safeNum(input.savingsPercentage)
  const goals = input.savingsGoals ?? []

  const capacity = Math.max(0, income - expenses)
  const savingsRate = (capacity / income) * 100
  const plannedMonthly = income * (pct / 100)
  const emergencyFund = expenses * 6
  const emergencyProgress = Math.min(100, (savings / Math.max(1, emergencyFund)) * 100)

  const totalNeeded = goals.reduce((sum, g) => sum + Math.max(0, safeNum(g.targetAmount) - safeNum(g.currentAmount)), 0)
  const monthsToGoals = capacity > 0 ? Math.ceil(totalNeeded / capacity) : Infinity
  const yearsAt1Pct = capacity > 0 ? futureValue(savings, capacity, 1, 5) : savings
  const yearsAt5Pct = capacity > 0 ? futureValue(savings, capacity, 5, 5) : savings
  const interestDifference = yearsAt5Pct - yearsAt1Pct

  let score = 5
  if (savingsRate >= 20) score += 3
  else if (savingsRate >= 10) score += 1.5
  else if (savingsRate < 5) score -= 2
  if (emergencyProgress >= 100) score += 1.5
  else if (emergencyProgress >= 50) score += 0.5
  else score -= 1
  if (goals.length >= 2) score += 0.5
  score = clampScore(score)

  const headline =
    savingsRate >= 20 && emergencyProgress >= 100
      ? "Stærk opsparingsprofil - god forudseenhed"
      : savingsRate < 5
        ? "Meget lav opsparingsrate - højeste prioritet er at komme i gang"
        : "Fornuftig opsparing - fokuser nu på at sikre nødopsparing og mål"

  const summary = [
    `Din månedlige opsparingskapacitet er ${formatDKK(capacity)} (${formatPct(savingsRate)} af indkomsten).`,
    emergencyProgress < 100
      ? `Din nødopsparing er ${formatPct(emergencyProgress)} færdig - du mangler ${formatDKK(Math.max(0, emergencyFund - savings))} for at have 6 måneders udgifter i buffer.`
      : "Din nødopsparing dækker mindst 6 måneders udgifter - et stærkt fundament.",
    monthsToGoals !== Infinity && totalNeeded > 0
      ? `Med dit nuværende tempo vil du nå dine mål om ${monthsToGoals} måneder (~${(monthsToGoals / 12).toFixed(1)} år).`
      : totalNeeded > 0
        ? "Med nuværende indtægt/udgifter kan du ikke nå dine mål - skal enten reducere udgifter eller øge indkomst."
        : "Du har ingen definerede mål endnu - overvej at sætte konkrete beløb og deadlines.",
    `Hvis du placerer opsparingen til 5 % afkast fremfor 1 %, ville du have ${formatDKK(interestDifference)} mere om 5 år.`,
  ].join(" ")

  const metrics = [
    {
      label: "Opsparingsrate",
      value: formatPct(savingsRate),
      description: "Af din månedlige indkomst",
      tone: savingsRate >= 15 ? ("positive" as const) : savingsRate < 10 ? ("negative" as const) : ("neutral" as const),
    },
    {
      label: "Nødopsparing",
      value: formatPct(emergencyProgress),
      description: `${formatDKK(savings)} af anbefalede ${formatDKK(emergencyFund)}`,
      tone: emergencyProgress >= 100 ? ("positive" as const) : ("negative" as const),
    },
    {
      label: "Mangler til dine mål",
      value: formatDKK(totalNeeded),
      description: monthsToGoals !== Infinity ? `~${monthsToGoals} måneder ved nuværende tempo` : "Ikke opnåeligt nu",
      tone: "neutral" as const,
    },
    {
      label: "Tjent med renters rente",
      value: formatDKK(interestDifference),
      description: "Ved 5 % i stedet for 1 % afkast over 5 år",
      tone: "positive" as const,
    },
  ]

  const chartData = [1, 2, 3, 4, 5].map((y) => ({
    label: `År ${y}`,
    "Opsparingskonto (1 %)": Math.round(futureValue(savings, capacity, 1, y)),
    "Aktiesparekonto (5 %)": Math.round(futureValue(savings, capacity, 5, y)),
    "Aktier bredt marked (7 %)": Math.round(futureValue(savings, capacity, 7, y)),
  }))

  const actionItems: AIRecommendationData["actionItems"] = []
  if (emergencyProgress < 50) {
    actionItems.push({
      priority: "kritisk",
      title: "Opbyg en nødopsparing på 3-6 måneders udgifter",
      description:
        "Dette er vigtigere end alle andre økonomiske mål. Uden en buffer tvinges du til at låne eller sælge investeringer ved uforudsete udgifter.",
      impact: `Mål: ${formatDKK(emergencyFund)}`,
    })
  }
  if (savingsRate < 10) {
    actionItems.push({
      priority: "høj",
      title: "Gennemgå månedlige udgifter og sæt opsparing først",
      description:
        "Automatiske overførsler på lønningsdagen er den mest effektive metode. Start småt (fx 500 kr.) og trap op.",
    })
  }
  if (interestDifference > 10000) {
    actionItems.push({
      priority: "høj",
      title: "Flyt langsigtet opsparing til højere afkast",
      description:
        "Penge der skal bruges om 5+ år bør ikke stå på almindelig opsparingskonto. Aktiesparekonto eller investeringsforeninger giver historisk bedre afkast.",
      impact: `Potentielt ${formatDKK(interestDifference)} mere over 5 år`,
    })
  }
  if (goals.length === 0) {
    actionItems.push({
      priority: "middel",
      title: "Sæt konkrete opsparingsmål",
      description:
        "Mål med deadline og beløb er markant mere motiverende end vage idéer. Start med 2-3 mål.",
    })
  }
  actionItems.push({
    priority: "lav",
    title: "Gennemgå opsparingen kvartalvis",
    description:
      "Juster beløb ved løn-ændringer og store livsbegivenheder. Flyt nødopsparingen til højrente-konto hvis muligt.",
  })

  return {
    score,
    headline,
    summary,
    metrics,
    chart: {
      type: "line",
      title: "Forskel i opsparingstyper over 5 år",
      description: "Samme månedlige indbetaling - meget forskelligt afkast",
      valueFormat: "currency",
      series: [
        { name: "Opsparingskonto (1 %)", color: "#94a3b8" },
        { name: "Aktiesparekonto (5 %)", color: "#2563eb" },
        { name: "Aktier bredt marked (7 %)", color: "#10b981" },
      ],
      data: chartData,
    },
    actionItems,
  }
}

/* -------------------------------------------------------------------------- */
/* Budget                                                                     */
/* -------------------------------------------------------------------------- */

export interface BudgetInput {
  income: number
  fixedExpenses: number
  variableExpenses: number
  savings: number
  housing?: number
  transport?: number
  food?: number
  other?: number
}

export function analyzeBudget(input: BudgetInput): AIRecommendationData {
  const income = Math.max(1, safeNum(input.income))
  const fixed = safeNum(input.fixedExpenses)
  const variable = safeNum(input.variableExpenses)
  const savings = safeNum(input.savings)
  const housing = safeNum(input.housing)
  const transport = safeNum(input.transport)
  const food = safeNum(input.food)
  const other = safeNum(input.other)

  const totalExpenses = fixed + variable
  const balance = income - totalExpenses - savings
  const expenseRate = (totalExpenses / income) * 100
  const savingsRate = (savings / income) * 100
  const housingRate = (housing / income) * 100

  // 50/30/20 referencemodel
  const ref50 = income * 0.5
  const ref30 = income * 0.3
  const ref20 = income * 0.2

  // Potentiel besparelse ved at lægge 5 % om på variable udgifter
  const variablesSavings = variable * 0.1
  const yearlySavings = variablesSavings * 12

  let score = 7
  if (balance < 0) score -= 4
  else if (balance < 500) score -= 2
  if (savingsRate >= 20) score += 1.5
  else if (savingsRate < 5) score -= 1
  if (housingRate > 35) score -= 1
  if (expenseRate > 90) score -= 1.5
  score = clampScore(score)

  const headline =
    balance < 0
      ? "Budgettet er i underskud - skal justeres"
      : savingsRate >= 20 && balance > 0
        ? "Sundt budget med god opsparingsrate"
        : "Budgettet er i balance men kan optimeres"

  const summary = [
    `Med en månedlig indkomst på ${formatDKK(income)} og udgifter på ${formatDKK(totalExpenses)} har du ${balance >= 0 ? "et overskud" : "et underskud"} på ${formatDKK(Math.abs(balance))}.`,
    `Din opsparingsrate er ${formatPct(savingsRate)} - 50/30/20-reglen anbefaler 20 % til opsparing.`,
    housingRate > 35
      ? `Boligudgifterne udgør ${formatPct(housingRate)} af indkomsten (over 35 % er højt) - det gør budgettet sårbart.`
      : housingRate > 0
        ? `Boligudgifterne udgør ${formatPct(housingRate)} af indkomsten - det er inden for anbefalet niveau.`
        : "",
    `Ved at skære 10 % af variable udgifter (mad, underholdning, shopping) kan du frigøre ${formatDKK(yearlySavings)} om året.`,
  ]
    .filter(Boolean)
    .join(" ")

  const metrics = [
    {
      label: "Månedligt overskud",
      value: formatDKK(balance),
      description: balance < 0 ? "Underskud - budget går ikke op" : "Til fri disponering eller ekstra opsparing",
      tone: balance < 0 ? ("negative" as const) : ("positive" as const),
    },
    {
      label: "Opsparingsrate",
      value: formatPct(savingsRate),
      description: "Anbefalet: min. 20 % (50/30/20-reglen)",
      tone: savingsRate >= 20 ? ("positive" as const) : ("neutral" as const),
    },
    {
      label: "Udgiftsprocent",
      value: formatPct(expenseRate),
      description: `${formatDKK(totalExpenses)} af ${formatDKK(income)}`,
      tone: expenseRate > 90 ? ("negative" as const) : ("neutral" as const),
    },
    {
      label: "Årlig besparelse ved −10 % variable",
      value: formatDKK(yearlySavings),
      description: "Ved at skære lidt i mad/underholdning/shopping",
      tone: "positive" as const,
    },
  ]

  const chartData = [
    { label: "Behov (50 %)", "Dit budget": Math.round(fixed), "50/30/20 anbefaling": Math.round(ref50) },
    { label: "Ønsker (30 %)", "Dit budget": Math.round(variable), "50/30/20 anbefaling": Math.round(ref30) },
    { label: "Opsparing (20 %)", "Dit budget": Math.round(savings), "50/30/20 anbefaling": Math.round(ref20) },
  ]

  const actionItems: AIRecommendationData["actionItems"] = []
  if (balance < 0) {
    actionItems.push({
      priority: "kritisk",
      title: "Balancér budgettet - udgifter må ikke overstige indkomsten",
      description:
        "Start med de største udgiftsposter (bolig, transport, abonnementer) og find besparelser. Alternativt skal indkomsten øges.",
      impact: `Du mangler ${formatDKK(-balance)} om måneden`,
    })
  }
  if (housingRate > 35) {
    actionItems.push({
      priority: "høj",
      title: "Overvej lavere boligudgifter",
      description:
        "Boligudgifter over 35 % af indkomsten gør dig sårbar over for uforudsete udgifter. Kan du refinansiere, bytte bolig eller dele udgifterne?",
    })
  }
  if (savingsRate < 10) {
    actionItems.push({
      priority: "høj",
      title: "Automatiser opsparingen fra lønningsdag",
      description:
        "Opret fast overførsel samme dag du får løn. Når pengene ikke når kontoen, bruger du dem ikke. Start med 5 % og trap op.",
      impact: `Mål: mindst ${formatDKK(income * 0.2)}/mdr.`,
    })
  }
  if (variable > fixed * 0.7) {
    actionItems.push({
      priority: "middel",
      title: "Gennemgå variable udgifter i detaljer",
      description:
        "Find ud af hvor pengene egentlig går hen (bank-app eller regneark). Ofte er der 10-20 % at hente uden at mærke det.",
      impact: `Potentielt ${formatDKK(yearlySavings)}/år`,
    })
  }
  actionItems.push({
    priority: "lav",
    title: "Gennemgå abonnementer 2 gange om året",
    description:
      "Streaming, apps, fitness - opsig det du ikke bruger. Forhandl forsikringer og teleabonnementer hvert år.",
  })

  return {
    score,
    headline,
    summary,
    metrics,
    chart: {
      type: "bar",
      title: "Dit budget vs. 50/30/20-reglen",
      description: "50 % behov, 30 % ønsker, 20 % opsparing - en populær finansiel huskeregel",
      valueFormat: "currency",
      series: [
        { name: "Dit budget", color: "#2563eb" },
        { name: "50/30/20 anbefaling", color: "#10b981" },
      ],
      data: chartData,
    },
    actionItems,
  }
}

/* -------------------------------------------------------------------------- */
/* Gæld                                                                       */
/* -------------------------------------------------------------------------- */

export interface GaeldInput {
  debts: Array<{ name: string; amount: number; interestRate: number; minimumPayment: number }>
  monthlyIncome: number
  monthlyExpenses: number
}

export function analyzeGaeld(input: GaeldInput): AIRecommendationData {
  const debts = input.debts ?? []
  const income = Math.max(1, safeNum(input.monthlyIncome))
  const expenses = safeNum(input.monthlyExpenses)

  const totalDebt = debts.reduce((s, d) => s + safeNum(d.amount), 0)
  const totalMin = debts.reduce((s, d) => s + safeNum(d.minimumPayment), 0)
  const avgRate =
    totalDebt > 0
      ? debts.reduce((s, d) => s + safeNum(d.amount) * safeNum(d.interestRate), 0) / totalDebt
      : 0
  const yearlyInterest = totalDebt * (avgRate / 100)
  const dti = (totalMin / income) * 100
  const disposable = income - expenses - totalMin

  // Avalanche: simuler hvor lang tid gælden tager hvis man betaler minimum på alle + ekstra på den med højeste rente
  const extraPayment = Math.max(500, disposable * 0.5)
  const simulateAvalanche = () => {
    let remaining = debts.map((d) => ({ ...d, amount: safeNum(d.amount) }))
    let months = 0
    let totalInterestPaid = 0
    while (remaining.some((d) => d.amount > 0) && months < 600) {
      months++
      // renter tilskrives
      remaining = remaining.map((d) => {
        if (d.amount <= 0) return d
        const int = (d.amount * (safeNum(d.interestRate) / 100)) / 12
        totalInterestPaid += int
        return { ...d, amount: d.amount + int }
      })
      // minimum betalinger
      remaining = remaining.map((d) => {
        if (d.amount <= 0) return d
        const pay = Math.min(safeNum(d.minimumPayment), d.amount)
        return { ...d, amount: Math.max(0, d.amount - pay) }
      })
      // ekstra på højeste rente
      const active = remaining.filter((d) => d.amount > 0).sort((a, b) => safeNum(b.interestRate) - safeNum(a.interestRate))
      if (active.length > 0) {
        const target = active[0]
        const pay = Math.min(extraPayment, target.amount)
        const idx = remaining.findIndex((d) => d.name === target.name)
        if (idx >= 0) remaining[idx] = { ...remaining[idx], amount: Math.max(0, remaining[idx].amount - pay) }
      }
    }
    return { months, totalInterestPaid }
  }

  // Uden ekstra betaling (kun minimum)
  const simulateMinimum = () => {
    let remaining = debts.map((d) => ({ ...d, amount: safeNum(d.amount) }))
    let months = 0
    let totalInterestPaid = 0
    while (remaining.some((d) => d.amount > 0) && months < 1200) {
      months++
      remaining = remaining.map((d) => {
        if (d.amount <= 0) return d
        const int = (d.amount * (safeNum(d.interestRate) / 100)) / 12
        totalInterestPaid += int
        const pay = Math.min(safeNum(d.minimumPayment), d.amount + int)
        return { ...d, amount: Math.max(0, d.amount + int - pay) }
      })
    }
    return { months, totalInterestPaid }
  }

  const avalanche = totalDebt > 0 ? simulateAvalanche() : { months: 0, totalInterestPaid: 0 }
  const minOnly = totalDebt > 0 ? simulateMinimum() : { months: 0, totalInterestPaid: 0 }
  const monthsSaved = Math.max(0, minOnly.months - avalanche.months)
  const interestSaved = Math.max(0, minOnly.totalInterestPaid - avalanche.totalInterestPaid)

  let score = 10
  if (dti > 40) score -= 4
  else if (dti > 30) score -= 2
  else if (dti > 20) score -= 0.5
  if (avgRate > 15) score -= 2
  else if (avgRate > 10) score -= 1
  if (debts.length > 5) score -= 1
  if (disposable < 0) score -= 2
  score = clampScore(score)

  const headline =
    dti > 40
      ? "Høj gældsbelastning - handling er nødvendig"
      : totalDebt === 0
        ? "Ingen gæld registreret"
        : dti < 20 && avgRate < 8
          ? "Gælden er håndterbar og lav-rente"
          : "Gælden er under kontrol, men kan betales hurtigere ned"

  const summary = [
    totalDebt === 0
      ? "Du har ikke indtastet nogen gæld - hvis du er gældfri, er det en stærk finansiel position."
      : `Din samlede gæld er ${formatDKK(totalDebt)} fordelt på ${debts.length} ${debts.length === 1 ? "post" : "poster"} med en gennemsnitlig rente på ${formatPct(avgRate)}.`,
    totalDebt > 0 ? `Du bruger ${formatDKK(totalMin)} om måneden (${formatPct(dti)} af indkomsten) på minimumbetalinger.` : "",
    avalanche.months > 0
      ? `Med avalanche-strategien (ekstra ${formatDKK(extraPayment)}/mdr. på gælden med højest rente) er du gældfri om ${avalanche.months} måneder (~${(avalanche.months / 12).toFixed(1)} år).`
      : "",
    interestSaved > 0
      ? `Du sparer ${formatDKK(interestSaved)} i renter og er ${monthsSaved} måneder hurtigere ude af gæld end ved kun minimumbetalinger.`
      : "",
  ]
    .filter(Boolean)
    .join(" ")

  const metrics = [
    {
      label: "Samlet gæld",
      value: formatDKK(totalDebt),
      description: `${debts.length} ${debts.length === 1 ? "post" : "poster"}`,
      tone: "neutral" as const,
    },
    {
      label: "Gæld-til-indkomst",
      value: formatPct(dti),
      description: dti > 35 ? "Højt - under 35 % anbefales" : "Inden for sund grænse",
      tone: dti > 35 ? ("negative" as const) : ("positive" as const),
    },
    {
      label: "Årlig rente-omkostning",
      value: formatDKK(yearlyInterest),
      description: `Gennemsnitlig ${formatPct(avgRate)} på samlet gæld`,
      tone: avgRate > 10 ? ("negative" as const) : ("neutral" as const),
    },
    {
      label: "Potentiel rentebesparelse",
      value: formatDKK(interestSaved),
      description: `Ved avalanche + ${formatDKK(extraPayment)}/mdr. ekstra`,
      tone: "positive" as const,
    },
  ]

  const chartData = debts.map((d) => ({
    label: d.name || "Gæld",
    "Restgæld": Math.round(safeNum(d.amount)),
    "Årlig rente": Math.round(safeNum(d.amount) * (safeNum(d.interestRate) / 100)),
  }))

  const actionItems: AIRecommendationData["actionItems"] = []
  if (dti > 40) {
    actionItems.push({
      priority: "kritisk",
      title: "Søg rådgivning om gældssanering",
      description:
        "Over 40 % af din indkomst går til gæld - det er ikke bæredygtigt. Kontakt din bank, Gældsrådgivningen eller en kommunal rådgiver hurtigst muligt.",
    })
  }
  if (avgRate > 12 && totalDebt > 20000) {
    actionItems.push({
      priority: "kritisk",
      title: "Konsolider dyr gæld (kreditkort, SMS-lån)",
      description:
        "Med gennemsnitsrente over 12 % kan det betale sig at samle gælden i et forbrugslån til lavere rente. Spar evt. via bankskift.",
      impact: `Kan halvere renteomkostningen`,
    })
  }
  if (debts.length > 1 && interestSaved > 5000) {
    actionItems.push({
      priority: "høj",
      title: "Brug avalanche-strategien",
      description:
        "Betal minimum på alle gældsposter, og læg ekstra betaling på den med højeste rente først. Det sparer mest i renter matematisk set.",
      impact: `Sparer ${formatDKK(interestSaved)} og ${monthsSaved} måneder`,
    })
  }
  if (disposable > 2000 && totalDebt > 0) {
    actionItems.push({
      priority: "høj",
      title: "Øg månedlig ekstra-betaling",
      description:
        "Hver ekstra krone mod gæld med høj rente er bedre end opsparing til lav rente. Byg nødopsparing parallelt så du ikke optager ny dyr gæld.",
    })
  }
  actionItems.push({
    priority: "middel",
    title: "Få overblik månedligt",
    description:
      "Følg restgæld og renter i et regneark eller via bankens app. Synliggørelse er den bedste motivation - se fremskridtet vokse.",
  })

  return {
    score,
    headline,
    summary,
    metrics,
    chart:
      chartData.length > 0
        ? {
            type: "bar",
            title: "Fordeling af gæld",
            description: "Hvor meget du skylder hver post, og hvad det koster årligt i rente",
            valueFormat: "currency",
            series: [
              { name: "Restgæld", color: "#2563eb" },
              { name: "Årlig rente", color: "#f59e0b" },
            ],
            data: chartData,
          }
        : undefined,
    actionItems,
  }
}

/* -------------------------------------------------------------------------- */
/* Afbetalingsplan (samme type analyse som gæld, men inkluderer scenarier)    */
/* -------------------------------------------------------------------------- */

export interface AfbetalingInput extends GaeldInput {
  extraMonthlyPayment?: number
  strategy?: "avalanche" | "snowball" | "custom"
}

export function analyzeAfbetaling(input: AfbetalingInput): AIRecommendationData {
  const base = analyzeGaeld(input)
  const extra = safeNum(input.extraMonthlyPayment)
  const strategy = input.strategy ?? "avalanche"

  // Tilføj ekstra linje om strategien
  const strategyDesc =
    strategy === "avalanche"
      ? "Avalanche: Fokus på højeste rente giver størst rentebesparelse."
      : strategy === "snowball"
        ? "Snowball: Mindste gæld først giver psykologiske sejre, men koster typisk mere i renter."
        : "Custom: Din egen prioritering - husk at sammenligne med avalanche for at se rente-konsekvensen."

  return {
    ...base,
    headline: base.headline,
    summary: `${base.summary} ${strategyDesc}${extra > 0 ? ` Med ${formatDKK(extra)} ekstra pr. måned accelereres planen.` : ""}`,
  }
}

/* -------------------------------------------------------------------------- */
/* Løn                                                                        */
/* -------------------------------------------------------------------------- */

export interface LoenInput {
  grossMonthlySalary: number
  atpRate?: number
  amBidragRate?: number
  taxRate: number
  deductions?: number
  pensionContribution?: number
  monthlyExpenses?: number
}

export function analyzeLoen(input: LoenInput): AIRecommendationData {
  const gross = safeNum(input.grossMonthlySalary)
  const amBidrag = safeNum(input.amBidragRate ?? 8)
  const tax = safeNum(input.taxRate)
  const pension = safeNum(input.pensionContribution)
  const expenses = safeNum(input.monthlyExpenses)

  const afterAMB = gross * (1 - amBidrag / 100)
  const afterPension = afterAMB - pension
  const netMonthly = afterPension * (1 - tax / 100)
  const yearlyNet = netMonthly * 12
  const yearlyGross = gross * 12
  const totalTaxYear = yearlyGross - yearlyNet * 1
  const taxShare = (totalTaxYear / Math.max(1, yearlyGross)) * 100
  const disposable = netMonthly - expenses

  let score = 6
  if (netMonthly > 35000) score += 2
  else if (netMonthly > 25000) score += 1
  if (pension >= gross * 0.12) score += 1
  if (disposable > netMonthly * 0.3) score += 1
  if (disposable < 0) score -= 3
  score = clampScore(score)

  const headline =
    gross === 0
      ? "Indtast løn for at få en analyse"
      : netMonthly > 30000 && pension >= gross * 0.12
        ? "Stærk løn med god pensionsafsætning"
        : pension < gross * 0.1
          ? "Overvej at øge pensionsindbetalingen"
          : "Lønnen giver et solidt fundament"

  const summary = [
    `Med en bruttoløn på ${formatDKK(gross)} om måneden ender du med ${formatDKK(netMonthly)} udbetalt efter AM-bidrag, pension og ${formatPct(tax)} skat.`,
    `Årligt svarer det til ${formatDKK(yearlyNet)} nettoløn ud af ${formatDKK(yearlyGross)} brutto.`,
    pension > 0
      ? `Din pensionsindbetaling er ${formatDKK(pension)}/mdr. (${formatPct((pension / Math.max(1, gross)) * 100)} af brutto) - anbefalet er 12-18 %.`
      : "Der er ikke angivet pensionsindbetaling - det bør prioriteres skattemæssigt.",
    disposable !== 0
      ? `Efter månedlige udgifter på ${formatDKK(expenses)} har du ${formatDKK(disposable)} tilbage til opsparing og fri disponering.`
      : "",
  ]
    .filter(Boolean)
    .join(" ")

  const metrics = [
    {
      label: "Netto om måneden",
      value: formatDKK(netMonthly),
      description: `${formatPct(100 - taxShare)} af brutto`,
      tone: "neutral" as const,
    },
    {
      label: "Årlig nettoløn",
      value: formatDKK(yearlyNet),
      description: `Ud af ${formatDKK(yearlyGross)} brutto`,
      tone: "positive" as const,
    },
    {
      label: "Pensionsrate",
      value: formatPct((pension / Math.max(1, gross)) * 100),
      description: "Anbefalet: 12-18 % af brutto",
      tone: pension / Math.max(1, gross) >= 0.12 ? ("positive" as const) : ("negative" as const),
    },
    {
      label: "Rådighedsbeløb",
      value: formatDKK(disposable),
      description: expenses > 0 ? "Efter månedlige udgifter" : "Indtast udgifter for præcis beregning",
      tone: disposable < 0 ? ("negative" as const) : ("positive" as const),
    },
  ]

  const chartData = [
    { label: "Bruttoløn", "Beløb": Math.round(gross) },
    { label: "AM-bidrag", "Beløb": Math.round(gross * (amBidrag / 100)) },
    { label: "Pension", "Beløb": Math.round(pension) },
    { label: "Skat", "Beløb": Math.round((afterAMB - pension) * (tax / 100)) },
    { label: "Netto", "Beløb": Math.round(netMonthly) },
  ]

  const actionItems: AIRecommendationData["actionItems"] = []
  if (pension < gross * 0.1 && gross > 20000) {
    actionItems.push({
      priority: "høj",
      title: "Øg pensionsindbetalingen til mindst 12 %",
      description:
        "Pension er fradragsberettiget - du sparer derfor skat her og nu, og pengene vokser skattefrit til du går på pension.",
      impact: "Kan nemt give 10-15 % skattebesparelse",
    })
  }
  if (disposable < 0) {
    actionItems.push({
      priority: "kritisk",
      title: "Udgifterne overstiger nettolønnen",
      description:
        "Se på store udgiftsposter (bolig, transport, abonnementer) og find besparelser - eller undersøg mulighed for lønforhandling/ekstra indkomst.",
    })
  } else if (disposable > netMonthly * 0.3) {
    actionItems.push({
      priority: "høj",
      title: "Sæt dit overskud i arbejde",
      description:
        "Du har et stort rådighedsbeløb - automatisk overførsel til aktiesparekonto eller pension udnytter pengene bedst.",
      impact: `Op til ${formatDKK(disposable * 12)}/år til opsparing`,
    })
  }
  actionItems.push({
    priority: "middel",
    title: "Forhandl løn hvert år",
    description:
      "En forhandling er gratis at forsøge. Selv 3-5 % ekstra lægger sig sammen over karrieren og øger både dit pensionsgrundlag og din opsparingskapacitet.",
  })
  actionItems.push({
    priority: "middel",
    title: "Tjek din forskudsopgørelse",
    description:
      "Forkerte tal på forskudsopgørelsen giver enten restskat eller gratis kredit til SKAT. Opdater ved ændringer i løn, kørsel, renteudgifter mv.",
  })

  return {
    score,
    headline,
    summary,
    metrics,
    chart: {
      type: "bar",
      title: "Sådan fordeles din løn",
      description: "Fra bruttoløn til udbetalt - hvor går pengene hen",
      valueFormat: "currency",
      series: [{ name: "Beløb", color: "#2563eb" }],
      data: chartData,
    },
    actionItems,
  }
}

/* -------------------------------------------------------------------------- */
/* Risiko                                                                     */
/* -------------------------------------------------------------------------- */

export interface RisikoInput {
  portfolioValue: number
  expectedReturn: number
  volatility: number
  timeHorizon: number
  riskProfile?: "konservativ" | "moderat" | "aggressiv"
  assets?: Array<{ name: string; allocation: number }>
}

export function analyzeRisiko(input: RisikoInput): AIRecommendationData {
  const value = safeNum(input.portfolioValue)
  const expRet = safeNum(input.expectedReturn)
  const vol = safeNum(input.volatility)
  const horizon = Math.max(1, safeNum(input.timeHorizon))
  const profile = input.riskProfile ?? "moderat"

  const riskFree = 1
  const sharpe = vol > 0 ? (expRet - riskFree) / vol : 0
  const var95 = value * (vol / 100) * 1.645 * Math.sqrt(1)
  const maxDrawdownGuess = vol * 2 // tommelfinger

  let score = 7
  if (sharpe > 0.6) score += 1.5
  else if (sharpe < 0.2) score -= 1
  if (profile === "aggressiv" && horizon < 5) score -= 2
  if (profile === "konservativ" && horizon > 15) score -= 1 // for konservativ
  if (vol > 25) score -= 1
  score = clampScore(score)

  const headline =
    sharpe > 0.5
      ? "Stærk risikojusteret profil - du får godt betalt for din risiko"
      : sharpe < 0.2
        ? "Lav risikojusteret afkast - porteføljen kan optimeres"
        : "Porteføljen er fornuftig, men der kan justeres"

  const summary = [
    `Din portefølje på ${formatDKK(value)} har en forventet årligt afkast på ${formatPct(expRet)} og en volatilitet på ${formatPct(vol)}.`,
    `Sharpe-ratio er ${sharpe.toFixed(2)} (over 0,5 er godt) - et mål for hvor meget afkast du får per enhed risiko.`,
    `Med 95 % sandsynlighed taber du ikke mere end ${formatDKK(var95)} på en måned (Value-at-Risk).`,
    `I et dårligt år kan du dog forvente udsving på op til ca. ${formatPct(maxDrawdownGuess)} - vigtigt at have psykologisk tolerance til at blive siddende.`,
  ].join(" ")

  const metrics = [
    {
      label: "Forventet afkast",
      value: formatPct(expRet),
      description: "Årligt - før skat og inflation",
      tone: "positive" as const,
    },
    {
      label: "Volatilitet",
      value: formatPct(vol),
      description: "Risikomål - højere = større udsving",
      tone: vol > 20 ? ("negative" as const) : ("neutral" as const),
    },
    {
      label: "Sharpe-ratio",
      value: sharpe.toFixed(2),
      description: "Afkast per risiko-enhed (>0,5 er godt)",
      tone: sharpe > 0.5 ? ("positive" as const) : sharpe < 0.2 ? ("negative" as const) : ("neutral" as const),
    },
    {
      label: "Value-at-Risk (1 mdr.)",
      value: formatDKK(var95),
      description: "Max månedligt tab med 95 % sandsynlighed",
      tone: "neutral" as const,
    },
  ]

  const chartData = [0, 1, 2, 3, 5, 10, 15, 20, 30]
    .filter((y) => y <= horizon)
    .map((y) => {
      const centralValue = value * Math.pow(1 + expRet / 100, y)
      const upper = value * Math.pow(1 + (expRet + vol) / 100, y)
      const lower = value * Math.pow(1 + Math.max(-5, expRet - vol) / 100, y)
      return {
        label: `År ${y}`,
        "Forventet": Math.round(centralValue),
        "Bedste case (+1 sigma)": Math.round(upper),
        "Værste case (−1 sigma)": Math.round(lower),
      }
    })

  const actionItems: AIRecommendationData["actionItems"] = []
  if (profile === "aggressiv" && horizon < 5) {
    actionItems.push({
      priority: "kritisk",
      title: "Skru ned for risikoen",
      description:
        "En aggressiv profil passer ikke til under 5 års horisont - et markedsfald kan du ikke nå at indhente. Overvej en mere defensiv allokering.",
    })
  }
  if (sharpe < 0.3) {
    actionItems.push({
      priority: "høj",
      title: "Diversificer mere",
      description:
        "Lav Sharpe betyder at du tager risiko uden at blive kompenseret. Spred på flere aktivklasser (aktier, obligationer, ejendom).",
    })
  }
  if (vol > 25) {
    actionItems.push({
      priority: "høj",
      title: "Overvej at reducere volatiliteten",
      description:
        "Over 25 % årlig volatilitet er højt. Tilføj obligationer, guld eller stabile aktier for at udjævne udsvingene.",
    })
  }
  actionItems.push({
    priority: "middel",
    title: "Rebalancer årligt",
    description:
      "Når aktier stiger meget, fylder de mere i porteføljen og øger risikoen. Sælg vindere og køb taberne tilbage til din måloverflade.",
  })
  actionItems.push({
    priority: "lav",
    title: "Undgå at følge markedet dagligt",
    description:
      "Psykologisk ro er vigtigere end timing. Opsætning af faste månedlige køb (dollar-cost averaging) fjerner følelser fra ligningen.",
  })

  return {
    score,
    headline,
    summary,
    metrics,
    chart: {
      type: "line",
      title: "Mulig porteføljeudvikling",
      description: "Central prognose med bedste og værste realistiske scenarie (±1 sigma)",
      valueFormat: "currency",
      series: [
        { name: "Bedste case (+1 sigma)", color: "#10b981" },
        { name: "Forventet", color: "#2563eb" },
        { name: "Værste case (−1 sigma)", color: "#ef4444" },
      ],
      data: chartData,
    },
    actionItems,
  }
}

/* -------------------------------------------------------------------------- */
/* Statistik                                                                  */
/* -------------------------------------------------------------------------- */

export interface StatistikInput {
  data: number[]
  label?: string
}

export function analyzeStatistik(input: StatistikInput): AIRecommendationData {
  const arr = (input.data ?? []).filter((n) => Number.isFinite(n))
  const n = arr.length
  if (n === 0) {
    return {
      score: 0,
      headline: "Ingen data at analysere",
      summary: "Tilføj mindst 3-5 datapunkter for at få en analyse.",
      metrics: [],
      actionItems: [
        {
          priority: "høj",
          title: "Indtast data",
          description: "Analysen kræver tal - fx månedlige udgifter, aktiekurser, indtægter mv.",
        },
      ],
    }
  }

  const sorted = [...arr].sort((a, b) => a - b)
  const sum = arr.reduce((s, v) => s + v, 0)
  const mean = sum / n
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)]
  const variance = arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / n
  const std = Math.sqrt(variance)
  const min = sorted[0]
  const max = sorted[n - 1]
  const range = max - min
  const cv = mean !== 0 ? (std / Math.abs(mean)) * 100 : 0
  const skewness =
    std > 0 ? arr.reduce((s, v) => s + Math.pow((v - mean) / std, 3), 0) / n : 0

  // Outliers (IQR-metode)
  const q1 = sorted[Math.floor(n * 0.25)]
  const q3 = sorted[Math.floor(n * 0.75)]
  const iqr = q3 - q1
  const outliers = arr.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr)

  let score = 6
  if (n >= 30) score += 1.5
  else if (n >= 10) score += 0.5
  if (outliers.length === 0) score += 1
  else if (outliers.length > n * 0.1) score -= 1
  if (cv < 20) score += 1
  else if (cv > 50) score -= 0.5
  score = clampScore(score)

  const headline = `${n} datapunkter analyseret - ${outliers.length > 0 ? `${outliers.length} outliers fundet` : "fordelingen er jævn"}`
  const summary = [
    `Gennemsnittet er ${mean.toFixed(2)} med en standardafvigelse på ${std.toFixed(2)}.`,
    `Medianen er ${median.toFixed(2)}${Math.abs(mean - median) > std * 0.5 ? " - markant forskel fra gennemsnittet tyder på skæv fordeling" : " - tæt på gennemsnittet hvilket tyder på symmetrisk fordeling"}.`,
    `Variationskoefficient (CV) er ${formatPct(cv)} - ${cv < 20 ? "lav variation, stabile data" : cv > 50 ? "høj variation, ustabile data" : "moderat variation"}.`,
    outliers.length > 0
      ? `Der er ${outliers.length} outliers (ekstreme værdier) som kan skævvride konklusionerne - overvej at undersøge dem nærmere.`
      : "Ingen outliers detekteret - datasættet er jævnt fordelt.",
  ].join(" ")

  const metrics = [
    { label: "Gennemsnit", value: mean.toFixed(2), tone: "neutral" as const, description: `Baseret på ${n} observationer` },
    { label: "Median", value: median.toFixed(2), tone: "neutral" as const, description: "Midterste værdi" },
    { label: "Standardafvigelse", value: std.toFixed(2), tone: "neutral" as const, description: "Spredning om middelværdien" },
    { label: "Outliers", value: outliers.length.toString(), tone: outliers.length > 0 ? ("negative" as const) : ("positive" as const), description: "Ekstreme værdier (IQR-metode)" },
    { label: "Range", value: range.toFixed(2), tone: "neutral" as const, description: `Min ${min.toFixed(2)} – max ${max.toFixed(2)}` },
    { label: "Skewness", value: skewness.toFixed(2), tone: "neutral" as const, description: Math.abs(skewness) < 0.5 ? "Symmetrisk" : skewness > 0 ? "Højreskæv" : "Venstreskæv" },
  ]

  // Histogram (10 bins)
  const bins = 10
  const binSize = range / bins || 1
  const histogram = Array.from({ length: bins }, (_, i) => {
    const lo = min + i * binSize
    const hi = lo + binSize
    const count = arr.filter((v) => v >= lo && (i === bins - 1 ? v <= hi : v < hi)).length
    return { label: `${lo.toFixed(0)}-${hi.toFixed(0)}`, "Antal": count }
  })

  const actionItems: AIRecommendationData["actionItems"] = []
  if (n < 10) {
    actionItems.push({
      priority: "høj",
      title: "Indsaml flere data før beslutninger",
      description:
        "Under 10 observationer giver upålidelige konklusioner. Jo flere datapunkter, jo mere robust bliver analysen.",
    })
  }
  if (outliers.length > 0) {
    actionItems.push({
      priority: "middel",
      title: `Undersøg ${outliers.length} outlier${outliers.length === 1 ? "" : "s"}`,
      description:
        "Outliers kan være målefejl, særlige hændelser eller reelle tendenser. Tjek hver enkelt før du ekskluderer dem.",
    })
  }
  if (Math.abs(skewness) > 1) {
    actionItems.push({
      priority: "middel",
      title: "Brug median i stedet for gennemsnit",
      description:
        "Din fordeling er skæv - gennemsnittet kan give et misvisende billede. Medianen er mere robust ved skæve data.",
    })
  }
  actionItems.push({
    priority: "lav",
    title: "Visualisér altid dine data",
    description:
      "Et histogram eller box-plot afslører ofte mønstre som tallene alene skjuler. Brug det som første skridt i enhver analyse.",
  })

  return {
    score,
    headline,
    summary,
    metrics,
    chart: {
      type: "bar",
      title: "Fordeling af dine data (histogram)",
      description: "Hvor mange observationer falder i hvert interval",
      valueFormat: "number",
      series: [{ name: "Antal", color: "#2563eb" }],
      data: histogram,
    },
    actionItems,
  }
}

/* -------------------------------------------------------------------------- */
/* Virksomhed                                                                 */
/* -------------------------------------------------------------------------- */

export interface VirksomhedInput {
  revenue: number
  costs: number
  employees?: number
  industry?: string
  phase?: "idé" | "opstart" | "vækst" | "moden"
  cashBalance?: number
  monthlyBurn?: number
}

export function analyzeVirksomhed(input: VirksomhedInput): AIRecommendationData {
  const revenue = safeNum(input.revenue)
  const costs = safeNum(input.costs)
  const employees = safeNum(input.employees)
  const cash = safeNum(input.cashBalance)
  const burn = safeNum(input.monthlyBurn)
  const phase = input.phase ?? "vækst"

  const profit = revenue - costs
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0
  const revPerEmp = employees > 0 ? revenue / employees : 0
  const runway = burn > 0 ? cash / burn : Infinity
  const breakEvenRev = costs

  let score = 5
  if (margin > 20) score += 2.5
  else if (margin > 10) score += 1
  else if (margin < 0) score -= 3
  if (runway >= 18) score += 1.5
  else if (runway < 6) score -= 2
  if (phase === "opstart" && profit < 0) score += 1 // normalt
  score = clampScore(score)

  const headline =
    margin < 0
      ? "Virksomheden taber penge - handling kræves"
      : runway < 6
        ? "Kort pengerunway - sikring af likviditet haster"
        : margin > 20
          ? "Sund lønsomhed - stærk position"
          : "Fornuftig drift med plads til optimering"

  const summary = [
    `Omsætning på ${formatDKK(revenue)} og omkostninger på ${formatDKK(costs)} giver en ${profit >= 0 ? "profit" : "driftsunderskud"} på ${formatDKK(Math.abs(profit))} (${formatPct(margin)} margin).`,
    employees > 0 ? `Omsætning pr. medarbejder er ${formatDKK(revPerEmp)} - benchmark afhænger af branche.` : "",
    runway !== Infinity && burn > 0
      ? `Med månedlig burn på ${formatDKK(burn)} og en kassebeholdning på ${formatDKK(cash)} har du ${runway.toFixed(1)} måneders runway.`
      : "",
    `Break-even ligger på ${formatDKK(breakEvenRev)} i omsætning - derunder taber du penge.`,
  ]
    .filter(Boolean)
    .join(" ")

  const metrics = [
    {
      label: "Profit/tab",
      value: formatDKK(profit),
      description: `${formatPct(margin)} margin`,
      tone: profit < 0 ? ("negative" as const) : ("positive" as const),
    },
    {
      label: "Omsætningsmargin",
      value: formatPct(margin),
      description: margin > 20 ? "Høj - sund forretning" : margin < 5 ? "Lav - pres på bundlinjen" : "Moderat",
      tone: margin > 10 ? ("positive" as const) : ("negative" as const),
    },
    {
      label: "Runway",
      value: runway === Infinity ? "∞" : `${runway.toFixed(1)} mdr.`,
      description: runway < 6 ? "Kritisk - under 6 mdr." : runway < 12 ? "Begrænset" : "Sund",
      tone: runway < 6 ? ("negative" as const) : runway >= 12 ? ("positive" as const) : ("neutral" as const),
    },
    {
      label: "Break-even omsætning",
      value: formatDKK(breakEvenRev),
      description: revenue >= breakEvenRev ? "Over break-even" : `Mangler ${formatDKK(breakEvenRev - revenue)}`,
      tone: revenue >= breakEvenRev ? ("positive" as const) : ("negative" as const),
    },
  ]

  const scenarios = [
    { label: "Nuværende", "Omsætning": revenue, "Omkostninger": costs },
    { label: "+10 % omsætning", "Omsætning": revenue * 1.1, "Omkostninger": costs },
    { label: "−10 % omkostninger", "Omsætning": revenue, "Omkostninger": costs * 0.9 },
    { label: "Kombineret", "Omsætning": revenue * 1.1, "Omkostninger": costs * 0.9 },
  ].map((s) => ({ ...s, "Omsætning": Math.round(s["Omsætning"]), "Omkostninger": Math.round(s["Omkostninger"]) }))

  const actionItems: AIRecommendationData["actionItems"] = []
  if (margin < 0) {
    actionItems.push({
      priority: "kritisk",
      title: "Stop underskuddet hurtigst muligt",
      description:
        "Identificér tabsgivende produkter/kunder og luk dem. Prioritér cash flow frem for vækst indtil lønsomheden er sikret.",
    })
  }
  if (runway < 6 && runway !== Infinity) {
    actionItems.push({
      priority: "kritisk",
      title: "Sikr likviditet - under 6 mdr. runway",
      description:
        "Du risikerer betalingsstandsning. Overvej kapitalindskud, lån, brobygningsfinansiering eller hurtige omkostningsreduktioner.",
    })
  }
  if (margin < 10 && margin > 0) {
    actionItems.push({
      priority: "høj",
      title: "Gennemgå prissætning",
      description:
        "Lav margin betyder sårbar forretning. Mange opdager at de kan hæve priser uden tab af kunder - test det på segmenter.",
      impact: "1 % højere margin kan være afgørende",
    })
  }
  if (phase === "opstart") {
    actionItems.push({
      priority: "høj",
      title: "Fokus på product-market fit før skalering",
      description:
        "Vækst uden solid bekræftet efterspørgsel brænder penge. Sørg for at kunder elsker produktet og anbefaler det videre.",
    })
  }
  actionItems.push({
    priority: "middel",
    title: "Benchmark dig op mod branchen",
    description:
      "Typiske nøgletal (bruttomargin, lønomkostninger pr. medarbejder, kundeomkostning) hjælper med at se hvor du står.",
  })
  actionItems.push({
    priority: "lav",
    title: "Bogfør månedligt og lav rullende 12-mdr. budget",
    description:
      "Virksomheder der holder tæt styr på tal tager bedre beslutninger og overlever oftere end dem der kun kigger én gang årligt.",
  })

  return {
    score,
    headline,
    summary,
    metrics,
    chart: {
      type: "bar",
      title: "Hvad sker der ved små ændringer",
      description: "Effekten af pris-/kostjustering - 10 % justering kan dramatisk ændre bundlinjen",
      valueFormat: "currency",
      series: [
        { name: "Omsætning", color: "#10b981" },
        { name: "Omkostninger", color: "#ef4444" },
      ],
      data: scenarios,
    },
    actionItems,
  }
}
