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
/* HAWK — analytical. CUTE round chick-raptor, front-on, pastel        */
/* indigo. Big near-circular head (12-gon) over a small round body     */
/* with stubby wing lobes; two feather tufts on the crown; pale owl-   */
/* cafe face disc; huge ink sparkle eyes set low on the face; a tiny   */
/* yellow-gold beak that still keeps a little downward hook (the       */
/* "hawk" cue); pale chest patch and soft blush diamonds.              */
/* ------------------------------------------------------------------ */

const HAWK_C = {
  d2: "#9595ea", m: "#adadf2", l1: "#c5c5f7", l2: "#dcdcfb", hi: "#f2f2fe",
  gold: "#f2c14e", goldD: "#d89a2e", blush: "#f2b8cf", spark: "#ffffff",
};

const HAWK_V: ReadonlyArray<Pt> = [
  // head ring — 12 facets approximating a circle, centre (100,84)
  [100, 28], // 0 crown
  [131, 36], // 1
  [154, 56], // 2
  [162, 84], // 3
  [154, 112], // 4
  [131, 132], // 5
  [100, 140], // 6 chin
  [69, 132], // 7
  [46, 112], // 8
  [38, 84], // 9
  [46, 56], // 10
  [69, 36], // 11
  [100, 84], // 12 head centre
  // round body ring below the head (shares 5 and 7 with the head)
  [56, 148], [50, 168], [64, 184], [100, 190], [136, 184], [150, 168], [144, 148], // 13-19
  [100, 160], // 20 body centre
  // stubby wing lobes
  [58, 136], [40, 148], [40, 168], [56, 176], [68, 154], // 21-25 L
  [142, 136], [160, 148], [160, 168], [144, 176], [132, 154], // 26-30 R
  // crown feather tufts (bases tucked under the head silhouette)
  [78, 42], [85, 13], [97, 38], // 31-33 L
  [103, 38], [115, 13], [122, 42], // 34-36 R
  // pale face disc
  [60, 66], [100, 56], [140, 66], [152, 92], [138, 120], [100, 132], [62, 120], [48, 92], // 37-44
  // huge round ink eyes (octagons), set low on the face
  [62, 96], [66, 86], [76, 82], [86, 86], [90, 96], [86, 106], [76, 110], [66, 106], // 45-52 L
  [110, 96], [114, 86], [124, 82], [134, 86], [138, 96], [134, 106], [124, 110], [114, 106], // 53-60 R
  // white sparkle highlights (upper-right of each eye)
  [77, 90], [81, 86], [85, 90], [81, 94], // 61-64 L
  [125, 90], [129, 86], [133, 90], [129, 94], // 65-68 R
  // tiny gold beak with a small downward hook
  [91, 111], [109, 111], [100, 124], // 69-71 upper
  [96, 118], [104, 117], [106, 124], [98, 129], // 72-75 hook tip
  // pale chest patch
  [80, 148], [100, 142], [120, 148], [128, 164], [112, 182], [88, 182], [72, 164], // 76-82
  // blush diamonds
  [56, 112], [62, 107], [68, 112], [62, 117], // 83-86 L
  [132, 112], [138, 107], [144, 112], [138, 117], // 87-90 R
];

