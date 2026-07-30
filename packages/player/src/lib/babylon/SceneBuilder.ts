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
import {
  DEFAULT_MMD_RENDER_SETTINGS,
  type MmdMaterialRenderMode,
  type MmdRenderSettings,
} from "../../types";
import { resolvePlayerResourceUrl } from "../resource-url";

RegisterDxBmpTextureLoader();

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

  private readonly modelPath: string;
  private readonly stagePath: string | null;
  private readonly motionPaths: string[];
  private readonly audioPath: string;
  private readonly cameraDelayFrames: number;
  private readonly backgroundColor: Color4;
  private readonly onEnded?: () => void;
  private renderSettings: MmdRenderSettings;

  constructor({
    modelPath,
    stagePath,
    motionPath,
    audioPath,
    cameraDelaySeconds = 0,
    backgroundColor = new Color4(0.39, 0.69, 0.97, 1),
    renderSettings = DEFAULT_MMD_RENDER_SETTINGS,
    onEnded,
  }: {
    modelPath: string;
    stagePath: string | null;
    motionPath: string[];
    audioPath: string;
    cameraDelaySeconds?: number;
    backgroundColor?: Color4;
    renderSettings?: MmdRenderSettings;
    onEnded?: () => void;
  }) {
    this.modelPath = modelPath;
    this.stagePath = stagePath;
    this.motionPaths = motionPath;
    this.audioPath = audioPath;
    this.cameraDelayFrames = cameraDelaySeconds * 30;
    this.backgroundColor = backgroundColor;
    this.renderSettings = { ...renderSettings };
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
    mmdCamera.maxZ = 300;
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
    arcRotateCamera.maxZ = 1000;
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
    const [mmdAnimation, modelMesh, stageMesh] = await Promise.all([
      this.loadMotion(),
      this.loadMmdMesh(this.modelPath, "model"),
      this.stagePath === null
        ? Promise.resolve(null)
        : this.loadMmdMesh(this.stagePath, "stage"),
    ]);

    await this.configureScene(mmdAnimation, modelMesh, stageMesh);
  }

  private loadMotion(): Promise<MmdAnimation> {
    const vmdLoader = new VmdLoader(this.scene);
    vmdLoader.loggingEnabled = true;

    return vmdLoader.loadAsync(
      "motion",
      this.motionPaths,
      ({ loaded, total }) => {
        console.log(
          `Loading motion... ${loaded}/${total} (${Math.floor((loaded * 100) / total)}%)`,
        );
      },
    );
  }

  private async loadMmdMesh(
    path: string,
    resourceName: "model" | "stage",
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
    mmdAnimation: MmdAnimation,
    modelMesh: MmdMesh,
    stageMesh: MmdMesh | null,
  ): Promise<void> {
    const mmdCamera = this.scene.getCameraByName("mmdCamera") as MmdCamera;
    const arcRotateCamera = this.scene.getCameraByName(
      "arcRotateCamera",
    ) as ArcRotateCamera;

    this.mmdRuntime.addAnimatable(mmdCamera);
    const cameraAnimationHandle =
      mmdCamera.createRuntimeAnimation(mmdAnimation);
    if (this.cameraDelayFrames !== 0) {
      const cameraAnimation = mmdCamera.runtimeAnimations.get(
        cameraAnimationHandle,
      );
      if (cameraAnimation === undefined) {
        throw new Error("Failed to configure camera animation delay");
      }

      const animate = cameraAnimation.animate.bind(cameraAnimation);
      cameraAnimation.animate = (frameTime: number): void => {
        animate(frameTime - this.cameraDelayFrames);
      };
    }
    mmdCamera.setRuntimeAnimation(cameraAnimationHandle);

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

    const mmdModel = this.mmdRuntime.createMmdModel(modelMesh);
    const modelAnimationHandle = mmdModel.createRuntimeAnimation(mmdAnimation);
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
      pipeline.bloomEnabled = settings.bloomEnabled;
      pipeline.bloomWeight = settings.bloomIntensity;
      pipeline.bloomThreshold = settings.bloomThreshold;
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
}
