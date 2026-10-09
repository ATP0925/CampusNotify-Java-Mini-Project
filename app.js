/**
 * ============================================================================
 * CAMPUS NOTIFY - OFFICIAL CAMPUS NOTIFICATION MANAGEMENT SYSTEM (CNMS)
 * Academic & Administrative Circular Dispatch Portal Engine
 * Developed for Java Mini Project & Institutional Enterprise Management
 * Zero Fake / Demo Data - Clean State with LocalStorage Persistence
 * Coordinator / Admin: Maruti Atpadkar (ATP0925)
 * ============================================================================
 */

class CampusNotificationManagementSystem {
  constructor() {
    this.notices = [];
    this.acknowledgedSet = new Set();
    this.bookmarkSet = new Set();

    // Filters & View State
    this.activeDepartment = 'ALL';
    this.activePriority = 'ALL';
    this.activeAudience = 'ALL';
    this.bookmarkedOnly = false;
    this.searchQuery = '';

    // Active Modal IDs
    this.activeLetterheadNoticeId = null;
    this.activeDiscussionNoticeId = null;

    // Current Officer Profile
    this.currentUser = {
      name: 'Maruti Atpadkar',
      role: 'Portal Coordinator & System Admin',
      id: 'ATP0925'
    };

    this.init();
  }

  init() {
    this.loadState();
    this.bindDOM();
    this.bindEvents();
    this.render();
  }

