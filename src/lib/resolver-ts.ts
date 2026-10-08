import { existsSync } from "node:fs"
import { registerHooks } from "node:module"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

registerHooks({
  resolve(specifier, context, next) {
    if ((specifier.startsWith("./") || specifier.startsWith("../")) && !path.extname(specifier)) {
      const parent = context.parentURL
      if (parent?.startsWith("file:") && (parent.endsWith(".ts") || parent.endsWith(".tsx"))) {
        const dir = path.dirname(fileURLToPath(parent))
        for (const ext of [".ts", ".tsx", ".js"]) {
          const candidate = path.join(dir, `${specifier}${ext}`)
          if (existsSync(candidate)) return next(pathToFileURL(candidate).href, context)
        }
      }
    }
    return next(specifier, context)
  },
})
