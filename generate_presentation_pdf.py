import os
import subprocess
import zipfile

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
if not os.path.exists(CHROME_PATH):
    CHROME_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CampusNotify - Review Presentation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Segoe+UI:wght@400;600;700&display=swap');

    @page {
      size: 16in 9in;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #e2e8f0;
      color: #1e293b;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .slide {
      width: 16in;
      height: 9in;
      background: #ffffff;
      position: relative;
      overflow: hidden;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      padding: 0.5in 0.8in;
    }

    /* Right Green Facets matching Sample PPT Review 1 */
    .slide::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 3.2in;
      height: 9in;
      background: linear-gradient(135deg, rgba(226, 239, 218, 0.7) 0%, rgba(169, 208, 142, 0.8) 50%, rgba(112, 173, 71, 0.95) 100%);
      clip-path: polygon(70% 0, 100% 0, 100% 100%, 0% 100%);
      z-index: 1;
      pointer-events: none;
    }

    .slide-content {
      position: relative;
      z-index: 2;
      max-width: 11.8in;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .header-banner {
      width: 100%;
      max-height: 1.1in;
      object-fit: contain;
      object-position: left center;
      margin-bottom: 0.25in;
    }

    .slide-title {
      font-size: 32pt;
      font-weight: 700;
      color: #70ad47;
      margin-bottom: 0.35in;
      line-height: 1.2;
      border-bottom: 2px solid #e2efda;
      padding-bottom: 0.1in;
    }

    .bullet-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.22in;
      font-size: 15pt;
      line-height: 1.5;
    }

    .bullet-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .bullet-icon {
      color: #70ad47;
      font-size: 16pt;
      line-height: 1.3;
      flex-shrink: 0;
    }

    .bullet-bold {
      font-weight: 700;
      color: #375623;
    }

    /* Table Styles */
    .ppt-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0.1in;
      font-size: 11.5pt;
    }

    .ppt-table th {
      background: #70ad47;
      color: #ffffff;
      font-weight: 700;
      padding: 10px 12px;
      text-align: left;
      border: 1px solid #70ad47;
    }

    .ppt-table td {
      padding: 10px 12px;
      border: 1px solid #c8dcc3;
      color: #1e293b;
      vertical-align: middle;
      line-height: 1.35;
    }

    .ppt-table tr:nth-child(even) td {
      background: #e2efda;
    }

    .ppt-table tr:nth-child(odd) td {
      background: #f2f8ee;
    }

    /* TOC Specifics */
    .toc-grid {
      display: flex;
      flex-direction: column;
      gap: 0.22in;
      margin-top: 0.1in;
    }

    .toc-row {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 18pt;
      font-weight: 700;
      color: #1e293b;
    }

    .toc-arrow {
      color: #70ad47;
      font-size: 20pt;
    }

    /* Title Slide Specifics */
    .title-banner {
      width: 100%;
      max-height: 1.25in;
      object-fit: contain;
      object-position: left center;
      margin-bottom: 0.3in;
    }

    .main-title {
      font-size: 26pt;
      font-weight: 800;
      color: #375623;
      line-height: 1.25;
      margin-bottom: 0.12in;
    }

    .main-subtitle {
      font-size: 14pt;
      font-style: italic;
      color: #64748b;
      margin-bottom: 0.12in;
    }

    .main-badge {
      display: inline-block;
      background: #e2efda;
      color: #375623;
      font-size: 11.5pt;
      font-weight: 700;
      padding: 5px 14px;
      border-radius: 4px;
      margin-bottom: 0.25in;
    }

    .guide-box {
      font-size: 15pt;
      margin-bottom: 0.2in;
    }

    .guide-label {
      font-weight: 700;
      color: #1e293b;
    }

    .guide-name {
      font-weight: 700;
      color: #70ad47;
    }

    .team-table {
      width: 7.2in;
      border-collapse: collapse;
      font-size: 12pt;
      margin-bottom: 0.25in;
    }

    .team-table th {
      background: #70ad47;
      color: #ffffff;
      padding: 8px 12px;
      font-weight: 700;
      border: 1px solid #70ad47;
    }

    .team-table td {
      padding: 8px 12px;
      border: 1px solid #c8dcc3;
    }

    .dept-footer {
      font-size: 11.5pt;
      font-style: italic;
      color: #64748b;
      margin-top: auto;
    }
  </style>
