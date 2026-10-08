import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"

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

const css = fonte("src/app/globals.css")
const layout = fonte("src/app/layout.tsx")
const calculadora = fonte("src/components/calculadora.tsx")
const intro = fonte("src/components/page-intro.tsx")
const header = fonte("src/components/site-header.tsx")
const projetos = fonte("src/app/projetos/page.tsx")
const configuracoes = fonte("src/app/configuracoes/page.tsx")
const ausente = fonte("src/app/not-found.tsx")

const telas = [
  { nome: "Calculadora", titulo: "Calculadora" },
  { nome: "Projetos", titulo: "Projetos" },
  { nome: "Configurações", titulo: "Configurações" },
  { nome: "Página não encontrada", titulo: "Página não encontrada" },
]

test("fundo e texto claros", () => {
  const htmlTag = layout.match(/<html\b[\s\S]*?>/)?.[0] ?? ""
  assert.doesNotMatch(htmlTag, /\bdark\b/)
  const raiz = regra(css, ":root")
  assert.equal(prop(raiz, "--background"), "#FFFFFF")
  assert.equal(prop(raiz, "--foreground"), "#1A1A1A")
  const body = regra(css, "body")
  assert.equal(prop(body, "background"), "var(--background)")
  assert.equal(prop(body, "color"), "var(--foreground)")
})

test("h1 2.25rem peso 700", () => {
  const titulo = regra(css, "html .titulo-pagina")
  assert.equal(prop(titulo, "font-size"), "2.25rem")
  assert.equal(prop(titulo, "font-weight"), "700")
  const h1Intro = [...intro.matchAll(/<h1\b[^>]*>/g)]
  assert.equal(h1Intro.length, 1)
  assert.match(h1Intro[0][0], /titulo-pagina/)
  const h1Calc = [...calculadora.matchAll(/<h1\b[^>]*>/g)]
  assert.ok(h1Calc.length >= 1)
  for (const h1 of h1Calc) assert.match(h1[0], /titulo-pagina/)
  for (const tela of [projetos, configuracoes, ausente]) {
    assert.match(tela, /PageIntro/)
  }
  for (const tela of telas) assert.ok(tela.nome)
})

