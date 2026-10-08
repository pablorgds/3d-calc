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

function arquivos(dir: string): string[] {
  const saida: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) saida.push(...arquivos(full))
    else if (/\.(tsx|ts|css)$/.test(entry.name) && !entry.name.endsWith(".test.ts")) saida.push(full)
  }
  return saida
}

function campos(texto: string): string[] {
  const saida: string[] = []
  const abre = '<div className="campo'
  let from = 0
  while (from < texto.length) {
    const at = texto.indexOf(abre, from)
    if (at < 0) break
    const start = texto.indexOf(">", at)
    let depth = 1
    let i = start + 1
    while (i < texto.length && depth > 0) {
      if (texto.startsWith("</div>", i)) {
        depth -= 1
        if (depth === 0) {
          saida.push(texto.slice(start + 1, i))
          from = i + "</div>".length
          break
        }
        i += "</div>".length
      } else if (texto.startsWith("<div", i)) {
        depth += 1
        i += 4
      } else {
        i += 1
      }
    }
    if (depth !== 0) break
  }
  return saida
}

function canal(hex: string, indice: number) {
  const n = Number.parseInt(hex.slice(1 + indice * 2, 3 + indice * 2), 16) / 255
  return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4
}

function contraste(frente: string, fundo: string) {
  const luminancia = (hex: string) => {
    const [r, g, b] = [0, 1, 2].map((indice) => canal(hex, indice))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const clara = Math.max(luminancia(frente), luminancia(fundo))
  const escura = Math.min(luminancia(frente), luminancia(fundo))
  return (clara + 0.05) / (escura + 0.05)
}

const css = fonte("src/app/globals.css")
const layout = fonte("src/app/layout.tsx")
const botoes = fonte("src/components/ui/button.tsx")
const calculadora = fonte("src/components/calculadora.tsx")
const header = fonte("src/components/site-header.tsx")
const numero = fonte("src/components/number-field.tsx")
const lista = fonte("src/components/lista-projetos.tsx")

test("botao primario claro", () => {
  assert.match(botoes, /default:\s*"btn-primario/)
  const botao = regra(css, "html .btn-primario")
  assert.equal(prop(botao, "background"), "var(--primary)")
  assert.equal(prop(botao, "color"), "var(--primary-foreground)")
  assert.equal(prop(regra(css, ":root"), "--primary"), "#1A1A1A")
  assert.equal(prop(regra(css, ":root"), "--primary-foreground"), "#FFFFFF")
  assert.equal(prop(botao, "font-weight"), "600")
  assert.equal(prop(botao, "padding"), "12px")
  assert.equal(prop(botao, "border-radius"), "0")
  assert.equal(prop(botao, "min-height"), "44px")
})

test("hover do primario claro", () => {
  const hover = regra(css, "html:not(.dark) .btn-primario:hover")
  assert.equal(prop(hover, "background"), "#181818")
  assert.equal(prop(hover, "box-shadow"), "0 4px 12px rgba(0,0,0,0.12)")
  const transicao = prop(regra(css, "html .btn-primario"), "transition")
  assert.match(transicao, /background-color 200ms ease-out/)
  assert.match(transicao, /box-shadow 200ms ease-out/)
})

test("ativo desce 1px", () => {
  const ativo = regra(css, "html .btn-primario:active")
  assert.equal(prop(ativo, "transform"), "translateY(1px)")
  assert.doesNotMatch("html .btn-primario:active", /:not\(\.dark\)/)
  assert.doesNotMatch(css, /html\.dark \.btn-primario:active/)
})

test("botao outline claro", () => {
  assert.match(botoes, /outline:\s*"btn-outline/)
  const botao = regra(css, "html .btn-outline")
  assert.equal(prop(botao, "border"), "1.5px solid #808080")
  assert.equal(prop(botao, "color"), "var(--foreground)")
  assert.equal(prop(regra(css, ":root"), "--foreground"), "#1A1A1A")
  assert.equal(prop(botao, "border-radius"), "0")
  assert.equal(prop(regra(css, "html:not(.dark) .btn-outline:hover"), "background"), "#F5F1E8")
})

test("botao ghost claro", () => {
  assert.match(botoes, /ghost:\s*"btn-ghost/)
  const botao = regra(css, "html .btn-ghost")
  assert.equal(prop(botao, "border-width"), "0")
  assert.equal(prop(botao, "color"), "var(--foreground)")
  assert.equal(prop(regra(css, ":root"), "--foreground"), "#1A1A1A")
  assert.equal(prop(botao, "border-radius"), "0")
  assert.equal(prop(regra(css, "html:not(.dark) .btn-ghost:hover"), "background"), "#F5F1E8")
})

test("card claro", () => {
  const card = regra(css, 'html [data-slot="card"]')
  assert.equal(prop(card, "background"), "var(--card)")
  assert.equal(prop(regra(css, ":root"), "--card"), "#FFFFFF")
  assert.equal(prop(card, "border-radius"), "0")
  assert.equal(prop(card, "border"), "1px solid #808080")
  assert.equal(prop(card, "box-shadow"), "0 2px 12px rgba(0,0,0,0.06)")
  assert.match(fonte("src/components/ui/card.tsx"), /data-slot="card"/)
})

test("rotulo 0.875rem tracking 0.04em", () => {
  const rotulo = regra(css, 'html [data-slot="label"]')
  assert.equal(prop(rotulo, "font-size"), "0.875rem")
  assert.equal(prop(rotulo, "font-weight"), "500")
  assert.equal(prop(rotulo, "letter-spacing"), "0.04em")
  assert.equal(prop(regra(css, "html .campo"), "flex-direction"), "column")
  const blocos = [
    ...campos(numero),
    ...campos(calculadora),
    ...campos(fonte("src/components/configuracoes-form.tsx")),
  ]
  const comRotulo = blocos.filter((bloco) => bloco.includes("<Label"))
  assert.ok(comRotulo.length >= 4)
  for (const bloco of comRotulo) {
    const rotuloEm = bloco.indexOf("<Label")
    const controles = [bloco.indexOf("<Input"), bloco.indexOf("<input"), bloco.indexOf("<select")].filter(
      (indice) => indice >= 0
    )
    assert.ok(controles.length > 0)
    assert.ok(rotuloEm < Math.min(...controles))
  }
})

test("rotulo a 0.5rem do campo", () => {
  assert.equal(prop(regra(css, "html .campo"), "gap"), "0.5rem")
  assert.ok(campos(numero).length >= 1)
})

test("input raio 0 borda 808080", () => {
  const input = regra(css, 'html [data-slot="input"]')
  assert.equal(prop(input, "border-radius"), "0")
  assert.equal(prop(input, "border"), "1px solid #808080")
  assert.match(fonte("src/components/ui/input.tsx"), /data-slot="input"/)
})

test("anel de foco B38B6D", () => {
  const foco = regra(css, 'html [data-slot="input"]:focus-visible')
  assert.equal(prop(foco, "outline"), "2px solid var(--ring)")
  assert.equal(prop(foco, "outline-offset"), "2px")
  assert.equal(prop(regra(css, ":root"), "--ring"), "#B38B6D")
})

test("numero invalido 9B1C1C", () => {
  assert.match(numero, /<p className="erro-campo">Use zero ou um número positivo\.<\/p>/)
  assert.ok(numero.indexOf("<Input") < numero.indexOf("Use zero ou um número positivo."))
  const erro = regra(css, "html .erro-campo")
  assert.equal(prop(erro, "color"), "#9B1C1C")
  assert.equal(prop(erro, "font-size"), "0.875rem")
})

test("nome vazio ao gravar", () => {
  assert.match(calculadora, /Dê um nome para gravar o lote\./)
  assert.match(calculadora, /<p className="erro-campo">\{nameError\}<\/p>/)
  assert.ok(calculadora.indexOf('data-testid="nome-projeto"') < calculadora.indexOf('<p className="erro-campo">{nameError}</p>'))
  const erro = regra(css, "html .erro-campo")
  assert.equal(prop(erro, "color"), "#9B1C1C")
  assert.equal(prop(erro, "font-size"), "0.875rem")
})

test("campo vazio no claro", () => {
  assert.match(numero, /<p className="vazio-campo">Campo vazio\.<\/p>/)
  assert.ok(numero.indexOf("<Input") < numero.indexOf("Campo vazio."))
  assert.equal(prop(regra(css, "html:not(.dark) .vazio-campo"), "color"), "#4A4A4A")
})

test("nav ativo peso 500 traco B38B6D", () => {
  const ativo = regra(css, 'html .nav-link[aria-current="page"]')
  assert.equal(prop(ativo, "font-weight"), "500")
  assert.equal(prop(ativo, "box-shadow"), "inset 0 -2px 0 0 #B38B6D")
  assert.match(header, /aria-current=\{active \? "page" : undefined\}/)
  assert.match(header, /className="nav-link"/)
})

test("wordmark custo/chapa", () => {
  const marca = regra(css, "html .wordmark")
  assert.match(prop(marca, "font-family"), /var\(--font-geist-sans\)/)
  assert.doesNotMatch(prop(marca, "font-family"), /geist-mono/)
  assert.equal(prop(marca, "font-weight"), "700")
  assert.equal(prop(marca, "color"), "#FFFFFF")
  assert.match(header, /className="wordmark">\s*custo\/chapa\s*<\/Link>/)
})

test("modo marcado borda B38B6D", () => {
  assert.equal(prop(regra(css, "html .modo-marcado"), "border"), "2px solid #B38B6D")
  assert.match(calculadora, /modo-marcado/)
})

test("figuras em geist mono", () => {
  assert.equal(prop(regra(css, "html .figura"), "font-family"), "var(--font-geist-mono)")
  assert.match(layout, /"--font-geist-sans"/)
  assert.match(layout, /"--font-geist-mono"/)
  assert.match(calculadora, /<p className="figura" data-testid=\{`total-\$\{testPrefix\}`\}>/)
  assert.match(calculadora, /<p className="figura" data-testid=\{`tempo-\$\{testPrefix\}`\}>/)
  assert.match(calculadora, /<td className="figura py-2 text-right" data-testid=\{`\$\{testId\}-peca`\}>/)
  assert.match(calculadora, /<td className="figura py-2 text-right" data-testid=\{`\$\{testId\}-lote`\}>/)
  assert.match(calculadora, /<p className="figura">\{showMoney\(result\.piece\.total\)\}<\/p>/)
  assert.match(calculadora, /<span className="figura">\{color\.invalid \? "inválida" : showMoney\(color\.material\)\}<\/span>/)
  assert.match(calculadora, /kind="grams"/)
  assert.match(lista, /<span className="figura">\{parts\.time\}<\/span>/)
  assert.match(lista, /<span className="figura">\{total === null \? "Total incompleto" : formatBRL\(total\)\}<\/span>/)
})

test("amostra de cor circular", () => {
  assert.equal(prop(regra(css, "html .amostra-cor"), "border-radius"), "50%")
  assert.match(calculadora, /className="amostra-cor[^"]*" style=\{\{ background: color\.hex \}\}/)
})

test("taupe so no traco no modo e no anel", () => {
  const papeis = new Set<string>()
  const fontes = [
    ...arquivos(path.join(root, "src/app")),
    ...arquivos(path.join(root, "src/components")),
  ]
  for (const arquivo of fontes) {
    const texto = fs.readFileSync(arquivo, "utf8")
    const re = /#B38B6D/gi
    for (const match of texto.matchAll(re)) {
      const index = match.index ?? 0
      const linha = texto.slice(texto.lastIndexOf("\n", index) + 1, texto.indexOf("\n", index))
      const antes = texto.slice(0, index)
      const abre = antes.lastIndexOf("{")
      const seletor = antes.slice(0, abre).slice(antes.slice(0, abre).lastIndexOf("\n") + 1).trim()
      let papel = ""
      if (linha.includes("--ring")) papel = "anel"
      else if (seletor.includes("nav-link")) papel = "traco"
      else if (seletor.includes("modo-marcado")) papel = "modo"
      assert.ok(papel, `${arquivo}: ${linha.trim()}`)
      papeis.add(papel)
    }
  }
  assert.deepEqual([...papeis].sort(), ["anel", "modo", "traco"])
})

test("contraste 7 para 1", () => {
  const pares = [
    ["#1A1A1A", "#FFFFFF"],
    ["#4A4A4A", "#FFFFFF"],
    ["#4A4A4A", "#F5F1E8"],
    ["#FFFFFF", "#1A1A1A"],
    ["#D6D6D6", "#1A1A1A"],
    ["#9B1C1C", "#FFFFFF"],
  ]
  for (const [frente, fundo] of pares) {
    assert.ok(contraste(frente, fundo) >= 7, `${frente} sobre ${fundo}`)
  }
})

test("lavagem muted F5F1E8", () => {
  assert.equal(prop(regra(css, ":root"), "--muted"), "#F5F1E8")
  assert.equal(prop(regra(css, "html .lavagem"), "background"), "var(--muted)")
  for (const arquivo of [
    ...arquivos(path.join(root, "src/app")),
    ...arquivos(path.join(root, "src/components")),
  ]) {
    assert.doesNotMatch(fs.readFileSync(arquivo, "utf8"), /bg-muted\//, arquivo)
  }
})

test("texto destructive 9B1C1C", () => {
  assert.match(botoes, /destructive:\s*"btn-destructive/)
  assert.equal(prop(regra(css, "html .btn-destructive"), "color"), "#9B1C1C")
})

test("interface sem emoji", () => {
  const emoji = /\p{Extended_Pictographic}/u
  for (const arquivo of [
    ...arquivos(path.join(root, "src/app")),
    ...arquivos(path.join(root, "src/components")),
  ]) {
    assert.equal(emoji.test(fs.readFileSync(arquivo, "utf8")), false, arquivo)
  }
})
