"use client"

import { useEffect, useState, type CSSProperties } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NumberField, numberFieldIssue } from "@/components/number-field"
import { useMovimento } from "@/components/movimento"
import {
  calculate,
  draftToCalcInput,
  errosAoGravar,
  formatDuration,
  formatGrams,
  type Amount,
  type CalcResult,
  type ColorDraft,
  type ColorMode,
  type EntryMode,
  type MesaDraft,
} from "@/lib/custo"
import { setActivePrinter, useLeitura, usePrinterStore } from "@/lib/impressora"
import { activePrinterOf } from "@/lib/impressora-store"
import { addMesa as gravarMesa, removeMesa as apagarMesa, writeProject, type Project } from "@/lib/projetos"
import { ganharMesa, idAoSalvar, perderMesa } from "@/lib/projetos-store"
import {
  avisoCopiasProduto,
  fichaCalculadora,
  FRASE_VARIAS_CORES,
  frasesCalculadora,
  textoDeTotal,
  vistaCarregamento,
} from "@/lib/vistas"
import { atrasoLista, type TipoMontagem } from "@/lib/movimento"

const swatches = ["#78716c", "#57534e", "#a8a29e", "#44403c"]

function showMoney(value: Amount) {
  return textoDeTotal(value)
}

function showTime(value: Amount) {
  return value === null ? "—" : formatDuration(value)
}

function showGrams(value: Amount) {
  return value === null ? "—" : formatGrams(value)
}

function resultNotes(result: CalcResult, mode: EntryMode): string[] {
  const notes: string[] = []
  if (result.materialIssue === "no-colors") {
    notes.push("Nenhuma cor de filamento. O material entra como R$ 0,00.")
  }
  if (result.materialIssue === "invalid-color") {
    notes.push("Há cor com preço ou peso vazio ou inválido. O material sai do total até corrigir.")
  }
  if (result.lifeIssue === "zero") {
    notes.push(
      "Depreciação fora da conta: a vida útil em Configurações está em 0. Ela não vira 1 hora. O valor usado é R$ 0,00."
    )
  }
  if (result.lifeIssue === "empty") {
    notes.push("Depreciação fora da conta: preencha a vida útil em Configurações. Campo vazio não vira 1.")
  }
  if (result.lifeIssue === "invalid") {
    notes.push("Vida útil inválida em Configurações. Use um número de horas maior que zero.")
  }
  if (result.timeIssue === "empty") {
    notes.push("Tempo vazio. Energia e depreciação ficam sem cálculo.")
  }
  if (result.timeIssue === "invalid") {
    notes.push("Tempo inválido. Use zero ou um número positivo.")
  }
  if (result.energyIssue === "empty") {
    notes.push("Potência ou preço do kWh está vazio em Configurações. A energia não foi calculada.")
  }
  if (result.energyIssue === "invalid") {
    notes.push("Potência ou preço do kWh inválido em Configurações.")
  }
  if (result.printerPriceIssue !== "none" && result.timeIssue === "none" && result.lifeIssue === "none") {
    notes.push("Preço da impressora vazio ou inválido em Configurações. A depreciação não foi calculada.")
  }
  if (result.laborIssue === "empty") {
    notes.push("Percentual de mão de obra vazio. O acréscimo não foi aplicado.")
  }
  if (result.laborIssue === "invalid") {
    notes.push("Percentual de mão de obra inválido.")
  }
  if (!result.mesas && mode === "lote" && result.piece.blockedByCopies) {
    notes.push("Custo por peça bloqueado. No modo lote, cópias precisa ser maior que zero.")
  }
  if (!result.mesas && mode === "peca" && result.lot.blockedByCopies) {
    notes.push("Custo do lote bloqueado. Informe as cópias com um inteiro a partir de zero.")
  }
  if (!result.mesas && mode === "peca") {
    notes.push("Peça única: não há cópias na mesa. O lote é esta mesma peça.")
  }
  return notes
}

