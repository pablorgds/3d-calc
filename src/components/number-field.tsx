"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { parseDecimal, parseInteger } from "@/lib/custo"

export function NumberField({
  id,
  label,
  value,
  onChange,
  integer = false,
  testId,
  hint,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  integer?: boolean
  testId: string
  hint?: string
}) {
  const parsed = integer ? parseInteger(value) : parseDecimal(value)
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={integer ? "numeric" : "decimal"}
        autoComplete="off"
        aria-invalid={parsed.status === "invalid"}
        data-testid={testId}
        className="h-11 font-mono"
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {parsed.status === "invalid" ? (
        <p className="text-xs text-destructive">Use zero ou um número positivo.</p>
      ) : null}
      {parsed.status === "empty" ? <p className="text-xs text-muted-foreground">Campo vazio.</p> : null}
    </div>
  )
}
