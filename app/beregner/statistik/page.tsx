"use client"

import { useMemo, useState, useEffect } from "react"
import { AIRecommendation } from "@/components/ai-recommendation"
import { analyzeStatistik } from "@/lib/ai-engines"
import Link from "next/link"
import { ArrowLeft, BarChart3, ChevronUp, HelpCircle, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Typer for statistiske beregninger
type StatisticalAnalysis = "simple" | "compare" | "correlation"
type StatisticalMeasure =
  | "mean"
  | "median"
  | "variance"
  | "stdDev"
  | "confInterval"
  | "outliers"
  | "histogram"
  | "quartiles"
  | "skewness"
  | "kurtosis"
type VisualizationType = "histogram" | "normal" | "boxplot" | "scatter" | "bar"

interface DataPoint {
  value: number
  label?: string
  x?: number
  y?: number
}

interface DataSet {
  id: string
  name: string
  data: DataPoint[]
  color?: string
  visible?: boolean
}

interface AnalysisResult {
  measure: StatisticalMeasure
  value: number | number[] | null
  description: string
  datasetId?: string
}

interface SavedAnalysis {
  id: string
  name: string
  date: string
  dataSets: DataSet[]
  results: AnalysisResult[]
  selectedMeasures: StatisticalMeasure[]
}

// Farvepalette for datasæt
const datasetColors = [
  "#4f46e5", // Indigo
  "#0ea5e9", // Sky
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
]

export default function StatisticalCalculator() {
  const [analysisType, setAnalysisType] = useState<StatisticalAnalysis>("simple")
  const [dataInput, setDataInput] = useState<string>("")
  const [dataSetName, setDataSetName] = useState<string>("Dataset 1")
  const [dataSets, setDataSets] = useState<DataSet[]>([])
  const [selectedDataSetIds, setSelectedDataSetIds] = useState<string[]>([])
  const [selectedMeasures, setSelectedMeasures] = useState<StatisticalMeasure[]>(["mean", "stdDev"])
  const [selectedVisualizations, setSelectedVisualizations] = useState<VisualizationType[]>(["histogram", "normal"])
  const [confidenceLevel, setConfidenceLevel] = useState<number>(95)
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [showResults, setShowResults] = useState<boolean>(false)
  const [step, setStep] = useState<number>(1)
  const [inputMethod, setInputMethod] = useState<"manual" | "paste" | "xy">("paste")
  const [manualDataPoints, setManualDataPoints] = useState<string[]>([""])
  const [xyDataPoints, setXyDataPoints] = useState<Array<{ x: string; y: string }>>([{ x: "", y: "" }])
  const [activeTab, setActiveTab] = useState<string>("data")
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([])
  const [currentAnalysisName, setCurrentAnalysisName] = useState<string>("")
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [calculationProgress, setCalculationProgress] = useState<number>(0)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false)
  const [showExampleData, setShowExampleData] = useState<boolean>(false)
  const [exampleDataType, setExampleDataType] = useState<string>("normal")

  const aiRecommendation = useMemo(() => {
    const activeIds = selectedDataSetIds.length > 0 ? selectedDataSetIds : dataSets.map((d) => d.id)
    const values: number[] = []
    let label: string | undefined = undefined
    for (const ds of dataSets) {
      if (activeIds.includes(ds.id)) {
        for (const p of ds.data) values.push(p.value)
        if (!label) label = ds.name
      }
    }
    return analyzeStatistik({ data: values, label })
  }, [dataSets, selectedDataSetIds])

  // Hjælpefunktioner til statistiske beregninger
  const calculateMean = (data: number[]): number => {
    if (data.length === 0) return 0
    return data.reduce((sum, value) => sum + value, 0) / data.length
  }

  const calculateMedian = (data: number[]): number => {
    if (data.length === 0) return 0
    const sortedData = [...data].sort((a, b) => a - b)
    const mid = Math.floor(sortedData.length / 2)
    return sortedData.length % 2 !== 0 ? sortedData[mid] : (sortedData[mid - 1] + sortedData[mid]) / 2
  }

  const calculateVariance = (data: number[]): number => {
    if (data.length <= 1) return 0
    const mean = calculateMean(data)
    return data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / (data.length - 1)
  }

  const calculateStandardDeviation = (data: number[]): number => {
    return Math.sqrt(calculateVariance(data))
  }

  const calculateConfidenceInterval = (data: number[], confidenceLevel: number): [number, number] => {
    const mean = calculateMean(data)
    const stdDev = calculateStandardDeviation(data)
    const n = data.length

    // Z-værdi for forskellige konfidensniveauer
    const zValues: Record<number, number> = {
      90: 1.645,
      95: 1.96,
      99: 2.576,
    }

    const z = zValues[confidenceLevel] || 1.96
    const marginOfError = z * (stdDev / Math.sqrt(n))

    return [mean - marginOfError, mean + marginOfError]
  }

  const detectOutliers = (data: number[]): number[] => {
    const q1 = calculateQuantile(data, 0.25)
    const q3 = calculateQuantile(data, 0.75)
    const iqr = q3 - q1
    const lowerBound = q1 - 1.5 * iqr
    const upperBound = q3 + 1.5 * iqr

    return data.filter((value) => value < lowerBound || value > upperBound)
  }

  const calculateQuantile = (data: number[], q: number): number => {
    if (data.length === 0) return 0
    const sortedData = [...data].sort((a, b) => a - b)
    const pos = (sortedData.length - 1) * q
    const base = Math.floor(pos)
    const rest = pos - base

    if (sortedData[base + 1] !== undefined) {
      return sortedData[base] + rest * (sortedData[base + 1] - sortedData[base])
    } else {
      return sortedData[base]
    }
  }

  const calculateQuartiles = (data: number[]): [number, number, number] => {
    const q1 = calculateQuantile(data, 0.25)
    const q2 = calculateMedian(data)
    const q3 = calculateQuantile(data, 0.75)
    return [q1, q2, q3]
  }

  const calculateSkewness = (data: number[]): number => {
    if (data.length <= 2) return 0
    const mean = calculateMean(data)
    const stdDev = calculateStandardDeviation(data)
    const n = data.length

    const sumCubed = data.reduce((sum, value) => sum + Math.pow(value - mean, 3), 0)
    return sumCubed / n / Math.pow(stdDev, 3)
  }

  const calculateKurtosis = (data: number[]): number => {
    if (data.length <= 3) return 0
    const mean = calculateMean(data)
    const stdDev = calculateStandardDeviation(data)
    const n = data.length

    const sumQuartic = data.reduce((sum, value) => sum + Math.pow(value - mean, 4), 0)
    return sumQuartic / n / Math.pow(stdDev, 4) - 3 // Excess kurtosis (normal = 0)
  }

  const calculateCorrelation = (xData: number[], yData: number[]): number => {
    if (xData.length !== yData.length || xData.length <= 1) return 0

    const xMean = calculateMean(xData)
    const yMean = calculateMean(yData)

    let numerator = 0
    let xDenominator = 0
    let yDenominator = 0

    for (let i = 0; i < xData.length; i++) {
      const xDiff = xData[i] - xMean
      const yDiff = yData[i] - yMean
      numerator += xDiff * yDiff
      xDenominator += xDiff * xDiff
      yDenominator += yDiff * yDiff
    }

    if (xDenominator === 0 || yDenominator === 0) return 0
    return numerator / (Math.sqrt(xDenominator) * Math.sqrt(yDenominator))
  }

  const createHistogramData = (data: number[]): { bin: string; frequency: number; normalizedFrequency: number }[] => {
    if (data.length === 0) return []

    // Find min og max værdier
    const min = Math.min(...data)
    const max = Math.max(...data)

    // Beregn antal bins (Sturges' formel)
    const numBins = Math.ceil(1 + 3.322 * Math.log10(data.length))

    // Beregn bin bredde
    const binWidth = (max - min) / numBins

    // Opret bins
    const bins: { bin: string; frequency: number; normalizedFrequency: number }[] = []
    for (let i = 0; i < numBins; i++) {
      const binStart = min + i * binWidth
      const binEnd = binStart + binWidth
      const binLabel = `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`

      // Tæl værdier i denne bin
      const frequency = data.filter(
        (value) => value >= binStart && value < (i === numBins - 1 ? binEnd + 0.1 : binEnd),
      ).length

      // Normaliser frekvensen (for sammenligning med normalfordelingen)
      const normalizedFrequency = frequency / (data.length * binWidth)

      bins.push({ bin: binLabel, frequency, normalizedFrequency })
    }

    return bins
  }

  const createNormalDistributionData = (data: number[]): { x: number; y: number }[] => {
    if (data.length === 0) return []

    const mean = calculateMean(data)
    const stdDev = calculateStandardDeviation(data)

    // Generer punkter for normalfordelingskurven
    const points: { x: number; y: number }[] = []
    const min = mean - 4 * stdDev
    const max = mean + 4 * stdDev
    const step = (max - min) / 100

    for (let x = min; x <= max; x += step) {
      const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2))
      points.push({ x, y })
    }

    return points
  }

  const createBoxPlotData = (
    data: number[],
  ): { min: number; q1: number; median: number; q3: number; max: number; outliers: number[] } => {
    if (data.length === 0) return { min: 0, q1: 0, median: 0, q3: 0, max: 0, outliers: [] }

    const sortedData = [...data].sort((a, b) => a - b)
    const quartiles = calculateQuartiles(sortedData)
    const outliers = detectOutliers(sortedData)

    // Find min og max værdier (eksklusiv outliers)
    const q1 = quartiles[0]
    const q3 = quartiles[2]
    const iqr = q3 - q1
    const lowerBound = q1 - 1.5 * iqr
    const upperBound = q3 + 1.5 * iqr

    const filteredData = sortedData.filter((value) => value >= lowerBound && value <= upperBound)
    const min = filteredData.length > 0 ? Math.min(...filteredData) : sortedData[0]
    const max = filteredData.length > 0 ? Math.max(...filteredData) : sortedData[sortedData.length - 1]

    return {
      min,
      q1: quartiles[0],
      median: quartiles[1],
      q3: quartiles[2],
      max,
      outliers,
    }
  }

  const parseData = (input: string): number[] => {
    // Fjern eventuelle mellemrum og split ved komma eller linjeskift
    return input
      .split(/[,\n\r\t;]/)
      .map((item) => item.trim())
      .filter((item) => item !== "")
      .map((item) => Number.parseFloat(item))
      .filter((num) => !isNaN(num))
  }

  const parseManualData = (inputs: string[]): number[] => {
    return inputs.map((item) => Number.parseFloat(item.trim())).filter((num) => !isNaN(num))
  }

  const parseXYData = (inputs: Array<{ x: string; y: string }>): { x: number[]; y: number[] } => {
    const xValues: number[] = []
    const yValues: number[] = []

    inputs.forEach((point) => {
      const x = Number.parseFloat(point.x.trim())
      const y = Number.parseFloat(point.y.trim())

      if (!isNaN(x) && !isNaN(y)) {
        xValues.push(x)
        yValues.push(y)
      }
    })

    return { x: xValues, y: yValues }
  }

  const generateExampleData = (type: string, size = 50): number[] => {
    const data: number[] = []

    switch (type) {
      case "normal":
        // Normalfordelt data med middelværdi 100 og standardafvigelse 15
        for (let i = 0; i < size; i++) {
          // Box-Muller transformation
          const u1 = Math.random()
          const u2 = Math.random()
          const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
          data.push(100 + 15 * z)
        }
        break

      case "uniform":
        // Uniformt fordelt data mellem 0 og 100
        for (let i = 0; i < size; i++) {
          data.push(Math.random() * 100)
        }
        break

      case "skewed":
        // Skævt fordelt data (log-normal)
        for (let i = 0; i < size; i++) {
          const u1 = Math.random()
          const u2 = Math.random()
          const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
          data.push(Math.exp(4 + 0.5 * z))
        }
        break

      case "bimodal":
        // Bimodal fordeling (blanding af to normalfordelinger)
        for (let i = 0; i < size; i++) {
          const u1 = Math.random()
          const u2 = Math.random()
          const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)

          if (Math.random() < 0.5) {
            data.push(70 + 10 * z)
          } else {
            data.push(130 + 10 * z)
          }
        }
        break

      case "outliers":
        // Normalfordelt data med outliers
        for (let i = 0; i < size - 3; i++) {
          const u1 = Math.random()
          const u2 = Math.random()
          const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
          data.push(100 + 15 * z)
        }
        // Tilføj outliers
        data.push(100 + 15 * 4.5) // Høj outlier
        data.push(100 + 15 * 5) // Høj outlier
        data.push(100 - 15 * 4.2) // Lav outlier
        break

      default:
        // Standard normalfordeling
        for (let i = 0; i < size; i++) {
          const u1 = Math.random()
          const u2 = Math.random()
          const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
          data.push(z)
        }
    }

    return data
  }

  const generateCorrelatedData = (correlation: number, size = 50): { x: number[]; y: number[] } => {
    const xValues: number[] = []
    const yValues: number[] = []

    // Generer x-værdier (normalfordelt)
    for (let i = 0; i < size; i++) {
      const u1 = Math.random()
      const u2 = Math.random()
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      xValues.push(100 + 15 * z)
    }

    // Generer korrelerede y-værdier
    for (let i = 0; i < size; i++) {
      const u1 = Math.random()
      const u2 = Math.random()
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)

      // Formel for at generere korrelerede værdier
      const y = (correlation * (xValues[i] - 100)) / 15 + Math.sqrt(1 - correlation * correlation) * z
      yValues.push(200 + 20 * y) // Skaler til et andet interval for at gøre det mere interessant
    }

    return { x: xValues, y: yValues }
  }

  const handleAddDataPoint = () => {
    setManualDataPoints([...manualDataPoints, ""])
  }

  const handleManualDataChange = (index: number, value: string) => {
    const newDataPoints = [...manualDataPoints]
    newDataPoints[index] = value
    setManualDataPoints(newDataPoints)
  }

  const handleRemoveDataPoint = (index: number) => {
    if (manualDataPoints.length > 1) {
      const newDataPoints = [...manualDataPoints]
      newDataPoints.splice(index, 1)
      setManualDataPoints(newDataPoints)
    }
  }

  const handleAddXYDataPoint = () => {
    setXyDataPoints([...xyDataPoints, { x: "", y: "" }])
  }

  const handleXYDataChange = (index: number, field: "x" | "y", value: string) => {
    const newDataPoints = [...xyDataPoints]
    newDataPoints[index][field] = value
    setXyDataPoints(newDataPoints)
  }

  const handleRemoveXYDataPoint = (index: number) => {
    if (xyDataPoints.length > 1) {
      const newDataPoints = [...xyDataPoints]
      newDataPoints.splice(index, 1)
      setXyDataPoints(newDataPoints)
    }
  }

  const handleAddDataSet = () => {
    let newData: number[] = []
    let xyData: { x: number[]; y: number[] } = { x: [], y: [] }

    if (showExampleData) {
      if (analysisType === "correlation") {
        // For korrelationsanalyse, generer korrelerede data
        const correlationValue =
          {
            "strong-positive": 0.9,
            "moderate-positive": 0.6,
            "weak-positive": 0.3,
            "no-correlation": 0,
            "weak-negative": -0.3,
            "moderate-negative": -0.6,
            "strong-negative": -0.9,
          }[exampleDataType] || 0

        xyData = generateCorrelatedData(correlationValue)
      } else {
        // For andre analysetyper, generer enkelt datasæt
        newData = generateExampleData(exampleDataType)
      }
    } else {
      if (analysisType === "correlation" && inputMethod === "xy") {
        xyData = parseXYData(xyDataPoints)
      } else {
        newData = inputMethod === "paste" ? parseData(dataInput) : parseManualData(manualDataPoints)
      }
    }

    if (
      (analysisType !== "correlation" && newData.length > 0) ||
      (analysisType === "correlation" && xyData.x.length > 0 && xyData.y.length > 0)
    ) {
      // Generer unik ID for datasættet
      const datasetId = `dataset-${Date.now()}-${Math.floor(Math.random() * 1000)}`

      if (analysisType === "correlation" && (inputMethod === "xy" || showExampleData)) {
        // For korrelationsanalyse med xy-data, opret to datasæt
        const xDataset: DataSet = {
          id: `${datasetId}-x`,
          name: `${dataSetName} (X)`,
          data: xyData.x.map((value) => ({ value })),
          color: datasetColors[dataSets.length % datasetColors.length],
          visible: true,
        }

        const yDataset: DataSet = {
          id: `${datasetId}-y`,
          name: `${dataSetName} (Y)`,
          data: xyData.y.map((value) => ({ value })),
          color: datasetColors[(dataSets.length + 1) % datasetColors.length],
          visible: true,
        }

        // Opret også et kombineret datasæt for scatterplot
        const combinedDataset: DataSet = {
          id: datasetId,
          name: dataSetName,
          data: xyData.x.map((x, i) => ({
            value: 0, // Dummy værdi
            x,
            y: xyData.y[i],
          })),
          color: datasetColors[dataSets.length % datasetColors.length],
          visible: true,
        }

        setDataSets([...dataSets, xDataset, yDataset, combinedDataset])
        setSelectedDataSetIds([`${datasetId}-x`, `${datasetId}-y`, datasetId])
      } else {
        // For andre analysetyper, opret et enkelt datasæt
        const newDataSet: DataSet = {
          id: datasetId,
          name: dataSetName,
          data: newData.map((value) => ({ value })),
          color: datasetColors[dataSets.length % datasetColors.length],
          visible: true,
        }

        setDataSets([...dataSets, newDataSet])
        setSelectedDataSetIds([...selectedDataSetIds, datasetId])
      }

      setDataInput("")
      setDataSetName(`Dataset ${dataSets.length + 2}`)
      setManualDataPoints([""])
      setXyDataPoints([{ x: "", y: "" }])
      setShowExampleData(false)

      if (analysisType === "simple") {
        setStep(2)
      }
    }
  }

  const handleToggleDataSetVisibility = (datasetId: string) => {
    setDataSets(
      dataSets.map((dataset) => (dataset.id === datasetId ? { ...dataset, visible: !dataset.visible } : dataset)),
    )
  }

  const handleRemoveDataSet = (datasetId: string) => {
    // Hvis det er et korrelationsdatasæt, fjern også de relaterede datasæt
    const datasetToRemove = dataSets.find((ds) => ds.id === datasetId)

    if (datasetToRemove) {
      let idsToRemove = [datasetId]

      // Tjek om det er et del af et korrelationssæt
      if (datasetId.endsWith("-x") || datasetId.endsWith("-y")) {
        const baseId = datasetId.slice(0, -2)
        idsToRemove = [`${baseId}-x`, `${baseId}-y`, baseId]
      } else if (dataSets.some((ds) => ds.id === `${datasetId}-x`)) {
        idsToRemove = [datasetId, `${datasetId}-x`, `${datasetId}-y`]
      }

      setDataSets(dataSets.filter((dataset) => !idsToRemove.includes(dataset.id)))
      setSelectedDataSetIds(selectedDataSetIds.filter((id) => !idsToRemove.includes(id)))
    }
  }

  const handleMeasureChange = (measure: StatisticalMeasure) => {
    if (selectedMeasures.includes(measure)) {
      setSelectedMeasures(selectedMeasures.filter((m) => m !== measure))
    } else {
      setSelectedMeasures([...selectedMeasures, measure])
    }
  }

  const handleVisualizationChange = (visualization: VisualizationType) => {
    if (selectedVisualizations.includes(visualization)) {
      setSelectedVisualizations(selectedVisualizations.filter((v) => v !== visualization))
    } else {
      setSelectedVisualizations([...selectedVisualizations, visualization])
    }
  }

  const handleDataSetSelectionChange = (datasetId: string) => {
    if (selectedDataSetIds.includes(datasetId)) {
      setSelectedDataSetIds(selectedDataSetIds.filter((id) => id !== datasetId))
    } else {
      setSelectedDataSetIds([...selectedDataSetIds, datasetId])
    }
  }

  const simulateCalculationProgress = () => {
    setIsCalculating(true)
    setCalculationProgress(0)

    const interval = setInterval(() => {
      setCalculationProgress((prev) => {
        const newProgress = prev + Math.random() * 15
        if (newProgress >= 100) {
          clearInterval(interval)
          setIsCalculating(false)
          return 100
        }
        return newProgress
      })
    }, 100)
  }

  const handleCalculate = () => {
    if (dataSets.length === 0 || selectedDataSetIds.length === 0) return

    simulateCalculationProgress()

    setTimeout(() => {
      const newResults: AnalysisResult[] = []

      // For hver valgt datasæt
      for (const datasetId of selectedDataSetIds) {
        const dataset = dataSets.find((ds) => ds.id === datasetId)

        // Spring over kombinerede datasæt for korrelation
        if (
          dataset &&
          !datasetId.includes("-x") &&
          !datasetId.includes("-y") &&
          dataSets.some((ds) => ds.id === `${datasetId}-x`)
        ) {
          continue
        }

        if (dataset) {
          const dataToAnalyze = dataset.data.map((d) => d.value)

          if (selectedMeasures.includes("mean")) {
            newResults.push({
              measure: "mean",
              value: calculateMean(dataToAnalyze),
              description: "Gennemsnittet af alle værdier",
              datasetId: dataset.id,
            })
          }

          if (selectedMeasures.includes("median")) {
            newResults.push({
              measure: "median",
              value: calculateMedian(dataToAnalyze),
              description: "Midterværdien når alle værdier er sorteret",
              datasetId: dataset.id,
            })
          }

          if (selectedMeasures.includes("variance")) {
            newResults.push({
              measure: "variance",
              value: calculateVariance(dataToAnalyze),
              description: "Variansen måler spredningen af værdier omkring gennemsnittet",
              datasetId: dataset.id,
            })
          }

          if (selectedMeasures.includes("stdDev")) {
            newResults.push({
              measure: "stdDev",
              value: calculateStandardDeviation(dataToAnalyze),
              description: "Standardafvigelsen er kvadratroden af variansen",
              datasetId: dataset.id,
            })
          }

          if (selectedMeasures.includes("confInterval")) {
            const interval = calculateConfidenceInterval(dataToAnalyze, confidenceLevel)
            newResults.push({
              measure: "confInterval",
              value: interval,
              description: `${confidenceLevel}% konfidensinterval for gennemsnittet`,
              datasetId: dataset.id,
            })
          }

          if (selectedMeasures.includes("outliers")) {
            const outliers = detectOutliers(dataToAnalyze)
            newResults.push({
              measure: "outliers",
              value: outliers.length > 0 ? outliers : null,
              description: "Outliers er værdier der ligger langt fra resten af dataene",
              datasetId: dataset.id,
            })
          }

          if (selectedMeasures.includes("quartiles")) {
            const quartiles = calculateQuartiles(dataToAnalyze)
            newResults.push({
              measure: "quartiles",
              value: quartiles,
              description: "Kvartilsættet (Q1, Q2/median, Q3)",
              datasetId: dataset.id,
            })
          }

          if (selectedMeasures.includes("skewness")) {
            newResults.push({
              measure: "skewness",
              value: calculateSkewness(dataToAnalyze),
              description: "Skævhed måler asymmetri i fordelingen",
              datasetId: dataset.id,
            })
          }

          if (selectedMeasures.includes("kurtosis")) {
            newResults.push({
              measure: "kurtosis",
              value: calculateKurtosis(dataToAnalyze),
              description: "Kurtosis måler hvor spids fordelingen er",
              datasetId: dataset.id,
            })
          }
        }
      }

      // Beregn korrelation hvis der er valgt to datasæt
      if (analysisType === "correlation") {
        // Find X og Y datasæt
        const xDatasetId = selectedDataSetIds.find((id) => id.endsWith("-x"))
        const yDatasetId = selectedDataSetIds.find((id) => id.endsWith("-y"))

        if (xDatasetId && yDatasetId) {
          const xDataset = dataSets.find((ds) => ds.id === xDatasetId)
          const yDataset = dataSets.find((ds) => ds.id === yDatasetId)

          if (xDataset && yDataset) {
            const xData = xDataset.data.map((d) => d.value)
            const yData = yDataset.data.map((d) => d.value)

            const correlation = calculateCorrelation(xData, yData)

            newResults.push({
              measure: "correlation",
              value: correlation,
              description: "Pearson korrelationskoefficient mellem X og Y",
              datasetId: xDatasetId.slice(0, -2), // Base ID uden -x
            })
          }
        }
      }

      setResults(newResults)
      setShowResults(true)
      setStep(3)
      setActiveTab("results")
    }, 1500)
  }

  const handleSaveAnalysis = () => {
    if (dataSets.length === 0 || results.length === 0) return

    const newAnalysis: SavedAnalysis = {
      id: `analysis-${Date.now()}`,
      name: currentAnalysisName || `Analyse ${savedAnalyses.length + 1}`,
      date: new Date().toLocaleDateString("da-DK"),
      dataSets: dataSets.filter((ds) => selectedDataSetIds.includes(ds.id)),
      results,
      selectedMeasures,
    }

    setSavedAnalyses([...savedAnalyses, newAnalysis])
    setCurrentAnalysisName("")
  }

  const handleLoadAnalysis = (analysis: SavedAnalysis) => {
    setDataSets(analysis.dataSets)
    setSelectedDataSetIds(analysis.dataSets.map((ds) => ds.id))
    setResults(analysis.results)
    setSelectedMeasures(analysis.selectedMeasures)
    setShowResults(true)
    setStep(3)
    setActiveTab("results")
  }

  const handleDeleteAnalysis = (analysisId: string) => {
    setSavedAnalyses(savedAnalyses.filter((analysis) => analysis.id !== analysisId))
  }

  const handleReset = () => {
    setDataSets([])
    setSelectedDataSetIds([])
    setDataInput("")
    setManualDataPoints([""])
    setXyDataPoints([{ x: "", y: "" }])
    setDataSetName("Dataset 1")
    setSelectedMeasures(["mean", "stdDev"])
    setSelectedVisualizations(["histogram", "normal"])
    setResults([])
    setShowResults(false)
    setStep(1)
    setActiveTab("data")
    setShowExampleData(false)
  }

  const formatNumber = (num: number): string => {
    return num.toLocaleString("da-DK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })
  }

  const getDatasetById = (id: string): DataSet | undefined => {
    return dataSets.find((dataset) => dataset.id === id)
  }

  const getResultsForDataset = (datasetId: string): AnalysisResult[] => {
    return results.filter((result) => result.datasetId === datasetId)
  }

  const getCorrelationResultForDatasets = (baseId: string): AnalysisResult | undefined => {
    return results.find((result) => result.datasetId === baseId && result.measure === "correlation")
  }

  const getCorrelationDescription = (correlation: number): string => {
    const absCorrelation = Math.abs(correlation)
    const direction = correlation >= 0 ? "positiv" : "negativ"

    if (absCorrelation >= 0.9) return `Meget stærk ${direction} korrelation`
    if (absCorrelation >= 0.7) return `Stærk ${direction} korrelation`
    if (absCorrelation >= 0.5) return `Moderat ${direction} korrelation`
    if (absCorrelation >= 0.3) return `Svag ${direction} korrelation`
    return "Ingen eller meget svag korrelation"
  }

  const getSkewnessDescription = (skewness: number): string => {
    if (skewness > 1) return "Stærkt højreskæv fordeling"
    if (skewness > 0.5) return "Moderat højreskæv fordeling"
    if (skewness > 0.2) return "Svagt højreskæv fordeling"
    if (skewness > -0.2) return "Symmetrisk fordeling"
    if (skewness > -0.5) return "Svagt venstreskæv fordeling"
    if (skewness > -1) return "Moderat venstreskæv fordeling"
    return "Stærkt venstreskæv fordeling"
  }

  const getKurtosisDescription = (kurtosis: number): string => {
    if (kurtosis > 3) return "Meget spids fordeling (leptokurtisk)"
    if (kurtosis > 1) return "Spids fordeling (leptokurtisk)"
    if (kurtosis > -1) return "Normal spidshed (mesokurtisk)"
    if (kurtosis > -3) return "Flad fordeling (platykurtisk)"
    return "Meget flad fordeling (platykurtisk)"
  }

  // Effekt til at indlæse gemte analyser fra localStorage
  useEffect(() => {
    const savedAnalysesFromStorage = localStorage.getItem("statisticalAnalyses")
    if (savedAnalysesFromStorage) {
      try {
        setSavedAnalyses(JSON.parse(savedAnalysesFromStorage))
      } catch (e) {
        console.error("Kunne ikke indlæse gemte analyser", e)
      }
    }
  }, [])

  // Effekt til at gemme analyser i localStorage
  useEffect(() => {
    if (savedAnalyses.length > 0) {
      localStorage.setItem("statisticalAnalyses", JSON.stringify(savedAnalyses))
    }
  }, [savedAnalyses])

  // Funktion til at eksportere resultater som CSV
  const exportResultsAsCSV = () => {
    if (results.length === 0) return

    let csvContent = "data:text/csv;charset=utf-8,"

    // Header
    csvContent += "Datasæt,Mål,Værdi,Beskrivelse\n"

    // Data
    results.forEach((result) => {
      const dataset = getDatasetById(result.datasetId || "")
      const datasetName = dataset ? dataset.name : "Ukendt datasæt"

      let value = ""
      if (Array.isArray(result.value)) {
        value = result.value.map((v) => formatNumber(v)).join("; ")
      } else if (result.value !== null) {
        value = formatNumber(result.value as number)
      } else {
        value = "N/A"
      }

      csvContent += `"${datasetName}","${result.measure}","${value}","${result.description}"\n`
    })

    // Opret download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `statistik_resultater_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-gradient-to-b from-white to-blue-50 dark:from-gray-950 dark:to-blue-950/20">
        <div className="container max-w-6xl py-8">
          <div className="mb-8 flex items-center">
            <Link
              href="/"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tilbage til forsiden
            </Link>
            <h1 className="ml-auto text-3xl font-bold tracking-tight gradient-text">Statistisk Udregner</h1>
          </div>

          <Card className="mb-8 border-t-4 border-t-primary shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <CardTitle className="flex items-center text-2xl">
                <BarChart3 className="mr-2 h-6 w-6 text-primary" />
                Statistisk Analyseværktøj
              </CardTitle>
              <CardDescription className="text-base">
                Foretag enkle statistiske beregninger uden at skulle kende formlerne selv
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="data" disabled={step < 1} className="text-base py-3">
                    1. Data
                  </TabsTrigger>
                  <TabsTrigger value="analysis" disabled={step < 2} className="text-base py-3">
                    2. Analyse
                  </TabsTrigger>
                  <TabsTrigger value="results" disabled={step < 3} className="text-base py-3">
                    3. Resultater
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="data" className="space-y-6 pt-6">
                  <div className="space-y-6">
                    <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg">
                      <h3 className="text-xl font-medium mb-3">1. Vælg analysetype</h3>
                      <RadioGroup
                        value={analysisType}
                        onValueChange={(value) => {
                          setAnalysisType(value as StatisticalAnalysis)
                          // Nulstil data når analysetype ændres
                          setDataSets([])
                          setSelectedDataSetIds([])
                          setDataInput("")
                          setManualDataPoints([""])
                          setXyDataPoints([{ x: "", y: "" }])
                        }}
                        className="flex flex-wrap gap-4"
                      >
                        <div className="flex items-start space-x-2 bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border flex-1 min-w-[200px]">
                          <RadioGroupItem value="simple" id="simple" className="mt-1" />
                          <div>
                            <Label htmlFor="simple" className="font-medium">
                              Simpel analyse
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Analysér et enkelt datasæt med grundlæggende statistik
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2 bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border flex-1 min-w-[200px]">
                          <RadioGroupItem value="compare" id="compare" className="mt-1" />
                          <div>
                            <Label htmlFor="compare" className="font-medium">
                              Sammenligne grupper
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">Sammenlign flere datasæt med hinanden</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2 bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border flex-1 min-w-[200px]">
                          <RadioGroupItem value="correlation" id="correlation" className="mt-1" />
                          <div>
                            <Label htmlFor="correlation" className="font-medium">
                              Korrelationsanalyse
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Undersøg sammenhængen mellem to variable
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-medium">2. Indtast dine data</h3>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Switch id="example-data" checked={showExampleData} onCheckedChange={setShowExampleData} />
                            <Label htmlFor="example-data">Brug eksempeldata</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="dataset-name">Datasæt navn:</Label>
                            <Input
                              id="dataset-name"
                              value={dataSetName}
                              onChange={(e) => setDataSetName(e.target.value)}
                              className="w-48"
                            />
                          </div>
                        </div>
                      </div>

                      {showExampleData ? (
                        <div className="space-y-4 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg">
                          <h4 className="font-medium">Vælg type af eksempeldata:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {analysisType === "correlation" ? (
                              // Eksempeldata for korrelation
                              <>
                                <Button
                                  variant={exampleDataType === "strong-positive" ? "default" : "outline"}
                                  onClick={() => setExampleDataType("strong-positive")}
                                  className="justify-start h-auto py-3"
                                >
                                  <div className="text-left">
                                    <div className="font-medium">Stærk positiv korrelation</div>
                                    <div className="text-sm text-muted-foreground">r ≈ 0.9</div>
                                  </div>
                                </Button>
                                <Button
                                  variant={exampleDataType === "moderate-positive" ? "default" : "outline"}
                                  onClick={() => setExampleDataType("moderate-positive")}
                                  className="justify-start h-auto py-3"
                                >
                                  <div className="text-left">
                                    <div className="font-medium">Moderat positiv korrelation</div>
                                    <div className="text-sm text-muted-foreground">r ≈ 0.6</div>
                                  </div>
                                </Button>
                                <Button
                                  variant={exampleDataType === "weak-positive" ? "default" : "outline"}
                                  onClick={() => setExampleDataType("weak-positive")}
                                  className="justify-start h-auto py-3"
                                >
                                  <div className="text-left">
                                    <div className="font-medium">Svag positiv korrelation</div>
                                    <div className="text-sm text-muted-foreground">r ≈ 0.3</div>
                                  </div>
                                </Button>
                                <Button
                                  variant={exampleDataType === "no-correlation" ? "default" : "outline"}
                                  onClick={() => setExampleDataType("no-correlation")}
                                  className="justify-start h-auto py-3"
                                >
                                  <div className="text-left">
                                    <div className="font-medium">Ingen korrelation</div>
                                    <div className="text-sm text-muted-foreground">r ≈ 0</div>
                                  </div>
                                </Button>
                                <Button
                                  variant={exampleDataType === "weak-negative" ? "default" : "outline"}
                                  onClick={() => setExampleDataType("weak-negative")}
                                  className="justify-start h-auto py-3"
                                >
                                  <div className="text-left">
                                    <div className="font-medium">Svag negativ korrelation</div>
                                    <div className="text-sm text-muted-foreground">r ≈ -0.3</div>
                                  </div>
                                </Button>
                                <Button
                                  variant={exampleDataType === "moderate-negative" ? "default" : "outline"}
                                  onClick={() => setExampleDataType("moderate-negative")}
                                  className="justify-start h-auto py-3"
                                >
                                  <div className="text-left">
                                    <div className="font-medium">Moderat negativ korrelation</div>
                                    <div className="text-sm text-muted-foreground">r ≈ -0.6</div>
                                  </div>
                                </Button>
                                <Button
                                  variant={exampleDataType === "strong-negative" ? "default" : "outline"}
                                  onClick={() => setExampleDataType("strong-negative")}
                                  className="justify-start h-auto py-3"
                                >
                                  <div className="text-left">
                                    <div className="font-medium">Stærk negativ korrelation</div>
                                    <div className="text-sm text-muted-foreground">r ≈ -0.9</div>
                                  </div>
                                </Button>
                              </>
                            ) : (
                              // Eksempeldata for andre analysetyper
                              <>
                                <Button
                                  variant={exampleDataType === "normal" ? "default" : "outline"}
                                  onClick={() => setExampleDataType("normal")}
                                  className="justify-start h-auto py-3"
                                >
                                  <div className="text-left">
                                    <div className="font-medium">Normalfordeling</div>
                                    <div className="text-sm text-muted-foreground">
                                      Symmetrisk klokkeformet fordeling
                                    </div>
                                  </div>
                                </Button>
                                <Button
                                  variant={exampleDataType === "uniform" ? "default" : "outline"}
                                  onClick={() => setExampleDataType("uniform")}
                                  className="justify-start h-auto py-3"
                                >
                                  <div className="text-left">
                                    <div className="font-medium">Uniform fordeling</div>
                                    <div className="text-sm text-muted-foreground">Jævn fordeling af værdier</div>
                                  </div>
                                </Button>
                                <Button
                                  variant={exampleDataType === "skewed" ? "default" : "outline"}
                                  onClick={() => setExampleDataType("skewed")}
                                  className="justify-start h-auto py-3"
                                >
                                  <div className="text-left">
                                    <div className="font-medium">Skæv fordeling</div>
                                    <div className="text-sm text-muted-foreground">Højreskæv log-normal fordeling</div>
                                  </div>
                                </Button>
                                <Button
                                  variant={exampleDataType === "bimodal" ? "default" : "outline"}
                                  onClick={() => setExampleDataType("bimodal")}
                                  className="justify-start h-auto py-3"
                                >
                                  <div className="text-left">
                                    <div className="font-medium">Bimodal fordeling</div>
                                    <div className="text-sm text-muted-foreground">To toppe i fordelingen</div>
                                  </div>
                                </Button>
                                <Button
                                  variant={exampleDataType === "outliers" ? "default" : "outline"}
                                  onClick={() => setExampleDataType("outliers")}
                                  className="justify-start h-auto py-3"
                                >
                                  <div className="text-left">
                                    <div className="font-medium">Data med outliers</div>
                                    <div className="text-sm text-muted-foreground">
                                      Normalfordeling med ekstreme værdier
                                    </div>
                                  </div>
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <div className="flex space-x-4 mb-4">
                            {analysisType === "correlation" ? (
                              <Button variant="default" onClick={() => setInputMethod("xy")} className="flex-1">
                                X-Y data indtastning
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant={inputMethod === "paste" ? "default" : "outline"}
                                  onClick={() => setInputMethod("paste")}
                                  className="flex-1"
                                >
                                  Indsæt data
                                </Button>
                                <Button
                                  variant={inputMethod === "manual" ? "default" : "outline"}
                                  onClick={() => setInputMethod("manual")}
                                  className="flex-1"
                                >
                                  Manuel indtastning
                                </Button>
                              </>
                            )}
                          </div>

                          {inputMethod === "paste" && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="data-input">
                                  Indtast dine værdier (adskilt af komma eller linjeskift)
                                </Label>
                                <TooltipProvider>
                                  <UITooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <HelpCircle className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p>
                                        Indtast dine tal adskilt af komma, mellemrum eller linjeskift. F.eks.: 22, 24,
                                        30, 27, 25, 31
                                      </p>
                                    </TooltipContent>
                                  </UITooltip>
                                </TooltipProvider>
                              </div>
                              <Textarea
                                id="data-input"
                                placeholder="F.eks.: 22, 24, 30, 27, 25, 31"
                                value={dataInput}
                                onChange={(e) => setDataInput(e.target.value)}
                                rows={5}
                                className="input-focus-effect"
                              />
                            </div>
                          )}

                          {inputMethod === "manual" && (
                            <div className="space-y-4">
                              <Label>Indtast dine værdier en ad gangen</Label>
                              {manualDataPoints.map((point, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Label htmlFor={`data-point-${index}`} className="w-24">
                                    Værdi {index + 1}:
                                  </Label>
                                  <Input
                                    id={`data-point-${index}`}
                                    value={point}
                                    onChange={(e) => handleManualDataChange(index, e.target.value)}
                                    type="number"
                                    step="any"
                                    className="input-focus-effect"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveDataPoint(index)}
                                    disabled={manualDataPoints.length <= 1}
                                  >
                                    <ChevronUp className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button variant="outline" onClick={handleAddDataPoint} className="flex items-center">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tilføj værdi
                              </Button>
                            </div>
                          )}

                          {inputMethod === "xy" && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label>Indtast X-Y værdipar</Label>
                                <TooltipProvider>
                                  <UITooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <HelpCircle className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p>
                                        Indtast X og Y værdier for hvert datapunkt. For eksempel kan X være alder og Y
                                        være indkomst.
                                      </p>
                                    </TooltipContent>
                                  </UITooltip>
                                </TooltipProvider>
                              </div>

                              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                                <Label className="font-medium">X-værdi</Label>
                                <Label className="font-medium">Y-værdi</Label>
                                <div></div>
                              </div>

                              {xyDataPoints.map((point, index) => (
                                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                                  <Input
                                    value={point.x}
                                    onChange={(e) => handleXYDataChange(index, "x", e.target.value)}
                                    type="number"
                                    step="any"
                                    placeholder="X-værdi"
                                    className="input-focus-effect"
                                  />
                                  <Input
                                    value={point.y}
                                    onChange={(e) => handleXYDataChange(index, "y", e.target.value)}
                                    type="number"
                                    step="any"
                                    placeholder="Y-værdi"
                                    className="input-focus-effect"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveXYDataPoint(index)}
                                    disabled={xyDataPoints.length <= 1}
                                  >
                                    <ChevronUp className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}

                              <Button variant="outline" onClick={handleAddXYDataPoint} className="flex items-center">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tilføj værdipar
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {dataSets.length > 0 && (
                      <div className="mt-4 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <h4 className="font-medium text-lg mb-3">Tilføjede datasæt:</h4>
                        <div className="space-y-3">
                          {dataSets
                            .filter(
                              (dataset) =>
                                // Vis kun datasæt der ikke er del af et korrelationssæt eller er X/Y datasæt
                                !(dataset.id.includes("-x") || dataset.id.includes("-y")) ||
                                // Vis X/Y datasæt hvis vi er i korrelationsanalyse
                                (analysisType === "correlation" &&
                                  (dataset.id.includes("-x") || dataset.id.includes("-y"))),
                            )
                            .map((dataset, index) => (
                              <div key={index} className="rounded-md border p-3 bg-white dark:bg-gray-800 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: dataset.color }}
                                    ></div>
                                    <div>{dataset.name}</div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`dataset-visibility-${dataset.id}`}
                                      checked={dataset.visible}
                                      onCheckedChange={() => handleToggleDataSetVisibility(dataset.id)}
                                    />
                                    <Label htmlFor={`dataset-visibility-${dataset.id}`}>Vis</Label>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveDataSet(dataset.id)}>
                                      <ChevronUp className="h-4 w-4 rotate-180" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleReset}>
                      Nulstil
                    </Button>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("analysis")}
                        disabled={dataSets.length === 0}
                      >
                        Næste
                      </Button>
                      <Button onClick={handleAddDataSet}>Tilføj datasæt</Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-medium">Vælg statistiske mål</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Button
                        variant={selectedMeasures.includes("mean") ? "default" : "outline"}
                        onClick={() => handleMeasureChange("mean")}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">Gennemsnit</div>
                          <div className="text-sm text-muted-foreground">
                            Summen af alle værdier divideret med antallet af værdier
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant={selectedMeasures.includes("median") ? "default" : "outline"}
                        onClick={() => handleMeasureChange("median")}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">Median</div>
                          <div className="text-sm text-muted-foreground">Midterste værdi når data er sorteret</div>
                        </div>
                      </Button>
                      <Button
                        variant={selectedMeasures.includes("variance") ? "default" : "outline"}
                        onClick={() => handleMeasureChange("variance")}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">Varians</div>
                          <div className="text-sm text-muted-foreground">Et mål for spredningen i datasættet</div>
                        </div>
                      </Button>
                      <Button
                        variant={selectedMeasures.includes("stdDev") ? "default" : "outline"}
                        onClick={() => handleMeasureChange("stdDev")}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">Standardafvigelse</div>
                          <div className="text-sm text-muted-foreground">Kvadratroden af variansen</div>
                        </div>
                      </Button>
                      <Button
                        variant={selectedMeasures.includes("confInterval") ? "default" : "outline"}
                        onClick={() => handleMeasureChange("confInterval")}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">Konfidensinterval</div>
                          <div className="text-sm text-muted-foreground">
                            Interval hvor den sande gennemsnit forventes at ligge
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant={selectedMeasures.includes("outliers") ? "default" : "outline"}
                        onClick={() => handleMeasureChange("outliers")}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">Outliers</div>
                          <div className="text-sm text-muted-foreground">
                            Værdier der ligger usædvanligt langt fra resten af dataene
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant={selectedMeasures.includes("quartiles") ? "default" : "outline"}
                        onClick={() => handleMeasureChange("quartiles")}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">Kvartiler</div>
                          <div className="text-sm text-muted-foreground">Opdelingen af data i fire lige store dele</div>
                        </div>
                      </Button>
                      <Button
                        variant={selectedMeasures.includes("skewness") ? "default" : "outline"}
                        onClick={() => handleMeasureChange("skewness")}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">Skævhed</div>
                          <div className="text-sm text-muted-foreground">Mål for datasættets asymmetri</div>
                        </div>
                      </Button>
                      <Button
                        variant={selectedMeasures.includes("kurtosis") ? "default" : "outline"}
                        onClick={() => handleMeasureChange("kurtosis")}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">Kurtosis</div>
                          <div className="text-sm text-muted-foreground">Mål for datasættets spidshed</div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {analysisType !== "correlation" && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-medium">Vælg visualiseringer</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <Button
                          variant={selectedVisualizations.includes("histogram") ? "default" : "outline"}
                          onClick={() => handleVisualizationChange("histogram")}
                          className="justify-start h-auto py-3"
                        >
                          <div className="text-left">
                            <div className="font-medium">Histogram</div>
                            <div className="text-sm text-muted-foreground">
                              Viser frekvensen af værdier i intervaller
                            </div>
                          </div>
                        </Button>
                        <Button
                          variant={selectedVisualizations.includes("normal") ? "default" : "outline"}
                          onClick={() => handleVisualizationChange("normal")}
                          className="justify-start h-auto py-3"
                        >
                          <div className="text-left">
                            <div className="font-medium">Normalfordeling</div>
                            <div className="text-sm text-muted-foreground">
                              Viser en normalfordelingskurve over dataene
                            </div>
                          </div>
                        </Button>
                        <Button
                          variant={selectedVisualizations.includes("boxplot") ? "default" : "outline"}
                          onClick={() => handleVisualizationChange("boxplot")}
                          className="justify-start h-auto py-3"
                        >
                          <div className="text-left">
                            <div className="font-medium">Boxplot</div>
                            <div className="text-sm text-muted-foreground">Viser median, kvartiler og outliers</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  )}

                  {analysisType === "correlation" && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-medium">Visualisering</h3>
                      <Button
                        variant={selectedVisualizations.includes("scatter") ? "default" : "outline"}
                        onClick={() => handleVisualizationChange("scatter")}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">Scatterplot</div>
                          <div className="text-sm text-muted-foreground">Viser forholdet mellem to variable</div>
                        </div>
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-xl font-medium">Datasæt til analyse</h3>
                    <div className="space-y-3">
                      {dataSets
                        .filter(
                          (dataset) =>
                            // Vis kun datasæt der ikke er del af et korrelationssæt eller er X/Y datasæt
                            !(dataset.id.includes("-x") || dataset.id.includes("-y")) ||
                            // Vis X/Y datasæt hvis vi er i korrelationsanalyse
                            (analysisType === "correlation" &&
                              (dataset.id.includes("-x") || dataset.id.includes("-y"))),
                        )
                        .map((dataset, index) => (
                          <div key={index} className="rounded-md border p-3 bg-white dark:bg-gray-800 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`dataset-selection-${dataset.id}`}
                                  checked={selectedDataSetIds.includes(dataset.id)}
                                  onCheckedChange={() => handleDataSetSelectionChange(dataset.id)}
                                />
                                <Label htmlFor={`dataset-selection-${dataset.id}`}>{dataset.name}</Label>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {selectedMeasures.includes("confInterval") && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-medium">Konfidensniveau</h3>
                      <div className="space-y-2">
                        <Label htmlFor="confidence-level">Vælg konfidensniveau</Label>
                        <Select
                          value={confidenceLevel.toString()}
                          onValueChange={(value) => setConfidenceLevel(Number.parseInt(value))}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Vælg konfidensniveau" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="90">90%</SelectItem>
                            <SelectItem value="95">95%</SelectItem>
                            <SelectItem value="99">99%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setActiveTab("data")}>
                      Tilbage
                    </Button>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("results")}
                        disabled={selectedDataSetIds.length === 0 || selectedMeasures.length === 0}
                      >
                        Næste
                      </Button>
                      <Button
                        onClick={handleCalculate}
                        disabled={selectedDataSetIds.length === 0 || selectedMeasures.length === 0 || isCalculating}
                      >
                        {isCalculating ? "Beregner..." : "Beregn"}
                      </Button>
                    </div>
                  </div>

                  {isCalculating && (
                    <div className="mt-4">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${calculationProgress}%`, transition: "width 0.3s ease-in-out" }}
                        ></div>
                      </div>
                      <p className="text-center text-sm text-muted-foreground mt-2">
                        Beregner statistik... {Math.round(calculationProgress)}%
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="results" className="space-y-6 pt-6">
                  {showResults && results.length > 0 ? (
                    <div className="space-y-8">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-medium">Resultater</h3>
                        <Button variant="outline" onClick={exportResultsAsCSV} className="flex items-center">
                          <ArrowLeft className="mr-2 h-4 w-4 rotate-180" />
                          Eksportér som CSV
                        </Button>
                      </div>

                      {/* Resultater for hvert datasæt */}
                      {dataSets
                        .filter((dataset) => selectedDataSetIds.includes(dataset.id))
                        .filter(
                          (dataset) =>
                            // Vis kun datasæt der ikke er del af et korrelationssæt eller er X/Y datasæt
                            !(dataset.id.includes("-x") || dataset.id.includes("-y")) ||
                            // Vis X/Y datasæt hvis vi er i korrelationsanalyse
                            (analysisType === "correlation" &&
                              (dataset.id.includes("-x") || dataset.id.includes("-y"))),
                        )
                        .map((dataset) => {
                          const datasetResults = getResultsForDataset(dataset.id)
                          if (datasetResults.length === 0) return null

                          return (
                            <Card key={dataset.id} className="overflow-hidden">
                              <CardHeader
                                className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
                                style={{ borderLeft: `4px solid ${dataset.color}` }}
                              >
                                <CardTitle>{dataset.name}</CardTitle>
                                <CardDescription>
                                  {dataset.data.length} værdier
                                  {dataset.id.includes("-x")
                                    ? " (X-værdier)"
                                    : dataset.id.includes("-y")
                                      ? " (Y-værdier)"
                                      : ""}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {datasetResults.map((result, index) => (
                                    <div
                                      key={index}
                                      className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                                    >
                                      <h4 className="font-medium mb-2">
                                        {result.measure === "mean"
                                          ? "Gennemsnit"
                                          : result.measure === "median"
                                            ? "Median"
                                            : result.measure === "variance"
                                              ? "Varians"
                                              : result.measure === "stdDev"
                                                ? "Standardafvigelse"
                                                : result.measure === "confInterval"
                                                  ? `${confidenceLevel}% Konfidensinterval`
                                                  : result.measure === "outliers"
                                                    ? "Outliers"
                                                    : result.measure === "quartiles"
                                                      ? "Kvartiler"
                                                      : result.measure === "skewness"
                                                        ? "Skævhed"
                                                        : result.measure === "kurtosis"
                                                          ? "Kurtosis"
                                                          : result.measure}
                                      </h4>
                                      <div className="text-2xl font-bold">
                                        {result.measure === "confInterval" && Array.isArray(result.value)
                                          ? `[${formatNumber(result.value[0])}, ${formatNumber(result.value[1])}]`
                                          : result.measure === "quartiles" && Array.isArray(result.value)
                                            ? `Q1: ${formatNumber(result.value[0])}, Q2: ${formatNumber(
                                                result.value[1],
                                              )}, Q3: ${formatNumber(result.value[2])}`
                                            : result.measure === "outliers"
                                              ? result.value === null ||
                                                (Array.isArray(result.value) && result.value.length === 0)
                                                ? "Ingen outliers"
                                                : Array.isArray(result.value)
                                                  ? result.value.map((v) => formatNumber(v)).join(", ")
                                                  : "N/A"
                                              : result.value !== null
                                                ? formatNumber(result.value as number)
                                                : "N/A"}
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-2">{result.description}</p>
                                      {result.measure === "skewness" && typeof result.value === "number" && (
                                        <p className="text-sm font-medium mt-2">
                                          {getSkewnessDescription(result.value)}
                                        </p>
                                      )}
                                      {result.measure === "kurtosis" && typeof result.value === "number" && (
                                        <p className="text-sm font-medium mt-2">
                                          {getKurtosisDescription(result.value)}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}

                      {/* Korrelationsresultater */}
                      {analysisType === "correlation" &&
                        dataSets.some((ds) => ds.id.includes("-x") && selectedDataSetIds.includes(ds.id)) && (
                          <Card className="overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                              <CardTitle>Korrelationsanalyse</CardTitle>
                              <CardDescription>Sammenhæng mellem X og Y variable</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                              {dataSets
                                .filter((ds) => !ds.id.includes("-x") && !ds.id.includes("-y"))
                                .filter((ds) => dataSets.some((d) => d.id === `${ds.id}-x`))
                                .map((dataset) => {
                                  const correlationResult = getCorrelationResultForDatasets(dataset.id)
                                  if (!correlationResult || correlationResult.value === null) return null

                                  const correlationValue = correlationResult.value as number
                                  const correlationDescription = getCorrelationDescription(correlationValue)

                                  return (
                                    <div
                                      key={dataset.id}
                                      className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                                    >
                                      <h4 className="font-medium mb-2">
                                        Pearson korrelationskoefficient for {dataset.name}
                                      </h4>
                                      <div className="text-2xl font-bold">{formatNumber(correlationValue)}</div>
                                      <p className="text-sm text-muted-foreground mt-2">
                                        {correlationResult.description}
                                      </p>
                                      <p className="text-sm font-medium mt-2">{correlationDescription}</p>
                                    </div>
                                  )
                                })}
                            </CardContent>
                          </Card>
                        )}

                      <div className="space-y-4">
                        <h3 className="text-xl font-medium">Gem analyse</h3>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Navn på analysen"
                            value={currentAnalysisName}
                            onChange={(e) => setCurrentAnalysisName(e.target.value)}
                          />
                          <Button onClick={handleSaveAnalysis} disabled={results.length === 0}>
                            Gem
                          </Button>
                        </div>
                      </div>

                      {savedAnalyses.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-xl font-medium">Gemte analyser</h3>
                          <div className="space-y-3">
                            {savedAnalyses.map((analysis) => (
                              <div
                                key={analysis.id}
                                className="rounded-md border p-3 bg-white dark:bg-gray-800 shadow-sm"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">{analysis.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {analysis.date} • {analysis.dataSets.length} datasæt
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button variant="outline" onClick={() => handleLoadAnalysis(analysis)}>
                                      Indlæs
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteAnalysis(analysis.id)}
                                    >
                                      <ChevronUp className="h-4 w-4 rotate-180" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-xl font-medium mb-2">Ingen resultater endnu</h3>
                      <p className="text-muted-foreground mb-6">
                        Vælg dine datasæt og statistiske mål, og klik på "Beregn" for at se resultater
                      </p>
                      <Button onClick={() => setActiveTab("analysis")}>Gå til analyse</Button>
                    </div>
                  )}

                  <div className="mt-6">
                    <AIRecommendation data={aiRecommendation} />
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setActiveTab("analysis")}>
                      Tilbage
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                      Start forfra
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
