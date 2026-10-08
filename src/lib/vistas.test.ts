import "./resolver-ts.ts"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { calculate, draftToCalcInput, errosAoGravar, type MesaDraft } from "./custo.ts"
import type { Project } from "./projetos-store.ts"

const { ganharMesa, perderMesa } = await import("./projetos-store.ts")
const {
  AVISO_COPIAS_PRODUTO,
  DESCRICAO_CONFIG_LENDO,
  DESCRICAO_PROJETOS_LENDO,
  FRASE_AUSENTE,
  FRASE_GRAVADO,
  FRASE_GRAVAR,
  FRASE_MESAS,
  FRASE_VARIAS_CORES,
  LEGENDA_LOTE,
  LEDE_CONFIG,
  LEDE_PROJETOS,
  ROTULO_MAO_DE_OBRA,
  TEXTO_LENDO,
  TITULO_ERRO,
  TITULO_VAZIO,
  avisoCopiasProduto,
  descricaoProjeto,
  fichaCalculadora,
  frasesCalculadora,
  textoDeTotal,
  vistaCarregamento,
} = await import("./vistas.ts")

const root = path.resolve(import.meta.dirname, "../..")

function fonte(relativo: string) {
  return fs.readFileSync(path.join(root, relativo), "utf8")
}

test("configuracoes lendo desta conta", () => {
  const vista = vistaCarregamento("configuracoes", "lendo")
  assert.equal(vista.descricao, "As impressoras desta conta ficam no banco deste computador.")
})

test("projetos lendo desta conta", () => {
  const vista = vistaCarregamento("projetos", "lendo")
  assert.equal(vista.descricao, "Os projetos desta conta ficam no banco deste computador.")
})

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
  assert.equal(vista.descricao, "As impressoras desta conta ficam no banco deste computador.")
  assert.match(fonte("src/components/configuracoes-form.tsx"), /vista\.descricao/)
})

const mil = { watts: "1000", energyPrice: "1", printerPrice: "1000", lifeHours: "1000" }

function mesa(overrides: Partial<MesaDraft> = {}): MesaDraft {
  return { id: "m1", hours: "1", minutes: "0", name: "PLA preto", hex: "#111111", price: "0", grams: "0", ...overrides }
}

function projetoVista(overrides: Partial<Project> = {}): Project {
  return {
    id: "p1",
    name: "Suporte",
    printerId: "k2-pro",
    mode: "peca",
    copies: "1",
    hours: "",
    minutes: "",
    labor: "0",
    colorMode: "unica",
    grams: "",
    colors: [],
    mesas: [],
    updatedAt: 10,
    ...overrides,
  }
}

test("copias invalidas bloqueiam o lote", () => {
  for (const copies of ["", "0", "2,5"]) {
    assert.equal(avisoCopiasProduto(copies), AVISO_COPIAS_PRODUTO)
    assert.equal(
      avisoCopiasProduto(copies),
      "Custo do lote bloqueado. Cópias do produto precisa ser um inteiro maior que zero."
    )
  }
  assert.equal(avisoCopiasProduto("1"), null)
  assert.equal(avisoCopiasProduto("2"), null)
  assert.match(fonte("src/components/calculadora.tsx"), /avisoCopiasProduto/)
})

test("calculadora mostra os campos da mesa", () => {
  const calculadora = fonte("src/components/calculadora.tsx")
  for (const campo of ["mesa.hours", "mesa.minutes", "mesa.name", "mesa.hex", "mesa.price", "mesa.grams"]) {
    assert.match(calculadora, new RegExp(campo.replace(".", "\\.")))
  }
  const mesas = [
    mesa({ hours: "1", minutes: "0", name: "PLA preto", hex: "#111111", price: "100", grams: "10" }),
    mesa({ id: "m2", hours: "2", minutes: "15", name: "PETG", hex: "#222222", price: "80", grams: "20" }),
  ]
  assert.equal(mesas[0]?.name, "PLA preto")
  assert.equal(mesas[1]?.name, "PETG")
  assert.deepEqual(
    mesas.map((item) => [item.hours, item.minutes, item.name, item.hex, item.price, item.grams]),
    [
      ["1", "0", "PLA preto", "#111111", "100", "10"],
      ["2", "15", "PETG", "#222222", "80", "20"],
    ]
  )
})