const HAWK_F: ReadonlyArray<FaceDef> = [
  // crown tufts first — the head covers their bases
  [[31, 32, 33], HAWK_C.m],
  [[34, 35, 36], HAWK_C.m],
  // head — 12-facet fan, symmetric light shading
  [[11, 0, 12], HAWK_C.l2],
  [[0, 1, 12], HAWK_C.l2],
  [[1, 2, 12], HAWK_C.l1],
  [[2, 3, 12], HAWK_C.m],
  [[3, 4, 12], HAWK_C.l1],
  [[4, 5, 12], HAWK_C.m],
  [[5, 6, 12], HAWK_C.l2],
  [[6, 7, 12], HAWK_C.l2],
  [[7, 8, 12], HAWK_C.m],
  [[8, 9, 12], HAWK_C.l1],
  [[9, 10, 12], HAWK_C.m],
  [[10, 11, 12], HAWK_C.l1],
  // pale face disc over the head facets
  [[37, 38, 39, 40, 41, 42, 43, 44], HAWK_C.hi],
  // round body fan (covers the chin seam — no gaps)
  [[7, 13, 20], HAWK_C.m],
  [[13, 14, 20], HAWK_C.l1],
  [[14, 15, 20], HAWK_C.m],
  [[15, 16, 20], HAWK_C.l1],
  [[16, 17, 20], HAWK_C.l1],
  [[17, 18, 20], HAWK_C.m],
  [[18, 19, 20], HAWK_C.l1],
  [[19, 5, 20], HAWK_C.m],
  [[5, 7, 20], HAWK_C.l2],
  // stubby wings
  [[21, 22, 23, 24, 25], HAWK_C.d2],
  [[26, 27, 28, 29, 30], HAWK_C.d2],
  // pale chest patch
  [[76, 77, 78, 79, 80, 81, 82], HAWK_C.hi],
  // blush
  [[83, 84, 85, 86], HAWK_C.blush],
  [[87, 88, 89, 90], HAWK_C.blush],
  // huge friendly ink eyes + sparkles
  [[45, 46, 47, 48, 49, 50, 51, 52], INK],
  [[53, 54, 55, 56, 57, 58, 59, 60], INK],
  [[61, 62, 63, 64], HAWK_C.spark],
  [[65, 66, 67, 68], HAWK_C.spark],
  // tiny hooked gold beak
  [[69, 70, 71], HAWK_C.gold],
  [[72, 73, 74, 75], HAWK_C.goldD],
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
/* LION — leadership. CUTE front-on face, soft pastel amber/gold.      */
/* Sunflower mane: 12 regular rounded scallop lobes (valleys r=60,     */
/* blunt tips r=78) around a big round face (r=48). Small round ears   */
/* peek from the mane top; huge ink sparkle eyes sit low on the face   */
/* over a pale muzzle with a tiny ink triangle nose, short philtrum    */
/* and a w-shaped cat-smile mouth; warm pink blush diamonds.           */
/* ------------------------------------------------------------------ */

const LION_C = {
  d1: "#eaa63e", d2: "#f2b95c", m: "#f7cd82", l1: "#fbdfa6", l2: "#fdecc8", hi: "#fff8ea",
  pink: "#f5b8c4", spark: "#ffffff",
};

const LION_V: ReadonlyArray<Pt> = [
  // mane valley ring — r=60 at 15+30k deg around (100,100)
  [158, 116], // 0 (15 deg)
  [142, 142], // 1
  [116, 158], // 2
  [84, 158], // 3
  [58, 142], // 4
  [42, 116], // 5
  [42, 84], // 6
  [58, 58], // 7
  [84, 42], // 8
  [116, 42], // 9
  [142, 58], // 10
  [158, 84], // 11
  // scallop lobe tips — r=78, two blunt tips per lobe (valley+10, +20 deg)
  [171, 133], [164, 145], // 12-13 lobe 0 (V0->V1)
  [145, 164], [133, 171], // 14-15 lobe 1
  [107, 178], [93, 178], // 16-17 lobe 2 (bottom)
  [67, 171], [55, 164], // 18-19 lobe 3
  [36, 145], [29, 133], // 20-21 lobe 4
  [22, 107], [22, 93], // 22-23 lobe 5 (left)
  [29, 67], [36, 55], // 24-25 lobe 6
  [55, 36], [67, 29], // 26-27 lobe 7
  [93, 22], [107, 22], // 28-29 lobe 8 (top)
  [133, 29], [145, 36], // 30-31 lobe 9
  [164, 55], [171, 67], // 32-33 lobe 10
  [178, 93], [178, 107], // 34-35 lobe 11 (right)
  // face ring — r=48, same angles as the valleys
  [146, 112], [134, 134], [112, 146], [88, 146], [66, 134], [54, 112], // 36-41
  [54, 88], [66, 66], [88, 54], [112, 54], [134, 66], [146, 88], // 42-47
  [100, 100], // 48 face centre
  // small round ears peeking from the mane top
  [58, 52], [61, 40], [72, 36], [82, 43], [78, 56], // 49-53 L outer
  [66, 48], [71, 41], [77, 47], [71, 53], // 54-57 L inner
  [142, 52], [139, 40], [128, 36], [118, 43], [122, 56], // 58-62 R outer
  [134, 48], [129, 41], [123, 47], [129, 53], // 63-66 R inner
  // pale muzzle
  [88, 114], [112, 114], [120, 128], [100, 140], [80, 128], // 67-71
  // blush diamonds
  [60, 120], [66, 114], [72, 120], [66, 126], // 72-75 L
  [128, 120], [134, 114], [140, 120], [134, 126], // 76-79 R
  // huge round ink eyes (octagons), low on the face
  [66, 102], [70, 93], [78, 90], [86, 93], [90, 102], [86, 111], [78, 114], [70, 111], // 80-87 L
  [110, 102], [114, 93], [122, 90], [130, 93], [134, 102], [130, 111], [122, 114], [114, 111], // 88-95 R
  // white sparkle highlights
  [78, 97], [82, 93], [86, 97], [82, 101], // 96-99 L
  [122, 97], [126, 93], [130, 97], [126, 101], // 100-103 R
  // tiny ink triangle nose
  [94, 116], [106, 116], [100, 124], // 104-106
  // philtrum
  [99, 124], [101, 124], [101, 128], [99, 128], // 107-110
  // w-shaped cat-smile mouth (corners up)
  [88, 130], [94, 134], [100, 130], [106, 134], [112, 130], // 111-115 top path
  [110, 134], [106, 138], [100, 134], [94, 138], [90, 134], // 116-120 bottom path
];

const LION_F: ReadonlyArray<FaceDef> = [
  // 12 rounded scallop mane lobes, alternating tone (sunflower ring)
  [[0, 12, 13, 1], LION_C.d1],
  [[1, 14, 15, 2], LION_C.d2],
  [[2, 16, 17, 3], LION_C.d1],
  [[3, 18, 19, 4], LION_C.d2],
  [[4, 20, 21, 5], LION_C.d1],
  [[5, 22, 23, 6], LION_C.d2],
  [[6, 24, 25, 7], LION_C.d1],
  [[7, 26, 27, 8], LION_C.d2],
  [[8, 28, 29, 9], LION_C.d1],
  [[9, 30, 31, 10], LION_C.d2],
  [[10, 32, 33, 11], LION_C.d1],
  [[11, 34, 35, 0], LION_C.d2],
  // mane collar — valley ring down to the face rim
  [[0, 1, 37, 36], LION_C.m],
  [[1, 2, 38, 37], LION_C.l1],
  [[2, 3, 39, 38], LION_C.m],
  [[3, 4, 40, 39], LION_C.l1],
  [[4, 5, 41, 40], LION_C.m],
  [[5, 6, 42, 41], LION_C.l1],
  [[6, 7, 43, 42], LION_C.m],
  [[7, 8, 44, 43], LION_C.l1],
  [[8, 9, 45, 44], LION_C.m],
  [[9, 10, 46, 45], LION_C.l1],
  [[10, 11, 47, 46], LION_C.m],
  [[11, 0, 36, 47], LION_C.l1],
  // big round face — 12-facet fan
  [[36, 37, 48], LION_C.l2],
  [[37, 38, 48], LION_C.l1],
  [[38, 39, 48], LION_C.l2],
  [[39, 40, 48], LION_C.l1],
  [[40, 41, 48], LION_C.l2],
  [[41, 42, 48], LION_C.l1],
  [[42, 43, 48], LION_C.l2],
  [[43, 44, 48], LION_C.l1],
  [[44, 45, 48], LION_C.l2],
  [[45, 46, 48], LION_C.l1],
  [[46, 47, 48], LION_C.l2],
  [[47, 36, 48], LION_C.l1],
  // small round ears peeking from the mane
  [[49, 50, 51, 52, 53], LION_C.d2],
  [[54, 55, 56, 57], LION_C.pink],
  [[58, 59, 60, 61, 62], LION_C.d2],
  [[63, 64, 65, 66], LION_C.pink],
  // features
  [[67, 68, 69, 70, 71], LION_C.hi], // pale muzzle
  [[72, 73, 74, 75], LION_C.pink], // blush L
  [[76, 77, 78, 79], LION_C.pink], // blush R
  [[80, 81, 82, 83, 84, 85, 86, 87], INK], // eye L
  [[88, 89, 90, 91, 92, 93, 94, 95], INK], // eye R
  [[96, 97, 98, 99], LION_C.spark], // sparkle L
  [[100, 101, 102, 103], LION_C.spark], // sparkle R
  [[104, 105, 106], INK], // tiny nose
  [[107, 108, 109, 110], INK], // philtrum
  [[111, 112, 113, 114, 115, 116, 117, 118, 119, 120], INK], // cat-smile mouth
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
/* TIGER — entrepreneurial. CUTE front-on face, soft pastel orange.    */
/* Big near-circular head (12-gon, slightly wider than tall) with      */
/* small rounded ears peeking behind the crown (pink inner ears);      */
/* huge ink sparkle eyes low on the face over a white muzzle patch;    */
/* tiny pink nose + w-shaped cat-smile mouth; exactly 7 short, small,  */
/* friendly ink stripe marks (3 forehead + 2 per cheek); blush.        */
/* ------------------------------------------------------------------ */

const TIG_C = {
  d2: "#f0985a", m: "#f6ae74", l1: "#fac490", l2: "#fddcb4", hi: "#fff3e4",
  pink: "#f4a7bb", earPink: "#fbc9d8", spark: "#ffffff",
};

const TIG_V: ReadonlyArray<Pt> = [
  // small rounded ears (bases tucked under the head silhouette)
  [42, 44], [46, 22], [62, 13], [78, 26], [74, 48], // 0-4 L outer
  [52, 34], [56, 22], [64, 18], [70, 26], [66, 36], // 5-9 L inner
  [158, 44], [154, 22], [138, 13], [122, 26], [126, 48], // 10-14 R outer
  [148, 34], [144, 22], [136, 18], [130, 26], [134, 36], // 15-19 R inner
  // head ring — 12 facets on an ellipse rx=70 ry=64, centre (100,98)
  [100, 34], // 20 crown
  [135, 43], // 21
  [161, 66], // 22
  [170, 98], // 23
  [161, 130], // 24
  [135, 153], // 25
  [100, 162], // 26 chin
  [65, 153], // 27
  [39, 130], // 28
  [30, 98], // 29
  [39, 66], // 30
  [65, 43], // 31
  [100, 98], // 32 head centre
  // white muzzle / cheek patch
  [66, 110], [100, 102], [134, 110], [140, 132], [118, 154], [82, 154], [60, 132], // 33-39
  // blush diamonds
  [58, 120], [64, 115], [70, 120], [64, 125], // 40-43 L
  [130, 120], [136, 115], [142, 120], [136, 125], // 44-47 R
  // 7 short friendly ink stripe marks
  [97, 50], [103, 50], [102, 68], [98, 68], // 48-51 forehead centre
  [81, 54], [87, 52], [86, 68], [81, 66], // 52-55 forehead L
  [113, 52], [119, 54], [119, 66], [114, 68], // 56-59 forehead R
  [42, 90], [56, 88], [57, 94], [43, 96], // 60-63 cheek L upper
  [46, 108], [60, 106], [61, 112], [47, 114], // 64-67 cheek L lower
  [144, 88], [158, 90], [157, 96], [143, 94], // 68-71 cheek R upper
  [140, 106], [154, 108], [153, 114], [139, 112], // 72-75 cheek R lower
  // huge round ink eyes (octagons), low on the face
  [61, 96], [65, 87], [74, 83], [83, 87], [87, 96], [83, 105], [74, 109], [65, 105], // 76-83 L
  [113, 96], [117, 87], [126, 83], [135, 87], [139, 96], [135, 105], [126, 109], [117, 105], // 84-91 R
  // white sparkle highlights
  [74, 91], [78, 87], [82, 91], [78, 95], // 92-95 L
  [126, 91], [130, 87], [134, 91], [130, 95], // 96-99 R
  // tiny pink nose
  [93, 112], [107, 112], [100, 121], // 100-102
  // ink philtrum
  [99, 121], [101, 121], [101, 127], [99, 127], // 103-106
  // w-shaped cat-smile mouth (corners up)
  [86, 129], [93, 134], [100, 129], [107, 134], [114, 129], // 107-111 top path
  [112, 133], [107, 138], [100, 133], [93, 138], [88, 133], // 112-116 bottom path
];

const TIG_F: ReadonlyArray<FaceDef> = [
  // ears first — the head covers their bases so they peek from behind
  [[0, 1, 2, 3, 4], TIG_C.d2],
  [[5, 6, 7, 8, 9], TIG_C.earPink],
  [[10, 11, 12, 13, 14], TIG_C.d2],
  [[15, 16, 17, 18, 19], TIG_C.earPink],
  // big round head — 12-facet fan, symmetric soft shading
  [[31, 20, 32], TIG_C.l2],
  [[20, 21, 32], TIG_C.l2],
  [[21, 22, 32], TIG_C.l1],
  [[22, 23, 32], TIG_C.m],
  [[23, 24, 32], TIG_C.l1],
  [[24, 25, 32], TIG_C.m],
  [[25, 26, 32], TIG_C.l2],
  [[26, 27, 32], TIG_C.l2],
  [[27, 28, 32], TIG_C.m],
  [[28, 29, 32], TIG_C.l1],
  [[29, 30, 32], TIG_C.m],
  [[30, 31, 32], TIG_C.l1],
  // white muzzle patch
  [[33, 34, 35, 36, 37, 38, 39], TIG_C.hi],
  // blush
  [[40, 41, 42, 43], TIG_C.pink],
  [[44, 45, 46, 47], TIG_C.pink],
  // 7 small friendly stripes
  [[48, 49, 50, 51], INK],
  [[52, 53, 54, 55], INK],
  [[56, 57, 58, 59], INK],
  [[60, 61, 62, 63], INK],
  [[64, 65, 66, 67], INK],
  [[68, 69, 70, 71], INK],
  [[72, 73, 74, 75], INK],
  // huge friendly ink eyes + sparkles
  [[76, 77, 78, 79, 80, 81, 82, 83], INK],
  [[84, 85, 86, 87, 88, 89, 90, 91], INK],
  [[92, 93, 94, 95], TIG_C.spark],
  [[96, 97, 98, 99], TIG_C.spark],
  // tiny pink nose, philtrum, cat-smile mouth
  [[100, 101, 102], TIG_C.pink],
  [[103, 104, 105, 106], INK],
  [[107, 108, 109, 110, 111, 112, 113, 114, 115, 116], INK],
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

/* ------------------------------------------------------------------ */
/* PUP — the Explorer's animal. Not bound to a RadarDim, so it lives   */
/* outside ANIMAL_ART. CUTE round caramel puppy, front-on, warm peach  */
/* bg. Big near-circular head (12-gon) over a small round body; long   */
/* floppy ears with pink-tan inner facets; pale muzzle patch; huge ink */
/* sparkle eyes; ink triangle nose over a tiny w-smile with a pink     */
/* tongue; crown fur patch, blush diamonds, front paws, wagging tail.  */
/* ------------------------------------------------------------------ */

const PUP_C = {
  d2: "#d8a878", m: "#e8c39a", l1: "#f2d7b6", l2: "#f9e7cf", hi: "#fdf4e7",
  earD: "#c08d5e", earIn: "#e8a58a", blush: "#f2b8cf", tongue: "#f490ac",
  spark: "#ffffff",
};

const PUP_V: ReadonlyArray<Pt> = [
  // head ring — 12 facets approximating a circle, centre (100,82)
  [100, 26], // 0 crown
  [131, 34], // 1
  [154, 54], // 2
  [162, 82], // 3
  [154, 110], // 4
  [131, 130], // 5
  [100, 138], // 6 chin
  [69, 130], // 7
  [46, 110], // 8
  [38, 82], // 9
  [46, 54], // 10
  [69, 34], // 11
  [100, 82], // 12 head centre
  // round body ring below the head (shares 5 and 7 with the head)
  [56, 146], [50, 166], [64, 182], [100, 188], [136, 182], [150, 166], [144, 146], // 13-19
  [100, 158], // 20 body centre
  // long floppy ears hanging over the head sides
  [66, 32], [34, 44], [26, 78], [40, 104], [58, 96], [64, 58], // 21-26 L
  [134, 32], [166, 44], [174, 78], [160, 104], [142, 96], [136, 58], // 27-32 R
  // pale muzzle patch (octagon around 100,110)
  [74, 100], [86, 90], [114, 90], [126, 100], [126, 120], [114, 130], [86, 130], [74, 120], // 33-40
  // huge round ink eyes (octagons) above the muzzle
  [58, 76], [62, 66], [72, 62], [82, 66], [86, 76], [82, 86], [72, 90], [62, 86], // 41-48 L
  [114, 76], [118, 66], [128, 62], [138, 66], [142, 76], [138, 86], [128, 90], [118, 86], // 49-56 R
  // white sparkle highlights (upper-right of each eye)
  [73, 70], [77, 66], [81, 70], [77, 74], // 57-60 L
  [129, 70], [133, 66], [137, 70], [133, 74], // 61-64 R
  // ink triangle nose, w-smile, pink tongue
  [90, 98], [110, 98], [100, 110], // 65-67 nose
  [92, 118], [100, 113], [108, 118], [100, 122], // 68-71 mouth
  [94, 122], [106, 122], [106, 134], [94, 134], // 72-75 tongue
  // soft blush diamonds on the cheeks
  [52, 98], [58, 92], [64, 98], [58, 104], // 76-79 L
  [136, 98], [142, 92], [148, 98], [142, 104], // 80-83 R
  // darker fur patch on the crown
  [100, 34], [112, 44], [100, 56], [88, 44], // 84-87
  // stubby front paws at the base of the body
  [72, 180], [92, 180], [92, 190], [72, 190], // 88-91 L
  [108, 180], [128, 180], [128, 190], [108, 190], // 92-95 R
  // wagging tail poking out to the right
  [150, 150], [172, 138], [178, 150], [158, 162], // 96-99
  // pale chest patch
  [84, 150], [100, 144], [116, 150], [116, 170], [100, 178], [84, 170], // 100-105
];

const PUP_F: ReadonlyArray<FaceDef> = [
  // tail first so the body overlaps its root
  [[96, 97, 98, 99], PUP_C.d2],
  // body fan
  [[7, 13, 20], PUP_C.m],
  [[13, 14, 20], PUP_C.l1],
  [[14, 15, 20], PUP_C.m],
  [[15, 16, 20], PUP_C.l1],
  [[16, 17, 20], PUP_C.m],
  [[17, 18, 20], PUP_C.l1],
  [[18, 19, 20], PUP_C.m],
  [[19, 5, 20], PUP_C.l1],
  [[5, 7, 20], PUP_C.l2],
  // chest patch and paws
  [[100, 101, 102, 103, 104, 105], PUP_C.hi],
  [[88, 89, 90, 91], PUP_C.hi],
  [[92, 93, 94, 95], PUP_C.hi],
  // head fan
  [[0, 1, 12], PUP_C.l1],
  [[1, 2, 12], PUP_C.m],
  [[2, 3, 12], PUP_C.l1],
  [[3, 4, 12], PUP_C.m],
  [[4, 5, 12], PUP_C.l1],
  [[5, 6, 12], PUP_C.l2],
  [[6, 7, 12], PUP_C.l2],
  [[7, 8, 12], PUP_C.l1],
  [[8, 9, 12], PUP_C.m],
  [[9, 10, 12], PUP_C.l1],
  [[10, 11, 12], PUP_C.m],
  [[11, 0, 12], PUP_C.l1],
  // crown fur patch
  [[84, 85, 86, 87], PUP_C.d2],
  // floppy ears (outer shell + inner facet)
  [[21, 22, 23, 24, 25, 26], PUP_C.earD],
  [[23, 24, 25, 26], PUP_C.earIn],
  [[27, 28, 29, 30, 31, 32], PUP_C.earD],
  [[29, 30, 31, 32], PUP_C.earIn],
  // muzzle and blush
  [[33, 34, 35, 36, 37, 38, 39, 40], PUP_C.hi],
  [[76, 77, 78, 79], PUP_C.blush],
  [[80, 81, 82, 83], PUP_C.blush],
  // eyes, sparkles, nose, smile, tongue
  [[41, 42, 43, 44, 45, 46, 47, 48], INK],
  [[49, 50, 51, 52, 53, 54, 55, 56], INK],
  [[57, 58, 59, 60], PUP_C.spark],
  [[61, 62, 63, 64], PUP_C.spark],
  [[65, 66, 67], INK],
  [[68, 69, 70, 71], INK],
  [[72, 73, 74, 75], PUP_C.tongue],
];

/** The Explorer's animal — a curious pup pulled by every real scent. */
export const PUP_ART: AnimalArt = art("#fdeeec", PUP_V, PUP_F);

export const PUP = {
  name: "Pup",
  line: "Nose to the ground, heart wide open. Follows every trail until one becomes home.",
};
