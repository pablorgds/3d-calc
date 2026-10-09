import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ConfiguracoesForm } from "@/components/configuracoes-form"
import { PageIntro } from "@/components/page-intro"
import { decidirGet, tokenDoCookie } from "@/lib/acesso"
import { LEDE_CONFIG } from "@/lib/vistas"

export const metadata: Metadata = {
  title: "Configurações",
}

export default async function ConfiguracoesPage() {
  const token = tokenDoCookie((await cookies()).toString())
  const decisao = await decidirGet("/configuracoes", token, null, null)
  if (decisao.kind === "redirect") redirect(decisao.location)
  return (
    <PageIntro title="Configurações" lede={LEDE_CONFIG}>
      <ConfiguracoesForm />
    </PageIntro>
  )
}