test("recusa mesa em varias cores", () => {
  assert.equal(FRASE_VARIAS_CORES, "Esta impressão tem várias cores num tempo só. A mesa leva uma cor.")
  const recusa = ganharMesa(
    projetoVista({
      colors: [
        { id: "a", name: "A", hex: "#111111", price: "100", grams: "10" },
        { id: "b", name: "B", hex: "#222222", price: "80", grams: "20" },
      ],
    }),
    "nova"
  )
  assert.equal(recusa.status, "recusado")
  assert.match(fonte("src/components/calculadora.tsx"), /FRASE_VARIAS_CORES/)
})

test("totais em traco com mesa aberta", () => {
  const result = calculate(
    draftToCalcInput(
      {
        mode: "peca",
        copies: "1",
        hours: "",
        minutes: "",
        labor: "0",
        colorMode: "unica",
        grams: "",
        colors: [],
        mesas: [mesa({ price: "100", grams: "10" }), mesa({ id: "aberta", hours: "", minutes: "", price: "", grams: "" })],
      },
      mil
    )
  )
  assert.equal(result.piece.total, null)
  assert.equal(result.lot.total, null)
  assert.equal(textoDeTotal(result.piece.total), "—")
  assert.equal(textoDeTotal(result.lot.total), "—")
  assert.match(fonte("src/components/calculadora.tsx"), /textoDeTotal/)
})

test("lista duas mesas", () => {
  const linha = descricaoProjeto(projetoVista({ mesas: [mesa(), mesa({ id: "m2" })], copies: "4", labor: "30" })).linha
  assert.equal(linha, "2 mesas · 4 cópias do produto · mão de obra 30%")
  assert.match(fonte("src/components/lista-projetos.tsx"), /descricaoProjeto/)
})

test("lista uma mesa", () => {
  const linha = descricaoProjeto(projetoVista({ mesas: [mesa()] })).linha
  assert.match(linha, /1 mesa/)
  assert.equal(linha.includes("1 mesas"), false)
})

test("lista de mesas sem sem cores", () => {
  const descricao = descricaoProjeto(projetoVista({ mesas: [mesa(), mesa({ id: "m2" })] }))
  assert.equal(descricao.linha.includes("sem cores"), false)
  assert.equal(descricao.linha.includes("tempo incompleto"), false)
  assert.equal(descricao.legenda, LEGENDA_LOTE)
  assert.equal(descricao.legenda, "lote, tarifa atual")
  assert.match(fonte("src/components/lista-projetos.tsx"), /parts\.legenda/)
})

test("lista sem mesas nao conta mesa", () => {
  const linha = descricaoProjeto(
    projetoVista({ name: "Suporte", mode: "lote", copies: "4", hours: "2", minutes: "15", labor: "30", mesas: [] })
  ).linha
  assert.equal(linha.includes("mesa"), false)
})

test("frase de projeto ausente", () => {
  assert.equal(frasesCalculadora("ausente").ausente, FRASE_AUSENTE)
  assert.equal(frasesCalculadora("ausente").ausente, "Esse projeto não está no banco. Salvar cria um novo.")
  const calculadora = fonte("src/components/calculadora.tsx")
  assert.match(calculadora, /missing && projectId/)
  assert.match(calculadora, /frases\.ausente/)
})

test("rotulos de mao de obra e copias", () => {
  const ficha = fichaCalculadora(true, "peca")
  assert.equal(ficha.maoDeObra, ROTULO_MAO_DE_OBRA)
  assert.equal(ficha.maoDeObra, "Mão de obra (%)")
  assert.equal(ficha.copias, "Cópias do produto")
  assert.match(fonte("src/components/calculadora.tsx"), /ficha\.maoDeObra/)
  assert.match(fonte("src/components/calculadora.tsx"), /ficha\.copias/)
})

test("sem modos da impressao unica", () => {
  const modos = fichaCalculadora(true, "lote").modos
  for (const modo of ["Uma peça", "O lote inteiro", "Uma cor", "Várias cores"]) {
    assert.equal(modos.includes(modo), false, modo)
  }
  assert.match(fonte("src/components/calculadora.tsx"), /ficha\.modos\.length > 0/)
})

test("modos da impressao unica", () => {
  const modos = fichaCalculadora(false, "peca").modos
  for (const modo of ["Uma peça", "O lote inteiro", "Uma cor", "Várias cores"]) {
    assert.equal(modos.includes(modo), true, modo)
  }
})

test("frase de cada mesa", () => {
  assert.equal(
    FRASE_MESAS,
    "Cada mesa é uma chapa: um tempo e um filamento. A peça soma as mesas. As cópias multiplicam o produto."
  )
  assert.equal(fichaCalculadora(true, "peca").frase, FRASE_MESAS)
  assert.match(fonte("src/components/calculadora.tsx"), /ficha\.frase/)
})

