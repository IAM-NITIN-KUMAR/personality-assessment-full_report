// Geometric low-poly animal portraits for the v2 report.
// Pure polygon data, consumable by both DOM <svg><polygon> and
// @react-pdf/renderer's <Svg><Polygon> primitives.
//
// Authoring model: each animal is a vertex table (silhouette landmarks +
// interior anchor points) plus a face list of vertex-index polygons.
// Faces share exact vertices, so adjacent facets can never show hairline
// gaps. Painters order: base mesh first, feature overlays (eyes, stripes,
// eyespots) last. All coordinates are hand-plotted inside "0 0 200 200"
// with the subject filling ~80% of the frame. Fully deterministic.

import type { RadarDim } from "./types";

export type AnimalPolygon = { points: string; fill: string };
export type AnimalArt = { viewBox: "0 0 200 200"; bg: string; polygons: AnimalPolygon[] };

const INK = "#0a0e1a";

type Pt = readonly [number, number];
/** [vertex indices (>=3), fill] */
type FaceDef = readonly [ReadonlyArray<number>, string];

function art(bg: string, verts: ReadonlyArray<Pt>, faces: ReadonlyArray<FaceDef>): AnimalArt {
  return {
    viewBox: "0 0 200 200",
    bg,
    polygons: faces.map(([idx, fill]) => ({
      points: idx.map((i) => `${verts[i][0]},${verts[i][1]}`).join(" "),
      fill,
    })),
  };
}

/* ------------------------------------------------------------------ */
/* HAWK — analytical. Side profile facing left, indigo/violet family.  */
/* Landmarks: brow ridge overhang, hooked beak protruding past the     */
/* face (tip x=24 vs brow x=52), gape, chin, nape taper into a bust.   */
/* ------------------------------------------------------------------ */

const HAWK_C = { d1: "#3a3aa6", d2: "#5353d6", m: "#6e6ef0", l1: "#9494f6", l2: "#bcbcfa", hi: "#e9e9fd" };

const HAWK_V: ReadonlyArray<Pt> = [
  [100, 24], // 0 crown
  [134, 34], // 1 back of skull
  [150, 64], // 2 nape upper
  [158, 104], // 3 back
  [164, 148], // 4 shoulder
  [166, 178], // 5 bottom back
  [112, 180], // 6 bottom mid
  [60, 178], // 7 bottom front
  [64, 142], // 8 chest front
  [76, 116], // 9 throat lower
  [68, 96], // 10 chin
  [58, 82], // 11 gape corner
  [36, 88], // 12 beak hook tip
  [24, 72], // 13 beak tip
  [44, 56], // 14 cere
  [52, 46], // 15 brow ridge
  [70, 34], // 16 forehead
  [100, 54], // 17 anchor: skull
  [88, 84], // 18 anchor: cheek
  [118, 112], // 19 anchor: neck
  [108, 152], // 20 anchor: chest
  [42, 70], // 21 beak mid
  // eye diamond
  [66, 57], [75, 53], [80, 60], [71, 64], // 22-25
  // wing wedge overlays
  [126, 124], [150, 148], [124, 158], // 26-28
  [118, 150], [138, 170], [112, 172], // 29-31
  // nape shade quad
  [134, 58], [152, 86], [138, 96], [126, 72], // 32-35
  // malar stripe
  [74, 72], [84, 92], [76, 96], [70, 80], // 36-39
];

