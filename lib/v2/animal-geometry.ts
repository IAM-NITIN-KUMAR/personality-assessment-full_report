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
/* HAWK — analytical. SIDE PROFILE facing left, indigo family + ink.   */
/* The silhouette carries the raptor read: flat slightly-swept crown   */
/* flowing into a heavy straight ink brow at the front edge, a LONG    */
/* downward-hooked ink beak dominating the profile (hook tip curving   */
/* below the jawline), pale cere at the beak base, a fierce pale eye   */
/* set deep under the brow, a strong jaw/cheek angle, and the neck     */
/* tapering back into layered shoulder feathers.                       */
/* ------------------------------------------------------------------ */

const HAWK_C = { d1: "#3a3aa6", d2: "#5353d6", m: "#6e6ef0", l1: "#9494f6", l2: "#bcbcfa", hi: "#e9e9fd" };

const HAWK_V: ReadonlyArray<Pt> = [
  // silhouette, clockwise from the beak front
  [20, 78], // 0 culmen forward point (beak front, upper)
  [38, 72], // 1 culmen mid
  [58, 70], // 2 beak root top (beak meets forehead at a step)
  [64, 54], // 3 forehead / brow front (steep rise off the beak)
  [100, 36], // 4 crown apex (flat, swept back)
  [134, 42], // 5 crown back
  [160, 62], // 6 nape
  [172, 100], // 7 neck back
  [178, 144], // 8 shoulder back
  [166, 180], // 9 shoulder bottom
  [100, 180], // 10 chest bottom
  [78, 150], // 11 chest front
  [68, 120], // 12 throat
  [60, 102], // 13 chin / jaw front
  [58, 88], // 14 gape corner (beak underside meets face)
  [46, 92], // 15 hook inner
  [36, 112], // 16 hook tip — curves down-back below the jawline (y=102)
  // interior anchors
  [100, 60], // 17 crown interior
  [130, 82], // 18 nape interior
  [100, 100], // 19 cheek centre
  [140, 122], // 20 neck interior
  [112, 150], // 21 chest interior
  // pale cere band over the beak root (with vertex 2)
  [66, 74], [62, 84], [48, 80], // 22-24
  // heavy straight ink brow, overhanging the eye
  [64, 58], [106, 50], [104, 58], [68, 66], // 25-28
  // fierce pale eye sliver set deep under the brow ridge
  [68, 72], [88, 68], [86, 77], [66, 79], // 29-32
  // ink pupil
  [71, 74], [76, 70], [81, 74], [76, 78], // 33-36
  // malar wedge — strong jaw/cheek angle below the eye
  [66, 90], [84, 86], [74, 110], // 37-39
  // layered shoulder feathers (zigzag tops + tips)
  [90, 156], [116, 148], [140, 152], [162, 148], // 40-43 tops
  [104, 174], [128, 170], [152, 172], // 44-46 tips
  // beak front bend (gives the hook its curve)
  [20, 92], // 47
];