test("lista recalcula com a tarifa", () => {
  const project = projetoVista({
    copies: "1",
    labor: "0",
    mesas: [mesa({ id: "a" }), mesa({ id: "b" })],
  })
  assert.equal(calculate(draftToCalcInput(project, mil)).lot.total, 4)
  assert.equal(calculate(draftToCalcInput(project, { ...mil, energyPrice: "2" })).lot.total, 6)
  assert.match(fonte("src/components/lista-projetos.tsx"), /draftToCalcInput/)
})

test("gravar mesa campo vazio", () => {
  const cheia = mesa({ id: "a", hours: "1", minutes: "0", price: "10", grams: "10" })
  const base = {
    mode: "peca" as const,
    copies: "1",
    hours: "",
    minutes: "",
    labor: "0",
    colorMode: "unica" as const,
    grams: "",
    colors: [],
    mesas: [cheia],
  }
  const campoParaId = { hours: "a-horas", minutes: "a-minutos", price: "a-preco", grams: "a-peso" } as const
  for (const campo of ["hours", "minutes", "price", "grams"] as const) {
    const erros = errosAoGravar({ ...base, mesas: [{ ...cheia, [campo]: "" }] })
    assert.equal(erros[campoParaId[campo]], "Campo vazio.")
  }
  assert.equal(errosAoGravar({ ...base, copies: "" }).copias, "Campo vazio.")
  assert.equal(errosAoGravar({ ...base, labor: "" })["mao-de-obra"], "Campo vazio.")
  assert.match(fonte("src/components/calculadora.tsx"), /errosAoGravar/)
})

test("gravar mesa numero invalido", () => {
  const cheia = mesa({ id: "a", hours: "1", minutes: "0", price: "10", grams: "10" })
  const base = {
    mode: "peca" as const,
    copies: "1",
    hours: "",
    minutes: "",
    labor: "0",
    colorMode: "unica" as const,
    grams: "",
    colors: [],
    mesas: [cheia],
  }
  const campoParaId = { hours: "a-horas", minutes: "a-minutos", price: "a-preco", grams: "a-peso" } as const
  for (const campo of ["hours", "minutes", "price", "grams"] as const) {
    const erros = errosAoGravar({ ...base, mesas: [{ ...cheia, [campo]: "-1" }] })
    assert.equal(erros[campoParaId[campo]], "Use zero ou um número positivo.")
  }
  assert.equal(errosAoGravar({ ...base, copies: "-1" }).copias, "Use zero ou um número positivo.")
  assert.equal(errosAoGravar({ ...base, labor: "-1" })["mao-de-obra"], "Use zero ou um número positivo.")
})

test("remover mesa sem confirmar", () => {
  const calculadora = fonte("src/components/calculadora.tsx")
  assert.match(calculadora, /mesa-remover-/)
  assert.doesNotMatch(calculadora, /confirmar-apagar/)
  const depois = perderMesa(
    projetoVista({
      copies: "2",
      mesas: [mesa({ id: "sai" }), mesa({ id: "fica" })],
    }),
    "sai"
  )
  assert.equal(depois.mesas?.some((item) => item.id === "sai"), false)
  assert.equal(depois.mesas?.some((item) => item.id === "fica"), true)
})

test("frases da impressao unica", () => {
  const lote = fichaCalculadora(false, "lote")
  const peca = fichaCalculadora(false, "peca")
  assert.equal(lote.copias, "Cópias na mesa")
  assert.equal(lote.peso?.includes("Peso da mesa"), true)
  assert.equal(peca.peso?.includes("Peso da peça"), true)
  assert.match(fonte("src/components/calculadora.tsx"), /ficha\.copias/)
  assert.match(fonte("src/components/calculadora.tsx"), /ficha\.peso/)
})

test("mesas sem frases da chapa", () => {
  const ficha = fichaCalculadora(true, "lote")
  assert.equal(ficha.copias?.includes("Cópias na mesa"), false)
  assert.equal(ficha.peso, null)
  assert.equal(String(ficha.peso ?? "").includes("Peso da mesa"), false)
})

test("projetos lendo o banco", () => {
  const vista = vistaCarregamento("projetos", "lendo")
  assert.equal(vista.descricao, DESCRICAO_PROJETOS_LENDO)
  assert.equal(vista.descricao, "Os projetos desta conta ficam no banco deste computador.")
  assert.match(fonte("src/components/lista-projetos.tsx"), /vista\.descricao/)
})
