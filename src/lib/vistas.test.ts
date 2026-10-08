import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import {
  DESCRICAO_CONFIG_LENDO,
  DESCRICAO_PROJETOS_LENDO,
  FRASE_AUSENTE,
  FRASE_GRAVADO,
  FRASE_GRAVAR,
  LEDE_CONFIG,
  LEDE_PROJETOS,
  TEXTO_LENDO,
  TITULO_ERRO,
  TITULO_VAZIO,
  frasesCalculadora,
  vistaCarregamento,
} from "./vistas.ts"

const root = path.resolve(import.meta.dirname, "../..")

function fonte(relativo: string) {
  return fs.readFileSync(path.join(root, relativo), "utf8")
}

test("tres telas lendo", () => {
  for (const tela of ["calculadora", "projetos", "configuracoes"] as const) {
    const vista = vistaCarregamento(tela, "lendo")
    assert.equal(vista.titulo, TEXTO_LENDO)
    assert.equal(vista.titulo, "Lendo impressoras e projetos.")
  }
  assert.match(fonte("src/components/calculadora.tsx"), /vistaCarregamento\("calculadora", "lendo"\)/)
  assert.match(fonte("src/components/lista-projetos.tsx"), /vistaCarregamento\("projetos", "lendo"\)/)
  assert.match(fonte("src/components/configuracoes-form.tsx"), /vistaCarregamento\("configuracoes", "lendo"\)/)
})

test("tres telas sem banco", () => {
  for (const tela of ["calculadora", "projetos", "configuracoes"] as const) {
    const vista = vistaCarregamento(tela, "erro")
    assert.equal(vista.titulo, TITULO_ERRO)
    assert.equal(vista.titulo, "Não deu para ler o banco.")
    assert.equal(vista.mostraVazio, false)
    assert.equal(vista.mostraFormulario, false)
    assert.notEqual(vista.titulo, TITULO_VAZIO)
  }
  const lista = fonte("src/components/lista-projetos.tsx")
  const config = fonte("src/components/configuracoes-form.tsx")
  const calculadora = fonte("src/components/calculadora.tsx")
  assert.ok(lista.indexOf('vistaCarregamento("projetos", "erro")') < lista.indexOf("Nenhum projeto salvo"))
  assert.ok(config.indexOf('vistaCarregamento("configuracoes", "erro")') < config.indexOf("Potência (W)"))
  assert.match(calculadora, /vistaCarregamento\("calculadora", "erro"\)/)
  assert.doesNotMatch(calculadora, /Adicionar impressora/)
})

test("lede de projetos", () => {
  assert.equal(
    LEDE_PROJETOS,
    "Lotes gravados no banco: modo, cópias, tempo, mão de obra e cores. A tarifa fica na impressora, então o total acompanha a máquina. Abrir marca a impressora do projeto."
  )
  assert.match(fonte("src/app/projetos/page.tsx"), /LEDE_PROJETOS/)
})

test("lede de configuracoes", () => {
  assert.equal(
    LEDE_CONFIG,
    "A K2 Pro já vem preenchida: 150 W, R$ 1,18 por kWh, R$ 7.979 e 3.000 horas. Dá para ter mais de uma máquina; a calculadora usa a marcada. A tarifa fica na impressora, no banco deste computador."
  )
  assert.match(fonte("src/app/configuracoes/page.tsx"), /LEDE_CONFIG/)
})

test("frase gravar o lote", () => {
  assert.equal(frasesCalculadora("novo").gravar, FRASE_GRAVAR)
  assert.equal(frasesCalculadora("novo").gravar, "Gravar o lote deixa o projeto no banco.")
  assert.match(fonte("src/components/calculadora.tsx"), /frases\.gravar/)
})

test("projeto ausente no banco", () => {
  assert.equal(frasesCalculadora("ausente").ausente, FRASE_AUSENTE)
  assert.equal(frasesCalculadora("ausente").ausente, "Esse projeto não está no banco. Salvar cria um novo.")
  assert.equal(frasesCalculadora("gravado").ausente, null)
  assert.match(fonte("src/components/calculadora.tsx"), /frases\.ausente/)
})

test("projeto gravado no banco", () => {
  assert.equal(frasesCalculadora("gravado").descricao, FRASE_GRAVADO)
  assert.equal(frasesCalculadora("gravado").descricao, "Gravado no banco. Salvar de novo atualiza este projeto.")
  assert.match(fonte("src/components/calculadora.tsx"), /frases\.descricao/)
})

test("configuracoes lendo o banco", () => {
  const vista = vistaCarregamento("configuracoes", "lendo")
  assert.equal(vista.descricao, DESCRICAO_CONFIG_LENDO)
  assert.equal(vista.descricao, "As impressoras ficam no banco deste computador, sem conta.")
  assert.match(fonte("src/components/configuracoes-form.tsx"), /vista\.descricao/)
})

test("projetos lendo o banco", () => {
  const vista = vistaCarregamento("projetos", "lendo")
  assert.equal(vista.descricao, DESCRICAO_PROJETOS_LENDO)
  assert.equal(vista.descricao, "Os projetos ficam no banco deste computador, sem conta.")
  assert.match(fonte("src/components/lista-projetos.tsx"), /vista\.descricao/)
})
