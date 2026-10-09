"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function FormularioCriar({ aviso }: { aviso: string | null }) {
  const [erro, setErro] = useState<string | null>(null)

  return (
    <main className="coluna coluna-unica flex-1 py-8">
      <header className="cabecalho-pagina">
        <h1 className="titulo-pagina">Criar conta</h1>
        <p className="lede text-muted-foreground">
          A conta nova nasce com a K2 Pro e zero projetos. A senha fica só nesta máquina.
        </p>
      </header>
      {aviso ? <p className="erro-campo mb-4">{aviso}</p> : null}
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Conta nova</CardTitle>
          <CardDescription>E-mail, senha e a mesma senha de novo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            method="post"
            action="/sessao"
            className="grid gap-4"
            onSubmit={(event) => {
              const dados = new FormData(event.currentTarget)
              const senha = String(dados.get("senha") ?? "")
              const confirmacao = String(dados.get("confirmacao") ?? "")
              if (senha !== confirmacao) {
                event.preventDefault()
                setErro("As senhas não conferem.")
                return
              }
              setErro(null)
            }}
          >
            <div className="campo">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" autoComplete="username" required className="h-11" />
            </div>
            <div className="campo">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                name="senha"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="h-11"
              />
              <p className="legenda text-muted-foreground">8 caracteres ou mais.</p>
            </div>
            <div className="campo">
              <Label htmlFor="confirmacao">Confirmar senha</Label>
              <Input
                id="confirmacao"
                name="confirmacao"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="h-11"
              />
              {erro ? <p className="erro-campo">{erro}</p> : null}
            </div>
            <button type="submit" name="acao" value="criar" className="btn-primario h-11">
              Criar conta
            </button>
          </form>
        </CardContent>
        <CardFooter>
          <Link href="/entrar" className="btn-outline inline-flex h-11 items-center px-3 text-sm font-medium">
            Entrar
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
