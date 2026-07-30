import { describe, expect, it } from "vitest";
import {
  dependencyClosure,
  resourceIdentity,
  validateDependencyGraph,
  type DependencyGraphNode,
} from "../src";

function node(
  id: string,
  version: string,
  kind: DependencyGraphNode["kind"],
  dependencies: DependencyGraphNode["dependencies"] = [],
): DependencyGraphNode {
  return { id, version, kind, dependencies };
}

describe("resourceDependencyGraph", () => {
  it("rejects duplicate identities", () => {
    expect(() =>
      validateDependencyGraph([
        node("a", "1.0.0", "motion"),
        node("a", "1.0.0", "audio"),
      ]),
    ).toThrow(/Duplicate resource identity: a@1\.0\.0/u);
  });

  it("rejects missing dependency targets", () => {
    expect(() =>
      validateDependencyGraph([
        node("motion", "1.0.0", "motion", [
          { id: "missing", version: "1.0.0", binding: "audio" },
        ]),
      ]),
    ).toThrow(/Dependency target not found.*missing@1\.0\.0/u);
  });

  it("rejects duplicate bindings on the same parent", () => {
    expect(() =>
      validateDependencyGraph([
        node("audio", "1.0.0", "audio"),
        node("motion", "1.0.0", "motion", [
          { id: "audio", version: "1.0.0", binding: "audio" },
          { id: "audio", version: "1.0.0", binding: "audio" },
        ]),
      ]),
    ).toThrow(/Duplicate dependency binding "audio"/u);
  });

  it("rejects audio/camera bindings on non-matching kinds", () => {
    expect(() =>
      validateDependencyGraph([
        node("model", "1.0.0", "model"),
        node("motion", "1.0.0", "motion", [
          { id: "model", version: "1.0.0", binding: "audio" },
        ]),
      ]),
    ).toThrow(/binding "audio" requires "audio"/u);

    expect(() =>
      validateDependencyGraph([
        node("audio", "1.0.0", "audio"),
        node("motion", "1.0.0", "motion", [
          { id: "audio", version: "1.0.0", binding: "camera" },
        ]),
      ]),
    ).toThrow(/binding "camera" requires "camera"/u);
  });

  it("accepts unknown bindings without kind enforcement", () => {
    expect(() =>
      validateDependencyGraph([
        node("a", "1.0.0", "motion"),
        node("b", "1.0.0", "model", [
          { id: "a", version: "1.0.0", binding: "custom" },
        ]),
      ]),
    ).not.toThrow();
  });

  it("rejects cycles", () => {
    expect(() =>
      validateDependencyGraph([
        node("a", "1.0.0", "motion", [
          { id: "b", version: "1.0.0", binding: "loop" },
        ]),
        node("b", "1.0.0", "audio", [
          { id: "a", version: "1.0.0", binding: "loop" },
        ]),
      ]),
    ).toThrow(/Cyclic dependency detected: a@1\.0\.0 -> b@1\.0\.0 -> a@1\.0\.0/u);
  });

  it("validates acyclic graphs", () => {
    expect(() =>
      validateDependencyGraph([
        node("audio", "1.0.0", "audio"),
        node("camera", "1.0.0", "camera"),
        node("motion", "1.0.0", "motion", [
          { id: "audio", version: "1.0.0", binding: "audio" },
          { id: "camera", version: "1.0.0", binding: "camera" },
        ]),
      ]),
    ).not.toThrow();
  });

  it("returns dependencies before dependents in closure order", () => {
    const audio = node("audio", "1.0.0", "audio");
    const camera = node("camera", "1.0.0", "camera");
    const motion = node("motion", "1.0.0", "motion", [
      { id: "audio", version: "1.0.0", binding: "audio" },
      { id: "camera", version: "1.0.0", binding: "camera" },
    ]);

    const closure = dependencyClosure(
      [motion, audio, camera],
      resourceIdentity("motion", "1.0.0"),
    );

    expect(closure).toHaveLength(3);
    expect(closure[0]).toBe(audio);
    expect(closure[1]).toBe(camera);
    expect(closure[2]).toBe(motion);
  });

  it("returns transitive dependencies in closure order", () => {
    const a = node("a", "1.0.0", "audio");
    const b = node("b", "1.0.0", "audio", [
      { id: "a", version: "1.0.0", binding: "audio" },
    ]);
    const motion = node("motion", "1.0.0", "motion", [
      { id: "b", version: "1.0.0", binding: "audio" },
    ]);

    const closure = dependencyClosure(
      [motion, b, a],
      resourceIdentity("motion", "1.0.0"),
    );

    expect(closure.map((n) => n.id)).toEqual(["a", "b", "motion"]);
  });

  it("throws on missing transitive targets in closure", () => {
    expect(() =>
      dependencyClosure(
        [
          node("motion", "1.0.0", "motion", [
            { id: "b", version: "1.0.0", binding: "audio" },
          ]),
        ],
        resourceIdentity("motion", "1.0.0"),
      ),
    ).toThrow(/Dependency target not found.*b@1\.0\.0/u);
  });

  it("throws on cycles in closure", () => {
    expect(() =>
      dependencyClosure(
        [
          node("a", "1.0.0", "motion", [
            { id: "b", version: "1.0.0", binding: "loop" },
          ]),
          node("b", "1.0.0", "audio", [
            { id: "a", version: "1.0.0", binding: "loop" },
          ]),
        ],
        resourceIdentity("a", "1.0.0"),
      ),
    ).toThrow(/Cyclic dependency detected/u);
  });
});

describe("resourceIdentity", () => {
  it("combines id and version into a stable identity", () => {
    expect(resourceIdentity("foo", "1.2.3")).toBe("foo@1.2.3");
  });
});
