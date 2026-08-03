import "babylon-mmd/esm/Loader/pmxLoader";
import "babylon-mmd/esm/Loader/mmdOutlineRenderer";
import "babylon-mmd/esm/Runtime/Animation/mmdRuntimeCameraAnimation";
import "babylon-mmd/esm/Runtime/Animation/mmdRuntimeModelAnimation";
import "@babylonjs/core/Physics/joinedPhysicsEngineComponent";
import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import type { ISceneBuilder } from "./BaseRuntime";
import { Scene } from "@babylonjs/core/scene";
import type { MmdAnimation } from "babylon-mmd/esm/Loader/Animation/mmdAnimation";
import { MmdMaterialRenderMethod } from "babylon-mmd/esm/Loader/materialBuilderBase";
import { MmdStandardMaterial } from "babylon-mmd/esm/Loader/mmdStandardMaterial";
import { MmdStandardMaterialBuilder } from "babylon-mmd/esm/Loader/mmdStandardMaterialBuilder";
import { RegisterDxBmpTextureLoader } from "babylon-mmd/esm/Loader/registerDxBmpTextureLoader";
import { SdefInjector } from "babylon-mmd/esm/Loader/sdefInjector";
import { VmdLoader } from "babylon-mmd/esm/Loader/vmdLoader";
import { StreamAudioPlayer } from "babylon-mmd/esm/Runtime/Audio/streamAudioPlayer";
import { MmdCamera } from "babylon-mmd/esm/Runtime/mmdCamera";
import type { MmdMesh } from "babylon-mmd/esm/Runtime/mmdMesh";
import { MmdPhysics } from "babylon-mmd/esm/Runtime/Physics/mmdPhysics";
import { MmdRuntime } from "babylon-mmd/esm/Runtime/mmdRuntime";
import { LoadAssetContainerAsync } from "@babylonjs/core/Loading/sceneLoader";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import type { GroundMesh } from "@babylonjs/core/Meshes/groundMesh";
import { ShadowOnlyMaterial } from "@babylonjs/materials/shadowOnly";
import HavokPhysics from "@babylonjs/havok";
import havokWasmUrl from "@babylonjs/havok/lib/esm/HavokPhysics.wasm?url";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline";
import { DepthOfFieldEffectBlurLevel } from "@babylonjs/core/PostProcesses/depthOfFieldEffect";
import { ColorCurves } from "@babylonjs/core/Materials/colorCurves";
import { ImageProcessingConfiguration } from "@babylonjs/core/Materials/imageProcessingConfiguration";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { MirrorTexture } from "@babylonjs/core/Materials/Textures/mirrorTexture";
import { Plane } from "@babylonjs/core/Maths/math.plane";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import {
  DEFAULT_MMD_RENDER_SETTINGS,
  type MmdMaterialRenderMode,
  type MmdRenderSettings,
  type StageRenderProfile,
} from "../../types";
import { resolvePlayerResourceUrl } from "../resource-url";

RegisterDxBmpTextureLoader();

// MMD skydomes commonly extend to roughly 1,000 scene units.
const SCENE_CAMERA_MAX_Z = 5_000;

interface MmdMaterialState {
  material: MmdStandardMaterial;
  sphereTexture: MmdStandardMaterial["sphereTexture"];
  toonTexture: MmdStandardMaterial["toonTexture"];
}

function getMaterialRenderMethod(
  mode: MmdMaterialRenderMode,
): MmdMaterialRenderMethod {
  switch (mode) {
    case "balanced":
      return MmdMaterialRenderMethod.DepthWriteAlphaBlendingWithEvaluation;
    case "performance":
      return MmdMaterialRenderMethod.AlphaEvaluation;
    case "mmd":
      return MmdMaterialRenderMethod.DepthWriteAlphaBlending;
  }
}