const HAWK_F: ReadonlyArray<FaceDef> = [
  [[0, 1, 17], HAWK_C.m],
  [[1, 2, 17], HAWK_C.d2],
  [[2, 3, 19], HAWK_C.m],
  [[3, 4, 19], HAWK_C.d2],
  [[4, 5, 20], HAWK_C.d1],
  [[5, 6, 20], HAWK_C.d2],
  [[6, 7, 20], HAWK_C.m],
  [[7, 8, 20], HAWK_C.l1],
  [[8, 9, 19], HAWK_C.l2],
  [[8, 19, 20], HAWK_C.m],
  [[9, 10, 18], HAWK_C.l1],
  [[9, 18, 19], HAWK_C.m],
  [[10, 11, 18], HAWK_C.l2],
  [[11, 12, 13], INK], // beak hook — ink anchor
  [[14, 13, 21], HAWK_C.d1], // upper beak ridge
  [[13, 11, 21], HAWK_C.d2], // beak underside
  [[11, 14, 21], HAWK_C.m], // beak base
  [[14, 11, 18], HAWK_C.l1], // lore / malar plane
  [[14, 18, 15], HAWK_C.hi], // pale facet framing the eye
  [[15, 18, 17], HAWK_C.l2], // temple
  [[15, 16, 17], HAWK_C.l1], // forehead
  [[16, 0, 17], HAWK_C.hi], // crown highlight
  [[2, 17, 19], HAWK_C.l2], // nape inner
  [[17, 18, 19], HAWK_C.l1], // neck core
  [[4, 19, 20], HAWK_C.d1], // shoulder shade
  [[22, 23, 24, 25], INK], // eye
  [[26, 27, 28], HAWK_C.d1], // folded-wing wedge
  [[29, 30, 31], HAWK_C.d2], // second feather wedge
  [[32, 33, 34, 35], HAWK_C.d2], // nape shade
  [[36, 37, 38, 39], HAWK_C.d1], // malar stripe
];

/* ------------------------------------------------------------------ */
/* ELEPHANT — practical. Side profile facing left, slate/blue-grey.    */
/* Landmarks: domed skull, big ear fan behind the face, trunk hanging  */
/* from the face front with a notch of daylight before the chest,      */
/* trunk tip (y=176) well below the jaw (y~124), tusk hint.            */
/* ------------------------------------------------------------------ */

const ELE_C = { d1: "#46536c", d2: "#5d6b87", m: "#7889a6", l1: "#9caac4", l2: "#c2cbdd", hi: "#eaeef5" };

const ELE_V: ReadonlyArray<Pt> = [
  [84, 28], // 0 dome top
  [118, 34], // 1 back of head / ear attach top
  [154, 50], // 2 ear top
  [174, 92], // 3 ear back
  [164, 138], // 4 ear lower back
  [132, 148], // 5 ear bottom / ear attach bottom
  [148, 178], // 6 shoulder bottom
  [100, 180], // 7 bottom mid
  [78, 174], // 8 chest bottom front
  [68, 124], // 9 notch apex (trunk separates from jaw)
  [64, 152], // 10 trunk inner edge mid
  [56, 176], // 11 trunk tip
  [42, 150], // 12 trunk outer low
  [38, 116], // 13 trunk outer mid
  [44, 88], // 14 trunk base
  [50, 60], // 15 forehead front
  [148, 94], // 16 anchor: ear fan
  [88, 58], // 17 anchor: skull
  [80, 104], // 18 anchor: cheek
  [110, 150], // 19 anchor: chest
  // inner-ear shade quad
  [138, 64], [160, 94], [150, 126], [136, 100], // 20-23
  // eye diamond
  [60, 76], [66, 72], [70, 78], [64, 82], // 24-27
  // tusk (in front of trunk)
  [60, 126], [46, 146], [52, 152], [66, 136], // 28-31
  // trunk wrinkle bands
  [40, 124], [66, 132], [65, 140], [41, 131], // 32-35
  [44, 156], [60, 158], [57, 166], [45, 161], // 36-39
  // cheek shade
  [76, 120], [92, 132], [84, 146], [72, 134], // 40-43
];