  /* --------------------------------------------------------------------------
     STATE PERSISTENCE (Clean Slate - Zero Fake / Demo Data)
     -------------------------------------------------------------------------- */
  loadState() {
    try {
      // Clear any deprecated legacy demo keys
      localStorage.removeItem('campus_x_posts');
      localStorage.removeItem('campus_x_likes');
      localStorage.removeItem('campus_x_reposts');
      localStorage.removeItem('campus_notify_notices');

      // Load official notices repository
      const storedNotices = localStorage.getItem('cnms_official_notices');
      if (storedNotices) {
        const parsed = JSON.parse(storedNotices);
        // Ensure no legacy fake/demo seeds exist
        this.notices = Array.isArray(parsed)
          ? parsed.filter(n => n.id && !n.id.startsWith('demo-') && !n.id.startsWith('post-10'))
          : [];
      } else {
        this.notices = [];
      }

      // Load officer's acknowledgements
      const storedAcks = localStorage.getItem('cnms_user_acks');
      if (storedAcks) {
        this.acknowledgedSet = new Set(JSON.parse(storedAcks));
      }

      // Load bookmarks
      const storedBookmarks = localStorage.getItem('cnms_user_bookmarks');
      if (storedBookmarks) {
        this.bookmarkSet = new Set(JSON.parse(storedBookmarks));
      }

      // Load theme
      const savedTheme = localStorage.getItem('cnms_theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      this.updateThemeIcon(savedTheme);

    } catch (e) {
      console.warn('CNMS repository load error, initializing fresh:', e);
      this.notices = [];
      this.acknowledgedSet.clear();
      this.bookmarkSet.clear();
    }
  }

  saveNotices() {
    try {
      localStorage.setItem('cnms_official_notices', JSON.stringify(this.notices));
    } catch (e) {
      console.error('Failed to save CNMS repository:', e);
    }
  }

  saveInteractions() {
    try {
      localStorage.setItem('cnms_user_acks', JSON.stringify([...this.acknowledgedSet]));
      localStorage.setItem('cnms_user_bookmarks', JSON.stringify([...this.bookmarkSet]));
    } catch (e) {
      console.error('Failed to save CNMS interactions:', e);
    }
  }

  /* --------------------------------------------------------------------------
     DOM CACHING
     -------------------------------------------------------------------------- */
  bindDOM() {
    this.dom = {
      // Navbar Controls
      globalSearchInput: document.getElementById('globalSearchInput'),
      openNewNoticeBtn: document.getElementById('openNewNoticeBtn'),
      themeToggleBtn: document.getElementById('themeToggleBtn'),

      // KPI Metric Counters
      metricTotalCirculars: document.getElementById('metricTotalCirculars'),
      metricUrgentCirculars: document.getElementById('metricUrgentCirculars'),
      metricDepartmentsCount: document.getElementById('metricDepartmentsCount'),
      metricAcknowledgedCount: document.getElementById('metricAcknowledgedCount'),

      // Filter Toolbar
      departmentPills: document.getElementById('departmentPills'),
      deptPillBtns: document.querySelectorAll('.dept-pill-btn'),
      priorityFilterSelect: document.getElementById('priorityFilterSelect'),
      audienceFilterSelect: document.getElementById('audienceFilterSelect'),
      toggleBookmarkedOnlyBtn: document.getElementById('toggleBookmarkedOnlyBtn'),
      printBoardBtn: document.getElementById('printBoardBtn'),
      noticesCountBadge: document.getElementById('noticesCountBadge'),
      activeFilterAlert: document.getElementById('activeFilterAlert'),
      activeFilterText: document.getElementById('activeFilterText'),
      clearSearchFilterBtn: document.getElementById('clearSearchFilterBtn'),

      // Notices Feed & Empty State
      noticesContainer: document.getElementById('noticesContainer'),
      emptyStateCard: document.getElementById('emptyStateCard'),
      emptyStateCreateBtn: document.getElementById('emptyStateCreateBtn'),

      // Modal: Issue Circular Form
      newNoticeModalBackdrop: document.getElementById('newNoticeModalBackdrop'),
      closeNewNoticeModalBtn: document.getElementById('closeNewNoticeModalBtn'),
      cancelNoticeBtn: document.getElementById('cancelNoticeBtn'),
      newNoticeForm: document.getElementById('newNoticeForm'),
      noticeRefNo: document.getElementById('noticeRefNo'),
      noticeDepartment: document.getElementById('noticeDepartment'),
      noticeTitle: document.getElementById('noticeTitle'),
      noticePriority: document.getElementById('noticePriority'),
      noticeAudience: document.getElementById('noticeAudience'),
      noticeDescription: document.getElementById('noticeDescription'),
      noticeAttachment: document.getElementById('noticeAttachment'),
      noticeSignatory: document.getElementById('noticeSignatory'),

      // Modal: Official Letterhead Print / Preview
      officialLetterheadModalBackdrop: document.getElementById('officialLetterheadModalBackdrop'),
      closeLetterheadModalBtn: document.getElementById('closeLetterheadModalBtn'),
      closeLetterheadBtn: document.getElementById('closeLetterheadBtn'),
      printLetterheadBtn: document.getElementById('printLetterheadBtn'),
      letterheadDocument: document.getElementById('letterheadDocument'),

      // Modal: Query Desk
      discussionModalBackdrop: document.getElementById('discussionModalBackdrop'),
      closeDiscussionModalBtn: document.getElementById('closeDiscussionModalBtn'),
      discussionNoticeTitle: document.getElementById('discussionNoticeTitle'),
      commentInputText: document.getElementById('commentInputText'),
      submitCommentBtn: document.getElementById('submitCommentBtn'),
      commentsListContainer: document.getElementById('commentsListContainer'),

      // Toast Notifications
      toastContainer: document.getElementById('toastContainer')
    };
  }

  /* --------------------------------------------------------------------------
     EVENT BINDINGS
     -------------------------------------------------------------------------- */
  bindEvents() {
    // Search input
    if (this.dom.globalSearchInput) {
      this.dom.globalSearchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.render();
      });
    }

    if (this.dom.clearSearchFilterBtn) {
      this.dom.clearSearchFilterBtn.addEventListener('click', () => {
        this.searchQuery = '';
        this.activeDepartment = 'ALL';
        this.activePriority = 'ALL';
        this.activeAudience = 'ALL';
        this.bookmarkedOnly = false;
        if (this.dom.globalSearchInput) this.dom.globalSearchInput.value = '';
        if (this.dom.priorityFilterSelect) this.dom.priorityFilterSelect.value = 'ALL';
        if (this.dom.audienceFilterSelect) this.dom.audienceFilterSelect.value = 'ALL';
        this.dom.deptPillBtns.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-dept') === 'ALL'));
        if (this.dom.toggleBookmarkedOnlyBtn) this.dom.toggleBookmarkedOnlyBtn.classList.remove('btn-primary');
        this.render();
      });
    }

    // Department pills
    if (this.dom.departmentPills) {
      this.dom.departmentPills.addEventListener('click', (e) => {
        const btn = e.target.closest('.dept-pill-btn');
        if (!btn) return;
        const dept = btn.getAttribute('data-dept');
        if (dept) {
          this.activeDepartment = dept;
          this.dom.deptPillBtns.forEach(b => b.classList.toggle('active', b === btn));
          this.render();
        }
      });
    }