export class SceneBuilder implements ISceneBuilder {
  private canvas!: HTMLCanvasElement;
  private engine!: AbstractEngine;
  private scene!: Scene;
  private mmdRuntime!: MmdRuntime;
  private shadowGenerator!: ShadowGenerator;
  private mmdRoot!: TransformNode;
  private audioPlayer!: StreamAudioPlayer;
  private hemisphericLight?: HemisphericLight;
  private directionalLight?: DirectionalLight;
  private ground?: GroundMesh;
  private shadowOnlyMaterial?: ShadowOnlyMaterial;
  private defaultPipeline?: DefaultRenderingPipeline;
  private colorCurves?: ColorCurves;
  private materialStates: MmdMaterialState[] = [];
  private stageRenderProfile: StageRenderProfile | null;
  private stageCloneIndex = 0;

  private readonly modelPath: string;
  private readonly stagePath: string | null;
  private readonly skyboxPath: string | null;
  private readonly motionPaths: string[];
  private readonly cameraPath: string | undefined;
  private readonly audioPath: string;
  private readonly cameraDelayFrames: number;
  private readonly backgroundColor: Color4;
  private readonly onEnded?: () => void;
  private renderSettings: MmdRenderSettings;

  constructor({
    modelPath,
    stagePath,
    skyboxPath,
    motionPath,
    audioPath,
    cameraPath,
    cameraDelaySeconds = 0,
    backgroundColor = new Color4(0.39, 0.69, 0.97, 1),
    renderSettings = DEFAULT_MMD_RENDER_SETTINGS,
    stageRenderProfile = null,
    onEnded,
  }: {
    modelPath: string;
    stagePath: string | null;
    skyboxPath: string | null;
    motionPath: string[];
    audioPath: string;
    cameraPath?: string;
    cameraDelaySeconds?: number;
    backgroundColor?: Color4;
    renderSettings?: MmdRenderSettings;
    stageRenderProfile?: StageRenderProfile | null;
    onEnded?: () => void;
  }) {
    this.modelPath = modelPath;
    this.stagePath = stagePath;
    this.skyboxPath = skyboxPath;
    this.motionPaths = motionPath;
    this.cameraPath = cameraPath;
    this.audioPath = audioPath;
    this.cameraDelayFrames = cameraDelaySeconds * 30;
    this.backgroundColor = backgroundColor;
    this.renderSettings = { ...renderSettings };
    this.stageRenderProfile = stageRenderProfile;
    this.onEnded = onEnded;
  }

  public getRuntime(): MmdRuntime {
    return this.mmdRuntime;
  }

  public getAudioPlayer(): StreamAudioPlayer {
    return this.audioPlayer;
  }

  public setBackgroundColor(color: Color4): void {
    color.toLinearSpaceToRef(this.scene.clearColor);
  }

  public setRenderSettings(settings: MmdRenderSettings): void {
    this.renderSettings = { ...settings };
    this.applyRenderSettings();
  }

  public async build(
    canvas: HTMLCanvasElement,
    engine: AbstractEngine,
  ): Promise<Scene> {
    this.canvas = canvas;
    this.engine = engine;
    this.initializeScene();
    this.setupLights();
    this.setupCameras();
    this.setupGround();
    await this.loadPhysicsEngine();
    this.setupMmdRuntime();

    await this.loadResources();

    return this.scene;
  }

  private initializeScene(): void {
    SdefInjector.OverrideEngineCreateEffect(this.engine);

    this.scene = new Scene(this.engine);
    this.scene.ambientColor = Color3.White().scale(
      this.renderSettings.ambientLightIntensity,
    );
    this.scene.clearColor = this.backgroundColor.toLinearSpace();

    this.mmdRoot = new TransformNode("mmdRoot", this.scene);
    this.mmdRoot.position.z = 20;
  }

