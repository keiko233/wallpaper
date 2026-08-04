import { describe, expect, it } from "vitest";
import { lineAtTime, parseLrc } from "../src/lib/lyrics";

const SAMPLE = `[offset:120]
[00:00.00]作词 : q*Left
[00:01.00]作曲 : Giga/P*Light
[00:08.96]"Are you free tonight?"
[00:13.47]お気に入り muskと 甘々な秘密纏う
[01:10.75]I just Gimme×Gimme
[01:04.34]今は踊りましょう
[00:11.19]Called from you,now
[00:20.29]This weekend night!!
[03:32.50]Maybe next time
`;

describe("parseLrc", () => {
  it("parses timed lines, drops credits and sorts chronologically", () => {
    const lines = parseLrc(SAMPLE);
    expect(lines.map(({ text }) => text)).toEqual([
      "\"Are you free tonight?\"",
      "Called from you,now",
      "お気に入り muskと 甘々な秘密纏う",
      "This weekend night!!",
      "今は踊りましょう",
      "I just Gimme×Gimme",
      "Maybe next time",
    ]);
    expect(lines.map(({ time }) => time)).toEqual([
      8.96 + 0.12,
      11.19 + 0.12,
      13.47 + 0.12,
      20.29 + 0.12,
      64.34 + 0.12,
      70.75 + 0.12,
      212.5 + 0.12,
    ]);
  });

  it("keeps lines with multiple timestamps once per stamp", () => {
    const lines = parseLrc("[01:01.00][01:02.50]do re mi\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toEqual({ time: 61, text: "do re mi" });
    expect(lines[1]).toEqual({ time: 62.5, text: "do re mi" });
  });

  it("drops empty and metadata-only lines", () => {
    expect(parseLrc("[00:00.00]\n[00:01.00]Vocal: Miku\n")).toEqual([]);
  });
});

describe("lineAtTime", () => {
  const lines = [
    { time: 0, text: "a" },
    { time: 2, text: "b" },
    { time: 6, text: "c" },
  ];

  it("returns null before the first line", () => {
    expect(lineAtTime(lines, -1)).toBeNull();
  });

  it("returns the active line and progress within it", () => {
    expect(lineAtTime(lines, 1)).toEqual({
      line: lines[0],
      index: 0,
      progress: 0.5,
    });
    expect(lineAtTime(lines, 5.5)).toEqual({
      line: lines[1],
      index: 1,
      progress: 0.875,
    });
  });

  it("clamps progress to 1 on the last line", () => {
    expect(lineAtTime(lines, 100)!.progress).toBe(1);
  });
});
