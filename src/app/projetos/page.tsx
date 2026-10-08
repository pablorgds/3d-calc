import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ListaProjetos } from "@/components/lista-projetos"
import { PageIntro } from "@/components/page-intro"
import { decidirGet, tokenDoCookie } from "@/lib/acesso"
import { abrirBancoDoAmbiente, comConta } from "@/lib/banco"
import { LEDE_PROJETOS } from "@/lib/vistas"

export const metadata: Metadata = {
  title: "Projetos",
}

export default async function ProjetosPage() {
  const token = tokenDoCookie((await cookies()).toString())
  const decisao = await decidirGet("/projetos", token, null, null)
  if (decisao.kind === "redirect") redirect(decisao.location)
  const sessao = token ? await abrirBancoDoAmbiente().lerSessao(token) : null
  const lido = sessao ? await comConta(sessao.contaId, () => abrirBancoDoAmbiente().ler()) : null
  return (
    <PageIntro title="Projetos" lede={LEDE_PROJETOS}>
      <ListaProjetos inicial={lido?.status === "ok" ? { printers: lido.printers, projects: lido.projects } : null} />
    </PageIntro>
  )
}
