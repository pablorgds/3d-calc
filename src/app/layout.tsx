import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { cookies } from "next/headers"
import { SiteHeader } from "@/components/site-header"
import { tokenDoCookie } from "@/lib/acesso"
import { abrirBancoDoAmbiente } from "@/lib/banco"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Custo por chapa",
    template: "%s · Custo por chapa",
  },
  description:
    "Precificação de impressão 3D: custo por peça e por lote, projetos no banco deste computador e mais de uma impressora.",
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const token = tokenDoCookie((await cookies()).toString())
  const sessao = token ? await abrirBancoDoAmbiente().lerSessao(token) : null
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex flex-col">
        <SiteHeader email={sessao?.email ?? null} admin={sessao?.papel === "admin"} />
        {children}
      </body>
    </html>
  )
}