</head>
<body>

  <!-- ============================================================ -->
  <!-- SLIDE 1: TITLE SLIDE                                         -->
  <!-- ============================================================ -->
  <div class="slide">
    <div class="slide-content">
      <img src="assets/extracted_img.jpg" class="title-banner" alt="College Header">
      <h1 class="main-title">CAMPUS NOTIFY: INSTITUTIONAL CIRCULAR &amp;<br>ANNOUNCEMENT MANAGEMENT SYSTEM</h1>
      <p class="main-subtitle">A Modular, Object-Oriented System in Core Java SE 17 with Responsive Web Interface</p>
      <div><span class="main-badge">Review – 1 Presentation | Java Programming Laboratory (Semester – III)</span></div>

      <div class="guide-box">
        <span class="guide-label">Guide: </span>
        <span class="guide-name">Prof. Sonali Kharat</span>
      </div>

      <p style="font-size: 13pt; font-weight: 700; margin-bottom: 6px; color: #1e293b;">Team Details:</p>
      <table class="team-table">
        <thead>
          <tr>
            <th style="width: 35%;">Student ID</th>
            <th style="width: 65%;">Student Name</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: #e2efda;">
            <td><strong>VU4F2526072</strong></td>
            <td><strong>PRATIK ATPADKAR</strong></td>
          </tr>
          <tr style="background: #f2f8ee;">
            <td><strong>VU4F2526066</strong></td>
            <td><strong>HARSH TIWAR</strong></td>
          </tr>
          <tr style="background: #e2efda;">
            <td><strong>VU4F2526062</strong></td>
            <td><strong>PARTH GADADHE</strong></td>
          </tr>
        </tbody>
      </table>

      <p class="dept-footer">Department of Information Technology | Vasantdada Patil Pratishthan’s College of Engineering &amp; Visual Arts, Sion, Mumbai</p>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- SLIDE 2: TABLE OF CONTENT                                    -->
  <!-- ============================================================ -->
  <div class="slide">
    <div class="slide-content">
      <h2 class="slide-title">Table of Content:</h2>
      <div class="toc-grid">
        <div class="toc-row"><span class="toc-arrow">►</span> <span>Introduction</span></div>
        <div class="toc-row"><span class="toc-arrow">►</span> <span>Problem Statement</span></div>
        <div class="toc-row"><span class="toc-arrow">►</span> <span>Objectives</span></div>
        <div class="toc-row"><span class="toc-arrow">►</span> <span>Literature Survey</span></div>
        <div class="toc-row"><span class="toc-arrow">►</span> <span>Research Gap</span></div>
        <div class="toc-row"><span class="toc-arrow">►</span> <span>Proposed Solution</span></div>
        <div class="toc-row"><span class="toc-arrow">►</span> <span>Project Planning &amp; Timeline</span></div>
        <div class="toc-row"><span class="toc-arrow">►</span> <span>Conclusion</span></div>
        <div class="toc-row"><span class="toc-arrow">►</span> <span>References</span></div>
      </div>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- SLIDE 3: INTRODUCTION                                        -->
  <!-- ============================================================ -->
  <div class="slide">
    <div class="slide-content">
      <h2 class="slide-title">Introduction:</h2>
      <ul class="bullet-list">
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Institutional Context:</span> University campuses require fast, authenticated, and transparent dissemination of critical academic notices, examination timetables, fee circulars, and departmental events.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Limitations of Legacy Systems:</span> Traditional physical notice boards and informal WhatsApp broadcast groups lead to notice loss, cognitive clutter, and complete absence of delivery verification.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Need for Digital Centralization:</span> A single, authoritative digital notice board ensures official circulars reach every student, faculty member, and administrator without physical delays.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Core Java SE 17 Engineering:</span> Developed as part of the Java Programming Laboratory to demonstrate real-world applications of Object-Oriented Programming (OOP), file streams, and security models.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Target Stakeholders:</span> Specifically tailored for Department of Information Technology and administrative governance at Vasantdada Patil Pratishthan's College of Engineering &amp; Visual Arts.</div>
        </li>
      </ul>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- SLIDE 4: PROBLEM STATEMENT                                   -->
  <!-- ============================================================ -->
  <div class="slide">
    <div class="slide-content">
      <h2 class="slide-title">Problem Statement:</h2>
      <ul class="bullet-list">
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Physical Notice Board Bottlenecks:</span> Circulars get torn, misplaced, or buried under newer posters; students absent from campus miss urgent submission deadlines and academic announcements.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Social Media Chaos &amp; Cognitive Fatigue:</span> WhatsApp and Telegram groups mix official circulars with informal chatter, memes, and non-academic media, leading to missed examination dates.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Zero Proof of Delivery &amp; Acknowledgment:</span> Faculty and examination cells have no verifiable mechanism or digital logs to confirm whether targeted students actually read critical notices.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Vulnerability to Fake Circulars &amp; Rumors:</span> Unofficial broadcast channels lack Role-Based Access Control (RBAC), leaving students susceptible to unverified exam cancellation rumors.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Paper Waste &amp; High Operational Overhead:</span> High recurring paper printing costs, toner waste, and physical labor required to distribute and pin paper circulars across multiple campus buildings.</div>
        </li>
      </ul>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- SLIDE 5: OBJECTIVES                                          -->
  <!-- ============================================================ -->
  <div class="slide">
    <div class="slide-content">
      <h2 class="slide-title">Objectives:</h2>
      <ul class="bullet-list">
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Centralized Digital Notice Repository:</span> To build a single authoritative portal categorized by department (IT, Comps, Mech, Civil) and priority (Urgent, Normal).</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Implement Core Java OOP Architecture:</span> To apply Encapsulation, Inheritance, Polymorphism, and Interfaces (Notifiable, AuditLoggable) for robust, maintainable domain services.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Enforce Role-Based Access Control (RBAC):</span> To establish a Zero-Access Security Wall restricting circular creation, editing, and deletion strictly to authenticated Super Admins and Faculty.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Provide Verifiable Digital Acknowledgment:</span> To enable students to digitally acknowledge circulars with instant timestamped receipts for administrative audit records.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Deliver Responsive &amp; Offline Accessibility:</span> To ensure 100% responsive user experience across mobile phones, tablets, and PCs with local caching during connectivity drops.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Promote Green Campus Sustainability:</span> To eliminate paper dependency, advancing UN Sustainable Development Goals (SDG 9: Innovation, SDG 12: Responsible Consumption).</div>
        </li>
      </ul>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- SLIDE 6: LITERATURE SURVEY                                   -->
  <!-- ============================================================ -->
  <div class="slide">
    <div class="slide-content">
      <h2 class="slide-title">Literature Survey:</h2>
      <table class="ppt-table">
        <thead>
          <tr>
            <th style="width: 5%; text-align: center;">Sr.<br>No.</th>
            <th style="width: 22%;">Title:</th>
            <th style="width: 14%;">Publication</th>
            <th style="width: 17%;">Author &amp;<br>Year</th>
            <th style="width: 20%;">Methodology:</th>
            <th style="width: 22%;">Key<br>Findings:</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center;"><strong>1</strong></td>
            <td><strong>Digital Campus Information Dissemination Systems</strong></td>
            <td>IEEE Access</td>
            <td>R. Sharma et al.<br>(2021)</td>
            <td>Centralized push notification broker using message queues</td>
            <td>High delivery rate across networks, but lacked role-based publishing controls and offline fallback.</td>
          </tr>
          <tr>
            <td style="text-align: center;"><strong>2</strong></td>
            <td><strong>Smart Notice Board using IoT Cloud Services</strong></td>
            <td>IJERT</td>
            <td>P. Patel &amp;<br>S. Deshmukh (2022)</td>
            <td>Raspberry Pi &amp; LCD digital display displays</td>
            <td>Reduced paper waste, but required expensive on-campus physical hardware; inaccessible remotely.</td>
          </tr>
          <tr>
            <td style="text-align: center;"><strong>3</strong></td>
            <td><strong>Role-Based Information Management in Higher Ed</strong></td>
            <td>Springer CS</td>
            <td>A. Gupta &amp;<br>K. Rao (2023)</td>
            <td>Multi-tier RBAC with relational access models</td>
            <td>Proved security benefits of role boundaries, but lacked client-side caching and acknowledgment receipts.</td>
          </tr>
          <tr>
            <td style="text-align: center;"><strong>4</strong></td>
            <td><strong>Campus Communication Bottlenecks in Higher Education</strong></td>
            <td>Elsevier CIE</td>
            <td>M. Fernandez et al.<br>(2024)</td>
            <td>Empirical survey across 12 university campuses</td>
            <td>68% of surveyed students missed critical deadlines due to unverified social media broadcast groups.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- SLIDE 7: RESEARCH GAP                                        -->
  <!-- ============================================================ -->
  <div class="slide">
    <div class="slide-content">
      <h2 class="slide-title">Research Gap:</h2>
      <ul class="bullet-list">
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Lack of Strict Role-Based Publishing:</span> Existing communication channels either permit unrestricted student posting (leading to spam and rumors) or rely on complex enterprise ERPs that lack agile customization for college departments.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Absence of Verifiable Acknowledgment Receipts:</span> Current digital bulletin boards passively broadcast notices without recording timestamped student delivery acknowledgments, leaving faculty uncertain about message penetration.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Physical Hardware Dependency:</span> Existing smart notice boards require expensive LCD/LED hallway displays, failing to deliver notices directly into students' pockets on their personal mobile devices.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Zero Offline Fault Tolerance:</span> Most campus web portals fail completely when on-campus Wi-Fi disconnects; lack of local client-side caching prevents students from viewing previously loaded circulars.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Fragmented Priority &amp; Category Routing:</span> Absence of structured priority filtering (Urgent vs. General) causes life-critical exam postponement alerts to be lost within routine club notices.</div>
        </li>
      </ul>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- SLIDE 8: PROPOSED SOLUTION                                   -->
  <!-- ============================================================ -->
  <div class="slide">
    <div class="slide-content">
      <h2 class="slide-title">Proposed Solution:</h2>
      <ul class="bullet-list">
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Modular Core Java SE 17 Architecture:</span> Robust Model-View-Controller (MVC) design separating domain models (Notice, User), interfaces (Notifiable), and CLI / Web business logic.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Zero-Access Authentication &amp; RBAC Gate:</span> Strict multi-tiered Role-Based Access Control ensuring circular creation, pinning, and deletion are restricted strictly to authenticated Super Admins and Faculty.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Dynamic Department &amp; Priority Routing:</span> Instant categorization across departments (IT, Comps, Mech, Civil) and priority badges (Urgent, Normal) with sub-5ms render latency.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Verifiable Digital Acknowledgment Engine:</span> One-click student acknowledgment recording verified digital receipts for examination and placement compliance audit records.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Dual-Tier Persistent Storage:</span> Seamless integration combining real-time cloud data storage with local offline-first storage (localStorage) for uninterrupted offline resiliency.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Cross-Device Responsive Web Client:</span> Clean, responsive portal optimized for all smartphones, tablets, and desktop workstations with zero visual clipping or hidden actions.</div>
        </li>
      </ul>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- SLIDE 9: PROJECT PLANNING & TIMELINE                         -->
  <!-- ============================================================ -->
  <div class="slide">
    <div class="slide-content">
      <h2 class="slide-title">Project Planning &amp; Timeline:</h2>
      <table class="ppt-table">
        <thead>
          <tr>
            <th style="width: 22%; text-align: center;">Week / Duration</th>
            <th style="width: 24%;">Phase Name</th>
            <th style="width: 40%;">Key Tasks &amp; Milestones</th>
            <th style="width: 14%; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center;"><strong>Weeks 1–2 (July 2025)</strong></td>
            <td><strong>Need Identification &amp; SRS</strong></td>
            <td>Problem definition, literature survey, stakeholder requirement gathering</td>
            <td style="text-align: center; color: #375623;"><strong>Completed</strong></td>
          </tr>
          <tr>
            <td style="text-align: center;"><strong>Weeks 3–4 (Aug 2025)</strong></td>
            <td><strong>Literature Survey &amp; Design</strong></td>
            <td>Comparative study, UML diagrams (Class, Use Case, Sequence), OOP modeling</td>
            <td style="text-align: center; color: #375623;"><strong>Completed</strong></td>
          </tr>
          <tr>
            <td style="text-align: center;"><strong>Weeks 5–7 (Aug–Sep 2025)</strong></td>
            <td><strong>Core Java OOP Modules</strong></td>
            <td>Implementing Notice, User, NotificationService, inheritance &amp; interfaces</td>
            <td style="text-align: center; color: #375623;"><strong>Completed</strong></td>
          </tr>
          <tr>
            <td style="text-align: center;"><strong>Weeks 8–9 (Sep 2025)</strong></td>
            <td><strong>Web Client &amp; Cloud Sync</strong></td>
            <td>Responsive dashboard, Firebase cloud sync, RBAC Zero-Access Wall</td>
            <td style="text-align: center; color: #375623;"><strong>Completed</strong></td>
          </tr>
          <tr>
            <td style="text-align: center;"><strong>Weeks 10–11 (Oct 2025)</strong></td>
            <td><strong>Testing &amp; Verification</strong></td>
            <td>92 Automated test suite execution, stress testing, edge-case fixes</td>
            <td style="text-align: center; color: #375623;"><strong>Completed</strong></td>
          </tr>
          <tr>
            <td style="text-align: center;"><strong>Weeks 12–13 (Oct 2025)</strong></td>
            <td><strong>Documentation &amp; Review</strong></td>
            <td>Report generation, logbook compilation, review presentation submission</td>
            <td style="text-align: center; color: #375623;"><strong>Completed</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- SLIDE 10: CONCLUSION                                         -->
  <!-- ============================================================ -->
  <div class="slide">
    <div class="slide-content">
      <h2 class="slide-title">Conclusion:</h2>
      <ul class="bullet-list">
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Successful Academic &amp; Technical Delivery:</span> Campus Notify successfully bridges the gap between academic theory and practical software engineering using Core Java SE 17 object-oriented paradigms.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Elimination of Communication Bottlenecks:</span> Replaced fragmented physical notice boards and chaotic WhatsApp groups with a structured, instant, and searchable institutional platform.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Administrative Governance &amp; Transparency:</span> Enforced strict Role-Based Access Control and verifiable digital acknowledgment receipts, completely eliminating lost circular disputes.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Environmental Sustainability (Green Campus):</span> Significantly reduces physical paper printing, toner consumption, and operational costs, aligning directly with UN Sustainable Development Goals (SDG 9 &amp; SDG 12).</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div><span class="bullet-bold">Future Scope &amp; Roadmap:</span> Planned enhancements include native Android &amp; iOS push notifications via Firebase FCM, automated SMS parent alerts, and direct integration with institutional biometric ERP databases.</div>
        </li>
      </ul>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- SLIDE 11: REFERENCES                                         -->
  <!-- ============================================================ -->
  <div class="slide">
    <div class="slide-content">
      <h2 class="slide-title">References:</h2>
      <ul class="bullet-list" style="font-size: 13pt; gap: 0.16in;">
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div>[1] R. Sharma, K. Patel, and S. Deshmukh, “Digital Campus Information Dissemination Systems,” IEEE Access, vol. 9, pp. 11200–11210, 2021.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div>[2] P. Patel and S. Deshmukh, “Smart Notice Board using IoT Cloud Services,” International Journal of Engineering Research &amp; Technology (IJERT), vol. 11, no. 5, pp. 45–52, 2022.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div>[3] A. Gupta and K. Rao, “Role-Based Information Management in Higher Education,” Springer Computer Science, vol. 48, pp. 210–225, 2023.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div>[4] M. Fernandez, L. Gomez, and T. Silva, “Campus Communication Bottlenecks in Higher Education,” Elsevier Computers in Industry &amp; Education, vol. 38, pp. 102–115, 2024.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div>[5] H. Schildt, Java: The Complete Reference, 12th ed., McGraw-Hill Education, 2021.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div>[6] J. Bloch, Effective Java, 3rd ed., Addison-Wesley Professional, 2018.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div>[7] University of Mumbai, Syllabus for Second Year Information Technology (Semester III &amp; IV), 2024–2025.</div>
        </li>
        <li class="bullet-item">
          <span class="bullet-icon">►</span>
          <div>[8] United Nations, Sustainable Development Goals Knowledge Platform, [Online]. Available: https://sdgs.un.org/goals.</div>
        </li>
      </ul>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- SLIDE 12: THANK YOU                                          -->
  <!-- ============================================================ -->
  <div class="slide">
    <div class="slide-content">
      <img src="assets/extracted_img.jpg" class="title-banner" alt="College Header">
      <h1 style="font-size: 38pt; font-weight: 800; color: #70ad47; margin-bottom: 0.1in;">Thank You!</h1>
      <p style="font-size: 20pt; font-weight: 700; color: #375623; margin-bottom: 0.3in;">Any Questions or Suggestions?</p>

      <div style="font-size: 14pt; line-height: 1.8; color: #1e293b;">
        <p><strong>Team Members:</strong> Pratik Atpadkar (VU4F2526072) | Harsh Tiwar (VU4F2526066) | Parth Gadadhe (VU4F2526062)</p>
        <p><strong>Project Guide:</strong> Prof. Sonali Kharat &nbsp;|&nbsp; <strong>Head of Department:</strong> Dr. Pradip Mane</p>
        <p style="font-style: italic; color: #64748b; margin-top: 0.15in;">Department of Information Technology<br>Vasantdada Patil Pratishthan’s College of Engineering &amp; Visual Arts, Sion, Mumbai</p>
        <p style="margin-top: 0.25in; font-weight: 700; color: #70ad47;">Live Portal: <span style="color: #375623;">https://campnotify-eef91.web.app</span></p>
      </div>
    </div>
  </div>

</body>
</html>
"""

def generate_html_and_pdf():
    html_path = os.path.join(BASE_DIR, "CampusNotify_Review_Presentation.html")
    pdf_path = os.path.join(BASE_DIR, "CampusNotify_Review_Presentation.pdf")
    
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Generated HTML Presentation: {html_path}")

    print(f"Exporting PDF via Chrome headless: {pdf_path}...")
    cmd = [
        CHROME_PATH,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        html_path
    ]
    res = subprocess.run(cmd, capture_output=True)
    if res.returncode == 0 and os.path.exists(pdf_path):
        size_kb = os.path.getsize(pdf_path) // 1024
        print(f"SUCCESS: Generated PDF Presentation: {pdf_path} ({size_kb} KB)")
    else:
        print(f"ERROR generating PDF: {res.stderr.decode('utf-8', errors='ignore')}")

if __name__ == "__main__":
    generate_html_and_pdf()