  private setupCameras(): void {
    const mmdCamera = new MmdCamera(
      "mmdCamera",
      new Vector3(0, 10, 0),
      this.scene,
    );
    mmdCamera.maxZ = SCENE_CAMERA_MAX_Z;
    mmdCamera.minZ = 1;
    mmdCamera.parent = this.mmdRoot;

    const arcRotateCamera = new ArcRotateCamera(
      "arcRotateCamera",
      0,
      0,
      45,
      new Vector3(0, 10, 1),
      this.scene,
    );
    arcRotateCamera.maxZ = SCENE_CAMERA_MAX_Z;
    arcRotateCamera.minZ = 0.1;
    arcRotateCamera.setPosition(new Vector3(0, 10, -45));
    arcRotateCamera.attachControl(this.canvas, false);
    arcRotateCamera.inertia = 0.8;
    arcRotateCamera.speed = 4;

    this.scene.activeCamera = mmdCamera;

    const toggleCamera = (): void => {
      this.scene.activeCamera =
        this.scene.activeCamera === mmdCamera ? arcRotateCamera : mmdCamera;
    };
    this.canvas.addEventListener("dblclick", toggleCamera);
    this.scene.onDisposeObservable.add(() => {
      this.canvas.removeEventListener("dblclick", toggleCamera);
    });
  }

  private setupLights(): void {
    const hemisphericLight = (this.hemisphericLight = new HemisphericLight(
      "HemisphericLight",
      new Vector3(0, 1, 0),
      this.scene,
    ));
    hemisphericLight.intensity =
      this.renderSettings.hemisphericLightIntensity;
    hemisphericLight.specular = new Color3(0, 0, 0);
    hemisphericLight.groundColor = new Color3(1, 1, 1);

    const directionalLight = (this.directionalLight = new DirectionalLight(
      "DirectionalLight",
      new Vector3(0.5, -1, 1),
      this.scene,
    ));
    directionalLight.intensity =
      this.renderSettings.directionalLightIntensity;
    directionalLight.diffuse = Color3.FromHexString(
      this.renderSettings.directionalLightColor,
    ).toLinearSpace();
    directionalLight.autoCalcShadowZBounds = false;
    directionalLight.autoUpdateExtends = false;
    directionalLight.shadowMaxZ = 20;
    directionalLight.shadowMinZ = -20;
    directionalLight.orthoTop = 18;
    directionalLight.orthoBottom = -3;
    directionalLight.orthoLeft = -10;
    directionalLight.orthoRight = 10;
    directionalLight.shadowOrthoScale = 0;

    this.shadowGenerator = new ShadowGenerator(1024, directionalLight, true);
    this.shadowGenerator.transparencyShadow = true;
    this.shadowGenerator.usePercentageCloserFiltering = true;
    this.shadowGenerator.forceBackFacesOnly = true;
    this.shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
    this.shadowGenerator.frustumEdgeFalloff = 0.1;
  }

  private setupGround(): void {
    const ground = (this.ground = CreateGround(
      "ground1",
      { width: 100, height: 100, subdivisions: 2, updatable: false },
      this.scene,
    ));
    ground.receiveShadows = true;
    ground.parent = this.mmdRoot;

    const shadowOnlyMaterial = (this.shadowOnlyMaterial =
      new ShadowOnlyMaterial("shadowOnly", this.scene));
    shadowOnlyMaterial.activeLight =
      this.shadowGenerator.getLight() as DirectionalLight;
    shadowOnlyMaterial.alpha = this.renderSettings.shadowOpacity;
    ground.material = shadowOnlyMaterial;
  }

  private setupMmdRuntime(): void {
    this.mmdRuntime = new MmdRuntime(this.scene, new MmdPhysics(this.scene));
    this.mmdRuntime.register(this.scene);

    this.audioPlayer = new StreamAudioPlayer(this.scene);
    this.audioPlayer.preservesPitch = false;
    this.audioPlayer.source = resolvePlayerResourceUrl(this.audioPath);
    this.audioPlayer.volume = 0.3;
    this.mmdRuntime.setAudioPlayer(this.audioPlayer);

    let ended = false;
    this.mmdRuntime.onAnimationTickObservable.add(() => {
      const duration = this.mmdRuntime.animationDuration;
      const currentTime = this.mmdRuntime.currentTime;
      if (duration > 0 && currentTime >= duration - 1 / 30) {
        if (!ended) {
          ended = true;
          this.onEnded?.();
        }
      } else if (currentTime < duration - 0.5) {
        ended = false;
      }
    });
  }

