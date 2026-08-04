import { compileMmeEffect, parseDirectXTextMesh } from "@wallpaper/mme-fx";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Material } from "@babylonjs/core/Materials/material";
import { MirrorTexture } from "@babylonjs/core/Materials/Textures/mirrorTexture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import type { Scene } from "@babylonjs/core/scene";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { MmdMesh } from "babylon-mmd/esm/Runtime/mmdMesh";
import type { StageRenderProfile } from "../../types";
import { applyMmePostProcess } from "./MmdPostProcessAdapter";
import { createFloorMirrorPlane } from "./mirror-plane";
import { getMeshGeometryBounds } from "./mesh-geometry-bounds";
import {
  fitWorkingFloorToMeshes,
  inferWorkingFloorFit,
  mergeMeshBounds,
} from "./working-floor-fit";

type MmeEffectProfile = NonNullable<StageRenderProfile["effects"]>[number];

export interface MmdEffectHostOptions {
  scene: Scene;
  root: TransformNode;
  stageMesh: MmdMesh;
  modelMesh: MmdMesh;
  skyboxMesh: MmdMesh | null;
  preferredFloorMeshes?: readonly Mesh[];
  resolveStageUrl(relativePath: string): string;
}

/**
 * Executes the MME host-side behavior that cannot be represented by a shader
 * translation alone: render targets, model routing and accessory geometry.
 * Shader bodies remain in the compiler IR so additional adapters/backends can
 * be added without changing stage manifests.
 */
export class MmdEffectHost {
  private readonly scene: Scene;
  private readonly root: TransformNode;
  private readonly stageMesh: MmdMesh;
  private readonly modelMesh: MmdMesh;
  private readonly skyboxMesh: MmdMesh | null;
  private readonly preferredFloorMeshes: readonly Mesh[];
  private readonly resolveStageUrl: (relativePath: string) => string;

  public constructor(options: MmdEffectHostOptions) {
    this.scene = options.scene;
    this.root = options.root;
    this.stageMesh = options.stageMesh;
    this.modelMesh = options.modelMesh;
    this.skyboxMesh = options.skyboxMesh;
    this.preferredFloorMeshes = options.preferredFloorMeshes ?? [];
    this.resolveStageUrl = options.resolveStageUrl;
  }

  public async apply(effects: readonly MmeEffectProfile[]): Promise<void> {
    for (const effect of effects) {
      try {
        await this.applyEffect(effect);
      } catch (error) {
        console.warn(
          `Unable to apply MME effect ${effect.sourcePath}; continuing without it.`,
          error,
        );
      }
    }
  }

