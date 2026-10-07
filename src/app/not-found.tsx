import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { PageIntro } from "@/components/page-intro"

export default function NotFound() {
  return (
    <PageIntro
      title="Página não encontrada"
      lede="Esse endereço não existe. As seções do app são Calculadora, Projetos e Configurações."
    >
      <Link href="/" className={buttonVariants()}>
        Ir para a calculadora
      </Link>
    </PageIntro>
  )
}
