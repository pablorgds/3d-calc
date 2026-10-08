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
const escuro = regra(css, ".dark")
const botoes = fonte("src/components/ui/button.tsx")
const numero = fonte("src/components/number-field.tsx")

test("fundo e texto escuros", () => {
  assert.equal(prop(escuro, "--background"), "#1A1A1A")
  assert.equal(prop(escuro, "--foreground"), "#FFFFFF")
  const body = regra(css, "body")
  assert.equal(prop(body, "background"), "var(--background)")
  assert.equal(prop(body, "color"), "var(--foreground)")
})

test("botao primario escuro", () => {
  assert.match(botoes, /default:\s*"btn-primario/)
  const botao = regra(css, "html .btn-primario")
  assert.equal(prop(botao, "background"), "var(--primary)")
  assert.equal(prop(botao, "color"), "var(--primary-foreground)")
  assert.equal(prop(escuro, "--primary"), "#FFFFFF")
  assert.equal(prop(escuro, "--primary-foreground"), "#1A1A1A")
  assert.equal(prop(botao, "font-weight"), "600")
  assert.equal(prop(botao, "padding"), "12px")
  assert.equal(prop(botao, "border-radius"), "0")
  assert.equal(prop(botao, "min-height"), "44px")
})

test("hover do primario escuro", () => {
  const hover = regra(css, "html.dark .btn-primario:hover")
  assert.equal(prop(hover, "background"), "#EBEBEB")
  assert.equal(prop(hover, "box-shadow"), "0 4px 12px rgba(0,0,0,0.12)")
  const transicao = prop(regra(css, "html .btn-primario"), "transition")
  assert.match(transicao, /background-color 200ms ease-out/)
  assert.match(transicao, /box-shadow 200ms ease-out/)
})

test("botao outline escuro", () => {
  assert.match(botoes, /outline:\s*"btn-outline/)
  const botao = regra(css, "html .btn-outline")
  assert.equal(prop(botao, "border"), "1.5px solid #808080")
  assert.equal(prop(botao, "color"), "var(--foreground)")
  assert.equal(prop(escuro, "--foreground"), "#FFFFFF")
  assert.equal(prop(botao, "border-radius"), "0")
  assert.equal(prop(regra(css, "html.dark .btn-outline:hover"), "background"), "#2E2E2E")
})

test("botao ghost escuro", () => {
  assert.match(botoes, /ghost:\s*"btn-ghost/)
  const botao = regra(css, "html .btn-ghost")
  assert.equal(prop(botao, "border-width"), "0")
  assert.equal(prop(botao, "color"), "var(--foreground)")
  assert.equal(prop(escuro, "--foreground"), "#FFFFFF")
  assert.equal(prop(botao, "border-radius"), "0")
  assert.equal(prop(regra(css, "html.dark .btn-ghost:hover"), "background"), "#2E2E2E")
})

test("card escuro", () => {
  const card = regra(css, 'html [data-slot="card"]')
  assert.equal(prop(card, "background"), "var(--card)")
  assert.equal(prop(escuro, "--card"), "#242424")
  assert.equal(prop(card, "border-radius"), "0")
  assert.equal(prop(card, "border"), "1px solid #808080")
  assert.equal(prop(card, "box-shadow"), "0 2px 12px rgba(0,0,0,0.06)")
})

test("muted escuro D6D6D6", () => {
  assert.equal(prop(escuro, "--muted"), "#2E2E2E")
  assert.equal(prop(escuro, "--muted-foreground"), "#D6D6D6")
  assert.equal(prop(regra(css, "html .lavagem"), "background"), "var(--muted)")
  assert.match(css, /--color-muted-foreground:\s*var\(--muted-foreground\)/)
  assert.match(fonte("src/components/calculadora.tsx"), /text-muted-foreground/)
})

test("campo vazio no escuro", () => {
  assert.match(numero, /<p className="vazio-campo">Campo vazio\.<\/p>/)
  assert.equal(prop(regra(css, "html.dark .vazio-campo"), "color"), "#D6D6D6")
})

test("tokens escuros no dark", () => {
  const tokens: Record<string, string> = {
    "--background": "#1A1A1A",
    "--foreground": "#FFFFFF",
    "--primary": "#FFFFFF",
    "--primary-foreground": "#1A1A1A",
    "--card": "#242424",
    "--muted": "#2E2E2E",
    "--muted-foreground": "#D6D6D6",
  }
  for (const [nome, valor] of Object.entries(tokens)) {
    assert.equal(prop(escuro, nome), valor, nome)
  }
})
