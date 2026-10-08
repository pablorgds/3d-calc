import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { atrasoLista, marcarPaginaVista, tipoMontagem } from "./movimento.ts"

const root = path.resolve(import.meta.dirname, "../..")

function fonte(relativo: string) {
  return fs.readFileSync(path.join(root, relativo), "utf8")
}

function regra(css: string, selector: string): string {
  let from = 0
  while (from < css.length) {
    const at = css.indexOf(selector, from)
    if (at === -1) break
    const depois = css.slice(at + selector.length)
    const abre = /^\s*\{/.exec(depois)
    const antes = at === 0 || /[\s,}]/.test(css[at - 1] ?? "")
    if (abre && antes) {
      let i = at + selector.length + abre[0].length
      let depth = 1
      let body = ""
      while (i < css.length && depth > 0) {
        const ch = css[i]
        if (ch === "{") depth += 1
        else if (ch === "}") depth -= 1
        if (depth > 0) body += ch
        i += 1
      }
      return body
    }
    from = at + selector.length
  }
  throw new Error(`seletor ausente: ${selector}`)
}

function prop(bloco: string, nome: string): string {
  const escaped = nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = bloco.match(new RegExp(`(?:^|[;{])\\s*${escaped}\\s*:\\s*([^;]+);`))
  assert.ok(match, `propriedade ausente: ${nome}`)
  return match[1].trim().replace(/\s+/g, " ")
}

function propriedades(bloco: string): string[] {
  return [...bloco.matchAll(/(?:^|[;{}])\s*([a-z-]+)\s*:/g)].map((match) => match[1])
}

const css = fonte("src/app/globals.css")
const calculadora = fonte("src/components/calculadora.tsx")
const intro = fonte("src/components/page-intro.tsx")
const lista = fonte("src/components/lista-projetos.tsx")

test("main entra em 420ms", () => {
  const entrar = regra(css, 'main[data-motion="entrar"]')
  assert.equal(prop(entrar, "animation-duration"), "420ms")
  assert.equal(prop(entrar, "animation-timing-function"), "ease-out")
  const frames = regra(css, "@keyframes entrar")
  assert.match(frames, /opacity:\s*0/)
  assert.match(frames, /transform:\s*translateY\(16px\)/)
  assert.match(frames, /opacity:\s*1/)
  assert.match(frames, /transform:\s*translateY\(0\)/)
  assert.match(calculadora, /data-motion=\{tipo\}/)
  assert.match(intro, /data-motion=\{tipo\}/)
})

test("atraso 80ms por indice", () => {
  assert.equal(atrasoLista(0, 2), "0ms")
  assert.equal(atrasoLista(1, 2), "80ms")
  assert.equal(atrasoLista(2, 3), "160ms")
  assert.equal(atrasoLista(4, 1), "0ms")
  assert.match(lista, /atrasoLista\(index, projects\.length\)/)
  assert.match(calculadora, /atrasoLista\(index, colors\.length\)/)
})

test("troca de rota em 200ms", () => {
  assert.equal(tipoMontagem(), "entrar")
  marcarPaginaVista()
  assert.equal(tipoMontagem(), "troca")
  assert.equal(prop(regra(css, 'main[data-motion="troca"]'), "animation-duration"), "200ms")
  const rotas = [
    ["/", "src/app/page.tsx"],
    ["/projetos", "src/app/projetos/page.tsx"],
    ["/configuracoes", "src/app/configuracoes/page.tsx"],
  ]
  for (const [rota, arquivo] of rotas) {
    const pagina = fonte(arquivo)
    assert.ok(rota.startsWith("/"))
    if (rota === "/") assert.match(pagina, /Calculadora/)
    else assert.match(pagina, /PageIntro/)
  }
  assert.match(calculadora, /useMovimento/)
  assert.match(intro, /useMovimento/)
  assert.match(calculadora, /data-motion=\{tipo\}/)
  assert.match(intro, /data-motion=\{tipo\}/)
})

test("reduced motion 0ms", () => {
  const reduce = regra(css, "@media (prefers-reduced-motion: reduce)")
  for (const seletor of ['main[data-motion="entrar"]', 'main[data-motion="troca"]', ".item-lista"]) {
    assert.equal(prop(regra(reduce, seletor), "animation-duration"), "0ms", seletor)
  }
  assert.equal(prop(regra(reduce, ".item-lista"), "animation-delay"), "0ms")
})

test("so opacity e transform", () => {
  for (const nome of ["entrar", "troca"]) {
    const props = propriedades(regra(css, `@keyframes ${nome}`))
    assert.ok(props.length > 0, nome)
    for (const item of props) assert.ok(item === "opacity" || item === "transform", `${nome} ${item}`)
  }
  const entrar = propriedades(regra(css, "@keyframes entrar"))
  assert.ok(entrar.includes("opacity"))
  assert.ok(entrar.includes("transform"))
  const troca = propriedades(regra(css, "@keyframes troca"))
  assert.ok(troca.includes("opacity"))
  assert.deepEqual(troca.filter((item) => item !== "opacity" && item !== "transform"), [])
})
