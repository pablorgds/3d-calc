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
    <main className="coluna coluna-unica flex-1 py-8">
      <header className="cabecalho-pagina">
        <h1 className="titulo-pagina">{titulo}</h1>
      </header>
      {aviso ? <p>{aviso}</p> : null}
      {campos ? (
        <form method="post" action="/sessao" className="grid gap-3">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" autoComplete="username" className="h-11 rounded-lg border px-3" />
          <label htmlFor="senha">Senha</label>
          <input id="senha" name="senha" type="password" autoComplete="current-password" className="h-11 rounded-lg border px-3" />
          <button type="submit" name="acao" value="entrar" className="h-11">
            Entrar
          </button>
          <button type="submit" name="acao" value="criar" className="h-11">
            Criar conta
          </button>
        </form>
      ) : null}
    </main>
  )
}
