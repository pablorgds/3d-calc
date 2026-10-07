import type { Metadata } from "next"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageIntro } from "@/components/page-intro"

export const metadata: Metadata = {
  title: "Projetos",
}

export default function ProjetosPage() {
  return (
    <PageIntro
      title="Projetos"
      lede="Lotes salvos para reabrir depois. Ainda não existe onde gravar, então a lista está vazia de propósito."
    >
      <Card>
        <CardHeader>
          <CardTitle>Nenhum projeto salvo</CardTitle>
          <CardDescription>
            Um projeto será um lote com nome, impressora, calibração da peça, percentual de mão de
            obra e as cores com quantidades. Sem banco, abrir, duplicar ou apagar não faz sentido
            ainda — e não há botão que finja gravar.
          </CardDescription>
        </CardHeader>
      </Card>
    </PageIntro>
  )
}
