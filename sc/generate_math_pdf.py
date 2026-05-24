import os
import sys
from fpdf import FPDF, XPos, YPos

class PDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(156, 160, 168)
        self.cell(0, 10, 'SecureSteps - Assessment Mathematics & Archetype Formulas', border=0, align='R')
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
    pdf.set_fill_color(110, 110, 240) # Brand Purple/Blue
    pdf.rect(20, 50, 6, 40, 'F')
    
    pdf.set_xy(32, 50)
    pdf.set_font('Helvetica', 'B', 28)
    pdf.set_text_color(10, 14, 26) # Near black
    pdf.cell(0, 12, 'ASSESSMENT MATHEMATICS', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_x(32)
    pdf.set_font('Helvetica', 'B', 16)
    pdf.set_text_color(107, 111, 120) # Muted ink
    pdf.cell(0, 8, 'Psychometric & Archetype Match Formulas', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_x(32)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(156, 160, 168)
    pdf.cell(0, 8, 'SECURE STEPS ASSESSMENT PLATFORM - TECHNICAL MANUAL', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    # Metadata Box at bottom of cover
    pdf.set_xy(20, 210)
    pdf.set_fill_color(248, 247, 253) # Light panel bg
    pdf.set_draw_color(229, 231, 235)
    pdf.rect(20, 205, 170, 45, 'DF')
    
    pdf.set_xy(25, 210)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(110, 110, 240)
    pdf.cell(0, 4, 'DOCUMENT PURPOSE:', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(25)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(0, 5, 'Reference guide for scoring metrics & calibration values.', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_xy(25, 226)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(110, 110, 240)
    pdf.cell(0, 4, 'DATE GENERATED:', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(25)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(0, 5, 'May 24, 2026', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    # ── Page 2: Core Psychometric Dimensions & Normalization ──
    pdf.add_page()
    
    pdf.set_font('Helvetica', 'B', 16)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(0, 10, '1. Core Psychometric Dimensions & Normalization', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(4)
    
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(58, 61, 72)
    intro_p = (
        "The SecureSteps assessment engine evaluates students across 6 bipolar personality dimensions. "
        "Each option selected in the assessment contributes a pre-defined positive or negative weight vector "
        "to one or more dimensions. Because the test length is dynamic (incorporating adaptive follow-up slots), "
        "raw scores are normalized relative to the maximum possible absolute capacity of the path taken."
    )
    pdf.multi_cell(0, 6, intro_p)
    pdf.ln(6)
    
    # Core dimensions list
    dims = [
        ('decision_style', 'Intuitive (negative) vs. Deliberate / Analytical (positive)'),
        ('energy', 'Introverted / Reflective (negative) vs. Extroverted / Expressive (positive)'),
        ('structure', 'Open-ended / Spontaneous (negative) vs. Organized / Structured (positive)'),
        ('risk', 'Cautious / Risk-averse (negative) vs. Bold / Risk-tolerant (positive)'),
        ('social', 'Independent / Solo (negative) vs. Collaborative / Networked (positive)'),
        ('drive', 'Reactive / Standard (negative) vs. Proactive / Build-first (positive)')
    ]
    
    for key, spec in dims:
        pdf.set_font('Helvetica', 'B', 10)
        pdf.set_text_color(110, 110, 240)
        pdf.cell(32, 6, key + ':')
        pdf.set_font('Helvetica', '', 10)
        pdf.set_text_color(10, 14, 26)
        pdf.cell(0, 6, spec, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        
    pdf.ln(6)
    
    # Formulas heading
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(0, 6, 'Normalization Formulas:', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    
    formula_desc = (
        "Let Q be the set of answered questions. For each question q in Q, the student selects an option o_q.\n"
        "1. Raw Score calculation: Raw_dim = Sum_{q in Q} (o_q.scores.dim)\n"
        "2. Maximum Absolute Capacity: Max_dim = Sum_{q in Q} (max_{o in q.options} |o.scores.dim|)\n"
        "3. Normalized Dimension Score: Normalized_dim = round((Raw_dim / Max_dim) * 100)\n\n"
        "This maps every dimension onto a clean [-100, 100] scale, ensuring that unanswered or skipped "
        "adaptive questions do not deflate or inflate the final metrics."
    )
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(58, 61, 72)
    pdf.multi_cell(0, 6, formula_desc)
    
    # ── Page 3: Archetype Match Formulas & Calibration ──
    pdf.add_page()
    
    pdf.set_font('Helvetica', 'B', 16)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(0, 10, '2. Archetype Match Formulas & Calibration', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(4)
    
    intro_archetype = (
        "The system maps the normalized dimension scores into compatibility match ratings for 6 distinct "
        "user archetypes. The archetype with the highest match score is assigned as the student's primary archetype."
    )
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(58, 61, 72)
    pdf.multi_cell(0, 6, intro_archetype)
    pdf.ln(6)
    
    # Archetype equations table
    archetypes = [
        ('The Builder', 'drive + risk + max(0, -structure)', 'Action-oriented; values building fast over rigid rules.'),
        ('The Strategist', 'decision_style + structure + max(0, -risk / 2)', 'Deliberate and organized; values cautious planning. (Calibrated)'),
        ('The Connector', 'social + energy + max(0, -decision_style / 2)', 'People-centric; values collaboration and networking.'),
        ('The Maverick', 'risk + max(0, -structure) + max(0, drive / 2)', 'Risk-tolerant lone wolf; comfortable with high ambiguity.'),
        ('The Anchor', 'structure + max(0, -risk) + max(0, -energy / 2)', 'Orderly and calm under pressure; resists noisy trends.'),
        ('The Explorer', 'max(0, -structure) + drive + max(0, energy / 2)', 'Curious polymath; prefers breadth of interest over narrow focus.')
    ]
    
    # Print formulas
    for name, formula, desc in archetypes:
        pdf.set_font('Helvetica', 'B', 11)
        pdf.set_text_color(110, 110, 240)
        pdf.cell(32, 6, name)
        pdf.set_font('Courier', 'B', 10)
        pdf.set_text_color(10, 14, 26)
        pdf.cell(0, 6, 'Match = ' + formula, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font('Helvetica', '', 9.5)
        pdf.set_text_color(107, 111, 120)
        pdf.cell(32, 4, '')
        pdf.multi_cell(0, 4.5, desc)
        pdf.ln(4)
        
    # Calibration details
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(0, 6, 'Calibration Release Notes (May 24, 2026):', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    
    cal_detail = (
        "Problem: In testing, a large percentage of students were classified as 'The Strategist'. This occurred "
        "because its old formula 'decision_style + structure + max(0, drive / 2)' added a drive boost that was "
        "frequently positive (+25 pt average boost on balanced profiles), creating a strong mathematical bias.\n\n"
        "Solution: Replaced the drive boost with a cautiousness boost 'max(0, -risk / 2)'. This reflects the "
        "psychology of a Strategist (risk-averse/deliberate) and balances the scoring. Balanced positive profiles "
        "now tie evenly at 100 points across Builder, Strategist, Connector, and Explorer, eliminating default bias."
    )
    pdf.set_font('Helvetica', '', 9.5)
    pdf.set_text_color(58, 61, 72)
    pdf.multi_cell(0, 5.5, cal_detail)
    
    # ── Page 4: Confidence Score Calculation ──
    pdf.add_page()
    
    pdf.set_font('Helvetica', 'B', 16)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(0, 10, '3. Match Confidence Score (matchScore)', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(4)
    
    conf_intro = (
        "The report surfaces a final match confidence score (between 70% and 99%) on the cover page. "
        "This represents how distinct the user's primary archetype signature is from their overall baseline."
    )
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(58, 61, 72)
    pdf.multi_cell(0, 6, conf_intro)
    pdf.ln(6)
    
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(0, 6, 'Step-by-Step Match Confidence Algorithm:', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    
    algorithm = (
        "1. Absolute Ranking:\n"
        "   Sort the absolute values of the 6 normalized dimension scores in descending order:\n"
        "   S = sort([ |Normalized_ds|, |Normalized_en|, |Normalized_st|, ... ])\n\n"
        "2. Spread Derivation:\n"
        "   Calculate the spread between the strongest defining indicator and the median indicator:\n"
        "   Spread = max(0, S[0] - S[3])\n\n"
        "3. Base Confidence Score:\n"
        "   Base = 78 + min(18, Spread * 0.25)  [Yields a baseline range between 78 and 96]\n\n"
        "4. Engagement Adjustment:\n"
        "   Incorporate the user's interaction bandwidth (speed and emoji reactions):\n"
        "   EngBoost = (Score_engagement - 1.5) * 1.5  [Yields adjustments between -2.25 and +2.25]\n\n"
        "5. Clamping:\n"
        "   Final Match Score = clamp(70, 99, round(Base + EngBoost))"
    )
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(58, 61, 72)
    pdf.multi_cell(0, 6.5, algorithm)
    pdf.ln(10)
    
    # Document footer text
    pdf.set_font('Helvetica', 'I', 9)
    pdf.set_text_color(156, 160, 168)
    pdf.cell(0, 6, 'CONFIDENTIAL - SECURE STEPS PSYCHOMETRIC MANUAL v0.2', align='C')
    
    pdf.output('Secure_Steps_Assessment_Mathematics.pdf')
    print('SystemMsg: SUCCESS')

if __name__ == '__main__':
    create_pdf()
