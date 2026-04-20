"use client"

import { useMemo, useState } from "react"
import { AIRecommendation } from "@/components/ai-recommendation"
import { analyzeRisiko } from "@/lib/ai-engines"
import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Download, Info, HelpCircle } from "lucide-react"
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Area,
  ComposedChart,
  Cell,
  PieChart,
  Pie,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CalculatorTracker } from "@/components/calculator-tracker"

// Avancerede finansielle beregningsfunktioner
const calculatePortfolioVariance = (assets, correlationMatrix) => {
  let variance = 0
  for (let i = 0; i < assets.length; i++) {
    for (let j = 0; j < assets.length; j++) {
      const weight_i = assets[i].allocation / 100
      const weight_j = assets[j].allocation / 100
      const stdDev_i = assets[i].volatility / 100
      const stdDev_j = assets[j].volatility / 100
      const correlation = correlationMatrix[i][j]

      variance += weight_i * weight_j * stdDev_i * stdDev_j * correlation
    }
  }
  return variance
}

const calculatePortfolioVolatility = (assets, correlationMatrix) => {
  return Math.sqrt(calculatePortfolioVariance(assets, correlationMatrix)) * 100
}

const calculateExpectedReturn = (assets) => {
  return assets.reduce((total, asset) => total + (asset.allocation / 100) * asset.expectedReturn, 0)
}

const calculateSharpeRatio = (expectedReturn, volatility, riskFreeRate = 1) => {
  if (!volatility || volatility === 0) return 0
  return (expectedReturn - riskFreeRate) / volatility
}

const calculateSortinoRatio = (expectedReturn, downsideDeviation, riskFreeRate = 1) => {
  if (!downsideDeviation || downsideDeviation === 0) return 0
  return (expectedReturn - riskFreeRate) / downsideDeviation
}

const calculateValueAtRisk = (portfolioValue, volatility, confidenceLevel = 0.95, timeHorizon = 1) => {
  // Z-score for different confidence levels
  const zScores = {
    0.9: 1.282,
    0.95: 1.645,
    0.99: 2.326,
  }
  const z = zScores[confidenceLevel] || 1.645

  // VaR calculation
  return portfolioValue * (volatility / 100) * z * Math.sqrt(timeHorizon)
}

const calculateConditionalVaR = (portfolioValue, volatility, confidenceLevel = 0.95, timeHorizon = 1) => {
  // CVaR is typically 1.2-1.4 times VaR for normal distributions
  const var95 = calculateValueAtRisk(portfolioValue, volatility, confidenceLevel, timeHorizon)
  return var95 * 1.32
}

const calculateMaximumDrawdown = (returns) => {
  let maxDrawdown = 0
  let peak = returns[0]

  for (let i = 1; i < returns.length; i++) {
    if (returns[i] > peak) {
      peak = returns[i]
    } else {
      const drawdown = (peak - returns[i]) / peak
      maxDrawdown = Math.max(maxDrawdown, drawdown)
    }
  }

  return maxDrawdown * 100
}

// Monte Carlo simulation
const runMonteCarloSimulation = (initialInvestment, expectedReturn, volatility, years, simulations = 1000) => {
  const results = []
  const finalValues = []
  const monthlyReturn = expectedReturn / 12 / 100
  const monthlyVolatility = volatility / Math.sqrt(12) / 100
  const months = years * 12

  // Generate random paths
  for (let sim = 0; sim < simulations; sim++) {
    const path = [initialInvestment]
    let currentValue = initialInvestment

    for (let month = 1; month <= months; month++) {
      // Generate random return from normal distribution
      const randomReturn = monthlyReturn + monthlyVolatility * normalRandom()
      currentValue = currentValue * (1 + randomReturn)

      // Only store annual points to reduce data size
      if (month % 12 === 0) {
        path.push(currentValue)
      }
    }

    results.push(path)
    finalValues.push(path[path.length - 1])
  }

  // Calculate percentiles
  finalValues.sort((a, b) => a - b)
  const percentiles = {
    worst: finalValues[0],
    p5: finalValues[Math.floor(simulations * 0.05)],
    p25: finalValues[Math.floor(simulations * 0.25)],
    median: finalValues[Math.floor(simulations * 0.5)],
    p75: finalValues[Math.floor(simulations * 0.75)],
    p95: finalValues[Math.floor(simulations * 0.95)],
    best: finalValues[simulations - 1],
  }

  return { paths: results, percentiles }
}