const ELE_F: ReadonlyArray<FaceDef> = [
  // ear fan
  [[1, 2, 16], ELE_C.m],
  [[2, 3, 16], ELE_C.l1],
  [[3, 4, 16], ELE_C.m],
  [[4, 5, 16], ELE_C.d2],
  [[5, 1, 16], ELE_C.d1], // attachment shadow
  // head + body
  [[0, 1, 17], ELE_C.l1], // dome
  [[1, 19, 17], ELE_C.m],
  [[1, 5, 19], ELE_C.d2], // shadow under ear
  [[5, 6, 19], ELE_C.m],
  [[6, 7, 19], ELE_C.d2],
  [[7, 8, 19], ELE_C.m],
  [[8, 9, 18], ELE_C.l2], // chest front
  [[8, 18, 19], ELE_C.l1],
  [[9, 14, 18], ELE_C.m], // jaw / cheek
  [[14, 15, 18], ELE_C.l1], // face front
  [[15, 18, 17], ELE_C.l2],
  [[15, 0, 17], ELE_C.hi], // forehead highlight
  [[17, 18, 19], ELE_C.m],
  // trunk (base -> tip)
  [[14, 9, 13], ELE_C.m],
  [[13, 9, 10, 12], ELE_C.l1],
  [[12, 10, 11], ELE_C.m],
  // overlays
  [[20, 21, 22, 23], ELE_C.d1], // inner ear
  [[24, 25, 26, 27], INK], // eye
  [[28, 29, 30, 31], ELE_C.hi], // tusk
  [[32, 33, 34, 35], ELE_C.d2], // trunk band
  [[36, 37, 38, 39], ELE_C.d2], // trunk band low
  [[40, 41, 42, 43], ELE_C.m], // cheek shade
];

/* ------------------------------------------------------------------ */
/* LION — leadership. Front-on symmetric face, warm amber/gold.        */
/* Landmarks: jagged 12-point mane ring (spikes r~80, valleys r~64     */
/* around centre 100,102) fully outside the 7-point face polygon;      */
/* pale muzzle wedge, ink eyes + nose, small ears tucked in the mane.  */
/* ------------------------------------------------------------------ */

const LION_C = { d1: "#9a6210", d2: "#c07d1d", m: "#e09c2e", l1: "#edbb5e", l2: "#f5d795", hi: "#fbeecf" };

const LION_V: ReadonlyArray<Pt> = [
  // mane ring, clockwise from top spike (spike/valley alternating)
  [100, 22], // 0 spike
  [128, 46], // 1 valley
  [164, 56], // 2 spike
  [166, 102], // 3 valley
  [162, 152], // 4 spike
  [130, 162], // 5 valley
  [100, 182], // 6 spike
  [70, 162], // 7 valley
  [38, 152], // 8 spike
  [34, 102], // 9 valley
  [36, 56], // 10 spike
  [72, 46], // 11 valley
  // face polygon
  [78, 54], // 12
  [122, 54], // 13
  [144, 84], // 14
  [136, 128], // 15
  [100, 146], // 16 chin
  [64, 128], // 17
  [56, 84], // 18
  // brow + muzzle interior
  [82, 84], // 19 brow L
  [118, 84], // 20 brow R
  [86, 106], // 21 muzzle L
  [114, 106], // 22 muzzle R
  // eyes
  [74, 86], [84, 82], [90, 88], [80, 92], // 23-26 L
  [126, 86], [116, 82], [110, 88], [120, 92], // 27-30 R
  // nose
  [91, 106], [109, 106], [100, 120], // 31-33
  // chin shade
  [92, 134], [108, 134], // 34-35 (with 16)
  // ears over the mane
  [62, 46], [78, 28], [88, 48], // 36-38 L outer
  [70, 42], [78, 32], [83, 45], // 39-41 L inner
  [138, 46], [122, 28], [112, 48], // 42-44 R outer
  [130, 42], [122, 32], [117, 45], // 45-47 R inner
];

