import type { Metadata } from "next"
import { ConfiguracoesForm } from "@/components/configuracoes-form"
import { PageIntro } from "@/components/page-intro"
import { LEDE_CONFIG } from "@/lib/vistas"

export const metadata: Metadata = {
  title: "Configurações",
}

export default function ConfiguracoesPage() {
  return (
    <PageIntro
      title="Configurações"
      lede={LEDE_CONFIG}
    >
      <ConfiguracoesForm />
    </PageIntro>
  )
}
