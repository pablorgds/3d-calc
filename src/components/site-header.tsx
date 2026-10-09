"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BotaoSair } from "@/components/botao-sair"

const navItems = [
  { href: "/", label: "Calculadora" },
  { href: "/projetos", label: "Projetos" },
  { href: "/configuracoes", label: "Configurações" },
]

const rotasPublicas = new Set(["/entrar", "/criar"])

export function SiteHeader({ email = null }: { email?: string | null }) {
  const pathname = usePathname()
  const publico = rotasPublicas.has(pathname)

  return (
    <header className="site-header">
      <div className="coluna py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <Link href={email ? "/" : "/entrar"} className="wordmark">
            custo/chapa
          </Link>
          <p>precificação de impressão</p>
        </div>
        {publico ? null : (
          <div className="nav-linha">
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
            {email ? (
              <div className="nav-conta">
                <p className="nav-email">{email}</p>
                <BotaoSair />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </header>
  )
}
