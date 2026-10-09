import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto"

const N = 16384
const r = 8
const p = 1
const keylen = 32

function scrypt(senha: string, sal: Buffer, tamanho: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCb(senha, sal, tamanho, { N, r, p }, (erro, chave) => {
      if (erro) reject(erro)
      else resolve(chave)
    })
  })
}

export const EMAIL_ADMIN = "pablorgds@gmail.com"
export const SENHA_MINIMA = 8

export async function hashSenha(senha: string) {
  const sal = randomBytes(16)
  const verificador = await scrypt(senha, sal, keylen)
  return { sal, verificador }
}

export async function conferirSenha(senha: string, sal: Buffer, verificador: Buffer) {
  const calculado = await scrypt(senha, sal, verificador.length)
  if (calculado.length !== verificador.length) return false
  return timingSafeEqual(calculado, verificador)
}

export function emailNormalizado(email: string) {
  return email.trim().toLowerCase()
}

export function emailValido(email: string) {
  const normalizado = emailNormalizado(email)
  const arroba = normalizado.indexOf("@")
  return arroba > 0 && arroba < normalizado.length - 1
}

function sufixoSeguro(host: string | null) {
  const origem = (process.env.ORIGEM_PUBLICA ?? "").trim().toLowerCase()
  if (!origem) return ""
  const nome = (host ?? "").trim().toLowerCase().replace(/:\d+$/, "")
  return nome === origem ? "; Secure" : ""
}

export function cabecalhoCookieSessao(token: string, host: string | null = null) {
  return `sessao=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${sufixoSeguro(host)}`
}

export function cabecalhoCookieApagado(host: string | null = null) {
  return `sessao=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${sufixoSeguro(host)}`
}
