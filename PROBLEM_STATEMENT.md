# VASANTDADA PATIL PRATISHTHAN'S COLLEGE OF ENGINEERING AND VISUAL ARTS
### (An Autonomous Institute)
**NAAC 'A' Grade Accredited, ISO 9001:2015 Certified**  
**Department of Information Technology**  
*NBA Accredited (Dated 01/07/2024 to 30/06/2027)*  

---

**Date:** ____ / ____ / 2026  

## Problem Statement for Mini Project
### Submitted By SE IT Div B

- **VU4F2425 - ____________________**
- **VU4F2425 - ____________________**
- **VU4F2425 - ____________________**
- **VU4F2425 - ____________________**

---

### 1. Title of the Mini Project
**Campus Notify: Institutional Circular & Announcement Management System**

---

### 2. Problem Definition
In today's academic campus environment, prompt, reliable, and verified dissemination of official notices and administrative circulars is a fundamental operational necessity. Currently, academic institutions rely heavily on physical wooden notice boards in department corridors, informal WhatsApp chat groups, or cluttered mass email threads.

This informal communication paradigm creates severe bottlenecks: critical exam timetables, scholarship deadlines, and urgent hall ticket notices frequently get buried beneath unrelated chat messages, students miss crucial deadlines, and unverified or falsified notices circulate without administrative audit trails. Furthermore, students lack a structured mechanism to filter circulars by department or urgency level.

This problem directly relates to **Sustainable Development Goal 4 (SDG 4): Quality Education**, by ensuring equitable, timely, and organized access to essential educational information and circulars for all students. It also aligns with **Sustainable Development Goal 9 (SDG 9): Industry, Innovation, and Infrastructure**, by modernizing campus digital communication infrastructure with an authentic, role-gated, and resilient software system.

---

### 3. Tools and Technologies Used
- **Java Development Kit (JDK):** Java SE 17 LTS / Java SE 21 LTS
- **Integrated Development Environment (IDE):** Visual Studio Code / Eclipse / IntelliJ IDEA
- **Core Java Paradigms:** Object-Oriented Programming (OOP), Collections Framework (`List`, `ArrayList`, `Iterator`), Java File I/O (`BufferedReader`, `PrintWriter`)
- **Web Frontend Technologies:** HTML5 Semantic Structure, CSS3 Flexbox/Grid Design System, Vanilla JavaScript (ES6+)
- **Persistence & Cloud Storage:** Local Delimited Flat-File Storage (`notifications_data.txt`) and Google Firebase (Cloud Firestore & Authentication) with LocalStorage Fallback

---

### 4. Objectives of the Project
The main objectives of this mini project are:
- To study and analyze the limitations of manual bulletin boards and unorganized messaging groups in campus announcement delivery.
- To design a centralized, authoritative campus notification management system based on the Model-View-Controller (MVC) architecture.
- To apply Core Java object-oriented programming concepts (Encapsulation, Constructor Overloading, Data Abstraction) in system design.
- To implement strict Role-Based Access Control (RBAC) separating administrative notice publishers from student viewers.
- To implement file-based persistence using Java File I/O streams ensuring circulars survive application restarts.
- To build a multi-platform experience featuring both an interactive terminal CLI driver and a modern web dashboard with real-time cloud synchronization.

---

### 5. Scope of the Project
The scope of the Campus Notify system includes managing student and faculty profiles, publishing categorized circulars (Academic, Examination, Placement, and Events), setting priority levels (Urgent, High, Normal), keyword-based searching, category filtering, and community discussion lounges.

The project focuses on software-based notice management, audit trails, and role-gated publication. It does not include physical biometric turnstile hardware integration or commercial cellular SMS gateway telephony.

---

### 6. Proposed Solution / Approach
The proposed solution is a modular, multi-tier notification management system developed using Core Java object-oriented principles. Object-Oriented Programming is used to encapsulate domain entities (`User`, `Notification`), enforcing private data members and public getter/setter mutators.

A dedicated business controller (`NotificationManager`) manages in-memory circular lists using the Java Collections Framework (`ArrayList`), safe traversal with `Iterator`, and delimited file persistence (`BufferedReader` / `PrintWriter`) to guarantee zero data loss. Role-Based Access Control (RBAC) ensures only authorized administrators and faculty can issue or purge notices, while students enjoy read-only feeds with interactive search and category filtering.

To bridge laboratory Java concepts with modern industry application, a responsive web dashboard is integrated alongside the terminal CLI, connecting to Google Firebase for real-time cloud sync with automatic offline local storage fallback.

---

### 7. Expected Outcome
- Automated, authentic dissemination of official campus circulars with zero unauthorized notice tampering.
- Sub-second keyword search and category filtering across hundreds of active announcements.
- Reliable data persistence surviving system restarts via Java File I/O and cloud synchronization.
- Clear role segregation between institutional administrators, faculty coordinators, and student viewers.
- 100% verified system reliability validated through an automated 36-test architectural verification suite.

---

### 8. Applications of the Project
- Engineering colleges and polytechnic campuses for daily circular broadcast.
- Examination Cells for publishing exam timetables, hall ticket alerts, and revaluation results.
- Training & Placement (T&P) Cells for recruitment drive notices, eligibility lists, and interview schedules.
- Student activity councils and technical committees for hackathon, seminar, and festival announcements.
- Educational demonstration of Core Java OOP, Collections, File I/O, and software engineering principles.

---

### 9. Limitations
- Terminal CLI driver requires a local Java Runtime Environment (JRE) installed on the machine.
- Cloud synchronization requires an active internet connection (though local offline mode is fully functional).
- Current version is limited to text notices and structured metadata; direct large video streaming is not accommodated.

---

### 10. Conclusion
The Campus Notify system provides an efficient, structured, and authentic digital solution for managing campus circulars and announcements. This mini project successfully demonstrates the practical application of Object-Oriented Programming, Java Collections Framework, File I/O persistence, and role governance in addressing real-world institutional communication bottlenecks.
