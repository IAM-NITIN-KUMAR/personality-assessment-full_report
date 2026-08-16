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
/* HAWK — analytical. Front-on symmetric raptor face (same pattern as  */
/* the lion/tiger successes), indigo/violet family. Landmarks: jagged  */
/* feather crown, fierce V of ink brow wedges converging over pale     */
/* eye sockets with ink pupils, pale cere, and a long downward-hooked  */
/* ink beak on the centre line.                                        */
/* ------------------------------------------------------------------ */

const HAWK_C = { d1: "#3a3aa6", d2: "#5353d6", m: "#6e6ef0", l1: "#9494f6", l2: "#bcbcfa", hi: "#e9e9fd" };

const HAWK_V: ReadonlyArray<Pt> = [
  // silhouette — crown tufts across the top, then clockwise
  [100, 24], // 0 centre spike
  [112, 42], // 1 valley R inner
  [126, 28], // 2 spike R
  [138, 48], // 3 valley R outer
  [152, 64], // 4 temple R
  [158, 102], // 5 cheek R
  [146, 140], // 6 jaw R
  [124, 164], // 7 ruff R
  [100, 174], // 8 chin
  [76, 164], // 9 ruff L
  [54, 140], // 10 jaw L
  [42, 102], // 11 cheek L
  [48, 64], // 12 temple L
  [62, 48], // 13 valley L outer
  [74, 28], // 14 spike L
  [88, 42], // 15 valley L inner
  // interior anchors
  [100, 60], // 16 forehead
  [72, 112], // 17 cheek anchor L
  [128, 112], // 18 cheek anchor R
  [100, 142], // 19 chin anchor
  // pale eye sockets (facial disc)
  [60, 92], [94, 100], [88, 116], [58, 104], // 20-23 L
  [140, 92], [106, 100], [112, 116], [142, 104], // 24-27 R
  // ink pupils
  [69, 105], [75, 100], [81, 105], [75, 110], // 28-31 L
  [131, 105], [125, 100], [119, 105], [125, 110], // 32-35 R
  // fierce ink brow wedges (V converging at centre)
  [54, 80], [97, 96], [97, 104], [58, 90], // 36-39 L
  [146, 80], [103, 96], [103, 104], [142, 90], // 40-43 R
  // cere (pale) above the hook
  [94, 100], [106, 100], [104, 114], [96, 114], // 44-47
  // ink beak hook — bulges then narrows to a sharp downward tip
  [92, 114], [108, 114], [106, 132], [100, 154], [94, 132], // 48-52
];

const HAWK_F: ReadonlyArray<FaceDef> = [
  // crown (mirror-symmetric shading)
  [[14, 15, 16], HAWK_C.m],
  [[15, 0, 16], HAWK_C.l1],
  [[0, 1, 16], HAWK_C.l1],
  [[1, 2, 16], HAWK_C.m],
  [[13, 14, 16], HAWK_C.d2],
  [[2, 3, 16], HAWK_C.d2],
  [[12, 13, 16], HAWK_C.m],
  [[3, 4, 16], HAWK_C.m],
  // temples + cheeks
  [[12, 11, 17], HAWK_C.m],
  [[12, 17, 16], HAWK_C.l2],
  [[4, 5, 18], HAWK_C.m],
  [[4, 16, 18], HAWK_C.l2],
  [[11, 10, 17], HAWK_C.d2],
  [[5, 6, 18], HAWK_C.d2],
  // jaw + ruff
  [[10, 9, 17], HAWK_C.m],
  [[6, 7, 18], HAWK_C.m],
  [[9, 17, 19], HAWK_C.l1],
  [[7, 18, 19], HAWK_C.l1],
  [[9, 8, 19], HAWK_C.l2],
  [[7, 8, 19], HAWK_C.l2],
  // face core (mostly covered by feature overlays)
  [[16, 17, 19], HAWK_C.l1],
  [[16, 19, 18], HAWK_C.l1],
  // overlays: sockets, pupils, brow, cere, hook, chest streaks
  [[20, 21, 22, 23], HAWK_C.hi], // eye socket L
  [[24, 25, 26, 27], HAWK_C.hi], // eye socket R
  [[28, 29, 30, 31], INK], // pupil L
  [[32, 33, 34, 35], INK], // pupil R
  [[36, 37, 38, 39], INK], // brow wedge L
  [[40, 41, 42, 43], INK], // brow wedge R
  [[44, 45, 46, 47], HAWK_C.l2], // cere
  [[48, 49, 50, 51, 52], INK], // hooked beak
];

