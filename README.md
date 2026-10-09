# Campus Notify 📢
> **College Mini Project (Web Technology & Core Java)** — Digital Notice Board & Announcement Management System

[![Java Version](https://img.shields.io/badge/Java-21%20%7C%2017%20%7C%208%2B-orange.svg)](https://www.oracle.com/java/)
[![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-blue.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Cross--Platform%20%28Web%20%26%20Terminal%29-green.svg)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Project Overview
**Campus Notify** is an all-in-one digital notice board and announcement management portal designed for colleges and universities. It allows administrators, faculty members, and students to broadcast, view, filter, bookmark, and search campus announcements seamlessly.

This project includes both:
1. **🌐 Interactive Web Portal (`index.html`)**: A modern, handcrafted web dashboard featuring dark/light themes, live search, category and priority filters, role switcher (Student / Faculty / Admin), modal announcement publisher, printable circular views, and LocalStorage persistence.
2. **☕ Core Java Engine (`src/`)**: A modular, object-oriented console application demonstrating Core Java, File I/O, OOP principles (Encapsulation, Polymorphism, Abstraction), and interactive CLI navigation.

---

## 🎯 Key Features

### 🌐 Web Application Features
- **🎨 Handcrafted Modern UI**: Clean academic design with soft glassmorphism, responsive grid, and custom dark/light theme toggle.
- **⚡ Urgent Announcement Ticker**: Prominently highlights critical broadcast notices (e.g. Exam schedules).
- **🔍 Instant Live Search Engine**: Search through circulars by title, keywords, teacher/author, or department in real-time.
- **🏷️ Multi-Filter Navigation**:
  - **Category Tabs**: `Examination`, `Academics`, `Placements`, `Events & Fests`, `Sports`, `General`.
  - **Priority Filter**: `Urgent`, `High`, `Medium`, `Low`.
  - **Department Filter**: `Computer Engg`, `Information Tech`, `Mechanical`, `Exam Cell`, `T&P Cell`, etc.
- **👥 Multi-Role Portal Simulation**:
  - **Student View**: Read-only access, bookmark important circulars, download/print notice.
  - **Faculty View**: Can publish notices and broadcast circulars to specific departments.
  - **Dean / Admin View**: Full permissions including deletion of expired or archived notices.
- **📄 Printable Circular View (`@media print`)**: Click any notice card to view its official University circular format complete with digital verification stamp, printable directly to PDF or paper.
- **💾 LocalStorage Persistence**: All notices created, modified, or bookmarked are saved locally in the browser.

### ☕ Core Java Console Features
- Object-Oriented architecture (`User`, `Notification`, `NotificationManager`, `Main`).
- Full-text search and category filtering in terminal.
- Statistics summary report breakdown.
- Persistent file storage (`notifications_data.txt`).

---

## 📂 Project Structure

```text
CampusNotify-Java-Mini-Project/
│
├── index.html                    # Modern web application interface
├── style.css                     # Handcrafted CSS styles, theme variables, print layout
├── app.js                        # Client-side state manager, search, filtering, persistence
│
├── src/                          # Java Core Mini-Project source code
│   ├── Main.java                 # Interactive CLI application & menu
│   ├── Notification.java         # Announcement model (Card formatting & serialization)
│   ├── NotificationManager.java  # Business logic, search, filter, file I/O
│   └── User.java                 # User profile model (Admin / Faculty / Student)
│
├── run.bat                       # 1-Click Windows build & execution script for Java
├── .gitignore                    # Excludes compiled .class files and local data
└── README.md                     # Comprehensive project report & documentation
```

---

## 🚀 How to Run the Project

### 1. Opening the Web Portal (Instant Preview)
Simply double-click **`index.html`** or open it with any web browser (Chrome, Edge, Firefox, Safari).  
No server installation, Node.js, or complex database setup required!

### 2. Running the Java Application (Windows 1-Click)
Double-click **`run.bat`** in the project folder to automatically compile and launch the Java CLI.

### 3. Running the Java Application via Terminal (Cross-Platform)
```bash
# 1. Clone repository
git clone https://github.com/ATP0925/CampusNotify-Java-Mini-Project.git

# 2. Open project folder
cd CampusNotify-Java-Mini-Project

# 3. Compile Java files
javac src/*.java

# 4. Run application
java -cp src Main
```

---

## 🏛️ Academic / Submission Metadata
- **Project Title:** Campus Notify
- **Subject:** Mini Project / OOP & Web Technology
- **Branch:** Computer Engineering
- **Student / Author:** Maruti Atpadkar (ATP0925)
- **Year:** Academic Year 2026-27
