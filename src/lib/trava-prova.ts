import fs from "node:fs"
import os from "node:os"
import path from "node:path"

const arquivo = path.join(os.tmpdir(), "custo-chapa-prova-db.lock")

function vivo(pid: number) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

export async function pegarTravaProva() {
  const inicio = Date.now()
  while (Date.now() - inicio < 180_000) {
    try {
      const fd = fs.openSync(arquivo, "wx")
      fs.writeFileSync(fd, String(process.pid))
      fs.closeSync(fd)
      return
    } catch (erro) {
      const codigo = (erro as NodeJS.ErrnoException).code
      if (codigo !== "EEXIST") throw erro
      let pid = 0
      try {
        pid = Number(fs.readFileSync(arquivo, "utf8").trim())
      } catch {
        continue
      }
      if (!pid || !vivo(pid)) {
        fs.rmSync(arquivo, { force: true })
        continue
      }
      await new Promise((resolver) => setTimeout(resolver, 200))
    }
  }
  throw new Error("trava da prova nao liberou")
}

export function soltarTravaProva() {
  try {
    if (fs.readFileSync(arquivo, "utf8").trim() === String(process.pid)) fs.rmSync(arquivo, { force: true })
  } catch {
    return
  }
}
