# CampusNotify - Campus Notification Management System (CNMS) 🏛️
> **An Enterprise Academic & Administrative Circular Dispatch System | Java & Web Mini Project 2026**

[![Java Version](https://img.shields.io/badge/Java-21%20%7C%2017%20%7C%208%2B-orange.svg)](https://www.oracle.com/java/)
[![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20JavaScript-blue.svg)]()
[![System Architecture](https://img.shields.io/badge/Architecture-Enterprise%20ERP%20Dispatch-success.svg)]()
[![Privacy & Compliance](https://img.shields.io/badge/Compliance-DPDP%20Act%202023%20%7C%20256--Bit-green.svg)]()
[![Database Ready](https://img.shields.io/badge/Cloud-Google%20Firebase%20Firestore-yellow.svg)]()

---

## 📌 Project Overview
**CampusNotify (CNMS)** is an official **Campus Notification Management System** engineered for colleges, universities, and educational institutions. It provides a centralized, audited dispatch platform for administrative circulars, examination notifications, placement drives, and student affairs notices.

Designed to eliminate scattered communication across multiple informal channels, CampusNotify introduces a verified reference numbering system, read receipt acknowledgements, printable official circular letterheads, emoji reactions, inquiry threads, a community lounge with file sharing, and a **strict Zero-Access Security Gate** compliant with the **Digital Personal Data Protection (DPDP) Act 2023**.

---

## 🛡️ Zero-Access Authentication & Privacy Wall
To protect campus intellectual property and student privacy:
- **No Unauthenticated Data Leakage**: Unauthenticated visitors cannot view any circulars, inquiries, metrics, or lounge chats.
- **Privacy Shield Card**: The circular board renders a 256-bit cryptographic privacy shield until verified login.
- **Dedicated Institutional Auth Gateway**: Supports phone/username/email sign-in and new account registration with bio and avatar generation.
- **Multi-Account Device Governance**: Per campus security policy, any newly registered account on a device is flagged as `PENDING` and requires 1-click clearance by Super Admin Pratik Atpadkar before gaining portal access.

### 👑 Super Admin Credentials
- **Email:** `atpadkarmaruti@gmail.com`
- **Username:** `admin_pratik`
- **Password:** `PRATIK@00925`
- **Super Administrator:** Pratik Atpadkar (ATP0925)

---

## 🎯 Key System Features

### 1. 🏛️ Departmental Notice Governance
- Filter notices by official departments: **Examination Cell**, **Academic Affairs**, **Training & Placement**, **Dean's Office / Administration**, **Student Welfare**, and **Sports Directorate**.

### 2. 📋 Auditable Reference Numbering & Priority
- Every circular is assigned an institutional reference number (e.g., `CNMS/2026/001`) with issuing authority and date stamps.
- Flag notices as **Routine Announcement**, **⚠️ High Priority**, or **🚨 Urgent (Critical Deadlines / Immediate Action)**.

### 3. 🔐 Role-Based Authority & Moderation Hierarchy
- **Notice Issuing Authority**: Only Super Admin Pratik Atpadkar and members explicitly granted permission (`canPost: true`) can draft and publish circulars.
- **Viewer Interaction Privileges**: Viewers can like circulars, react with real-time emojis (👍, ❤️, 💡, 👏, 🎯, 🔥), submit official clarification inquiries, and record read acknowledgements.
- **Master Deletion & Moderation**: Only Super Admin has authority to delete circulars or delete others' inquiries from the official ledger.

### 4. 💬 Community Lounge (Group Chat & File Sharing)
- Official real-time group collaboration lounge for students and staff.
- Share campus notes, syllabus PDFs, and schedules with preview and direct download.
- Full moderation controls for the central administrator.

### 5. 🖨️ Official Letterhead View & Print
- Preview and print any circular on a formal institutional letterhead complete with university crest, official seal watermark, and authorized signature block.

### 6. 📱 Universal Fluid Typography & Auto-Fitting Layout
- Fully responsive design using modern CSS clamping and flexible layout grids that automatically auto-fit any screen size (smartphones, tablets, laptops, and ultra-wide desktop monitors).

### 7. 🔥 Google Firebase Cloud Database Sync
- Seamlessly connects with Google Cloud Firestore (`firestore.rules` included) with offline-first LocalStorage fallback.

### 8. ☕ Core Java Console Project Included
- Full Object-Oriented Java CLI management system with encapsulation, searching, file storage (`data/notifications.txt`), role switching, and statistical reporting.

---

## 📂 Project Architecture

```text
CampusNotify-Java-Mini-Project/
│
├── index.html                    # Official CNMS circular management web application
├── style.css                     # Responsive design system, fluid typography, dark/light theme & printable letterhead
├── app.js                        # CNMS client engine, Zero-Access wall, auth, reactions, lounge & Firebase sync
├── firestore.rules               # Google Cloud Firestore security rules
├── serve.js                      # Zero-dependency local static HTTP server
│
├── src/                          # Java Core Mini-Project Engine
│   ├── Main.java                 # Interactive CLI terminal management menu
│   ├── Notification.java         # Encapsulated notification model
│   ├── NotificationManager.java  # Repository management, search, and file persistence
│   └── User.java                 # User & authority model with permission flags
│
├── run.bat                       # 1-Click Windows execution script for Java CLI
├── .gitignore                    # Excludes compiled .class artifacts and node_modules
└── README.md                     # Comprehensive project documentation
```

---

## 🚀 How to Run the Project

### 1. Web Application (Live Circular Portal)
- Open **`index.html`** in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Safari).
- Or run the local static server:
  ```bash
  node serve.js
  ```
  Open: **`http://127.0.0.1:5173`**
- Live GitHub Pages deployment: **https://atp0925.github.io/CampusNotify-Java-Mini-Project/**

### 2. Java Application (CLI Management Engine)
Run via Command Prompt or PowerShell:
```bash
# Compile Java source code (requires JDK 8+)
javac src/*.java

# Execute CLI application
java -cp src Main
```
Or simply double-click **`run.bat`** on Windows.

---

## 👨‍💻 Submission Credits
- **Project Title:** Campus Notification Management System (CNMS)
- **Developer / Student:** Pratik Atpadkar (ATP0925)
- **Subject:** Java & Web Technology Mini Project
- **Academic Session:** 2025 - 2026
