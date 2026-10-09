import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ListaUsuarios } from "@/components/lista-usuarios"
import { PageIntro } from "@/components/page-intro"
import { decidirGet, tokenDoCookie } from "@/lib/acesso"
import { LEDE_USUARIOS } from "@/lib/vistas"

export const metadata: Metadata = {
  title: "Usuários",
}

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string | string[] | undefined }>
}) {
  const params = await searchParams
  const aviso = typeof params.aviso === "string" ? params.aviso : null
  const token = tokenDoCookie((await cookies()).toString())
  const decisao = await decidirGet("/usuarios", token, null, aviso)
  if (decisao.kind === "redirect") redirect(decisao.location)
  if (decisao.kind !== "usuarios") redirect("/entrar")
  return (
    <PageIntro title="Usuários" lede={LEDE_USUARIOS}>
      <ListaUsuarios emails={decisao.emails} aviso={decisao.aviso} />
    </PageIntro>
  )
}