    // Priority filter select
    if (this.dom.priorityFilterSelect) {
      this.dom.priorityFilterSelect.addEventListener('change', (e) => {
        this.activePriority = e.target.value;
        this.render();
      });
    }

    // Audience filter select
    if (this.dom.audienceFilterSelect) {
      this.dom.audienceFilterSelect.addEventListener('change', (e) => {
        this.activeAudience = e.target.value;
        this.render();
      });
    }

    // Bookmarked only toggle
    if (this.dom.toggleBookmarkedOnlyBtn) {
      this.dom.toggleBookmarkedOnlyBtn.addEventListener('click', () => {
        this.bookmarkedOnly = !this.bookmarkedOnly;
        this.dom.toggleBookmarkedOnlyBtn.classList.toggle('btn-primary', this.bookmarkedOnly);
        this.render();
      });
    }

    // Print active board
    if (this.dom.printBoardBtn) {
      this.dom.printBoardBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Theme toggle
    if (this.dom.themeToggleBtn) {
      this.dom.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Modal: Issue Circular Open/Close
    if (this.dom.openNewNoticeBtn) {
      this.dom.openNewNoticeBtn.addEventListener('click', () => this.openNewNoticeModal());
    }
    if (this.dom.emptyStateCreateBtn) {
      this.dom.emptyStateCreateBtn.addEventListener('click', () => this.openNewNoticeModal());
    }
    if (this.dom.closeNewNoticeModalBtn) {
      this.dom.closeNewNoticeModalBtn.addEventListener('click', () => this.closeNewNoticeModal());
    }
    if (this.dom.cancelNoticeBtn) {
      this.dom.cancelNoticeBtn.addEventListener('click', () => this.closeNewNoticeModal());
    }
    if (this.dom.newNoticeModalBackdrop) {
      this.dom.newNoticeModalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.dom.newNoticeModalBackdrop) this.closeNewNoticeModal();
      });
    }

    // Form submission
    if (this.dom.newNoticeForm) {
      this.dom.newNoticeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePublishCircular();
      });
    }

    // Modal: Letterhead Preview & Print
    if (this.dom.closeLetterheadModalBtn) {
      this.dom.closeLetterheadModalBtn.addEventListener('click', () => this.closeLetterheadModal());
    }
    if (this.dom.closeLetterheadBtn) {
      this.dom.closeLetterheadBtn.addEventListener('click', () => this.closeLetterheadModal());
    }
    if (this.dom.printLetterheadBtn) {
      this.dom.printLetterheadBtn.addEventListener('click', () => {
        window.print();
      });
    }
    if (this.dom.officialLetterheadModalBackdrop) {
      this.dom.officialLetterheadModalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.dom.officialLetterheadModalBackdrop) this.closeLetterheadModal();
      });
    }

    // Modal: Query Desk
    if (this.dom.closeDiscussionModalBtn) {
      this.dom.closeDiscussionModalBtn.addEventListener('click', () => this.closeDiscussionModal());
    }
    if (this.dom.discussionModalBackdrop) {
      this.dom.discussionModalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.dom.discussionModalBackdrop) this.closeDiscussionModal();
      });
    }
    if (this.dom.submitCommentBtn) {
      this.dom.submitCommentBtn.addEventListener('click', () => this.handleSubmitInquiry());
    }
    if (this.dom.commentInputText) {
      this.dom.commentInputText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSubmitInquiry();
        }
      });
    }

    // Delegated actions on circular cards
    if (this.dom.noticesContainer) {
      this.dom.noticesContainer.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;
        const action = actionBtn.getAttribute('data-action');
        const noticeId = actionBtn.getAttribute('data-id');
        if (!noticeId) return;

        switch (action) {
          case 'acknowledge':
            this.handleToggleAcknowledge(noticeId);
            break;
          case 'letterhead':
            this.openLetterheadModal(noticeId);
            break;
          case 'inquiries':
            this.openDiscussionModal(noticeId);
            break;
          case 'bookmark':
            this.handleToggleBookmark(noticeId);
            break;
          case 'delete':
            this.handleDeleteNotice(noticeId);
            break;
          case 'share':
            this.handleShareCircular(noticeId);
            break;
        }
      });
    }

    // Global ESC key listener to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeNewNoticeModal();
        this.closeLetterheadModal();
        this.closeDiscussionModal();
      }
    });
  }

  /* --------------------------------------------------------------------------
     THEME TOGGLE
     -------------------------------------------------------------------------- */
  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('cnms_theme', nextTheme);
    this.updateThemeIcon(nextTheme);
    this.showToast(`Switched interface to ${nextTheme} theme`);
  }

  updateThemeIcon(theme) {
    if (this.dom.themeToggleBtn) {
      const iconSpan = this.dom.themeToggleBtn.querySelector('.theme-icon');
      if (iconSpan) {
        iconSpan.textContent = theme === 'dark' ? '🌓' : '☀️';
      }
    }
  }

  /* --------------------------------------------------------------------------
     ACTIONS: ACKNOWLEDGE, BOOKMARK, DELETE, SHARE
     -------------------------------------------------------------------------- */
  handleToggleAcknowledge(noticeId) {
    const notice = this.notices.find(n => n.id === noticeId);
    if (!notice) return;

    if (this.acknowledgedSet.has(noticeId)) {
      this.acknowledgedSet.delete(noticeId);
      notice.acknowledgedCount = Math.max(0, (notice.acknowledgedCount || 1) - 1);
      this.showToast('Receipt acknowledgement revoked');
    } else {
      this.acknowledgedSet.add(noticeId);
      notice.acknowledgedCount = (notice.acknowledgedCount || 0) + 1;
      this.showToast('Official receipt acknowledged & recorded ✅', 'success');
    }

    this.saveNotices();
    this.saveInteractions();
    this.render();
  }

  handleToggleBookmark(noticeId) {
    if (this.bookmarkSet.has(noticeId)) {
      this.bookmarkSet.delete(noticeId);
      this.showToast('Removed circular from saved list');
    } else {
      this.bookmarkSet.add(noticeId);
      this.showToast('Circular pinned to your saved desk 🔖', 'info');
    }

    this.saveInteractions();
    this.render();
  }

  handleDeleteNotice(noticeId) {
    const notice = this.notices.find(n => n.id === noticeId);
    if (!notice) return;

    const confirmed = window.confirm(
      `CONFIRM CIRCULAR ARCHIVAL / DELETION:\n\nReference: ${notice.refNo}\nSubject: "${notice.title}"\n\nAre you sure you wish to permanently remove this official notice?`
    );
    if (!confirmed) return;

    this.notices = this.notices.filter(n => n.id !== noticeId);
    this.acknowledgedSet.delete(noticeId);
    this.bookmarkSet.delete(noticeId);

    this.saveNotices();
    this.saveInteractions();
    this.showToast(`Circular [${notice.refNo}] removed from registry`, 'error');
    this.render();
  }

  handleShareCircular(noticeId) {
    const notice = this.notices.find(n => n.id === noticeId);
    if (!notice) return;

    const copyText = `[CAMPUS NOTIFICATION SYSTEM]\nRef: ${notice.refNo}\nDept: ${notice.department}\nPriority: ${notice.priority}\nSubject: ${notice.title}\nDate: ${this.formatDate(notice.issuedAt)}\n\n${notice.description.slice(0, 160)}...`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(copyText).then(() => {
        this.showToast('Official circular summary copied to clipboard! 📋');
      }).catch(() => {
        this.showToast('Circular summary ready');
      });
    } else {
      this.showToast('Circular summary ready');
    }
  }

  /* --------------------------------------------------------------------------
     MODAL: ISSUE OFFICIAL CIRCULAR
     -------------------------------------------------------------------------- */
  openNewNoticeModal() {
    if (!this.dom.newNoticeModalBackdrop) return;

    // Auto-generate next official reference number
    const nextSeq = String(this.notices.length + 1).padStart(3, '0');
    if (this.dom.noticeRefNo) {
      this.dom.noticeRefNo.value = `CNMS/2026/${nextSeq}`;
    }

    if (this.dom.noticeSignatory) {
      this.dom.noticeSignatory.value = `${this.currentUser.name}, ${this.currentUser.role}`;
    }

    this.dom.newNoticeModalBackdrop.classList.add('open');
    this.dom.newNoticeModalBackdrop.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      if (this.dom.noticeTitle) this.dom.noticeTitle.focus();
    }, 120);
  }

  closeNewNoticeModal() {
    if (!this.dom.newNoticeModalBackdrop) return;
    this.dom.newNoticeModalBackdrop.classList.remove('open');
    this.dom.newNoticeModalBackdrop.setAttribute('aria-hidden', 'true');
    if (this.dom.newNoticeForm) this.dom.newNoticeForm.reset();
  }

  handlePublishCircular() {
    const refNo = this.dom.noticeRefNo ? this.dom.noticeRefNo.value.trim() : `CNMS/2026/${Date.now().toString().slice(-3)}`;
    const department = this.dom.noticeDepartment ? this.dom.noticeDepartment.value : 'Administrative Office';
    const title = this.dom.noticeTitle ? this.dom.noticeTitle.value.trim() : '';
    const priority = this.dom.noticePriority ? this.dom.noticePriority.value : 'Routine';
    const audience = this.dom.noticeAudience ? this.dom.noticeAudience.value : 'All Students & Faculty';
    const description = this.dom.noticeDescription ? this.dom.noticeDescription.value.trim() : '';
    const attachment = this.dom.noticeAttachment ? this.dom.noticeAttachment.value.trim() : '';
    const signatory = this.dom.noticeSignatory ? this.dom.noticeSignatory.value.trim() : `${this.currentUser.name}, Coordinator`;

    if (!title || !description) {
      this.showToast('Both Circular Subject and Content instructions are mandatory.', 'error');
      return;
    }

    const newCircular = {
      id: 'CNMS-' + Date.now(),
      refNo: refNo,
      department: department,
      title: title,
      priority: priority,
      audience: audience,
      description: description,
      attachment: attachment || null,
      signatory: signatory,
      issuedAt: new Date().toISOString(),
      acknowledgedCount: 0,
      comments: []
    };

    // Prepend to official notices list
    this.notices.unshift(newCircular);
    this.saveNotices();

    this.closeNewNoticeModal();
    this.showToast(`Official Circular [${refNo}] published to campus board! 📢`, 'success');
    this.render();
  }

  /* --------------------------------------------------------------------------
     MODAL: OFFICIAL LETTERHEAD VIEW & PRINT
     -------------------------------------------------------------------------- */
  openLetterheadModal(noticeId) {
    const notice = this.notices.find(n => n.id === noticeId);
    if (!notice || !this.dom.officialLetterheadModalBackdrop) return;

    this.activeLetterheadNoticeId = noticeId;

    if (this.dom.letterheadDocument) {
      this.dom.letterheadDocument.innerHTML = `
        <div class="lh-college-banner">
          <div class="lh-crest">🏛️</div>
          <h2 class="lh-college-name">CAMPUS INSTITUTE OF ENGINEERING & TECHNOLOGY</h2>
          <p class="lh-college-subhead">Approved by AICTE &bull; Affiliated to University &bull; Directorate of Academic Governance</p>
        </div>

        <div class="lh-ref-date-row">
          <span><strong>REF NO:</strong> ${this.escapeHTML(notice.refNo)}</span>
          <span><strong>DATE OF ISSUE:</strong> ${this.formatDate(notice.issuedAt)}</span>
        </div>

        <div class="lh-circular-heading">
          <span class="lh-doc-badge">OFFICIAL CIRCULAR &bull; ${this.escapeHTML(notice.department).toUpperCase()}</span>
          <h3 class="lh-subject-title">SUBJECT: ${this.escapeHTML(notice.title)}</h3>
        </div>

        <div class="lh-body-text">
          ${this.escapeHTML(notice.description)}
        </div>

        ${notice.attachment ? `
          <div class="lh-document-attachment">
            <strong>DOCUMENT ENCLOSURE:</strong> ${this.escapeHTML(notice.attachment)}
          </div>
        ` : ''}

        <div class="lh-signatory-block">
          <div class="lh-seal-box">
            <span>OFFICIAL DISPATCH</span>
            <span>VERIFIED &bull; CNMS</span>
            <span>AY 2025-26</span>
          </div>

          <div class="lh-signature-details">
            <div class="lh-sig-line"></div>
            <p class="lh-sig-name">${this.escapeHTML(notice.signatory)}</p>
            <p class="lh-sig-role">${this.escapeHTML(notice.department)}</p>
            <p class="lh-sig-role">Target Audience: ${this.escapeHTML(notice.audience)}</p>
          </div>
        </div>
      `;
    }

    this.dom.officialLetterheadModalBackdrop.classList.add('open');
    this.dom.officialLetterheadModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  closeLetterheadModal() {
    if (!this.dom.officialLetterheadModalBackdrop) return;
    this.dom.officialLetterheadModalBackdrop.classList.remove('open');
    this.dom.officialLetterheadModalBackdrop.setAttribute('aria-hidden', 'true');
    this.activeLetterheadNoticeId = null;
  }

  /* --------------------------------------------------------------------------
     MODAL: INQUIRY & CLARIFICATION DESK
     -------------------------------------------------------------------------- */
  openDiscussionModal(noticeId) {
    const notice = this.notices.find(n => n.id === noticeId);
    if (!notice || !this.dom.discussionModalBackdrop) return;

    this.activeDiscussionNoticeId = noticeId;
    if (this.dom.discussionNoticeTitle) {
      this.dom.discussionNoticeTitle.textContent = `${notice.refNo}: ${notice.title}`;
    }
    if (this.dom.commentInputText) {
      this.dom.commentInputText.value = '';
    }

    this.renderInquiriesList();

    this.dom.discussionModalBackdrop.classList.add('open');
    this.dom.discussionModalBackdrop.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      if (this.dom.commentInputText) this.dom.commentInputText.focus();
    }, 120);
  }

  closeDiscussionModal() {
    if (!this.dom.discussionModalBackdrop) return;
    this.dom.discussionModalBackdrop.classList.remove('open');
    this.dom.discussionModalBackdrop.setAttribute('aria-hidden', 'true');
    this.activeDiscussionNoticeId = null;
  }

  renderInquiriesList() {
    if (!this.dom.commentsListContainer || !this.activeDiscussionNoticeId) return;
    const notice = this.notices.find(n => n.id === this.activeDiscussionNoticeId);
    if (!notice) return;

    const queries = notice.comments || [];
    if (queries.length === 0) {
      this.dom.commentsListContainer.innerHTML = `
        <div style="text-align: center; padding: 24px 12px; color: var(--text-dim); font-size: 0.88rem;">
          📑 No official inquiries or doubts logged yet.<br>Faculty members or students may post queries below.
        </div>
      `;
      return;
    }

    this.dom.commentsListContainer.innerHTML = queries.map(q => `
      <div class="comment-item">
        <div class="comment-header">
          <span class="comment-author">${this.escapeHTML(q.author)}</span>
          <span class="comment-time">${this.formatDate(q.time)}</span>
        </div>
        <div class="comment-text">${this.escapeHTML(q.text)}</div>
      </div>
    `).join('');
  }

  handleSubmitInquiry() {
    if (!this.activeDiscussionNoticeId || !this.dom.commentInputText) return;
    const text = this.dom.commentInputText.value.trim();
    if (!text) return;

    const notice = this.notices.find(n => n.id === this.activeDiscussionNoticeId);
    if (!notice) return;

    if (!notice.comments) notice.comments = [];

    const newQuery = {
      id: 'query-' + Date.now(),
      author: `${this.currentUser.name} (${this.currentUser.role})`,
      time: new Date().toISOString(),
      text: text
    };

    notice.comments.push(newQuery);
    this.saveNotices();

    this.dom.commentInputText.value = '';
    this.renderInquiriesList();
    this.render();
    this.showToast('Inquiry logged into official clarification ledger.');
  }

  /* --------------------------------------------------------------------------
     RENDER SYSTEM & KPI METRICS
     -------------------------------------------------------------------------- */
  render() {
    // 1. Calculate KPI Metrics
    const totalCount = this.notices.length;
    const urgentCount = this.notices.filter(n => n.priority === 'Urgent').length;
    
    // Calculate total receipts acknowledged across all notices
    const totalAcks = this.notices.reduce((sum, n) => sum + (n.acknowledgedCount || 0), 0);

    if (this.dom.metricTotalCirculars) this.dom.metricTotalCirculars.textContent = totalCount;
    if (this.dom.metricUrgentCirculars) this.dom.metricUrgentCirculars.textContent = urgentCount;
    if (this.dom.metricAcknowledgedCount) this.dom.metricAcknowledgedCount.textContent = totalAcks;

    // 2. Filter Notices
    let filtered = [...this.notices];

    // Department filter
    if (this.activeDepartment !== 'ALL') {
      filtered = filtered.filter(n => (n.department || '').toLowerCase() === this.activeDepartment.toLowerCase());
    }

    // Priority filter
    if (this.activePriority !== 'ALL') {
      filtered = filtered.filter(n => (n.priority || '').toLowerCase() === this.activePriority.toLowerCase());
    }

    // Audience filter
    if (this.activeAudience !== 'ALL') {
      filtered = filtered.filter(n => (n.audience || '').toLowerCase() === this.activeAudience.toLowerCase());
    }

    // Bookmarked only
    if (this.bookmarkedOnly) {
      filtered = filtered.filter(n => this.bookmarkSet.has(n.id));
    }

    // Search query
    if (this.searchQuery) {
      const q = this.searchQuery;
      filtered = filtered.filter(n => 
        (n.refNo && n.refNo.toLowerCase().includes(q)) ||
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.description && n.description.toLowerCase().includes(q)) ||
        (n.department && n.department.toLowerCase().includes(q)) ||
        (n.signatory && n.signatory.toLowerCase().includes(q)) ||
        (n.attachment && n.attachment.toLowerCase().includes(q))
      );
    }

    // 3. Active Search / Filter Banner
    if (this.dom.activeFilterAlert && this.dom.activeFilterText) {
      const isFiltered = this.searchQuery || this.activeDepartment !== 'ALL' || this.activePriority !== 'ALL' || this.activeAudience !== 'ALL' || this.bookmarkedOnly;
      if (isFiltered) {
        this.dom.activeFilterAlert.style.display = 'flex';
        let filterSummary = [];
        if (this.searchQuery) filterSummary.push(`Query: "${this.searchQuery}"`);
        if (this.activeDepartment !== 'ALL') filterSummary.push(`Dept: ${this.activeDepartment}`);
        if (this.activePriority !== 'ALL') filterSummary.push(`Priority: ${this.activePriority}`);
        if (this.bookmarkedOnly) filterSummary.push(`Saved Only`);
        this.dom.activeFilterText.textContent = `Active Filter: ${filterSummary.join(' | ')} (${filtered.length} matching circulars)`;
      } else {
        this.dom.activeFilterAlert.style.display = 'none';
      }
    }

    // 4. Update count badge
    if (this.dom.noticesCountBadge) {
      this.dom.noticesCountBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'circular' : 'circulars'}`;
    }

    // 5. Render Circulars or Empty Slate
    if (filtered.length === 0) {
      if (this.dom.noticesContainer) this.dom.noticesContainer.innerHTML = '';
      if (this.dom.emptyStateCard) {
        this.dom.emptyStateCard.style.display = 'block';

        const emptyTitle = this.dom.emptyStateCard.querySelector('.empty-title');
        const emptyText = this.dom.emptyStateCard.querySelector('.empty-text');

        if (this.searchQuery) {
          if (emptyTitle) emptyTitle.textContent = 'No Matching Circulars Found';
          if (emptyText) emptyText.textContent = `No circulars matching "${this.searchQuery}" were located in the repository. Please verify your reference number or keywords.`;
        } else if (this.bookmarkedOnly) {
          if (emptyTitle) emptyTitle.textContent = 'No Saved Circulars';
          if (emptyText) emptyText.textContent = 'You have not pinned any circulars to your desk yet. Click "Save" on any circular to bookmark it.';
        } else if (this.activeDepartment !== 'ALL') {
          if (emptyTitle) emptyTitle.textContent = `No Circulars for ${this.activeDepartment}`;
          if (emptyText) emptyText.textContent = `There are currently no circulars issued under the ${this.activeDepartment} department registry.`;
        } else {
          if (emptyTitle) emptyTitle.textContent = 'No Official Circulars on Record';
          if (emptyText) emptyText.textContent = 'The central notification board is currently synchronized and clear. Authorized coordinators may issue an official academic or administrative circular using the button below.';
        }
      }
    } else {
      if (this.dom.emptyStateCard) this.dom.emptyStateCard.style.display = 'none';
      if (this.dom.noticesContainer) {
        this.dom.noticesContainer.innerHTML = filtered.map(circular => this.renderCircularCard(circular)).join('');
      }
    }
  }

  /* --------------------------------------------------------------------------
     CARD HTML BUILDER (Official Circular Layout)
     -------------------------------------------------------------------------- */
  renderCircularCard(notice) {
    const isUrgent = notice.priority === 'Urgent';
    const isHigh = notice.priority === 'High';
    const isAcknowledged = this.acknowledgedSet.has(notice.id);
    const isBookmarked = this.bookmarkSet.has(notice.id);
    const deptClass = `dept-${notice.department.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const priorityClass = `priority-${notice.priority.toLowerCase()}`;
    const formattedDate = this.formatDate(notice.issuedAt);
    const inquiriesCount = (notice.comments && notice.comments.length) || 0;
    const acksCount = notice.acknowledgedCount || 0;

    return `
      <article class="notice-item-card ${isUrgent ? 'is-urgent' : ''} ${isHigh ? 'is-high' : ''}" data-id="${notice.id}">
        
        <!-- Header Metadata Bar -->
        <div class="card-header-bar">
          <div class="card-badges-cluster">
            <span class="ref-no-badge">REF: ${this.escapeHTML(notice.refNo)}</span>
            <span class="dept-badge ${deptClass}">${this.escapeHTML(notice.department)}</span>
            <span class="priority-tag ${priorityClass}">${notice.priority === 'Urgent' ? '🚨 URGENT' : notice.priority}</span>
          </div>
          <span class="card-meta-date" title="${notice.issuedAt}">Issued: ${formattedDate}</span>
        </div>

        <!-- Subject Line -->
        <h3 class="card-subject-title">${this.escapeHTML(notice.title)}</h3>

        <!-- Circular Content Body -->
        <div class="card-circular-body">${this.escapeHTML(notice.description)}</div>

        <!-- Secondary Meta: Audience & Attachment -->
        <div class="card-secondary-meta">
          <span class="audience-pill">👥 Target: <strong>${this.escapeHTML(notice.audience)}</strong></span>
          ${notice.attachment ? `
            <div class="attachment-pill-btn" onclick="cnmsApp.openLetterheadModal('${notice.id}')" title="Preview Attached Circular">
              <span>📎</span>
              <span>${this.escapeHTML(notice.attachment)}</span>
            </div>
          ` : ''}
        </div>

        <!-- Signatory Line -->
        <div class="card-signatory-line">
          <span>Authority: <strong>${this.escapeHTML(notice.signatory)}</strong> &bull; Office of Academic Administration</span>
        </div>

        <!-- Official Management Action Bar -->
        <div class="card-management-toolbar">
          <div class="toolbar-left-actions">
            <button 
              type="button" 
              class="action-tool-btn ${isAcknowledged ? 'active-ack' : ''}" 
              data-action="acknowledge" 
              data-id="${notice.id}"
              title="Record read confirmation"
            >
              <span>${isAcknowledged ? '✅ Acknowledged' : '☑️ Acknowledge Receipt'}</span>
              <span>(${acksCount})</span>
            </button>

            <button 
              type="button" 
              class="action-tool-btn" 
              data-action="letterhead" 
              data-id="${notice.id}"
              title="Open formal university circular letterhead with seal"
            >
              <span>📄 Official Letterhead / Print</span>
            </button>

            <button 
              type="button" 
              class="action-tool-btn" 
              data-action="inquiries" 
              data-id="${notice.id}"
              title="View or submit questions on this circular"
            >
              <span>💬 Inquiry Desk (${inquiriesCount})</span>
            </button>

            <button 
              type="button" 
              class="action-tool-btn ${isBookmarked ? 'active-bookmark' : ''}" 
              data-action="bookmark" 
              data-id="${notice.id}"
              title="Pin to your desk"
            >
              <span>🔖 ${isBookmarked ? 'Pinned' : 'Save'}</span>
            </button>
          </div>

          <div class="toolbar-right-actions">
            <button 
              type="button" 
              class="icon-action-btn" 
              data-action="share" 
              data-id="${notice.id}" 
              title="Copy Circular Link & Summary"
            >
              📤
            </button>

            <button 
              type="button" 
              class="icon-action-btn delete-icon" 
              data-action="delete" 
              data-id="${notice.id}" 
              title="Archive / Remove Circular"
            >
              🗑️
            </button>
          </div>
        </div>

      </article>
    `;
  }

  /* --------------------------------------------------------------------------
     FORMATTING HELPERS
     -------------------------------------------------------------------------- */
  formatDate(isoString) {
    if (!isoString) return 'Current Session';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  }

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* --------------------------------------------------------------------------
     TOAST NOTIFICATIONS
     -------------------------------------------------------------------------- */
  showToast(message, type = 'info') {
    if (!this.dom.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    this.dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }
}

// Global initialization
let cnmsApp;
document.addEventListener('DOMContentLoaded', () => {
  cnmsApp = new CampusNotificationManagementSystem();
});