test("lede 1rem 72ch", () => {
  const lede = regra(css, "html .lede")
  assert.equal(prop(lede, "font-size"), "1rem")
  assert.equal(prop(lede, "font-weight"), "400")
  assert.equal(prop(lede, "line-height"), "1.6")
  assert.equal(prop(lede, "max-width"), "72ch")
  const ledes = [...intro.matchAll(/<p\b[^>]*>/g)]
  assert.equal(ledes.length, 1)
  assert.match(ledes[0][0], /\blede\b/)
  assert.match(calculadora, /className="lede/)
  for (const tela of [projetos, configuracoes, ausente]) {
    assert.match(tela, /PageIntro/)
  }
})

test("titulo de card 1.5rem", () => {
  const titulo = regra(css, 'html [data-slot="card-title"]')
  assert.equal(prop(titulo, "font-size"), "1.5rem")
  assert.equal(prop(titulo, "font-weight"), "700")
  assert.match(fonte("src/components/ui/card.tsx"), /data-slot="card-title"/)
})

test("legenda 0.875rem peso 500", () => {
  const legenda = regra(css, "html .legenda")
  assert.equal(prop(legenda, "font-size"), "0.875rem")
  assert.equal(prop(legenda, "font-weight"), "500")
  assert.match(fonte("src/components/ui/card.tsx"), /legenda/)
  assert.match(calculadora, /className="legenda[^"]*"[^>]*>\{label\}/)
  assert.match(calculadora, /<p className="legenda[^"]*">Por peça<\/p>/)
  assert.match(calculadora, /<p className="legenda[^"]*">Lote<\/p>/)
  assert.match(calculadora, /<th className="legenda[^"]*">Peça<\/th>/)
  assert.match(calculadora, /<th className="legenda[^"]*">Lote<\/th>/)
  assert.match(calculadora, /<legend className="legenda/)
  assert.match(calculadora, /<h2 className="legenda/)
  assert.match(fonte("src/components/lista-projetos.tsx"), /className="legenda[^"]*">lote, tarifa atual/)
  assert.match(fonte("src/components/configuracoes-form.tsx"), /className="legenda/)
  assert.match(fonte("src/components/number-field.tsx"), /className="legenda/)
})

test("coluna 1280px padding 1.5rem", () => {
  const coluna = regra(css, ".coluna")
  assert.equal(prop(coluna, "max-width"), "1280px")
  assert.equal(prop(coluna, "padding-inline"), "1.5rem")
  assert.equal(prop(coluna, "margin-inline"), "auto")
  assert.match(header, /className="coluna/)
  assert.match(intro, /<main[^>]*\bcoluna\b/)
  const mains = [...calculadora.matchAll(/<main\b[^>]*>/g)]
  assert.ok(mains.length >= 1)
  for (const main of mains) assert.match(main[0], /\bcoluna\b/)
  for (const tela of [projetos, configuracoes, ausente]) {
    assert.match(tela, /PageIntro/)
  }
})

test("body min-height 100dvh", () => {
  assert.equal(prop(regra(css, "body"), "min-height"), "100dvh")
})

test("sem height 100vh", () => {
  const htmlTag = layout.match(/<html\b[\s\S]*?>/)?.[0] ?? ""
  const bodyTag = layout.match(/<body\b[\s\S]*?>/)?.[0] ?? ""
  assert.doesNotMatch(htmlTag, /100vh|h-screen/)
  assert.doesNotMatch(bodyTag, /100vh|h-screen/)
  assert.doesNotMatch(regra(css, "html"), /100vh/)
  assert.doesNotMatch(regra(css, "body"), /100vh/)
  assert.doesNotMatch(prop(regra(css, "body"), "min-height"), /100vh/)
})

test("cabecalho 1A1A1A borda 808080", () => {
  const barra = regra(css, ".site-header")
  assert.equal(prop(barra, "background"), "#1A1A1A")
  assert.equal(prop(barra, "color"), "#FFFFFF")
  assert.equal(prop(barra, "border-bottom"), "1px solid #808080")
  assert.match(header, /site-header/)
  assert.doesNotMatch(header, /text-primary/)
})

test("z-index do cabecalho 100", () => {
  assert.equal(prop(regra(css, ".site-header"), "z-index"), "100")
  assert.match(header, /site-header/)
})

test("z-index da barra de totais 100", () => {
  assert.equal(prop(regra(css, ".barra-totais"), "z-index"), "100")
  assert.match(calculadora, /barra-totais/)
})

test("vao depois do titulo 1.5rem", () => {
  assert.equal(prop(regra(css, ".cabecalho-pagina"), "margin-bottom"), "1.5rem")
  const cabecalhos = [...intro.matchAll(/<header\b[^>]*>/g)]
  assert.equal(cabecalhos.length, 1)
  assert.match(cabecalhos[0][0], /cabecalho-pagina/)
  const cabecalhosCalc = [...calculadora.matchAll(/<header\b[^>]*>/g)]
  assert.ok(cabecalhosCalc.length >= 1)
  for (const item of cabecalhosCalc) assert.match(item[0], /cabecalho-pagina/)
})

test("cards irmaos 1.5rem", () => {
  assert.equal(prop(regra(css, ".pilha"), "gap"), "1.5rem")
  assert.match(calculadora, /className="pilha"/)
  assert.match(fonte("src/components/lista-projetos.tsx"), /className="pilha"/)
  assert.match(fonte("src/components/configuracoes-form.tsx"), /className="pilha"/)
})

test("calculadora em coluna abaixo de 768", () => {
  assert.equal(prop(regra(css, ".grade-calculadora"), "grid-template-columns"), "minmax(0, 1fr)")
  assert.match(calculadora, /grade-calculadora/)
})

test("barra de totais visivel abaixo de 768", () => {
  assert.equal(prop(regra(css, ".barra-totais"), "display"), "grid")
  assert.match(calculadora, /barra-totais/)
})

test("calculadora lado a lado a partir de 768", () => {
  const larga = regra(css, "@media (min-width: 768px)")
  const grade = regra(larga, ".grade-calculadora")
  assert.equal(prop(grade, "grid-template-columns"), "minmax(0, 1fr) minmax(18rem, 22rem)")
})

test("barra de totais oculta a partir de 768", () => {
  const larga = regra(css, "@media (min-width: 768px)")
  assert.equal(prop(regra(larga, ".barra-totais"), "display"), "none")
})

test("projetos e configuracoes em uma coluna", () => {
  assert.match(intro, /coluna-unica/)
  assert.equal(prop(regra(css, ".coluna-unica"), "flex-direction"), "column")
  assert.doesNotMatch(regra(css, "@media (min-width: 768px)"), /\.coluna-unica/)
  assert.match(projetos, /PageIntro/)
  assert.match(configuracoes, /PageIntro/)
  assert.doesNotMatch(projetos, /grade-calculadora/)
  assert.doesNotMatch(configuracoes, /grade-calculadora/)
})

test("scroll igual ao viewport em 320", () => {
  assert.equal(prop(regra(css, "html"), "overflow-x"), "clip")
  assert.equal(prop(regra(css, "body"), "overflow-x"), "clip")
  assert.equal(prop(regra(css, ".coluna"), "width"), "100%")
  assert.equal(prop(regra(css, ".grade-calculadora"), "grid-template-columns"), "minmax(0, 1fr)")
  const larga = regra(css, "@media (min-width: 768px)")
  assert.match(larga, /minmax\(18rem,\s*22rem\)/)
  assert.doesNotMatch(regra(css, ".grade-calculadora"), /18rem/)
})

test("titulos das quatro telas", () => {
  assert.match(calculadora, />Calculadora</)
  assert.match(projetos, /title="Projetos"/)
  assert.match(configuracoes, /title="Configurações"/)
  assert.match(ausente, /title="Página não encontrada"/)
  for (const tela of telas) assert.ok(tela.titulo)
})

test("tokens claros no root", () => {
  assert.match(layout, /import\s+"\.\/globals\.css"/)
  const raiz = regra(css, ":root")
  const tokens: Record<string, string> = {
    "--background": "#FFFFFF",
    "--foreground": "#1A1A1A",
    "--primary": "#1A1A1A",
    "--primary-foreground": "#FFFFFF",
    "--muted": "#F5F1E8",
    "--muted-foreground": "#4A4A4A",
    "--border": "#808080",
    "--ring": "#B38B6D",
    "--card": "#FFFFFF",
    "--destructive": "#9B1C1C",
    "--radius": "0px",
  }
  for (const [nome, valor] of Object.entries(tokens)) {
    assert.equal(prop(raiz, nome), valor, nome)
  }
})
