export function BotaoSair() {
  return (
    <form method="post" action="/sessao">
      <input type="hidden" name="acao" value="sair" />
      <button type="submit">Sair</button>
    </form>
  )
}
