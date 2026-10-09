/**
 * CAMPUS NOTIFY - Client-Side Application Logic
 * Handcrafted vanilla JavaScript with LocalStorage persistence,
 * search engine, dynamic filtering, role management, and print utilities.
 */

// Initial Seed Data (Authentic College Notices)
const DEFAULT_NOTICES = [
  {
    id: 101,
    title: "Winter 2026 End-Semester Examination Schedule & Guidelines",
    category: "Examination",
    priority: "Urgent",
    department: "Exam Cell",
    author: "Controller of Examinations",
    description: "The official timetable for regular and backlog semester examinations (Winter 2026) has been uploaded. Students must verify their exam dates, seating halls, and report discrepancies to the Exam Section by Friday 4:00 PM. Hall tickets are mandatory for entry.",
    datePosted: "2026-10-09 10:30",
    attachment: "Exam_TimeTable_Winter2026.pdf"
  },
  {
    id: 102,
    title: "TCS Ninja & Digital National Campus Recruitment Drive",
    category: "Placement",
    priority: "High",
    department: "Training & Placement",
    author: "Prof. S. K. Roy (Head T&P)",
    description: "Tata Consultancy Services is hosting its annual campus recruitment drive for final-year engineering students. Minimum criteria: 6.5 CGPA with no active backlogs. Interested candidates must register on the NextStep portal before Wednesday 5:00 PM.",
    datePosted: "2026-10-08 14:15",
    attachment: "TCS_Drive_Guidelines_2026.pdf"
  },
  {
    id: 103,
    title: "Submission of Term Work, Seminar Reports & Mini Project Viva",
    category: "Academic",
    priority: "Urgent",
    department: "Computer Engg",
    author: "Dr. A. K. Sharma (HOD Computer)",
    description: "All Third-Year (TE) students are strictly instructed to submit their spiral-bound Mini Project reports and complete code demonstration before 18th October. Continuous assessment marks will be locked thereafter.",
    datePosted: "2026-10-08 09:45",
    attachment: "MiniProject_Rubrics_2026.pdf"
  },
  {
    id: 104,
    title: "INNOVISION 2026 - Annual Inter-College Technical Hackathon",
    category: "Event",
    priority: "Medium",
    department: "Student Affairs",
    author: "Student Council & CSI Chapter",
    description: "Registrations are now open for INNOVISION 2026, a 36-hour national hackathon featuring Web3, AI/ML, and IoT tracks with a cash prize pool of ₹1,50,000. Form teams of 2 to 4 members and submit problem proposals online.",
    datePosted: "2026-10-07 16:20",
    attachment: "Hackathon_Rulebook_2026.pdf"
  },
  {
    id: 105,
    title: "Central Library Extended 24x7 Reading Hall Access",
    category: "Academic",
    priority: "Medium",
    department: "General Admin",
    author: "Chief Librarian",
    description: "In view of upcoming practicals and semester examinations, the Central Library air-conditioned reading hall and high-speed Wi-Fi facility will remain accessible 24 hours a day starting next Monday. Maintain strict silence.",
    datePosted: "2026-10-06 11:00",
    attachment: "Library_Rules_Extended.pdf"
  },
  {
    id: 106,
    title: "Inter-College Cricket & Football Selection Trials",
    category: "Sports",
    priority: "Low",
    department: "Student Affairs",
    author: "Director of Physical Education",
    description: "Selection trials for the university sports contingent will commence this Saturday at 7:00 AM on the campus sports pavilion. Students with verified university sports registration are eligible to participate.",
    datePosted: "2026-10-05 17:30",
    attachment: "Sports_Selection_Schedule.pdf"
  },
  {
    id: 107,
    title: "Scheduled Maintenance of Campus Core Wi-Fi Infrastructure",
    category: "General",
    priority: "Low",
    department: "General Admin",
    author: "Network Operations Centre (NOC)",
    description: "Upgradation of campus core switches and access points will occur this Saturday night between 01:00 AM and 05:00 AM. Internet and hostel intranet connectivity will experience brief intermittent downtime.",
    datePosted: "2026-10-04 12:10",
    attachment: ""
  }
];

// App State Management
class CampusNotifyApp {
  constructor() {
    this.notices = [];
    this.bookmarks = new Set();
    this.currentRole = 'student'; // 'student' | 'faculty' | 'admin'
    this.activeCategory = 'ALL';
    this.activePriority = 'ALL';
    this.activeDepartment = 'ALL';
    this.searchQuery = '';
    this.bookmarksOnly = false;
    this.selectedNotice = null;

    this.init();
  }

