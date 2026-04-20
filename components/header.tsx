"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Forside" },
  { href: "/privat", label: "Privat" },
  { href: "/virksomhed", label: "Virksomhed" },
  { href: "/guides", label: "Guides" },
  { href: "/ordbog", label: "Ordbog" },
  { href: "/support", label: "Support" },
]

export function Header() {
  const pathname = usePathname()

  // Skjul header på forsiden (som har sin egen nav)
  if (pathname === "/") {
    return null
  }

  return (
    <header className="border-b bg-white dark:bg-gray-950 sticky top-0 z-40">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          ARQOMI
        </Link>
        <nav className="ml-auto flex items-center space-x-1 md:space-x-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname?.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-2 py-1 text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
