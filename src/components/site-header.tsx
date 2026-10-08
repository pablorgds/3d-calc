"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BotaoSair } from "@/components/botao-sair"

const navItems = [
  { href: "/", label: "Calculadora" },
  { href: "/projetos", label: "Projetos" },
  { href: "/configuracoes", label: "Configurações" },
]

export function SiteHeader({ sair = false }: { sair?: boolean }) {
  const pathname = usePathname()

  return (
    <header className="site-header">
      <div className="coluna py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <Link href="/" className="wordmark">
            custo/chapa
          </Link>
          <p>precificação de impressão</p>
        </div>
        <nav aria-label="Seções" className="nav-secoes">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="nav-link"
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        {sair ? <BotaoSair /> : null}
      </div>
    </header>
  )
}
