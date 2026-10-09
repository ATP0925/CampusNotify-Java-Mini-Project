# Campus Notify / X 📢
> **The Campus Social Network & Announcement Feed (Twitter/X for College)**

[![Java Version](https://img.shields.io/badge/Java-21%20%7C%2017%20%7C%208%2B-orange.svg)](https://www.oracle.com/java/)
[![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-blue.svg)]()
[![Design](https://img.shields.io/badge/Design-Twitter%20%2F%20X%20Theme-black.svg)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Project Overview
**Campus Notify / X** is a modern social media platform and digital broadcast feed designed specifically for university campuses, inspired by **Twitter / X**. It brings campus announcements, club updates, examination circulars, placement drives, and student discussions into a unified, interactive real-time timeline.

Every student and faculty member shares the same single unified role where anyone can post, like, repost, bookmark, and reply in threaded conversations.

---

## 🎯 Key Features (Twitter / X Style)

- **🐦 Iconic 3-Column Layout**:
  - **Left Sidebar**: Quick navigation (Home, Explore, Official Circulars, Bookmarks, Profile), prominent "Post" button, Dark/Light theme switch, and user profile card.
  - **Center Feed**: Timeline with "For You", "Official Notices 🏛️", and "Trending 🔥" tabs, tweet composer, hashtag links, attachments, and full tweet interaction bar.
  - **Right Sidebar**: Instant search bar, "What's Happening on Campus" trending hashtags (`#EndSemesterExams`, `#TCSRecruitment2026`, etc.), and verified campus channels to follow (`@exam_cell`, `@tpo_cell`).
- **💬 Interactive Action Bar**:
  - ❤️ **Like**: Heart pop animation with real-time like count.
  - 🔁 **Repost**: Instant retweet into your feed.
  - 💬 **Replies Drawer**: Click reply to open a threaded conversation modal and post answers.
  - 🔖 **Bookmarks**: Save important exam schedules or notices for quick access with counter badge.
  - 📤 **Share**: Instant clipboard link copying.
- **🏷️ Clickable Hashtags & Categories**:
  - Click on any `#hashtag` or category pill (`#Examination`, `#Placement`, etc.) to instantly filter the timeline.
- **🚨 Urgent Broadcasts**:
  - Flag urgent examination deadlines or emergencies with pulsating red badges.
- **💾 100% LocalStorage Persistence**:
  - All posts, likes, reposts, bookmarks, and replies are saved locally in the browser.
- **☕ Core Java Engine Included**:
  - Complete Core Java OOP backend (`src/Main.java`, `run.bat`) for college lab viva and project requirements.

---

## 📂 Project Structure

```text
CampusNotify-Java-Mini-Project/
│
├── index.html                    # Twitter / X style campus social web app
├── style.css                     # Handcrafted dark/light Twitter/X CSS styles & animations
├── app.js                        # Feed engine, likes, reposts, replies, & LocalStorage
│
├── src/                          # Java Core Mini-Project engine
│   ├── Main.java                 # Interactive CLI application & menu
│   ├── Notification.java         # Announcement model
│   ├── NotificationManager.java  # Business logic, search, filter, file I/O
│   └── User.java                 # User profile model
│
├── run.bat                       # 1-Click Windows execution script for Java CLI
├── .gitignore                    # Excludes compiled .class files
└── README.md                     # Complete project documentation
```

---

## 🚀 How to Run the Project

### 1. Web Application (Instant Preview)
Double-click **`index.html`** to open it immediately in Google Chrome, Edge, or Safari.

### 2. Java Application
Double-click **`run.bat`** or run:
```bash
javac src/*.java
java -cp src Main
```

---

## 👨‍💻 Submission Credits
- **Project Title:** Campus Notify / X
- **Student / Developer:** Maruti Atpadkar (ATP0925)
- **Course:** Java & Web Technology Mini Project (AY 2026-27)
