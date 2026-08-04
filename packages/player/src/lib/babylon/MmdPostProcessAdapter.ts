import type { MmePostProcessClassification } from "@wallpaper/mme-fx";
import { Effect } from "@babylonjs/core/Materials/effect";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { PostProcess } from "@babylonjs/core/PostProcesses/postProcess";
import type { Scene } from "@babylonjs/core/scene";

const SHADER_NAME = "mmeResourceFilter";

function registerShader(): void {
  const key = `${SHADER_NAME}FragmentShader`;
  if (Effect.ShadersStore[key] !== undefined) return;
  Effect.ShadersStore[key] = `
    varying vec2 vUV;
    uniform sampler2D textureSampler;
    uniform float mode;
    uniform float strength;
    uniform vec2 texelSize;

    vec3 bleachBypass(vec3 color) {
      float luminance = dot(color, vec3(0.299, 0.587, 0.114));
      vec3 monochrome = vec3(luminance);
      vec3 screened = 1.0 - (1.0 - color) * (1.0 - monochrome);
      vec3 multiplied = color * monochrome;
      return mix(multiplied, screened, step(0.5, luminance));
    }

    vec3 likeHdr(vec3 color) {
      float luminance = dot(color, vec3(0.299, 0.587, 0.114));
      vec3 saturated = mix(vec3(luminance), color, 1.28);
      return mix(vec3(0.5), saturated, 0.88);
    }

    vec3 processColor(vec3 color) {
      vec3 cmy = 1.0 - color;
      float key = min(cmy.r, min(cmy.g, cmy.b));
      vec3 ink = clamp(cmy - key * 0.72, 0.0, 1.0);
      vec3 printed = 1.0 - clamp(ink + key * 0.92, 0.0, 1.0);
      return floor(printed * 255.0 + 0.5) / 255.0;
    }

    void main(void) {
      vec4 source = texture2D(textureSampler, vUV);
      vec3 filtered = source.rgb;
      if (mode < 0.5) {
        filtered = bleachBypass(source.rgb);
      } else if (mode < 1.5) {
        filtered = likeHdr(source.rgb);
      } else if (mode < 2.5) {
        vec3 sum = texture2D(textureSampler, vUV + vec2(texelSize.x, 0.0)).rgb;
        sum += texture2D(textureSampler, vUV - vec2(texelSize.x, 0.0)).rgb;
        sum += texture2D(textureSampler, vUV + vec2(0.0, texelSize.y)).rgb;
        sum += texture2D(textureSampler, vUV - vec2(0.0, texelSize.y)).rgb;
        filtered = (source.rgb * 4.0 + sum) / 8.0;
      } else {
        filtered = processColor(source.rgb);
      }
      gl_FragColor = vec4(mix(source.rgb, filtered, clamp(strength, 0.0, 1.0)), source.a);
    }
  `;
}

function modeFor(classification: MmePostProcessClassification): number {
  switch (classification.kind) {
    case "bleach-bypass":
      return 0;
    case "like-hdr":
      return 1;
    case "pixel-blur":
      return 2;
    case "process-color":
      return 3;
    default:
      return -1;
  }
}

export function applyMmePostProcess(
  scene: Scene,
  name: string,
  classification: MmePostProcessClassification,
  parameters: Readonly<Record<string, number>>,
): PostProcess | null {
  const camera = scene.activeCamera;
  const mode = modeFor(classification);
  if (camera === null || mode < 0) return null;
  registerShader();
  const postProcess = new PostProcess(
    `mme:${name}`,
    SHADER_NAME,
    ["mode", "strength", "texelSize"],
    null,
    1,
    camera,
    Texture.BILINEAR_SAMPLINGMODE,
    scene.getEngine(),
  );
  postProcess.onApply = (effect) => {
    effect.setFloat("mode", mode);
    effect.setFloat(
      "strength",
      parameters.Strength ?? parameters.strength ?? 1,
    );
    effect.setFloat2(
      "texelSize",
      1 / Math.max(1, postProcess.width),
      1 / Math.max(1, postProcess.height),
    );
  };
  return postProcess;
}
