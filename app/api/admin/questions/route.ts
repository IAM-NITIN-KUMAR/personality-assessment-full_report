import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { CONTEXT_QUESTIONS } from "@/lib/question-bank/context";
import { ROOTS_ANCHORS } from "@/lib/question-bank/roots";
import { ROUTES_BCA, ROUTES_BCA_ENGAGEMENT } from "@/lib/question-bank/routes-bca";
import type { Question } from "@/lib/types";

// This is a local development helper. It reads/writes questions directly to/from files.
export async function GET() {
  try {
    const readOnly = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
    return NextResponse.json({
      context: CONTEXT_QUESTIONS,
      roots: ROOTS_ANCHORS,
      routes: ROUTES_BCA,
      routes_engagement: ROUTES_BCA_ENGAGEMENT,
      readOnly,
    });
  } catch (err) {
    console.error("[admin:get] Failed to read questions:", err);
    return NextResponse.json({ error: "Failed to read question banks" }, { status: 500 });
  }
}

interface SaveRequest {
  context?: Question[];
  roots?: Question[];
  routes?: Question[];
  routes_engagement?: Question;
}

export async function POST(req: NextRequest) {
  try {
    const readOnly = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
    if (readOnly) {
      return NextResponse.json(
        { error: "Disk sync is only supported in local development. In production, the question bank is read-only." },
        { status: 400 }
      );
    }

    const body = (await req.json()) as SaveRequest;
    const projectRoot = process.cwd();

    // 1. Sync Context Questions
    if (body.context) {
      const contextPath = path.join(projectRoot, "lib", "question-bank", "context.ts");
      const code = `import type { Question } from "../types";\n\nexport const CONTEXT_QUESTIONS: Question[] = ${JSON.stringify(body.context, null, 2)};\n`;
      await fs.writeFile(contextPath, code, "utf-8");
    }

    // 2. Sync Roots Questions
    if (body.roots) {
      const rootsPath = path.join(projectRoot, "lib", "question-bank", "roots.ts");
      const code = `import type { Question } from "../types";\n\nexport const ROOTS_ANCHORS: Question[] = ${JSON.stringify(body.roots, null, 2)};\n`;
      await fs.writeFile(rootsPath, code, "utf-8");
    }

    // 3. Sync Routes Questions
    if (body.routes || body.routes_engagement) {
      const routesPath = path.join(projectRoot, "lib", "question-bank", "routes-bca.ts");
      
      const routesArray = body.routes ?? ROUTES_BCA;
      const engagementItem = body.routes_engagement ?? ROUTES_BCA_ENGAGEMENT;

      const code = `import type { Question } from "../types";\n\nexport const ROUTES_BCA: Question[] = ${JSON.stringify(routesArray, null, 2)};\n\nexport const ROUTES_BCA_ENGAGEMENT: Question = ${JSON.stringify(engagementItem, null, 2)};\n`;
      await fs.writeFile(routesPath, code, "utf-8");
    }

    return NextResponse.json({ success: true, message: "Codebase rewritten successfully!" });
  } catch (err) {
    console.error("[admin:post] Failed to persist questions:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to write files to disk" }, { status: 500 });
  }
}