const HAWK_F: ReadonlyArray<FaceDef> = [
  // crown — light at the front, darkening toward nape and shoulder
  [[2, 3, 17], HAWK_C.l2],
  [[3, 4, 17], HAWK_C.l1],
  [[4, 5, 17], HAWK_C.l2],
  [[5, 18, 17], HAWK_C.m],
  [[5, 6, 18], HAWK_C.d2],
  [[6, 7, 18], HAWK_C.d1],
  [[7, 20, 18], HAWK_C.d2],
  [[7, 8, 20], HAWK_C.d1],
  [[8, 9, 20], HAWK_C.d2],
  [[9, 21, 20], HAWK_C.l1],
  [[9, 10, 21], HAWK_C.m],
  [[10, 11, 21], HAWK_C.l2],
  [[11, 19, 21], HAWK_C.l1],
  [[11, 12, 19], HAWK_C.l2],
  [[12, 13, 19], HAWK_C.l1],
  [[13, 14, 19], HAWK_C.l2],
  [[2, 19, 14], HAWK_C.l1],
  [[2, 17, 19], HAWK_C.l2],
  [[17, 18, 19], HAWK_C.l1],
  [[18, 20, 19], HAWK_C.m],
  [[19, 20, 21], HAWK_C.l1],
  // long hooked ink beak — one decisive mass dominating the profile
  [[2, 1, 0, 47, 16, 15, 14], INK],
  // overlays
  [[2, 22, 23, 24], HAWK_C.l2], // pale cere at the beak base
  [[25, 26, 27, 28], INK], // heavy straight brow ridge
  [[29, 30, 31, 32], HAWK_C.hi], // eye sliver deep under the brow
  [[33, 34, 35, 36], INK], // pupil
  [[37, 38, 39], HAWK_C.d1], // malar / jaw angle
  [[40, 41, 44], HAWK_C.d2], // shoulder feather layers
  [[41, 42, 45], HAWK_C.d1],
  [[42, 43, 46], HAWK_C.d2],
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
/* Two-layer mane: a jagged 12-spike outer ring (r 84/68) of dark      */
/* alternating facets, then a lighter inner ring of alternating quads  */
/* down to a smaller 12-gon face (r 40). Regal pale brows over calm    */
/* ink eyes, defined pale muzzle with ink nose triangle, philtrum and  */
/* mouth line, small rounded ears tucked just inside the mane ring.    */
/* ------------------------------------------------------------------ */

const LION_C = { d1: "#9a6210", d2: "#c07d1d", m: "#e09c2e", l1: "#edbb5e", l2: "#f5d795", hi: "#fbeecf" };

const LION_V: ReadonlyArray<Pt> = [
  // outer mane ring — 12 points alternating spike r=87 / valley r=64
  [100, 13], // 0 spike top
  [132, 45], // 1 valley
  [175, 57], // 2 spike
  [164, 100], // 3 valley
  [175, 144], // 4 spike
  [132, 155], // 5 valley
  [100, 187], // 6 spike bottom
  [68, 155], // 7 valley
  [25, 144], // 8 spike
  [36, 100], // 9 valley
  [25, 57], // 10 spike
  [68, 45], // 11 valley
  // mid mane ring — r=56, offset 15deg (interlocks with the outer ring)
  [114, 46], [140, 60], [154, 86], [154, 114], [140, 140], [114, 154], // 12-17
  [86, 154], [60, 140], [46, 114], [46, 86], [60, 60], [86, 46], // 18-23
  // face 12-gon — r=40, same angles as the mid ring
  [110, 61], [128, 72], [139, 90], [139, 110], [128, 128], [110, 139], // 24-29
  [90, 139], [72, 128], [61, 110], [61, 90], [72, 72], [90, 61], // 30-35
  // face interior helpers
  [78, 88], // 36 brow L
  [122, 88], // 37 brow R
  [84, 112], // 38 muzzle corner L
  [116, 112], // 39 muzzle corner R
  // calm ink eyes
  [74, 90], [88, 88], [90, 93], [76, 95], // 40-43 L
  [126, 90], [112, 88], [110, 93], [124, 95], // 44-47 R
  // regal pale brow ridges
  [72, 84], [90, 82], [88, 87], [74, 89], // 48-51 L
  [128, 84], [110, 82], [112, 87], [126, 89], // 52-55 R
  // defined pale muzzle
  [84, 106], [116, 106], [122, 127], [100, 138], [78, 127], // 56-60
  // ink nose triangle
  [92, 108], [108, 108], [100, 120], // 61-63
  // philtrum
  [99, 120], [101, 120], [101, 128], [99, 128], // 64-67
  // mouth line
  [88, 131], [100, 126], [112, 131], [100, 134], // 68-71
  // small rounded ears just inside the mane ring
  [66, 48], [82, 36], [96, 50], [90, 62], [72, 62], // 72-76 L outer
  [73, 50], [82, 43], [89, 53], [79, 58], // 77-80 L inner
  [134, 48], [118, 36], [104, 50], [110, 62], [128, 62], // 81-85 R outer
  [127, 50], [118, 43], [111, 53], [121, 58], // 86-89 R inner
];

const LION_F: ReadonlyArray<FaceDef> = [
  // outer mane layer — 24 interlocking triangles, mirror-symmetric shading
  [[0, 1, 12], LION_C.d1],
  [[12, 1, 13], LION_C.m],
  [[1, 2, 13], LION_C.d2],
  [[13, 2, 14], LION_C.d1],
  [[2, 3, 14], LION_C.m],
  [[14, 3, 15], LION_C.d2],
  [[3, 4, 15], LION_C.d2],
  [[15, 4, 16], LION_C.m],
  [[4, 5, 16], LION_C.d1],
  [[16, 5, 17], LION_C.d2],
  [[5, 6, 17], LION_C.d2],
  [[17, 6, 18], LION_C.d1],
  [[6, 7, 18], LION_C.d2],
  [[18, 7, 19], LION_C.d2],
  [[7, 8, 19], LION_C.d1],
  [[19, 8, 20], LION_C.m],
  [[8, 9, 20], LION_C.d2],
  [[20, 9, 21], LION_C.d2],
  [[9, 10, 21], LION_C.m],
  [[21, 10, 22], LION_C.d1],
  [[10, 11, 22], LION_C.d2],
  [[22, 11, 23], LION_C.m],
  [[11, 0, 23], LION_C.d1],
  [[23, 0, 12], LION_C.d1],
  // inner mane layer — 12 lighter quads down to the face rim
  [[12, 13, 25, 24], LION_C.l1],
  [[13, 14, 26, 25], LION_C.m],
  [[14, 15, 27, 26], LION_C.l1],
  [[15, 16, 28, 27], LION_C.m],
  [[16, 17, 29, 28], LION_C.l1],
  [[17, 18, 30, 29], LION_C.m],
  [[18, 19, 31, 30], LION_C.l1],
  [[19, 20, 32, 31], LION_C.m],
  [[20, 21, 33, 32], LION_C.l1],
  [[21, 22, 34, 33], LION_C.m],
  [[22, 23, 35, 34], LION_C.l1],
  [[23, 12, 24, 35], LION_C.m],
  // ears (over the mane, just inside the ring)
  [[72, 73, 74, 75, 76], LION_C.m],
  [[77, 78, 79, 80], LION_C.l2],
  [[81, 82, 83, 84, 85], LION_C.m],
  [[86, 87, 88, 89], LION_C.l2],
  // face
  [[34, 35, 24, 25, 37, 36], LION_C.l2], // forehead band
  [[33, 34, 36, 38, 32], LION_C.l1], // cheek L
  [[26, 25, 37, 39, 27], LION_C.l1], // cheek R
  [[36, 37, 39, 38], LION_C.hi], // nose bridge
  [[38, 39, 28, 29, 30, 31], LION_C.l2], // lower face / jaw
  // features
  [[56, 57, 58, 59, 60], LION_C.hi], // pale muzzle
  [[48, 49, 50, 51], LION_C.hi], // brow L
  [[52, 53, 54, 55], LION_C.hi], // brow R
  [[40, 41, 42, 43], INK], // eye L
  [[44, 45, 46, 47], INK], // eye R
  [[61, 62, 63], INK], // nose
  [[64, 65, 66, 67], INK], // philtrum
  [[68, 69, 70, 71], INK], // mouth line
];

/* ------------------------------------------------------------------ */
/* DOLPHIN — people. Side view facing left in the classic leaping      */
/* arc, sky/cyan family. Sleek tapered torpedo: body depth ~1/3 of     */
/* body length at the thickest point, tapering smoothly into a thin    */
/* tailstock. Long pale rostrum with the ink smile line, eye behind    */
/* the gape, dorsal fin at the arc apex, two-lobed fluke, pale belly,  */
/* pectoral flipper sweeping below the body line.                      */
/* ------------------------------------------------------------------ */

const DOL_C = { d1: "#1e6f9f", d2: "#3489bd", m: "#57a6d6", l1: "#84c1e7", l2: "#b2daf2", hi: "#e4f3fb" };

const DOL_V: ReadonlyArray<Pt> = [
  [12, 96], // 0 rostrum tip
  [44, 82], // 1 beak top (crease foot)
  [50, 64], // 2 melon front
  [74, 50], // 3 melon top
  [102, 46], // 4 dorsal fin front base (arc apex)
  [124, 14], // 5 dorsal fin apex
  [134, 48], // 6 dorsal fin back base
  [158, 62], // 7 back mid
  [182, 96], // 8 tail stock top
  [198, 80], // 9 fluke upper tip
  [184, 110], // 10 fluke notch
  [194, 138], // 11 fluke lower tip
  [172, 106], // 12 tail stock bottom
  [146, 102], // 13 underside rear
  [120, 106], // 14 belly rear
  [94, 106], // 15 belly mid
  [70, 100], // 16 belly front
  [52, 98], // 17 throat
  [48, 92], // 18 gape corner
  [68, 80], // 19 anchor: head
  [108, 76], // 20 anchor: body
  [146, 88], // 21 anchor: rear
  [96, 92], // 22 anchor: belly
  [114, 32], // 23 fin leading-edge light (with 4, 5)
  // ink eye (behind the gape, under the melon crease)
  [51, 86], [56, 81], [61, 86], [56, 91], // 24-27
  // ink smile line (thin quad through the middle of the beak)
  [22, 93], [48, 91], [48, 95], [24, 96], // 28-31
  // pectoral flipper (dark, sweeping below the belly line)
  [78, 94], [102, 112], [88, 116], [72, 100], // 32-35
  // blowhole
  [78, 52], [86, 49], [83, 56], // 36-38
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
/* PEACOCK — creative. Front-on and symmetric: an emerald/teal 7-wedge */
/* tail fan behind, eyespots as gold/amber cores inside teal-ring      */
/* diamonds, and a royal peacock-blue body + straight elegant neck up  */
/* the centre line (5 blue steps) to a small head with three crest     */
/* stalks tipped in gold; ink beak and eyes.                           */
/* ------------------------------------------------------------------ */

const PEA_C = {
  d1: "#0f6f5c", d2: "#159381", m: "#1fae94", l1: "#52c9ab", l2: "#a7e3cf", hi: "#e8f7f3",
  b1: "#173f6f", b2: "#1c4e8a", b3: "#2563a8", b4: "#3178c2", b5: "#5b9bd8",
  gold: "#e8b53a",
};

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
  // fan eyespots — teal-ring diamond + gold core, 3 per side
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
  [[0, 2, 3], PEA_C.m],
  [[0, 3, 4], PEA_C.d2],
  [[0, 4, 5], PEA_C.l1], // light centre wedge so the dark neck/head reads
  [[0, 5, 6], PEA_C.d2],
  [[0, 6, 7], PEA_C.m],
  [[0, 7, 8], PEA_C.d1],
  // eyespots
  [[57, 58, 59, 60], PEA_C.l2],
  [[61, 62, 63, 64], PEA_C.gold],
  [[65, 66, 67, 68], PEA_C.l2],
  [[69, 70, 71, 72], PEA_C.gold],
  [[73, 74, 75, 76], PEA_C.l2],
  [[77, 78, 79, 80], PEA_C.gold],
  [[81, 82, 83, 84], PEA_C.l2],
  [[85, 86, 87, 88], PEA_C.gold],
  [[89, 90, 91, 92], PEA_C.l2],
  [[93, 94, 95, 96], PEA_C.gold],
  [[97, 98, 99, 100], PEA_C.l2],
  [[101, 102, 103, 104], PEA_C.gold],
  // body — royal peacock blue
  [[9, 10, 15], PEA_C.b3],
  [[10, 11, 15], PEA_C.b1],
  [[11, 12, 15], PEA_C.b3],
  [[12, 13, 15], PEA_C.b4],
  [[13, 15, 17], PEA_C.b3],
  [[17, 16, 15], PEA_C.b4], // chest
  [[16, 14, 15], PEA_C.b3],
  [[14, 9, 15], PEA_C.b4],
  [[105, 106, 107], PEA_C.b5], // wing highlight L
  [[108, 109, 110], PEA_C.b5], // wing highlight R
  // neck
  [[16, 17, 19, 18], PEA_C.b3],
  [[18, 19, 21, 20], PEA_C.b2],
  // head — a shade lighter than the neck so it reads as its own mass
  [[22, 24, 23], PEA_C.b4],
  [[22, 23, 21, 20], PEA_C.b3],
  // crest
  [[25, 26, 27], PEA_C.b3],
  [[28, 29, 30], PEA_C.b3],
  [[31, 32, 33], PEA_C.b3],
  [[34, 35, 36, 37], PEA_C.gold],
  [[38, 39, 40, 41], PEA_C.gold],
  [[42, 43, 44, 45], PEA_C.gold],
  // face
  [[46, 47, 48, 49], INK], // eye L
  [[50, 51, 52, 53], INK], // eye R
  [[54, 55, 56], INK], // beak
];

/* ------------------------------------------------------------------ */
/* TIGER — entrepreneurial. Front-on symmetric face, deep orange with  */
/* ink stripes. Strong skull: broad cheeks (x 28-172), tapered chin,   */
/* white brow/eye patches around amber eyes with ink pupils, white     */
/* muzzle patches flanking a pink nose with ink philtrum + mouth, and  */
/* a few bold curved stripe wedges radiating from brow and cheeks.     */
/* ------------------------------------------------------------------ */

const TIG_C = {
  d1: "#b1490f", d2: "#d2641a", m: "#ea7f28", l1: "#f29e52", l2: "#f8c48c", hi: "#fde8cd",
  amber: "#f2b23e", pink: "#e0708c",
};

const TIG_V: ReadonlyArray<Pt> = [
  [72, 52], // 0 skull top L
  [128, 52], // 1 skull top R
  [152, 28], // 2 ear tip R
  [150, 72], // 3 ear base R
  [172, 104], // 4 cheek R (broad)
  [156, 146], // 5 jaw R
  [124, 172], // 6 ruff R
  [100, 180], // 7 chin (tapered)
  [76, 172], // 8 ruff L
  [44, 146], // 9 jaw L
  [28, 104], // 10 cheek L (broad)
  [50, 72], // 11 ear base L
  [48, 28], // 12 ear tip L
  [100, 80], // 13 anchor: brow
  [100, 126], // 14 anchor: muzzle
  [64, 106], // 15 anchor: cheek L
  [136, 106], // 16 anchor: cheek R
  // inner ears
  [132, 50], [147, 36], [144, 64], // 17-19 R
  [68, 50], [53, 36], [56, 64], // 20-22 L
  // white brow / eye patches
  [64, 82], [90, 78], [92, 94], [68, 98], // 23-26 L
  [136, 82], [110, 78], [108, 94], [132, 98], // 27-30 R
  // amber eyes (slanted — outer corner high, inner corner low)
  [72, 85], [87, 88], [88, 96], [74, 92], // 31-34 L
  [128, 85], [113, 88], [112, 96], [126, 92], // 35-38 R
  // ink pupils
  [78, 87], [82, 90], [78, 93], [74, 90], // 39-42 L
  [122, 87], [126, 90], [122, 93], [118, 90], // 43-46 R
  // white muzzle patches + chin (rounded, hugging the nose)
  [76, 118], [96, 116], [96, 138], [86, 144], [76, 132], // 47-51 L
  [124, 118], [104, 116], [104, 138], [114, 144], [124, 132], // 52-56 R
  [90, 150], [110, 150], [100, 163], // 57-59 chin white
  // pink nose triangle, ink philtrum + mouth
  [90, 112], [110, 112], [100, 126], // 60-62 nose
  [98, 126], [102, 126], [102, 140], [98, 140], // 63-66 philtrum
  [86, 146], [100, 141], [114, 146], [100, 150], // 67-70 mouth
  // bold curved stripe wedges
  [96, 54], [104, 54], [102, 66], [100, 78], [98, 66], // 71-75 centre brow
  [76, 58], [88, 54], [82, 70], [70, 76], // 76-79 brow L
  [124, 58], [112, 54], [118, 70], [130, 76], // 80-83 brow R
  [36, 95], [50, 98], [62, 104], [56, 110], [35, 105], // 84-88 cheek L upper
  [164, 95], [150, 98], [138, 104], [144, 110], [165, 105], // 89-93 cheek R upper
  [38, 128], [58, 124], [70, 130], [64, 138], [44, 140], // 94-98 cheek L lower
  [162, 128], [142, 124], [130, 130], [136, 138], [156, 140], // 99-103 cheek R lower
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
  [[1, 13, 16], TIG_C.l2], // brow R
  [[15, 13, 14], TIG_C.l1],
  [[13, 16, 14], TIG_C.l1],
  // overlays
  [[17, 18, 19], TIG_C.hi], // inner ear R
  [[20, 21, 22], TIG_C.hi], // inner ear L
  [[23, 24, 25, 26], TIG_C.hi], // brow/eye patch L
  [[27, 28, 29, 30], TIG_C.hi], // brow/eye patch R
  [[31, 32, 33, 34], TIG_C.amber], // eye L
  [[35, 36, 37, 38], TIG_C.amber], // eye R
  [[39, 40, 41, 42], INK], // pupil L
  [[43, 44, 45, 46], INK], // pupil R
  [[47, 48, 49, 50, 51], TIG_C.hi], // muzzle white L
  [[52, 53, 54, 55, 56], TIG_C.hi], // muzzle white R
  [[57, 58, 59], TIG_C.hi], // chin white
  [[60, 61, 62], TIG_C.pink], // nose
  [[63, 64, 65, 66], INK], // philtrum
  [[67, 68, 69, 70], INK], // mouth
  [[71, 72, 73, 74, 75], INK], // stripes
  [[76, 77, 78, 79], INK],
  [[80, 81, 82, 83], INK],
  [[84, 85, 86, 87, 88], INK],
  [[89, 90, 91, 92, 93], INK],
  [[94, 95, 96, 97, 98], INK],
  [[99, 100, 101, 102, 103], INK],
];

/* ------------------------------------------------------------------ */

export const ANIMAL_ART: Record<RadarDim, AnimalArt> = {
  analytical: art("#f1f1fe", HAWK_V, HAWK_F),
  practical: art("#f2f4f9", ELE_V, ELE_F),
  leadership: art("#fdf7ea", LION_V, LION_F),
  people: art("#eef7fd", DOL_V, DOL_F),
  creative: art("#e9f1fb", PEA_V, PEA_F),
  entrepreneurial: art("#fdf2e6", TIG_V, TIG_F),
};
