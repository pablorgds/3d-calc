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
      lede="A K2 Pro já vem preenchida: 150 W, R$ 1,18 por kWh, R$ 7.979 e 3.000 horas. Dá para ter mais de uma máquina; a calculadora usa a marcada. A tarifa fica na impressora, neste navegador."
    >
      <ConfiguracoesForm />
    </PageIntro>
  )
}
