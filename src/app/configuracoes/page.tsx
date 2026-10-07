import type { Metadata } from "next"
import { ConfiguracoesForm } from "@/components/configuracoes-form"
import { PageIntro } from "@/components/page-intro"

export const metadata: Metadata = {
  title: "Configurações",
}

export default function ConfiguracoesPage() {
  return (
    <PageIntro
      title="Configurações"
      lede="Potência, tarifa de energia, preço da impressora e vida útil. A calculadora usa só o que está aqui. Ainda não há lista para trocar de máquina."
    >
      <ConfiguracoesForm />
    </PageIntro>
  )
}
