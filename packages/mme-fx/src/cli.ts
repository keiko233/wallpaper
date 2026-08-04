import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  compileMmeEffect,
  parseDirectXTextMesh,
  parseEmdEffectMap,
} from "./index.ts";

const USAGE =
  "Usage: wallpaper-mme-fx <compile <effect.fx> [--accessory <mesh.x>] | compile-model <model.emd>> [--output <artifact.json>]";

export interface MmeFxCliArgs {
  command: "compile" | "compile-model";
  sourcePath: string;
  accessoryPath?: string;
  outputPath?: string;
}

function optionValue(argv: string[], index: number, option: string): string {
  const value = argv[index + 1];
  if (value === undefined || value.startsWith("-")) {
    throw new Error(`Missing value for ${option}\n${USAGE}`);
  }
  return value;
}

export function parseArgs(argv: string[]): MmeFxCliArgs {
  let command: "compile" | "compile-model" | undefined;
  let sourcePath: string | undefined;
  let accessoryPath: string | undefined;
  let outputPath: string | undefined;
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--accessory") {
      accessoryPath = optionValue(argv, index, arg);
      index++;
    } else if (arg === "--output" || arg === "-o") {
      outputPath = optionValue(argv, index, arg);
      index++;
    } else if (
      (arg === "compile" || arg === "compile-model") &&
      command === undefined
    ) {
      command = arg;
    } else if (!arg.startsWith("-") && sourcePath === undefined) {
      sourcePath = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}\n${USAGE}`);
    }
  }
  if (command === undefined || sourcePath === undefined) {
    throw new Error(USAGE);
  }
  if (command === "compile-model" && accessoryPath !== undefined) {
    throw new Error(`--accessory is valid only for the compile command\n${USAGE}`);
  }
  return { command, sourcePath, accessoryPath, outputPath };
}

export async function main(argv: string[]): Promise<void> {
  try {
    const args = parseArgs(argv);
    const sourceFile = resolve(args.sourcePath);
    if (args.command === "compile-model") {
      const parsed = parseEmdEffectMap(
        new TextDecoder("utf-8").decode(await readFile(sourceFile)),
      );
      const effects = [];
      const paths = new Set(
        parsed.effectMap?.materials.flatMap(({ effectPath }) =>
          effectPath === null ? [] : [effectPath]
        ) ?? [],
      );
      for (const path of paths) {
        const effectSource = new TextDecoder("shift_jis").decode(
          await readFile(resolve(dirname(sourceFile), path)),
        );
        effects.push({
          path,
          effect: compileMmeEffect(effectSource, { sourceName: path }),
        });
      }
      const artifact = `${JSON.stringify(
        { schemaVersion: 1, materialMap: parsed, effects },
        null,
        2,
      )}\n`;
      if (args.outputPath === undefined) process.stdout.write(artifact);
      else await writeFile(resolve(args.outputPath), artifact);
      if (
        parsed.effectMap === null ||
        effects.some(({ effect }) => !effect.ok)
      ) {
        process.exitCode = 1;
      }
      return;
    }
    const source = new TextDecoder("shift_jis").decode(
      await readFile(sourceFile),
    );
    const effect = compileMmeEffect(source, { sourceName: args.sourcePath });
    const accessory =
      args.accessoryPath === undefined
        ? null
        : parseDirectXTextMesh(
            new TextDecoder().decode(
              await readFile(resolve(args.accessoryPath)),
            ),
          );
    const artifact = `${JSON.stringify(
      { schemaVersion: 1, effect, accessory },
      null,
      2,
    )}\n`;
    if (args.outputPath === undefined) process.stdout.write(artifact);
    else await writeFile(resolve(args.outputPath), artifact);
    if (!effect.ok || accessory?.mesh === null) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (import.meta.url.startsWith("file:")) {
  const scriptPath = fileURLToPath(import.meta.url);
  if (process.argv[1] === scriptPath) {
    await main(process.argv.slice(2));
  }
}
