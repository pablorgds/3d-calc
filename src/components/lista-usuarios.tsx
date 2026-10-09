"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ListaUsuarios({ emails, aviso }: { emails: string[]; aviso: string | null }) {
  const [senhaDe, setSenhaDe] = useState<string | null>(null)
  const [apagarDe, setApagarDe] = useState<string | null>(null)

  return (
    <div className="pilha">
      {aviso ? <p className="erro-campo">{aviso}</p> : null}
      <Card>
        <CardHeader>
          <CardTitle>Conta nova</CardTitle>
          <CardDescription>E-mail e senha. A conta nasce com a K2 Pro e zero projetos.</CardDescription>
        </CardHeader>
        <CardContent>
          <form method="post" action="/sessao" className="grid gap-4">
            <div className="campo">
              <Label htmlFor="email-novo">E-mail</Label>
              <Input id="email-novo" name="email" type="email" autoComplete="off" required className="h-11" />
            </div>
            <div className="campo">
              <Label htmlFor="senha-nova">Senha</Label>
              <Input
                id="senha-nova"
                name="senha"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="h-11"
              />
              <p className="legenda text-muted-foreground">8 caracteres ou mais.</p>
            </div>
            <button type="submit" name="acao" value="incluir" className="btn-primario h-11">
              Incluir
            </button>
          </form>
        </CardContent>
      </Card>
      {emails.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhuma outra conta.</CardTitle>
            <CardDescription>Incluir acima cria a próxima.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        emails.map((email) => (
          <Card key={email}>
            <CardHeader>
              <CardTitle>{email}</CardTitle>
              <CardDescription>Senha desta conta, nesta máquina.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {senhaDe === email ? (
                <form method="post" action="/sessao" className="grid gap-3">
                  <input type="hidden" name="acao" value="redefinir" />
                  <input type="hidden" name="email" value={email} />
                  <div className="campo">
                    <Label htmlFor={`nova-${email}`}>Senha</Label>
                    <Input
                      id={`nova-${email}`}
                      name="senha"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="submit" className="btn-primario h-11">
                      Gravar senha
                    </button>
                    <button type="button" className="btn-outline h-11 px-3" onClick={() => setSenhaDe(null)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : null}
              {apagarDe === email ? (
                <form method="post" action="/sessao" className="grid gap-3">
                  <input type="hidden" name="acao" value="apagar" />
                  <input type="hidden" name="email" value={email} />
                  <p className="text-sm text-muted-foreground">Apagar tira as impressoras e os projetos desta conta.</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="submit" className="btn-destructive h-11 px-3">
                      Apagar conta
                    </button>
                    <button type="button" className="btn-outline h-11 px-3" onClick={() => setApagarDe(null)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : null}
              {senhaDe === email || apagarDe === email ? null : (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-outline h-11 px-3"
                    onClick={() => {
                      setApagarDe(null)
                      setSenhaDe(email)
                    }}
                  >
                    Nova senha
                  </button>
                  <button
                    type="button"
                    className="btn-ghost h-11 px-3"
                    onClick={() => {
                      setSenhaDe(null)
                      setApagarDe(email)
                    }}
                  >
                    Apagar
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