/* ------------------------------------------------------------------ */
/* ELEPHANT — practical. Front-on symmetric head, slate/blue-grey.     */
/* Landmarks: two huge ear fans flanking a domed head, trunk dropping  */
/* straight down the centre line past the jaw (segmented by wrinkle    */
/* bands, dark tip), pale tusks flanking the trunk, ink eyes.          */
/* ------------------------------------------------------------------ */

const ELE_C = { d1: "#46536c", d2: "#5d6b87", m: "#7889a6", l1: "#9caac4", l2: "#c2cbdd", hi: "#eaeef5" };

const ELE_V: ReadonlyArray<Pt> = [
  // head silhouette
  [100, 26], // 0 dome apex
  [70, 40], // 1 dome L
  [130, 40], // 2 dome R
  [64, 80], // 3 temple L
  [136, 80], // 4 temple R
  [70, 116], // 5 cheek L
  [130, 116], // 6 cheek R
  [84, 138], // 7 jaw L
  [116, 138], // 8 jaw R
  // trunk column (straight down the centre line)
  [88, 98], // 9 T0 L
  [112, 98], // 10 T0 R
  [89, 124], // 11 T1 L
  [111, 124], // 12 T1 R
  [91, 148], // 13 T2 L
  [109, 148], // 14 T2 R
  [93, 170], // 15 T3 L
  [107, 170], // 16 T3 R
  [90, 184], // 17 tip L
  [110, 184], // 18 tip R
  // left ear fan
  [36, 26], // 19 ear top L
  [14, 60], // 20
  [10, 102], // 21 ear outer L
  [26, 136], // 22
  [56, 128], // 23 ear bottom L
  [38, 84], // 24 ear anchor L
  // right ear fan
  [164, 26], // 25 ear top R
  [186, 60], // 26
  [190, 102], // 27 ear outer R
  [174, 136], // 28
  [144, 128], // 29 ear bottom R
  [162, 84], // 30 ear anchor R
  // head anchors
  [100, 64], // 31 forehead
  [80, 94], // 32 brow L
  [120, 94], // 33 brow R
  // ink eyes
  [71, 90], [79, 84], [87, 90], [79, 96], // 34-37 L
  [129, 90], [121, 84], [113, 90], [121, 96], // 38-41 R
  // pale tusks flanking the trunk (flaring slightly outward)
  [84, 132], [72, 160], [79, 166], [92, 140], // 42-45 L
  [116, 132], [128, 160], [121, 166], [108, 140], // 46-49 R
  // trunk tip shade
  [94, 184], [106, 184], [100, 172], // 50-52
  // trunk wrinkle bands
  [90, 129], [110, 129], // 53-54 (with 11, 12)
  [92, 153], [108, 153], // 55-56 (with 13, 14)
];

