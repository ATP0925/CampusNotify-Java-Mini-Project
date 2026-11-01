# 🔬 CAMPUSNOTIFY MICROSCOPIC AUDIT: CHHOTI SE CHHOTI KAMIYA & EDGE CASES
> **Micro-Vulnerability, OS-Level, Database, & Psychological Edge-Case Teardown**  
> **Engineering Environment:** Mumbai University / PVPPCOE IT Department Reality  
> **Author:** Antigravity Engineering Lead

---

## 1. Submission & File-Level Micro-Exploits

### Micro-Exploit 1: The "Corrupted PDF Header" Extension Hack
* **The Student Trick**:
  - Assignment deadline is **11:59 PM**. At 11:57 PM, the student hasn't even started.
  - Student opens a random image or empty `.txt` file, renames it to `DBMS_Assignment_Pratik.pdf`, or opens an actual PDF in Notepad and deletes the first 20 bytes (stripping the `%PDF-1.4` magic bytes).
  - File uploads successfully before the deadline.
  - Three days later, when the professor opens it in `SubmissionListModal`, it displays: *"Error: File format invalid or corrupted."*
  - Student innocently claims: *"Sir, mere laptop me perfectly open ho raha tha, server par upload ke time corrupt ho gaya! Please allow re-upload!"* $\rightarrow$ **Student gains 3 extra days with zero penalty!**
* **Why AcadFlow Fails**: AcadFlow only checks client-side file MIME type extension (`.pdf`). It never validates the internal binary stream or page count.
* **CampusNotify Bulletproof Fix**:
  ```java
  // Server-Side Strict PDF Ingestion Gate (Apache PDFBox)
  try (PDDocument document = PDDocument.load(file.getInputStream())) {
      if (document.isEncrypted()) throw new InvalidSubmissionException("Encrypted PDF rejected");
      if (document.getNumberOfPages() < 1) throw new InvalidSubmissionException("Empty PDF rejected");
      PDFTextStripper stripper = new PDFTextStripper();
      String text = stripper.getText(document);
      if (text.trim().length() < 50 && document.getNumberOfPages() == 1) {
          throw new InvalidSubmissionException("Submission does not contain readable content");
      }
      // Generate instant visual thumbnail preview on server
  }
  ```

---

### Micro-Exploit 2: Monaco Editor DevTools Console `setValue()` Injection
* **The Student Trick**:
  - In `EditorPage`, developers block the `paste` event (`e.preventDefault()`).
  - A tech-savvy student presses `F12` $\rightarrow$ Console tab, and writes:
    ```javascript
    monaco.editor.getModels()[0].setValue(myCopiedCode);
    ```
  - **Result**: 800 lines of code appear in the editor instantaneously. Zero `paste` events fire. Zero `FOCUS_LOST` events fire if DevTools is docked inside the same window!
* **CampusNotify Bulletproof Fix**:
  - **$\Delta \text{chars} / \Delta t$ Velocity Gate**: Track typing throughput.
    $$\text{Typing Velocity} = \frac{\Delta \text{Characters}}{\Delta \text{Milliseconds}}$$
  - If $\Delta \text{Characters} > 50$ within $\Delta t < 100\text{ms}$, it is physically impossible for a human to type. System flags: `BURST_INJECTION_DETECTED` and disables submission.

---

### Micro-Exploit 3: Local Device Clock Skew vs Server NTP Time
* **The Student Trick**:
  - Student changes their device time from 12:02 AM back to 11:58 PM or toggles time zones.
  - If client JavaScript checks `new Date() < assignment.due_date`, it allows submission without a `LATE` penalty.
* **CampusNotify Bulletproof Fix**:
  - Client timestamps are completely ignored.
  - In Spring Boot, all deadlines and submission timestamps are enforced strictly using **Server-Side Atomic Clock (`Instant.now(Clock.systemUTC())`)** backed by NTP synchronization.

---

## 2. Attendance & Hardware Micro-Exploits

### Micro-Exploit 4: The "Zombie Attendance Session" (Teacher's Battery Dies)
* **The Teacher Flaw**:
  - A professor starts attendance in Room 203. Projector displays the rotating QR code.
  - At 9:10 AM, the professor's laptop battery unexpectedly dies (0%), or they accidentally close the Chrome browser tab.
  - In the database, the record in `attendance_sessions` remains `status: 'active'`.
  - The professor continues lecturing physically on the blackboard.
  - Meanwhile, students in the back row who took a photo of the initial salt or have friends in the class keep scanning and proxying for the next **90 minutes** because nobody formally clicked "End Session"!
* **CampusNotify Bulletproof Fix**:
  - **WebSocket Heartbeat with a 45-Second TTL (Time-To-Live)**:
    - Faculty browser must send a `PING` packet every 10 seconds.
    - If no heartbeat is received for **45 seconds**, the server automatically updates the session to `status = 'suspended'`.
    - If no reconnection occurs within 3 minutes, the session is **auto-closed** and marked with `closed_by: 'WATCHDOG_TIMEOUT'`.

