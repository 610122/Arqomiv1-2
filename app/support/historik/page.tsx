"use client"

import { Textarea } from "@/components/ui/textarea"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { da } from "date-fns/locale"
import {
  ChevronLeft,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  MessageSquare,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data for support requests
const mockSupportRequests = [
  {
    id: "SR-2025-001",
    title: "Fejl i investeringsberegner",
    description: "Når jeg forsøger at beregne afkast over 20 år, viser grafen forkerte værdier.",
    tool: "investering",
    status: "løst",
    priority: "høj",
    createdAt: new Date(2025, 4, 15, 10, 30),
    updatedAt: new Date(2025, 4, 16, 14, 45),
    responses: [
      {
        id: "resp-001",
        from: "support",
        message:
          "Hej, tak for din henvendelse. Vi har identificeret problemet og arbejder på en løsning. Vi forventer at have det løst inden for 24 timer.",
        timestamp: new Date(2025, 4, 15, 11, 15),
      },
      {
        id: "resp-002",
        from: "user",
        message: "Tak for den hurtige respons. Jeg ser frem til løsningen.",
        timestamp: new Date(2025, 4, 15, 11, 30),
      },
      {
        id: "resp-003",
        from: "support",
        message:
          "Problemet er nu løst. Fejlen var i vores renteberegningsalgoritme for lange perioder. Prøv venligst igen og lad os vide, om det fungerer korrekt nu.",
        timestamp: new Date(2025, 4, 16, 14, 45),
      },
    ],
  },
  {
    id: "SR-2025-002",
    title: "Kan ikke eksportere budget til Excel",
    description: "Når jeg forsøger at eksportere mit budget til Excel, får jeg en fejlmeddelelse om 'Ugyldigt format'.",
    tool: "budget",
    status: "under behandling",
    priority: "medium",
    createdAt: new Date(2025, 5, 1, 9, 15),
    updatedAt: new Date(2025, 5, 1, 15, 20),
    responses: [
      {
        id: "resp-004",
        from: "support",
        message: "Hej, tak for din henvendelse. Vi undersøger problemet og vender tilbage hurtigst muligt.",
        timestamp: new Date(2025, 5, 1, 10, 30),
      },
      {
        id: "resp-005",
        from: "support",
        message:
          "Vi har identificeret problemet. Det skyldes en nylig opdatering af Excel-eksportfunktionen. Vores udviklere arbejder på en løsning, som vi forventer at implementere inden for de næste 48 timer.",
        timestamp: new Date(2025, 5, 1, 15, 20),
      },
    ],
  },
  {
    id: "SR-2025-003",
    title: "Spørgsmål om risikoprofil",
    description: "Jeg forstår ikke helt, hvordan min risikoprofil beregnes. Kan I forklare algoritmen bag?",
    tool: "risiko",
    status: "afventer svar",
    priority: "lav",
    createdAt: new Date(2025, 5, 10, 16, 45),
    updatedAt: new Date(2025, 5, 10, 16, 45),
    responses: [],
  },
  {
    id: "SR-2025-004",
    title: "Login-problemer efter opdatering",
    description:
      "Efter den seneste opdatering kan jeg ikke logge ind. Jeg får fejlmeddelelsen 'Ugyldige legitimationsoplysninger' selvom jeg er sikker på, at min adgangskode er korrekt.",
    tool: "andet",
    status: "løst",
    priority: "kritisk",
    createdAt: new Date(2025, 4, 28, 8, 10),
    updatedAt: new Date(2025, 4, 28, 11, 35),
    responses: [
      {
        id: "resp-006",
        from: "support",
        message:
          "Hej, vi beklager problemet. Vi har modtaget flere lignende rapporter og undersøger sagen med højeste prioritet.",
        timestamp: new Date(2025, 4, 28, 8, 25),
      },
      {
        id: "resp-007",
        from: "support",
        message:
          "Vi har identificeret problemet og implementeret en rettelse. Prøv venligst at logge ind igen. Hvis problemet fortsætter, så prøv at rydde din browsers cache og cookies.",
        timestamp: new Date(2025, 4, 28, 10, 15),
      },
      {
        id: "resp-008",
        from: "user",
        message: "Jeg kan logge ind nu. Tak for den hurtige løsning!",
        timestamp: new Date(2025, 4, 28, 10, 30),
      },
      {
        id: "resp-009",
        from: "support",
        message:
          "Perfekt! Vi er glade for at høre, at problemet er løst. Tøv ikke med at kontakte os, hvis du oplever andre problemer.",
        timestamp: new Date(2025, 4, 28, 11, 35),
      },
    ],
  },
  {
    id: "SR-2025-005",
    title: "Forslag til ny funktion",
    description:
      "Det ville være virkelig nyttigt, hvis låneberegneren kunne sammenligne forskellige låneudbydere direkte i værktøjet.",
    tool: "laan",
    status: "lukket",
    priority: "lav",
    createdAt: new Date(2025, 3, 5, 14, 20),
    updatedAt: new Date(2025, 3, 7, 9, 10),
    responses: [
      {
        id: "resp-010",
        from: "support",
        message:
          "Tak for dit forslag! Vi sætter stor pris på feedback fra vores brugere. Vi vil tage dit forslag med i vores produktudviklingsmøde næste uge.",
        timestamp: new Date(2025, 3, 5, 16, 30),
      },
      {
        id: "resp-011",
        from: "support",
        message:
          "Vi har diskuteret dit forslag i vores team, og vi synes, det er en fremragende idé. Vi har tilføjet det til vores udviklingsplan for Q3 2025. Tak for dit værdifulde input!",
        timestamp: new Date(2025, 3, 7, 9, 10),
      },
    ],
  },
]

// Status badge component
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "løst":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          Løst
        </Badge>
      )
    case "under behandling":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
          <Clock className="h-3.5 w-3.5 mr-1" />
          Under behandling
        </Badge>
      )
    case "afventer svar":
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
          <HelpCircle className="h-3.5 w-3.5 mr-1" />
          Afventer svar
        </Badge>
      )
    case "lukket":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200">
          <XCircle className="h-3.5 w-3.5 mr-1" />
          Lukket
        </Badge>
      )
    default:
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200">
          <AlertCircle className="h-3.5 w-3.5 mr-1" />
          {status}
        </Badge>
      )
  }
}