  private async loadResources(): Promise<void> {
    const [modelAnimation, cameraAnimation, modelMesh, stageMesh, skyboxMesh] =
      await Promise.all([
        this.loadModelMotion(),
        this.loadCameraMotion(),
        this.loadMmdMesh(this.modelPath, "model"),
        this.stagePath === null
          ? Promise.resolve(null)
          : this.loadMmdMesh(this.stagePath, "stage"),
        this.skyboxPath === null
          ? Promise.resolve(null)
          : this.loadMmdMesh(this.skyboxPath, "skybox"),
      ]);

    await this.configureScene(
      modelAnimation,
      cameraAnimation,
      modelMesh,
      stageMesh,
      skyboxMesh,
    );
  }

  private loadModelMotion(): Promise<MmdAnimation> {
    const vmdLoader = new VmdLoader(this.scene);
    vmdLoader.loggingEnabled = true;

    return vmdLoader.loadAsync(
      "model-motion",
      this.motionPaths,
      ({ loaded, total }) => {
        console.log(
          `Loading model motion... ${loaded}/${total} (${Math.floor((loaded * 100) / total)}%)`,
        );
      },
    );
  }

  private loadCameraMotion(): Promise<MmdAnimation | null> {
    if (this.cameraPath === undefined) {
      return Promise.resolve(null);
    }

    const vmdLoader = new VmdLoader(this.scene);
    vmdLoader.loggingEnabled = true;

    return vmdLoader.loadAsync(
      "camera-motion",
      [this.cameraPath],
      ({ loaded, total }) => {
        console.log(
          `Loading camera motion... ${loaded}/${total} (${Math.floor((loaded * 100) / total)}%)`,
        );
      },
    );
  }

  private async loadMmdMesh(
    path: string,
    resourceName: "model" | "stage" | "skybox",
  ): Promise<MmdMesh> {
    const materialBuilder = new MmdStandardMaterialBuilder();
    materialBuilder.renderMethod = getMaterialRenderMethod(
      this.renderSettings.materialRenderMode,
    );

    const container = await LoadAssetContainerAsync(
      path,
      this.scene,
      {
        pluginExtension:
          /\.[a-z0-9]+$/iu.exec(
            new URL(path, "https://wallpaper.invalid").pathname,
          )?.[0],
        onProgress: ({ loaded, total }) => {
          console.log(
            `Loading ${resourceName}... ${loaded}/${total} (${Math.floor((loaded * 100) / total)}%)`,
          );
        },
        pluginOptions: {
          mmdmodel: {
            loggingEnabled: true,
            materialBuilder,
          },
        },
      },
    );

    container.addAllToScene();
    const modelMesh = container.rootNodes[0] as MmdMesh;
    this.materialStates.push(
      ...modelMesh.metadata.materials.flatMap((material) =>
        material instanceof MmdStandardMaterial
          ? [
              {
                material,
                sphereTexture: material.sphereTexture,
                toonTexture: material.toonTexture,
              },
            ]
          : [],
      ),
    );
    this.applyRenderSettings();
    return modelMesh;
  }

  private async loadPhysicsEngine(): Promise<void> {
    console.log("Loading physics engine...");
    const wasmBinary = await fetch(havokWasmUrl);
    if (!wasmBinary.ok) {
      throw new Error(
        `Failed to load Havok WebAssembly (${wasmBinary.status} ${wasmBinary.statusText})`,
      );
    }
    const wasmBinaryArrayBuffer = await wasmBinary.arrayBuffer();

    console.log("Creating scene");
    const havokInstance = await HavokPhysics({
      wasmBinary: wasmBinaryArrayBuffer,
    });
    console.log("Created havok instance");

    const havokPlugin = new HavokPlugin(true, havokInstance);
    const physicsEnabled = this.scene.enablePhysics(
      new Vector3(0, -98, 0),
      havokPlugin,
    );
    if (!physicsEnabled) {
      throw new Error("Failed to enable the Havok physics engine");
    }

    console.log("Loading physics engine success");
  }

