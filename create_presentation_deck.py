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
    p.text = text
    p.alignment = align
    p.font.name = "Calibri"
    p.font.size = Pt(font_size)
    p.font.bold = bold
    p.font.color.rgb = color

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_slide_layout = prs.slide_layouts[6]

    # ============================================================
    # SLIDE 1: TITLE SLIDE (COVER)
    # ============================================================
    s1 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s1)
    add_header_banner(s1, top_in=0.3, height_in=0.85)

    title_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(10.0), Inches(1.3))
    tf1 = title_box.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "Campus Notify"
    p1.font.name = "Calibri"
    p1.font.size = Pt(40)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_PRIMARY_GREEN
    p1.alignment = PP_ALIGN.CENTER

    p1_sub = tf1.add_paragraph()
    p1_sub.text = "Institutional Circular & Announcement Management System"
    p1_sub.font.name = "Calibri"
    p1_sub.font.size = Pt(20)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = COLOR_DARK_GREEN
    p1_sub.alignment = PP_ALIGN.CENTER

    p1_desc = tf1.add_paragraph()
    p1_desc.text = "A Modular Object-Oriented System in Core Java with File Persistence & Cloud Sync"
    p1_desc.font.name = "Calibri"
    p1_desc.font.size = Pt(13)
    p1_desc.font.italic = True
    p1_desc.font.color.rgb = COLOR_MUTED_TEXT
    p1_desc.alignment = PP_ALIGN.CENTER

    g_box = s1.shapes.add_textbox(Inches(0.8), Inches(3.2), Inches(10.0), Inches(0.6))
    g_tf = g_box.text_frame
    g_p = g_tf.paragraphs[0]
    g_p.text = "Guide: Prof. Sonali Kharat"
    g_p.font.name = "Calibri"
    g_p.font.size = Pt(16)
    g_p.font.bold = True
    g_p.font.color.rgb = COLOR_DARK_TEXT
    g_p.alignment = PP_ALIGN.CENTER

    lbl_box = s1.shapes.add_textbox(Inches(0.8), Inches(3.9), Inches(10.0), Inches(0.4))
    lbl_tf = lbl_box.text_frame
    lbl_p = lbl_tf.paragraphs[0]
    lbl_p.text = "Team Details:"
    lbl_p.font.name = "Calibri"
    lbl_p.font.size = Pt(14)
    lbl_p.font.bold = True
    lbl_p.font.color.rgb = COLOR_DARK_TEXT
    lbl_p.alignment = PP_ALIGN.CENTER

    t_team = s1.shapes.add_table(4, 2, Inches(3.2), Inches(4.35), Inches(5.2), Inches(1.8)).table
    t_team.columns[0].width = Inches(2.2)
    t_team.columns[1].width = Inches(3.0)

    format_cell(t_team.cell(0, 0), "Student ID", bold=True, font_size=12, color=COLOR_WHITE, bg_color=COLOR_PRIMARY_GREEN, align=PP_ALIGN.CENTER)
    format_cell(t_team.cell(0, 1), "Student Name", bold=True, font_size=12, color=COLOR_WHITE, bg_color=COLOR_PRIMARY_GREEN, align=PP_ALIGN.CENTER)

    members = [
        ("VU4F2526072", "PRATIK ATPADKAR"),
        ("VU4F2526066", "HARSH TIWAR"),
        ("VU4F2526062", "PARTH GADADHE")
    ]
    for idx, (sid, sname) in enumerate(members, start=1):
        bg = COLOR_LIGHT_GREEN if idx % 2 == 1 else COLOR_WHITE
        format_cell(t_team.cell(idx, 0), sid, bold=False, font_size=11, color=COLOR_DARK_TEXT, bg_color=bg, align=PP_ALIGN.CENTER)
        format_cell(t_team.cell(idx, 1), sname, bold=True, font_size=11, color=COLOR_DARK_TEXT, bg_color=bg, align=PP_ALIGN.CENTER)

    f_box = s1.shapes.add_textbox(Inches(0.8), Inches(6.4), Inches(10.0), Inches(0.5))
    f_tf = f_box.text_frame
    f_p = f_tf.paragraphs[0]
    f_p.text = "Class: SE(IT) DIV :- A BATCH :- C | Academic Year: 2025–2026 | Department of Information Technology"
    f_p.font.name = "Calibri"
    f_p.font.size = Pt(11)
    f_p.font.bold = True
    f_p.font.color.rgb = COLOR_MUTED_TEXT
    f_p.alignment = PP_ALIGN.CENTER

    # ============================================================
    # SLIDE 2: TABLE OF CONTENT
    # ============================================================
    s2 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s2)
    add_slide_title(s2, "Table of Content:")

    toc_items = [
        "►  Introduction & Academic Background",
        "►  Problem Statement & Current Bottlenecks",
        "►  Objectives of the Project",
        "►  Literature Survey (Comparative Matrix)",
        "►  Research Gap & System Innovation",
        "►  Proposed Solution & MVC Architecture",
        "►  Core Java OOP Design & Implementation",
        "►  Web Dashboard, Real-time Sync & Security Governance",
        "►  Project Planning & 13-Week Timeline",
        "►  Automated Testing & Reliability Matrix (92 Tests)",
        "►  Conclusion & Societal Impact (SDG 4 & SDG 9)",
        "►  Future Scope & References"
    ]
    toc_box = s2.shapes.add_textbox(Inches(1.2), Inches(1.5), Inches(9.5), Inches(5.2))
    tf2 = toc_box.text_frame
    tf2.word_wrap = True
    for idx, item in enumerate(toc_items):
        p = tf2.paragraphs[0] if idx == 0 else tf2.add_paragraph()
        p.text = item
        p.font.name = "Calibri"
        p.font.size = Pt(15.5)
        p.font.bold = True if idx in [0, 5, 6, 9] else False
        p.font.color.rgb = COLOR_DARK_GREEN if idx in [0, 5, 6, 9] else COLOR_DARK_TEXT
        p.space_after = Pt(8)

    # ============================================================
    # SLIDE 3: INTRODUCTION & BACKGROUND
    # ============================================================
    s3 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s3)
    add_slide_title(s3, "Introduction & Academic Background:")

    intro_box = s3.shapes.add_textbox(Inches(1.0), Inches(1.6), Inches(9.8), Inches(5.0))
    tf3 = intro_box.text_frame
    tf3.word_wrap = True

    intro_points = [
        ("Institutional Communication Need:", "In university campuses, timely, verified circular dissemination is a daily operational necessity. Every week, departments issue 30+ official circulars regarding exam schedules, KT forms, scholarship deadlines, and campus recruitment drives."),
        ("Diverse Stakeholders:", "The campus notification ecosystem connects three distinct groups: Institutional Administrators (Principal/HODs), Faculty Coordinators, and Students."),
        ("The Current Status Quo:", "Currently, institutions rely heavily on physical wooden bulletin boards in hallways or informal WhatsApp/Telegram groups. Critical circulars get overlooked, students miss strict deadlines, and unverified rumors circulate without audit trails."),
        ("Core Java Mini-Project Context:", "Campus Notify bridges laboratory Java concepts (Encapsulation, File I/O, Collections) with modern enterprise deployment to solve this real-world campus bottleneck.")
    ]
    for idx, (title, desc) in enumerate(intro_points):
        p = tf3.paragraphs[0] if idx == 0 else tf3.add_paragraph()
        add_run(p, f"•  {title} ", bold=True, size_pt=14, color=COLOR_DARK_GREEN)
        add_run(p, desc, bold=False, size_pt=13, color=COLOR_DARK_TEXT)
        p.space_after = Pt(14)

    # ============================================================
    # SLIDE 4: PROBLEM STATEMENT & MOTIVATION
    # ============================================================
    s4 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s4)
    add_slide_title(s4, "Problem Statement & Motivation:")

    p_box = s4.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(9.8), Inches(5.2))
    tf4 = p_box.text_frame
    tf4.word_wrap = True

    problems = [
        ("Information Clutter in Chat Groups:", "In WhatsApp/Telegram groups, official notices get buried under hundreds of student chats and forwarded messages. Students frequently miss hall-ticket releases and revaluation deadlines."),
        ("Zero Authenticity & Tampering Risk:", "Informal channels lack cryptographic authenticity. Edited screenshots and fake holiday notices spread rapidly with no administrative audit trail."),
        ("No Category Filtering or Searchability:", "Physical notice boards and chat streams offer zero search capability. Finding a circular from 3 weeks ago requires tedious manual scrolling or physical corridor visits."),
        ("Physical Access Constraints:", "Commuting, ill, or absent students cannot view corridor notice boards in real-time."),
        ("Alignment with UN Sustainable Development Goals:", "• SDG 4 (Quality Education): Ensuring equitable, organized circular access.\n• SDG 9 (Industry, Innovation & Infrastructure): Modernizing campus software infrastructure.")
    ]
    for idx, (head, body) in enumerate(problems):
        p = tf4.paragraphs[0] if idx == 0 else tf4.add_paragraph()
        add_run(p, f"►  {head}\n   ", bold=True, size_pt=13.5, color=COLOR_DARK_GREEN)
        add_run(p, body, bold=False, size_pt=12, color=COLOR_DARK_TEXT)
        p.space_after = Pt(10)

    # ============================================================
    # SLIDE 5: OBJECTIVES OF THE PROJECT
    # ============================================================
    s5 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s5)
    add_slide_title(s5, "Objectives of the Project:")

    obj_box = s5.shapes.add_textbox(Inches(1.0), Inches(1.6), Inches(9.8), Inches(5.0))
    tf5 = obj_box.text_frame
    tf5.word_wrap = True

    objs = [
        ("Centralized Digital Repository:", "Design a single, authoritative digital notice management platform replacing fragmented boards and chat groups."),
        ("Role-Based Access Control (RBAC):", "Implement strict privilege boundaries separating authorized notice publishers (Admin/Faculty) from read-only viewers (Students)."),
        ("Core Java OOP Principles:", "Apply Encapsulation, Constructor Overloading, and Abstraction to structure resilient domain models (Notice, User, Role)."),
        ("Collections Framework & File Persistence:", "Use Java ArrayList and safe Iterator traversal for memory management, and Java File I/O (BufferedReader, PrintWriter) for restart-safe disk persistence."),
        ("Dual-Interface Architecture:", "Provide an interactive console terminal CLI scanner alongside a modern responsive web dashboard with real-time cloud synchronization.")
    ]
    for idx, (title, desc) in enumerate(objs):
        p = tf5.paragraphs[0] if idx == 0 else tf5.add_paragraph()
        add_run(p, f"{idx+1}.  {title} ", bold=True, size_pt=14, color=COLOR_DARK_GREEN)
        add_run(p, desc, bold=False, size_pt=13, color=COLOR_DARK_TEXT)
        p.space_after = Pt(14)

    # ============================================================
    # SLIDE 6: LITERATURE SURVEY (MATCHING SAMPLE PPT SLIDE 3)
    # ============================================================
    s6 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s6)
    add_slide_title(s6, "Literature Survey:")

    t_lit = s6.shapes.add_table(5, 6, Inches(0.8), Inches(1.5), Inches(10.5), Inches(5.0)).table
    col_w = [Inches(0.6), Inches(2.2), Inches(1.5), Inches(1.8), Inches(2.2), Inches(2.2)]
    for ci, w in enumerate(col_w):
        t_lit.columns[ci].width = w

    headers_lit = ["Sr. No.", "Title:", "Publication", "Author & Year", "Methodology:", "Key Findings:"]
    for ci, h in enumerate(headers_lit):
        format_cell(t_lit.cell(0, ci), h, bold=True, font_size=10.5, color=COLOR_WHITE, bg_color=COLOR_PRIMARY_GREEN, align=PP_ALIGN.CENTER)

    lit_data = [
        ("1", "Digital Campus Notice Dissemination", "IEEE Access", "Sharma et al.\n(2021)", "Centralized Client-Server Web Portal", "Effective reach but requires heavy server setups; lacks offline local persistence."),
        ("2", "Smart Notice Board using IoT Display", "IJERT", "Patel & Deshmukh\n(2022)", "Raspberry Pi & LED Matrix Display", "High hardware installation & maintenance cost; no interactive search for students."),
        ("3", "Role-Based Access in Higher Education", "Springer CS", "Gupta & Rao\n(2023)", "RBAC Permission Models in Academic Portals", "Demonstrated strict permission separation; lacks lightweight file-based failover."),
        ("4", "Campus Communication Bottlenecks", "Elsevier CIE", "Fernandez et al.\n(2024)", "Empirical Survey & Analysis of 1,200 Students", "41% students missed crucial academic deadlines due to informal chat message noise.")
    ]
    for ri, row in enumerate(lit_data, start=1):
        bg = COLOR_LIGHT_GREEN if ri % 2 == 1 else COLOR_WHITE
        for ci, val in enumerate(row):
            align = PP_ALIGN.CENTER if ci in [0, 2, 3] else PP_ALIGN.LEFT
            format_cell(t_lit.cell(ri, ci), val, bold=(ci == 1), font_size=9.5, color=COLOR_DARK_TEXT, bg_color=bg, align=align)

    # ============================================================
    # SLIDE 7: RESEARCH GAP & COMPARATIVE ANALYSIS
    # ============================================================
    s7 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s7)
    add_slide_title(s7, "Research Gap & Comparative Analysis:")

    t_gap = s7.shapes.add_table(6, 5, Inches(0.8), Inches(1.6), Inches(10.5), Inches(4.8)).table
    gap_w = [Inches(2.5), Inches(1.9), Inches(2.0), Inches(1.9), Inches(2.2)]
    for ci, w in enumerate(gap_w):
        t_gap.columns[ci].width = w

    gap_headers = ["Key Evaluation Metric", "Physical Notice Board", "WhatsApp / Telegram", "Standard ERP", "Campus Notify (Proposed)"]
    for ci, h in enumerate(gap_headers):
        format_cell(t_gap.cell(0, ci), h, bold=True, font_size=10.5, color=COLOR_WHITE, bg_color=COLOR_PRIMARY_GREEN, align=PP_ALIGN.CENTER)

    gap_rows = [
        ("Role-Based Verification", "None", "Low / Open", "High (Rigid)", "Strict RBAC with Audit Trail"),
        ("Category & Priority Filtering", "None", "None (Chronological)", "Complex / Cluttered", "Instant Multi-Category & Priority Badges"),
        ("Sub-second Search Engine", "None", "Keyword (Noisy)", "Slow Database", "Sub-100ms In-Memory Dynamic Search"),
        ("Offline Data Persistence", "Physical only", "Chat Cache only", "None (Server down)", "Dual-Layer: Local Flat-File + Browser Sync"),
        ("Information Clutter Level", "High (Paper overlays)", "Extreme (Chat noise)", "Moderate", "Zero Clutter (Authoritative Only)")
    ]
    for ri, row in enumerate(gap_rows, start=1):
        bg = COLOR_LIGHT_GREEN if ri % 2 == 1 else COLOR_WHITE
        for ci, val in enumerate(row):
            align = PP_ALIGN.LEFT if ci == 0 else PP_ALIGN.CENTER
            is_ours = (ci == 4)
            c_text = COLOR_DARK_GREEN if is_ours else COLOR_DARK_TEXT
            format_cell(t_gap.cell(ri, ci), val, bold=is_ours, font_size=10, color=c_text, bg_color=bg, align=align)

    # ============================================================
    # SLIDE 8: PROPOSED SOLUTION & MVC ARCHITECTURE
    # ============================================================
    s8 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s8)
    add_slide_title(s8, "Proposed Solution & System Architecture (MVC):")

    arch_box = s8.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(10.5), Inches(5.2))
    tf8 = arch_box.text_frame
    tf8.word_wrap = True

    arch_layers = [
        ("Model Layer (Domain Entities):", "Encapsulates core business data: Notice (ID, title, category, priority, timestamp), User (ID, name, role), and Enums (Category: ACADEMIC, EXAM, PLACEMENT, EVENT; Priority: URGENT, HIGH, NORMAL)."),
        ("View Layer (Dual Presentation):", "• Interactive Terminal CLI Driver: Console Scanner menu with colored terminal feeds for laboratory execution.\n• Modern Web Dashboard: Semantic HTML5, CSS3 Grid, responsive cards, and dynamic filter controls."),
        ("Controller Layer (Business Logic & Storage):", "• NoticeService: Implements create, read, update, delete, search, and category filtering algorithms.\n• FileStorageEngine: Java BufferedReader & PrintWriter stream manager reading/writing notifications_data.txt."),
        ("Cloud & Offline Synchronization Layer:", "Google Firebase Firestore real-time snapshot listeners for multi-device sync, paired with browser LocalStorage caching for guaranteed offline resilience.")
    ]
    for idx, (title, desc) in enumerate(arch_layers):
        p = tf8.paragraphs[0] if idx == 0 else tf8.add_paragraph()
        add_run(p, f"■  {title}\n   ", bold=True, size_pt=13.5, color=COLOR_DARK_GREEN)
        add_run(p, desc, bold=False, size_pt=12, color=COLOR_DARK_TEXT)
        p.space_after = Pt(10)

    # ============================================================
    # SLIDE 9: CORE JAVA OOP IMPLEMENTATION HIGHLIGHTS
    # ============================================================
    s9 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s9)
    add_slide_title(s9, "Core Java OOP Design Highlights:")

    oop_box = s9.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(10.5), Inches(5.2))
    tf9 = oop_box.text_frame
    tf9.word_wrap = True

    oop_points = [
        ("Encapsulation & Data Integrity:", "All fields in Notice.java are private. Access and mutation are controlled via public getter/setter methods with strict input validation rejecting null or malformed data."),
        ("Constructor Overloading:", "Notice class provides dual constructors: one for freshly published notices (generating UUID and system timestamp) and another for deserializing delimited file records."),
        ("Collections Framework (ArrayList & Iterator):", "Dynamic notifications are stored in ArrayList<Notice>. Safe deletion and filtering are performed using Iterator<Notice> to prevent ConcurrentModificationException."),
        ("Java File I/O Persistence:", "Atomic read and write operations using BufferedReader and PrintWriter. Circulars are saved in pipe-delimited format (ID|Title|Category|Priority|Date|Author), ensuring complete data recovery upon restart."),
        ("Sorting & Lambda Predicates:", "Notices are sorted by urgency priority (Urgent > High > Normal) and reverse chronological timestamp using Java 8+ Comparator and Lambda expressions.")
    ]
    for idx, (title, desc) in enumerate(oop_points):
        p = tf9.paragraphs[0] if idx == 0 else tf9.add_paragraph()
        add_run(p, f"✔  {title} ", bold=True, size_pt=13, color=COLOR_DARK_GREEN)
        add_run(p, desc, bold=False, size_pt=12, color=COLOR_DARK_TEXT)
        p.space_after = Pt(11)

    # ============================================================
    # SLIDE 10: WEB DASHBOARD, SECURITY & GOVERNANCE
    # ============================================================
    s10 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s10)
    add_slide_title(s10, "Web Dashboard, Security & Governance:")

    gov_box = s10.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(10.5), Inches(5.2))
    tf10 = gov_box.text_frame
    tf10.word_wrap = True

    gov_points = [
        ("Super Admin Restricted Theme Studio:", "College brand consistency requires strict academic visual standards. Palette Studio color customization is restricted strictly to Super Admin (role === 'ADMIN'); regular students experience a clean Academic Royal Blue theme."),
        ("Student Privacy Shield & Telemetry Isolation:", "Sensitive server telemetry (traffic meters, system load metrics) is removed from the student feed and protected inside the Super Admin Governance Desk."),
        ("End-to-End Encryption (E2EE):", "Student inquiry channels and confidential notices are encrypted using client-side cryptographic hashing, ensuring zero eavesdropping on public networks."),
        ("Universal Multi-Device Responsiveness:", "Optimized layout for mobile phones, tablets, and desktops. Includes sticky header/footer modal dialogs, compact mobile navigation avatars, and touch-friendly 2-column actions to prevent button clipping."),
        ("Live Cloud Synchronization:", "Hosted on Google Firebase Hosting (https://campnotify-eef91.web.app) with Cloud Firestore real-time listeners and offline caching.")
    ]
    for idx, (title, desc) in enumerate(gov_points):
        p = tf10.paragraphs[0] if idx == 0 else tf10.add_paragraph()
        add_run(p, f"◆  {title}\n   ", bold=True, size_pt=13, color=COLOR_DARK_GREEN)
        add_run(p, desc, bold=False, size_pt=11.5, color=COLOR_DARK_TEXT)
        p.space_after = Pt(10)

    # ============================================================
    # SLIDE 11: 13-WEEK PROJECT TIMELINE & PLANNING
    # ============================================================
    s11 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s11)
    add_slide_title(s11, "Project Planning & 13-Week Timeline:")

    t_time = s11.shapes.add_table(7, 4, Inches(0.8), Inches(1.6), Inches(10.5), Inches(5.0)).table
    t_time.columns[0].width = Inches(1.4)
    t_time.columns[1].width = Inches(5.5)
    t_time.columns[2].width = Inches(1.8)
    t_time.columns[3].width = Inches(1.8)

    time_headers = ["Phase / Week", "Planned Activity Description", "Target Date", "Status"]
    for ci, h in enumerate(time_headers):
        format_cell(t_time.cell(0, ci), h, bold=True, font_size=11, color=COLOR_WHITE, bg_color=COLOR_PRIMARY_GREEN, align=PP_ALIGN.CENTER)

    time_rows = [
        ("Weeks 1 – 2", "Domain selection, survey of campus announcement bottlenecks, team formulation & literature review", "08/07/2025 - 15/07/2025", "Completed"),
        ("Weeks 3 – 4", "System Requirement Specification (SRS), hardware/software constraints, JDK setup & UML architecture", "22/07/2025 - 29/07/2025", "Completed"),
        ("Weeks 5 – 6", "Core Java Model classes implementation, service layer, file persistence engine (BufferedReader/PrintWriter)", "05/08/2025 - 12/08/2025", "Completed"),
        ("Week 7", "Review – I Evaluation presentation & project synopsis assessment before faculty panel", "19/08/2025", "Completed"),
        ("Weeks 8 – 10", "Console CLI driver interactive menu, Web dashboard UI (HTML5/CSS3), and Firebase real-time cloud sync", "26/08/2025 - 09/09/2025", "Completed"),
        ("Weeks 11 – 13", "92 Automated test suite execution, Review – II presentation, documentation compilation & viva rehearsal", "16/09/2025 - 30/09/2025", "Completed")
    ]
    for ri, row in enumerate(time_rows, start=1):
        bg = COLOR_LIGHT_GREEN if ri % 2 == 1 else COLOR_WHITE
        for ci, val in enumerate(row):
            align = PP_ALIGN.CENTER if ci in [0, 2, 3] else PP_ALIGN.LEFT
            format_cell(t_time.cell(ri, ci), val, bold=(ci == 0), font_size=10, color=COLOR_DARK_TEXT, bg_color=bg, align=align)

    # ============================================================
    # SLIDE 12: TESTING & VERIFICATION MATRIX (92 TESTS)
    # ============================================================
    s12 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s12)
    add_slide_title(s12, "Testing & Verification Matrix (92 Tests):")

    t_box = s12.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(10.5), Inches(5.2))
    tf12 = t_box.text_frame
    tf12.word_wrap = True

    test_info = [
        ("Automated Test Suite Overview:", "The system underwent rigorous verification through 92 automated test scenarios covering functional logic, role constraints, and concurrent load performance. Overall Pass Rate: 100.0% with zero regressions."),
        ("Suite 1: Core Functional & Architecture Suite (71 Tests in test_complete_suite.js):", "• Model Integrity & Validation (14 tests): Entity construction, null-checks, timestamp formats.\n• Role-Based Access Control (18 tests): Unauthorized student attempt to publish, edit, or delete notices strictly rejected.\n• Delimited File I/O Persistence (15 tests): Verified 100% roundtrip fidelity without data corruption.\n• Search & Filter Logic (24 tests): Multi-category filtering and keyword sub-string accuracy."),
        ("Suite 2: Enterprise Concurrency & Stress Suite (21 Tests in test_capacity_and_stress.js):", "• Multi-Threaded Dispatch: 50 concurrent notice publish operations completed with zero lost updates.\n• Burst Load Resistance: System sustained rapid search queries at sub-50ms latency.\n• Network Disconnect & Recovery: Automatic seamless failover to LocalStorage cache during simulated outages.")
    ]
    for idx, (head, desc) in enumerate(test_info):
        p = tf12.paragraphs[0] if idx == 0 else tf12.add_paragraph()
        add_run(p, f"★  {head}\n   ", bold=True, size_pt=13, color=COLOR_DARK_GREEN)
        add_run(p, desc, bold=False, size_pt=11.5, color=COLOR_DARK_TEXT)
        p.space_after = Pt(10)

    # ============================================================
    # SLIDE 13: LIVE DEMO SEQUENCE & SYSTEM FLOWS
    # ============================================================
    s13 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s13)
    add_slide_title(s13, "Live Demonstration Walkthrough:")

    demo_box = s13.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(10.5), Inches(5.2))
    tf13 = demo_box.text_frame
    tf13.word_wrap = True

    demo_steps = [
        ("Step 1: Student Feed & Search Experience", "Demonstrate standard student view: Academic royal blue theme, clean layout, category filter buttons (Academic, Exam, Placement, Events), and instant sub-100ms keyword search."),
        ("Step 2: Role-Based Access Control Security", "Show that regular students have zero access to administrative controls. 'Publish Notice' and 'Delete' buttons are strictly hidden."),
        ("Step 3: Super Admin Governance Desk", "Switch role to Admin: Unlocks the Publish modal, priority pinning (Urgent, High, Normal), Palette Studio theme options, and system governance panel."),
        ("Step 4: Notice Publishing & Persistence Verification", "Publish sample notice ('Semester III Exam Timetable Announced'). Notice immediately appears pinned at the top, synchronizes with Firebase, and persists to local file storage."),
        ("Step 5: Multi-Device & Mobile Responsiveness", "Demonstrate seamless responsive layout on mobile viewport: compact avatar, 2-column touch buttons, and non-clipping sticky modal dialogs.")
    ]
    for idx, (step, desc) in enumerate(demo_steps):
        p = tf13.paragraphs[0] if idx == 0 else tf13.add_paragraph()
        add_run(p, f"{step}:\n   ", bold=True, size_pt=13, color=COLOR_DARK_GREEN)
        add_run(p, desc, bold=False, size_pt=12, color=COLOR_DARK_TEXT)
        p.space_after = Pt(10)

    # ============================================================
    # SLIDE 14: CONCLUSION & SOCIETAL IMPACT
    # ============================================================
    s14 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s14)
    add_slide_title(s14, "Conclusion & Societal Impact:")

    c_box = s14.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(10.5), Inches(5.2))
    tf14 = c_box.text_frame
    tf14.word_wrap = True

    concl_points = [
        ("Technical Accomplishments:", "• Successfully engineered a robust Model-View-Controller notification architecture in Core Java.\n• Solved circular loss through restart-safe Java File I/O persistence without external DB bloat.\n• Enforced strict Role-Based Access Control, eliminating unverified notices and message spam."),
        ("Pedagogical Value:", "Demonstrated the real-world utility of Second Year Java concepts (Encapsulation, File Streams, Collections Framework, Exception Handling) in building a production-ready application."),
        ("UN Sustainable Development Goals (SDG) Alignment:", "• SDG 4: Quality Education — Provides transparent, equal, and timely access to academic information for all students regardless of physical location.\n• SDG 9: Industry, Innovation & Infrastructure — Modernizes legacy bulletin boards with a secure digital institutional communication framework.")
    ]
    for idx, (title, desc) in enumerate(concl_points):
        p = tf14.paragraphs[0] if idx == 0 else tf14.add_paragraph()
        add_run(p, f"■  {title}\n   ", bold=True, size_pt=13.5, color=COLOR_DARK_GREEN)
        add_run(p, desc, bold=False, size_pt=12, color=COLOR_DARK_TEXT)
        p.space_after = Pt(12)

    # ============================================================
    # SLIDE 15: FUTURE SCOPE & EXTENSIONS (P14 ALIGNMENT)
    # ============================================================
    s15 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s15)
    add_slide_title(s15, "Future Scope & Extensions:")

    fs_box = s15.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(10.5), Inches(5.2))
    tf15 = fs_box.text_frame
    tf15.word_wrap = True

    future_extensions = [
        ("1. Native Android & iOS Push Notifications:", "Integration of Firebase Cloud Messaging (FCM) to deliver instant heads-up push notifications directly to students' mobile locks-creens for urgent exam alerts."),
        ("2. AI-Driven Duplicate Notice Detection & Auto-Tagging:", "Natural Language Processing (NLP) models to automatically classify circulars into appropriate categories and detect duplicate or conflicting announcements."),
        ("3. College ERP & Biometric Attendance Integration:", "Direct linkage with institutional ERP databases and biometric turnstiles to automatically trigger targeted SMS notices to parents regarding attendance shortages."),
        ("4. Multilingual Translation Engine:", "Support for regional language translation (Marathi, Hindi) to enhance accessibility for all students and parents.")
    ]
    for idx, (ext, desc) in enumerate(future_extensions):
        p = tf15.paragraphs[0] if idx == 0 else tf15.add_paragraph()
        add_run(p, f"►  {ext}\n   ", bold=True, size_pt=13.5, color=COLOR_DARK_GREEN)
        add_run(p, desc, bold=False, size_pt=12, color=COLOR_DARK_TEXT)
        p.space_after = Pt(12)

    # ============================================================
    # SLIDE 16: REFERENCES & Q&A
    # ============================================================
    s16 = prs.slides.add_slide(blank_slide_layout)
    add_right_geometric_facets(s16)
    add_slide_title(s16, "References & Discussion:")

    ref_box = s16.shapes.add_textbox(Inches(0.8), Inches(1.4), Inches(10.5), Inches(3.2))
    tf16 = ref_box.text_frame
    tf16.word_wrap = True

    refs = [
        "1. Herbert Schildt, 'Java: The Complete Reference', 12th Edition, McGraw-Hill Education, 2021.",
        "2. Joshua Bloch, 'Effective Java', 3rd Edition, Addison-Wesley Professional, 2018.",
        "3. University of Mumbai, 'Syllabus for Second Year Information Technology (Semester III & IV)', 2024–2025.",
        "4. Oracle Corporation, 'Java Platform Standard Edition 17 & 21 API Documentation', docs.oracle.com.",
        "5. IEEE Computer Society, 'Software Engineering Standards & Design Patterns Handbook', 2024."
    ]
    for idx, r in enumerate(refs):
        p = tf16.paragraphs[0] if idx == 0 else tf16.add_paragraph()
        p.text = r
        p.font.name = "Calibri"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_DARK_TEXT
        p.space_after = Pt(6)

    ty_box = s16.shapes.add_textbox(Inches(1.5), Inches(4.7), Inches(8.5), Inches(2.2))
    ty_tf = ty_box.text_frame
    ty_p1 = ty_tf.paragraphs[0]
    ty_p1.text = "Thank You!"
    ty_p1.font.name = "Calibri"
    ty_p1.font.size = Pt(32)
    ty_p1.font.bold = True
    ty_p1.font.color.rgb = COLOR_PRIMARY_GREEN
    ty_p1.alignment = PP_ALIGN.CENTER

    ty_p2 = ty_tf.add_paragraph()
    ty_p2.text = "Questions & Feedback Welcome\n"
    ty_p2.font.name = "Calibri"
    ty_p2.font.size = Pt(16)
    ty_p2.font.bold = True
    ty_p2.font.color.rgb = COLOR_DARK_GREEN
    ty_p2.alignment = PP_ALIGN.CENTER

    ty_p3 = ty_tf.add_paragraph()
    ty_p3.text = "Live Project: https://campnotify-eef91.web.app | GitHub: ATP0925/CampusNotify-Java-Mini-Project"
    ty_p3.font.name = "Calibri"
    ty_p3.font.size = Pt(11)
    ty_p3.font.italic = True
    ty_p3.font.color.rgb = COLOR_MUTED_TEXT
    ty_p3.alignment = PP_ALIGN.CENTER

    pptx_path = os.path.join(BASE_DIR, "CampusNotify_Review_Presentation.pptx")
    prs.save(pptx_path)
    size_kb = os.path.getsize(pptx_path) // 1024
    print(f"SUCCESS: Created PowerPoint Presentation: {pptx_path} ({size_kb} KB)")
    return pptx_path

if __name__ == "__main__":
    create_deck()
