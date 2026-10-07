import type { Metadata } from "next"
import { ListaProjetos } from "@/components/lista-projetos"
import { PageIntro } from "@/components/page-intro"

export const metadata: Metadata = {
  title: "Projetos",
}

export default function ProjetosPage() {
  return (
    <PageIntro
      title="Projetos"
      lede="Lotes gravados neste navegador: modo, cópias, tempo, mão de obra e cores. A tarifa fica na impressora, então o total acompanha a máquina. Abrir marca a impressora do projeto."
    >
      <ListaProjetos />
    </PageIntro>
  )
}
