"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function FormularioEntrar({
  titulo,
  aviso,
  campos,
}: {
  titulo: string
  aviso: string | null
  campos: boolean
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-8">
      <div className="w-full max-w-md">
        <header className="cabecalho-pagina">
          <h1 className="titulo-pagina">{titulo}</h1>
          {campos ? (
            <p className="lede text-muted-foreground">
              E-mail e senha da conta. Cada conta vê as próprias impressoras, projetos e tarifas.
            </p>
          ) : null}
        </header>
        {aviso ? <p className="erro-campo mb-4">{aviso}</p> : null}
        {campos ? (
          <Card>
            <CardHeader>
              <CardTitle>Conta</CardTitle>
              <CardDescription>Entre para abrir a calculadora desta conta.</CardDescription>
            </CardHeader>
            <CardContent>
              <form method="post" action="/sessao" className="grid gap-4">
                <div className="campo">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" autoComplete="username" className="h-11" />
                </div>
                <div className="campo">
                  <Label htmlFor="senha">Senha</Label>
                  <Input id="senha" name="senha" type="password" autoComplete="current-password" className="h-11" />
                </div>
                <button type="submit" name="acao" value="entrar" className="btn-primario h-11">
                  Entrar
                </button>
              </form>
            </CardContent>
            <CardFooter>
              <Link href="/criar" className="btn-outline inline-flex h-11 items-center px-3 text-sm font-medium">
                Criar conta
              </Link>
            </CardFooter>
          </Card>
        ) : null}
      </div>
    </main>
  )
}