function ColorEditor({
  color,
  onChange,
  onRemove,
  priceError,
  gramsError,
  showGrams,
}: {
  color: ColorDraft
  onChange: (id: string, patch: Partial<ColorDraft>) => void
  onRemove: (id: string) => void
  priceError: string | null
  gramsError: string | null
  showGrams: boolean
}) {
  return (
    <div className="grid gap-3 rounded-lg border p-3" data-testid={`cor-${color.id}`}>
      <div className="flex items-end gap-3">
        <div className="campo">
          <Label htmlFor={`${color.id}-hex`}>Cor</Label>
          <input
            id={`${color.id}-hex`}
            type="color"
            value={color.hex}
            onChange={(event) => onChange(color.id, { hex: event.target.value })}
            className="size-11 cursor-pointer rounded-md border bg-transparent p-1"
            aria-label="Cor do filamento"
            data-testid={`cor-hex-${color.id}`}
          />
        </div>
        <div className="campo flex-1">
          <Label htmlFor={`${color.id}-nome`}>Nome</Label>
          <Input
            id={`${color.id}-nome`}
            value={color.name}
            onChange={(event) => onChange(color.id, { name: event.target.value })}
            placeholder="Nome da cor"
            autoComplete="off"
            data-testid={`cor-nome-${color.id}`}
            className="h-11"
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-11"
          onClick={() => onRemove(color.id)}
          data-testid={`cor-remover-${color.id}`}
        >
          Remover
        </Button>
      </div>
      <div className={showGrams ? "grid gap-3 sm:grid-cols-2" : "grid gap-3"}>
        <NumberField
          id={`${color.id}-preco`}
          label="Preço (R$/kg)"
          value={color.price}
          onChange={(price) => onChange(color.id, { price })}
          placeholder="80"
          when="reported"
          error={priceError}
          testId={`cor-preco-${color.id}`}
        />
        {showGrams ? (
          <NumberField
            id={`${color.id}-peso`}
            label="Peso (g)"
            value={color.grams}
            onChange={(grams) => onChange(color.id, { grams })}
            placeholder="12"
            when="reported"
            error={gramsError}
            testId={`cor-peso-${color.id}`}
          />
        ) : null}
      </div>
    </div>
  )
}

function CalculadoraLoading({ tipo }: { tipo: TipoMontagem }) {
  return (
    <main className="coluna coluna-unica py-8" data-motion={tipo}>
      <header className="cabecalho-pagina">
        <h1 className="titulo-pagina">Calculadora</h1>
        <p className="lede text-muted-foreground">{vistaCarregamento("calculadora", "lendo").titulo}</p>
      </header>
    </main>
  )
}

function CalculadoraErro({ tipo }: { tipo: TipoMontagem }) {
  const vista = vistaCarregamento("calculadora", "erro")
  return (
    <main className="coluna coluna-unica py-8" data-motion={tipo}>
      <header className="cabecalho-pagina">
        <h1 className="titulo-pagina">{vista.titulo}</h1>
      </header>
    </main>
  )
}

export function Calculadora({ projectId }: { projectId: string | null }) {
  const leitura = useLeitura()
  const tipo = useMovimento()
  if (leitura.status === "erro") return <CalculadoraErro tipo={tipo} />
  if (leitura.status !== "pronto") return <CalculadoraLoading tipo={tipo} />
  const project = projectId ? (leitura.projects.find((item) => item.id === projectId) ?? null) : null
  const marca = project
    ? `${project.updatedAt}:${project.mesas?.length ?? 0}:${project.colors.length}:${project.hours}:${project.mode}`
    : projectId
      ? `ausente-${projectId}`
      : "novo"
  return (
    <CalculadoraEditor
      key={marca}
      projectId={projectId}
      initial={project}
      missing={projectId !== null && project === null}
      tipo={tipo}
    />
  )
}

