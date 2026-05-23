import os
import sys
from fpdf import FPDF, XPos, YPos

class PDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(156, 160, 168)
        self.cell(0, 10, 'Roots & Routes - Project Analysis & Technical Documentation', border=0, align='R')
        self.ln(12)
        # Draw thin line
        self.set_draw_color(229, 231, 235)
        self.line(20, 20, 190, 20)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(156, 160, 168)
        self.cell(0, 10, f'Page {self.page_no()}', border=0, align='C')

def create_pdf():
    pdf = PDF(orientation='P', unit='mm', format='A4')
    pdf.set_margins(20, 20, 20)
    pdf.set_auto_page_break(auto=True, margin=20)
    
    # ── Page 1: Cover Page ──
    pdf.add_page()
    
    # Accent Bar
    pdf.set_fill_color(243, 166, 217) # Brand Electric Pink
    pdf.rect(20, 50, 6, 40, 'F')
    
    pdf.set_xy(32, 50)
    pdf.set_font('Helvetica', 'B', 32)
    pdf.set_text_color(10, 14, 26) # Near black
    pdf.cell(0, 12, 'ROOTS & ROUTES', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_x(32)
    pdf.set_font('Helvetica', 'B', 16)
    pdf.set_text_color(107, 111, 120) # Muted ink
    pdf.cell(0, 8, 'Technical & Design Analysis', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_x(32)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(156, 160, 168)
    pdf.cell(0, 8, 'SECURE STEPS ASSESSMENT PLATFORM - v0.1', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    # Metadata Box at bottom of cover
    pdf.set_xy(20, 210)
    pdf.set_fill_color(244, 244, 246) # Light panel bg
    pdf.set_draw_color(229, 231, 235)
    pdf.rect(20, 205, 170, 45, 'DF')
    
    pdf.set_xy(25, 210)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(107, 111, 120)
    pdf.cell(0, 4, 'PREPARED FOR:', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(25)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(0, 5, 'Secure Steps Development Team', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_xy(25, 226)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(107, 111, 120)
    pdf.cell(0, 4, 'DATE GENERATED:', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(25)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(0, 5, 'May 23, 2026', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    # ── Page 2: Table of Contents & Executive Summary ──
    pdf.add_page()
    
    pdf.set_font('Helvetica', 'B', 18)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(0, 10, 'Executive Summary', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(4)
    
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(58, 61, 72)
    exec_summary = (
        "Roots & Routes is a next-generation psychometric personality and career-fit assessment web "
        "application engineered to replace legacy in-funnel tools (like PRISM) in the Secure Steps flow. "
        "Built on a strict, modern tech stack including Next.js 15.5, React 19, Zustand, Framer Motion, "
        "and client-side PDF rendering, the application captures a deep profile of 16-24 year-old students. "
        "Through scenario-based anchors and AI-driven adaptive probing, it produces a highly detailed, "
        "personalized ~20-page interactive report and identical PDF. This document provides a robust, "
        "high-fidelity technical review of the platform's architecture, psychometric dimensions, derivation "
        "engines, design tokens, and future roadmap."
    )
    pdf.multi_cell(0, 6, exec_summary)
    pdf.ln(10)
    
    # Table of Contents
    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(0, 8, 'Table of Contents', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(4)
    
    toc_items = [
        ('1. Executive Summary', 'Page 2'),
        ('2. Technology Stack & Client-Side Architecture', 'Page 3'),
        ('3. Core Assessment Flow & Dynamic Routing', 'Page 4'),
        ('4. Psychometric Model & Core Dimensions', 'Page 5'),
        ('5. Deep Derivation & Reporting Engines', 'Page 6'),
        ('6. Design System & Next-Phase Recommendations', 'Page 7')
    ]
    
    for item, page in toc_items:
        pdf.set_font('Helvetica', '', 10)
        pdf.set_text_color(10, 14, 26)
        pdf.cell(120, 8, item)
        pdf.set_text_color(156, 160, 168)
        pdf.cell(30, 8, '.' * 25, align='R')
        pdf.set_text_color(10, 14, 26)
        pdf.cell(20, 8, page, align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        
    # ── Page 3: Technology Stack ──
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 16)
    pdf.cell(0, 10, '1. Technology Stack & Client-Side Architecture', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(4)
    
    tech_intro = (
        "The Roots & Routes codebase utilizes a zero-database, performance-driven client-first "
        "architecture deployed on Vercel. It is built using the following stack:"
    )
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(58, 61, 72)
    pdf.multi_cell(0, 6, tech_intro)
    pdf.ln(4)
    
    tech_stack = [
        ('Frontend Framework', 'Next.js 15.5 (App Router) + React 19 Core'),
        ('Language', 'TypeScript (strictly configured typing)'),
        ('Styling', 'Tailwind CSS 3 + custom micro-utility class framework'),
        ('State Management', 'Zustand 5 with localStorage persistence middleware'),
        ('Animation', 'Framer Motion 11 for card, radar and dial transition mechanics'),
        ('PDF Generation', '@react-pdf/renderer 4 for pure client-side PDF compiles'),
        ('AI Integration', '@anthropic-ai/sdk 0.39 for API route probing (/api/probe)'),
        ('UI Components', 'Radix UI primitives for dialog, progress and overlays')
    ]
    
    for name, desc in tech_stack:
        pdf.set_font('Helvetica', 'B', 10)
        pdf.set_text_color(243, 166, 217)
        pdf.write(6, '- ')
        pdf.set_text_color(10, 14, 26)
        pdf.write(6, name + ': ')
        pdf.set_font('Helvetica', '', 10)
        pdf.set_text_color(58, 61, 72)
        pdf.write(6, desc + '\n')
        
    pdf.ln(6)
    
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(0, 6, 'Architecture Insights:', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    
    arch_detail = (
        "Zustand State Store (lib/store.ts): The entire state of the assessment lives in a single store, "
        "persisted under the localStorage key 'roots-and-routes-assessment'. This eliminates the need "
        "for a database in v0.1, making the application highly robust against page reloads. The schema is "
        "highly compatible with standard relational mapping, allowing a seamless transition to a Supabase "
        "persistence layer (estimated at ~30 lines of store.ts code modification).\n\n"
        "Client-Side PDF Compiler (lib/report-pdf.tsx): Rather than running heavy serverless functions "
        "with headless browsers to export reports, the application compiles the entire ~20-page document "
        "inside the client's browser using @react-pdf/renderer. This ensures lightning-fast downloads "
        "and zero server billing overhead, regardless of concurrent user spikes."
    )
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(58, 61, 72)
    pdf.multi_cell(0, 6, arch_detail)
    
    # ── Page 4: Core Assessment Flow & Dynamic Routing ──
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 16)
    pdf.cell(0, 10, '2. Core Assessment Flow & Dynamic Routing', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(4)
    
    flow_intro = (
        "The Roots & Routes assessment avoids typical boring questionnaire models, using a dynamic "
        "progressive node-graph layout. The assessment flows as follows:"
    )
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(58, 61, 72)
    pdf.multi_cell(0, 6, flow_intro)
    pdf.ln(4)
    
    flow_steps = [
        ('Step 1: Context (10 Questions)', 'Front-loads practical constraints (budget, geography, family, ambition, timeline, and 5-year dream). It filters academic choices before personality matches are calculated.'),
        ('Step 2: Roots (20 Anchors + 5 Probes)', 'Calculates core psychometric scores across 6 baseline dimensions. Features 5 adaptive slots (indices 2, 6, 10, 14, 18) where the system dynamically queries the LLM route for personal follow-up cards.'),
        ('Step 3: Teaser Screen (Halftime)', 'Locks the Roots answers, runs archetype calculations, and displays a premium transition reveal screen showing the computed Archetype (e.g. Builder, Strategist, etc.).'),
        ('Step 4: Routes (8 Anchors + 3 Probes)', 'Focuses on the chosen field of study (CS/Tech, Business, BCom, etc.). Currently, tech_cs (BCA/BTech) is the active anchor module, with others gracefully falling back to it.'),
        ('Step 5: Dynamic Report Section', 'Builds massive parallel layouts for screen (Tailwind glassmorphic panels) and PDF (A4 printable canvas).')
    ]
    
    for title, body in flow_steps:
        pdf.set_font('Helvetica', 'B', 11)
        pdf.set_text_color(243, 166, 217)
        pdf.write(6, title + '\n')
        pdf.set_font('Helvetica', '', 10)
        pdf.set_text_color(58, 61, 72)
        pdf.write(6, body + '\n\n')
        
    # ── Page 5: Psychometric Model & Core Dimensions ──
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 16)
    pdf.cell(0, 10, '3. Psychometric Model & Core Dimensions', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(4)
    
    psy_intro = (
        "The psychometric engine measures 6 bipolar dimensions mapped on a -100 to +100 normalized "
        "scale. Dimensions are mapped through scenario options, each contributing a weighted -2 to +2 "
        "score vector. The normalized dimensions are:"
    )
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(58, 61, 72)
    pdf.multi_cell(0, 6, psy_intro)
    pdf.ln(4)
    
    dimensions_list = [
        ('Decision Style', 'Intuitive (low) <-> Deliberate (high)', 'Measures method of choice selection and planning.'),
        ('Energy', 'Introvert (low) <-> Extrovert (high)', 'Measures source of motivation and interpersonal energy.'),
        ('Structure', 'Open-ended (low) <-> Structured (high)', 'Measures comfort with schedules, standards and routines.'),
        ('Risk Tolerance', 'Cautious (low) <-> Bold (high)', 'Measures comfort with uncertainty, failure and speed.'),
        ('Social Mode', 'Independent (low) <-> Collaborative (high)', 'Measures preference for individual work vs networks.'),
        ('Drive', 'Reactive (low) <-> Proactive (high)', 'Measures bias for proactive building vs reactive responses.')
    ]
    
    for name, spectrum, desc in dimensions_list:
        pdf.set_font('Helvetica', 'B', 11)
        pdf.set_text_color(10, 14, 26)
        pdf.write(6, name + '  (' + spectrum + ')\n')
        pdf.set_font('Helvetica', '', 10)
        pdf.set_text_color(58, 61, 72)
        pdf.write(6, desc + '\n\n')
        
    pdf.ln(4)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(0, 6, 'Adaptive LLM Layer (/api/probe/route.ts):', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    
    adaptive_detail = (
        "Integrated with Claude, this serverless route handles dynamic questions. When a slot is triggered, "
        "the frontend sends the student's context, history, and current choices. Claude responds with a "
        "highly customized JSON follow-up scenario ('deeper' mode) tailored to their choice.\n\n"
        "Additionally, the platform features a five-emoji Reaction Bar (fire, think, bored, etc.). Positive "
        "reactions tell Claude to write a deeper follow-up, while negative ones (meh, bored) trigger 'rephrase' "
        "mode, rewriting the scenario on-the-fly to keep the student engaged while retaining the psychometric weights."
    )
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(58, 61, 72)
    pdf.multi_cell(0, 6, adaptive_detail)
    
    # ── Page 6: Deep Derivation & Reporting Engines ──
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 16)
    pdf.cell(0, 10, '4. Deep Derivation & Reporting Engines', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(4)
    
    engine_intro = (
        "The heart of Roots & Routes is the Derivation Engine (lib/report-data.ts), which translates "
        "dimensional matrices into deep analytics matching PRISM's comprehensive structure:"
    )
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(58, 61, 72)
    pdf.multi_cell(0, 6, engine_intro)
    pdf.ln(4)
    
    derivations = [
        ('Work Preferences (15 Categories)', 'Calculates continuous comfort scores using cross-dimension coordinates. Formulas such as consensus building, imaginative concepting, consensus, and adaptability are evaluated on a 0-100 comfort spectrum.'),
        ('Work Aptitudes (8 Core Areas)', 'Identifies areas of frictionless performance (Analytical, Creative, Outgoing, Orderly, Competitive, etc.) mapped directly onto SVG radar charts.'),
        ('Environment Fit (18 Fit Markers)', 'Predicts compatibility with specific environments (startup, corporate, remote, flat-org, stable stack, etc.) as Enhanced, Neutral, or Inhibited based on boundary coordinates.'),
        ('Career Development Analysis (26 Continuum Traits)', 'Plots sliding indicator bars showing behavior poles across 6 groups (People Skills, Conscientiousness, Thinking Skills, Ideal Environment, Drive, and Resilience).'),
        ('Personalized Narrative & Family Letter', 'Generates a vivid Future Day narrative (Typical day in 5 years in their chosen field) and a professional letter for the student\'s parents, framing the results in Secure Steps voice.')
    ]
    
    for title, body in derivations:
        pdf.set_font('Helvetica', 'B', 11)
        pdf.set_text_color(243, 166, 217)
        pdf.write(6, title + '\n')
        pdf.set_font('Helvetica', '', 10)
        pdf.set_text_color(58, 61, 72)
        pdf.write(6, body + '\n\n')
        
    # ── Page 7: Design System & Recommendations ──
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 16)
    pdf.cell(0, 10, '5. Design System & Roadmap Recommendations', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(4)
    
    design_system = (
        "The Roots & Routes design system builds a gorgeous visual impression tailored to teenagers, "
        "designed to maximize complete rates:\n\n"
        "Interactive Canvas Backdrop: The landing page mounts an HTML5 <canvas> simulating 6 responsive, "
        "glowing ambient orbs using custom mouse vector equations. The layout shifts organically, responding "
        "to cursor movements and viewport resizes.\n\n"
        "Tactile Micro-interactions: Cards use heavy glassmorphism filters (blur(28px)), pure-white "
        "surfaces, near-black ink, and pink electric highlights. Option buttons react instantly with "
        "spring physics, creating a satisfying, game-like tactile experience."
    )
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(58, 61, 72)
    pdf.multi_cell(0, 6, design_system)
    pdf.ln(6)
    
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(0, 6, 'Phase 2 Recommendations:', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    
    recommendations = [
        ('1. Per-Discipline Routes Expansion', 'Construct and build specialized question blocks for the remaining 12 disciplines in the course catalog (Business, Commerce, Law, Design, Humanities, etc.).'),
        ('2. Standardize Psychometrics', 'Evolve the back-of-envelope summation weights into formal Confirmatory Factor Analysis (CFA) or Item Response Theory (IRT) algorithms as assessment data grows.'),
        ('3. Supabase Persistence Layer', 'Swap Zustand\'s local storage persistence to a Supabase relational database, allowing counsellors and administrators to review reports in real-time dashboards.'),
        ('4. Edge PDF Pre-computation', 'Pre-generate PDF assets at the Vercel Edge level to improve mobile download speeds and viewport scaling.')
    ]
    
    for title, desc in recommendations:
        pdf.set_font('Helvetica', 'B', 10)
        pdf.set_text_color(10, 14, 26)
        pdf.write(6, title + '\n')
        pdf.set_font('Helvetica', '', 10)
        pdf.set_text_color(58, 61, 72)
        pdf.write(6, desc + '\n\n')
        
    pdf.output('Secure_Steps_Project_Analysis.pdf')
    print('SystemMsg: SUCCESS')

if __name__ == '__main__':
    create_pdf()
