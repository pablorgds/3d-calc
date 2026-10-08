"use client"

import { useState, type CSSProperties } from "react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { calculate, combineTime, draftToCalcInput, formatBRL, formatDuration } from "@/lib/custo"
import { useLeitura } from "@/lib/impressora"
import { deleteProject, duplicateProject, type Project } from "@/lib/projetos"
import { vistaCarregamento } from "@/lib/vistas"
import { atrasoLista } from "@/lib/movimento"
import { cn } from "cn"

function colorLabel(count: number) {
  if (count === 0) return "sem cores"
  if (count === 1) return "1 cor"
  return `${count} cores`
}

function projectParts(project: Project) {
  const minutes = combineTime(project.hours, project.minutes)
  const time = minutes.status === "ok" ? formatDuration(minutes.value) : "tempo incompleto"
  const scope = project.mode === "peca" ? "peça" : "lote"
  const mode = project.mode === "peca" ? "Peça única" : `Lote · ${project.copies} cópias`
  const labor = project.labor.trim() === "" ? "mão de obra vazia" : `mão de obra ${project.labor}%`
  return { mode, time, scope, labor, colors: colorLabel(project.colors.length) }
}

export function ListaProjetos() {
  const leitura = useLeitura()
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  if (leitura.status === "erro") {
    const vista = vistaCarregamento("projetos", "erro")
    return (
      <Card>
        <CardHeader>
          <CardTitle>{vista.titulo}</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (leitura.status !== "pronto") {
    const vista = vistaCarregamento("projetos", "lendo")
    return (
      <Card>
        <CardHeader>
          <CardTitle>{vista.titulo}</CardTitle>
          {vista.descricao ? <CardDescription>{vista.descricao}</CardDescription> : null}
        </CardHeader>
      </Card>
    )
  }

  const projects = leitura.projects
  const store = leitura.printers

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum projeto salvo</CardTitle>
          <CardDescription>
            Na calculadora, dê um nome ao lote e grave. Entram o modo, as cópias, o tempo, a mão de obra e as cores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/" className={cn(buttonVariants(), "h-11")} data-testid="ir-calculadora">
            Ir para a calculadora
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="pilha">
      {projects.map((project, index) => {
        const printer = store.printers.find((item) => item.id === project.printerId) ?? null
        const total = printer ? calculate(draftToCalcInput(project, printer)).lot.total : null
        const when = new Date(project.updatedAt).toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        })
        const confirming = pendingDelete === project.id
        const parts = projectParts(project)
        return (
          <Card
            key={project.id}
            className="item-lista"
            style={{ "--atraso": atrasoLista(index, projects.length) } as CSSProperties}
            data-testid={`projeto-${project.id}`}
          >
            <CardHeader>
              <CardTitle>{project.name.trim() || "Sem nome"}</CardTitle>
              <CardDescription>
                {printer ? printer.name.trim() || "Sem nome" : "Impressora removida"} · atualizado em {when}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p className="text-sm text-muted-foreground">
                {parts.mode}
                {" · "}
                <span className="figura">{parts.time}</span>
                {` no ${parts.scope} · ${parts.labor} · ${parts.colors}`}
              </p>
              {printer ? (
                <p className="text-lg font-semibold" data-testid={`total-projeto-${project.id}`}>
                  <span className="figura">{total === null ? "Total incompleto" : formatBRL(total)}</span>
                  <span className="legenda ml-2 text-muted-foreground">lote, tarifa atual</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  A impressora deste projeto foi removida. Abrir usa a máquina marcada agora.
                </p>
              )}
              {confirming ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    className="h-11"
                    onClick={() => {
                      deleteProject(project.id)
                      setPendingDelete(null)
                    }}
                    data-testid={`confirmar-apagar-${project.id}`}
                  >
                    Apagar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => setPendingDelete(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/?projeto=${encodeURIComponent(project.id)}`}
                    className={cn(buttonVariants(), "h-11")}
                    data-testid={`abrir-${project.id}`}
                  >
                    Abrir
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => duplicateProject(project.id, crypto.randomUUID())}
                    data-testid={`duplicar-${project.id}`}
                  >
                    Duplicar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11"
                    onClick={() => setPendingDelete(project.id)}
                    data-testid={`apagar-${project.id}`}
                  >
                    Apagar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
