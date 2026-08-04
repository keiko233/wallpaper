export interface LrcLine {
  /** Start time in seconds. */
  time: number;
  text: string;
}

/**
 * Lines that credit the song (composer, arrangement, translation, ...) rather
 * than singable lyrics. Kept out of the synced display.
 */
const CREDIT_LINE_PATTERN =
  /^(作词|作詞|作曲|编曲|編曲|翻译|翻譯|译|制作|製作|混音|后期|後期|演唱|和声|合唱|协力|協力|动画|動畫|素材|原曲|原唱|企划|企劃|策划|策劃|监督|監督|导演|導演|staff|vocal|lyrics|music|arrange|arrangement|compose|composer|produce|producer|mix|mastering|guitar|bass|drums|piano|keyboard|synthesizer|illustration|illustrator|design|video|movie|uploader|encode|special thanks|original|cover)(\s|:)/i;

const TIME_TAG_PATTERN = /\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;

function timestampToSeconds(minutes: string, seconds: string, fraction: string | undefined): number {
  const fractionMs = (fraction ?? "").padEnd(3, "0").slice(0, 3);
  return Number(minutes) * 60 + Number(seconds) + Number(fractionMs) / 1000;
}

/**
 * Parses a standard LRC document into chronologically ordered timed lines.
 * Supports multiple timestamps per line, a leading [offset:ms] tag, and
 * drops empty or credit-only lines.
 */
export function parseLrc(source: string): LrcLine[] {
  let offsetMs = 0;
  const lines: LrcLine[] = [];

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0) continue;

    const offsetMatch = /^\[offset\s*:\s*(-?\d+)\s*\]$/i.exec(line);
    if (offsetMatch !== null) {
      offsetMs = Number(offsetMatch[1]);
      continue;
    }

    const times: number[] = [];
    TIME_TAG_PATTERN.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = TIME_TAG_PATTERN.exec(line)) !== null) {
      times.push(timestampToSeconds(match[1]!, match[2]!, match[3]));
    }
    if (times.length === 0) continue;

    const text = line.replace(TIME_TAG_PATTERN, "").trim();
    if (text.length === 0 || CREDIT_LINE_PATTERN.test(text)) continue;

    const offsetSeconds = offsetMs / 1000;
    for (const time of times) {
      lines.push({ time: Math.max(0, time + offsetSeconds), text });
    }
  }

  lines.sort((a, b) => a.time - b.time);
  return lines;
}

/**
 * Finds the lyric line active at `time` and the karaoke progress within it
 * (0..1). Returns null when no line is playing.
 */
export function lineAtTime(lines: readonly LrcLine[], time: number): { line: LrcLine; index: number; progress: number } | null {
  if (lines.length === 0 || time < lines[0]!.time) return null;

  let index = 0;
  for (let i = 0; i < lines.length; i++) {
    if (time >= lines[i]!.time) index = i;
  }
  const line = lines[index]!;
  const next = lines[index + 1];
  const duration = next === undefined ? Math.max(3, line.text.length / 8) : next.time - line.time;
  const progress = duration <= 0 ? 1 : Math.min(1, (time - line.time) / duration);
  return { line, index, progress };
}