const LION_F: ReadonlyArray<FaceDef> = [
  // mane annulus (fills mirror-symmetric left/right)
  [[0, 1, 13], LION_C.d2],
  [[1, 2, 13], LION_C.d1],
  [[2, 13, 14], LION_C.m],
  [[2, 3, 14], LION_C.d1],
  [[3, 14, 15], LION_C.d2],
  [[3, 4, 15], LION_C.d1],
  [[4, 5, 15], LION_C.m],
  [[5, 15, 16], LION_C.d1],
  [[5, 6, 16], LION_C.d2],
  [[6, 7, 16], LION_C.d2],
  [[7, 16, 17], LION_C.d1],
  [[7, 8, 17], LION_C.m],
  [[8, 17, 18], LION_C.d1],
  [[8, 9, 18], LION_C.d2],
  [[9, 10, 18], LION_C.d1],
  [[10, 18, 12], LION_C.m],
  [[10, 11, 12], LION_C.d1],
  [[11, 0, 12], LION_C.d2],
  [[0, 13, 12], LION_C.m], // top of head inside mane
  // face
  [[12, 13, 20, 19], LION_C.l1], // forehead
  [[13, 14, 20], LION_C.m], // temple R
  [[14, 15, 20], LION_C.l2], // cheek R
  [[20, 15, 22], LION_C.m],
  [[15, 16, 22], LION_C.l1], // jaw R
  [[19, 20, 22, 21], LION_C.hi], // nose bridge
  [[18, 17, 19], LION_C.l2], // cheek L
  [[19, 17, 21], LION_C.m],
  [[17, 16, 21], LION_C.l1], // jaw L
  [[21, 22, 16], LION_C.hi], // muzzle
  [[18, 12, 19], LION_C.m], // temple L
  // features
  [[23, 24, 25, 26], INK], // eye L
  [[27, 28, 29, 30], INK], // eye R
  [[31, 32, 33], INK], // nose
  [[34, 35, 16], LION_C.l2], // chin shade
  [[36, 37, 38], LION_C.m], // ear L
  [[39, 40, 41], LION_C.l1],
  [[42, 43, 44], LION_C.m], // ear R
  [[45, 46, 47], LION_C.l1],
];

/* ------------------------------------------------------------------ */
/* DOLPHIN — people. Side profile facing left, sky/cyan family.        */
/* Landmarks: melon bulge with crease above the rostrum, rostrum       */
/* protruding to x=18, smile notch, dorsal fin apex rising to y=20,    */
/* pale belly, pectoral flipper overlay.                               */
/* ------------------------------------------------------------------ */

const DOL_C = { d1: "#1e6f9f", d2: "#3489bd", m: "#57a6d6", l1: "#84c1e7", l2: "#b2daf2", hi: "#e4f3fb" };

const DOL_V: ReadonlyArray<Pt> = [
  [70, 42], // 0 melon top
  [104, 36], // 1 nape
  [128, 42], // 2 dorsal fin front base
  [150, 20], // 3 dorsal fin apex
  [156, 50], // 4 fin trailing base
  [174, 78], // 5 back
  [182, 124], // 6 flank
  [176, 170], // 7 bottom back
  [128, 180], // 8 bottom
  [84, 164], // 9 belly
  [58, 138], // 10 chest
  [44, 112], // 11 chin
  [24, 98], // 12 lower jaw tip
  [42, 92], // 13 smile notch
  [18, 82], // 14 rostrum tip
  [40, 70], // 15 rostrum top
  [52, 54], // 16 melon front crease
  [76, 66], // 17 anchor: melon
  [58, 96], // 18 anchor: jaw
  [120, 110], // 19 anchor: body
  [96, 140], // 20 anchor: belly
  // eye diamond
  [52, 74], [57, 70], [61, 75], [56, 79], // 21-24
  // smile line (thin quad from the notch back)
  [62, 95], [62, 98], [43, 95], // 25-27 (with 13)
  // pectoral flipper
  [78, 120], [112, 132], [88, 148], [70, 132], // 28-31
  // blowhole
  [72, 44], [80, 41], [77, 48], // 32-34
  // fin leading-edge light
  [146, 40], // 35 (with 2, 3)
];

