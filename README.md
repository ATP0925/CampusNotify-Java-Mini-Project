# CampusNotify - Campus Notification Management System (CNMS) 🏛️
> **An Enterprise Academic & Administrative Circular Dispatch System | College Mini Project**

[![Java Version](https://img.shields.io/badge/Java-21%20%7C%2017%20%7C%208%2B-orange.svg)](https://www.oracle.com/java/)
[![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20JavaScript-blue.svg)]()
[![System Architecture](https://img.shields.io/badge/Architecture-Enterprise%20ERP%20Dispatch-success.svg)]()
[![License](https://img.shields.io/badge/License-Academic%20Project-lightgrey.svg)]()

---

## 📌 Project Overview
**CampusNotify (CNMS)** is an official **Campus Notification Management System** engineered for colleges, universities, and educational institutions. It provides a centralized, audited dispatch platform for administrative circulars, examination notifications, placement drives, and student affairs notices.

Designed to eliminate scattered communication across multiple informal channels, CampusNotify introduces a verified reference numbering system, read receipt acknowledgements, printable official circular letterheads, and an academic inquiry desk.

---

## 🎯 Key System Features

- **🏛️ Departmental Notice Governance**:
  - Filter notices by official departments: **Examination Cell**, **Academic Affairs**, **Training & Placement**, **Dean's Office / Administration**, **Student Welfare**, and **Sports Directorate**.
- **📋 Auditable Reference Numbering**:
  - Every circular is assigned an official institutional reference number (e.g., `CNMS/2026/001`) with issuing authority and date stamps.
- **🚨 Priority & Urgency Levels**:
  - Flag notices as **Routine Announcement**, **⚠️ High Priority**, or **🚨 Urgent (Critical Deadlines / Immediate Action)**.
- **👥 Target Audience Segmenting**:
  - Direct circulars to specific cohorts: *All Students & Faculty*, *Undergraduate (UG)*, *Postgraduate (PG)*, *Final Year Batch*, or *Faculty & Staff*.
- **✅ Read Receipt Acknowledgements**:
  - Enables students and staff to record verified read acknowledgements (`Acknowledge Receipt`).
- **🖨️ Official Letterhead View & Print**:
  - Preview and print any circular on a formal institutional letterhead complete with university crest, official seal watermark, and authorized signature block.
- **💬 Inquiry & Clarifications Desk**:
  - Integrated question log allowing students and faculty to post official inquiries directly on circulars.
- **📊 Real-Time Executive Metrics**:
  - Dashboard KPIs showing Total Circulars Issued, Urgent Alerts, Active Campus Departments, and Acknowledged Receipts.
- **💾 LocalStorage & Clean Zero-Data Architecture**:
  - Starts with a clean registry and persists all created circulars, acknowledgements, and inquiries in client storage.
- **☕ Core Java Engine Included**:
  - Full Object-Oriented Java CLI management system with encapsulation, searching, file storage, and reporting.

---

## 📂 Project Architecture

```text
CampusNotify-Java-Mini-Project/
│
├── index.html                    # Official CNMS circular management web application
├── style.css                     # Institutional stylesheet with dark/light theme & printable letterhead
├── app.js                        # CNMS client engine, KPI metrics, filter logic, & storage
│
├── src/                          # Java Core Mini-Project Engine
│   ├── Main.java                 # Interactive CLI terminal management menu
│   ├── Notification.java         # Encapsulated notification model
│   ├── NotificationManager.java  # Repository management, search, and file persistence
│   └── User.java                 # Authorized coordinator model
│
├── run.bat                       # 1-Click Windows execution script for Java CLI
├── .gitignore                    # Excludes compiled .class artifacts
└── README.md                     # Official project documentation
```

---

## 🚀 How to Run the Project

### 1. Web Application (Live Circular Portal)
- Open **`index.html`** in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Safari).
- Live deployment is accessible at: **https://atp0925.github.io/CampusNotify-Java-Mini-Project/**

### 2. Java Application (CLI Management Engine)
Run via Command Prompt / PowerShell:
```bash
# Compile Java source code
javac src/*.java

# Execute CLI application
java -cp src Main
```
Or simply double-click **`run.bat`** on Windows.

---

## 👨‍💻 Submission Credits
- **Project Title:** Campus Notification Management System (CNMS)
- **Developer / Student:** Maruti Atpadkar (ATP0925)
- **Subject:** Java & Web Technology Mini Project
- **Academic Session:** 2025 - 2026
