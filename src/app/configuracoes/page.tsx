import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ConfiguracoesForm } from "@/components/configuracoes-form"
import { PageIntro } from "@/components/page-intro"
import { RedefinirSenha } from "@/components/redefinir-senha"
import { decidirGet, tokenDoCookie } from "@/lib/acesso"
import { LEDE_CONFIG } from "@/lib/vistas"

export const metadata: Metadata = {
  title: "Configurações",
}

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string | string[] | undefined }>
}) {
  const params = await searchParams
  const aviso = typeof params.aviso === "string" ? params.aviso : null
  const token = tokenDoCookie((await cookies()).toString())
  const decisao = await decidirGet("/configuracoes", token, null, aviso)
  if (decisao.kind === "redirect") redirect(decisao.location)
  return (
    <PageIntro title="Configurações" lede={LEDE_CONFIG}>
      <ConfiguracoesForm />
      {decisao.kind === "configuracoes" && decisao.redefinir ? (
        <RedefinirSenha emails={decisao.emails} aviso={decisao.aviso} />
      ) : null}
    </PageIntro>
  )
}