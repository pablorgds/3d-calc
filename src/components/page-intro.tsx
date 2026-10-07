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
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{lede}</p>
      </header>
      {children}
    </main>
  )
}
