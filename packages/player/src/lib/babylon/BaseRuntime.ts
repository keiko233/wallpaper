import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import type { Scene } from "@babylonjs/core/scene";

export interface ISceneBuilder {
  build(
    canvas: HTMLCanvasElement,
    engine: AbstractEngine,
  ): Scene | Promise<Scene>;
}

export interface BaseRuntimeInitParams {
  canvas: HTMLCanvasElement;
  engine: AbstractEngine;
  sceneBuilder: ISceneBuilder;
  /** Called after every rendered frame with the frame duration in ms. */
  onFrame?: (frameTimeMs: number, engine: AbstractEngine) => void;
  /** Called when frame timing must restart after activation or tab hiding. */
  onFrameReset?: () => void;
}

export class BaseRuntime {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _engine: AbstractEngine;
  private readonly _onFrame: ((frameTimeMs: number, engine: AbstractEngine) => void) | undefined;
  private readonly _onFrameReset: (() => void) | undefined;
  private _scene: Scene;
  private _onTick: () => void;
  private _disposed = false;
  private _running = false;
  private _lastFrameAt = 0;
  private _skipNextFrameSample = true;
  private _frameIntervalMs = 0;

  private constructor(params: BaseRuntimeInitParams) {
    this._canvas = params.canvas;
    this._engine = params.engine;
    this._onFrame = params.onFrame;
    this._onFrameReset = params.onFrameReset;

    this._scene = null!;
    this._onTick = null!;
  }

  public static async Create(
    params: BaseRuntimeInitParams,
  ): Promise<BaseRuntime> {
    const runtime = new BaseRuntime(params);
    runtime._scene = await runtime._initialize(params.sceneBuilder);
    runtime._onTick = runtime._makeOnTick();
    return runtime;
  }

  public run(): void {
    if (this._running || this._disposed) return;
    this._running = true;
    const engine = this._engine;

    this._resetFrameClock();

    window.addEventListener("resize", this._onResize);
    document.addEventListener("visibilitychange", this._onVisibilityChange);
    engine.runRenderLoop(this._onTick);
  }

  public stop(): void {
    if (!this._running || this._disposed) return;
    this._running = false;

    window.removeEventListener("resize", this._onResize);
    document.removeEventListener("visibilitychange", this._onVisibilityChange);
    this._engine.stopRenderLoop(this._onTick);
  }

  /** Caps the render loop to the given frame rate; 0 or negative disables the cap. */
  public setFpsLimit(framesPerSecond: number): void {
    this._frameIntervalMs = framesPerSecond > 0 ? 1000 / framesPerSecond : 0;
  }

  public dispose(): void {
    if (this._disposed) return;
    this.stop();
    this._disposed = true;
    this._engine.dispose();
  }

  private readonly _onResize = (): void => {
    this._engine.resize();
  };

  private readonly _onVisibilityChange = (): void => {
    this._lastFrameAt = performance.now();
    this._skipNextFrameSample = true;
    if (document.visibilityState === "visible") {
      this._onFrameReset?.();
    }
  };

  private _resetFrameClock(): void {
    this._lastFrameAt = performance.now();
    this._skipNextFrameSample = true;
    this._onFrameReset?.();
  }

  private async _initialize(sceneBuilder: ISceneBuilder): Promise<Scene> {
    return await sceneBuilder.build(this._canvas, this._engine);
  }

  private _makeOnTick(): () => void {
    const scene = this._scene;
    const engine = this._engine;
    const onFrame = this._onFrame;
    return () => {
      const now = performance.now();
      if (
        this._frameIntervalMs > 0 &&
        now - this._lastFrameAt < this._frameIntervalMs
      ) {
        return;
      }
      const frameTimeMs = now - this._lastFrameAt;
      this._lastFrameAt = now;
      scene.render();

      if (document.visibilityState !== "visible") return;
      if (this._skipNextFrameSample) {
        this._skipNextFrameSample = false;
        return;
      }
      onFrame?.(frameTimeMs, engine);
    };
  }
}