  private async configureScene(
    modelAnimation: MmdAnimation,
    cameraAnimation: MmdAnimation | null,
    modelMesh: MmdMesh,
    stageMesh: MmdMesh | null,
    skyboxMesh: MmdMesh | null,
  ): Promise<void> {
    const mmdCamera = this.scene.getCameraByName("mmdCamera") as MmdCamera;
    const arcRotateCamera = this.scene.getCameraByName(
      "arcRotateCamera",
    ) as ArcRotateCamera;

    if (cameraAnimation !== null) {
      this.mmdRuntime.addAnimatable(mmdCamera);
      const cameraAnimationHandle =
        mmdCamera.createRuntimeAnimation(cameraAnimation);
      if (this.cameraDelayFrames !== 0) {
        const runtimeCameraAnimation = mmdCamera.runtimeAnimations.get(
          cameraAnimationHandle,
        );
        if (runtimeCameraAnimation === undefined) {
          throw new Error("Failed to configure camera animation delay");
        }

        const animate = runtimeCameraAnimation.animate.bind(runtimeCameraAnimation);
        runtimeCameraAnimation.animate = (frameTime: number): void => {
          animate(frameTime - this.cameraDelayFrames);
        };
      }
      mmdCamera.setRuntimeAnimation(cameraAnimationHandle);
    }

    modelMesh.parent = this.mmdRoot;

    for (const mesh of modelMesh.metadata.meshes) {
      mesh.receiveShadows = true;
    }
    this.shadowGenerator.addShadowCaster(modelMesh);

    if (stageMesh !== null) {
      stageMesh.parent = this.mmdRoot;
      for (const mesh of stageMesh.metadata.meshes) {
        mesh.receiveShadows = true;
      }
      this.shadowGenerator.addShadowCaster(stageMesh);
      this.ground?.setEnabled(false);
    }

    if (skyboxMesh !== null) {
      skyboxMesh.parent = this.mmdRoot;
      for (const mesh of skyboxMesh.metadata.meshes) {
        mesh.receiveShadows = false;
      }
      // PMX skydomes are huge inward-facing meshes. They must not cast
      // shadows or they would occlude the scene's directional light.
    }

    if (
      stageMesh !== null &&
      this.stageRenderProfile !== null &&
      this.renderSettings.stageEffectsEnabled
    ) {
      this.applyStageRenderProfile(stageMesh, modelMesh, skyboxMesh);
    }

    const mmdModel = this.mmdRuntime.createMmdModel(modelMesh);
    const modelAnimationHandle = mmdModel.createRuntimeAnimation(modelAnimation);
    mmdModel.setRuntimeAnimation(modelAnimationHandle);

    const bodyBone = mmdModel.runtimeBones.find(
      (bone) => bone.name === "センター",
    )!;
    const boneWorldMatrix = new Matrix();

    this.scene.onBeforeRenderObservable.add(() => {
      bodyBone
        .getWorldMatrixToRef(boneWorldMatrix)
        .multiplyToRef(modelMesh.getWorldMatrix(), boneWorldMatrix);
      boneWorldMatrix.getTranslationToRef(
        this.shadowGenerator.getLight().position,
      );
      this.shadowGenerator.getLight().position.y -= 10;
    });

    const defaultPipeline = (this.defaultPipeline = new DefaultRenderingPipeline(
      "default",
      true,
      this.scene,
      [mmdCamera, arcRotateCamera],
    ));
    defaultPipeline.samples = 4;
    defaultPipeline.bloomScale = 0.5;
    defaultPipeline.bloomKernel = 48;
    defaultPipeline.chromaticAberrationEnabled = true;
    defaultPipeline.chromaticAberration.aberrationAmount = 1;
    defaultPipeline.depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.Low;
    defaultPipeline.fxaaEnabled = true;
    defaultPipeline.imageProcessingEnabled = true;

    this.colorCurves = new ColorCurves();
    this.scene.imageProcessingConfiguration.colorCurves = this.colorCurves;
    this.scene.imageProcessingConfiguration.colorCurvesEnabled = true;
    this.scene.imageProcessingConfiguration.toneMappingType =
      ImageProcessingConfiguration.TONEMAPPING_ACES;
    this.applyRenderSettings();
  }

