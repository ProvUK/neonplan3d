// A small straight-line "stick" font for the neon sign, drawn with the same kind of glowing tube
// strokes the rest of the house already uses for its edges – no texture, no canvas text. Each glyph
// is a set of polylines on a 0..1 (x) by 0..1 (y, baseline 0, cap height 1) grid. Only the letters
// needed for "WELCOME TO THE JUNGLE" are drawn; an unknown character is skipped (its width still
// counts, so the rest of the line still lines up).

export interface SignSegment {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface Glyph {
  w: number;
  strokes: [number, number][][];
}

const FONT: Record<string, Glyph> = {
  W: { w: 0.85, strokes: [[[0, 1], [0.15, 0], [0.4, 0.65], [0.65, 0], [0.85, 1]]] },
  E: { w: 0.6, strokes: [[[0, 0], [0, 1], [0.6, 1]], [[0, 0.5], [0.5, 0.5]], [[0, 0], [0.6, 0]]] },
  L: { w: 0.6, strokes: [[[0, 1], [0, 0], [0.6, 0]]] },
  C: { w: 0.65, strokes: [[[0.65, 0.85], [0.15, 1], [0, 0.5], [0.15, 0], [0.65, 0.15]]] },
  O: { w: 0.65, strokes: [[[0.15, 0], [0.5, 0], [0.65, 0.15], [0.65, 0.85], [0.5, 1], [0.15, 1], [0, 0.85], [0, 0.15], [0.15, 0]]] },
  M: { w: 0.7, strokes: [[[0, 0], [0, 1], [0.35, 0.5], [0.7, 1], [0.7, 0]]] },
  T: { w: 0.6, strokes: [[[0, 1], [0.6, 1]], [[0.3, 1], [0.3, 0]]] },
  H: { w: 0.6, strokes: [[[0, 0], [0, 1]], [[0.6, 0], [0.6, 1]], [[0, 0.5], [0.6, 0.5]]] },
  J: { w: 0.45, strokes: [[[0.4, 1], [0.4, 0.2], [0.25, 0], [0.05, 0.15]]] },
  U: { w: 0.65, strokes: [[[0, 1], [0, 0.15], [0.15, 0], [0.5, 0], [0.65, 0.15], [0.65, 1]]] },
  N: { w: 0.6, strokes: [[[0, 0], [0, 1], [0.6, 0], [0.6, 1]]] },
  G: { w: 0.65, strokes: [[[0.65, 0.85], [0.15, 1], [0, 0.5], [0.15, 0], [0.65, 0.15], [0.65, 0.45], [0.35, 0.45]]] },
  " ": { w: 0.4, strokes: [] },
};

/** The sign's own wording; only these two lines are laid out (see the font's letter set above). */
const ROWS = ["WELCOME TO", "THE JUNGLE"];
const GAP = 0.18;
const ROW_GAP = 0.55;

function rowWidth(text: string): number {
  let cursor = 0;
  for (const ch of text) cursor += (FONT[ch]?.w ?? 0.4) + GAP;
  return cursor - GAP;
}

const ROW_WIDTHS = ROWS.map(rowWidth);
const DESIGN_W = Math.max(...ROW_WIDTHS);
const DESIGN_H = ROWS.length + (ROWS.length - 1) * ROW_GAP;

/** Segments for the sign's text, scaled (uniformly, no stretching) and centred to fit a w × h box. */
export function signSegments(w: number, h: number): SignSegment[] {
  const scale = Math.min(w / DESIGN_W, h / DESIGN_H);
  const designX0 = -(DESIGN_W * scale) / 2;
  const designY0 = (h - DESIGN_H * scale) / 2;
  const out: SignSegment[] = [];
  const rowH = scale * (1 + ROW_GAP);
  ROWS.forEach((text, ri) => {
    const xOff = designX0 + ((DESIGN_W - ROW_WIDTHS[ri]) / 2) * scale;
    const yBase = designY0 + DESIGN_H * scale - scale - ri * rowH;
    let cursor = 0;
    for (const ch of text) {
      const g = FONT[ch];
      if (!g) {
        cursor += 0.4 + GAP;
        continue;
      }
      for (const stroke of g.strokes) {
        for (let i = 0; i + 1 < stroke.length; i++) {
          const [ax, ay] = stroke[i];
          const [bx, by] = stroke[i + 1];
          out.push({
            x0: xOff + (cursor + ax) * scale,
            y0: yBase + ay * scale,
            x1: xOff + (cursor + bx) * scale,
            y1: yBase + by * scale,
          });
        }
      }
      cursor += g.w + GAP;
    }
  });
  return out;
}