const ELE_F: ReadonlyArray<FaceDef> = [
  // left ear fan (attaches along head edge 1-3-5)
  [[1, 19, 24], ELE_C.d2],
  [[19, 20, 24], ELE_C.m],
  [[20, 21, 24], ELE_C.l1],
  [[21, 22, 24], ELE_C.m],
  [[22, 23, 24], ELE_C.d2],
  [[23, 24, 5], ELE_C.d1],
  [[24, 3, 5], ELE_C.d2],
  [[24, 1, 3], ELE_C.d1],
  // right ear fan (mirror)
  [[2, 25, 30], ELE_C.d2],
  [[25, 26, 30], ELE_C.m],
  [[26, 27, 30], ELE_C.l1],
  [[27, 28, 30], ELE_C.m],
  [[28, 29, 30], ELE_C.d2],
  [[29, 30, 6], ELE_C.d1],
  [[30, 4, 6], ELE_C.d2],
  [[30, 2, 4], ELE_C.d1],
  // dome + forehead
  [[1, 0, 31], ELE_C.l2],
  [[0, 2, 31], ELE_C.l2],
  [[1, 3, 32], ELE_C.m],
  [[1, 32, 31], ELE_C.l1],
  [[2, 4, 33], ELE_C.m],
  [[2, 31, 33], ELE_C.l1],
  [[31, 32, 9], ELE_C.l2],
  [[31, 9, 10], ELE_C.hi], // pale forehead blaze above the trunk
  [[31, 10, 33], ELE_C.l2],
  // cheeks + jaw
  [[3, 5, 32], ELE_C.l1],
  [[32, 5, 9], ELE_C.m],
  [[5, 9, 11], ELE_C.l1],
  [[5, 7, 11], ELE_C.m],
  [[7, 11, 13], ELE_C.l1],
  [[4, 6, 33], ELE_C.l1],
  [[33, 6, 10], ELE_C.m],
  [[6, 10, 12], ELE_C.l1],
  [[6, 8, 12], ELE_C.m],
  [[8, 12, 14], ELE_C.l1],
  // trunk (alternating segments)
  [[9, 10, 12, 11], ELE_C.l1],
  [[11, 12, 14, 13], ELE_C.m],
  [[13, 14, 16, 15], ELE_C.l1],
  [[15, 16, 18, 17], ELE_C.m],
  // overlays
  [[34, 35, 36, 37], INK], // eye L
  [[38, 39, 40, 41], INK], // eye R
  [[42, 43, 44, 45], ELE_C.l2], // tusk L
  [[46, 47, 48, 49], ELE_C.l2], // tusk R
  [[50, 51, 52], ELE_C.d1], // trunk tip shade
  [[11, 12, 54, 53], ELE_C.d2], // wrinkle band upper
  [[13, 14, 56, 55], ELE_C.d2], // wrinkle band lower
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
/* DOLPHIN — people. Side view facing left in the classic leaping      */
/* arc, sky/cyan family. Landmarks: long pale rostrum with the ink     */
/* smile line, eye dot behind the beak, steeply rising melon, one      */
/* smooth arched back with the dorsal fin at its apex, tapering tail   */
/* stock and two-lobed fluke; pale belly, pectoral flipper overlay.    */
/* ------------------------------------------------------------------ */

const DOL_C = { d1: "#1e6f9f", d2: "#3489bd", m: "#57a6d6", l1: "#84c1e7", l2: "#b2daf2", hi: "#e4f3fb" };

const DOL_V: ReadonlyArray<Pt> = [
  [12, 104], // 0 rostrum tip
  [42, 88], // 1 beak top (crease foot)
  [48, 70], // 2 melon front (near-vertical step 1->2)
  [72, 48], // 3 melon top
  [100, 36], // 4 dorsal fin front base (arc apex)
  [124, 12], // 5 dorsal fin apex
  [134, 42], // 6 dorsal fin back base
  [158, 58], // 7 back mid
  [180, 100], // 8 tail stock top (back tapers hard)
  [198, 92], // 9 fluke upper tip
  [184, 118], // 10 fluke notch
  [194, 148], // 11 fluke lower tip
  [168, 114], // 12 tail stock bottom
  [144, 120], // 13 underside rear
  [118, 128], // 14 belly rear
  [92, 126], // 15 belly mid
  [68, 116], // 16 belly front
  [50, 110], // 17 throat (beak underside meets chin)
  [46, 102], // 18 gape corner
  [68, 86], // 19 anchor: head
  [108, 76], // 20 anchor: body
  [144, 96], // 21 anchor: rear
  [96, 102], // 22 anchor: belly
  [114, 28], // 23 fin leading-edge light (with 4, 5)
  // ink eye (behind the gape, under the melon crease)
  [50, 92], [55, 87], [60, 92], [55, 97], // 24-27
  // ink smile line (thin quad through the middle of the beak)
  [14, 101], [46, 101], [46, 105], [16, 106], // 28-31
  // pectoral flipper (dark, swept back along the belly)
  [80, 100], [104, 122], [90, 126], [72, 108], // 32-35
  // blowhole
  [76, 48], [84, 44], [82, 52], // 36-38
];

const DOL_F: ReadonlyArray<FaceDef> = [
  // beak — pale but visible against the bg, clearly stepped off the melon
  [[0, 1, 18], DOL_C.l1], // beak upper
  [[0, 18, 17], DOL_C.l2], // beak lower
  [[1, 18, 19], DOL_C.l2],
  [[18, 19, 17], DOL_C.l1],
  [[1, 2, 19], DOL_C.l1], // crease facet
  // melon + back arc — dark cape above the lateral line
  [[2, 3, 19], DOL_C.m],
  [[3, 19, 20], DOL_C.m],
  [[3, 4, 20], DOL_C.d2],
  [[4, 5, 6], DOL_C.d1], // dorsal fin
  [[4, 6, 20], DOL_C.d2],
  [[6, 7, 20], DOL_C.m],
  [[7, 8, 21], DOL_C.d2],
  [[7, 21, 20], DOL_C.m],
  // tail stock + fluke
  [[21, 8, 12], DOL_C.m],
  [[8, 9, 10], DOL_C.d2],
  [[10, 11, 12], DOL_C.d1],
  [[8, 10, 12], DOL_C.d2],
  // underside + belly — pale below the lateral line
  [[12, 13, 21], DOL_C.l1],
  [[13, 14, 21], DOL_C.l2],
  [[14, 22, 21], DOL_C.l1],
  [[14, 15, 22], DOL_C.l2],
  [[15, 16, 22], DOL_C.l2],
  [[16, 17, 22], DOL_C.l2],
  [[17, 22, 19], DOL_C.l1],
  // interior core (lateral band)
  [[19, 20, 22], DOL_C.l1],
  [[20, 21, 22], DOL_C.l2],
  // overlays
  [[4, 5, 23], DOL_C.l1], // fin leading edge
  [[24, 25, 26, 27], INK], // eye
  [[28, 29, 30, 31], INK], // smile line
  [[32, 33, 34, 35], DOL_C.d2], // flipper
  [[36, 37, 38], DOL_C.d1], // blowhole
];

/* ------------------------------------------------------------------ */
/* PEACOCK — creative. Front-on and symmetric (the pattern the lion/   */
/* tiger proved out): a 7-wedge tail fan behind (teal with pink/violet */
/* facets — the two-hue exception), diamond eyespots on the fan, and a */
/* dark slim body + straight elegant neck up the centre line to a      */
/* small head with three crest dots on stalks; ink beak.               */
/* ------------------------------------------------------------------ */

const PEA_C = { d1: "#0e6b66", d2: "#14867d", m: "#23a496", l1: "#54c0af", l2: "#90d9ca", hi: "#e8f7f3", p1: "#e58fc7", p2: "#b892ee" };

const PEA_V: ReadonlyArray<Pt> = [
  [100, 142], // 0 fan hub (hidden behind the body)
  // fan outer rim, left to right
  [14, 150], // 1
  [18, 100], // 2
  [42, 58], // 3
  [78, 32], // 4
  [122, 32], // 5
  [158, 58], // 6
  [182, 100], // 7
  [186, 150], // 8
  // body
  [70, 152], // 9 side L
  [76, 180], // 10 bottom L
  [124, 180], // 11 bottom R
  [130, 152], // 12 side R
  [116, 130], // 13 shoulder R
  [84, 130], // 14 shoulder L
  [100, 160], // 15 anchor: body
  // slim neck (two tapering segments up the centre)
  [93, 128], // 16 base L
  [107, 128], // 17 base R
  [95, 106], // 18 mid L
  [105, 106], // 19 mid R
  [96, 86], // 20 top L
  [104, 86], // 21 top R
  // head
  [89, 74], // 22 head L
  [111, 74], // 23 head R
  [100, 58], // 24 crown
  // crest stalks
  [99, 60], [101, 60], [100, 38], // 25-27 centre
  [94, 64], [97, 62], [84, 42], // 28-30 left
  [106, 64], [103, 62], [116, 42], // 31-33 right
  // crest tip diamonds
  [95, 34], [100, 29], [105, 34], [100, 39], // 34-37 centre
  [79, 40], [84, 35], [89, 40], [84, 45], // 38-41 left
  [111, 40], [116, 35], [121, 40], [116, 45], // 42-45 right
  // ink eyes on the head
  [90, 72], [94, 68], [98, 72], [94, 76], // 46-49 L
  [102, 72], [106, 68], [110, 72], [106, 76], // 50-53 R
  // ink beak
  [96, 80], [104, 80], [100, 89], // 54-56
  // fan eyespots — outer diamond + pink core, 3 per side
  [29, 124], [36, 117], [43, 124], [36, 131], // 57-60 L1 outer
  [32, 124], [36, 120], [40, 124], [36, 128], // 61-64 L1 core
  [41, 80], [48, 73], [55, 80], [48, 87], // 65-68 L2 outer
  [44, 80], [48, 76], [52, 80], [48, 84], // 69-72 L2 core
  [67, 52], [74, 45], [81, 52], [74, 59], // 73-76 L3 outer
  [70, 52], [74, 48], [78, 52], [74, 56], // 77-80 L3 core
  [119, 52], [126, 45], [133, 52], [126, 59], // 81-84 R3 outer
  [122, 52], [126, 48], [130, 52], [126, 56], // 85-88 R3 core
  [145, 80], [152, 73], [159, 80], [152, 87], // 89-92 R2 outer
  [148, 80], [152, 76], [156, 80], [152, 84], // 93-96 R2 core
  [157, 124], [164, 117], [171, 124], [164, 131], // 97-100 R1 outer
  [160, 124], [164, 120], [168, 124], [164, 128], // 101-104 R1 core
  // wing highlights on the body
  [82, 140], [96, 150], [86, 166], // 105-107 L
  [118, 140], [104, 150], [114, 166], // 108-110 R
];

const PEA_F: ReadonlyArray<FaceDef> = [
  // tail fan wedges (drawn first — everything else sits on top)
  [[0, 1, 2], PEA_C.d1],
  [[0, 2, 3], PEA_C.p2],
  [[0, 3, 4], PEA_C.d2],
  [[0, 4, 5], PEA_C.l1], // light centre wedge so the dark neck/head reads
  [[0, 5, 6], PEA_C.d2],
  [[0, 6, 7], PEA_C.p2],
  [[0, 7, 8], PEA_C.d1],
  // eyespots
  [[57, 58, 59, 60], PEA_C.l2],
  [[61, 62, 63, 64], PEA_C.p1],
  [[65, 66, 67, 68], PEA_C.l2],
  [[69, 70, 71, 72], PEA_C.p1],
  [[73, 74, 75, 76], PEA_C.l2],
  [[77, 78, 79, 80], PEA_C.p1],
  [[81, 82, 83, 84], PEA_C.l2],
  [[85, 86, 87, 88], PEA_C.p1],
  [[89, 90, 91, 92], PEA_C.l2],
  [[93, 94, 95, 96], PEA_C.p1],
  [[97, 98, 99, 100], PEA_C.l2],
  [[101, 102, 103, 104], PEA_C.p1],
  // body
  [[9, 10, 15], PEA_C.d2],
  [[10, 11, 15], PEA_C.d1],
  [[11, 12, 15], PEA_C.d2],
  [[12, 13, 15], PEA_C.m],
  [[13, 15, 17], PEA_C.d2],
  [[17, 16, 15], PEA_C.m], // chest
  [[16, 14, 15], PEA_C.d2],
  [[14, 9, 15], PEA_C.m],
  [[105, 106, 107], PEA_C.l1], // wing highlight L
  [[108, 109, 110], PEA_C.l1], // wing highlight R
  // neck
  [[16, 17, 19, 18], PEA_C.d2],
  [[18, 19, 21, 20], PEA_C.d1],
  // head — a shade lighter than the neck so it reads as its own mass
  [[22, 24, 23], PEA_C.m],
  [[22, 23, 21, 20], PEA_C.d2],
  // crest
  [[25, 26, 27], PEA_C.d2],
  [[28, 29, 30], PEA_C.d2],
  [[31, 32, 33], PEA_C.d2],
  [[34, 35, 36, 37], PEA_C.p1],
  [[38, 39, 40, 41], PEA_C.p1],
  [[42, 43, 44, 45], PEA_C.p1],
  // face
  [[46, 47, 48, 49], INK], // eye L
  [[50, 51, 52, 53], INK], // eye R
  [[54, 55, 56], INK], // beak
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
