import { Engine } from "@babylonjs/core/Engines/engine";
import type { Color4 } from "@babylonjs/core/Maths/math.color";
import { BaseRuntime } from "./BaseRuntime";
import { SceneBuilder } from "./SceneBuilder";
import type { MmdRenderSettings } from "../../types";

export interface MmdLoadOptions {
  modelPath: string;
  stagePath: string | null;
  motionPath: string[];
  audioPath: string;
  cameraPath?: string;
  cameraDelaySeconds?: number;
  backgroundColor: Color4;
  renderSettings: MmdRenderSettings;
}

/** Imperative boundary between React and the Babylon.js runtime. */
export class MmdController {
  private generation = 0;
  private engine: Engine | null = null;
  private runtime: BaseRuntime | null = null;
  private sceneBuilder: SceneBuilder | null = null;
  private onEnded: (() => void) | null = null;

  public async load(
    canvas: HTMLCanvasElement,
    options: MmdLoadOptions,
  ): Promise<boolean> {
    const generation = ++this.generation;
    this.disposeCurrentRuntime();

    const engine = new Engine(
      canvas,
      true,
      {
        preserveDrawingBuffer: false,
        stencil: false,
        antialias: false,
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: "high-performance",
        doNotHandleTouchAction: true,
        doNotHandleContextLost: true,
        audioEngine: false,
        adaptToDeviceRatio: true,
      },
      true,
    );
    const sceneBuilder = new SceneBuilder({
      ...options,
      onEnded: () => this.onEnded?.(),
    });

    this.engine = engine;
    this.sceneBuilder = sceneBuilder;

    try {
      const runtime = await BaseRuntime.Create({
        canvas,
        engine,
        sceneBuilder,
      });

      if (generation !== this.generation || this.engine !== engine) {
        runtime.dispose();
        return false;
      }

      this.runtime = runtime;
      return true;
    } catch (error) {
      if (this.engine === engine) {
        this.engine = null;
        this.sceneBuilder = null;
      }
      engine.dispose();

      if (generation !== this.generation) return false;
      throw error;
    }
  }

  public setBackgroundColor(color: Color4): void {
    this.sceneBuilder?.setBackgroundColor(color);
  }

  public setRenderSettings(settings: MmdRenderSettings): void {
    this.sceneBuilder?.setRenderSettings(settings);
  }

  public setOnEnded(callback: (() => void) | null): void {
    this.onEnded = callback;
  }

  public activate(): boolean {
    if (this.runtime === null) return false;
    this.runtime.run();
    return true;
  }

  public deactivate(): boolean {
    if (this.runtime === null) return false;
    this.sceneBuilder?.getRuntime().pauseAnimation();
    this.runtime.stop();
    return true;
  }

  public async play(): Promise<boolean> {
    if (this.runtime === null) return false;
    await this.sceneBuilder?.getRuntime().playAnimation();
    return true;
  }

  public pause(): boolean {
    if (this.runtime === null) return false;
    this.sceneBuilder?.getRuntime().pauseAnimation();
    return true;
  }

  public async seek(seconds: number): Promise<void> {
    if (this.runtime === null) return;
    await this.sceneBuilder
      ?.getRuntime()
      .seekAnimation(Math.max(0, seconds) * 30, true);
  }

  public setVolume(volume: number): void {
    if (this.runtime === null) return;
    const audioPlayer = this.sceneBuilder?.getAudioPlayer();
    if (audioPlayer !== undefined) {
      audioPlayer.volume = Math.min(1, Math.max(0, volume));
    }
  }

  public setPlaybackRate(rate: number): void {
    if (this.runtime === null) return;
    const runtime = this.sceneBuilder?.getRuntime();
    if (runtime !== undefined) {
      runtime.timeScale = Math.min(16, Math.max(0.07, rate));
    }
  }

  public dispose(): void {
    ++this.generation;
    this.onEnded = null;
    this.disposeCurrentRuntime();
  }

  private disposeCurrentRuntime(): void {
    if (this.runtime !== null) {
      this.runtime.dispose();
    } else {
      this.engine?.dispose();
    }

    this.runtime = null;
    this.engine = null;
    this.sceneBuilder = null;
  }
}
