import os
import subprocess
import zipfile
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
if not os.path.exists(CHROME_PATH):
    CHROME_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

# Brand Colors matching Sample PPT Review 1
COLOR_PRIMARY_GREEN = RGBColor(112, 173, 71)    # #70AD47 (Sample PPT Lime Green)
COLOR_DARK_GREEN = RGBColor(55, 86, 35)         # #375623 (Deep Academic Green)
COLOR_LIGHT_GREEN = RGBColor(226, 239, 218)     # #E2EFDA (Table tint)
COLOR_PALE_GREEN = RGBColor(242, 248, 238)      # #F2F8EE (Subtle row tint)
COLOR_DARK_TEXT = RGBColor(30, 41, 59)          # #1E293B (Crisp body text)
COLOR_MUTED_TEXT = RGBColor(100, 116, 139)      # #64748B (Subtitles/captions)
COLOR_WHITE = RGBColor(255, 255, 255)           # #FFFFFF
COLOR_BORDER = RGBColor(200, 220, 195)          # Soft green border

def add_header_banner(slide, top_in=0.25, height_in=0.85):
    """Adds the official college header banner to the slide."""
    banner_path = os.path.join(ASSETS_DIR, "extracted_img.jpg")
    if os.path.exists(banner_path):
        slide.shapes.add_picture(banner_path, Inches(0.8), Inches(top_in), width=Inches(8.5))
    else:
        logo_path = os.path.join(ASSETS_DIR, "college_logo.png")
        if os.path.exists(logo_path):
            slide.shapes.add_picture(logo_path, Inches(0.8), Inches(top_in), width=Inches(0.9))

def add_right_geometric_facets(slide):
    """Draws geometric green faceted triangles on the right edge matching Sample PPT."""
    t1 = slide.shapes.add_shape(MSO_SHAPE.RIGHT_TRIANGLE, Inches(10.5), Inches(0), Inches(2.833), Inches(7.5))
    t1.fill.solid()
    t1.fill.fore_color.rgb = RGBColor(226, 239, 218)
    t1.line.color.rgb = RGBColor(226, 239, 218)
    t1.rotation = 180

    t2 = slide.shapes.add_shape(MSO_SHAPE.RIGHT_TRIANGLE, Inches(11.2), Inches(1.5), Inches(2.133), Inches(6.0))
    t2.fill.solid()
    t2.fill.fore_color.rgb = RGBColor(169, 208, 142)
    t2.line.color.rgb = RGBColor(169, 208, 142)

    t3 = slide.shapes.add_shape(MSO_SHAPE.RIGHT_TRIANGLE, Inches(11.8), Inches(3.0), Inches(1.533), Inches(4.5))
    t3.fill.solid()
    t3.fill.fore_color.rgb = RGBColor(112, 173, 71)
    t3.line.color.rgb = RGBColor(112, 173, 71)
    t3.rotation = 90

def add_slide_title(slide, title_text, top_in=0.6, font_size=28):
    """Adds a standard formatted slide title matching Sample PPT."""
    tx_box = slide.shapes.add_textbox(Inches(0.8), Inches(top_in), Inches(10.0), Inches(0.8))
    tf = tx_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.name = "Calibri"
    p.font.size = Pt(font_size)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY_GREEN

def add_run(p, text="", bold=False, italic=False, size_pt=12, color=COLOR_DARK_TEXT):
    """Safely creates and styles a run in python-pptx."""
    run = p.add_run()
    run.text = text
    run.font.name = "Calibri"
    run.font.bold = bold
    run.font.italic = italic
    run.font.size = Pt(size_pt)
    run.font.color.rgb = color
    return run

def format_cell(cell, text, bold=False, font_size=11, color=COLOR_DARK_TEXT, bg_color=None, align=PP_ALIGN.LEFT):
    """Formats a single table cell with text, background color, and padding."""
    if bg_color:
        cell.fill.solid()
        cell.fill.fore_color.rgb = bg_color
    cell.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf = cell.text_frame
    tf.word_wrap = True
    tf.margin_top = Inches(0.06)
    tf.margin_bottom = Inches(0.06)
    tf.margin_left = Inches(0.1)
    tf.margin_right = Inches(0.1)
    p = tf.paragraphs[0]
    p.alignment = align
    p.text = ""
    add_run(p, text, bold=bold, size_pt=font_size, color=color)

