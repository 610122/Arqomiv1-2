"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, MessageSquare, Calculator } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OpsparingsCalculator } from "@/components/opsparing-calculator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function OpsparingsStrategi() {
  const [input, setInput] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResponse("")

    const res = await fetch("/api/ai-raadgivning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    })

    const data = await res.json()
    setResponse(data.result || data.error || "Ingen svar.")
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-gradient-to-b from-white to-blue-50 dark:from-gray-950 dark:to-blue-950/20">
        <div className="container max-w-5xl py-8">
          <div className="mb-8 flex items-center">
            <Link
              href="/beregner"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tilbage til beregnere
            </Link>
            <h1 className="ml-auto text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Opsparingsstrategi
            </h1>
          </div>

          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="calculator" className="flex items-center">
                <Calculator className="mr-2 h-4 w-4" />
                Opsparingsberegner
              </TabsTrigger>
              <TabsTrigger value="ai-advisor" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                AI-rådgiver
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calculator">
              <OpsparingsCalculator />
            </TabsContent>

            <TabsContent value="ai-advisor">
              <Card className="mb-8 border-t-4 border-t-primary shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                  <CardTitle className="flex items-center text-2xl">
                    <MessageSquare className="mr-2 h-6 w-6 text-primary" />
                    AI-rådgiver: Opsparing
                  </CardTitle>
                  <CardDescription className="text-base">
                    Få personlig rådgivning om din opsparingsstrategi fra vores AI-assistent
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Skriv fx: Jeg vil spare 50.000 kr. på 18 måneder, eller: Hvordan kan jeg bedst spare op til boligindskud?"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        rows={4}
                        className="resize-none"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Tænker..." : "Få AI-råd"}
                    </Button>
                  </form>

                  {response && (
                    <div className="mt-6 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                      <h3 className="font-semibold mb-2 flex items-center">
                        <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                        AI's svar:
                      </h3>
                      <div className="text-sm whitespace-pre-line">{response}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
