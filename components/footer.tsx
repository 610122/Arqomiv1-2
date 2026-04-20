import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="w-full border-t py-6 md:py-10">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="ARQOMI Logo" width={32} height={32} />
            <span className="text-xl font-bold">ARQOMI</span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            Arkitekten bag din finansielle fremtid
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 text-sm">
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">Værktøjer</h3>
            <Link href="/beregner/laan" className="text-muted-foreground hover:text-foreground transition-colors">
              Lånberegner
            </Link>
            <Link
              href="/beregner/investering"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Investeringsberegner
            </Link>
            <Link href="/beregner/risiko" className="text-muted-foreground hover:text-foreground transition-colors">
              Risikoberegner
            </Link>
            <Link href="/raadgiver" className="text-muted-foreground hover:text-foreground transition-colors">
              Personlig Rådgiver
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">Ressourcer</h3>
            <Link href="/guides" className="text-muted-foreground hover:text-foreground transition-colors">
              Guides
            </Link>
            <Link href="/raadgiver" className="text-muted-foreground hover:text-foreground transition-colors">
              Rådgiver
            </Link>
            <Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
              Support
            </Link>
            <Link href="/beregner" className="text-muted-foreground hover:text-foreground transition-colors">
              Beregnere
            </Link>
          </div>
          <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
            <h3 className="font-medium">Kontakt</h3>
            <a href="mailto:kontakt@arqomi.dk" className="text-muted-foreground hover:text-foreground transition-colors">
              kontakt@arqomi.dk
            </a>
            <a href="tel:+4512345678" className="text-muted-foreground hover:text-foreground transition-colors">
              +45 12 34 56 78
            </a>
            <div className="flex gap-4 mt-2">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="container mt-8 pt-4 border-t">
        <p className="text-xs text-center text-muted-foreground">
          © {new Date().getFullYear()} ARQOMI. Alle rettigheder forbeholdes.
        </p>
      </div>
    </footer>
  )
}
