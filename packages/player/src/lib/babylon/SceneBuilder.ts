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
import { MmdAmmoPhysics } from "babylon-mmd/esm/Runtime/Physics/mmdAmmoPhysics";
import { MmdAmmoJSPlugin } from "babylon-mmd/esm/Runtime/Physics/mmdAmmoJSPlugin";
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
import { SSAORenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/ssaoRenderingPipeline";
import { SSRRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/ssrRenderingPipeline";
import { Plane } from "@babylonjs/core/Maths/math.plane";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import {
  DEFAULT_MMD_RENDER_SETTINGS,
  type MmdMaterialRenderMode,
  type MmdPhysicsBackend,
  type MmdRenderSettings,
  type StageRenderProfile,
} from "../../types";
import { resolvePlayerResourceUrl } from "../resource-url";

RegisterDxBmpTextureLoader();

// MMD skydomes commonly extend to roughly 1,000 scene units.
const SCENE_CAMERA_MAX_Z = 5_000;

// MMD models are roughly 160 scene units tall, so 500 is safely beyond even
// extreme dance poses.
const PHYSICS_EXPLOSION_DEVIATION = 500;
const PHYSICS_EXPLOSION_FRAMES = 3;
// Fraction of physics-driven bones that must be out of bounds for the
// watchdog to treat it as an explosion. A single hair/skirt bone flinging
// far from the body during fast spins is normal MMD motion, not an explosion.
const PHYSICS_EXPLOSION_BONE_FRACTION = 0.25;
// An explosion must also throw at least one bone well beyond the per-bone
// threshold; this separates full-body blow-ups from extreme dance poses.
const PHYSICS_EXPLOSION_MAX_DEVIATION = 1500;
// Frames over which rigid bodies are gradually re-enabled after playback
// starts or after an explosion recovery. Bodies are enabled in PMX rigid
// body index order; hair and skirt bodies usually come last, so they wake
// only after the rest of the model has settled.
const PHYSICS_ENABLE_RAMP_FRAMES = 45;
// Initial cooldown (in frames) after an explosion before retrying physics.
// Doubles per consecutive explosion, capped at
// PHYSICS_MAX_RECOVERY_COOLDOWN_FRAMES.
const PHYSICS_RECOVERY_COOLDOWN_FRAMES = 60;
const PHYSICS_MAX_RECOVERY_COOLDOWN_FRAMES = 240;

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
  private ssaoPipeline?: SSAORenderingPipeline;
  private ssrPipeline?: SSRRenderingPipeline;
  private rimLight?: DirectionalLight;
  private ammoPlugin?: MmdAmmoJSPlugin;
  private havokPlugin?: HavokPlugin;
  private colorCurves?: ColorCurves;
  private materialStates: MmdMaterialState[] = [];
  private stageRenderProfile: StageRenderProfile | null;
  private stageCloneIndex = 0;
  /** The backend that was actually enabled (ammo may fall back to havok). */
  private actualPhysicsBackend: MmdPhysicsBackend | null = null;

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
    this.shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;
    this.shadowGenerator.frustumEdgeFalloff = 0.1;

    // Rim light: a faint cool back light that separates the model's
    // silhouette from the background, a look video renders get for free
    // from their multi-light setups.
    const rimLight = (this.rimLight = new DirectionalLight(
      "RimLight",
      new Vector3(-0.5, 0.25, -1).normalize(),
      this.scene,
    ));
    rimLight.diffuse = new Color3(0.75, 0.85, 1).toLinearSpace();
    rimLight.specular = new Color3(0, 0, 0);
    rimLight.intensity = 0;
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
    if (
      (this.actualPhysicsBackend ?? this.renderSettings.physicsBackend) ===
      "ammo"
    ) {
      // Bullet via Ammo.js: honors the PMX joint springs and per-body
      // damping that MMD itself uses, so skirts and hair behave like the
      // video renders. This is babylon-mmd's reference physics backend.
      this.mmdRuntime = new MmdRuntime(this.scene, new MmdAmmoPhysics(this.scene));
    } else {
      const mmdPhysics = new MmdPhysics(this.scene);
      // Some PMX models have oddly bent joint limits under Havok; clamping a
      // wider angular range reduces constraint-solver jitter at load time.
      // Lower thresholds keep more of the model author's intended joint
      // motion (softer hair and skirt physics). A reload is required for a
      // change to take effect.
      mmdPhysics.angularLimitClampThreshold =
        (this.renderSettings.physicsConstraintLimitDegrees * Math.PI) / 180;
      this.mmdRuntime = new MmdRuntime(this.scene, mmdPhysics);
    }
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
    if (this.renderSettings.physicsBackend === "ammo") {
      const loaded = await this.loadAmmoPhysicsEngine();
      this.actualPhysicsBackend = loaded ? "ammo" : "havok";
    } else {
      await this.loadHavokPhysicsEngine();
      this.actualPhysicsBackend = "havok";
    }
  }

  private async loadAmmoPhysicsEngine(): Promise<boolean> {
    try {
      console.log("Loading ammo.js physics...");
      const { loadAmmo } = await import("@wallpaper/ammo-wasm");
      const ammo = await loadAmmo();
      const ammoPlugin = (this.ammoPlugin = new MmdAmmoJSPlugin(
        true,
        ammo,
      ));
      this.applyAmmoQualitySettings();
      const physicsEnabled = this.scene.enablePhysics(
        new Vector3(0, -98, 0),
        ammoPlugin,
      );
      if (!physicsEnabled) {
        throw new Error("Failed to enable the Ammo physics engine");
      }
      console.log("Loaded ammo.js physics");
      return true;
    } catch (error) {
      // Fall back to Havok so physics never hard-fails; the backend setting
      // stays as-is but the scene will use Havok until the next reload.
      console.warn(
        "Ammo.js physics failed to load, falling back to Havok.",
        error,
      );
      this.ammoPlugin = undefined;
      await this.loadHavokPhysicsEngine();
      return false;
    }
  }

  private applyAmmoQualitySettings(): void {
    const ammoPlugin = this.ammoPlugin;
    if (ammoPlugin === undefined) return;
    const settings = this.renderSettings;
    ammoPlugin.setFixedTimeStep(1 / settings.physicsStepRate);
    // The old embind build exposes solver fields as plain properties rather
    // than get_/set_ methods despite the TypeScript declarations.
    const solverInfo = ammoPlugin.world.getSolverInfo();
    (solverInfo as unknown as { m_numIterations: number }).m_numIterations =
      settings.physicsSolverIterations;
  }

  private async loadHavokPhysicsEngine(): Promise<void> {
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

    const havokPlugin = (this.havokPlugin = new HavokPlugin(
      true,
      havokInstance,
    ));
    havokPlugin.setTimeStep(1 / this.renderSettings.physicsStepRate);
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

    const physicsStrength = this.renderSettings.physicsStrength;
    if (physicsStrength !== 1) {
      // Scale the PMX joint spring stiffness before the physics model is
      // built. Both backends read these values during buildPhysics, so the
      // strength applies to Bullet and Havok alike.
      const joints = modelMesh.metadata.joints as unknown as {
        springPosition: [number, number, number];
        springRotation: [number, number, number];
      }[];
      for (const joint of joints) {
        const position = joint.springPosition;
        joint.springPosition = [
          position[0] * physicsStrength,
          position[1] * physicsStrength,
          position[2] * physicsStrength,
        ];
        const rotation = joint.springRotation;
        joint.springRotation = [
          rotation[0] * physicsStrength,
          rotation[1] * physicsStrength,
          rotation[2] * physicsStrength,
        ];
      }
    }

    const mmdModel = this.mmdRuntime.createMmdModel(modelMesh);
    const modelAnimationHandle = mmdModel.createRuntimeAnimation(modelAnimation);
    mmdModel.setRuntimeAnimation(modelAnimationHandle);

    // Evaluate the motion's first frame immediately so the skeleton is at
    // the playback pose (not the PMX bind pose) on the first physics tick.
    mmdModel.beforePhysics(0);

    const bodyBone = mmdModel.runtimeBones.find(
      (bone) => bone.name === "センター",
    )!;
    const boneWorldMatrix = new Matrix();

    // Keep the shadow light positioned over the model's center bone so the
    // 1024-2048 unit shadow frustum never loses the model during the dance.
    this.scene.onBeforeRenderObservable.add(() => {
      bodyBone
        .getWorldMatrixToRef(boneWorldMatrix)
        .multiplyToRef(modelMesh.getWorldMatrix(), boneWorldMatrix);
      boneWorldMatrix.getTranslationToRef(
        this.shadowGenerator.getLight().position,
      );
      this.shadowGenerator.getLight().position.y -= 10;
    });

    // --- Physics stability system ---
    // Rigid bodies start fully frozen (kinematic: they follow the animated
    // bones exactly and never collide), which removes load-time jitter from
    // interpenetrating bodies. On playback they are re-enabled gradually so
    // the solver never sees the whole model wake at once. The explosion
    // watchdog freezes physics instead of resetting the animation, then
    // retries with exponentially growing cooldowns, so repeated failures
    // degrade to plain bone-driven animation instead of a broken frame.
    const rigidBodyStates = mmdModel.rigidBodyStates;
    rigidBodyStates.fill(0);

    let isPlaying = false;
    let physicsMode: "frozen" | "enabling" | "active" | "cooling-down" =
      "frozen";
    let physicsRampFrame = 0;
    let explosionCount = 0;
    let recoveryCooldownFrames = 0;
    let brokenPhysicsFrames = 0;

    const freezePhysics = (): void => {
      physicsMode = "frozen";
      physicsRampFrame = 0;
      rigidBodyStates.fill(0);
    };

    const enablePhysicsGradually = (): void => {
      physicsMode = "enabling";
      physicsRampFrame = 0;
      // Snap the bodies to the current animated pose with zero velocity so
      // the first dynamic step does not fight the motion's initial pose.
      mmdModel.initializePhysics();
    };

    this.mmdRuntime.onPlayAnimationObservable.add(() => {
      isPlaying = true;
      // A manual play always gets a fresh ramp; the explosion backoff only
      // applies to automatic retries during continuous playback.
      explosionCount = 0;
      recoveryCooldownFrames = 0;
      enablePhysicsGradually();
    });
    this.mmdRuntime.onPauseAnimationObservable.add(() => {
      isPlaying = false;
      freezePhysics();
    });

    const physicsBones = mmdModel.runtimeBones.filter(
      (bone) => bone.transformAfterPhysics,
    );
    const bodyBoneWorldMatrix = new Matrix();
    const physicsBoneWorldMatrix = new Matrix();
    const bodyBoneWorldPosition = new Vector3();
    const physicsBoneWorldPosition = new Vector3();
    this.scene.onBeforeRenderObservable.add(() => {
      // The runtime does not emit onPause when the animation reaches its
      // end, so freeze explicitly on the last frame to keep the final pose
      // stable until the next seek + play re-ramps the physics.
      const animationEnded =
        this.mmdRuntime.animationDuration > 0 &&
        this.mmdRuntime.currentTime >=
          this.mmdRuntime.animationDuration - 1 / 30;
      if (animationEnded) {
        if (physicsMode !== "frozen") freezePhysics();
        return;
      }

      if (!isPlaying) return;

      if (physicsMode === "enabling") {
        physicsRampFrame += 1;
        const targetEnabled = Math.ceil(
          (rigidBodyStates.length * physicsRampFrame) /
            PHYSICS_ENABLE_RAMP_FRAMES,
        );
        for (let i = 0; i < targetEnabled; ++i) {
          rigidBodyStates[i] = 1;
        }
        if (physicsRampFrame >= PHYSICS_ENABLE_RAMP_FRAMES) {
          rigidBodyStates.fill(1);
          physicsMode = "active";
        }
      } else if (physicsMode === "cooling-down") {
        recoveryCooldownFrames -= 1;
        if (recoveryCooldownFrames <= 0) {
          // Retry with the current backoff; the next explosion doubles it.
          enablePhysicsGradually();
        }
        return;
      } else if (physicsMode === "frozen") {
        return;
      }

      // Explosion watchdog. Only a large fraction of bones leaving the body
      // counts as an explosion; single bones flinging during fast motion are
      // normal MMD physics. A real explosion freezes physics (bodies become
      // kinematic and follow the animation), so the frame recovers instantly
      // without snapping the pose.
      bodyBone
        .getWorldMatrixToRef(bodyBoneWorldMatrix)
        .getTranslationToRef(bodyBoneWorldPosition);

      let maxDeviation = 0;
      let outOfBoundsCount = 0;
      for (const bone of physicsBones) {
        const position = bone
          .getWorldMatrixToRef(physicsBoneWorldMatrix)
          .getTranslationToRef(physicsBoneWorldPosition);
        if (
          !isFinite(position.x) ||
          !isFinite(position.y) ||
          !isFinite(position.z)
        ) {
          outOfBoundsCount = physicsBones.length;
          maxDeviation = Number.POSITIVE_INFINITY;
          break;
        }
        const deviation = Vector3.Distance(position, bodyBoneWorldPosition);
        if (deviation > PHYSICS_EXPLOSION_DEVIATION) {
          outOfBoundsCount += 1;
        }
        if (maxDeviation < deviation) {
          maxDeviation = deviation;
        }
      }

      const exploded =
        maxDeviation > PHYSICS_EXPLOSION_MAX_DEVIATION &&
        physicsBones.length > 0 &&
        outOfBoundsCount >=
          Math.ceil(physicsBones.length * PHYSICS_EXPLOSION_BONE_FRACTION);

      if (exploded) {
        brokenPhysicsFrames += 1;
        if (brokenPhysicsFrames >= PHYSICS_EXPLOSION_FRAMES) {
          brokenPhysicsFrames = 0;
          explosionCount += 1;
          freezePhysics();
          physicsMode = "cooling-down";
          recoveryCooldownFrames = Math.min(
            PHYSICS_MAX_RECOVERY_COOLDOWN_FRAMES,
            PHYSICS_RECOVERY_COOLDOWN_FRAMES *
              2 ** (explosionCount - 1),
          );
        }
      } else {
        brokenPhysicsFrames = 0;
      }
    });

    // SSAO and SSR pipelines are created before the default pipeline so their
    // effects sit ahead of bloom/DoF/tonemapping in the post-process chain.
    // Both are gated behind reloads (see MmdProvider) so toggling them off
    // drops their depth/prepass passes entirely instead of stubbing them.
    if (this.renderSettings.ssaoEnabled) {
      this.ssaoPipeline = new SSAORenderingPipeline(
        "mmdSSAO",
        this.scene,
        { ssaoRatio: 0.5, combineRatio: 1 },
        [mmdCamera, arcRotateCamera],
      );
    }

    if (this.renderSettings.ssrEnabled) {
      this.ssrPipeline = new SSRRenderingPipeline(
        "mmdSSR",
        this.scene,
        [mmdCamera, arcRotateCamera],
        false,
        0,
        true,
      );
    }

    const defaultPipeline = (this.defaultPipeline = new DefaultRenderingPipeline(
      "default",
      true,
      this.scene,
      [mmdCamera, arcRotateCamera],
    ));
    defaultPipeline.samples = this.renderSettings.msaaSamples;
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
      pipeline.samples = settings.msaaSamples;
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

    if (this.ssaoPipeline !== undefined) {
      this.ssaoPipeline.radius = settings.ssaoRadius;
      this.ssaoPipeline.totalStrength = settings.ssaoStrength;
    }

    if (this.ssrPipeline !== undefined) {
      const ssr = this.ssrPipeline;
      ssr.strength = settings.ssrStrength;
      switch (settings.ssrQuality) {
        case "low":
          ssr.maxSteps = 24;
          ssr.ssrDownsample = 1;
          ssr.blurDownsample = 1;
          break;
        case "medium":
          ssr.maxSteps = 48;
          ssr.ssrDownsample = 0;
          ssr.blurDownsample = 1;
          break;
        case "high":
          ssr.maxSteps = 80;
          ssr.ssrDownsample = 0;
          ssr.blurDownsample = 0;
          break;
      }
    }

    if (this.shadowGenerator !== undefined) {
      // The mapSize setter always re-allocates the shadow map; only touch it
      // when the value actually changed.
      if (this.shadowGenerator.mapSize !== settings.shadowMapSize) {
        this.shadowGenerator.mapSize = settings.shadowMapSize;
      }
      if (settings.shadowFiltering === "pcss") {
        this.shadowGenerator.usePercentageCloserFiltering = false;
        this.shadowGenerator.useContactHardeningShadow = true;
      } else {
        this.shadowGenerator.useContactHardeningShadow = false;
        this.shadowGenerator.usePercentageCloserFiltering = true;
      }
    }

    if (this.rimLight !== undefined) {
      this.rimLight.intensity = settings.rimLightEnabled
        ? settings.rimLightIntensity
        : 0;
    }

    if (this.ammoPlugin !== undefined) {
      this.applyAmmoQualitySettings();
    } else if (this.havokPlugin !== undefined) {
      this.havokPlugin.setTimeStep(1 / settings.physicsStepRate);
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
