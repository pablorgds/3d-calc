let paginaVista = false

export type TipoMontagem = "entrar" | "troca"

export function tipoMontagem(): TipoMontagem {
  return paginaVista ? "troca" : "entrar"
}

export function marcarPaginaVista() {
  paginaVista = true
}

export function atrasoLista(indice: number, quantidade: number): string {
  if (quantidade <= 1) return "0ms"
  return `${indice * 80}ms`
}
