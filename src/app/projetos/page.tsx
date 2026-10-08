import type { Metadata } from "next"
import { ListaProjetos } from "@/components/lista-projetos"
import { PageIntro } from "@/components/page-intro"
import { LEDE_PROJETOS } from "@/lib/vistas"

export const metadata: Metadata = {
  title: "Projetos",
}

export default function ProjetosPage() {
  return (
    <PageIntro
      title="Projetos"
      lede={LEDE_PROJETOS}
    >
      <ListaProjetos />
    </PageIntro>
  )
}
