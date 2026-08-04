import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  compileMmeEffect,
  parseDirectXTextMesh,
  parseEmdEffectMap,
} from "../src";
import { parseArgs } from "../src/cli";

const workingFloorRoot = new URL(
  "../../../resource-manifests/city-party/files/WorkingFloor2_by針金P/",
  import.meta.url,
);

describe("MME effect compiler", () => {
  it("parses offline compiler CLI arguments", () => {
    expect(
      parseArgs([
        "compile",
        "effect.fx",
        "--accessory",
        "effect.x",
        "--output",
        "effect.json",
      ]),
    ).toEqual({
      command: "compile",
      sourcePath: "effect.fx",
      accessoryPath: "effect.x",
      outputPath: "effect.json",
    });
    expect(
      parseArgs(["compile-model", "model.emd", "-o", "model.json"]),
    ).toEqual({
      command: "compile-model",
      sourcePath: "model.emd",
      accessoryPath: undefined,
      outputPath: "model.json",
    });
  });

  it("extracts effect semantics, render targets, passes and shader profiles", () => {
    const source = `
      float4x4 World : WORLD;
      texture Reflection : OFFSCREENRENDERTARGET <
        float2 ViewPortRatio = { 1, 0.5 };
        bool AntiAlias = true;
        string DefaultEffect = "self = hide;*.pmx = mirror.fxsub;";
      >;
      sampler ReflectionSampler = sampler_state {
        texture = <Reflection>;
        AddressU = CLAMP;
      };
      technique Main < string MMDPass = "object"; > {
        pass Draw {
          VertexShader = compile vs_2_0 VS_Main();
          PixelShader = compile ps_2_0 PS_Main();
          AlphaBlendEnable = true;
        }
      }
    `;

    const result = compileMmeEffect(source, { sourceName: "fixture.fx" });

    expect(result.ok).toBe(true);
    expect(result.ir.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "World", semantic: "WORLD" }),
      ]),
    );
    expect(result.ir.offscreenRenderTargets[0]).toMatchObject({
      name: "Reflection",
      viewportRatio: [1, 0.5],
      antiAlias: true,
    });
    expect(result.ir.samplers[0]).toMatchObject({
      name: "ReflectionSampler",
      texture: "Reflection",
    });
    expect(result.ir.techniques[0]).toMatchObject({
      name: "Main",
      mmdPass: "object",
      passes: [
        expect.objectContaining({
          name: "Draw",
          shaders: [
            expect.objectContaining({
              binding: expect.objectContaining({
                stage: "vertex",
                profile: "vs_2_0",
                entryPoint: "VS_Main",
              }),
            }),
            expect.objectContaining({
              binding: expect.objectContaining({
                stage: "pixel",
                profile: "ps_2_0",
                entryPoint: "PS_Main",
              }),
            }),
          ],
        }),
      ],
    });
    expect(result.classification).toMatchObject({
      present: true,
      routesPmx: true,
      subEffectPmx: "mirror.fxsub",
    });
  });

  it("recognizes the bundled WorkingFloor2 effect structurally", async () => {
    const source = await readFile(
      new URL("WorkingFloor2.fx", workingFloorRoot),
      "latin1",
    );

    const result = compileMmeEffect(source, {
      sourceName: "WorkingFloor2.fx",
    });

    expect(result.ok).toBe(true);
    expect(result.classification).toMatchObject({
      present: true,
      routesPmd: true,
      routesPmx: true,
      subEffectPmx: "WF_Object.fxsub",
    });
    expect(result.ir.offscreenRenderTargets[0]).toMatchObject({
      name: "WorkingFloorRT",
      viewportRatio: [1, 1],
      clearDepth: 1,
      antiAlias: true,
    });
    expect(result.ir.techniques.map((technique) => technique.name)).toEqual(
      expect.arrayContaining(["MainTec", "ShadowTec", "ZplotTec"]),
    );
  });

  it("recognizes every bundled WorkingFloor host variant", async () => {
    const root = new URL(
      "../../../resource-manifests/confectionery-section/files/WorkingFloor2_sm13316343/",
      import.meta.url,
    );
    const paths = [
      "WorkingFloor2.fx",
      "WorkingFloorAL(円形)/WorkingFloorAL.fx",
      "WorkingFloorAL_(円形)影なし/WorkingFloorAL.fx",
      "WorkingFloorAL_sm13316343_im1575145/WorkingFloorAL.fx",
      "WorkingFloorX_sm15642005/WorkingFloorX.fx",
    ];
    for (const path of paths) {
      const source = await readFile(new URL(path, root), "latin1");
      const result = compileMmeEffect(source, { sourceName: path });
      expect(result.classification.present, path).toBe(true);
      expect(result.classification.routesPmx, path).toBe(true);
    }
  });

  it("recognizes AlternativeFull wrappers and their native material inputs", async () => {
    const source = await readFile(
      new URL(
        "../../../resource-manifests/yyb-hatsune-miku-default/files/fx/clothes.fx",
        import.meta.url,
      ),
      "latin1",
    );

    const result = compileMmeEffect(source, { sourceName: "fx/clothes.fx" });

    expect(result.alternativeFull).toEqual({
      present: true,
      includePath: "AlternativeFull.fxsub",
      normalMapPath: "clothes.png",
      thresholdTexturePath: "shading_hint.png",
      softShadow: true,
      softShadowParam: 2,
      anisotropy: 16,
    });
    expect(result.ir.includes).toEqual(["AlternativeFull.fxsub"]);
  });

  it("classifies every bundled post-process family structurally", async () => {
    const root = new URL(
      "../../../resource-manifests/confectionery-section/files/o_full-AlphaTest_im2004305/",
      import.meta.url,
    );
    const fixtures = [
      ["o_Bleach-bypass/o_Bleach-bypass.fx", "bleach-bypass"],
      ["o_LikeHDR/o_LikeHDR.fx", "like-hdr"],
      ["o_PixelBlur/o_PixelEdgeBlur.fx", "pixel-blur"],
      ["o_PixelBlur/o_SimplePixelBlur.fx", "pixel-blur"],
      ["o_toProcColor/o_toProcColor.fx", "process-color"],
      ["o_toProcColor/o_toPaleProcColor.fx", "process-color"],
      ["o_toProcColor/o_toProfileColor.fx", "process-color"],
    ] as const;

    for (const [path, kind] of fixtures) {
      const source = await readFile(new URL(path, root), "latin1");
      const result = compileMmeEffect(source, { sourceName: path });
      expect(result.postProcess, path).toMatchObject({
        present: true,
        kind,
        sceneColorTarget: "ScnMap",
      });
    }
  });

  it("maps the bundled full alpha-test material effect to a native cutoff", async () => {
    const source = await readFile(
      new URL(
        "../../../resource-manifests/confectionery-section/files/o_full-AlphaTest_im2004305/o_full-AlphaTest.fx",
        import.meta.url,
      ),
      "latin1",
    );
    const result = compileMmeEffect(source, {
      sourceName: "o_full-AlphaTest.fx",
    });
    expect(result.alphaTest).toEqual({
      present: true,
      alphaReference: 160,
    });
  });
});