const DOL_F: ReadonlyArray<FaceDef> = [
  [[0, 1, 17], DOL_C.l1], // melon
  [[1, 2, 19], DOL_C.d2],
  [[2, 3, 4], DOL_C.d1], // dorsal fin
  [[2, 4, 19], DOL_C.m],
  [[4, 5, 19], DOL_C.d2],
  [[5, 6, 19], DOL_C.m],
  [[6, 7, 19], DOL_C.d2],
  [[7, 8, 19], DOL_C.m],
  [[8, 19, 20], DOL_C.l1],
  [[8, 9, 20], DOL_C.l2],
  [[9, 10, 20], DOL_C.hi], // belly
  [[10, 20, 18], DOL_C.l2],
  [[10, 11, 18], DOL_C.hi], // throat
  [[11, 12, 18], DOL_C.l2], // lower jaw
  [[12, 13, 18], DOL_C.l1],
  [[13, 14, 18], DOL_C.l2], // upper jaw
  [[14, 15, 18], DOL_C.l1], // rostrum top plane
  [[15, 16, 17], DOL_C.l2], // melon crease facet
  [[15, 17, 18], DOL_C.m], // face core (eye sits here)
  [[16, 0, 17], DOL_C.hi], // melon highlight
  [[1, 19, 17], DOL_C.m],
  [[17, 19, 20], DOL_C.l1],
  [[17, 20, 18], DOL_C.l2],
  // overlays
  [[21, 22, 23, 24], INK], // eye
  [[13, 25, 26, 27], INK], // smile line
  [[28, 29, 30, 31], DOL_C.d2], // flipper
  [[32, 33, 34], DOL_C.d1], // blowhole
  [[2, 3, 35], DOL_C.l1], // fin leading edge
];

/* ------------------------------------------------------------------ */
/* PEACOCK — creative. Side profile facing left: small crested head,   */
/* S-neck, teal body, and a 7-wedge tail fan arcing behind (teal with  */
/* pink/violet facets — the two-hue exception). Eyespot diamonds on    */
/* the fan; beak protrudes past the head front (x=28 vs 46).           */
/* ------------------------------------------------------------------ */

const PEA_C = { d1: "#0e6b66", d2: "#14867d", m: "#23a496", l1: "#54c0af", l2: "#90d9ca", hi: "#e8f7f3", p1: "#e58fc7", p2: "#b892ee" };

const PEA_V: ReadonlyArray<Pt> = [
  [108, 132], // 0 fan hub (hidden behind body)
  [18, 96], // 1 fan outer, left
  [32, 52], // 2
  [64, 22], // 3
  [106, 14], // 4 fan top
  [146, 26], // 5
  [176, 56], // 6
  [188, 98], // 7 fan outer, right
  [182, 138], // 8 fan outer, lower right
  // body hexagon
  [66, 150], // 9 chest front
  [74, 176], // 10 bottom front
  [140, 176], // 11 bottom back
  [150, 144], // 12 back
  [120, 124], // 13 upper back
  [92, 128], // 14 shoulder
  [106, 152], // 15 anchor: body
  // neck (front edge F, back edge K)
  [60, 118], // 16 F1
  [52, 90], // 17 F2
  [50, 68], // 18 F3 head base front
  [80, 120], // 19 K1
  [68, 94], // 20 K2
  [64, 70], // 21 K3 head base back
  // head
  [46, 46], // 22 head front top
  [66, 48], // 23 crown back
  // beak
  [46, 52], [28, 58], [46, 62], // 24-26
  // eye (light on dark head)
  [52, 55], [56, 52], [59, 56], [55, 59], // 27-30
  // crest stalks + diamond tips
  [50, 46], [48, 32], [53, 44], // 31-33 stalk 1
  [44, 30], [48, 23], [52, 29], [48, 36], // 34-37 tip 1
  [58, 46], [63, 30], [64, 46], // 38-40 stalk 2
  [59, 27], [63, 20], [67, 26], [63, 33], // 41-44 tip 2
  // eyespot diamonds on the fan
  [40, 66], [45, 60], [50, 66], [45, 72], // 45-48
  [79, 34], [84, 28], [89, 34], [84, 40], // 49-52
  [123, 34], [128, 28], [133, 34], [128, 40], // 53-56
  [163, 72], [168, 66], [173, 72], [168, 78], // 57-60
  // inner pink cores for two eyespots
  [82, 34], [84, 31], [86, 34], [84, 37], // 61-64
  [126, 34], [128, 31], [130, 34], [128, 37], // 65-68
  // wing overlay on body
  [88, 136], [124, 132], [134, 162], [96, 166], // 69-72
];

