import type { RadarDim, RadarScores } from "../types";

/** Fixed neutral confirmation component for the honest-low card (Decision 2): (-1 + 6) * 3. */
export const NEUTRAL_CONF_COMPONENT = 15;

export function clampFit(n: number): number {
  return Math.min(95, Math.max(5, Math.round(n)));
}

export function computeFit(args: {
  roleScore: number;
  radar: RadarScores;
  dims: [RadarDim, RadarDim];
  conf: number;
}): { fit: number; capped: boolean } {
  const { roleScore, radar, dims, conf } = args;
  const roleComponent = (roleScore / 12) * 40;                          // 0..40
  const radarComponent = ((radar[dims[0]] + radar[dims[1]]) / 2 / 10) * 30; // 0..30
  const confComponent = (conf + 6) * 3;                                 // 0..30
  let fit = clampFit(roleComponent + radarComponent + confComponent);
  const capped = conf <= -2;
  if (capped && fit > 55) fit = 55;
  return { fit, capped };
}