describe("EMD material effect maps", () => {
  it("maps material indices and normalizes Windows effect paths", () => {
    const result = parseEmdEffectMap(`
      [Info]
      Version = 3
      [Effect]
      Obj = none
      Obj.show = true
      Obj[4] = fx\\clothes.fx
      Obj[5] = none
    `);

    expect(result.effectMap).toEqual({
      version: 3,
      objectEffectPath: null,
      objectVisible: true,
      materials: [
        { materialIndex: 4, effectPath: "fx/clothes.fx" },
        { materialIndex: 5, effectPath: null },
      ],
    });
  });

  it("parses every bundled YYB EMD assignment", async () => {
    const paths = [
      "yyb-hatsune-miku-10th/files/YYB Hatsune Miku_10th_v1.02.emd",
      "yyb-hatsune-miku-10th/files/YYB Hatsune Miku_10th_v1.02_toonchange.emd",
      "yyb-hatsune-miku-default/files/YYB Hatsune Miku_default_1.0ver.emd",
      "yyb-hatsune-miku-nt/files/YYB Hatsune Miku_NT_1.0ver.emd",
    ];
    for (const path of paths) {
      const source = await readFile(
        new URL(`../../../resource-manifests/${path}`, import.meta.url),
        "utf8",
      );
      const result = parseEmdEffectMap(source);
      expect(result.diagnostics).toEqual([]);
      expect(result.effectMap?.version).toBe(3);
      expect(result.effectMap?.materials.length).toBeGreaterThan(0);
    }
  });
});

describe("DirectX text mesh compiler", () => {
  it("triangulates polygons and calculates bounds", () => {
    const result = parseDirectXTextMesh(`
      xof 0302txt 0064
      Mesh {
        4;
        -1;0;-2;,
         1;0;-2;,
         1;0; 2;,
        -1;0; 2;;
        1;
        4;0,1,2,3;;
      }
    `);

    expect(result.mesh).toMatchObject({
      vertexCount: 4,
      faceCount: 1,
      triangleCount: 2,
      indices: [0, 1, 2, 0, 2, 3],
      bounds: { min: [-1, 0, -2], max: [1, 0, 2] },
    });
    expect(result.diagnostics).toEqual([]);
  });

  it("accepts named DirectX Mesh blocks used by post-process accessories", () => {
    const result = parseDirectXTextMesh(`
      xof 0303txt 0032
      Mesh mesh_0 {
        3;
        0;0;0;,
        1;0;0;,
        0;1;0;;
        1;
        3;0,1,2;;
      }
    `);
    expect(result.mesh).toMatchObject({
      vertexCount: 3,
      triangleCount: 1,
    });
  });

  it("accepts comma-terminated faces from older accessory exporters", () => {
    const result = parseDirectXTextMesh(`
      xof 0303txt 0032
      Mesh mesh_0 {
        4;
        0;0;0;, 1;0;0;, 0;1;0;, 1;1;0;;
        2;
        3;0,1,2,
        3;1,3,2;;
        MeshTextureCoords {
          4;
          0,0; 1,0; 0,1; 1,1;;
        }
      }
    `);
    expect(result.mesh).toMatchObject({
      faceCount: 2,
      triangleCount: 2,
      uvs: [[0, 0], [1, 0], [0, 1], [1, 1]],
    });
  });

  it("converts the bundled WorkingFloor2 accessory mesh", async () => {
    const source = await readFile(
      new URL("WorkingFloor2.x", workingFloorRoot),
      "utf8",
    );

    const result = parseDirectXTextMesh(source);

    expect(result.mesh).not.toBeNull();
    expect(result.mesh).toMatchObject({
      vertexCount: 441,
      bounds: { min: [-5, 0, -5], max: [5, 0, 5] },
    });
    expect(result.mesh!.triangleCount).toBeGreaterThan(0);
    expect(result.diagnostics.filter(({ severity }) => severity === "error"))
      .toEqual([]);
  });
});