  init() {
    this.loadState();
    this.bindDOM();
    this.bindEvents();
    this.startLiveClock();
    this.render();
  }

  // Load from LocalStorage or initialize with defaults
  loadState() {
    try {
      const stored = localStorage.getItem('campus_notify_data');
      if (stored) {
        this.notices = JSON.parse(stored);
      } else {
        this.notices = [...DEFAULT_NOTICES];
        this.saveState();
      }

      const savedBookmarks = localStorage.getItem('campus_notify_bookmarks');
      if (savedBookmarks) {
        this.bookmarks = new Set(JSON.parse(savedBookmarks));
      }

      const savedTheme = localStorage.getItem('campus_notify_theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);

      const savedRole = localStorage.getItem('campus_notify_role') || 'student';
      this.currentRole = savedRole;
    } catch (e) {
      console.warn("Storage loading error:", e);
      this.notices = [...DEFAULT_NOTICES];
    }
  }

  saveState() {
    try {
      localStorage.setItem('campus_notify_data', JSON.stringify(this.notices));
      localStorage.setItem('campus_notify_bookmarks', JSON.stringify([...this.bookmarks]));
      localStorage.setItem('campus_notify_role', this.currentRole);
    } catch (e) {
      console.error("Storage saving error:", e);
    }
  }

  bindDOM() {
    // Elements
    this.elements = {
      noticesGrid: document.getElementById('noticesGrid'),
      emptyState: document.getElementById('emptyState'),
      globalSearchInput: document.getElementById('globalSearchInput'),
      userRoleSelect: document.getElementById('userRoleSelect'),
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      openPostModalBtn: document.getElementById('openPostModalBtn'),
      postModalBackdrop: document.getElementById('postModalBackdrop'),
      closePostModalBtn: document.getElementById('closePostModalBtn'),
      cancelPostBtn: document.getElementById('cancelPostBtn'),
      postNoticeForm: document.getElementById('postNoticeForm'),
      priorityFilter: document.getElementById('priorityFilter'),
      departmentFilter: document.getElementById('departmentFilter'),
      toggleBookmarksBtn: document.getElementById('toggleBookmarksBtn'),
      bookmarkBtnText: document.getElementById('bookmarkBtnText'),
      refreshBtn: document.getElementById('refreshBtn'),
      printAllBtn: document.getElementById('printAllBtn'),
      resetFiltersBtn: document.getElementById('resetFiltersBtn'),
      categoryTabs: document.getElementById('categoryTabs'),
      liveClockDisplay: document.getElementById('liveClockDisplay'),
      emergencyMarquee: document.getElementById('emergencyMarquee'),
      closeMarqueeBtn: document.getElementById('closeMarqueeBtn'),
      toastContainer: document.getElementById('toastContainer'),
      // Detail Modal
      detailModalBackdrop: document.getElementById('detailModalBackdrop'),
      closeDetailModalBtn: document.getElementById('closeDetailModalBtn'),
      closeDetailBtn: document.getElementById('closeDetailBtn'),
      printSingleNoticeBtn: document.getElementById('printSingleNoticeBtn'),
      deleteNoticeInModalBtn: document.getElementById('deleteNoticeInModalBtn'),
      // Stats Counters
      statTotalCount: document.getElementById('statTotalCount'),
      statExamCount: document.getElementById('statExamCount'),
      statPlacementCount: document.getElementById('statPlacementCount'),
      statEventCount: document.getElementById('statEventCount'),
      statUrgentCount: document.getElementById('statUrgentCount'),
      // Tab Counters
      countAll: document.getElementById('countAll'),
      countExam: document.getElementById('countExam'),
      countAcad: document.getElementById('countAcad'),
      countPlace: document.getElementById('countPlace'),
      countEvent: document.getElementById('countEvent'),
      countSports: document.getElementById('countSports'),
      countGen: document.getElementById('countGen')
    };

    if (this.elements.userRoleSelect) {
      this.elements.userRoleSelect.value = this.currentRole;
    }
  }

  bindEvents() {
    // Search input
    this.elements.globalSearchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.render();
    });