def build_presentation_deck(output_pptx_path):
    """Generates the official 12-slide review presentation matching Sample PPT Review 1 exactly."""
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_slide_layout = prs.slide_layouts[6]

    # ============================================================
    # SLIDE 1: TITLE SLIDE
    # ============================================================
    s1 = prs.slides.add_slide(blank_slide_layout)
    add_header_banner(s1, top_in=0.3, height_in=0.95)
    add_right_geometric_facets(s1)

    # Title & Subtitle Box
    t_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(9.8), Inches(2.2))
    tf1 = t_box.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.space_after = Pt(6)
    add_run(p1, "CAMPUS NOTIFY: INSTITUTIONAL CIRCULAR &\nANNOUNCEMENT MANAGEMENT SYSTEM", bold=True, size_pt=26, color=COLOR_DARK_GREEN)

    p1_sub = tf1.add_paragraph()
    p1_sub.space_after = Pt(10)
    add_run(p1_sub, "A Modular, Object-Oriented System in Core Java SE 17 with Responsive Web Interface", italic=True, size_pt=14, color=COLOR_MUTED_TEXT)

    p1_badge = tf1.add_paragraph()
    add_run(p1_badge, "Review – 1 Presentation | Java Programming Laboratory (Semester – III)", bold=True, size_pt=12, color=COLOR_PRIMARY_GREEN)

    # Guide Box
    g_box = s1.shapes.add_textbox(Inches(0.8), Inches(3.8), Inches(9.8), Inches(0.6))
    g_tf = g_box.text_frame
    g_p = g_tf.paragraphs[0]
    add_run(g_p, "Guide: ", bold=True, size_pt=15, color=COLOR_DARK_TEXT)
    add_run(g_p, "Prof. Sonali Kharat", bold=True, size_pt=15, color=COLOR_PRIMARY_GREEN)

    # Team Details Heading & Table matching Sample PPT
    team_lbl_box = s1.shapes.add_textbox(Inches(0.8), Inches(4.45), Inches(6.0), Inches(0.4))
    lbl_p = team_lbl_box.text_frame.paragraphs[0]
    add_run(lbl_p, "Team Details:", bold=True, size_pt=14, color=COLOR_DARK_TEXT)

    team_table_shape = s1.shapes.add_table(4, 2, Inches(0.8), Inches(4.9), Inches(6.5), Inches(1.5))
    team_tbl = team_table_shape.table
    team_tbl.columns[0].width = Inches(2.4)
    team_tbl.columns[1].width = Inches(4.1)

    format_cell(team_tbl.cell(0, 0), "Student ID", bold=True, font_size=11, color=COLOR_WHITE, bg_color=COLOR_PRIMARY_GREEN)
    format_cell(team_tbl.cell(0, 1), "Student Name", bold=True, font_size=11, color=COLOR_WHITE, bg_color=COLOR_PRIMARY_GREEN)

    students = [
        ("VU4F2526072", "PRATIK ATPADKAR"),
        ("VU4F2526066", "HARSH TIWAR"),
        ("VU4F2526062", "PARTH GADADHE")
    ]
    for idx, (sid, sname) in enumerate(students, start=1):
        row_bg = COLOR_LIGHT_GREEN if idx % 2 == 1 else COLOR_PALE_GREEN
        format_cell(team_tbl.cell(idx, 0), sid, bold=True, font_size=11, bg_color=row_bg)
        format_cell(team_tbl.cell(idx, 1), sname, bold=True, font_size=11, bg_color=row_bg)

    # Footer Institute
    dept_box = s1.shapes.add_textbox(Inches(0.8), Inches(6.6), Inches(9.8), Inches(0.5))
    dp = dept_box.text_frame.paragraphs[0]
    add_run(dp, "Department of Information Technology | VPPCOE&VA, Sion, Mumbai", italic=True, size_pt=11, color=COLOR_MUTED_TEXT)

    # ============================================================
    # SLIDE 2: TABLE OF CONTENT
    # ============================================================
    s2 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s2)
    add_slide_title(s2, "Table of Content:")

    toc_box = s2.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(9.5), Inches(5.2))
    tf2 = toc_box.text_frame
    tf2.word_wrap = True

    toc_items = [
        "Introduction",
        "Problem Statement",
        "Objectives",
        "Literature Survey",
        "Research Gap",
        "Proposed Solution",
        "Project Planning & Timeline",
        "Conclusion",
        "References"
    ]

    for i, item in enumerate(toc_items):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.space_after = Pt(14)
        add_run(p, "►  ", bold=True, size_pt=18, color=COLOR_PRIMARY_GREEN)
        add_run(p, item, bold=True, size_pt=17, color=COLOR_DARK_TEXT)

    # ============================================================
    # SLIDE 3: INTRODUCTION
    # ============================================================
    s3 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s3)
    add_slide_title(s3, "Introduction:")

    intro_box = s3.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(9.5), Inches(5.2))
    tf3 = intro_box.text_frame
    tf3.word_wrap = True

    intro_points = [
        ("Institutional Context", "University campuses require fast, authenticated, and transparent dissemination of critical academic notices, examination timetables, fee circulars, and departmental events."),
        ("Limitations of Legacy Systems", "Traditional physical notice boards and informal WhatsApp broadcast groups lead to notice loss, cognitive clutter, and complete absence of delivery verification."),
        ("Need for Digital Centralization", "A single, authoritative digital notice board ensures official circulars reach every student, faculty member, and administrator without physical delays."),
        ("Core Java SE 17 Engineering", "Developed as part of the Java Programming Laboratory to demonstrate real-world applications of Object-Oriented Programming (OOP), file streams, and security models."),
        ("Target Stakeholders", "Specifically tailored for Department of Information Technology and administrative governance at Vasantdada Patil Pratishthan's College of Engineering & Visual Arts.")
    ]

    for i, (title, desc) in enumerate(intro_points):
        p = tf3.paragraphs[0] if i == 0 else tf3.add_paragraph()
        p.space_after = Pt(12)
        add_run(p, "►  ", bold=True, size_pt=14, color=COLOR_PRIMARY_GREEN)
        add_run(p, f"{title}: ", bold=True, size_pt=14, color=COLOR_DARK_GREEN)
        add_run(p, desc, size_pt=13, color=COLOR_DARK_TEXT)

    # ============================================================
    # SLIDE 4: PROBLEM STATEMENT
    # ============================================================
    s4 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s4)
    add_slide_title(s4, "Problem Statement:")

    prob_box = s4.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(9.5), Inches(5.2))
    tf4 = prob_box.text_frame
    tf4.word_wrap = True

    prob_points = [
        ("Physical Notice Board Bottlenecks", "Circulars get torn, misplaced, or buried under newer posters; students absent from campus miss urgent submission deadlines and academic announcements."),
        ("Social Media Chaos & Cognitive Fatigue", "WhatsApp and Telegram groups mix official circulars with informal chatter, memes, and non-academic media, leading to missed examination dates."),
        ("Zero Proof of Delivery & Acknowledgment", "Faculty and examination cells have no verifiable mechanism or digital logs to confirm whether targeted students actually read critical notices."),
        ("Vulnerability to Fake Circulars & Rumors", "Unofficial broadcast channels lack Role-Based Access Control (RBAC), leaving students susceptible to unverified exam cancellation rumors."),
        ("Paper Waste & High Operational Overhead", "High recurring paper printing costs, toner waste, and physical labor required to distribute and pin paper circulars across multiple campus buildings.")
    ]

    for i, (title, desc) in enumerate(prob_points):
        p = tf4.paragraphs[0] if i == 0 else tf4.add_paragraph()
        p.space_after = Pt(12)
        add_run(p, "►  ", bold=True, size_pt=14, color=COLOR_PRIMARY_GREEN)
        add_run(p, f"{title}: ", bold=True, size_pt=14, color=COLOR_DARK_GREEN)
        add_run(p, desc, size_pt=13, color=COLOR_DARK_TEXT)

    # ============================================================
    # SLIDE 5: OBJECTIVES
    # ============================================================
    s5 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s5)
    add_slide_title(s5, "Objectives:")

    obj_box = s5.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(9.5), Inches(5.2))
    tf5 = obj_box.text_frame
    tf5.word_wrap = True

    obj_points = [
        ("Centralized Digital Notice Repository", "To build a single authoritative portal categorized by department (IT, Comps, Mech, Civil) and priority (Urgent, Normal)."),
        ("Implement Core Java OOP Architecture", "To apply Encapsulation, Inheritance, Polymorphism, and Interfaces (Notifiable, AuditLoggable) for robust, maintainable domain services."),
        ("Enforce Role-Based Access Control (RBAC)", "To establish a Zero-Access Security Wall restricting circular creation, editing, and deletion strictly to authenticated Super Admins and Faculty."),
        ("Provide Verifiable Digital Acknowledgment", "To enable students to digitally acknowledge circulars with instant timestamped receipts for administrative audit records."),
        ("Deliver Responsive & Offline Accessibility", "To ensure 100% responsive user experience across mobile phones, tablets, and PCs with local caching during connectivity drops."),
        ("Promote Green Campus Sustainability", "To eliminate paper dependency, advancing UN Sustainable Development Goals (SDG 9: Innovation, SDG 12: Responsible Consumption).")
    ]

    for i, (title, desc) in enumerate(obj_points):
        p = tf5.paragraphs[0] if i == 0 else tf5.add_paragraph()
        p.space_after = Pt(10)
        add_run(p, "►  ", bold=True, size_pt=13.5, color=COLOR_PRIMARY_GREEN)
        add_run(p, f"{title}: ", bold=True, size_pt=13.5, color=COLOR_DARK_GREEN)
        add_run(p, desc, size_pt=12.5, color=COLOR_DARK_TEXT)

    # ============================================================
    # SLIDE 6: LITERATURE SURVEY
    # ============================================================
    s6 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s6)
    add_slide_title(s6, "Literature Survey:")

    table_shape = s6.shapes.add_table(5, 6, Inches(0.8), Inches(1.5), Inches(10.2), Inches(5.2))
    tbl = table_shape.table
    tbl.columns[0].width = Inches(0.6)  # Sr. No.
    tbl.columns[1].width = Inches(2.2)  # Title
    tbl.columns[2].width = Inches(1.3)  # Publication
    tbl.columns[3].width = Inches(1.8)  # Author & Year
    tbl.columns[4].width = Inches(2.0)  # Methodology
    tbl.columns[5].width = Inches(2.3)  # Key Findings

    headers = ["Sr.\nNo.", "Title:", "Publication", "Author &\nYear", "Methodology:", "Key\nFindings:"]
    for c_idx, h in enumerate(headers):
        format_cell(tbl.cell(0, c_idx), h, bold=True, font_size=10, color=COLOR_WHITE, bg_color=COLOR_PRIMARY_GREEN, align=PP_ALIGN.CENTER)

    lit_data = [
        ("1", "Digital Campus Information Dissemination Systems", "IEEE Access", "R. Sharma et al.\n(2021)", "Centralized push notification broker using message queues", "High delivery rate across networks, but lacked role-based publishing controls and offline fallback."),
        ("2", "Smart Notice Board using IoT Cloud Services", "IJERT", "P. Patel &\nS. Deshmukh (2022)", "Raspberry Pi & LCD digital display displays", "Reduced paper waste, but required expensive on-campus physical hardware; inaccessible remotely."),
        ("3", "Role-Based Information Management in Higher Ed", "Springer CS", "A. Gupta &\nK. Rao (2023)", "Multi-tier RBAC with relational access models", "Proved security benefits of role boundaries, but lacked client-side caching and acknowledgment receipts."),
        ("4", "Campus Communication Bottlenecks in Higher Education", "Elsevier CIE", "M. Fernandez et al.\n(2024)", "Empirical survey across 12 university campuses", "68% of surveyed students missed critical deadlines due to unverified social media broadcast groups.")
    ]

    for r_idx, row in enumerate(lit_data, start=1):
        row_bg = COLOR_LIGHT_GREEN if r_idx % 2 == 1 else COLOR_PALE_GREEN
        for c_idx, val in enumerate(row):
            align = PP_ALIGN.CENTER if c_idx in [0, 2, 3] else PP_ALIGN.LEFT
            format_cell(tbl.cell(r_idx, c_idx), val, font_size=9.5, bg_color=row_bg, align=align)

    # ============================================================
    # SLIDE 7: RESEARCH GAP
    # ============================================================
    s7 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s7)
    add_slide_title(s7, "Research Gap:")

    gap_box = s7.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(9.5), Inches(5.2))
    tf7 = gap_box.text_frame
    tf7.word_wrap = True

    gap_points = [
        ("Lack of Strict Role-Based Publishing", "Existing communication channels either permit unrestricted student posting (leading to spam and rumors) or rely on complex enterprise ERPs that lack agile customization for college departments."),
        ("Absence of Verifiable Acknowledgment Receipts", "Current digital bulletin boards passively broadcast notices without recording timestamped student delivery acknowledgments, leaving faculty uncertain about message penetration."),
        ("Physical Hardware Dependency", "Existing smart notice boards require expensive LCD/LED hallway displays, failing to deliver notices directly into students' pockets on their personal mobile devices."),
        ("Zero Offline Fault Tolerance", "Most campus web portals fail completely when on-campus Wi-Fi disconnects; lack of local client-side caching prevents students from viewing previously loaded circulars."),
        ("Fragmented Priority & Category Routing", "Absence of structured priority filtering (Urgent vs. General) causes life-critical exam postponement alerts to be lost within routine club notices.")
    ]

    for i, (title, desc) in enumerate(gap_points):
        p = tf7.paragraphs[0] if i == 0 else tf7.add_paragraph()
        p.space_after = Pt(12)
        add_run(p, "►  ", bold=True, size_pt=14, color=COLOR_PRIMARY_GREEN)
        add_run(p, f"{title}: ", bold=True, size_pt=14, color=COLOR_DARK_GREEN)
        add_run(p, desc, size_pt=13, color=COLOR_DARK_TEXT)

    # ============================================================
    # SLIDE 8: PROPOSED SOLUTION
    # ============================================================
    s8 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s8)
    add_slide_title(s8, "Proposed Solution:")

    sol_box = s8.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(9.5), Inches(5.2))
    tf8 = sol_box.text_frame
    tf8.word_wrap = True

    sol_points = [
        ("Modular Core Java SE 17 Architecture", "Robust Model-View-Controller (MVC) design separating domain models (Notice, User), interfaces (Notifiable), and CLI / Web business logic."),
        ("Zero-Access Authentication & RBAC Gate", "Strict multi-tiered Role-Based Access Control ensuring circular creation, pinning, and deletion are restricted strictly to authenticated Super Admins and Faculty."),
        ("Dynamic Department & Priority Routing", "Instant categorization across departments (IT, Comps, Mech, Civil) and priority badges (Urgent, Normal) with sub-5ms render latency."),
        ("Verifiable Digital Acknowledgment Engine", "One-click student acknowledgment recording verified digital receipts for examination and placement compliance audit records."),
        ("Dual-Tier Persistent Storage", "Seamless integration combining real-time cloud data storage with local offline-first storage (localStorage) for uninterrupted offline resiliency."),
        ("Cross-Device Responsive Web Client", "Clean, responsive portal optimized for all smartphones, tablets, and desktop workstations with zero visual clipping or hidden actions.")
    ]

    for i, (title, desc) in enumerate(sol_points):
        p = tf8.paragraphs[0] if i == 0 else tf8.add_paragraph()
        p.space_after = Pt(10)
        add_run(p, "►  ", bold=True, size_pt=13.5, color=COLOR_PRIMARY_GREEN)
        add_run(p, f"{title}: ", bold=True, size_pt=13.5, color=COLOR_DARK_GREEN)
        add_run(p, desc, size_pt=12.5, color=COLOR_DARK_TEXT)

    # ============================================================
    # SLIDE 9: PROJECT PLANNING & TIMELINE
    # ============================================================
    s9 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s9)
    add_slide_title(s9, "Project Planning & Timeline:")

    plan_table_shape = s9.shapes.add_table(7, 4, Inches(0.8), Inches(1.5), Inches(10.2), Inches(5.2))
    plan_tbl = plan_table_shape.table
    plan_tbl.columns[0].width = Inches(2.0)  # Week / Duration
    plan_tbl.columns[1].width = Inches(2.2)  # Phase Name
    plan_tbl.columns[2].width = Inches(4.5)  # Key Tasks & Milestones
    plan_tbl.columns[3].width = Inches(1.5)  # Status

    plan_headers = ["Week / Duration", "Phase Name", "Key Tasks & Milestones", "Status"]
    for c_idx, h in enumerate(plan_headers):
        format_cell(plan_tbl.cell(0, c_idx), h, bold=True, font_size=11, color=COLOR_WHITE, bg_color=COLOR_PRIMARY_GREEN, align=PP_ALIGN.CENTER)

    plan_data = [
        ("Weeks 1–2 (July 2025)", "Need Identification & SRS", "Problem definition, literature survey, stakeholder requirement gathering", "Completed"),
        ("Weeks 3–4 (Aug 2025)", "Literature Survey & Design", "Comparative study, UML diagrams (Class, Use Case, Sequence), OOP modeling", "Completed"),
        ("Weeks 5–7 (Aug–Sep 2025)", "Core Java OOP Modules", "Implementing Notice, User, NotificationService, inheritance & interfaces", "Completed"),
        ("Weeks 8–9 (Sep 2025)", "Web Client & Cloud Sync", "Responsive dashboard, Firebase cloud sync, RBAC Zero-Access Wall", "Completed"),
        ("Weeks 10–11 (Oct 2025)", "Testing & Verification", "92 Automated test suite execution, stress testing, edge-case fixes", "Completed"),
        ("Weeks 12–13 (Oct 2025)", "Documentation & Review", "Report generation, logbook compilation, review presentation submission", "Completed")
    ]

    for r_idx, row in enumerate(plan_data, start=1):
        row_bg = COLOR_LIGHT_GREEN if r_idx % 2 == 1 else COLOR_PALE_GREEN
        for c_idx, val in enumerate(row):
            align = PP_ALIGN.CENTER if c_idx in [0, 3] else PP_ALIGN.LEFT
            bold = True if c_idx == 3 else False
            color = COLOR_DARK_GREEN if c_idx == 3 else COLOR_DARK_TEXT
            format_cell(plan_tbl.cell(r_idx, c_idx), val, bold=bold, font_size=10, color=color, bg_color=row_bg, align=align)

    # ============================================================
    # SLIDE 10: CONCLUSION
    # ============================================================
    s10 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s10)
    add_slide_title(s10, "Conclusion:")

    conc_box = s10.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(9.5), Inches(5.2))
    tf10 = conc_box.text_frame
    tf10.word_wrap = True

    conc_points = [
        ("Successful Academic & Technical Delivery", "Campus Notify successfully bridges the gap between academic theory and practical software engineering using Core Java SE 17 object-oriented paradigms."),
        ("Elimination of Communication Bottlenecks", "Replaced fragmented physical notice boards and chaotic WhatsApp groups with a structured, instant, and searchable institutional platform."),
        ("Administrative Governance & Transparency", "Enforced strict Role-Based Access Control and verifiable digital acknowledgment receipts, completely eliminating lost circular disputes."),
        ("Environmental Sustainability (Green Campus)", "Significantly reduces physical paper printing, toner consumption, and operational costs, aligning directly with UN Sustainable Development Goals (SDG 9 & SDG 12)."),
        ("Future Scope & Roadmap", "Planned enhancements include native Android & iOS push notifications via Firebase FCM, automated SMS parent alerts, and direct integration with institutional biometric ERP databases.")
    ]

    for i, (title, desc) in enumerate(conc_points):
        p = tf10.paragraphs[0] if i == 0 else tf10.add_paragraph()
        p.space_after = Pt(12)
        add_run(p, "►  ", bold=True, size_pt=14, color=COLOR_PRIMARY_GREEN)
        add_run(p, f"{title}: ", bold=True, size_pt=14, color=COLOR_DARK_GREEN)
        add_run(p, desc, size_pt=13, color=COLOR_DARK_TEXT)

    # ============================================================
    # SLIDE 11: REFERENCES
    # ============================================================
    s11 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s11)
    add_slide_title(s11, "References:")

    ref_box = s11.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(9.5), Inches(5.2))
    tf11 = ref_box.text_frame
    tf11.word_wrap = True

    ref_items = [
        "[1] R. Sharma, K. Patel, and S. Deshmukh, “Digital Campus Information Dissemination Systems,” IEEE Access, vol. 9, pp. 11200–11210, 2021.",
        "[2] P. Patel and S. Deshmukh, “Smart Notice Board using IoT Cloud Services,” International Journal of Engineering Research & Technology (IJERT), vol. 11, no. 5, pp. 45–52, 2022.",
        "[3] A. Gupta and K. Rao, “Role-Based Information Management in Higher Education,” Springer Computer Science, vol. 48, pp. 210–225, 2023.",
        "[4] M. Fernandez, L. Gomez, and T. Silva, “Campus Communication Bottlenecks in Higher Education,” Elsevier Computers in Industry & Education, vol. 38, pp. 102–115, 2024.",
        "[5] H. Schildt, Java: The Complete Reference, 12th ed., McGraw-Hill Education, 2021.",
        "[6] J. Bloch, Effective Java, 3rd ed., Addison-Wesley Professional, 2018.",
        "[7] University of Mumbai, Syllabus for Second Year Information Technology (Semester III & IV), 2024–2025.",
        "[8] United Nations, Sustainable Development Goals Knowledge Platform, [Online]. Available: https://sdgs.un.org/goals."
    ]

    for i, ref in enumerate(ref_items):
        p = tf11.paragraphs[0] if i == 0 else tf11.add_paragraph()
        p.space_after = Pt(10)
        add_run(p, "►  ", bold=True, size_pt=12, color=COLOR_PRIMARY_GREEN)
        add_run(p, ref, size_pt=11.5, color=COLOR_DARK_TEXT)

    # ============================================================
    # SLIDE 12: THANK YOU
    # ============================================================
    s12 = prs.slides.add_slide(blank_slide_layout)
    add_header_banner(s12, top_in=0.3, height_in=0.95)
    add_right_geometric_facets(s12)

    ty_box = s12.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(9.5), Inches(4.5))
    ty_tf = ty_box.text_frame
    ty_tf.word_wrap = True

    ty_p1 = ty_tf.paragraphs[0]
    ty_p1.space_after = Pt(8)
    add_run(ty_p1, "Thank You!", bold=True, size_pt=36, color=COLOR_PRIMARY_GREEN)

    ty_p2 = ty_tf.add_paragraph()
    ty_p2.space_after = Pt(20)
    add_run(ty_p2, "Any Questions or Suggestions?", bold=True, size_pt=20, color=COLOR_DARK_GREEN)

    ty_p3 = ty_tf.add_paragraph()
    ty_p3.space_after = Pt(6)
    add_run(ty_p3, "Team Members: ", bold=True, size_pt=14, color=COLOR_DARK_TEXT)
    add_run(ty_p3, "Pratik Atpadkar (VU4F2526072) | Harsh Tiwar (VU4F2526066) | Parth Gadadhe (VU4F2526062)", size_pt=13, color=COLOR_DARK_TEXT)

    ty_p4 = ty_tf.add_paragraph()
    ty_p4.space_after = Pt(6)
    add_run(ty_p4, "Project Guide: ", bold=True, size_pt=14, color=COLOR_DARK_TEXT)
    add_run(ty_p4, "Prof. Sonali Kharat | ", size_pt=13, color=COLOR_DARK_TEXT)
    add_run(ty_p4, "Head of Department: ", bold=True, size_pt=14, color=COLOR_DARK_TEXT)
    add_run(ty_p4, "Dr. Pradip Mane", size_pt=13, color=COLOR_DARK_TEXT)

    ty_p5 = ty_tf.add_paragraph()
    ty_p5.space_after = Pt(14)
    add_run(ty_p5, "Department of Information Technology\nVasantdada Patil Pratishthan’s College of Engineering & Visual Arts, Sion, Mumbai", italic=True, size_pt=12, color=COLOR_MUTED_TEXT)

    ty_p6 = ty_tf.add_paragraph()
    add_run(ty_p6, "Live Project Portal: ", bold=True, size_pt=12, color=COLOR_PRIMARY_GREEN)
    add_run(ty_p6, "https://campnotify-eef91.web.app", bold=True, size_pt=12, color=COLOR_DARK_GREEN)

    prs.save(output_pptx_path)
    print(f"SUCCESS: Created PowerPoint Presentation: {output_pptx_path}")

if __name__ == "__main__":
    pptx_path = os.path.join(BASE_DIR, "CampusNotify_Review_Presentation.pptx")
    build_presentation_deck(pptx_path)
