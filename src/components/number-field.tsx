"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { parseDecimal, parseInteger } from "@/lib/custo"
import { persistirNumeroNoEvento } from "@/lib/impressora-store"

export function NumberField({
  id,
  label,
  value,
  onChange,
  integer = false,
  testId,
  hint,
  placeholder,
  when = "live",
  error = null,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  integer?: boolean
  testId: string
  hint?: string
  placeholder?: string
  when?: "live" | "blur" | "reported"
  error?: string | null
}) {
  const [blurred, setBlurred] = useState<string | null>(null)
  const [rascunho, setRascunho] = useState(value)
  useEffect(() => {
    setRascunho(value)
  }, [value])
  const mostrado = when === "blur" ? rascunho : value
  const parsed = integer ? parseInteger(mostrado) : parseDecimal(mostrado)
  const reported = when === "reported" ? error : when === "blur" ? blurred : null
  return (
    <div className="campo">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={mostrado}
        onChange={(event) => {
          const next = event.target.value
          if (when === "blur") {
            setBlurred(null)
            setRascunho(next)
          }
          if (persistirNumeroNoEvento(when, "change")) onChange(next)
        }}
        onBlur={
          when === "blur"
            ? () => {
                setBlurred(numberFieldIssue(rascunho, integer))
                if (persistirNumeroNoEvento(when, "blur")) onChange(rascunho)
              }
            : undefined
        }
        inputMode={integer ? "numeric" : "decimal"}
        placeholder={placeholder}
        autoComplete="off"
        aria-invalid={when === "live" ? parsed.status === "invalid" : reported !== null}
        data-testid={testId}
        className="h-11 font-mono"
      />
      {hint ? <p className="legenda text-muted-foreground">{hint}</p> : null}
      {when === "live" && parsed.status === "invalid" ? (
        <p className="erro-campo">Use zero ou um número positivo.</p>
      ) : null}
      {reported ? <p className="erro-campo">{reported}</p> : null}
      {when === "live" && parsed.status === "empty" ? <p className="vazio-campo">Campo vazio.</p> : null}
    </div>
  )
}

export function numberFieldIssue(value: string, integer = false) {
  const parsed = integer ? parseInteger(value) : parseDecimal(value)
  if (parsed.status === "invalid") return "Use zero ou um número positivo."
  if (parsed.status === "empty") return "Campo vazio."
  return null
}