    // Keyboard shortcut '/' to search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== this.elements.globalSearchInput && !document.querySelector('.modal-backdrop.open')) {
        e.preventDefault();
        this.elements.globalSearchInput.focus();
      } else if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // Role switcher
    this.elements.userRoleSelect.addEventListener('change', (e) => {
      this.currentRole = e.target.value;
      this.saveState();
      this.showToast(`Switched to ${this.getRoleDisplayName(this.currentRole)}`, 'info');
      this.render();
    });

    // Theme toggle
    this.elements.themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('campus_notify_theme', next);
      this.showToast(`Switched to ${next} mode`, 'info');
    });

    // Category Tabs
    this.elements.categoryTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;

      this.elements.categoryTabs.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      this.activeCategory = btn.getAttribute('data-category');
      this.render();
    });

    // Secondary Filters
    this.elements.priorityFilter.addEventListener('change', (e) => {
      this.activePriority = e.target.value;
      this.render();
    });

    this.elements.departmentFilter.addEventListener('change', (e) => {
      this.activeDepartment = e.target.value;
      this.render();
    });

    // Bookmarks Filter Toggle
    this.elements.toggleBookmarksBtn.addEventListener('click', () => {
      this.bookmarksOnly = !this.bookmarksOnly;
      this.elements.toggleBookmarksBtn.classList.toggle('active', this.bookmarksOnly);
      this.elements.bookmarkBtnText.textContent = this.bookmarksOnly ? "Showing Saved" : "Saved Only";
      this.render();
    });

    // Refresh & Reset
    this.elements.refreshBtn.addEventListener('click', () => {
      this.showToast("Bulletin refreshed with latest notices", "info");
      this.render();
    });

    this.elements.resetFiltersBtn.addEventListener('click', () => {
      this.resetAllFilters();
    });

    // Print Entire Board
    this.elements.printAllBtn.addEventListener('click', () => {
      window.print();
    });

    // Emergency Marquee Close
    this.elements.closeMarqueeBtn.addEventListener('click', () => {
      this.elements.emergencyMarquee.style.display = 'none';
    });

    // Post Notice Modal Open/Close
    this.elements.openPostModalBtn.addEventListener('click', () => {
      this.openPostModal();
    });

    this.elements.closePostModalBtn.addEventListener('click', () => this.closePostModal());
    this.elements.cancelPostBtn.addEventListener('click', () => this.closePostModal());

    // Post Notice Form Submit
    this.elements.postNoticeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handlePostNoticeSubmit();
    });

    // Detail Modal Close
    this.elements.closeDetailModalBtn.addEventListener('click', () => this.closeDetailModal());
    this.elements.closeDetailBtn.addEventListener('click', () => this.closeDetailModal());

    // Print Single Notice
    this.elements.printSingleNoticeBtn.addEventListener('click', () => {
      window.print();
    });

    // Delete in Modal (Admin Action)
    this.elements.deleteNoticeInModalBtn.addEventListener('click', () => {
      if (this.selectedNotice) {
        this.deleteNotice(this.selectedNotice.id);
        this.closeDetailModal();
      }
    });

    // Backdrop clicks to dismiss
    this.elements.postModalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.elements.postModalBackdrop) this.closePostModal();
    });

    this.elements.detailModalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.elements.detailModalBackdrop) this.closeDetailModal();
    });
  }

  startLiveClock() {
    const updateTime = () => {
      const now = new Date();
      const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      this.elements.liveClockDisplay.textContent = now.toLocaleDateString('en-IN', options);
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  getRoleDisplayName(role) {
    if (role === 'admin') return 'Dean / Admin';
    if (role === 'faculty') return 'Faculty Member';
    return 'Student';
  }

  openPostModal() {
    if (this.currentRole === 'student') {
      const switchConfirm = confirm(
        "Notice: You are currently in 'Student View' (Read-Only).\n\nWould you like to switch to 'Faculty View' to publish this announcement?"
      );
      if (switchConfirm) {
        this.currentRole = 'faculty';
        this.elements.userRoleSelect.value = 'faculty';
        this.saveState();
        this.showToast("Switched to Faculty mode to compose notice", "info");
      } else {
        return;
      }
    }

    this.elements.postModalBackdrop.classList.add('open');
    this.elements.postModalBackdrop.setAttribute('aria-hidden', 'false');
    document.getElementById('noticeTitleInput').focus();
  }

  closePostModal() {
    this.elements.postModalBackdrop.classList.remove('open');
    this.elements.postModalBackdrop.setAttribute('aria-hidden', 'true');
    this.elements.postNoticeForm.reset();
  }

  openDetailModal(notice) {
    this.selectedNotice = notice;

    document.getElementById('detailCategoryBadge').textContent = notice.category.toUpperCase();
    document.getElementById('detailCategoryBadge').className = `detail-category-badge badge-category cat-${notice.category.toLowerCase()}`;

    document.getElementById('detailPriorityBadge').textContent = `${notice.priority.toUpperCase()} PRIORITY`;
    document.getElementById('detailPriorityBadge').className = `detail-priority-badge badge-priority priority-${notice.priority.toLowerCase()}`;

    document.getElementById('detailId').textContent = `#${notice.id}`;
    document.getElementById('detailDate').textContent = notice.datePosted;
    document.getElementById('detailDepartment').textContent = notice.department;
    document.getElementById('detailAuthor').textContent = notice.author;
    document.getElementById('detailTitle').textContent = notice.title;
    document.getElementById('detailDescription').textContent = notice.description;
    document.getElementById('detailSignName').textContent = notice.author;

    const attachmentBox = document.getElementById('detailAttachmentBox');
    if (notice.attachment && notice.attachment.trim().length > 0) {
      attachmentBox.style.display = 'flex';
      document.getElementById('detailAttachmentName').textContent = notice.attachment;
      document.getElementById('downloadAttachmentSimBtn').onclick = () => {
        this.showToast(`Downloading: ${notice.attachment}`, 'success');
      };
    } else {
      attachmentBox.style.display = 'none';
    }

    // Admin Delete button visibility
    if (this.currentRole === 'admin') {
      this.elements.deleteNoticeInModalBtn.style.display = 'inline-flex';
    } else {
      this.elements.deleteNoticeInModalBtn.style.display = 'none';
    }

    this.elements.detailModalBackdrop.classList.add('open');
    this.elements.detailModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  closeDetailModal() {
    this.elements.detailModalBackdrop.classList.remove('open');
    this.elements.detailModalBackdrop.setAttribute('aria-hidden', 'true');
    this.selectedNotice = null;
  }

  closeAllModals() {
    this.closePostModal();
    this.closeDetailModal();
  }

  handlePostNoticeSubmit() {
    const title = document.getElementById('noticeTitleInput').value.trim();
    const category = document.getElementById('noticeCategoryInput').value;
    const priority = document.getElementById('noticePriorityInput').value;
    const department = document.getElementById('noticeDepartmentInput').value;
    const author = document.getElementById('noticeAuthorInput').value.trim();
    const description = document.getElementById('noticeDescriptionInput').value.trim();
    const attachment = document.getElementById('noticeAttachmentInput').value.trim();

    if (!title || !description || !author) {
      this.showToast("Please fill in all mandatory fields.", "error");
      return;
    }

    const now = new Date();
    const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newId = this.notices.length > 0 ? Math.max(...this.notices.map(n => n.id)) + 1 : 101;

    const newNotice = {
      id: newId,
      title,
      category,
      priority,
      department,
      author,
      description,
      datePosted: dateFormatted,
      attachment: attachment || ""
    };

    this.notices.unshift(newNotice);
    this.saveState();
    this.closePostModal();
    this.showToast(`Notice #${newId} published successfully!`, "success");
    this.render();
  }

  deleteNotice(id) {
    if (this.currentRole !== 'admin') {
      this.showToast("Permission denied: Only Admin can delete notices.", "error");
      return;
    }

    if (confirm(`Are you sure you want to delete notice #${id}? This action cannot be undone.`)) {
      this.notices = this.notices.filter(n => n.id !== id);
      this.bookmarks.delete(id);
      this.saveState();
      this.showToast(`Notice #${id} deleted from bulletin.`, "info");
      this.render();
    }
  }

  toggleBookmark(id, event) {
    event.stopPropagation();
    if (this.bookmarks.has(id)) {
      this.bookmarks.delete(id);
      this.showToast("Removed from saved notices", "info");
    } else {
      this.bookmarks.add(id);
      this.showToast("Saved notice to bookmarks", "success");
    }
    this.saveState();
    this.render();
  }

  resetAllFilters() {
    this.activeCategory = 'ALL';
    this.activePriority = 'ALL';
    this.activeDepartment = 'ALL';
    this.searchQuery = '';
    this.bookmarksOnly = false;
    this.elements.globalSearchInput.value = '';
    this.elements.priorityFilter.value = 'ALL';
    this.elements.departmentFilter.value = 'ALL';
    this.elements.toggleBookmarksBtn.classList.remove('active');
    this.elements.bookmarkBtnText.textContent = "Saved Only";

    this.elements.categoryTabs.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-category') === 'ALL');
      b.setAttribute('aria-selected', b.getAttribute('data-category') === 'ALL');
    });

    this.showToast("All filters reset", "info");
    this.render();
  }

  // Filter and Query Computation
  getFilteredNotices() {
    return this.notices.filter(notice => {
      // Category Filter
      if (this.activeCategory !== 'ALL' && notice.category !== this.activeCategory) {
        return false;
      }
      // Priority Filter
      if (this.activePriority !== 'ALL' && notice.priority !== this.activePriority) {
        return false;
      }
      // Department Filter
      if (this.activeDepartment !== 'ALL') {
        const deptMatch = notice.department.toLowerCase().includes(this.activeDepartment.toLowerCase());
        if (!deptMatch) return false;
      }
      // Bookmarks Only
      if (this.bookmarksOnly && !this.bookmarks.has(notice.id)) {
        return false;
      }
      // Search Query
      if (this.searchQuery) {
        const matchesTitle = notice.title.toLowerCase().includes(this.searchQuery);
        const matchesDesc = notice.description.toLowerCase().includes(this.searchQuery);
        const matchesAuthor = notice.author.toLowerCase().includes(this.searchQuery);
        const matchesDept = notice.department.toLowerCase().includes(this.searchQuery);
        if (!matchesTitle && !matchesDesc && !matchesAuthor && !matchesDept) {
          return false;
        }
      }
      return true;
    });
  }

  updateMetrics() {
    const total = this.notices.length;
    const exams = this.notices.filter(n => n.category === 'Examination').length;
    const placements = this.notices.filter(n => n.category === 'Placement').length;
    const events = this.notices.filter(n => n.category === 'Event').length;
    const urgent = this.notices.filter(n => n.priority === 'Urgent').length;

    this.elements.statTotalCount.textContent = total;
    this.elements.statExamCount.textContent = exams;
    this.elements.statPlacementCount.textContent = placements;
    this.elements.statEventCount.textContent = events;
    this.elements.statUrgentCount.textContent = urgent;

    // Tab Counts
    this.elements.countAll.textContent = total;
    this.elements.countExam.textContent = exams;
    this.elements.countAcad.textContent = this.notices.filter(n => n.category === 'Academic').length;
    this.elements.countPlace.textContent = placements;
    this.elements.countEvent.textContent = events;
    this.elements.countSports.textContent = this.notices.filter(n => n.category === 'Sports').length;
    this.elements.countGen.textContent = this.notices.filter(n => n.category === 'General').length;
  }

  render() {
    this.updateMetrics();
    const filtered = this.getFilteredNotices();

    if (filtered.length === 0) {
      this.elements.noticesGrid.innerHTML = '';
      this.elements.emptyState.style.display = 'block';
      return;
    }

    this.elements.emptyState.style.display = 'none';

    this.elements.noticesGrid.innerHTML = filtered.map(notice => {
      const isBookmarked = this.bookmarks.has(notice.id);
      const isUrgent = notice.priority === 'Urgent';
      const isHigh = notice.priority === 'High';

      const authorInitial = notice.author ? notice.author.charAt(0).toUpperCase() : 'C';

      return `
        <article 
          class="notice-card priority-${notice.priority.toLowerCase()}" 
          data-id="${notice.id}"
          tabindex="0"
          role="button"
          aria-label="View notice ${notice.title}"
        >
          <div class="card-top">
            <div class="card-badges">
              <span class="badge-category cat-${notice.category.toLowerCase()}">${notice.category}</span>
              <span class="badge-priority priority-${notice.priority.toLowerCase()}">
                ${isUrgent ? '★ URGENT' : (isHigh ? '⚡ HIGH' : notice.priority)}
              </span>
            </div>
            <button 
              class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" 
              data-bookmark-id="${notice.id}" 
              title="${isBookmarked ? 'Remove from saved' : 'Save for later'}"
              aria-label="${isBookmarked ? 'Saved' : 'Save notice'}"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>

          <h3 class="card-title">${this.escapeHTML(notice.title)}</h3>
          <p class="card-description">${this.escapeHTML(notice.description)}</p>

          <div class="card-meta-row">
            <div class="meta-author" title="${this.escapeHTML(notice.department)}">
              <div class="author-avatar">${authorInitial}</div>
              <span>${this.escapeHTML(notice.author)}</span>
            </div>
            <div class="meta-time">
              <span>📅 ${notice.datePosted.split(' ')[0]}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click events on newly rendered cards
    this.elements.noticesGrid.querySelectorAll('.notice-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent modal opening when clicking bookmark button
        if (e.target.closest('.btn-bookmark')) return;
        const id = parseInt(card.getAttribute('data-id'), 10);
        const notice = this.notices.find(n => n.id === id);
        if (notice) this.openDetailModal(notice);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = parseInt(card.getAttribute('data-id'), 10);
          const notice = this.notices.find(n => n.id === id);
          if (notice) this.openDetailModal(notice);
        }
      });
    });

    // Bookmark button click listeners
    this.elements.noticesGrid.querySelectorAll('.btn-bookmark').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.getAttribute('data-bookmark-id'), 10);
        this.toggleBookmark(id, e);
      });
    });
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${this.escapeHTML(message)}</span>`;
    this.elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  }

  escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.campusApp = new CampusNotifyApp();
});
