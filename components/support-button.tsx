"use client"

import type React from "react"
import Link from "next/link"

import { useState } from "react"
import { HelpCircle, Mail, Phone, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function SupportButton() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    tool: "",
    issue: "",
  })

  const { toast } = useToast()

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Here you would normally send the data to your backend
    // For now we'll just simulate a successful submission

    toast({
      title: "Support anmodning modtaget",
      description: "Vi vender tilbage til dig hurtigst muligt.",
    })

    setOpen(false)
    setFormData({ name: "", email: "", tool: "", issue: "" })
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-blue-700 to-cyan-500 hover:from-blue-800 hover:to-cyan-600 z-50"
        aria-label="Support"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent">
              Brug for hjælp?
            </DialogTitle>
            <DialogDescription>Fortæl os om problemet, så hjælper vi dig hurtigst muligt.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Navn</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Dit navn"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="din@email.dk"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tool">Hvilket værktøj har du problemer med?</Label>
              <Select value={formData.tool} onValueChange={(value) => handleChange("tool", value)} required>
                <SelectTrigger id="tool">
                  <SelectValue placeholder="Vælg værktøj" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="investering">Investeringsberegner</SelectItem>
                  <SelectItem value="laan">Låneberegner</SelectItem>
                  <SelectItem value="budget">Budgetplanlægger</SelectItem>
                  <SelectItem value="risiko">Risikoberegner</SelectItem>
                  <SelectItem value="virksomhed">Virksomhedsrådgivning</SelectItem>
                  <SelectItem value="raadgiver">Personlig Rådgiver</SelectItem>
                  <SelectItem value="andet">Andet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue">Beskriv problemet</Label>
              <Textarea
                id="issue"
                value={formData.issue}
                onChange={(e) => handleChange("issue", e.target.value)}
                placeholder="Fortæl os hvad der skete og hvordan vi kan hjælpe..."
                className="min-h-[120px]"
                required
              />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuller
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-700 to-cyan-500 hover:from-blue-800 hover:to-cyan-600"
              >
                Send anmodning
              </Button>
            </DialogFooter>
          </form>

          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-muted-foreground mb-3">Du kan også kontakte os direkte:</p>
            <div className="flex flex-col space-y-2">
              <a
                href="mailto:aivaekst@arqomi.dk"
                className="flex items-center text-sm hover:text-blue-600 transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                aivaekst@arqomi.dk
              </a>
              <a href="tel:+4531311780" className="flex items-center text-sm hover:text-blue-600 transition-colors">
                <Phone className="h-4 w-4 mr-2" />
                +45 31 31 17 80
              </a>
              <Link
                href="/support/historik"
                className="flex items-center text-sm hover:text-blue-600 transition-colors mt-2"
              >
                <Clock className="h-4 w-4 mr-2" />
                Se mine tidligere anmodninger
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