---

### Micro-Exploit 5: The 74.99% Floating-Point Rounding Tragedy
* **The Mathematical Flaw**:
  - A student attends **59 sessions out of 79 conducted**:
    $$\text{Percentage} = \frac{59}{79} \times 100 = 74.683544\%$$
  - In JavaScript:
    - If developer uses `(59/79 * 100).toFixed(0)` $\rightarrow$ Rounds to **$75\%$** (Student thinks they are SAFE).
    - If Exam Cell uses `Math.floor()` or SQL `INT(59.0 / 79 * 100)` $\rightarrow$ Truncates to **$74\%$** (DEFAULTER / DEBARRED).
  - Student comes to the exam hall, hall ticket is blocked, argument breaks out between student and HOD.
* **CampusNotify Bulletproof Fix**:
  - **Single Source of Truth Rounding Specification**:
    - All attendance calculations across DB, Java backend, and React frontend must use strict **Mumbai University Ordinance 6086 Rule**:
      - Exact two-decimal representation: `74.68%`.
      - System explicitly states: *"74.68% - Defaulter (Short by 1 session to reach 75.00%)"*.

---

### Micro-Exploit 6: Heavy Rain / Mumbai Waterlogging 10-Minute Class Dismissal
* **The Reality**:
  - Professor starts class at 9:00 AM and takes attendance.
  - At 9:15 AM, Principal announces emergency college closure due to Mumbai local train shutdown / heavy rains.
  - Students leave.
  - **The Dilemma**: Does this 15-minute lecture count in the semester denominator?
    - If YES: 35 students who were stuck at Kurla/Sion station get penalized for absence.
    - If NO: 25 students who arrived on time complain that their attendance was cancelled.
* **CampusNotify Bulletproof Fix**:
  - **`VOID_EMERGENCY_DISMISSAL` Session State**:
    - HOD has a single-click button: *"Mark Session as Emergency Cancelled"*.
    - The session is removed from the total conducted count (denominator) for absent students, BUT students who were present receive **$+1$ Grace Attendance Bonus** in their profile ledger. Nobody is penalized, punctual students are rewarded!

---

### Micro-Exploit 7: Two Faculties, One Combined Lab (Batch C1 + C2 Collision)
* **The Timetable Flaw**:
  - In Lab 103, Prof. Mali teaches Batch C1 and Prof. Nehe teaches Batch C2 simultaneously in the same room.
  - If both create an attendance session, their geofences and Wi-Fi BSSIDs collide.
  - Students accidentally scan Prof. Mali's QR instead of Prof. Nehe's QR, leading to 15 students marked absent in their official subject!
* **CampusNotify Bulletproof Fix**:
  - **Batch-Gated Scanner**:
    - When student scans QR, server checks:
      ```sql
      SELECT 1 FROM batch_students 
      WHERE student_id = :studentId AND batch_id = :sessionBatchId
      ```
    - If Student is in Batch C2 and scans Batch C1's QR, phone instantly vibrates with an amber toast: *"Wrong Batch Session! You belong to Batch C2 (Prof. Nehe)."*

---

### Micro-Exploit 8: Duplicate Student Names & Mid-Year Roll Number Shifts
* **The Bureaucracy Flaw**:
  - Two students in Div A are named "Patil Prathamesh Sanjay" and "Patil Prathamesh Sunil".
  - In Semester 3, a dropout leaves, and the college clerk reshuffles roll numbers alphabetically: Roll 42 becomes Roll 41!
  - If the database links submissions, attendance, or defaulter notices by `roll_number`, all historical data maps to the wrong student!
* **CampusNotify Bulletproof Fix**:
  - Zero primary or foreign keys ever use Roll Number.
  - Every student has an immutable **UUID + University PRN (Permanent Registration Number)**: `VU4F2526072`. Roll number is strictly a cosmetic display property.

---

### Micro-Exploit 9: WhatsApp Notification API Bill Shock
* **The Financial Flaw**:
  - WhatsApp Business API (Twilio/Meta) costs $\approx ₹0.80$ per outbound utility template.
  - 1,200 students $\times$ 5 lectures/day $\times$ 25% average absence = **1,500 messages per day** = **₹1,200/day = ₹36,000/month**!
  - College management will cancel the portal within 30 days due to budget!
* **CampusNotify Bulletproof Fix**:
  - **Three-Tier Cascade Delivery Engine**:
    1. **Tier 1 (Free)**: WebSocket In-App Push & PWA Web Push (VAPID) $\rightarrow$ Delivered immediately at ₹0 cost.
    2. **Tier 2 (Free)**: Student & Parent Email via college SMTP (`mail.pvppcoe.ac.in`) $\rightarrow$ ₹0 cost.
    3. **Tier 3 (Paid WhatsApp)**: Strictly reserved for **Consolidated Daily 5:00 PM Summary** (only 1 message per family per day instead of 5) and critical **D2/D3 Defaulter Warnings**. Cuts operational cost by **92%**!

