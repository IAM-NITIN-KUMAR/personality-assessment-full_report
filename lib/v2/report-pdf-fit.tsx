// Renders the college report PDF so that every sheet comes out full: broken, sized and spread.
// The plan is made in report-pdf-scale.ts; this file measures the rows for it and renders the result.

import { pdf } from "@react-pdf/renderer";
import ReportPdfV2, { SHEET_HEIGHT } from "./report-pdf";
import type { PdfFit } from "./report-pdf";
import { planReport, SIZES } from "./report-pdf-scale";
import type { ReportV2 } from "./types";

/** Sheets in a rendered PDF, read from the file itself: one "/Type /Page" entry per sheet. */
async function sheetsIn(blob: Blob): Promise<number> {
  return ((await blob.text()).match(/\/Type\s*\/Page\b/g) ?? []).length;
}

export interface FittedReport {
  blob: Blob;
  sheets: number;
  /** How it was set, for checking: the smallest and largest size used, and the share of the sheets left empty. */
  sizes: [number, number];
  empty: number;
  renders: number;
  /** False when the plan could not be kept and the report was rendered as it falls. */
  planned: boolean;
}

export async function renderFittedReport(report: ReportV2): Promise<FittedReport> {
  let renders = 0;
  const render = (fit: PdfFit) => {
    renders += 1;
    return pdf(<ReportPdfV2 report={report} {...fit} />).toBlob();
  };
  const plain = async (fit: PdfFit): Promise<FittedReport> => {
    const blob = await render(fit);
    return { blob, sheets: await sheetsIn(blob), sizes: [1, 1], empty: 0, renders, planned: false };
  };

  // With the First Principles page the report is three separate parts, each ending where it ends.
  if (report.thinking) return plain({});

  try {
    // The height of every row at every size, from one trial render: every row alone on a sheet,
    // once at each size, each sheet reporting the room it has left. What a row takes is the rest.
    const room: number[] = [];
    await render({ measure: SIZES, onRoom: (left) => room.push(left) });
    const rows = room.length / SIZES.length;
    if (room.length === 0 || !Number.isInteger(rows)) throw new Error("the rows could not be measured");
    const heights = SIZES.map((_, a) => room.slice(a * rows, (a + 1) * rows).map((left) => SHEET_HEIGHT - left));

    const plan = planReport(heights, SHEET_HEIGHT);
    const blob = await render({ sizes: plan.sizes, breaks: plan.breaks, spread: true });
    if ((await sheetsIn(blob)) === plan.sheets) {
      const sizes: [number, number] = [Math.min(...plan.sizes), Math.max(...plan.sizes)];
      return { blob, sheets: plan.sheets, sizes, empty: plan.empty, renders, planned: true };
    }
    // The render did not take the sheets planned: let the sheets fall as they do.
    return plain({ spread: true });
  } catch (err) {
    // Whatever goes wrong with the fitting, the student still gets a report.
    console.error("report PDF fitting failed; rendering it plain:", err);
    return plain({});
  }
}
