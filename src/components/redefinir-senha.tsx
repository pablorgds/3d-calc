"use client"

import { useState } from "react"

export function RedefinirSenha({ emails, aviso }: { emails: string[]; aviso: string | null }) {
  const [aberto, setAberto] = useState<string | null>(null)
  if (emails.length === 0) return <p>Nenhuma outra conta.</p>
  return (
    <section className="pilha">
      <h2 className="text-sm font-medium">Outras contas</h2>
      {aviso ? <p>{aviso}</p> : null}
      <ul className="grid gap-2">
        {emails.map((email) => (
          <li key={email} className="flex flex-wrap items-center gap-3">
            <span>{email}</span>
            {aberto === email ? (
              <form method="post" action="/sessao" className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="acao" value="redefinir" />
                <input type="hidden" name="email" value={email} />
                <label htmlFor={`nova-${email}`}>Senha</label>
                <input id={`nova-${email}`} name="senha" type="password" autoComplete="new-password" className="h-11 rounded-lg border px-3" />
                <button type="submit" className="h-11">
                  Redefinir
                </button>
              </form>
            ) : (
              <button type="button" className="h-11" onClick={() => setAberto(email)}>
                Redefinir senha
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