  private applyRenderSettings(): void {
    const settings = this.renderSettings;

    if (this.scene !== undefined) {
      this.scene.ambientColor.setAll(settings.ambientLightIntensity);
      this.scene.imageProcessingConfiguration.exposure = settings.exposure;
      this.scene.imageProcessingConfiguration.contrast = settings.contrast;
      this.scene.imageProcessingConfiguration.vignetteEnabled =
        settings.vignetteEnabled;
      this.scene.imageProcessingConfiguration.vignetteWeight =
        settings.vignetteWeight;
      this.scene.imageProcessingConfiguration.toneMappingEnabled =
        settings.toneMappingEnabled;
    }

    if (this.colorCurves !== undefined) {
      this.colorCurves.globalSaturation = settings.colorSaturation;
    }

    if (this.defaultPipeline !== undefined) {
      const pipeline = this.defaultPipeline;
      const profileBloom = this.stageRenderProfile?.bloom;
      pipeline.bloomEnabled = settings.bloomEnabled;
      if (profileBloom !== undefined && settings.stageEffectsEnabled) {
        pipeline.bloomWeight = Math.min(
          1,
          Math.max(0, settings.bloomIntensity * profileBloom.intensityMultiplier),
        );
        pipeline.bloomThreshold = Math.min(
          1,
          Math.max(0, settings.bloomThreshold + profileBloom.thresholdOffset),
        );
      } else {
        pipeline.bloomWeight = settings.bloomIntensity;
        pipeline.bloomThreshold = settings.bloomThreshold;
      }
      pipeline.depthOfFieldEnabled = settings.depthOfFieldEnabled;
      pipeline.depthOfField.focusDistance =
        settings.depthOfFieldFocusDistance;
      pipeline.depthOfField.fStop = settings.depthOfFieldAperture;
      pipeline.depthOfField.focalLength = 50;
    }

    if (this.hemisphericLight !== undefined) {
      this.hemisphericLight.intensity = settings.hemisphericLightIntensity;
    }

    if (this.directionalLight !== undefined) {
      this.directionalLight.intensity = settings.directionalLightIntensity;
      this.directionalLight.diffuse.copyFrom(
        Color3.FromHexString(settings.directionalLightColor).toLinearSpace(),
      );
    }

    if (this.shadowOnlyMaterial !== undefined) {
      this.shadowOnlyMaterial.alpha = settings.shadowOpacity;
    }

    for (const state of this.materialStates) {
      const material = state.material;
      material.applyAmbientColorToDiffuse =
        settings.applyAmbientColorToDiffuse;
      material.ignoreDiffuseWhenToonTextureIsNull =
        settings.ignoreDiffuseWhenToonTextureIsNull;
      material.sphereTexture = settings.sphereTextureEnabled
        ? state.sphereTexture
        : null;
      material.toonTexture = settings.toonTextureEnabled
        ? state.toonTexture
        : null;
    }
  }

  private applyStageRenderProfile(
    stageMesh: MmdMesh,
    modelMesh: MmdMesh,
    skyboxMesh: MmdMesh | null,
  ): void {
    const profile = this.stageRenderProfile;
    if (profile === null) return;

    if (profile.reflection !== undefined) {
      this.applyStageReflection(
        profile.reflection,
        stageMesh,
        modelMesh,
        skyboxMesh,
      );
    }
    if (profile.emissive !== undefined) {
      this.applyStageEmissive(profile.emissive, stageMesh);
    }
  }

  private findStageMeshes(
    stageMesh: MmdMesh,
    names: readonly string[],
  ): Mesh[] {
    const wanted = new Set(names.map((name) => name.trim()));
    const matched: Mesh[] = [];
    for (const mesh of stageMesh.metadata.meshes) {
      const materialName = mesh.material?.name ?? "";
      if (wanted.has(mesh.name.trim()) || wanted.has(materialName.trim())) {
        matched.push(mesh);
      }
    }
    return matched;
  }

