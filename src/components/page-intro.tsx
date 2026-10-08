import type { ReactNode } from "react"

export function PageIntro({
  title,
  lede,
  children,
}: {
  title: string
  lede: string
  children: ReactNode
}) {
  return (
    <main className="coluna coluna-unica flex-1 py-8">
      <header className="cabecalho-pagina">
        <h1 className="titulo-pagina">{title}</h1>
        <p className="lede text-muted-foreground">{lede}</p>
      </header>
      {children}
    </main>
  )
}