const PEA_F: ReadonlyArray<FaceDef> = [
  // tail fan wedges (drawn first — everything else sits on top)
  [[0, 1, 2], PEA_C.d1],
  [[0, 2, 3], PEA_C.p2],
  [[0, 3, 4], PEA_C.m],
  [[0, 4, 5], PEA_C.p1],
  [[0, 5, 6], PEA_C.m],
  [[0, 6, 7], PEA_C.p2],
  [[0, 7, 8], PEA_C.d1],
  // eyespots
  [[45, 46, 47, 48], PEA_C.d1],
  [[49, 50, 51, 52], PEA_C.d1],
  [[53, 54, 55, 56], PEA_C.d1],
  [[57, 58, 59, 60], PEA_C.d1],
  [[61, 62, 63, 64], PEA_C.p1],
  [[65, 66, 67, 68], PEA_C.p1],
  // body
  [[9, 10, 15], PEA_C.d2],
  [[10, 11, 15], PEA_C.d1],
  [[11, 12, 15], PEA_C.d2],
  [[12, 13, 15], PEA_C.m],
  [[13, 14, 15], PEA_C.d2],
  [[14, 9, 15], PEA_C.m],
  [[69, 70, 71, 72], PEA_C.l1], // folded wing
  // S-neck (three quads, chest -> head)
  [[9, 14, 19, 16], PEA_C.d2],
  [[16, 19, 20, 17], PEA_C.m],
  [[17, 20, 21, 18], PEA_C.d2],
  // head, beak, eye
  [[22, 23, 21, 18], PEA_C.m],
  [[24, 25, 26], INK], // beak
  [[27, 28, 29, 30], PEA_C.hi], // eye
  // crest
  [[31, 32, 33], PEA_C.d2],
  [[34, 35, 36, 37], PEA_C.p1],
  [[38, 39, 40], PEA_C.d2],
  [[41, 42, 43, 44], PEA_C.p1],
];

/* ------------------------------------------------------------------ */
/* TIGER — entrepreneurial. Front-on symmetric face, deep orange with  */
/* ink stripes. Landmarks: broad cheeks, ear pair (tips y=26), pale    */
/* muzzle, ink nose/mouth, 3 forehead + 4 cheek stripe wedges.         */
/* ------------------------------------------------------------------ */

const TIG_C = { d1: "#b1490f", d2: "#d2641a", m: "#ea7f28", l1: "#f29e52", l2: "#f8c48c", hi: "#fde8cd" };