  /**
   * Clones a stage material so profile effects never mutate loader state.
   * Cloned materials keep the MMD shader (reflection and emissive are part
   * of the underlying standard shader) and remain toggleable per mesh.
   */
  private cloneStageMaterial(mesh: Mesh): MmdStandardMaterial | null {
    const source = mesh.material;
    if (!(source instanceof MmdStandardMaterial)) return null;

    const clone = source.clone(
      `${mesh.name}_stageRender_${this.stageCloneIndex++}`,
      true,
    );
    mesh.material = clone;
    this.materialStates.push({
      material: clone,
      sphereTexture: clone.sphereTexture,
      toonTexture: clone.toonTexture,
    });
    return clone;
  }

  private applyStageReflection(
    reflection: NonNullable<StageRenderProfile["reflection"]>,
    stageMesh: MmdMesh,
    modelMesh: MmdMesh,
    skyboxMesh: MmdMesh | null,
  ): void {
    const targets = this.findStageMeshes(
      stageMesh,
      reflection.materialNames,
    );
    if (targets.length === 0) return;

    let planeY = -Infinity;
    for (const mesh of targets) {
      const maximumY = mesh.getHierarchyBoundingVectors(true).max.y;
      if (maximumY > planeY) planeY = maximumY;
    }
    planeY += reflection.planeOffset;

    const mirror = new MirrorTexture(
      "stageRenderMirror",
      reflection.textureSize,
      this.scene,
      false,
    );
    mirror.mirrorPlane = Plane.FromPositionAndNormal(
      new Vector3(0, planeY, 0),
      new Vector3(0, 1, 0),
    );
    // The standard shader scales planar reflections by the texture level.
    mirror.level = reflection.strength;
    mirror.blurKernel = reflection.blurKernel;
    // Reflect the model, the rest of the stage, and the skybox; the
    // reflection-target meshes are excluded so the mirror never recurses.
    mirror.renderList = [
      ...modelMesh.metadata.meshes,
      ...stageMesh.metadata.meshes.filter(
        (mesh) => !targets.includes(mesh),
      ),
      ...(skyboxMesh === null ? [] : skyboxMesh.metadata.meshes),
    ];

    for (const mesh of targets) {
      const clone = this.cloneStageMaterial(mesh);
      if (clone === null) continue;
      clone.reflectionTexture = mirror;
      // Textureless reflectors are water sheets; make them translucent so
      // they read as a wet film over the floor below.
      if (clone.diffuseTexture === null) {
        clone.alpha = reflection.strength;
      }
    }
  }

  private applyStageEmissive(
    groups: NonNullable<StageRenderProfile["emissive"]>,
    stageMesh: MmdMesh,
  ): void {
    const glowLayer = new GlowLayer("stageRenderGlow", this.scene, {
      mainTextureSamples: 2,
    });
    // An empty inclusion list means "all meshes" by default. Profiles use
    // explicit material names, so exclude everything unless it matches.
    glowLayer.setExcludedByDefault(true);

    for (const group of groups) {
      // StandardMaterial has no emissive intensity in 9.17; scale the color
      // instead. The MMD shader clamps the added emissive so the visible
      // surface cannot blow out to pure white.
      const color = Color3.FromHexString(group.color).scale(group.intensity);
      for (const mesh of this.findStageMeshes(
        stageMesh,
        group.materialNames,
      )) {
        const clone = this.cloneStageMaterial(mesh);
        if (clone === null) continue;
        clone.emissiveColor = color;
        // Reuse the diffuse texture as an emissive mask so bright areas of
        // the texture (moon, lamps) drive where the glow appears.
        if (clone.diffuseTexture !== null) {
          clone.emissiveTexture = clone.diffuseTexture;
        }
        glowLayer.addIncludedOnlyMesh(mesh);
      }
    }
  }
}
