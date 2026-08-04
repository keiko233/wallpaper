import {
  compileMmeEffect,
  parseEmdEffectMap,
  type EmdEffectMap,
} from "@wallpaper/mme-fx";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import type { Scene } from "@babylonjs/core/scene";
import type { MmdMesh } from "babylon-mmd/esm/Runtime/mmdMesh";

export interface MmdModelEffectHostOptions {
  scene: Scene;
  modelMesh: MmdMesh;
  effectMapUrl: string;
  resolveModelUrl(relativePath: string): string;
}

function directory(path: string): string {
  const slash = path.lastIndexOf("/");
  return slash < 0 ? "" : path.slice(0, slash + 1);
}

function normalizeRelativePath(path: string): string {
  const segments: string[] = [];
  for (const segment of path.replaceAll("\\", "/").split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") segments.pop();
    else segments.push(segment);
  }
  return segments.join("/");
}

/** Applies model-side MME metadata that has a Babylon-native equivalent. */
export class MmdModelEffectHost {
  private readonly scene: Scene;
  private readonly modelMesh: MmdMesh;
  private readonly effectMapUrl: string;
  private readonly resolveModelUrl: (relativePath: string) => string;

  public constructor(options: MmdModelEffectHostOptions) {
    this.scene = options.scene;
    this.modelMesh = options.modelMesh;
    this.effectMapUrl = options.effectMapUrl;
    this.resolveModelUrl = options.resolveModelUrl;
  }

  /**
   * MME conventionally stores per-material assignments next to the PMX using
   * the same basename. A missing EMD is normal and intentionally silent.
   */
  public async applyConventionalEmd(): Promise<void> {
    const response = await fetch(this.effectMapUrl);
    if (response.status === 404) return;
    if (!response.ok) {
      console.warn(
        `Unable to load model MME map ${this.effectMapUrl} (${response.status} ${response.statusText}).`,
      );
      return;
    }
    if (response.headers.get("content-type")?.includes("text/html")) {
      // Vite-style SPA fallbacks can return index.html with status 200 for a
      // missing conventional EMD path.
      return;
    }
    const parsed = parseEmdEffectMap(
      new TextDecoder("utf-8").decode(await response.arrayBuffer()),
    );
    if (parsed.effectMap === null) {
      console.warn(
        `Unable to parse model MME map ${this.effectMapUrl}: ${parsed.diagnostics
          .map(({ message }) => message)
          .join("; ")}`,
      );
      return;
    }
    await this.applyEffectMap(parsed.effectMap);
  }

  private async applyEffectMap(effectMap: EmdEffectMap): Promise<void> {
    const compiledEffects = new Map<
      string,
      ReturnType<typeof compileMmeEffect> | null
    >();
    const normalTextures = new Map<string, Texture>();

    for (const binding of effectMap.materials) {
      if (binding.effectPath === null) continue;
      const material = this.modelMesh.metadata.materials[binding.materialIndex];
      if (!(material instanceof StandardMaterial)) {
        console.warn(
          `EMD material ${binding.materialIndex} cannot receive ${binding.effectPath}; it is missing or not a StandardMaterial.`,
        );
        continue;
      }

      let compiled = compiledEffects.get(binding.effectPath);
      if (compiled === undefined) {
        compiled = await this.loadAndCompileEffect(binding.effectPath);
        compiledEffects.set(binding.effectPath, compiled);
      }
      if (compiled === null || !compiled.alternativeFull.present) continue;
      const normalMapPath = compiled.alternativeFull.normalMapPath;
      if (normalMapPath === null) continue;

      const relativeNormalPath = normalizeRelativePath(
        `${directory(binding.effectPath)}${normalMapPath}`,
      );
      let texture = normalTextures.get(relativeNormalPath);
      if (texture === undefined) {
        texture = new Texture(
          this.resolveModelUrl(relativeNormalPath),
          this.scene,
          false,
          false,
          Texture.TRILINEAR_SAMPLINGMODE,
        );
        texture.name = `mme-normal:${relativeNormalPath}`;
        texture.gammaSpace = false;
        texture.anisotropicFilteringLevel = Math.max(
          1,
          Math.min(16, compiled.alternativeFull.anisotropy ?? 4),
        );
        normalTextures.set(relativeNormalPath, texture);
      }
      material.bumpTexture = texture;
      // AlternativeFull assets contain DirectX-style tangent-space maps.
      material.invertNormalMapY = true;
    }
  }

  private async loadAndCompileEffect(
    relativePath: string,
  ): Promise<ReturnType<typeof compileMmeEffect> | null> {
    const response = await fetch(this.resolveModelUrl(relativePath));
    if (!response.ok) {
      console.warn(
        `Unable to load model MME effect ${relativePath} (${response.status} ${response.statusText}).`,
      );
      return null;
    }
    const source = new TextDecoder("shift_jis").decode(
      await response.arrayBuffer(),
    );
    const compiled = compileMmeEffect(source, { sourceName: relativePath });
    if (!compiled.alternativeFull.present) {
      console.warn(
        `Model MME effect ${relativePath} has no supported material adapter.`,
      );
      return null;
    }
    return compiled;
  }
}