// Priority badge component
function PriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case "kritisk":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Kritisk</Badge>
    case "høj":
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200">Høj</Badge>
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">Medium</Badge>
    case "lav":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Lav</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200">{priority}</Badge>
  }
}

// Tool badge component
function ToolBadge({ tool }: { tool: string }) {
  switch (tool) {
    case "investering":
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200">
          Investeringsberegner
        </Badge>
      )
    case "laan":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Låneberegner</Badge>
    case "budget":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Budgetplanlægger</Badge>
    case "risiko":
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200">Risikoberegner</Badge>
      )
    case "virksomhed":
      return (
        <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200 border-cyan-200">Virksomhedsrådgivning</Badge>
      )
    case "raadgiver":
      return (
        <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-200">
          Personlig Rådgiver
        </Badge>
      )
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200">Andet</Badge>
  }
}

export default function SupportHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("alle")
  const [toolFilter, setToolFilter] = useState("alle")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Filter and sort support requests
  const filteredRequests = mockSupportRequests
    .filter((request) => {
      // Search filter
      const matchesSearch =
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.id.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === "alle" || request.status === statusFilter

      // Tool filter
      const matchesTool = toolFilter === "alle" || request.tool === toolFilter

      return matchesSearch && matchesStatus && matchesTool
    })
    .sort((a, b) => {
      // Sort by date
      if (sortBy === "newest") {
        return b.updatedAt.getTime() - a.updatedAt.getTime()
      } else {
        return a.updatedAt.getTime() - b.updatedAt.getTime()
      }
    })

  const openRequestDetails = (request: any) => {
    setSelectedRequest(request)
    setDialogOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header - This would normally be a shared component */}
      <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-blue-900 via-blue-700 to-cyan-600 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/arqomi-logo.png" alt="ARQOMI Logo" width={40} height={40} className="rounded-sm" />
              <span className="text-xl font-bold text-white">ARQOMI</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Log ind
            </Button>
            <Button className="bg-white text-blue-700 hover:bg-white/90">Opret konto</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container py-8">
        <div className="flex items-center mb-6">
          <Link href="/support" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Tilbage til Support
          </Link>
          <h1 className="text-2xl font-bold">Mine Support-anmodninger</h1>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filtrer og søg</CardTitle>
            <CardDescription>Find hurtigt dine tidligere support-anmodninger</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Søg efter ID, titel eller beskrivelse..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle statusser</SelectItem>
                  <SelectItem value="løst">Løst</SelectItem>
                  <SelectItem value="under behandling">Under behandling</SelectItem>
                  <SelectItem value="afventer svar">Afventer svar</SelectItem>
                  <SelectItem value="lukket">Lukket</SelectItem>
                </SelectContent>
              </Select>

              <Select value={toolFilter} onValueChange={setToolFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Værktøj" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle værktøjer</SelectItem>
                  <SelectItem value="investering">Investeringsberegner</SelectItem>
                  <SelectItem value="laan">Låneberegner</SelectItem>
                  <SelectItem value="budget">Budgetplanlægger</SelectItem>
                  <SelectItem value="risiko">Risikoberegner</SelectItem>
                  <SelectItem value="virksomhed">Virksomhedsrådgivning</SelectItem>
                  <SelectItem value="raadgiver">Personlig Rådgiver</SelectItem>
                  <SelectItem value="andet">Andet</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sortering" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Nyeste først</SelectItem>
                  <SelectItem value="oldest">Ældste først</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="bg-white rounded-lg border shadow">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Support-anmodninger ({filteredRequests.length})</h2>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Eksportér
              </Button>
            </div>
          </div>

          {filteredRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Titel</TableHead>
                    <TableHead>Værktøj</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioritet</TableHead>
                    <TableHead>Oprettet</TableHead>
                    <TableHead>Sidst opdateret</TableHead>
                    <TableHead>Svar</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow
                      key={request.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => openRequestDetails(request)}
                    >
                      <TableCell className="font-medium">{request.id}</TableCell>
                      <TableCell>{request.title}</TableCell>
                      <TableCell>
                        <ToolBadge tool={request.tool} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={request.status} />
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={request.priority} />
                      </TableCell>
                      <TableCell>{format(request.createdAt, "dd. MMM yyyy", { locale: da })}</TableCell>
                      <TableCell>{format(request.updatedAt, "dd. MMM yyyy", { locale: da })}</TableCell>
                      <TableCell>{request.responses.length}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Åbn detaljer</span>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <HelpCircle className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-1">Ingen support-anmodninger fundet</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== "alle" || toolFilter !== "alle"
                  ? "Prøv at ændre dine søgekriterier eller filtre"
                  : "Du har ikke oprettet nogen support-anmodninger endnu"}
              </p>
              <Button asChild>
                <Link href="/support">Opret en ny support-anmodning</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Request Details Dialog */}
      {selectedRequest && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <span>{selectedRequest.id}</span>
                <StatusBadge status={selectedRequest.status} />
              </DialogTitle>
              <DialogDescription>
                Oprettet {format(selectedRequest.createdAt, "dd. MMMM yyyy, HH:mm", { locale: da })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-1">{selectedRequest.title}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <ToolBadge tool={selectedRequest.tool} />
                  <PriorityBadge priority={selectedRequest.priority} />
                </div>
                <p className="text-gray-700">{selectedRequest.description}</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Kommunikation</h4>

                {selectedRequest.responses.length > 0 ? (
                  <div className="space-y-4">
                    {selectedRequest.responses.map((response: any) => (
                      <div
                        key={response.id}
                        className={`p-4 rounded-lg ${
                          response.from === "support"
                            ? "bg-blue-50 border border-blue-100"
                            : "bg-gray-50 border border-gray-100"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{response.from === "support" ? "ARQOMI Support" : "Dig"}</span>
                          <span className="text-sm text-gray-500">
                            {format(response.timestamp, "dd. MMM yyyy, HH:mm", { locale: da })}
                          </span>
                        </div>
                        <p>{response.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Ingen svar endnu. Vi behandler din anmodning.</p>
                  </div>
                )}
              </div>

              {selectedRequest.status !== "lukket" && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Tilføj svar</h4>
                  <Textarea placeholder="Skriv dit svar her..." className="min-h-[100px] mb-3" />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Annuller</Button>
                    <Button className="bg-gradient-to-r from-blue-700 to-cyan-500 hover:from-blue-800 hover:to-cyan-600">
                      Send svar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Footer - This would normally be a shared component */}
      <footer className="py-6 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white mt-auto">
        <div className="container">
          <div className="text-center">
            <p className="text-white/70 text-sm">© {new Date().getFullYear()} ARQOMI. Alle rettigheder forbeholdes.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
