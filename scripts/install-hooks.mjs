/*
Points git at .githooks so the pre-commit hook is picked up on a fresh clone.
Runs automatically via the `prepare` lifecycle script.
*/

import { execFileSync } from "node:child_process"
import { chmodSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const hooksPath = ".githooks"
const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const hook = join(root, hooksPath, "pre-commit")

try {
  execFileSync("git", ["config", "core.hooksPath", hooksPath], {
    cwd: root,
    stdio: "ignore",
  })
} catch {
  console.log("not a git repository, skipping hooks install")
  process.exit(0)
}

if (existsSync(hook)) {
  chmodSync(hook, 0o755)
}

console.log(`hooks installed: core.hooksPath = ${hooksPath}`)
