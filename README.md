# Campus Notify 📢
> **Java Mini Project** — College Announcement & Notification Management System

[![Java Version](https://img.shields.io/badge/Java-21%20%7C%2017%20%7C%208%2B-orange.svg)](https://www.oracle.com/java/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Cross--Platform%20(Windows%2FMac%2FLinux)-green.svg)]()

---

## 📌 Project Overview
**Campus Notify** is a lightweight, console-based Java application developed as a college mini-project. It simulates a digital notice board system for universities and colleges, allowing administrators, faculty members, and students to broadcast, view, filter, and search campus announcements seamlessly.

This project uses pure Java (Core Java / Standard Edition) without requiring complex frameworks or external database servers, making it easy to run and evaluate for academic submissions, lab evaluations, and vivas.

---

## 🎯 Key Features

- **📢 Notice Board Display**: View all campus announcements with structured, formatted cards including IDs, timestamps, categories, and priority badges.
- **🔍 Full-Text Search**: Search through announcements by keywords across **Titles**, **Descriptions**, or **Authors**.
- **🏷️ Category Filtering**: Filter announcements by specific tags:
  - `Examination`
  - `Academic`
  - `Placement`
  - `Event`
  - `Sports`
  - `General`
- **⚡ Priority Tagging**: Highlight important announcements with priority ratings (`Urgent`, `High`, `Medium`, `Low`).
- **👥 Role-Based Profiles**: Switch between different campus roles:
  - **Admin**: Full permissions (Post, View, Search, Delete, View Analytics).
  - **Faculty**: Can publish announcements and view/search notices.
  - **Student**: Read-only access to view, search, and filter notices.
- **📊 Analytics & Statistics**: View instant breakdown and statistics of total notices by category and priority.
- **💾 Local File Persistence**: Automatically saves notifications to `notifications_data.txt` and reloads them when the application starts.
- **🌱 Pre-populated Realistic Data**: Comes with sample academic, exam, and placement notifications so the system is ready to explore immediately.

---

## 🏛️ Object-Oriented Programming (OOP) Concepts Applied

| OOP Concept | Implementation Details |
|---|---|
| **Encapsulation** | Private fields in `Notification` and `User` accessed via public getters and setters. |
| **Separation of Concerns** | Clear modularization into Models (`User`, `Notification`), Business Logic/Storage (`NotificationManager`), and CLI Controller (`Main`). |
| **Data Abstraction** | File serialization, search parsing, and filtering algorithms are abstracted away inside `NotificationManager`. |
| **Polymorphism** | Overridden `toString()`, specialized string formatters, and custom deserialization methods. |
| **Exception Handling & Validation** | Robust handling of numeric inputs, empty queries, invalid choices, and file I/O streams using `try-with-resources`. |

---

## 📂 Project Structure

```text
CampusNotify-Java-Mini-Project/
│
├── src/
│   ├── Main.java                 # Main CLI application & interactive menu
│   ├── Notification.java         # Notification data model & formatting
│   ├── NotificationManager.java  # Business logic, search, filter, & file I/O
│   └── User.java                 # User profile model (Admin / Faculty / Student)
│
├── .gitignore                    # Ignores build artifacts and compiled .class files
├── run.bat                       # One-click Windows build and launch script
└── README.md                     # Comprehensive project documentation
```

---

## 🚀 How to Compile and Run

### Option 1: Quick Run (Windows)
Double-click `run.bat` or run it from command prompt:
```cmd
run.bat
```

### Option 2: Command Line (Cross-Platform)

1. **Clone or Download the repository:**
   ```bash
   git clone https://github.com/ATP0925/CampusNotify-Java-Mini-Project.git
   cd CampusNotify-Java-Mini-Project
   ```

2. **Compile the Java source files:**
   ```bash
   javac src/*.java
   ```

3. **Run the application:**
   ```bash
   java -cp src Main
   ```

---

## 💻 Sample Terminal Interface

```text
================================================================================
    ____                                       _   _       _   _  __       
   / ___|__ _ _ __ ___  _ __  _   _ ___       | \ | | ___ | |_(_)/ _|_   _ 
  | |   / _` | '_ ` _ \| '_ \| | | / __|      |  \| |/ _ \| __| | |_| | | |
  | |__| (_| | | | | | | |_) | |_| \__ \      | |\  | (_) | |_| |  _| |_| |
   \____\__,_|_| |_| |_| .__/ \__,_|___/      |_| \_|\___/ \__|_|_|  \__, |
                       |_|                                           |___/ 
            CAMPUS NOTIFY - College Announcement Management System              
                    (Java Console Mini-Project 2026)                          
================================================================================
--------------------------------------------------------------------------------
 Active User: Dr. A. K. Sharma (Admin - Dean Office) [ID: ADM-101]
--------------------------------------------------------------------------------
 [1] View All Announcements
 [2] Search Announcements (Title, Description, or Author)
 [3] Filter Announcements by Category
 [4] Filter Announcements by Priority
 [5] Post New Announcement
 [6] Delete Announcement
 [7] View Summary & Statistics
 [8] Switch User Profile (Admin / Faculty / Student)
 [9] Exit
--------------------------------------------------------------------------------
```

---

## 👨‍💻 Author & Submission Info
- **Project Title**: Campus Notify
- **Subject**: Java Mini Project / OOP Lab
- **Developed with**: Java SE (JDK 17+)
