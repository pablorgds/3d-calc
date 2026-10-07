"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"
import { buttonVariants } from "@/components/ui/button"

const navItems = [
  { href: "/", label: "Calculadora" },
  { href: "/projetos", label: "Projetos" },
  { href: "/configuracoes", label: "Configurações" },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-baseline justify-between gap-3">
          <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
            custo<span className="text-primary">/</span>chapa
          </Link>
          <p className="text-xs text-muted-foreground">precificação de impressão</p>
        </div>
        <nav aria-label="Seções" className="grid grid-cols-3 gap-1 sm:flex">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  buttonVariants({ variant: active ? "secondary" : "ghost" }),
                  "h-11 px-2 text-center sm:px-3"
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