const TIG_V: ReadonlyArray<Pt> = [
  [76, 46], // 0 skull top L
  [124, 46], // 1 skull top R
  [160, 26], // 2 ear tip R
  [158, 82], // 3 ear base R
  [168, 112], // 4 cheek R
  [152, 148], // 5 jaw R
  [122, 172], // 6 ruff R
  [100, 178], // 7 chin
  [78, 172], // 8 ruff L
  [48, 148], // 9 jaw L
  [32, 112], // 10 cheek L
  [42, 82], // 11 ear base L
  [40, 26], // 12 ear tip L
  [100, 84], // 13 anchor: brow
  [100, 124], // 14 anchor: muzzle
  [66, 108], // 15 anchor: cheek L
  [134, 108], // 16 anchor: cheek R
  // inner ears
  [132, 44], [152, 34], [148, 70], // 17-19 R
  [68, 44], [48, 34], [52, 70], // 20-22 L
  // eyes (angled wedges)
  [74, 88], [88, 84], [90, 92], [76, 95], // 23-26 L
  [126, 88], [112, 84], [110, 92], [124, 95], // 27-30 R
  // muzzle pentagon
  [82, 112], [118, 112], [126, 140], [100, 158], [74, 140], // 31-35
  // nose + mouth
  [92, 116], [108, 116], [100, 130], // 36-38
  [96, 142], [104, 142], [100, 152], // 39-41
  // forehead stripes
  [97, 52], [103, 52], [100, 76], // 42-44 centre
  [81, 56], [88, 54], [87, 74], // 45-47 L
  [119, 56], [112, 54], [113, 74], // 48-50 R
  // cheek stripes
  [36, 104], [60, 106], [38, 114], // 51-53 L upper
  [44, 128], [64, 122], [50, 138], // 54-56 L lower
  [164, 104], [140, 106], [162, 114], // 57-59 R upper
  [156, 128], [136, 122], [150, 138], // 60-62 R lower
];

const TIG_F: ReadonlyArray<FaceDef> = [
  [[0, 1, 13], TIG_C.l1], // forehead
  [[1, 2, 3], TIG_C.d1], // ear R
  [[1, 3, 16], TIG_C.m],
  [[3, 4, 16], TIG_C.d2],
  [[4, 5, 16], TIG_C.m],
  [[5, 16, 14], TIG_C.l1],
  [[5, 6, 14], TIG_C.l2],
  [[6, 7, 14], TIG_C.l2], // ruff
  [[7, 8, 14], TIG_C.l2],
  [[8, 9, 14], TIG_C.l2],
  [[9, 15, 14], TIG_C.l1],
  [[9, 10, 15], TIG_C.m],
  [[10, 11, 15], TIG_C.d2],
  [[11, 12, 0], TIG_C.d1], // ear L
  [[11, 0, 15], TIG_C.m],
  [[0, 15, 13], TIG_C.l2], // brow L
  [[1, 16, 13], TIG_C.l2], // brow R
  [[15, 14, 13], TIG_C.m],
  [[16, 13, 14], TIG_C.m],
  // overlays
  [[17, 18, 19], TIG_C.hi], // inner ear R
  [[20, 21, 22], TIG_C.hi], // inner ear L
  [[23, 24, 25, 26], INK], // eye L
  [[27, 28, 29, 30], INK], // eye R
  [[31, 32, 33, 34, 35], TIG_C.hi], // muzzle
  [[36, 37, 38], INK], // nose
  [[39, 40, 41], INK], // mouth
  [[42, 43, 44], INK], // stripes
  [[45, 46, 47], INK],
  [[48, 49, 50], INK],
  [[51, 52, 53], INK],
  [[54, 55, 56], INK],
  [[57, 58, 59], INK],
  [[60, 61, 62], INK],
];

/* ------------------------------------------------------------------ */

export const ANIMAL_ART: Record<RadarDim, AnimalArt> = {
  analytical: art("#f1f1fe", HAWK_V, HAWK_F),
  practical: art("#f2f4f9", ELE_V, ELE_F),
  leadership: art("#fdf7ea", LION_V, LION_F),
  people: art("#eef7fd", DOL_V, DOL_F),
  creative: art("#edf8f4", PEA_V, PEA_F),
  entrepreneurial: art("#fdf2e6", TIG_V, TIG_F),
};
