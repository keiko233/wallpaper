#!/usr/bin/env node
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const cliTs = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "cli.ts",
);
const child = spawn(
  process.execPath,
  ["--experimental-strip-types", cliTs, ...process.argv.slice(2)],
  { cwd: process.cwd(), env: process.env, stdio: "inherit" },
);

child.on("exit", (code, signal) => {
  if (signal !== null) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