// Helper function to generate random numbers from normal distribution
const normalRandom = () => {
  let u = 0,
    v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

// Efficient frontier calculation
const calculateEfficientFrontier = (assets, correlationMatrix, points = 50) => {
  const results = []

  // Define risk-free asset
  const riskFreeRate = 1.0

  // Calculate minimum variance portfolio
  // This is a simplified approach - in reality would use quadratic programming
  let minVolatility = 100
  let minVolatilityReturn = 0
  let minVolatilityAllocation = []

  // Generate random portfolios to approximate efficient frontier
  for (let i = 0; i < 5000; i++) {
    // Generate random weights
    const weights = generateRandomWeights(assets.length)

    // Calculate expected return and volatility
    let expectedReturn = 0
    for (let j = 0; j < assets.length; j++) {
      expectedReturn += weights[j] * assets[j].expectedReturn
    }

    // Create temporary assets array with random weights
    const tempAssets = assets.map((asset, index) => ({
      ...asset,
      allocation: weights[index] * 100,
    }))

    const volatility = calculatePortfolioVolatility(tempAssets, correlationMatrix)

    // Check if this is the minimum volatility portfolio
    if (volatility < minVolatility) {
      minVolatility = volatility
      minVolatilityReturn = expectedReturn
      minVolatilityAllocation = weights.map((w) => w * 100)
    }

    results.push({
      return: expectedReturn,
      risk: volatility,
      weights,
    })
  }

  // Sort by risk
  results.sort((a, b) => a.risk - b.risk)

  // Filter for efficient frontier (maximum return for each risk level)
  const efficientFrontier = []
  const riskLevels = []

  // Divide the risk range into equal segments
  const minRisk = results[0].risk
  const maxRisk = results[results.length - 1].risk
  const riskStep = (maxRisk - minRisk) / points

  for (let i = 0; i < points; i++) {
    const targetRisk = minRisk + i * riskStep
    riskLevels.push(targetRisk)
  }

  // Find maximum return for each risk level
  riskLevels.forEach((targetRisk) => {
    // Find portfolios close to this risk level
    const nearbyPortfolios = results.filter(
      (p) => p.risk >= targetRisk - riskStep / 2 && p.risk <= targetRisk + riskStep / 2,
    )

    if (nearbyPortfolios.length > 0) {
      // Find the one with maximum return
      const maxReturnPortfolio = nearbyPortfolios.reduce(
        (max, p) => (p.return > max.return ? p : max),
        nearbyPortfolios[0],
      )

      efficientFrontier.push({
        risk: targetRisk,
        return: maxReturnPortfolio.return,
        weights: maxReturnPortfolio.weights,
      })
    }
  })

  // Calculate Capital Market Line
  const cmlPortfolios = []
  for (let i = 0; i <= 10; i++) {
    const weight = i / 10

    // Find tangency portfolio (maximum Sharpe ratio)
    const tangencyPortfolio = results.reduce((max, p) => {
      const sharpe = p.risk > 0 ? (p.return - riskFreeRate) / p.risk : -Infinity
      const maxSharpe = max.risk > 0 ? (max.return - riskFreeRate) / max.risk : -Infinity
      return sharpe > maxSharpe ? p : max
    }, results[0])

    // Interpolate between risk-free asset and tangency portfolio
    const risk = weight * tangencyPortfolio.risk
    const ret = riskFreeRate + weight * (tangencyPortfolio.return - riskFreeRate)

    cmlPortfolios.push({
      risk,
      return: ret,
    })
  }

  return {
    efficientFrontier,
    cmlPortfolios,
    minVariancePortfolio: {
      risk: minVolatility,
      return: minVolatilityReturn,
      allocation: minVolatilityAllocation,
    },
    tangencyPortfolio: results.reduce((max, p) => {
      const sharpe = p.risk > 0 ? (p.return - riskFreeRate) / p.risk : -Infinity
      const maxSharpe = max.risk > 0 ? (max.return - riskFreeRate) / max.risk : -Infinity
      return sharpe > maxSharpe ? p : max
    }, results[0]),
  }
}

// Helper function to generate random weights that sum to 1
const generateRandomWeights = (n) => {
  const weights = Array(n)
    .fill(0)
    .map(() => Math.random())
  const sum = weights.reduce((a, b) => a + b, 0)
  return weights.map((w) => w / sum)
}

// Factor analysis
const calculateFactorExposures = (assets) => {
  // Simplified factor model with 4 factors: Market, Size, Value, Momentum
  const factors = [
    { name: "Markedsrisiko", description: "Eksponering mod det generelle marked" },
    { name: "Størrelsesfaktor", description: "Eksponering mod små vs. store virksomheder" },
    { name: "Værdifaktor", description: "Eksponering mod værdi vs. vækstaktier" },
    { name: "Momentumfaktor", description: "Eksponering mod aktier med positiv vs. negativ kursudvikling" },
  ]

  // Simplified factor loadings for different asset classes
  const factorLoadings = {
    Aktier: [1.0, 0.2, 0.3, 0.2],
    Obligationer: [0.2, -0.1, 0.1, -0.1],
    Kontanter: [0.0, 0.0, 0.0, 0.0],
    Ejendomme: [0.5, 0.1, 0.4, 0.1],
    Råvarer: [0.4, 0.0, -0.2, 0.3],
    Kryptovaluta: [0.3, 0.5, -0.3, 0.6],
    "Private Equity": [1.2, 0.4, 0.2, 0.3],
    "Hedge Funds": [0.6, 0.1, 0.0, 0.4],
  }

  // Calculate portfolio factor exposures
  const exposures = [0, 0, 0, 0]

  assets.forEach((asset) => {
    const assetType =
      Object.keys(factorLoadings).find((type) => asset.name.toLowerCase().includes(type.toLowerCase())) || "Aktier" // Default to stocks if no match

    const loadings = factorLoadings[assetType]
    const weight = asset.allocation / 100

    for (let i = 0; i < 4; i++) {
      exposures[i] += loadings[i] * weight
    }
  })

  return factors.map((factor, i) => ({
    ...factor,
    exposure: exposures[i],
  }))
}

// Stress test scenarios
const stressTestScenarios = [
  {
    name: "Finanskrise (2008)",
    marketImpact: -38.5,
    bondImpact: 5.2,
    cashImpact: 0.5,
    realEstateImpact: -30.0,
    commodityImpact: -40.0,
  },
  {
    name: "Dotcom-krak (2000-2002)",
    marketImpact: -44.7,
    bondImpact: 12.3,
    cashImpact: 1.2,
    realEstateImpact: 7.3,
    commodityImpact: -30.0,
  },
  {
    name: "COVID-19 (2020)",
    marketImpact: -33.9,
    bondImpact: 8.7,
    cashImpact: 0.2,
    realEstateImpact: -10.5,
    commodityImpact: -23.5,
  },
  {
    name: "Rentestigning (+2%)",
    marketImpact: -15.0,
    bondImpact: -8.0,
    cashImpact: 2.0,
    realEstateImpact: -10.0,
    commodityImpact: -5.0,
  },
  {
    name: "Inflation (+5%)",
    marketImpact: -10.0,
    bondImpact: -12.0,
    cashImpact: -5.0,
    realEstateImpact: 5.0,
    commodityImpact: 15.0,
  },
  {
    name: "Geopolitisk krise",
    marketImpact: -20.0,
    bondImpact: 5.0,
    cashImpact: 0.3,
    realEstateImpact: -15.0,
    commodityImpact: 25.0,
  },
]

// Calculate stress test impact
const calculateStressTestImpact = (assets, scenario) => {
  let totalImpact = 0

  assets.forEach((asset) => {
    let impact = 0
    const allocation = asset.allocation / 100

    if (asset.name.toLowerCase().includes("aktie")) {
      impact = scenario.marketImpact * allocation
    } else if (asset.name.toLowerCase().includes("obligation")) {
      impact = scenario.bondImpact * allocation
    } else if (asset.name.toLowerCase().includes("kontant")) {
      impact = scenario.cashImpact * allocation
    } else if (asset.name.toLowerCase().includes("ejendom")) {
      impact = scenario.realEstateImpact * allocation
    } else if (asset.name.toLowerCase().includes("råvare") || asset.name.toLowerCase().includes("guld")) {
      impact = scenario.commodityImpact * allocation
    } else {
      // Default to market impact for other assets
      impact = scenario.marketImpact * allocation
    }

    totalImpact += impact
  })

  return totalImpact
}

// Liquidity analysis
const calculateLiquidityScore = (assets) => {
  const liquidityScores = {
    Kontanter: 100,
    Statsobligationer: 95,
    "Investment Grade Obligationer": 85,
    "High Yield Obligationer": 70,
    "Large Cap Aktier": 90,
    "Mid Cap Aktier": 80,
    "Small Cap Aktier": 65,
    Ejendomme: 30,
    "Private Equity": 10,
    "Hedge Funds": 40,
    Råvarer: 75,
    Kryptovaluta: 60,
  }

  let totalLiquidityScore = 0

  assets.forEach((asset) => {
    let score = 70 // Default score

    // Find the most appropriate liquidity score
    Object.keys(liquidityScores).forEach((type) => {
      if (asset.name.toLowerCase().includes(type.toLowerCase())) {
        score = liquidityScores[type]
      }
    })

    totalLiquidityScore += (asset.allocation / 100) * score
  })

  return totalLiquidityScore
}

// Risk contribution analysis
const calculateRiskContribution = (assets, correlationMatrix) => {
  const portfolioVolatility = calculatePortfolioVolatility(assets, correlationMatrix) / 100
  const contributions = []

  assets.forEach((asset, i) => {
    let marginalContribution = 0
    const weight_i = asset.allocation / 100

    for (let j = 0; j < assets.length; j++) {
      const weight_j = assets[j].allocation / 100
      const stdDev_i = asset.volatility / 100
      const stdDev_j = assets[j].volatility / 100
      const correlation = correlationMatrix[i][j]

      marginalContribution += weight_j * stdDev_i * stdDev_j * correlation
    }

    const contribution = (weight_i * marginalContribution) / portfolioVolatility
    const contributionPercent = (contribution / portfolioVolatility) * 100

    contributions.push({
      name: asset.name,
      allocation: asset.allocation,
      contribution,
      contributionPercent,
    })
  })

  return contributions
}

function RiskCalculator() {
  const [step, setStep] = useState(1)
  const [investmentType, setInvestmentType] = useState("portfolio")
  const [assets, setAssets] = useState([
    { name: "Aktier", allocation: 60, expectedReturn: 8, volatility: 15 },
    { name: "Obligationer", allocation: 30, expectedReturn: 3, volatility: 5 },
    { name: "Kontanter", allocation: 10, expectedReturn: 1, volatility: 0.5 },
  ])
  const [investmentHorizon, setInvestmentHorizon] = useState(10)
  const [riskTolerance, setRiskTolerance] = useState("medium")
  const [showResults, setShowResults] = useState(false)
  const [portfolioValue, setPortfolioValue] = useState(1000000)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [selectedConfidenceLevel, setSelectedConfidenceLevel] = useState(0.95)
  const [selectedTimeHorizon, setSelectedTimeHorizon] = useState(1)
  const [showMonteCarloSimulation, setShowMonteCarloSimulation] = useState(false)
  const [monteCarloResults, setMonteCarloResults] = useState(null)
  const [efficientFrontierData, setEfficientFrontierData] = useState(null)
  const [factorExposures, setFactorExposures] = useState([])
  const [stressTestResults, setStressTestResults] = useState([])
  const [riskContributions, setRiskContributions] = useState([])
  const [liquidityScore, setLiquidityScore] = useState(0)
  const [showOptimizationDialog, setShowOptimizationDialog] = useState(false)
  const [optimizationObjective, setOptimizationObjective] = useState("sharpe")
  const [optimizedPortfolio, setOptimizedPortfolio] = useState(null)
  const [showComparison, setShowComparison] = useState(false)
  const [benchmarkPortfolios, setBenchmarkPortfolios] = useState([
    {
      name: "Konservativ",
      assets: [
        { name: "Aktier", allocation: 20 },
        { name: "Obligationer", allocation: 70 },
        { name: "Kontanter", allocation: 10 },
      ],
    },
    {
      name: "Balanceret",
      assets: [
        { name: "Aktier", allocation: 50 },
        { name: "Obligationer", allocation: 40 },
        { name: "Kontanter", allocation: 10 },
      ],
    },
    {
      name: "Aggressiv",
      assets: [
        { name: "Aktier", allocation: 80 },
        { name: "Obligationer", allocation: 15 },
        { name: "Kontanter", allocation: 5 },
      ],
    },
  ])
  const [selectedBenchmarks, setSelectedBenchmarks] = useState(["Balanceret"])
  const [correlationMatrix, setCorrelationMatrix] = useState([
    [1.0, 0.2, 0.1],
    [0.2, 1.0, 0.3],
    [0.1, 0.3, 1.0],
  ])
  const [historicalWorstCase, setHistoricalWorstCase] = useState(-50)
  const [showTooltips, setShowTooltips] = useState(true)
  const [activeTab, setActiveTab] = useState("risk-return")

  const aiRecommendation = useMemo(() => {
    const expRet = calculateExpectedReturn(assets)
    const vol = calculatePortfolioVolatility(assets, correlationMatrix)
    const riskProfileMap: Record<string, "konservativ" | "moderat" | "aggressiv"> = {
      low: "konservativ",
      medium: "moderat",
      high: "aggressiv",
    }
    return analyzeRisiko({
      portfolioValue,
      expectedReturn: expRet,
      volatility: vol,
      timeHorizon: investmentHorizon,
      riskProfile: riskProfileMap[riskTolerance] ?? "moderat",
      assets: assets.map((a) => ({ name: a.name, allocation: a.allocation })),
    })
  }, [assets, correlationMatrix, portfolioValue, investmentHorizon, riskTolerance])
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState("pdf")
  const [showFactorAnalysis, setShowFactorAnalysis] = useState(false)
  const [showLiquidityAnalysis, setShowLiquidityAnalysis] = useState(false)
  const [showRiskContribution, setShowRiskContribution] = useState(false)
  const [showEfficientFrontier, setShowEfficientFrontier] = useState(false)
  const [showStressTest, setShowStressTest] = useState(false)
  const [showHistoricalAnalysis, setShowHistoricalAnalysis] = useState(false)
  const [historicalScenarios, setHistoricalScenarios] = useState([
    { name: "2008 Finanskrise", return: -37 },
    { name: "2020 COVID-19", return: -34 },
    { name: "2000 Dotcom-krak", return: -45 },
    { name: "2011 Europæisk gældskrise", return: -19 },
    { name: "2015-2016 Oliekrise", return: -15 },
  ])
  const [rebalancingFrequency, setRebalancingFrequency] = useState("yearly")
  const [inflationRate, setInflationRate] = useState(2)
  const [taxRate, setTaxRate] = useState(27)
  const [fees, setFees] = useState(0.5)
  const [customScenarios, setCustomScenarios] = useState([
    {
      name: "Mit scenarie",
      marketImpact: -20,
      bondImpact: 5,
      cashImpact: 0.5,
      realEstateImpact: -15,
      commodityImpact: 10,
    },
  ])
  const [showCustomScenarioDialog, setShowCustomScenarioDialog] = useState(false)
  const [newScenario, setNewScenario] = useState({
    name: "",
    marketImpact: 0,
    bondImpact: 0,
    cashImpact: 0,
    realEstateImpact: 0,
    commodityImpact: 0,
  })
  const [singleAsset, setSingleAsset] = useState({
    name: "Aktie",
    ticker: "",
    price: 100,
    expectedReturn: 8,
    volatility: 15,
    beta: 1.0,
    sector: "Teknologi",
    marketCap: "Large Cap",
    dividendYield: 2.0
  })

  const chartRef = useRef(null)

  // Update correlation matrix when assets change
  useEffect(() => {
    if (assets.length !== correlationMatrix.length) {
      const newMatrix = Array(assets.length)
        .fill()
        .map(() => Array(assets.length).fill(0))

      // Copy existing correlations
      for (let i = 0; i < Math.min(correlationMatrix.length, assets.length); i++) {
        for (let j = 0; j < Math.min(correlationMatrix[i].length, assets.length); j++) {
          newMatrix[i][j] = correlationMatrix[i][j]
        }
      }

      // Set diagonal to 1
      for (let i = 0; i < assets.length; i++) {
        newMatrix[i][i] = 1.0
      }

      // Set default correlations for new assets
      for (let i = correlationMatrix.length; i < assets.length; i++) {
        for (let j = 0; j < i; j++) {
          newMatrix[i][j] = 0.2
          newMatrix[j][i] = 0.2
        }
      }

      setCorrelationMatrix(newMatrix)
    }
  }, [assets.length])

  // Calculate advanced metrics when showing results
  useEffect(() => {
    if (showResults) {
      if (investmentType === "portfolio") {
        // Run Monte Carlo simulation
        const simulation = runMonteCarloSimulation(
          portfolioValue,
          calculateExpectedReturn(assets),
          calculatePortfolioVolatility(assets, correlationMatrix),
          investmentHorizon,
        )
        setMonteCarloResults(simulation)

        // Calculate efficient frontier
        const frontier = calculateEfficientFrontier(assets, correlationMatrix)
        setEfficientFrontierData(frontier)

        // Calculate factor exposures
        const exposures = calculateFactorExposures(assets)
        setFactorExposures(exposures)

        // Calculate stress test results
        const stressResults = stressTestScenarios.map((scenario) => ({
          ...scenario,
          impact: calculateStressTestImpact(assets, scenario),
        }))
        setStressTestResults(stressResults)

        // Calculate risk contributions
        const contributions = calculateRiskContribution(assets, correlationMatrix)
        setRiskContributions(contributions)

        // Calculate liquidity score
        const liquidity = calculateLiquidityScore(assets)
        setLiquidityScore(liquidity)
      } else {
        // Single asset analysis
        // Set default active tab for single asset
        setActiveTab("single-asset-analysis")
      }
    }
  }, [showResults, investmentType])

  // Format functions
  const formatPercent = (value) => `${value.toFixed(1)}%`
  const formatCurrency = (value) => new Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK" }).format(value)
  const formatNumber = (value) => new Intl.NumberFormat("da-DK").format(value)

  // Calculate portfolio metrics
  const portfolioExpectedReturn = calculateExpectedReturn(assets)
  const portfolioVolatility = calculatePortfolioVolatility(assets, correlationMatrix)
  const portfolioSharpeRatio = calculateSharpeRatio(portfolioExpectedReturn, portfolioVolatility)
  const portfolioValueAtRisk = calculateValueAtRisk(
    portfolioValue,
    portfolioVolatility,
    selectedConfidenceLevel,
    selectedTimeHorizon,
  )
  const portfolioConditionalVaR = calculateConditionalVaR(
    portfolioValue,
    portfolioVolatility,
    selectedConfidenceLevel,
    selectedTimeHorizon,
  )

  // Generate data for charts
  const generateRiskReturnData = () => {
    const data = []

    // Add existing assets
    assets.forEach((asset) => {
      data.push({
        name: asset.name,
        risk: asset.volatility,
        return: asset.expectedReturn,
        allocation: asset.allocation,
      })
    })

    // Add portfolio
    data.push({
      name: "Portefølje",
      risk: portfolioVolatility,
      return: portfolioExpectedReturn,
      allocation: 100,
    })

    return data
  }

  const generateMonteCarloChartData = () => {
    if (!monteCarloResults) return []

    // Sample a subset of paths to avoid overwhelming the chart
    const sampleSize = 50
    const samplePaths = []
    const pathCount = monteCarloResults.paths.length

    for (let i = 0; i < sampleSize; i++) {
      const pathIndex = Math.floor(i * (pathCount / sampleSize))
      samplePaths.push(monteCarloResults.paths[pathIndex])
    }

    // Transform data for chart
    const years = Array.from({ length: investmentHorizon + 1 }, (_, i) => i)

    return years.map((year, i) => {
      const dataPoint = {
        year,
        median: null,
        p25: null,
        p75: null,
        p5: null,
        p95: null,
      }

      // Add percentile data for year > 0
      if (year > 0) {
        const yearValues = samplePaths.map((path) => path[year])
        yearValues.sort((a, b) => a - b)

        dataPoint.median = yearValues[Math.floor(sampleSize * 0.5)]
        dataPoint.p25 = yearValues[Math.floor(sampleSize * 0.25)]
        dataPoint.p75 = yearValues[Math.floor(sampleSize * 0.75)]
        dataPoint.p5 = yearValues[Math.floor(sampleSize * 0.05)]
        dataPoint.p95 = yearValues[Math.floor(sampleSize * 0.95)]
      } else {
        // Initial value
        dataPoint.median = portfolioValue
        dataPoint.p25 = portfolioValue
        dataPoint.p75 = portfolioValue
        dataPoint.p5 = portfolioValue
        dataPoint.p95 = portfolioValue
      }

      // Add sample paths
      samplePaths.forEach((path, pathIndex) => {
        if (i < path.length) {
          dataPoint[`path${pathIndex}`] = path[i]
        }
      })

      return dataPoint
    })
  }

  const generateEfficientFrontierChartData = () => {
    if (!efficientFrontierData) return []

    const data = efficientFrontierData.efficientFrontier.map((point) => ({
      risk: point.risk,
      return: point.return,
      type: "Efficient Frontier",
    }))

    // Add CML
    efficientFrontierData.cmlPortfolios.forEach((point) => {
      data.push({
        risk: point.risk,
        return: point.return,
        type: "Capital Market Line",
      })
    })

    // Add current portfolio
    data.push({
      risk: portfolioVolatility,
      return: portfolioExpectedReturn,
      type: "Current Portfolio",
    })

    // Add minimum variance portfolio
    data.push({
      risk: efficientFrontierData.minVariancePortfolio.risk,
      return: efficientFrontierData.minVariancePortfolio.return,
      type: "Minimum Variance",
    })

    // Add tangency portfolio
    data.push({
      risk: efficientFrontierData.tangencyPortfolio.risk,
      return: efficientFrontierData.tangencyPortfolio.return,
      type: "Tangency Portfolio",
    })

    return data
  }

  const generateFactorExposureData = () => {
    return factorExposures.map((factor) => ({
      factor: factor.name,
      exposure: factor.exposure,
    }))
  }

  const generateStressTestData = () => {
    return [
      ...stressTestResults,
      ...customScenarios.map((scenario) => ({
        ...scenario,
        impact: calculateStressTestImpact(assets, scenario),
      })),
    ].sort((a, b) => a.impact - b.impact)
  }

  const generateRiskContributionData = () => {
    return riskContributions
  }

  const generateAssetAllocationData = () => {
    return assets.map((asset) => ({
      name: asset.name,
      value: asset.allocation,
    }))
  }

  const generateHistoricalComparisonData = () => {
    return historicalScenarios.map((scenario) => {
      // Calculate portfolio performance in this scenario
      const portfolioPerformance = assets.reduce((total, asset) => {
        let assetPerformance = 0

        if (asset.name.toLowerCase().includes("aktie")) {
          assetPerformance = scenario.return
        } else if (asset.name.toLowerCase().includes("obligation")) {
          // Bonds typically perform better in market downturns
          assetPerformance = -scenario.return * 0.3
        } else if (asset.name.toLowerCase().includes("kontant")) {
          // Cash is stable during market downturns
          assetPerformance = 0.5
        } else {
          // Default to market performance
          assetPerformance = scenario.return * 0.8
        }

        return total + (asset.allocation / 100) * assetPerformance
      }, 0)

      return {
        name: scenario.name,
        marketReturn: scenario.return,
        portfolioReturn: portfolioPerformance,
      }
    })
  }

  const generateComparisonData = () => {
    const data = []

    // Add current portfolio
    data.push({
      name: "Din portefølje",
      return: portfolioExpectedReturn,
      risk: portfolioVolatility,
      sharpe: portfolioSharpeRatio,
    })

    // Add selected benchmarks
    selectedBenchmarks.forEach((benchmarkName) => {
      const benchmark = benchmarkPortfolios.find((b) => b.name === benchmarkName)
      if (benchmark) {
        // Create correlation matrix for benchmark
        const benchmarkCorrelationMatrix = Array(benchmark.assets.length)
          .fill()
          .map(() => Array(benchmark.assets.length).fill(0.2))

        // Set diagonal to 1
        for (let i = 0; i < benchmark.assets.length; i++) {
          benchmarkCorrelationMatrix[i][i] = 1.0
        }

        // Find expected return and volatility for each asset in benchmark
        const benchmarkAssetsWithMetrics = benchmark.assets.map((benchmarkAsset) => {
          const matchingAsset = assets.find((a) => a.name.toLowerCase().includes(benchmarkAsset.name.toLowerCase()))

          return {
            ...benchmarkAsset,
            expectedReturn: matchingAsset ? matchingAsset.expectedReturn : 5,
            volatility: matchingAsset ? matchingAsset.volatility : 10,
          }
        })

        const benchmarkReturn = calculateExpectedReturn(benchmarkAssetsWithMetrics)
        const benchmarkVolatility = calculatePortfolioVolatility(benchmarkAssetsWithMetrics, benchmarkCorrelationMatrix)
        const benchmarkSharpe = calculateSharpeRatio(benchmarkReturn, benchmarkVolatility)

        data.push({
          name: benchmark.name,
          return: benchmarkReturn,
          risk: benchmarkVolatility,
          sharpe: benchmarkSharpe,
        })
      }
    })

    return data
  }

  // Handle functions
  const handleAddAsset = () => {
    setAssets([...assets, { name: "Nyt aktiv", allocation: 0, expectedReturn: 5, volatility: 10 }])
  }

  const handleRemoveAsset = (index) => {
    const newAssets = [...assets]
    newAssets.splice(index, 1)
    setAssets(newAssets)
  }

  const handleAssetChange = (index, field, value) => {
    const newAssets = [...assets]
    newAssets[index][field] = value
    setAssets(newAssets)
  }

  const handleNext = () => {
  if (step < 4) {
    setStep(step + 1);
  } else {
    setShowResults(true);
  }
};

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleReset = () => {
    setShowResults(false)
    setStep(1)
  }

  const handleOptimizePortfolio = () => {
    // Simplified portfolio optimization
    let optimizedAssets = [...assets]

    if (optimizationObjective === "sharpe") {
      // Use tangency portfolio from efficient frontier
      if (efficientFrontierData && efficientFrontierData.tangencyPortfolio) {
        optimizedAssets = assets.map((asset, i) => ({
          ...asset,
          allocation: Math.round(efficientFrontierData.tangencyPortfolio.weights[i] * 100),
        }))
      }
    } else if (optimizationObjective === "minRisk") {
      // Use minimum variance portfolio
      if (efficientFrontierData && efficientFrontierData.minVariancePortfolio) {
        optimizedAssets = assets.map((asset, i) => ({
          ...asset,
          allocation: Math.round(efficientFrontierData.minVariancePortfolio.allocation[i]),
        }))
      }
    } else if (optimizationObjective === "maxReturn") {
      // Simple approach: allocate to highest return asset
      const highestReturnIndex = assets.reduce(
        (maxIndex, asset, index) => (asset.expectedReturn > assets[maxIndex].expectedReturn ? index : maxIndex),
        0,
      )

      optimizedAssets = assets.map((asset, i) => ({
        ...asset,
        allocation: i === highestReturnIndex ? 100 : 0,
      }))
    }

    setOptimizedPortfolio(optimizedAssets)
    setShowOptimizationDialog(false)
  }

  const handleApplyOptimizedPortfolio = () => {
    if (optimizedPortfolio) {
      setAssets(optimizedPortfolio)
      setOptimizedPortfolio(null)
    }
  }

  const handleAddCustomScenario = () => {
    if (newScenario.name) {
      setCustomScenarios([...customScenarios, { ...newScenario }])
      setNewScenario({
        name: "",
        marketImpact: 0,
        bondImpact: 0,
        cashImpact: 0,
        realEstateImpact: 0,
        commodityImpact: 0,
        realEstateImpact: 0,
        commodityImpact: 0,
      })
      setShowCustomScenarioDialog(false)
    }
  }

  const handleExportData = () => {
    // In a real application, this would generate and download a file
    alert(`Data would be exported in ${exportFormat.toUpperCase()} format`)
    setShowExportDialog(false)
  }

  // Calculate total allocation
  const calculateTotalAllocation = () => {
    return assets.reduce((total, asset) => total + asset.allocation, 0)
  }

  // Get risk level based on volatility
  const getRiskLevel = () => {
    if (portfolioVolatility < 5) return "Meget lav"
    if (portfolioVolatility < 10) return "Lav"
    if (portfolioVolatility < 15) return "Moderat"
    if (portfolioVolatility < 20) return "Høj"
    return "Meget høj"
  }

  // Get risk level color
  const getRiskLevelColor = () => {
    if (portfolioVolatility < 5) return "bg-green-500"
    if (portfolioVolatility < 10) return "bg-emerald-500"
    if (portfolioVolatility < 15) return "bg-yellow-500"
    if (portfolioVolatility < 20) return "bg-orange-500"
    return "bg-red-500"
  }

  // COLORS for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"]

  const generateRadarData = () => {
    return [
      {
        subject: "Forventet afkast",
        value: Math.min(portfolioExpectedReturn / 15, 1), // Scaled to 0-1
        fullMark: 1,
      },
      {
        subject: "Volatilitet",
        value: 1 - Math.min(portfolioVolatility / 25, 1), // Scaled to 0-1, inverted
        fullMark: 1,
      },
      {
        subject: "Sharpe Ratio",
        value: Math.min(portfolioSharpeRatio / 2, 1), // Scaled to 0-1
        fullMark: 1,
      },
      {
        subject: "Diversifikation",
        value: Math.min(assets.length / 5, 1), // Scaled to 0-1
        fullMark: 1,
      },
      {
        subject: "Likviditet",
        value: Math.min(liquidityScore / 100, 1), // Scaled to 0-1
        fullMark: 1,
      },
    ]
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 flex items-center">
        <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbage til forsiden
        </Link>
        <h1 className="ml-auto text-2xl font-bold tracking-tight">Avanceret Risikoberegner</h1>

        {showResults && (
          <div className="ml-4 flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
              <Download className="mr-2 h-4 w-4" />
              Eksportér
            </Button>
            <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Eksportér risikoanalyse</DialogTitle>
                  <DialogDescription>Vælg et format til at eksportere din risikoanalyse</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pdf" id="pdf" />
                      <Label htmlFor="pdf">PDF-rapport</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="excel" id="excel" />
                      <Label htmlFor="excel">Excel-regneark</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="csv" id="csv" />
                      <Label htmlFor="csv">CSV-fil</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleExportData}>Eksportér</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {!showResults ? (
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Trin {step} af 4</h2>
              <span className="text-sm text-muted-foreground">{step * 25}% fuldført</span>
            </div>
            <Progress value={step * 25} className="h-2" />
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Hvilken type investering vil du analysere?</CardTitle>
                <CardDescription>Vælg den type investering, du ønsker at vurdere risikoen for</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={investmentType} onValueChange={setInvestmentType} className="space-y-4">
                  <div className="flex items-start space-x-3 rounded-md border p-4">
                    <RadioGroupItem value="portfolio" id="portfolio" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="portfolio" className="font-medium">
                        Investeringsportefølje
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Analysér risikoen for en portefølje af forskellige aktiver
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 rounded-md border p-4">
                    <RadioGroupItem value="single" id="single" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="single" className="font-medium">
                        Enkelt aktiv
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Analysér risikoen for et enkelt aktiv
                      </p>
                    </div>
                  </div>
                </RadioGroup>

                <div className="rounded-md border p-4 bg-blue-50 dark:bg-blue-950/30">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Avanceret risikoanalyse</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Denne beregner bruger avancerede finansielle modeller til at analysere risikoen i din
                        portefølje, herunder Monte Carlo-simulationer, effektiv grænse-analyse, faktoreksponering og
                        stress-tests.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleNext}>Næste</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && investmentType === "single" && (
            <Card>
              <CardHeader>
                <CardTitle>Angiv information om dit aktiv</CardTitle>
                <CardDescription>Indtast detaljer om det aktiv, du ønsker at analysere</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="asset-name">Aktivnavn</Label>
                      <Input 
                        id="asset-name" 
                        value={singleAsset.name} 
                        onChange={(e) => setSingleAsset({...singleAsset, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="asset-ticker">Ticker symbol</Label>
                      <Input 
                        id="asset-ticker" 
                        value={singleAsset.ticker} 
                        onChange={(e) => setSingleAsset({...singleAsset, ticker: e.target.value})}
                        placeholder="f.eks. AAPL, MSFT"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="asset-price">Nuværende pris (DKK)</Label>
                      <Input 
                        id="asset-price" 
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={singleAsset.price} 
                        onChange={(e) => setSingleAsset({...singleAsset, price: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="asset-sector">Sektor</Label>
                      <Select 
                        value={singleAsset.sector}
                        onValueChange={(value) => setSingleAsset({...singleAsset, sector: value})}
                      >
                        <SelectTrigger id="asset-sector">
                          <SelectValue placeholder="Vælg sektor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Teknologi">Teknologi</SelectItem>
                          <SelectItem value="Finans">Finans</SelectItem>
                          <SelectItem value="Sundhed">Sundhed</SelectItem>
                          <SelectItem value="Forbrugsgoder">Forbrugsgoder</SelectItem>
                          <SelectItem value="Industri">Industri</SelectItem>
                          <SelectItem value="Energi">Energi</SelectItem>
                          <SelectItem value="Materialer">Materialer</SelectItem>
                          <SelectItem value="Forsyning">Forsyning</SelectItem>
                          <SelectItem value="Ejendom">Ejendom</SelectItem>
                          <SelectItem value="Kommunikation">Kommunikation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <div className="flex items-center mb-1">
                        <Label htmlFor="asset-expected-return">Forventet afkast (%)</Label>
                        {showTooltips && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                                <HelpCircle className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <p className="text-sm">
                                Det forventede årlige afkast for dette aktiv. Historisk har aktier givet omkring
                                7-9% i årligt afkast.
                              </p>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                      <Input
                        id="asset-expected-return"
                        type="number"
                        min="-20"
                        max="30"
                        step="0.1"
                        value={singleAsset.expectedReturn}
                        onChange={(e) => setSingleAsset({...singleAsset, expectedReturn: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        <Label htmlFor="asset-volatility">Volatilitet (%)</Label>
                        {showTooltips && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                                <HelpCircle className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <p className="text-sm">
                                Volatilitet måler, hvor meget afkastet svinger. Højere tal betyder større udsving.
                                Typisk har aktier 15-20% volatilitet.
                              </p>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                      <Input
                        id="asset-volatility"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={singleAsset.volatility}
                        onChange={(e) => setSingleAsset({...singleAsset, volatility: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        <Label htmlFor="asset-beta">Beta</Label>
                        {showTooltips && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                                <HelpCircle className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <p className="text-sm">
                                Beta måler aktivets følsomhed over for markedsbevægelser. En beta på 1 betyder, at aktivet bevæger sig i takt med markedet. 
                                Beta over 1 betyder højere volatilitet end markedet, under 1 betyder lavere volatilitet.
                              </p>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                      <Input
                        id="asset-beta"
                        type="number"
                        min="0"
                        max="3"
                        step="0.01"
                        value={singleAsset.beta}
                        onChange={(e) => setSingleAsset({...singleAsset, beta: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="asset-market-cap">Markedsværdi</Label>
                      <Select
                        value={singleAsset.marketCap}
                        onValueChange={(value) => setSingleAsset({...singleAsset, marketCap: value})}
                      >
                        <SelectTrigger id="asset-market-cap">
                          <SelectValue placeholder="Vælg markedsværdi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Large Cap">Large Cap (&gt;10 mia. DKK)</SelectItem>
                          <SelectItem value="Mid Cap">Mid Cap (2-10 mia. DKK)</SelectItem>
                          <SelectItem value="Small Cap">Small Cap (&lt;2 mia. DKK)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="asset-dividend-yield">Udbytteafkast (%)</Label>
                      <Input
                        id="asset-dividend-yield"
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={singleAsset.dividendYield}
                        onChange={(e) => setSingleAsset({...singleAsset, dividendYield: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="portfolio-value">Investeret beløb (DKK)</Label>
                      <Input
                        id="portfolio-value"
                        type="number"
                        min="1000"
                        value={portfolioValue}
                        onChange={(e) => setPortfolioValue(Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="rounded-md border p-4 bg-blue-50 dark:bg-blue-950/30">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">Populære aktier</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Nogle populære aktier og deres typiske værdier:
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <Button variant="outline" size="sm" className="h-auto py-1 justify-start" onClick={() => 
                            setSingleAsset({
                              name: "Novo Nordisk",
                              ticker: "NOVO-B.CO",
                              price: 850,
                              expectedReturn: 12,
                              volatility: 22,
                              beta: 0.85,
                              sector: "Sundhed",
                              marketCap: "Large Cap",
                              dividendYield: 1.2
                            })
                          }>
                            Novo Nordisk (NOVO-B)
                          </Button>
                          <Button variant="outline" size="sm" className="h-auto py-1 justify-start" onClick={() => 
                            setSingleAsset({
                              name: "Vestas",
                              ticker: "VWS.CO",
                              price: 175,
                              expectedReturn: 8,
                              volatility: 30,
                              beta: 1.2,
                              sector: "Energi",
                              marketCap: "Large Cap",
                              dividendYield: 0.5
                            })
                          }>
                            Vestas (VWS)
                          </Button>
                          <Button variant="outline" size="sm" className="h-auto py-1 justify-start" onClick={() => 
                            setSingleAsset({
                              name: "Danske Bank",
                              ticker: "DANSKE.CO",
                              price: 160,
                              expectedReturn: 7,
                              volatility: 25,
                              beta: 1.1,
                              sector: "Finans",
                              marketCap: "Large Cap",
                              dividendYield: 3.5
                            })
                          }>
                            Danske Bank (DANSKE)
                          </Button>
                          <Button variant="outline" size="sm" className="h-auto py-1 justify-start" onClick={() => 
                            setSingleAsset({
                              name: "DSV",
                              ticker: "DSV.CO",
                              price: 1200,
                              expectedReturn: 10,
                              volatility: 24,
                              beta: 1.05,
                              sector: "Industri",
                              marketCap: "Large Cap",
                              dividendYield: 0.8
                            })
                          }>
                            DSV (DSV)
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Tilbage
                  </Button>
                  <Button onClick={() => setStep(4)}>
                    Næste
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && investmentType === "single" && (
            <Card>
              <CardHeader>
                <CardTitle>Hvad er din investeringshorisont og risikovillighed?</CardTitle>
                <CardDescription>Angiv din tidshorisont og risikovillighed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="investment-horizon">Investeringshorisont: {investmentHorizon} år</Label>
                    <Slider
                      id="investment-horizon"
                      min={1}
                      max={30}
                      step={1}
                      value={[investmentHorizon]}
                      onValueChange={(value) => setInvestmentHorizon(value[0])}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 år</span>
                      <span>30 år</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Label htmlFor="risk-tolerance">Risikovillighed</Label>
                    <RadioGroup value={riskTolerance} onValueChange={setRiskTolerance} className="space-y-4">
                      <div className="flex items-start space-x-3 rounded-md border p-4">
                        <RadioGroupItem value="low" id="risk-low" className="mt-1" />
                        <div className="space-y-1">
                          <Label htmlFor="risk-low" className="font-medium">
                            Lav
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Du foretrækker stabilitet og er villig til at acceptere lavere afkast for at minimere
                            risikoen for tab
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 rounded-md border p-4">
                        <RadioGroupItem value="medium" id="risk-medium" className="mt-1" />
                        <div className="space-y-1">
                          <Label htmlFor="risk-medium" className="font-medium">
                            Moderat
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Du søger en balance mellem vækst og stabilitet og er villig til at acceptere moderate
                            udsving
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 rounded-md border p-4">
                        <RadioGroupItem value="high" id="risk-high" className="mt-1" />
                        <div className="space-y-1">
                          <Label htmlFor="risk-high" className="font-medium">
                            Høj
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Du prioriterer vækst og er villig til at acceptere større udsving for at opnå højere afkast
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Tilbage
                  </Button>
                  <Button onClick={handleNext}>
                    Næste
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (investmentType === "portfolio") && (
            <Card>
              <CardHeader>
                <CardTitle>Hvordan er din portefølje sammensat?</CardTitle>
                <CardDescription>Angiv dine aktiver og deres allokering</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="portfolio-value">Porteføljens værdi</Label>
                    <Input
                      id="portfolio-value"
                      type="number"
                      min="1000"
                      value={portfolioValue}
                      onChange={(e) => setPortfolioValue(Number.parseFloat(e.target.value) || 0)}
                      className="w-48"
                    />
                  </div>

                  {assets.map((asset, index) => (
                    <div key={index} className="rounded-md border p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1 mr-4">
                          <Label htmlFor={`asset-name-${index}`} className="mb-1 block">
                            Aktivnavn
                          </Label>
                          <Input
                            id={`asset-name-${index}`}
                            value={asset.name}
                            onChange={(e) => handleAssetChange(index, "name", e.target.value)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAsset(index)}
                          disabled={assets.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Fjern aktiv</span>
                        </Button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <Label htmlFor={`asset-allocation-${index}`} className="mb-1 block">
                            Allokering (%)
                          </Label>
                          <Input
                            id={`asset-allocation-${index}`}
                            type="number"
                            min="0"
                            max="100"
                            value={asset.allocation}
                            onChange={(e) =>
                              handleAssetChange(index, "allocation", Number.parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <Label htmlFor={`asset-return-${index}`} className="block">
                              Forventet afkast (%)
                            </Label>
                            {showTooltips && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                                    <HelpCircle className="h-3 w-3" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                  <p className="text-sm">
                                    Det forventede årlige afkast for dette aktiv. Historisk har aktier givet omkring
                                    7-9%, obligationer 3-5% og kontanter 0-2% i årligt afkast.
                                  </p>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                          <Input
                            id={`asset-return-${index}`}
                            type="number"
                            min="-20"
                            max="30"
                            step="0.1"
                            value={asset.expectedReturn}
                            onChange={(e) =>
                              handleAssetChange(index, "expectedReturn", Number.parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <Label htmlFor={`asset-volatility-${index}`} className="block">
                              Volatilitet (%)
                            </Label>
                            {showTooltips && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                                    <HelpCircle className="h-3 w-3" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                  <p className="text-sm">
                                    Volatilitet måler, hvor meget afkastet svinger. Højere tal betyder større udsving.
                                    Typisk har aktier 15-20% volatilitet, obligationer 5-8% og kontanter under 1%.
                                  </p>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                          <Input
                            id={`asset-volatility-${index}`}
                            type="number"
                            min="0"
                            max="50"
                            step="0.1"
                            value={asset.volatility}
                            onChange={(e) =>
                              handleAssetChange(index, "volatility", Number.parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={handleAddAsset} className="flex items-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Tilføj aktiv
                    </Button>
                    <div
                      className={`text-sm ${calculateTotalAllocation() !== 100 ? "text-red-500" : "text-green-500"}`}
                    >
                      Total allokering: {calculateTotalAllocation()}%{" "}
                      {calculateTotalAllocation() !== 100 ? "(Skal være 100%)" : ""}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Tilbage
                  </Button>
                  <Button onClick={handleNext} disabled={calculateTotalAllocation() !== 100}>
                    Næste
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (investmentType === "portfolio") && (
            <Card>
              <CardHeader>
                <CardTitle>Hvad er din investeringshorisont og risikovillighed?</CardTitle>
                <CardDescription>Angiv din tidshorisont og risikovillighed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="investment-horizon">Investeringshorisont: {investmentHorizon} år</Label>
                    <Slider
                      id="investment-horizon"
                      min={1}
                      max={30}
                      step={1}
                      value={[investmentHorizon]}
                      onValueChange={(value) => setInvestmentHorizon(value[0])}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 år</span>
                      <span>30 år</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Label htmlFor="risk-tolerance">Risikovillighed</Label>
                    <RadioGroup value={riskTolerance} onValueChange={setRiskTolerance} className="space-y-4">
                      <div className="flex items-start space-x-3 rounded-md border p-4">
                        <RadioGroupItem value="low" id="risk-low" className="mt-1" />
                        <div className="space-y-1">
                          <Label htmlFor="risk-low" className="font-medium">
                            Lav
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Du foretrækker stabilitet og er villig til at acceptere lavere afkast for at minimere
                            risikoen for tab
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 rounded-md border p-4">
                        <RadioGroupItem value="medium" id="risk-medium" className="mt-1" />
                        <div className="space-y-1">
                          <Label htmlFor="risk-medium" className="font-medium">
                            Moderat
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Du søger en balance mellem vækst og stabilitet og er villig til at acceptere moderate
                            udsving
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 rounded-md border p-4">
                        <RadioGroupItem value="high" id="risk-high" className="mt-1" />
                        <div className="space-y-1">
                          <Label htmlFor="risk-high" className="font-medium">
                            Høj
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Du prioriterer vækst og er villig til at acceptere større udsving for at opnå højere afkast
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="show-advanced">Avancerede indstillinger</Label>
                      <Switch
                        id="show-advanced"
                        checked={showAdvancedOptions}
                        onCheckedChange={setShowAdvancedOptions}
                      />
                    </div>

                    {showAdvancedOptions && (
                      <div className="space-y-4 mt-4 rounded-md border p-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="confidence-level" className="mb-1 block">
                              Konfidensniveau for VaR
                            </Label>
                            <Select
                              value={selectedConfidenceLevel.toString()}
                              onValueChange={(value) => setSelectedConfidenceLevel(Number.parseFloat(value))}
                            >
                              <SelectTrigger id="confidence-level">
                                <SelectValue placeholder="Vælg konfidensniveau" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0.9">90%</SelectItem>
                                <SelectItem value="0.95">95%</SelectItem>
                                <SelectItem value="0.99">99%</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="time-horizon" className="mb-1 block">
                              Tidshorisont for VaR
                            </Label>
                            <Select
                              value={selectedTimeHorizon.toString()}
                              onValueChange={(value) => setSelectedTimeHorizon(Number.parseInt(value))}
                            >
                              <SelectTrigger id="time-horizon">
                                <SelectValue placeholder="Vælg tidshorisont" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 dag</SelectItem>
                                <SelectItem value="5">1 uge (5 dage)</SelectItem>
                                <SelectItem value="20">1 måned (20 dage)</SelectItem>
                                <SelectItem value="60">1 kvartal (60 dage)</SelectItem>
                                <SelectItem value="250">1 år (250 dage)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="inflation-rate" className="mb-1 block">
                              Forventet inflation (%)
                            </Label>
                            <Input
                              id="inflation-rate"
                              type="number"
                              min="0"
                              max="20"
                              step="0.1"
                              value={inflationRate}
                              onChange={(e) => setInflationRate(Number.parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="tax-rate" className="mb-1 block">
                              Skattesats (%)
                            </Label>
                            <Input
                              id="tax-rate"
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={taxRate}
                              onChange={(e) => setTaxRate(Number.parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="fees" className="mb-1 block">
                            Årlige omkostninger (%)
                          </Label>
                          <Input
                            id="fees"
                            type="number"
                            min="0"
                            max="5"
                            step="0.01"
                            value={fees}
                            onChange={(e) => setFees(Number.parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="rebalancing" className="mb-1 block">
                            Rebalanceringsfrekvens
                          </Label>
                          <Select value={rebalancingFrequency} onValueChange={setRebalancingFrequency}>
                            <SelectTrigger id="rebalancing">
                              <SelectValue placeholder="Vælg frekvens" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="never">Aldrig</SelectItem>
                              <SelectItem value="yearly">Årligt</SelectItem>
                              <SelectItem value="quarterly">Kvartalsvis</SelectItem>
                              <SelectItem value="monthly">Månedligt</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Tilbage
                  </Button>
                  <Button onClick={handleNext}>Næste</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (investmentType === "portfolio") && (
            <Card>
              <CardHeader>
                <CardTitle>Avancerede risikoparametre</CardTitle>
                <CardDescription>Angiv korrelationer og stress-scenarier for din portefølje</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Korrelationsmatrix</Label>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="border p-2"></th>
                            {assets.map((asset, index) => (
                              <th key={index} className="border p-2 text-sm">
                                {asset.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {assets.map((asset, i) => (
                            <tr key={i}>
                              <th className="border p-2 text-sm">{asset.name}</th>
                              {assets.map((_, j) => (
                                <td key={j} className="border p-2">
                                  {i === j ? (
                                    <Input value="1.0" disabled className="w-16 text-center" />
                                  ) : (
                                    <Input
                                      type="number"
                                      min="-1"
                                      max="1"
                                      step="0.1"
                                      value={correlationMatrix[i][j]}
                                      onChange={(e) => {
                                        const newMatrix = [...correlationMatrix]
                                        const value = Number.parseFloat(e.target.value)
                                        if (!isNaN(value) && value >= -1 && value <= 1) {
                                          newMatrix[i][j] = value
                                          newMatrix[j][i] = value // Symmetrisk matrix
                                          setCorrelationMatrix(newMatrix)
                                        }
                                      }}
                                      className="w-16 text-center"
                                    />
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Korrelation mellem -1 (perfekt negativ) og 1 (perfekt positiv). 0 betyder ingen korrelation.
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Stress-scenarier</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCustomScenarioDialog(true)}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Tilføj scenarie
                      </Button>

                      <Dialog open={showCustomScenarioDialog} onOpenChange={setShowCustomScenarioDialog}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Tilføj nyt stress-scenarie</DialogTitle>
                            <DialogDescription>
                              Definer et nyt stress-scenarie med påvirkning på forskellige aktivklasser
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div>
                              <Label htmlFor="scenario-name" className="mb-1 block">
                                Scenarienavn
                              </Label>
                              <Input
                                id="scenario-name"
                                value={newScenario.name}
                                onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
                              />
                            </div>

                            <div>
                              <Label htmlFor="market-impact" className="mb-1 block">
                                Påvirkning på aktier (%)
                              </Label>
                              <Input
                                id="market-impact"
                                type="number"
                                value={newScenario.marketImpact}
                                onChange={(e) =>
                                  setNewScenario({ ...newScenario, marketImpact: Number(e.target.value) })
                                }
                              />
                            </div>

                            <div>
                              <Label htmlFor="bond-impact" className="mb-1 block">
                                Påvirkning på obligationer (%)
                              </Label>
                              <Input
                                id="bond-impact"
                                type="number"
                                value={newScenario.bondImpact}
                                onChange={(e) => setNewScenario({ ...newScenario, bondImpact: Number(e.target.value) })}
                              />
                            </div>

                            <div>
                              <Label htmlFor="cash-impact" className="mb-1 block">
                                Påvirkning på kontanter (%)
                              </Label>
                              <Input
                                id="cash-impact"
                                type="number"
                                value={newScenario.cashImpact}
                                onChange={(e) => setNewScenario({ ...newScenario, cashImpact: Number(e.target.value) })}
                              />
                            </div>

                            <div>
                              <Label htmlFor="realestate-impact" className="mb-1 block">
                                Påvirkning på ejendomme (%)
                              </Label>
                              <Input
                                id="realestate-impact"
                                type="number"
                                value={newScenario.realEstateImpact}
                                onChange={(e) =>
                                  setNewScenario({ ...newScenario, realEstateImpact: Number(e.target.value) })
                                }
                              />
                            </div>

                            <div>
                              <Label htmlFor="commodity-impact" className="mb-1 block">
                                Påvirkning på råvarer (%)
                              </Label>
                              <Input
                                id="commodity-impact"
                                type="number"
                                value={newScenario.commodityImpact}
                                onChange={(e) =>
                                  setNewScenario({ ...newScenario, commodityImpact: Number(e.target.value) })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button onClick={handleAddCustomScenario}>Tilføj scenarie</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="space-y-2 rounded-md border p-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Vælg hvilke stress-scenarier du vil inkludere i din analyse:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {stressTestScenarios.map((scenario, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Checkbox id={`scenario-${index}`} defaultChecked />
                            <Label htmlFor={`scenario-${index}`} className="text-sm">
                              {scenario.name}
                            </Label>
                          </div>
                        ))}

                        {customScenarios.map((scenario, index) => (
                          <div key={`custom-${index}`} className="flex items-center space-x-2">
                            <Checkbox id={`custom-scenario-${index}`} defaultChecked />
                            <Label htmlFor={`custom-scenario-${index}`} className="text-sm">
                              {scenario.name}{" "}
                              <Badge variant="outline" className="ml-1 text-xs">
                                Brugerdefineret
                              </Badge>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Label htmlFor="worst-case">Historisk worst-case tab: {historicalWorstCase}%</Label>
                    <Slider
                      id="worst-case"
                      min={-100}
                      max={0}
                      step={5}
                      value={[historicalWorstCase]}
                      onValueChange={(value) => setHistoricalWorstCase(value[0])}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>-100%</span>
                      <span>0%</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Angiv det værste historiske tab for en lignende portefølje
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Sammenligning med benchmarks</Label>
                      <Switch id="show-comparison" checked={showComparison} onCheckedChange={setShowComparison} />
                    </div>

                    {showComparison && (
                      <div className="space-y-2 rounded-md border p-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          Vælg hvilke benchmark-porteføljer du vil sammenligne med:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {benchmarkPortfolios.map((benchmark, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Checkbox
                                id={`benchmark-${index}`}
                                checked={selectedBenchmarks.includes(benchmark.name)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedBenchmarks([...selectedBenchmarks, benchmark.name])
                                  } else {
                                    setSelectedBenchmarks(selectedBenchmarks.filter((b) => b !== benchmark.name))
                                  }
                                }}
                              />
                              <Label htmlFor={`benchmark-${index}`} className="text-sm">
                                {benchmark.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Tilbage
                  </Button>
                  <Button onClick={handleNext}>Beregn resultat</Button>
                </div>
              </CardContent>
            </Card>
          )}
          {step === 4 && investmentType === "single" && (
            <Card>
              <CardHeader>
                <CardTitle>Bekræft dine valg</CardTitle>
                <CardDescription>Er du klar til at se resultaterne?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p>Klik på knappen nedenfor for at beregne resultaterne.</p>
                <Button onClick={() => setShowResults(true)}>Beregn resultat</Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Risikoanalyse af din portefølje</CardTitle>
                  <CardDescription>
                    Baseret på din porteføljesammensætning og investeringshorisont på {investmentHorizon} år
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`px-3 py-1 ${getRiskLevelColor()}`}>{getRiskLevel()} risiko</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">Forventet årligt afkast</div>
                  <div className="mt-1 text-2xl font-bold">{formatPercent(portfolioExpectedReturn)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Efter omkostninger: {formatPercent(portfolioExpectedReturn - fees)}
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">Volatilitet (Risiko)</div>
                  <div className="mt-1 text-2xl font-bold">{formatPercent(portfolioVolatility)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Standardafvigelse på årligt afkast</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">Sharpe Ratio</div>
                  <div className="mt-1 text-2xl font-bold">{portfolioSharpeRatio.toFixed(2)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Risikojusteret afkast (højere er bedre)</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Value at Risk ({selectedConfidenceLevel * 100}%)
                  </div>
                  <div className="mt-1 text-2xl font-bold">{formatCurrency(portfolioValueAtRisk)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Maksimalt tab over {selectedTimeHorizon} {selectedTimeHorizon === 1 ? "dag" : "dage"} med{" "}
                    {selectedConfidenceLevel * 100}% sandsynlighed
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">Conditional VaR</div>
                  <div className="mt-1 text-2xl font-bold">{formatCurrency(portfolioConditionalVaR)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Forventet tab hvis VaR overskrides</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium text-muted-foreground">Likviditetsscore</div>
                  <div className="mt-1 text-2xl font-bold">{liquidityScore.toFixed(1)}/100</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Hvor hurtigt kan porteføljen omsættes til kontanter
                  </div>
                </div>
              </div>

              <Tabs defaultValue="risk-return" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
                  {investmentType === "portfolio" ? (
                    <>
                      <TabsTrigger value="risk-return">Risiko/Afkast</TabsTrigger>
                      <TabsTrigger value="monte-carlo">Monte Carlo</TabsTrigger>
                      <TabsTrigger value="efficient-frontier">Effektiv grænse</TabsTrigger>
                      <TabsTrigger value="risk-profile">Risikoprofil</TabsTrigger>
                      <TabsTrigger value="stress-test">Stress-test</TabsTrigger>
                      <TabsTrigger value="factor-analysis">Faktoranalyse</TabsTrigger>
                      <TabsTrigger value="optimization">Optimering</TabsTrigger>
                    </>
                  ) : (
                    <>
                      <TabsTrigger value="single-asset-analysis">Aktivanalyse</TabsTrigger>
                      <TabsTrigger value="risk-profile">Risikoprofil</TabsTrigger>
                      <TabsTrigger value="stress-test">Stress-test</TabsTrigger>
                    </>
                  )}
                </TabsList>

                <TabsContent value="risk-return" className="pt-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Risiko/Afkast-analyse</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                              <CartesianGrid />
                              <XAxis
                                type="number"
                                dataKey="risk"
                                name="Risiko"
                                label={{ value: "Volatilitet (%)", position: "insideBottomRight", offset: -5 }}
                              />
                              <YAxis
                                type="number"
                                dataKey="return"
                                name="Afkast"
                                label={{ value: "Forventet afkast (%)", angle: -90, position: "insideLeft" }}
                              />
                              <ZAxis type="number" dataKey="allocation" range={[50, 400]} />
                              <TooltipProvider>
                                <Tooltip
                                  cursor={{ strokeDasharray: "3 3" }}
                                  formatter={(value) => `${value.toFixed(2)}%`}
                                />
                              </TooltipProvider>
                              <Legend />
                              <Scatter name="Aktiver" data={generateRiskReturnData()} fill="#8884d8" />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Aktivallokering</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={generateAssetAllocationData()}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {generateAssetAllocationData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => `${value}%`} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {showComparison && selectedBenchmarks.length > 0 && (
                      <Card className="md:col-span-2">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Sammenligning med benchmarks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={generateComparisonData()}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="return" name="Forventet afkast (%)" fill="#8884d8" />
                                <Bar yAxisId="left" dataKey="risk" name="Volatilitet (%)" fill="#82ca9d" />
                                <Bar yAxisId="right" dataKey="sharpe" name="Sharpe Ratio" fill="#ffc658" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="monte-carlo" className="pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Monte Carlo-simulation</CardTitle>
                      <CardDescription>1.000 simulerede investeringsforløb over {investmentHorizon} år</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={generateMonteCarloChartData()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" label={{ value: "År", position: "insideBottomRight", offset: -5 }} />
                            <YAxis label={{ value: "Porteføljeværdi (DKK)", angle: -90, position: "insideLeft" }} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="p5"
                              stackId="1"
                              fill="#8884d8"
                              stroke="none"
                              fillOpacity={0.1}
                              name="5% percentil"
                            />
                            <Area
                              type="monotone"
                              dataKey="p25"
                              stackId="1"
                              fill="#8884d8"
                              stroke="none"
                              fillOpacity={0.2}
                              name="25% percentil"
                            />
                            <Area
                              type="monotone"
                              dataKey="median"
                              stackId="1"
                              fill="#8884d8"
                              stroke="none"
                              fillOpacity={0.3}
                              name="Median"
                            />
                            <Area
                              type="monotone"
                              dataKey="p75"
                              stackId="1"
                              fill="#8884d8"
                              stroke="none"
                              fillOpacity={0.2}
                              name="75% percentil"
                            />
                            <Area
                              type="monotone"
                              dataKey="p95"
                              stackId="1"
                              fill="#8884d8"
                              stroke="none"
                              fillOpacity={0.1}
                              name="95% percentil"
                            />
                            <Line
                              type="monotone"
                              dataKey="median"
                              stroke="#8884d8"
                              strokeWidth={2}
                              dot={false}
                              name="Median"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>

                      {monteCarloResults && (
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="rounded-lg border p-3">
                            <div className="text-sm font-medium text-muted-foreground">Median slutværdi</div>
                            <div className="mt-1 text-xl font-bold">
                              {formatCurrency(monteCarloResults.percentiles.median)}
                            </div>
                          </div>
                          <div className="rounded-lg border p-3">
                            <div className="text-sm font-medium text-muted-foreground">Bedste scenarie</div>
                            <div className="mt-1 text-xl font-bold">
                              {formatCurrency(monteCarloResults.percentiles.best)}
                            </div>
                          </div>
                          <div className="rounded-lg border p-3">
                            <div className="text-sm font-medium text-muted-foreground">Værste scenarie</div>
                            <div className="mt-1 text-xl font-bold">
                              {formatCurrency(monteCarloResults.percentiles.worst)}
                            </div>
                          </div>
                          <div className="rounded-lg border p-3">
                            <div className="text-sm font-medium text-muted-foreground">Sandsynlighed for tab</div>
                            <div className="mt-1 text-xl font-bold">
                              {formatPercent(
                                monteCarloResults.percentiles.worst < portfolioValue
                                  ? (monteCarloResults.paths.filter((path) => path[path.length - 1] < portfolioValue)
                                      .length /
                                      monteCarloResults.paths.length) *
                                      100
                                  : 0,
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="efficient-frontier" className="pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Effektiv grænse-analyse</CardTitle>
                      <CardDescription>Optimale porteføljer med forskellige risiko/afkast-profiler</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              type="number"
                              dataKey="risk"
                              name="Risiko"
                              label={{ value: "Volatilitet (%)", position: "insideBottomRight", offset: -5 }}
                            />
                            <YAxis
                              type="number"
                              dataKey="return"
                              name="Afkast"
                              label={{ value: "Forventet afkast (%)", angle: -90, position: "insideLeft" }}
                            />
                            <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                            <Legend />
                            <Scatter
                              name="Efficient Frontier"
                              data={generateEfficientFrontierChartData().filter((d) => d.type === "Efficient Frontier")}
                              fill="#8884d8"
                              line
                            />
                            <Scatter
                              name="Capital Market Line"
                              data={generateEfficientFrontierChartData().filter(
                                (d) => d.type === "Capital Market Line",
                              )}
                              fill="#82ca9d"
                              line
                            />
                            <Scatter
                              name="Din portefølje"
                              data={generateEfficientFrontierChartData().filter((d) => d.type === "Current Portfolio")}
                              fill="#ff7300"
                              shape="star"
                            />
                            <Scatter
                              name="Minimum varians"
                              data={generateEfficientFrontierChartData().filter((d) => d.type === "Minimum Variance")}
                              fill="#ff0000"
                              shape="circle"
                            />
                            <Scatter
                              name="Tangentportefølje"
                              data={generateEfficientFrontierChartData().filter((d) => d.type === "Tangency Portfolio")}
                              fill="#00ff00"
                              shape="diamond"
                            />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-6 rounded-lg border p-4">
                        <h3 className="mb-2 font-medium">Porteføljeoptimering</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Baseret på moderne porteføljeteori kan din portefølje optimeres for at opnå et bedre forhold
                          mellem risiko og afkast.
                        </p>
                        <div className="flex justify-end">
                          <Button onClick={() => setShowOptimizationDialog(true)}>Optimer portefølje</Button>

                          <Dialog open={showOptimizationDialog} onOpenChange={setShowOptimizationDialog}>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Optimer din portefølje</DialogTitle>
                                <DialogDescription>Vælg et optimeringskriterium for din portefølje</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <RadioGroup value={optimizationObjective} onValueChange={setOptimizationObjective}>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="sharpe" id="sharpe" />
                                    <Label htmlFor="sharpe">Maksimer Sharpe Ratio (risikojusteret afkast)</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="minRisk" id="minRisk" />
                                    <Label htmlFor="minRisk">Minimer risiko (volatilitet)</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="maxReturn" id="maxReturn" />
                                    <Label htmlFor="maxReturn">Maksimer forventet afkast</Label>
                                  </div>
                                </RadioGroup>
                              </div>
                              <div className="flex justify-end">
                                <Button onClick={handleOptimizePortfolio}>Optimer</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>

                        {optimizedPortfolio && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Optimeret porteføljeallokering:</h4>
                            <div className="space-y-2">
                              {optimizedPortfolio.map((asset, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="text-sm">{asset.name}:</span>
                                  <span className="font-medium">{asset.allocation}%</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 flex justify-end">
                              <Button variant="outline" size="sm" onClick={handleApplyOptimizedPortfolio}>
                                Anvend optimeret portefølje
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="risk-profile" className="pt-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Risikoprofil</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius={90} data={generateRadarData()}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="subject" />
                              <PolarRadiusAxis angle={30} domain={[0, 1]} />
                              <Radar
                                name="Din portefølje"
                                dataKey="value"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.6}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Risikobidrag</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={generateRiskContributionData()}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, contributionPercent }) => `${name}: ${contributionPercent.toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="contributionPercent"
                              >
                                {generateRiskContributionData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Risikovurdering</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Risikoniveau:</span>
                              <Badge className={`px-3 py-1 ${getRiskLevelColor()}`}>{getRiskLevel()}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Value at Risk (95% konfidens):</span>
                              <span className="font-medium">{formatCurrency(portfolioValueAtRisk)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Forventet årligt afkast:</span>
                              <span className="font-medium">{formatPercent(portfolioExpectedReturn)}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Anbefalinger:</h4>
                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                              <li>Overvej at diversificere din portefølje yderligere for at reducere risikoen</li>
                              <li>
                                Juster din aktivallokering i overensstemmelse med din risikovillighed og
                                investeringshorisont
                              </li>
                              <li>Overvåg din portefølje regelmæssigt og rebalancer efter behov</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="stress-test" className="pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Stress-test</CardTitle>
                      <CardDescription>Simulering af ekstreme markedsscenarier</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={generateStressTestData()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
                            <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                            <Legend />
                            <Bar dataKey="impact" fill="#8884d8" name="Påvirkning på portefølje" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-6 space-y-4">
                        <div className="rounded-lg border p-4">
                          <h3 className="mb-2 font-medium">Worst-case scenarie</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Baseret på historiske data og stress-scenarier kan din portefølje potentielt tabe{" "}
                            {historicalWorstCase}% i et worst-case scenarie.
                          </p>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Potentielt tab i værste scenarie:</h4>
                            <div className="text-xl font-bold text-red-500">
                              {formatCurrency(portfolioValue * (Math.abs(historicalWorstCase) / 100))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Dette repræsenterer det maksimale tab baseret på historiske kriser
                            </p>
                          </div>
                        </div>

                        <div className="rounded-lg border p-4">
                          <h3 className="mb-2 font-medium">Detaljeret scenarieanalyse</h3>
                          <div className="space-y-4">
                            {generateStressTestData().slice(0, 3).map((scenario, index) => (
                              <div key={index} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{scenario.name}</span>
                                  <span className={scenario.impact < 0 ? "text-red-500" : "text-green-500"}>
                                    {scenario.impact.toFixed(1)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={50 + (scenario.impact / 2)} 
                                  className="h-2" 
                                  indicatorClassName={scenario.impact < 0 ? "bg-red-500" : "bg-green-500"} 
                                />
                                <p className="text-xs text-muted-foreground">
                                  {scenario.impact < 0 
                                    ? `Estimeret tab: ${formatCurrency(portfolioValue * (Math.abs(scenario.impact) / 100))}`
                                    : `Estimeret gevinst: ${formatCurrency(portfolioValue * (scenario.impact / 100))}`
                                  }
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg border p-4">
                          <h3 className="mb-2 font-medium">Robusthedsanalyse</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Porteføljens robusthed:</span>
                              <Badge className={`px-3 py-1 ${
                                portfolioVolatility < 10 ? "bg-green-500" : 
                                portfolioVolatility < 20 ? "bg-yellow-500" : "bg-red-500"
                              }`}>
                                {portfolioVolatility < 10 ? "Høj" : 
                                 portfolioVolatility < 20 ? "Moderat" : "Lav"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              {portfolioVolatility < 10 
                                ? "Din portefølje har høj robusthed over for markedschok og vil sandsynligvis klare sig godt gennem kriser."
                                : portfolioVolatility < 20 
                                ? "Din portefølje har moderat robusthed og vil opleve udsving under markedskriser, men bør kunne komme sig."
                                : "Din portefølje har lav robusthed og er sårbar over for markedschok. Overvej at reducere risikoen."
                              }
                            </p>
                          </div>
                        </div>

                        <div className="rounded-lg border p-4">
                          <h3 className="mb-2 font-medium">Anbefalinger til risikoreduktion</h3>
                          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                            <li>Øg diversificeringen på tværs af aktivklasser for at reducere påvirkningen af markedschok</li>
                            <li>Overvej at allokere {portfolioVolatility > 15 ? "10-20%" : "5-10%"} til sikre aktiver som statsobligationer</li>
                            <li>Implementer stop-loss-ordrer for at begrænse tab under ekstreme markedsforhold</li>
                            <li>Overvej at bruge derivater som optioner til at sikre porteføljen mod store fald</li>
                            <li>Hold en kontantreserve på {portfolioVolatility > 20 ? "15-20%" : "5-10%"} for at udnytte muligheder under markedskriser</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="factor-analysis" className="pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Faktoranalyse</CardTitle>
                      <CardDescription>Eksponering mod forskellige markedsfaktorer</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={generateFactorExposureData()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="factor" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="exposure" fill="#8884d8" name="Eksponering" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-6 rounded-lg border p-4">
                        <h3 className="mb-2 font-medium">Faktoreksponering</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Din portefølje er mest eksponeret mod markedsrisiko, hvilket betyder at den vil blive påvirket
                          af generelle markedsbevægelser.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="optimization" className="pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Porteføljeoptimering</CardTitle>
                      <CardDescription>
                        Optimer din portefølje for at opnå et bedre forhold mellem risiko og afkast
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Denne funktion er under udvikling og vil snart blive tilgængelig.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                {investmentType === "single" && (
                  <TabsContent value="single-asset-analysis" className="pt-4">
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Aktivanalyse: {singleAsset.name}</CardTitle>
                          {singleAsset.ticker && (
                            <CardDescription>{singleAsset.ticker}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Sektor</span>
                                <p className="font-medium">{singleAsset.sector}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Markedsværdi</span>
                                <p className="font-medium">{singleAsset.marketCap}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Beta</span>
                                <p className="font-medium">{singleAsset.beta.toFixed(2)}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Udbytteafkast</span>
                                <p className="font-medium">{singleAsset.dividendYield.toFixed(1)}%</p>
                              </div>
                            </div>
                            
                            <div className="pt-4">
                              <h4 className="text-sm font-medium mb-2">Risikovurdering</h4>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm">Volatilitet</span>
                                    <span className="text-sm font-medium">{singleAsset.volatility.toFixed(1)}%</span>
                                  </div>
                                  <Progress value={Math.min(singleAsset.volatility * 2, 100)} className="h-2" />
                                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>Lav</span>
                                    <span>Høj</span>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm">Markedsfølsomhed (Beta)</span>
                                    <span className="text-sm font-medium">{singleAsset.beta.toFixed(2)}</span>
                                  </div>
                                  <Progress value={Math.min(singleAsset.beta * 33, 100)} className="h-2" />
                                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>Defensiv</span>
                                    <span>Aggressiv</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Risikoprofil</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart outerRadius={90} data={[
                                { subject: "Volatilitet", value: Math.min(1, singleAsset.volatility / 30), fullMark: 1 },
                                { subject: "Beta", value: Math.min(1, singleAsset.beta / 2), fullMark: 1 },
                                { subject: "Afkastpotentiale", value: Math.min(1, singleAsset.expectedReturn / 20), fullMark: 1 },
                                { subject: "Udbytte", value: Math.min(1, singleAsset.dividendYield / 5), fullMark: 1 },
                                { subject: "Likviditet", value: singleAsset.marketCap === "Large Cap" ? 0.9 : singleAsset.marketCap === "Mid Cap" ? 0.6 : 0.3, fullMark: 1 }
                              ]}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 1]} />
                                <Radar
                                  name={singleAsset.name}
                                  dataKey="value"
                                  stroke="#8884d8"
                                  fill="#8884d8"
                                  fillOpacity={0.6}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Value at Risk (VaR)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="rounded-lg border p-4">
                              <div className="text-sm font-medium text-muted-foreground">Daglig VaR (95% konfidens)</div>
                              <div className="mt-1 text-2xl font-bold">
                                {formatCurrency(portfolioValue * (singleAsset.volatility / 100) * 1.645 / Math.sqrt(252))}
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                Maksimalt forventet tab på en enkelt dag med 95% sandsynlighed
                              </div>
                            </div>
                            
                            <div className="rounded-lg border p-4">
                              <div className="text-sm font-medium text-muted-foreground">Månedlig VaR (95% konfidens)</div>
                              <div className="mt-1 text-2xl font-bold">
                                {formatCurrency(portfolioValue * (singleAsset.volatility / 100) * 1.645 / Math.sqrt(12))}
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                Maksimalt forventet tab på en måned med 95% sandsynlighed
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Historisk sammenligning</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[
                                  { name: "Finanskrise (2008)", market: -38.5, asset: -38.5 * singleAsset.beta },
                                  { name: "COVID-19 (2020)", market: -33.9, asset: -33.9 * singleAsset.beta },
                                  { name: "Dotcom (2000)", market: -44.7, asset: -44.7 * singleAsset.beta },
                                  { name: "Rentestigning", market: -15.0, asset: -15.0 * singleAsset.beta * (singleAsset.sector === "Finans" ? 1.2 : 1) }
                                ]}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `${value}%`} />
                                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                                <Legend />
                                <Bar dataKey="market" name="Markedet" fill="#8884d8" />
                                <Bar dataKey="asset" name={singleAsset.name} fill="#82ca9d" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="md:col-span-2">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Investeringsanbefaling</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="rounded-md border p-4">
                              <h3 className="text-sm font-medium mb-2">Risikovurdering</h3>
                              <p className="text-sm text-muted-foreground">
                                {singleAsset.name} har en {singleAsset.volatility < 15 ? "lav" : singleAsset.volatility < 25 ? "moderat" : "høj"} volatilitet på {singleAsset.volatility.toFixed(1)}% og en beta på {singleAsset.beta.toFixed(2)}, 
                                hvilket betyder at den er {singleAsset.beta < 0.8 ? "mindre følsom" : singleAsset.beta < 1.2 ? "omtrent lige så følsom" : "mere følsom"} over for markedsbevægelser end markedet generelt.
                              </p>
                            </div>
                            
                            <div className="rounded-md border p-4">
                              <h3 className="text-sm font-medium mb-2">Anbefaling baseret på din risikoprofil</h3>
                              <p className="text-sm text-muted-foreground">
                                {riskTolerance === "low" && singleAsset.volatility > 20 && "Denne aktie har en højere risiko end din risikoprofil tilsiger. Overvej at reducere eksponeringen eller vælge en mindre volatil aktie."}
                                {riskTolerance === "low" && singleAsset.volatility <= 20 && "Denne aktie passer rimeligt til din risikoprofil, men overvej at diversificere for at reducere den samlede porteføljerisiko."}
                                {riskTolerance === "medium" && singleAsset.volatility > 30 && "Denne aktie har en højere risiko end din risikoprofil tilsiger. Overvej at balancere med mindre volatile aktiver."}
                                {riskTolerance === "medium" && singleAsset.volatility <= 30 && "Denne aktie passer godt til din moderate risikoprofil."}
                                {riskTolerance === "high" && "Denne aktie passer godt til din høje risikotolerance, men husk at diversificere selv med en aggressiv strategi."}
                              </p>
                            </div>
                            
                            <div className="rounded-md border p-4">
                              <h3 className="text-sm font-medium mb-2">Diversifikationsanbefaling</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                For at reducere den samlede risiko anbefales det at begrænse eksponeringen mod enkelte aktier:
                              </p>
                              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                <li>Maksimalt 5% af porteføljen i en enkelt aktie</li>
                                <li>Maksimalt 20% af porteføljen i en enkelt sektor</li>
                                <li>Kombiner med obligationer og andre aktivklasser for at reducere volatiliteten</li>
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
<Card className="md:col-span-2 mt-6">
  <CardHeader>
    <CardTitle className="text-lg">Resultat og Anbefaling</CardTitle>
    <CardDescription>Samlet vurdering af {singleAsset.name} baseret på din risikoprofil</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">Risikoniveau</div>
          <div className="mt-1 text-2xl font-bold">
            {singleAsset.volatility < 15 ? "Lav" : singleAsset.volatility < 25 ? "Moderat" : "Høj"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Baseret på volatilitet og beta
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">Forventet årligt afkast</div>
          <div className="mt-1 text-2xl font-bold">{formatPercent(singleAsset.expectedReturn)}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Før skat og inflation
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">Sharpe Ratio</div>
          <div className="mt-1 text-2xl font-bold">
            {((singleAsset.expectedReturn - 1) / singleAsset.volatility).toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Risikojusteret afkast (højere er bedre)
          </div>
        </div>
      </div>

      <div className="rounded-md border p-4 bg-blue-50 dark:bg-blue-950/30">
        <div className="flex items-start">
          <Info className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium">Opsummering</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {singleAsset.name} er en {singleAsset.marketCap.toLowerCase()} aktie i {singleAsset.sector.toLowerCase()}-sektoren med en 
              {singleAsset.volatility < 15 ? " lav" : singleAsset.volatility < 25 ? " moderat" : " høj"} risikoprofil. 
              Aktien har en beta på {singleAsset.beta.toFixed(2)}, hvilket betyder den er 
              {singleAsset.beta < 0.8 ? " mindre følsom" : singleAsset.beta < 1.2 ? " omtrent lige så følsom" : " mere følsom"} 
              over for markedsbevægelser end markedet generelt.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Anbefalinger</h4>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border p-4">
            <h5 className="text-sm font-medium mb-2">Passer til din risikoprofil?</h5>
            <div className="flex items-center mb-3">
              <Badge className={`px-3 py-1 ${
                (riskTolerance === "low" && singleAsset.volatility <= 15) || 
                (riskTolerance === "medium" && singleAsset.volatility <= 25) || 
                (riskTolerance === "high") ? "bg-green-500" : "bg-orange-500"
              }`}>
                {(riskTolerance === "low" && singleAsset.volatility <= 15) || 
                 (riskTolerance === "medium" && singleAsset.volatility <= 25) || 
                 (riskTolerance === "high") ? "God match" : "Moderat match"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {riskTolerance === "low" && singleAsset.volatility > 20 && 
                "Denne aktie har en højere risiko end din risikoprofil tilsiger. Overvej at reducere eksponeringen eller vælge en mindre volatil aktie."}
              {riskTolerance === "low" && singleAsset.volatility <= 20 && 
                "Denne aktie passer rimeligt til din risikoprofil, men overvej at diversificere for at reducere den samlede porteføljerisiko."}
              {riskTolerance === "medium" && singleAsset.volatility > 30 && 
                "Denne aktie har en højere risiko end din risikoprofil tilsiger. Overvej at balancere med mindre volatile aktiver."}
              {riskTolerance === "medium" && singleAsset.volatility <= 30 && 
                "Denne aktie passer godt til din moderate risikoprofil."}
              {riskTolerance === "high" && 
                "Denne aktie passer godt til din høje risikotolerance, men husk at diversificere selv med en aggressiv strategi."}
            </p>
          </div>
          
          <div className="rounded-md border p-4">
            <h5 className="text-sm font-medium mb-2">Investeringshorisont</h5>
            <p className="text-sm text-muted-foreground">
              Med en investeringshorisont på {investmentHorizon} år er denne aktie 
              {investmentHorizon < 5 && singleAsset.volatility > 20 ? " muligvis for risikabel for en kort tidshorisont." : 
               investmentHorizon >= 5 && investmentHorizon < 10 ? " passende, da mellemlang tidshorisont giver mulighed for at udligne kortsigtede udsving." : 
               " velegnet, da lang tidshorisont reducerer risikoen ved kortsigtede udsving betydeligt."}
            </p>
            <div className="mt-3">
              <span className="text-sm font-medium">Anbefalet minimumshorisont:</span>
              <span className="text-sm ml-2">
                {singleAsset.volatility < 15 ? "2+ år" : singleAsset.volatility < 25 ? "5+ år" : "7+ år"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="rounded-md border p-4">
          <h5 className="text-sm font-medium mb-2">Handlingsplan</h5>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>
              {singleAsset.beta > 1.2 ? 
                "Overvej at balancere denne højbeta-aktie med mere defensive investeringer." : 
                "Aktien har en moderat markedsfølsomhed og kan indgå i en diversificeret portefølje."}
            </li>
            <li>
              Begræns eksponeringen til maksimalt {riskTolerance === "low" ? "3-5%" : riskTolerance === "medium" ? "5-7%" : "7-10%"} af din samlede portefølje.
            </li>
            <li>
              {singleAsset.dividendYield > 3 ? 
                "Aktien har et attraktivt udbytte, hvilket kan være fordelagtigt for indkomstorienterede investorer." : 
                "Aktien har et relativt lavt udbytte og er primært velegnet til vækstsøgende investorer."}
            </li>
            <li>
              Overvej at implementere en stop-loss strategi for at begrænse potentielle tab.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
                    </div>
                  </TabsContent>
                )}
              

              <div className="mt-6">
                <AIRecommendation data={aiRecommendation} />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleReset}>
                  Nulstil
                </Button>
                <Button variant="secondary" onClick={() => alert("Denne funktion kommer snart")}>
                  Gem rapport
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function RiskCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <CalculatorTracker calculatorName="risiko" />
      <h1 className="text-3xl font-bold mb-6">Risikoberegner</h1>
      <RiskCalculator />
    </div>
  )
};