function CalculadoraEditor({
  projectId,
  initial,
  missing,
  tipo,
}: {
  projectId: string | null
  initial: Project | null
  missing: boolean
  tipo: TipoMontagem
}) {
  const router = useRouter()
  const printerStore = usePrinterStore()
  const printer = printerStore ? activePrinterOf(printerStore) : null
  const [projectName, setProjectName] = useState(initial?.name ?? "")
  const [nameError, setNameError] = useState<string | null>(null)
  const [mode, setMode] = useState<EntryMode>(initial?.mode ?? "peca")
  const [copies, setCopies] = useState(initial?.copies ?? "")
  const [hours, setHours] = useState(initial?.hours ?? "")
  const [minutesPart, setMinutesPart] = useState(initial?.minutes ?? "")
  const [colors, setColors] = useState<ColorDraft[]>(initial?.colors ?? [])
  const [labor, setLabor] = useState(initial?.labor ?? "")
  const [colorMode, setColorMode] = useState<ColorMode>(initial?.colorMode ?? "unica")
  const [grams, setGrams] = useState(initial?.grams ?? "")
  const [mesas, setMesas] = useState<MesaDraft[]>(initial?.mesas ?? [])
  const [recusa, setRecusa] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const printerId = initial?.printerId
    if (!printerId) return
    setActivePrinter(printerId)
  }, [initial?.printerId])

  function forgetIssue(id: string) {
    setFieldErrors((current) => {
      if (!current[id]) return current
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  function chooseColorMode(next: ColorMode) {
    if (next === colorMode) return
    if (next === "multicolor") {
      setColors((current) => {
        if (current.length === 0 || current[0].grams.trim() !== "" || grams.trim() === "") return current
        const [first, ...rest] = current
        return [{ ...first, grams }, ...rest]
      })
    } else if (grams.trim() === "") {
      setGrams(colors[0]?.grams ?? "")
    }
    setColorMode(next)
    forgetIssue("peso")
  }

  function updateColor(id: string, patch: Partial<ColorDraft>) {
    setColors((current) => current.map((color) => (color.id === id ? { ...color, ...patch } : color)))
    if (patch.price !== undefined) forgetIssue(`${id}-preco`)
    if (patch.grams !== undefined) forgetIssue(`${id}-peso`)
  }

  function removeColor(id: string) {
    setColors((current) => current.filter((color) => color.id !== id))
  }

  function rascunhoAtual(): Project {
    return {
      id: initial?.id ?? "local",
      name: projectName,
      printerId: printer?.id ?? "",
      mode,
      copies,
      hours,
      minutes: minutesPart,
      labor,
      colorMode,
      grams,
      colors,
      mesas,
      updatedAt: initial?.updatedAt ?? 0,
    }
  }

  function aplicarProjeto(next: Project) {
    setMode(next.mode)
    setCopies(next.copies)
    setHours(next.hours)
    setMinutesPart(next.minutes)
    setLabor(next.labor)
    setColorMode(next.colorMode)
    setGrams(next.grams)
    setColors(next.colors)
    setMesas(next.mesas ?? [])
  }

  async function incluirMesa() {
    setRecusa(null)
    if (missing && projectId) return
    if (projectId && !missing) {
      const resultado = await gravarMesa(projectId, crypto.randomUUID(), initial?.updatedAt)
      if (resultado.status === "recusado") setRecusa(FRASE_VARIAS_CORES)
      return
    }
    const next = ganharMesa(rascunhoAtual(), crypto.randomUUID())
    if (next.status === "recusado") {
      setRecusa(FRASE_VARIAS_CORES)
      return
    }
    aplicarProjeto(next.project)
  }

  async function tirarMesa(id: string) {
    if (projectId && !missing) {
      await apagarMesa(projectId, id, initial?.updatedAt)
      return
    }
    aplicarProjeto(perderMesa(rascunhoAtual(), id))
  }

  function addColor() {
    setColors((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "",
        hex: swatches[current.length % swatches.length],
        price: "",
        grams: "",
      },
    ])
  }

  const result = printer
    ? calculate(
        draftToCalcInput(
          { mode, copies, hours, minutes: minutesPart, labor, colorMode, grams, colors, mesas },
          printer
        )
      )
    : null

  function saveProject() {
    if (!printer) return
    const name = projectName.trim()
    const issues: Record<string, string> = {}
    const note = (id: string, value: string, integer = false) => {
      const issue = numberFieldIssue(value, integer)
      if (issue) issues[id] = issue
    }
    if (mesas.length > 0) {
      Object.assign(issues, errosAoGravar({ mode, copies, hours, minutes: minutesPart, labor, colorMode, grams, colors, mesas }))
    } else {
      note("horas", hours)
      note("minutos", minutesPart)
      note("mao-de-obra", labor)
      if (mode === "lote") note("copias", copies, true)
      if (colorMode === "unica") note("peso", grams)
      const coresConferidas = colorMode === "unica" ? colors.slice(0, 1) : colors
      for (const color of coresConferidas) {
        note(`${color.id}-preco`, color.price)
        if (colorMode === "multicolor") note(`${color.id}-peso`, color.grams)
      }
    }
    setFieldErrors(issues)
    setNameError(name ? null : "Dê um nome para gravar o lote.")
    if (!name || Object.keys(issues).length > 0) {
      window.setTimeout(() => {
        document.querySelector("[aria-invalid='true']")?.scrollIntoView({ block: "center", behavior: "smooth" })
      }, 0)
      return
    }
    const id = idAoSalvar(projectId, missing, crypto.randomUUID())
    const esperado = initial && !missing ? initial.updatedAt : undefined
    writeProject(
      mesas.length > 0
        ? {
            id,
            name,
            printerId: printer.id,
            mode: "peca",
            copies,
            hours: "",
            minutes: "",
            labor,
            colorMode: "unica",
            grams: "",
            colors: [],
            mesas,
            updatedAt: 0,
            expectedUpdatedAt: esperado,
          }
        : {
            id,
            name,
            printerId: printer.id,
            mode,
            copies,
            hours,
            minutes: minutesPart,
            labor,
            colorMode,
            grams,
            colors: colorMode === "unica" ? colors.slice(0, 1).map((color) => ({ ...color, grams })) : colors,
            mesas: [],
            updatedAt: 0,
            expectedUpdatedAt: esperado,
          }
    )
    setProjectName(name)
    setNameError(null)
    if (id !== projectId) router.replace(`/?projeto=${encodeURIComponent(id)}`)
  }

  function startNew() {
    if (projectId) {
      router.push("/")
      return
    }
    setProjectName("")
    setMode("peca")
    setCopies("")
    setHours("")
    setMinutesPart("")
    setLabor("")
    setColorMode("unica")
    setGrams("")
    setColors([])
    setMesas([])
    setRecusa(null)
    setNameError(null)
    setFieldErrors({})
  }

  if (!printerStore || !printer || !result) return <CalculadoraLoading tipo={tipo} />

  const frases = frasesCalculadora(missing ? "ausente" : projectId ? "gravado" : "novo")
  const linkedPrinterMissing =
    Boolean(projectId) &&
    !missing &&
    Boolean(initial?.printerId) &&
    !printerStore.printers.some((item) => item.id === initial?.printerId)

  const notes = resultNotes(result, mode)
  const ficha = fichaCalculadora(mesas.length > 0, mode)
  const avisoCopias = mesas.length > 0 ? avisoCopiasProduto(copies) : null
  const modeHint =
    mode === "peca"
      ? colorMode === "unica"
        ? "O tempo e o peso são de uma peça. Não há cópias na mesa: o lote é essa peça."
        : "O tempo é de uma peça. O peso de cada cor é dessa peça. Não há cópias na mesa: o lote é essa peça."
      : colorMode === "unica"
        ? "O tempo e o peso são da mesa cheia. As cópias dividem o lote em cada peça."
        : "O tempo é da mesa cheia. O peso de cada cor é da mesa. As cópias dividem o lote em cada peça."

  return (
    <main className="coluna py-8 pb-28 md:pb-10" data-motion={tipo}>
      <header className="cabecalho-pagina cabecalho-com-acoes">
        <h1 className="titulo-pagina">Calculadora</h1>
        <p className="lede text-muted-foreground">
          Um objeto pode levar várias cores na mesma impressão. Energia e depreciação vêm da impressora
          marcada. {frases.gravar}
        </p>
      </header>
      <div className="acoes-pagina">
        {projectId && !missing ? (
          <Link href="/projetos" className="inline-flex h-11 items-center text-sm underline underline-offset-2">
            Ver em Projetos
          </Link>
        ) : null}
        <Button type="button" variant="outline" className="h-11" onClick={startNew} data-testid="novo-projeto">
          Novo
        </Button>
        <Button type="submit" form="lote" className="h-11" data-testid="salvar-projeto">
          Salvar
        </Button>
      </div>
      <div className="grade-calculadora">
        <form
          id="lote"
          className="pilha"
          onSubmit={(event) => {
            event.preventDefault()
            saveProject()
          }}
        >

        {frases.ausente ? (
          <p className="lavagem p-3 text-sm text-muted-foreground" data-testid="projeto-ausente">
            {frases.ausente}
          </p>
        ) : null}
        {linkedPrinterMissing ? (
          <p className="lavagem p-3 text-sm text-muted-foreground" data-testid="impressora-ausente">
            A impressora gravada neste projeto foi removida. O cálculo usa a máquina marcada agora.
          </p>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Projeto</CardTitle>
            <CardDescription>{frases.descricao}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="campo">
                <Label htmlFor="nome-projeto">Nome</Label>
                <Input
                  id="nome-projeto"
                  value={projectName}
                  onChange={(event) => {
                    setProjectName(event.target.value)
                    setNameError(null)
                  }}
                  placeholder="Nome do lote"
                  autoComplete="off"
                  aria-invalid={nameError !== null}
                  data-testid="nome-projeto"
                  className="h-11"
                />
                {nameError ? <p className="erro-campo">{nameError}</p> : null}
              </div>
              <div className="campo">
                <Label htmlFor="impressora-ativa">Impressora</Label>
                <select
                  id="impressora-ativa"
                  value={printer.id}
                  onChange={(event) => setActivePrinter(event.target.value)}
                  data-testid="impressora-ativa"
                  className="h-11 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  {printerStore.printers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name.trim() || "Sem nome"}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  A tarifa fica na máquina.{" "}
                  <Link href="/configuracoes" className="underline underline-offset-2">
                    Editar em Configurações
                  </Link>
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objeto na cama</CardTitle>
            <CardDescription>{ficha.frase ?? modeHint}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            {recusa ? (
              <p className="lavagem p-3 text-sm text-muted-foreground" data-testid="recusa-mesa">
                {recusa}
              </p>
            ) : null}
            {ficha.modos.length > 0 ? (
            <>
            <fieldset className="grid gap-2">
              <legend className="legenda">O tempo e os pesos são de</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <ModeOption
                  name="modo"
                  value="peca"
                  checked={mode === "peca"}
                  onSelect={() => setMode("peca")}
                  title="Uma peça"
                  testId="modo-peca"
                />
                <ModeOption
                  name="modo"
                  value="lote"
                  checked={mode === "lote"}
                  onSelect={() => setMode("lote")}
                  title="O lote inteiro"
                  testId="modo-lote"
                />
              </div>
            </fieldset>

            <fieldset className="grid gap-2">
              <legend className="legenda">A peça leva</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <ModeOption
                  name="cores"
                  value="unica"
                  checked={colorMode === "unica"}
                  onSelect={() => chooseColorMode("unica")}
                  title="Uma cor"
                  testId="cor-unica"
                />
                <ModeOption
                  name="cores"
                  value="multicolor"
                  checked={colorMode === "multicolor"}
                  onSelect={() => chooseColorMode("multicolor")}
                  title="Várias cores"
                  testId="cor-multicolor"
                />
              </div>
            </fieldset>
            </>
            ) : null}

            {mesas.length > 0 ? (
              <div className="grid gap-3">
                <NumberField
                  id="copias"
                  label={ficha.copias ?? "Cópias do produto"}
                  value={copies}
                  onChange={(value) => {
                    setCopies(value)
                    forgetIssue("copias")
                  }}
                  integer
                  placeholder="1"
                  when="reported"
                  error={fieldErrors.copias ?? null}
                  testId="copias"
                />
                {mesas.map((mesa) => (
                  <div key={mesa.id} className="grid gap-3 rounded-lg border p-3" data-testid={`mesa-${mesa.id}`}>
                    <div className="flex items-end gap-3">
                      <div className="campo">
                        <Label htmlFor={`${mesa.id}-hex`}>Cor</Label>
                        <input
                          id={`${mesa.id}-hex`}
                          type="color"
                          value={mesa.hex}
                          onChange={(event) =>
                            setMesas((current) =>
                              current.map((item) => (item.id === mesa.id ? { ...item, hex: event.target.value } : item))
                            )
                          }
                          className="size-11 cursor-pointer rounded-md border bg-transparent p-1"
                          aria-label="Cor do filamento"
                          data-testid={`mesa-hex-${mesa.id}`}
                        />
                      </div>
                      <div className="campo flex-1">
                        <Label htmlFor={`${mesa.id}-nome`}>Nome</Label>
                        <Input
                          id={`${mesa.id}-nome`}
                          value={mesa.name}
                          onChange={(event) =>
                            setMesas((current) =>
                              current.map((item) => (item.id === mesa.id ? { ...item, name: event.target.value } : item))
                            )
                          }
                          placeholder="Nome da cor"
                          autoComplete="off"
                          data-testid={`mesa-nome-${mesa.id}`}
                          className="h-11"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-11"
                        onClick={() => tirarMesa(mesa.id)}
                        data-testid={`mesa-remover-${mesa.id}`}
                      >
                        Remover
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <NumberField
                        id={`${mesa.id}-horas`}
                        label="Horas"
                        value={mesa.hours}
                        onChange={(hours) => {
                          setMesas((current) => current.map((item) => (item.id === mesa.id ? { ...item, hours } : item)))
                          forgetIssue(`${mesa.id}-horas`)
                        }}
                        placeholder="1"
                        when="reported"
                        error={fieldErrors[`${mesa.id}-horas`] ?? null}
                        testId={`mesa-horas-${mesa.id}`}
                      />
                      <NumberField
                        id={`${mesa.id}-minutos`}
                        label="Minutos"
                        value={mesa.minutes}
                        onChange={(minutes) => {
                          setMesas((current) =>
                            current.map((item) => (item.id === mesa.id ? { ...item, minutes } : item))
                          )
                          forgetIssue(`${mesa.id}-minutos`)
                        }}
                        placeholder="0"
                        when="reported"
                        error={fieldErrors[`${mesa.id}-minutos`] ?? null}
                        testId={`mesa-minutos-${mesa.id}`}
                      />
                      <NumberField
                        id={`${mesa.id}-preco`}
                        label="Preço (R$/kg)"
                        value={mesa.price}
                        onChange={(price) => {
                          setMesas((current) => current.map((item) => (item.id === mesa.id ? { ...item, price } : item)))
                          forgetIssue(`${mesa.id}-preco`)
                        }}
                        placeholder="80"
                        when="reported"
                        error={fieldErrors[`${mesa.id}-preco`] ?? null}
                        testId={`mesa-preco-${mesa.id}`}
                      />
                      <NumberField
                        id={`${mesa.id}-peso`}
                        label="Peso (g)"
                        value={mesa.grams}
                        onChange={(gramsDaMesa) => {
                          setMesas((current) =>
                            current.map((item) => (item.id === mesa.id ? { ...item, grams: gramsDaMesa } : item))
                          )
                          forgetIssue(`${mesa.id}-peso`)
                        }}
                        placeholder="12"
                        when="reported"
                        error={fieldErrors[`${mesa.id}-peso`] ?? null}
                        testId={`mesa-peso-${mesa.id}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div
              className={`grid gap-3 ${
                mode === "lote" && colorMode === "unica"
                  ? "sm:grid-cols-4"
                  : mode === "lote" || colorMode === "unica"
                    ? "sm:grid-cols-3"
                    : "sm:grid-cols-2"
              }`}
            >
              {ficha.copias ? (
                <NumberField
                  id="copias"
                  label={ficha.copias}
                  value={copies}
                  onChange={(value) => {
                    setCopies(value)
                    forgetIssue("copias")
                  }}
                  integer
                  placeholder="4"
                  when="reported"
                  error={fieldErrors.copias ?? null}
                  testId="copias"
                />
              ) : null}
              <NumberField
                id="horas"
                label="Horas"
                value={hours}
                onChange={(value) => {
                  setHours(value)
                  forgetIssue("horas")
                }}
                placeholder="2"
                when="reported"
                error={fieldErrors.horas ?? null}
                testId="horas"
              />
              <NumberField
                id="minutos"
                label="Minutos"
                value={minutesPart}
                onChange={(value) => {
                  setMinutesPart(value)
                  forgetIssue("minutos")
                }}
                placeholder="30"
                when="reported"
                error={fieldErrors.minutos ?? null}
                testId="minutos"
              />
              {ficha.peso && colorMode === "unica" ? (
                <NumberField
                  id="peso"
                  label={ficha.peso ?? ""}
                  value={grams}
                  onChange={(value) => {
                    setGrams(value)
                    forgetIssue("peso")
                  }}
                  placeholder="12"
                  when="reported"
                  error={fieldErrors.peso ?? null}
                  testId="peso-peca"
                />
              ) : null}
            </div>
            )}

            {mesas.length === 0 ? (
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="legenda">{colorMode === "unica" ? "Filamento" : "Filamentos do objeto"}</h2>
                {colorMode === "multicolor" || colors.length === 0 ? (
                  <Button type="button" variant="outline" className="h-11" onClick={addColor} data-testid="adicionar-cor">
                    Adicionar cor
                  </Button>
                ) : null}
              </div>
              {colors.length === 0 ? (
                <p className="lavagem p-3 text-sm text-muted-foreground" data-testid="cores-vazio">
                  Nenhuma cor ainda. Sem filamento, o material fica em R$ 0,00.
                </p>
              ) : (
                (colorMode === "unica" ? colors.slice(0, 1) : colors).map((color, index) => (
                  <div
                    key={color.id}
                    className="item-lista"
                    style={{ "--atraso": atrasoLista(index, colors.length) } as CSSProperties}
                  >
                    <ColorEditor
                      color={color}
                      onChange={updateColor}
                      onRemove={removeColor}
                      showGrams={colorMode === "multicolor"}
                      priceError={fieldErrors[`${color.id}-preco`] ?? null}
                      gramsError={fieldErrors[`${color.id}-peso`] ?? null}
                    />
                  </div>
                ))
              )}
            </div>
            ) : null}
            <Button type="button" variant="outline" className="h-11" onClick={incluirMesa} data-testid="adicionar-mesa">
              Adicionar mesa
            </Button>

            <NumberField
              id="mao-de-obra"
              label={ficha.maoDeObra}
              value={labor}
              onChange={(value) => {
                setLabor(value)
                forgetIssue("mao-de-obra")
              }}
              placeholder="15"
              when="reported"
              error={fieldErrors["mao-de-obra"] ?? null}
              testId="mao-de-obra"
              hint="Só sobre material + energia + depreciação. A impressora e a energia ficam em Configurações."
            />
          </CardContent>
        </Card>
        </form>

      <Card className="md:sticky md:top-28">
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
          <CardDescription data-testid="origem-impressora">
            Peça e lote ao mesmo tempo.{" "}
            <Link href="/configuracoes" className="underline underline-offset-2">
              {printer.name.trim() || "Sem nome"}
            </Link>
            : {printer.watts} W, {printer.energyPrice} R$/kWh, impressora {printer.printerPrice}, {printer.lifeHours} h.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <TotalBlock label="Por peça" money={result.piece.total} time={result.piece.minutes} testPrefix="peca" />
            <TotalBlock label="Lote" money={result.lot.total} time={result.lot.minutes} testPrefix="lote" />
          </div>

          <table className="w-full text-sm" data-testid="tabela-custos">
            <thead>
              <tr className="text-muted-foreground">
                <th className="legenda py-1 text-left"> </th>
                <th className="legenda py-1 text-right">Peça</th>
                <th className="legenda py-1 text-right">Lote</th>
              </tr>
            </thead>
            <tbody>
              <CostRow label="Material" piece={result.piece.material} lot={result.lot.material} testId="material" />
              <CostRow label="Energia" piece={result.piece.energy} lot={result.lot.energy} testId="energia" />
              <CostRow
                label="Depreciação"
                piece={result.piece.depreciation}
                lot={result.lot.depreciation}
                testId="depreciacao"
              />
              <CostRow label="Mão de obra" piece={result.piece.labor} lot={result.lot.labor} testId="mao-obra-valor" />
              <CostRow label="Peso" piece={result.piece.grams} lot={result.lot.grams} testId="peso" kind="grams" />
            </tbody>
          </table>

          {result.colors.length > 0 ? (
            <ul className="grid gap-1 text-sm" data-testid="cores-material">
              {result.colors.map((color) => (
                <li key={color.id} className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="amostra-cor size-2.5 shrink-0" style={{ background: color.hex }} />
                    <span className="truncate">{color.name.trim() || "Sem nome"}</span>
                  </span>
                  <span className="figura">{color.invalid ? "inválida" : showMoney(color.material)}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {notes.length > 0 || avisoCopias ? (
            <ul className="grid gap-2 text-sm text-muted-foreground" data-testid="avisos">
              {avisoCopias ? (
                <li className="lavagem p-2" data-testid="aviso-copias">
                  {avisoCopias}
                </li>
              ) : null}
              {notes.map((note) => (
                <li key={note} className="lavagem p-2">
                  {note}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
      </div>

      <div className="barra-totais" aria-hidden="true">
        <div>
          <p className="legenda text-muted-foreground">Por peça</p>
          <p className="figura">{showMoney(result.piece.total)}</p>
        </div>
        <div>
          <p className="legenda text-muted-foreground">Lote</p>
          <p className="figura">{showMoney(result.lot.total)}</p>
        </div>
      </div>
    </main>
  )
}

function ModeOption({
  name,
  value,
  checked,
  onSelect,
  title,
  testId,
}: {
  name: string
  value: string
  checked: boolean
  onSelect: () => void
  title: string
  testId: string
}) {
  return (
    <label
      className={`modo-opcao flex h-11 cursor-pointer items-center gap-2 px-3 text-sm ${
        checked ? "modo-marcado" : ""
      }`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onSelect} data-testid={testId} />
      {title}
    </label>
  )
}

function TotalBlock({
  label,
  money,
  time,
  testPrefix,
}: {
  label: string
  money: Amount
  time: Amount
  testPrefix: string
}) {
  return (
    <div className="lavagem p-3">
      <p className="legenda text-muted-foreground">{label}</p>
      <p className="figura" data-testid={`total-${testPrefix}`}>
        {showMoney(money)}
      </p>
      <p className="figura" data-testid={`tempo-${testPrefix}`}>
        {showTime(time)}
      </p>
    </div>
  )
}

function CostRow({
  label,
  piece,
  lot,
  testId,
  kind = "money",
}: {
  label: string
  piece: Amount
  lot: Amount
  testId: string
  kind?: "money" | "grams"
}) {
  const show = kind === "grams" ? showGrams : showMoney
  return (
    <tr className="border-t">
      <th className="py-2 text-left font-medium">{label}</th>
      <td className="figura py-2 text-right" data-testid={`${testId}-peca`}>
        {show(piece)}
      </td>
      <td className="figura py-2 text-right" data-testid={`${testId}-lote`}>
        {show(lot)}
      </td>
    </tr>
  )
}
