export function BotaoSair() {
  return (
    <form method="post" action="/sessao" className="nav-sair-form">
      <input type="hidden" name="acao" value="sair" />
      <button type="submit" className="nav-link nav-sair">
        Sair
      </button>
    </form>
  )
}
