import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { FormularioCriar } from "@/components/formulario-criar"
import { FormularioEntrar } from "@/components/formulario-entrar"
import { decidirGet, tokenDoCookie } from "@/lib/acesso"
import { TITULO_ERRO } from "@/lib/vistas"

export const metadata: Metadata = {
  title: "Criar conta",
}

export default async function CriarPage({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string | string[] | undefined }>
}) {
  const params = await searchParams
  const aviso = typeof params.aviso === "string" ? params.aviso : null
  const token = tokenDoCookie((await cookies()).toString())
  const decisao = await decidirGet("/criar", token, null, aviso)
  if (decisao.kind === "redirect") redirect(decisao.location)
  if (decisao.kind === "banco") return <FormularioEntrar titulo={TITULO_ERRO} aviso={null} campos={false} />
  if (decisao.kind === "falta-senha") return <FormularioEntrar titulo="Falta a senha da primeira conta." aviso={null} campos={false} />
  return <FormularioCriar aviso={decisao.kind === "criar" ? decisao.aviso : aviso} />
}