  private async applyEffect(profile: MmeEffectProfile): Promise<void> {
    const source = await this.loadText(profile.sourcePath, "shift_jis");
    const compiled = compileMmeEffect(source, {
      sourceName: profile.sourcePath,
    });

    for (const diagnostic of compiled.diagnostics) {
      if (diagnostic.severity === "error") {
        console.warn(
          `[MME ${profile.sourcePath}] ${diagnostic.code}: ${diagnostic.message}`,
        );
      }
    }

    if (compiled.alphaTest.present) {
      const configuredReference =
        profile.parameters.AlphaRef ??
        profile.parameters.alphaRef ??
        compiled.alphaTest.alphaReference ??
        128;
      const cutoff = Math.min(
        1,
        Math.max(0, configuredReference > 1 ? configuredReference / 255 : configuredReference),
      );
      for (const material of this.stageMesh.metadata.materials) {
        if (
          material instanceof StandardMaterial &&
          material.diffuseTexture?.hasAlpha
        ) {
          material.useAlphaFromDiffuseTexture = true;
          material.transparencyMode = Material.MATERIAL_ALPHATEST;
          material.alphaCutOff = cutoff;
          material.forceDepthWrite = true;
        }
      }
      return;
    }

    if (compiled.postProcess.present) {
      const postProcess = applyMmePostProcess(
        this.scene,
        profile.sourcePath,
        compiled.postProcess,
        profile.parameters,
      );
      if (postProcess === null) {
        console.warn(
          `MME post-process ${profile.sourcePath} was recognized but could not be attached.`,
        );
      }
      return;
    }

    if (!compiled.classification.present) {
      console.warn(
        `MME effect ${profile.sourcePath} compiled, but no supported host adapter matched it.`,
      );
      return;
    }
    if (profile.accessoryPath === undefined) {
      throw new Error("WorkingFloor-compatible effects require accessoryPath");
    }

    const accessorySource = await this.loadText(
      profile.accessoryPath,
      "utf-8",
    );
    const parsed = parseDirectXTextMesh(accessorySource);
    const meshData = parsed.mesh;
    if (meshData === null) {
      throw new Error(
        `Unable to convert ${profile.accessoryPath}: ${parsed.diagnostics
          .map(({ message }) => message)
          .join("; ")}`,
      );
    }

    const positions = meshData.positions.flatMap((position) => position);
    const normals = new Array<number>(positions.length).fill(0);
    VertexData.ComputeNormals(positions, meshData.indices, normals);

    const reflector = new Mesh(
      `mme:${profile.sourcePath}:accessory`,
      this.scene,
    );
    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = meshData.indices;
    vertexData.normals = normals;
    if (meshData.uvs?.length === meshData.vertexCount) {
      vertexData.uvs = meshData.uvs.flatMap((uv) => uv);
    }
    vertexData.applyToMesh(reflector, false);
    reflector.parent = this.root;
    reflector.isPickable = false;
    reflector.receiveShadows = false;
    reflector.alphaIndex = Number.MAX_SAFE_INTEGER;

    const floor = this.inferFloorFit();
    const sourceWidth = meshData.bounds.max[0] - meshData.bounds.min[0];
    const sourceDepth = meshData.bounds.max[2] - meshData.bounds.min[2];
    const sourceCenterX =
      (meshData.bounds.min[0] + meshData.bounds.max[0]) * 0.5;
    const sourceCenterZ =
      (meshData.bounds.min[2] + meshData.bounds.max[2]) * 0.5;
    if (profile.fitToStage && sourceWidth > 0 && sourceDepth > 0) {
      reflector.scaling.x = (floor.maxX - floor.minX) / sourceWidth;
      reflector.scaling.z = (floor.maxZ - floor.minZ) / sourceDepth;
    }
    // WorkingFloor reflects around the accessory origin. ADD_HEIGHT only
    // raises the drawn sheet to avoid z-fighting with the authored floor.
    const mirrorPlaneY = floor.y;
    const reflectorSurfaceY = floor.y + profile.planeOffset;
    const rootWorldInverse = this.root
      .computeWorldMatrix(true)
      .clone()
      .invert();
    const localCenter = Vector3.TransformCoordinates(
      new Vector3(
        (floor.minX + floor.maxX) * 0.5,
        reflectorSurfaceY,
        (floor.minZ + floor.maxZ) * 0.5,
      ),
      rootWorldInverse,
    );
    reflector.position.x =
      localCenter.x - sourceCenterX * reflector.scaling.x;
    reflector.position.z =
      localCenter.z - sourceCenterZ * reflector.scaling.z;
    reflector.position.y = localCenter.y - meshData.bounds.max[1];

    const target = compiled.classification.offscreenTargets[0];
    const mirror = new MirrorTexture(
      `mme:${target?.name ?? "offscreen"}`,
      profile.textureSize,
      this.scene,
      false,
    );
    mirror.mirrorPlane = createFloorMirrorPlane(mirrorPlaneY);
    mirror.renderList = [
      ...this.modelMesh.metadata.meshes,
      ...this.stageMesh.metadata.meshes,
      ...(this.skyboxMesh === null ? [] : this.skyboxMesh.metadata.meshes),
    ];

    const material = new StandardMaterial(
      `mme:${profile.sourcePath}:material`,
      this.scene,
    );
    material.disableLighting = true;
    material.diffuseColor = Color3.Black();
    material.specularColor = Color3.Black();
    material.reflectionTexture = mirror;
    material.alpha = Math.min(
      1,
      Math.max(0, profile.parameters.Tr ?? profile.parameters.tr ?? 1),
    );
    material.backFaceCulling = false;
    reflector.material = material;

    reflector.computeWorldMatrix(true);
    const reflectorBounds = reflector.getBoundingInfo().boundingBox;
    console.info(
      `[MME ${profile.sourcePath}] Applied WorkingFloor reflection ${JSON.stringify({
        planeY: mirrorPlaneY,
        surfaceY: reflectorSurfaceY,
        bounds: {
          minX: floor.minX,
          maxX: floor.maxX,
          minZ: floor.minZ,
          maxZ: floor.maxZ,
        },
        reflectorY: {
          min: reflectorBounds.minimumWorld.y,
          max: reflectorBounds.maximumWorld.y,
        },
        opacity: material.alpha,
        textureSize: profile.textureSize,
        preferredFloorMeshes: this.preferredFloorMeshes.map(
          (mesh) => mesh.material?.name ?? mesh.name,
        ),
      })}`,
    );
  }

  private inferFloorFit(): ReturnType<typeof inferWorkingFloorFit> {
    const preferredBounds = this.preferredFloorMeshes
      .map(getMeshGeometryBounds)
      .filter((bounds) => bounds !== null);
    const preferredFit = fitWorkingFloorToMeshes(preferredBounds);
    if (preferredFit !== null) return preferredFit;

    const stageGeometryBounds = this.stageMesh.metadata.meshes
      .map(getMeshGeometryBounds)
      .filter((bounds) => bounds !== null);
    const stageBounds =
      mergeMeshBounds(stageGeometryBounds) ??
      (() => {
        const hierarchy = this.stageMesh.getHierarchyBoundingVectors(true);
        return { min: hierarchy.min, max: hierarchy.max };
      })();
    return inferWorkingFloorFit(
      stageBounds,
      stageGeometryBounds,
    );
  }

  private async loadText(
    relativePath: string,
    encoding: "shift_jis" | "utf-8",
  ): Promise<string> {
    const response = await fetch(this.resolveStageUrl(relativePath));
    if (!response.ok) {
      throw new Error(
        `Unable to load ${relativePath} (${response.status} ${response.statusText})`,
      );
    }
    return new TextDecoder(encoding).decode(await response.arrayBuffer());
  }
}
