import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildRepository,
  buildWallpaperEngineBundle,
  loadSite,
  publishR2,
  validateSite,
} from "./builder.ts";

const DEFAULT_CONFIG = "resource-site.json";

export interface ParsedArgs {
  command: string;
  config: string;
  output: string | undefined;
  bucket: string | undefined;
  prefix: string | undefined;
  force: boolean;
}

const USAGE = [
  "Usage: wallpaper-resource-catalog <validate|build|publish-r2|bundle-wallpaper-engine> [--config <path>] [--output <dir>]",
  "       publish-r2 options: [--bucket <name>] [--prefix <path>] [--force]",
  "       When the manifest root contains collection directories (e.g. defaults, private),",
  "       build produces one catalog per collection and publish-r2 uploads each under its",
  "       own prefix automatically. Omit --prefix to publish all collections.",
].join("\n");

function optionValue(argv: string[], index: number, option: string): string {
  const value = argv[index + 1];
  if (value === undefined || value.startsWith("-")) {
    throw new Error(`Missing value for ${option}\n${USAGE}`);
  }
  return value;
}

export function parseArgs(argv: string[]): ParsedArgs {
  let command: string | undefined;
  let config = DEFAULT_CONFIG;
  let output: string | undefined;
  let bucket: string | undefined;
  let prefix: string | undefined;
  let force = false;
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--") {
      continue;
    } else if (arg === "--config" || arg === "-c") {
      config = optionValue(argv, index, arg);
      index++;
    } else if (arg === "--output" || arg === "-o") {
      output = optionValue(argv, index, arg);
      index++;
    } else if (arg === "--bucket" || arg === "-b") {
      bucket = optionValue(argv, index, arg);
      index++;
    } else if (arg === "--prefix" || arg === "-p") {
      prefix = optionValue(argv, index, arg);
      index++;
    } else if (arg === "--force" || arg === "-f") {
      force = true;
    } else if (!arg.startsWith("-")) {
      if (command !== undefined) {
        throw new Error(`Unexpected extra argument: ${arg}\n${USAGE}`);
      }
      command = arg;
    } else {
      throw new Error(`Unknown option: ${arg}\n${USAGE}`);
    }
  }
  if (command === undefined) {
    throw new Error(USAGE);
  }
  if (
    command !== "publish-r2" &&
    (bucket !== undefined || prefix !== undefined || force)
  ) {
    throw new Error(
      `Options --bucket, --prefix and --force are only valid for publish-r2.\n${USAGE}`,
    );
  }
  return { command, config, output, bucket, prefix, force };
}

async function run(
  command: string,
  configPath: string,
  output: string | undefined,
  bucket: string | undefined,
  prefix: string | undefined,
  force: boolean,
) {
  const loaded = await loadSite(resolve(configPath));
  const outputDir = output ?? loaded.site.outputDirectory;

  switch (command) {
    case "validate": {
      await validateSite(loaded);
      console.log("All manifests are valid.");
      break;
    }
    case "build": {
      await buildRepository(loaded, outputDir);
      break;
    }
    case "publish-r2": {
      await publishR2(loaded, outputDir, { bucket, prefix, force });
      break;
    }
    case "bundle-wallpaper-engine": {
      await buildWallpaperEngineBundle(loaded, outputDir);
      break;
    }
    default: {
      throw new Error(`Unknown command: ${command}\n${USAGE}`);
    }
  }
}

export async function main(argv: string[]): Promise<void> {
  try {
    const { command, config, output, bucket, prefix, force } = parseArgs(argv);
    await run(command, config, output, bucket, prefix, force);
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

if (import.meta.url.startsWith("file:")) {
  const scriptPath = fileURLToPath(import.meta.url);
  if (process.argv[1] === scriptPath) {
    await main(process.argv.slice(2));
  }
}
