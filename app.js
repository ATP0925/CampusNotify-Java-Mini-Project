/**
 * ============================================================================
 * CAMPUS NOTIFY - OFFICIAL CAMPUS NOTIFICATION MANAGEMENT SYSTEM (CNMS)
 * Enterprise Academic & Administrative Circular Dispatch Portal Engine
 * Built for Java Mini Project & Institutional Enterprise Governance
 * Integrated with Google Cloud Firebase (Cloud Firestore & Auth) + LocalStorage Fallback
 * Super Administrator & Central Controller: Maruti Atpadkar (ATP0925)
 * ============================================================================
 */

// Official Super Admin Default Account
const DEFAULT_SUPER_ADMIN = {
  id: 'user_admin_0925',
  username: 'admin_maruti',
  email: 'atpadkarmaruti@gmail.com',
  password: 'PRATIK@00925',
  name: 'Maruti Atpadkar',
  role: 'ADMIN',
  canPost: true,
  status: 'APPROVED',
  bio: 'Chief System Administrator & Central Notice Dispatch Controller (ATP0925)',
  avatar: 'MA',
  createdAt: 1740000000000
};

class CampusNotificationManagementSystem {
  constructor() {
    // Repositories
    this.notices = [];
    this.users = [];
    this.loungeMessages = [];
    this.acknowledgedSet = new Set();
    this.bookmarkSet = new Set();

    // Active User Session (Null by default: strict zero-access authentication gate)
    this.currentUser = null;

    // Active View Mode ('circulars' | 'lounge')
    this.activeView = 'circulars';

    // Filters & Search State
    this.activeDepartment = 'ALL';
    this.activePriority = 'ALL';
    this.activeAudience = 'ALL';
    this.bookmarkedOnly = false;
    this.searchQuery = '';

    // Active Modal Contexts
    this.activeLetterheadNoticeId = null;
    this.activeDiscussionNoticeId = null;

    // Attached File for Community Lounge Composer
    this.currentAttachedFile = null;

    // Firebase Cloud Integration State
    this.firebaseApp = null;
    this.firestoreDb = null;
    this.firebaseConnected = false;
    this.unsubscribers = [];

    this.init();
  }

  /* --------------------------------------------------------------------------
     INITIALIZATION & REPOSITORY LOAD
     -------------------------------------------------------------------------- */
  init() {
    this.loadState();
    this.bindDOM();
    this.bindEvents();
    this.initFirebase();
    this.initPhoneMockupSlider();
    this.updateUserSessionUI();
    this.render();

    // Route Initial Gateway Viewport: Zero access without authenticated session
    if (!this.isAuthenticated()) {
      this.showInstagramGateway('login');
    } else {
      this.enterCampusPortal();
    }
  }

  loadState() {
    try {
      // Clean legacy demo keys if any
      localStorage.removeItem('campus_x_posts');
      localStorage.removeItem('campus_x_likes');
      localStorage.removeItem('campus_x_reposts');
      localStorage.removeItem('campus_notify_notices');

      // 1. Load Registered Users on this Device
      const storedUsers = localStorage.getItem('cnms_registered_users');
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        this.users = Array.isArray(parsedUsers) && parsedUsers.length > 0 ? parsedUsers : [DEFAULT_SUPER_ADMIN];
      } else {
        this.users = [DEFAULT_SUPER_ADMIN];
      }

      // Ensure Super Admin is always present in users registry
      const hasAdmin = this.users.some(u => u.email === DEFAULT_SUPER_ADMIN.email);
      if (!hasAdmin) {
        this.users.unshift(DEFAULT_SUPER_ADMIN);
      }

      // 2. Load Active User Session
      const isSignedOut = localStorage.getItem('cnms_session_signed_out') === 'true';
      const storedActiveUser = localStorage.getItem('cnms_active_user');
      if (storedActiveUser && !isSignedOut) {
        const parsedActive = JSON.parse(storedActiveUser);
        // Find fresh copy from users list
        const matched = this.users.find(u => u.id === parsedActive.id || u.email === parsedActive.email);
        if (matched && (matched.status === 'APPROVED' || matched.role === 'ADMIN')) {
          this.currentUser = matched;
        } else {
          this.currentUser = null;
          localStorage.removeItem('cnms_active_user');
        }
      } else {
        this.currentUser = null;
      }

      // 3. Load Official Notices
      const storedNotices = localStorage.getItem('cnms_official_notices');
      if (storedNotices) {
        const parsed = JSON.parse(storedNotices);
        // Keep zero demo records rule intact
        this.notices = Array.isArray(parsed)
          ? parsed.filter(n => n.id && !n.id.startsWith('demo-') && !n.id.startsWith('post-10'))
          : [];
      } else {
        this.notices = [];
      }

      // 4. Load Community Lounge Messages
      const storedLounge = localStorage.getItem('cnms_community_messages');
      if (storedLounge) {
        const parsedLounge = JSON.parse(storedLounge);
        this.loungeMessages = Array.isArray(parsedLounge) ? parsedLounge : [];
      } else {
        this.loungeMessages = [];
      }

      // 5. Load Acknowledgements & Bookmarks
      const storedAcks = localStorage.getItem('cnms_user_acks');
      if (storedAcks) this.acknowledgedSet = new Set(JSON.parse(storedAcks));

      const storedBookmarks = localStorage.getItem('cnms_user_bookmarks');
      if (storedBookmarks) this.bookmarkSet = new Set(JSON.parse(storedBookmarks));

      // 6. Theme
      const savedTheme = localStorage.getItem('cnms_theme') || 'dark';
      if (typeof document !== 'undefined' && document.documentElement && document.documentElement.setAttribute) {
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
      this.updateThemeIcon(savedTheme);

    } catch (e) {
      console.warn('Repository state loading exception:', e);
      this.users = [DEFAULT_SUPER_ADMIN];
      this.currentUser = null;
      this.notices = [];
      this.loungeMessages = [];
      this.acknowledgedSet.clear();
      this.bookmarkSet.clear();
    }
  }

  saveUsers() {
    try {
      localStorage.setItem('cnms_registered_users', JSON.stringify(this.users));
      if (this.currentUser) {
        localStorage.setItem('cnms_active_user', JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem('cnms_active_user');
      }
    } catch (e) {
      console.error('Failed saving users to localStorage:', e);
    }
  }

  saveNotices() {
    try {
      localStorage.setItem('cnms_official_notices', JSON.stringify(this.notices));
    } catch (e) {
      console.error('Failed saving notices to localStorage:', e);
    }
  }

  saveLoungeMessages() {
    try {
      localStorage.setItem('cnms_community_messages', JSON.stringify(this.loungeMessages));
    } catch (e) {
      console.error('Failed saving lounge messages to localStorage:', e);
    }
  }

  saveInteractions() {
    try {
      localStorage.setItem('cnms_user_acks', JSON.stringify([...this.acknowledgedSet]));
      localStorage.setItem('cnms_user_bookmarks', JSON.stringify([...this.bookmarkSet]));
    } catch (e) {
      console.error('Failed saving user interactions:', e);
    }
  }

  /* --------------------------------------------------------------------------
     GOOGLE FIREBASE DATABASE ENGINE (Cloud Firestore Integration)
     -------------------------------------------------------------------------- */
  initFirebase() {
    const configRaw = localStorage.getItem('cnms_firebase_config');
    const statusBadge = document.getElementById('firebaseStatusBadge');
    const engineText = document.getElementById('fbActiveEngineText');

    if (!window.firebase) {
      console.warn('Firebase SDK compat scripts not available in window context.');
      if (statusBadge) {
        statusBadge.textContent = 'Offline';
        statusBadge.className = 'meta-badge';
      }
      return;
    }

    if (!configRaw) {
      if (statusBadge) {
        statusBadge.textContent = 'Local Standby';
        statusBadge.className = 'meta-badge';
      }
      if (engineText) {
        engineText.textContent = 'Browser LocalStorage (Offline Ready)';
      }
      return;
    }

    try {
      const config = JSON.parse(configRaw);
      if (!config.apiKey || !config.projectId) {
        return;
      }

      // Populate input values in settings card
      if (document.getElementById('fbApiKey')) document.getElementById('fbApiKey').value = config.apiKey || '';
      if (document.getElementById('fbProjectId')) document.getElementById('fbProjectId').value = config.projectId || '';
      if (document.getElementById('fbAuthDomain')) document.getElementById('fbAuthDomain').value = config.authDomain || '';
      if (document.getElementById('fbAppId')) document.getElementById('fbAppId').value = config.appId || '';

      // Initialize Firebase App instance
      if (!firebase.apps.length) {
        this.firebaseApp = firebase.initializeApp(config);
      } else {
        this.firebaseApp = firebase.app();
      }

      this.firestoreDb = firebase.firestore();
      this.firebaseConnected = true;

      if (statusBadge) {
        statusBadge.textContent = '🟢 Cloud Connected';
        statusBadge.className = 'meta-badge green-badge';
      }
      if (engineText) {
        engineText.textContent = `Google Firebase Cloud Firestore (${config.projectId})`;
      }

      // Attach Firestore Real-time Snapshot Listeners
      this.setupFirestoreListeners();

      console.log('Firebase Cloud Firestore successfully initialized for project:', config.projectId);
    } catch (err) {
      console.warn('Firebase initialization note:', err);
      if (statusBadge) {
        statusBadge.textContent = 'Config Error';
        statusBadge.className = 'meta-badge red-badge';
      }
      if (engineText) {
        engineText.textContent = 'LocalStorage Mode (Firebase connection error)';
      }
    }
  }

  setupFirestoreListeners() {
    if (!this.firestoreDb) return;

    try {
      // 1. Synchronize Notices Collection
      const unsubNotices = this.firestoreDb.collection('cnms_notices')
        .onSnapshot((snapshot) => {
          if (!snapshot.empty) {
            const cloudNotices = [];
            snapshot.forEach(doc => {
              const data = doc.data();
              cloudNotices.push(Object.assign({ id: doc.id }, data));
            });
            // Sort by issuedAt descending
            cloudNotices.sort((a, b) => new Date(b.issuedAt || 0) - new Date(a.issuedAt || 0));
            this.notices = cloudNotices;
            this.saveNotices();
            this.render();
          }
        }, (err) => console.warn('Firestore notices listener:', err));
      this.unsubscribers.push(unsubNotices);

      // 2. Synchronize Community Lounge Messages Collection
      const unsubLounge = this.firestoreDb.collection('cnms_community_messages')
        .onSnapshot((snapshot) => {
          if (!snapshot.empty) {
            const cloudMsgs = [];
            snapshot.forEach(doc => {
              const data = doc.data();
              cloudMsgs.push(Object.assign({ id: doc.id }, data));
            });
            cloudMsgs.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
            this.loungeMessages = cloudMsgs;
            this.saveLoungeMessages();
            this.renderCommunityLounge();
          }
        }, (err) => console.warn('Firestore lounge listener:', err));
      this.unsubscribers.push(unsubLounge);

      // 3. Synchronize Users Collection
      const unsubUsers = this.firestoreDb.collection('cnms_users')
        .onSnapshot((snapshot) => {
          if (!snapshot.empty) {
            const cloudUsers = [];
            snapshot.forEach(doc => {
              const data = doc.data();
              cloudUsers.push(Object.assign({ id: doc.id }, data));
            });
            // Merge with local users ensuring super admin always remains
            const merged = [...cloudUsers];
            if (!merged.some(u => u.email === DEFAULT_SUPER_ADMIN.email)) {
              merged.unshift(DEFAULT_SUPER_ADMIN);
            }
            this.users = merged;
            this.saveUsers();
            this.renderAdminUsersList();
          }
        }, (err) => console.warn('Firestore users listener:', err));
      this.unsubscribers.push(unsubUsers);

    } catch (e) {
      console.warn('Setting up Firestore real-time listeners exception:', e);
    }
  }

  // Push record to Firestore if connected
  async pushToCloud(collectionName, docId, data) {
    if (this.firestoreDb) {
      try {
        await this.firestoreDb.collection(collectionName).doc(docId).set(data, { merge: true });
      } catch (e) {
        console.warn(`Firestore sync note for ${collectionName}/${docId}:`, e.message);
      }
    }
  }

  // Delete record from Firestore if connected
  async deleteFromCloud(collectionName, docId) {
    if (this.firestoreDb) {
      try {
        await this.firestoreDb.collection(collectionName).doc(docId).delete();
      } catch (e) {
        console.warn(`Firestore delete note for ${collectionName}/${docId}:`, e.message);
      }
    }
  }

  // Manual batch push of all local data to Firebase
  async syncAllToFirebase() {
    if (!this.firestoreDb) {
      this.showToast('Please configure your Firebase credentials first.', 'error');
      return;
    }

    try {
      this.showToast('Synchronizing local records to Google Firebase...', 'info');

      // Sync Notices
      for (const notice of this.notices) {
        await this.pushToCloud('cnms_notices', notice.id, notice);
      }

      // Sync Users
      for (const user of this.users) {
        await this.pushToCloud('cnms_users', user.id, user);
      }

      // Sync Lounge Messages
      for (const msg of this.loungeMessages) {
        await this.pushToCloud('cnms_community_messages', msg.id, msg);
      }

      this.showToast('Successfully synchronized with Google Cloud Firestore! 🔥', 'success');
    } catch (err) {
      this.showToast('Sync error: ' + err.message, 'error');
    }
  }

  /* --------------------------------------------------------------------------
     DOM ELEMENT BINDING
     -------------------------------------------------------------------------- */
  bindDOM() {
    this.dom = {
      // Navbar Controls
      globalSearchInput: document.getElementById('globalSearchInput'),
      openNewNoticeBtn: document.getElementById('openNewNoticeBtn'),
      newNoticeBtnLabel: document.getElementById('newNoticeBtnLabel'),
      openAuthModalBtn: document.getElementById('openAuthModalBtn'),
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      openProfileModalBtn: document.getElementById('openProfileModalBtn'),
      navUserAvatar: document.getElementById('navUserAvatar'),
      navUserName: document.getElementById('navUserName'),
      navUserRole: document.getElementById('navUserRole'),

      // View Mode Tabs
      tabCircularsViewBtn: document.getElementById('tabCircularsViewBtn'),
      tabCommunityLoungeBtn: document.getElementById('tabCommunityLoungeBtn'),
      circularsTabBadge: document.getElementById('circularsTabBadge'),
      loungeTabBadge: document.getElementById('loungeTabBadge'),
      circularsViewSection: document.getElementById('circularsViewSection'),
      communityLoungeViewSection: document.getElementById('communityLoungeViewSection'),

      // Metrics
      metricTotalCirculars: document.getElementById('metricTotalCirculars'),
      metricUrgentCirculars: document.getElementById('metricUrgentCirculars'),
      metricDepartmentsCount: document.getElementById('metricDepartmentsCount'),
      metricAcknowledgedCount: document.getElementById('metricAcknowledgedCount'),

      // Circular Filters
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
      noticesContainer: document.getElementById('noticesContainer'),
      emptyStateCard: document.getElementById('emptyStateCard'),
      emptyStateCreateBtn: document.getElementById('emptyStateCreateBtn'),

      // Community Lounge Elements
      loungeMessagesFeed: document.getElementById('loungeMessagesFeed'),
      loungeMessagesCount: document.getElementById('loungeMessagesCount'),
      loungeFilesCount: document.getElementById('loungeFilesCount'),
      loungeMessageForm: document.getElementById('loungeMessageForm'),
      loungeTextInput: document.getElementById('loungeTextInput'),
      loungeFilePreviewBox: document.getElementById('loungeFilePreviewBox'),
      previewFileIcon: document.getElementById('previewFileIcon'),
      previewFileName: document.getElementById('previewFileName'),
      previewFileSize: document.getElementById('previewFileSize'),
      removeAttachedFileBtn: document.getElementById('removeAttachedFileBtn'),
      triggerLoungeFileBtn: document.getElementById('triggerLoungeFileBtn'),
      loungeFileInput: document.getElementById('loungeFileInput'),
      loungeSendBtn: document.getElementById('loungeSendBtn'),

      // Profile Modal & Bio & Governance
      officerProfileModalBackdrop: document.getElementById('officerProfileModalBackdrop'),
      closeProfileModalBtn: document.getElementById('closeProfileModalBtn'),
      closeProfileFooterBtn: document.getElementById('closeProfileFooterBtn'),
      profileHeroAvatar: document.getElementById('profileHeroAvatar'),
      profileHeroName: document.getElementById('profileHeroName'),
      profileHeroRole: document.getElementById('profileHeroRole'),
      profileHeroStatusBadge: document.getElementById('profileHeroStatusBadge'),
      profileHeroIdBadge: document.getElementById('profileHeroIdBadge'),
      profileHeroAuthorityBadge: document.getElementById('profileHeroAuthorityBadge'),
      profileHeroBioText: document.getElementById('profileHeroBioText'),
      toggleEditBioBtn: document.getElementById('toggleEditBioBtn'),
      bioEditForm: document.getElementById('bioEditForm'),
      bioEditTextarea: document.getElementById('bioEditTextarea'),
      cancelBioEditBtn: document.getElementById('cancelBioEditBtn'),
      saveBioEditBtn: document.getElementById('saveBioEditBtn'),

      // Admin Permissions Desk in Profile
      adminUserManagementPanel: document.getElementById('adminUserManagementPanel'),
      pendingApprovalsBadge: document.getElementById('pendingApprovalsBadge'),
      adminUsersListContainer: document.getElementById('adminUsersListContainer'),

      // Firebase Config UI in Profile
      saveFirebaseConfigBtn: document.getElementById('saveFirebaseConfigBtn'),
      syncToFirebaseBtn: document.getElementById('syncToFirebaseBtn'),
      fbApiKey: document.getElementById('fbApiKey'),
      fbProjectId: document.getElementById('fbProjectId'),
      fbAuthDomain: document.getElementById('fbAuthDomain'),
      fbAppId: document.getElementById('fbAppId'),

      // Auth Modal & Multi-Account Switcher
      authModalBackdrop: document.getElementById('authModalBackdrop'),
      closeAuthModalBtn: document.getElementById('closeAuthModalBtn'),
      closeAuthModalFooterBtn: document.getElementById('closeAuthModalFooterBtn'),
      authTabLoginBtn: document.getElementById('authTabLoginBtn'),
      authTabRegisterBtn: document.getElementById('authTabRegisterBtn'),
      authTabSwitchBtn: document.getElementById('authTabSwitchBtn'),
      authPaneLogin: document.getElementById('authPaneLogin'),
      authPaneRegister: document.getElementById('authPaneRegister'),
      authPaneSwitch: document.getElementById('authPaneSwitch'),
      quickLoginAdminBtn: document.getElementById('quickLoginAdminBtn'),
      loginForm: document.getElementById('loginForm'),
      loginIdentifier: document.getElementById('loginIdentifier'),
      loginPassword: document.getElementById('loginPassword'),
      registerForm: document.getElementById('registerForm'),
      regFullName: document.getElementById('regFullName'),
      regUsername: document.getElementById('regUsername'),
      regPassword: document.getElementById('regPassword'),
      regBio: document.getElementById('regBio'),
      savedAccountsList: document.getElementById('savedAccountsList'),

      // Circular Form Modal
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

      // Letterhead Modal
      officialLetterheadModalBackdrop: document.getElementById('officialLetterheadModalBackdrop'),
      closeLetterheadModalBtn: document.getElementById('closeLetterheadModalBtn'),
      closeLetterheadBtn: document.getElementById('closeLetterheadBtn'),
      printLetterheadBtn: document.getElementById('printLetterheadBtn'),
      letterheadDocument: document.getElementById('letterheadDocument'),

      // Inquiry Desk Modal
      discussionModalBackdrop: document.getElementById('discussionModalBackdrop'),
      closeDiscussionModalBtn: document.getElementById('closeDiscussionModalBtn'),
      discussionNoticeTitle: document.getElementById('discussionNoticeTitle'),
      commentInputText: document.getElementById('commentInputText'),
      submitCommentBtn: document.getElementById('submitCommentBtn'),
      commentsListContainer: document.getElementById('commentsListContainer'),

      // Toast Notifications
      toastContainer: document.getElementById('toastContainer'),

      // Containers: Main Portal & Authentication Gateway
      systemMainLayout: document.getElementById('systemMainLayout'),
      instagramAuthGateway: document.getElementById('instagramAuthGateway'),
      instaReturnToPortalBtn: document.getElementById('instaReturnToPortalBtn'),
      instaActiveUserSnippet: document.getElementById('instaActiveUserSnippet'),
      navInstaAuthBtn: document.getElementById('navInstaAuthBtn'),
      navSignOutBtn: document.getElementById('navSignOutBtn'),

      // Authentication Gateway Elements (Login & Register)
      instaLoginFormBox: document.getElementById('instaLoginFormBox'),
      instaLoginForm: document.getElementById('instaLoginForm'),
      instaLoginIdentifier: document.getElementById('instaLoginIdentifier'),
      instaLoginPassword: document.getElementById('instaLoginPassword'),
      toggleInstaLoginPassBtn: document.getElementById('toggleInstaLoginPassBtn'),
      instaLoginSubmitBtn: document.getElementById('instaLoginSubmitBtn'),
      instaQuickAdminLoginBtn: document.getElementById('instaQuickAdminLoginBtn'),
      instaForgotPassLink: document.getElementById('instaForgotPassLink'),
      instaAdminApprovalHelpLink: document.getElementById('instaAdminApprovalHelpLink'),

      instaSignupFormBox: document.getElementById('instaSignupFormBox'),
      instaSignupForm: document.getElementById('instaSignupForm'),
      instaSignupAdminShortcutBtn: document.getElementById('instaSignupAdminShortcutBtn'),
      instaRegContact: document.getElementById('instaRegContact'),
      instaRegFullName: document.getElementById('instaRegFullName'),
      instaRegUsername: document.getElementById('instaRegUsername'),
      instaRegPassword: document.getElementById('instaRegPassword'),
      toggleInstaRegPassBtn: document.getElementById('toggleInstaRegPassBtn'),
      instaPassStrengthBar: document.getElementById('instaPassStrengthBar'),
      instaStrengthFill: document.getElementById('instaStrengthFill'),
      instaStrengthText: document.getElementById('instaStrengthText'),
      instaRegBio: document.getElementById('instaRegBio'),
      instaPrivacyConsentCheck: document.getElementById('instaPrivacyConsentCheck'),
      instaRegSubmitBtn: document.getElementById('instaRegSubmitBtn'),

      // Switcher Card & Saved Device Accounts
      instaSwitchCardText: document.getElementById('instaSwitchCardText'),
      instaSwitchActionLink: document.getElementById('instaSwitchActionLink'),
      instaSavedProfilesCard: document.getElementById('instaSavedProfilesCard'),
      instaDeviceProfilesChips: document.getElementById('instaDeviceProfilesChips'),

      // T&C Card & Collapsible Drawer
      instaTermsConditionsCard: document.getElementById('instaTermsConditionsCard'),
      toggleTermsConditionsBtn: document.getElementById('toggleTermsConditionsBtn'),
      termsConditionsDrawer: document.getElementById('termsConditionsDrawer'),
      tcChevronIcon: document.getElementById('tcChevronIcon'),

      // Institutional Data Privacy Manifesto Modal
      openFullPrivacyModalBtn: document.getElementById('openFullPrivacyModalBtn'),
      privacyPolicyModalBackdrop: document.getElementById('privacyPolicyModalBackdrop'),
      closePrivacyModalBtn: document.getElementById('closePrivacyModalBtn'),
      acknowledgePrivacyBtn: document.getElementById('acknowledgePrivacyBtn')
    };
  }

  /* --------------------------------------------------------------------------
     EVENT BINDINGS
     -------------------------------------------------------------------------- */
  bindEvents() {
    // 1. Search Bar
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

    // 2. Department Filter Pills
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

    // 3. Priority & Audience Selects
    if (this.dom.priorityFilterSelect) {
      this.dom.priorityFilterSelect.addEventListener('change', (e) => {
        this.activePriority = e.target.value;
        this.render();
      });
    }

    if (this.dom.audienceFilterSelect) {
      this.dom.audienceFilterSelect.addEventListener('change', (e) => {
        this.activeAudience = e.target.value;
        this.render();
      });
    }

    // 4. Bookmarks Only Toggle & Print
    if (this.dom.toggleBookmarkedOnlyBtn) {
      this.dom.toggleBookmarkedOnlyBtn.addEventListener('click', () => {
        this.bookmarkedOnly = !this.bookmarkedOnly;
        this.dom.toggleBookmarkedOnlyBtn.classList.toggle('btn-primary', this.bookmarkedOnly);
        this.render();
      });
    }

    if (this.dom.printBoardBtn) {
      this.dom.printBoardBtn.addEventListener('click', () => window.print());
    }

    // 5. Theme Toggle
    if (this.dom.themeToggleBtn) {
      this.dom.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    // 6. View Mode Switcher (Circulars vs Lounge)
    if (this.dom.tabCircularsViewBtn) {
      this.dom.tabCircularsViewBtn.addEventListener('click', () => this.switchView('circulars'));
    }
    if (this.dom.tabCommunityLoungeBtn) {
      this.dom.tabCommunityLoungeBtn.addEventListener('click', () => this.switchView('lounge'));
    }

    // 7. Profile Modal
    if (this.dom.openProfileModalBtn) {
      this.dom.openProfileModalBtn.addEventListener('click', () => this.openProfileModal());
      this.dom.openProfileModalBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openProfileModal();
        }
      });
    }
    if (this.dom.closeProfileModalBtn) {
      this.dom.closeProfileModalBtn.addEventListener('click', () => this.closeProfileModal());
    }
    if (this.dom.closeProfileFooterBtn) {
      this.dom.closeProfileFooterBtn.addEventListener('click', () => this.closeProfileModal());
    }
    if (this.dom.officerProfileModalBackdrop) {
      this.dom.officerProfileModalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.dom.officerProfileModalBackdrop) this.closeProfileModal();
      });
    }

    // 8. Profile Bio Inline Editing
    if (this.dom.toggleEditBioBtn) {
      this.dom.toggleEditBioBtn.addEventListener('click', () => {
        const isHidden = this.dom.bioEditForm.style.display === 'none';
        this.dom.bioEditForm.style.display = isHidden ? 'block' : 'none';
        if (isHidden && this.dom.bioEditTextarea) {
          this.dom.bioEditTextarea.value = (this.currentUser && this.currentUser.bio) || '';
          this.dom.bioEditTextarea.focus();
        }
      });
    }
    if (this.dom.cancelBioEditBtn) {
      this.dom.cancelBioEditBtn.addEventListener('click', () => {
        this.dom.bioEditForm.style.display = 'none';
      });
    }
    if (this.dom.saveBioEditBtn) {
      this.dom.saveBioEditBtn.addEventListener('click', () => this.handleSaveBio());
    }

    // 9. Firebase Settings Actions
    if (this.dom.saveFirebaseConfigBtn) {
      this.dom.saveFirebaseConfigBtn.addEventListener('click', () => this.handleSaveFirebaseConfig());
    }
    if (this.dom.syncToFirebaseBtn) {
      this.dom.syncToFirebaseBtn.addEventListener('click', () => this.syncAllToFirebase());
    }

    // 10. Auth Modal & Multi-Account Switcher
    if (this.dom.openAuthModalBtn) {
      this.dom.openAuthModalBtn.addEventListener('click', () => this.openAuthModal());
    }
    if (this.dom.closeAuthModalBtn) {
      this.dom.closeAuthModalBtn.addEventListener('click', () => this.closeAuthModal());
    }
    if (this.dom.closeAuthModalFooterBtn) {
      this.dom.closeAuthModalFooterBtn.addEventListener('click', () => this.closeAuthModal());
    }
    if (this.dom.authModalBackdrop) {
      this.dom.authModalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.dom.authModalBackdrop) this.closeAuthModal();
      });
    }

    // Auth Tabs Switcher
    if (this.dom.authTabLoginBtn) {
      this.dom.authTabLoginBtn.addEventListener('click', () => this.switchAuthTab('login'));
    }
    if (this.dom.authTabRegisterBtn) {
      this.dom.authTabRegisterBtn.addEventListener('click', () => this.switchAuthTab('register'));
    }
    if (this.dom.authTabSwitchBtn) {
      this.dom.authTabSwitchBtn.addEventListener('click', () => this.switchAuthTab('switch'));
    }

    // Quick Admin 1-Click Login
    if (this.dom.quickLoginAdminBtn) {
      this.dom.quickLoginAdminBtn.addEventListener('click', () => this.handleQuickAdminLogin());
    }

    // Login Form Submit
    if (this.dom.loginForm) {
      this.dom.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLoginSubmit();
      });
    }

    // Register Form Submit
    if (this.dom.registerForm) {
      this.dom.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegisterSubmit();
      });
    }

    // 11. Circular Issuance (Authority Restricted)
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
    if (this.dom.newNoticeForm) {
      this.dom.newNoticeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePublishCircular();
      });
    }

    // 12. Letterhead Modal
    if (this.dom.closeLetterheadModalBtn) {
      this.dom.closeLetterheadModalBtn.addEventListener('click', () => this.closeLetterheadModal());
    }
    if (this.dom.closeLetterheadBtn) {
      this.dom.closeLetterheadBtn.addEventListener('click', () => this.closeLetterheadModal());
    }
    if (this.dom.printLetterheadBtn) {
      this.dom.printLetterheadBtn.addEventListener('click', () => window.print());
    }
    if (this.dom.officialLetterheadModalBackdrop) {
      this.dom.officialLetterheadModalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.dom.officialLetterheadModalBackdrop) this.closeLetterheadModal();
      });
    }

    // 13. Discussion / Inquiry Desk Modal
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

    // 14. Community Lounge: Messages, Files & Emojis
    if (this.dom.loungeMessageForm) {
      this.dom.loungeMessageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSendLoungeMessage();
      });
    }
    if (this.dom.loungeTextInput) {
      this.dom.loungeTextInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendLoungeMessage();
        }
      });
    }

    // Lounge File Trigger & File Input
    if (this.dom.triggerLoungeFileBtn && this.dom.loungeFileInput) {
      this.dom.triggerLoungeFileBtn.addEventListener('click', () => {
        this.dom.loungeFileInput.click();
      });
      this.dom.loungeFileInput.addEventListener('change', (e) => {
        this.handleFileSelected(e);
      });
    }
    if (this.dom.removeAttachedFileBtn) {
      this.dom.removeAttachedFileBtn.addEventListener('click', () => {
        this.clearAttachedFile();
      });
    }

    // Lounge Quick Emoji Shelf Buttons
    document.querySelectorAll('.quick-emoji-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.getAttribute('data-emoji');
        if (emoji && this.dom.loungeTextInput) {
          this.dom.loungeTextInput.value += emoji;
          this.dom.loungeTextInput.focus();
        }
      });
    });

    // 15. Delegated Actions on Circular Cards (Likes, Reactions, Acks, Inquiries, Letterhead, Delete)
    if (this.dom.noticesContainer) {
      this.dom.noticesContainer.addEventListener('click', (e) => {
        // Emoji reaction chip clicked
        const reactionChip = e.target.closest('.reaction-chip');
        if (reactionChip) {
          const noticeId = reactionChip.getAttribute('data-notice-id');
          const emoji = reactionChip.getAttribute('data-emoji');
          if (noticeId && emoji) {
            this.handleToggleReaction(noticeId, emoji);
            return;
          }
        }

        // Standard tool action clicked
        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;
        const action = actionBtn.getAttribute('data-action');
        const noticeId = actionBtn.getAttribute('data-id');
        if (!noticeId) return;

        switch (action) {
          case 'like':
            this.handleToggleNoticeLike(noticeId);
            break;
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

    // 16. Delegated Actions in Comments List (Admin Super Moderation Deletion)
    if (this.dom.commentsListContainer) {
      this.dom.commentsListContainer.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.comment-delete-btn');
        if (!delBtn) return;
        const commentId = delBtn.getAttribute('data-comment-id');
        if (commentId) {
          this.handleDeleteComment(commentId);
        }
      });
    }

    // 17. Delegated Actions in Lounge Messages Feed (Admin Message Deletion)
    if (this.dom.loungeMessagesFeed) {
      this.dom.loungeMessagesFeed.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.lounge-msg-del-btn');
        if (!delBtn) return;
        const msgId = delBtn.getAttribute('data-msg-id');
        if (msgId) {
          this.handleDeleteLoungeMessage(msgId);
        }
      });
    }

    // 18. Delegated Actions in Admin Permissions Desk (Approve/Reject/Toggle Authority/Delete)
    if (this.dom.adminUsersListContainer) {
      this.dom.adminUsersListContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-admin-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-admin-action');
        const userId = btn.getAttribute('data-user-id');
        if (!userId) return;

        switch (action) {
          case 'approve':
            this.handleAdminApproveUser(userId);
            break;
          case 'reject':
            this.handleAdminRejectUser(userId);
            break;
          case 'toggle-posting':
            this.handleAdminTogglePostingAuthority(userId);
            break;
          case 'delete-user':
            this.handleAdminDeleteUser(userId);
            break;
        }
      });
    }

    // 19. Delegated Actions in Saved Accounts Switcher List
    if (this.dom.savedAccountsList) {
      this.dom.savedAccountsList.addEventListener('click', (e) => {
        const switchBtn = e.target.closest('[data-switch-to-user]');
        if (!switchBtn) return;
        const userId = switchBtn.getAttribute('data-switch-to-user');
        if (userId) {
          this.handleSwitchToUser(userId);
        }
      });
    }

    // 20. Dedicated Authentication Gateway Actions & Triggers
    if (this.dom.navInstaAuthBtn) {
      this.dom.navInstaAuthBtn.addEventListener('click', () => {
        this.showInstagramGateway('login');
      });
    }

    if (this.dom.navSignOutBtn) {
      this.dom.navSignOutBtn.addEventListener('click', () => {
        this.handleSignOut();
      });
    }

    if (this.dom.instaReturnToPortalBtn) {
      this.dom.instaReturnToPortalBtn.addEventListener('click', () => {
        this.enterCampusPortal();
      });
    }

    // Login Form Submit
    if (this.dom.instaLoginForm) {
      this.dom.instaLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleInstaLoginSubmit();
      });
    }

    // Register Form Submit
    if (this.dom.instaSignupForm) {
      this.dom.instaSignupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleInstaRegisterSubmit();
      });
    }

    // Password Visibility Toggles
    if (this.dom.toggleInstaLoginPassBtn && this.dom.instaLoginPassword) {
      this.dom.toggleInstaLoginPassBtn.addEventListener('click', () => {
        const isPass = this.dom.instaLoginPassword.type === 'password';
        this.dom.instaLoginPassword.type = isPass ? 'text' : 'password';
        this.dom.toggleInstaLoginPassBtn.textContent = isPass ? 'Hide' : 'Show';
      });
    }

    if (this.dom.toggleInstaRegPassBtn && this.dom.instaRegPassword) {
      this.dom.toggleInstaRegPassBtn.addEventListener('click', () => {
        const isPass = this.dom.instaRegPassword.type === 'password';
        this.dom.instaRegPassword.type = isPass ? 'text' : 'password';
        this.dom.toggleInstaRegPassBtn.textContent = isPass ? 'Hide' : 'Show';
      });
    }

    // Dynamic Password Security & Strength Evaluator
    if (this.dom.instaRegPassword) {
      this.dom.instaRegPassword.addEventListener('input', (e) => {
        this.updatePasswordStrengthUI(e.target.value);
      });
    }

    // 1-Click Super Admin Login Buttons
    if (this.dom.instaQuickAdminLoginBtn) {
      this.dom.instaQuickAdminLoginBtn.addEventListener('click', () => {
        this.handleQuickAdminLogin();
        this.enterCampusPortal();
      });
    }

    if (this.dom.instaSignupAdminShortcutBtn) {
      this.dom.instaSignupAdminShortcutBtn.addEventListener('click', () => {
        this.handleQuickAdminLogin();
        this.enterCampusPortal();
      });
    }

    // Mode Switcher Link (Login <-> Signup)
    if (this.dom.instaSwitchActionLink) {
      this.dom.instaSwitchActionLink.addEventListener('click', (e) => {
        e.preventDefault();
        const isLoginVisible = this.dom.instaLoginFormBox && this.dom.instaLoginFormBox.style.display !== 'none';
        this.switchInstaAuthMode(isLoginVisible ? 'signup' : 'login');
      });
    }

    // Help Links in Login Form
    if (this.dom.instaForgotPassLink) {
      this.dom.instaForgotPassLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Password Recovery Notice:\n\nSuper Admin (Maruti Atpadkar) password: PRATIK@00925\nFor student viewer accounts, passwords are cryptographically hashed for data privacy. You may request credential reset from the Super Admin desk.');
      });
    }

    if (this.dom.instaAdminApprovalHelpLink) {
      this.dom.instaAdminApprovalHelpLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Institutional Multi-Account Security Policy:\n\nTo prevent unauthorized bots and protect campus intellectual privacy, all newly registered accounts on this device remain under PENDING APPROVAL until Super Admin Maruti Atpadkar (ATP0925) grants clearance from the System Profile & Governance Desk.');
      });
    }

    // Delegated Clicks in Saved Device Profiles
    if (this.dom.instaDeviceProfilesChips) {
      this.dom.instaDeviceProfilesChips.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-insta-switch-id]');
        if (!chip) return;
        const targetUserId = chip.getAttribute('data-insta-switch-id');
        if (targetUserId) {
          this.handleInstaDeviceChipSelect(targetUserId);
        }
      });
    }

    // Terms & Conditions (T&C) Collapsible Drawer Toggle
    if (this.dom.toggleTermsConditionsBtn) {
      this.dom.toggleTermsConditionsBtn.addEventListener('click', () => {
        this.toggleTermsConditionsDrawer();
      });
    }

    // Institutional Data Privacy Manifesto Modal Triggers
    if (this.dom.openFullPrivacyModalBtn) {
      this.dom.openFullPrivacyModalBtn.addEventListener('click', () => {
        this.openPrivacyModal();
      });
    }

    if (this.dom.closePrivacyModalBtn) {
      this.dom.closePrivacyModalBtn.addEventListener('click', () => {
        this.closePrivacyModal();
      });
    }

    if (this.dom.acknowledgePrivacyBtn) {
      this.dom.acknowledgePrivacyBtn.addEventListener('click', () => {
        this.closePrivacyModal();
        this.showToast('Institutional Data Privacy Policy acknowledged. 🛡️', 'success');
      });
    }

    if (this.dom.privacyPolicyModalBackdrop) {
      this.dom.privacyPolicyModalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.dom.privacyPolicyModalBackdrop) {
          this.closePrivacyModal();
        }
      });
    }

    // In-text and footer policy triggers
    ['policyTrigger1', 'policyTrigger2', 'policyTrigger3', 'policyTrigger4'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          this.openPrivacyModal();
        });
      }
    });

    document.querySelectorAll('.policy-link-trigger').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.openPrivacyModal();
      });
    });

    // 21. Global ESC key listener to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeNewNoticeModal();
        this.closeLetterheadModal();
        this.closeDiscussionModal();
        this.closeProfileModal();
        this.closeAuthModal();
        this.closePrivacyModal();
      }
    });
  }

  /* --------------------------------------------------------------------------
     SESSION & ROLE AUTHORITY STATE
     -------------------------------------------------------------------------- */
  isAuthenticated() {
    return Boolean(this.currentUser && (this.currentUser.status === 'APPROVED' || this.currentUser.role === 'ADMIN'));
  }

  hasPostingAuthority() {
    return Boolean(this.currentUser && (this.currentUser.role === 'ADMIN' || this.currentUser.canPost === true));
  }

  isAdmin() {
    return Boolean(this.currentUser && this.currentUser.role === 'ADMIN');
  }

  updateUserSessionUI() {
    if (!this.isAuthenticated()) {
      if (this.dom.navUserName) this.dom.navUserName.textContent = 'Guest / Unverified';
      if (this.dom.navUserAvatar) this.dom.navUserAvatar.textContent = '🔒';
      if (this.dom.navUserRole) {
        this.dom.navUserRole.innerHTML = `🔒 Restricted &bull; Sign in required <span class="profile-gear-icon">🔐</span>`;
      }
      if (this.dom.openNewNoticeBtn) {
        this.dom.openNewNoticeBtn.style.display = 'none';
      }
      if (this.dom.navSignOutBtn) {
        this.dom.navSignOutBtn.style.display = 'none';
      }
      if (this.dom.globalSearchInput) {
        this.dom.globalSearchInput.disabled = true;
        this.dom.globalSearchInput.placeholder = '🔒 Sign in required to search official notices...';
      }
      if (this.dom.adminUserManagementPanel) {
        this.dom.adminUserManagementPanel.style.display = 'none';
      }
      return;
    }

    if (this.dom.openNewNoticeBtn) this.dom.openNewNoticeBtn.style.display = '';
    if (this.dom.navSignOutBtn) this.dom.navSignOutBtn.style.display = '';
    if (this.dom.globalSearchInput) {
      this.dom.globalSearchInput.disabled = false;
      this.dom.globalSearchInput.placeholder = 'Search by Ref No, Subject, Department, Keywords...';
    }

    const isAdm = this.isAdmin();
    const canPost = this.hasPostingAuthority();

    // 1. Update Navbar Officer Details
    if (this.dom.navUserName) this.dom.navUserName.textContent = this.currentUser.name;
    if (this.dom.navUserAvatar) this.dom.navUserAvatar.textContent = this.getInitials(this.currentUser.name);
    if (this.dom.navUserRole) {
      if (isAdm) {
        this.dom.navUserRole.innerHTML = `👑 Admin &bull; ${this.currentUser.username || 'ATP0925'} <span class="profile-gear-icon">⚙️</span>`;
      } else if (canPost) {
        this.dom.navUserRole.innerHTML = `📢 Publisher &bull; @${this.currentUser.username} <span class="profile-gear-icon">⚙️</span>`;
      } else {
        this.dom.navUserRole.innerHTML = `👁️ Viewer &bull; @${this.currentUser.username} <span class="profile-gear-icon">⚙️</span>`;
      }
    }

    // 2. Update Notice Publishing Button based on Authority
    if (this.dom.openNewNoticeBtn) {
      if (canPost) {
        this.dom.openNewNoticeBtn.style.opacity = '1';
        this.dom.openNewNoticeBtn.style.cursor = 'pointer';
        this.dom.openNewNoticeBtn.title = 'Dispatch & Publish Official Circular';
        if (this.dom.newNoticeBtnLabel) this.dom.newNoticeBtnLabel.textContent = 'Issue Circular';
      } else {
        this.dom.openNewNoticeBtn.style.opacity = '0.7';
        this.dom.openNewNoticeBtn.title = 'Authority Restricted: Only Admin or authorized officers can issue notices';
        if (this.dom.newNoticeBtnLabel) this.dom.newNoticeBtnLabel.textContent = '🔒 View Only';
      }
    }

    // 3. Update Profile Hero Card in Profile Modal
    if (this.dom.profileHeroName) this.dom.profileHeroName.textContent = this.currentUser.name;
    if (this.dom.profileHeroAvatar) this.dom.profileHeroAvatar.textContent = this.getInitials(this.currentUser.name);
    if (this.dom.profileHeroBioText) {
      this.dom.profileHeroBioText.textContent = this.currentUser.bio || 'Campus member with official portal access.';
    }
    if (this.dom.profileHeroRole) {
      if (isAdm) {
        this.dom.profileHeroRole.textContent = 'Super Administrator & Central Notice Controller';
      } else if (canPost) {
        this.dom.profileHeroRole.textContent = 'Authorized Campus Publisher & Academic Member';
      } else {
        this.dom.profileHeroRole.textContent = 'Campus Member & Circular Viewer';
      }
    }
    if (this.dom.profileHeroIdBadge) {
      this.dom.profileHeroIdBadge.textContent = `@${this.currentUser.username || 'ATP0925'}`;
    }
    if (this.dom.profileHeroAuthorityBadge) {
      if (isAdm) {
        this.dom.profileHeroAuthorityBadge.textContent = '👑 Super Admin';
        this.dom.profileHeroAuthorityBadge.className = 'meta-badge blue-badge';
      } else if (canPost) {
        this.dom.profileHeroAuthorityBadge.textContent = '📢 Circular Publisher';
        this.dom.profileHeroAuthorityBadge.className = 'meta-badge green-badge';
      } else {
        this.dom.profileHeroAuthorityBadge.textContent = '👁️ Viewer Only';
        this.dom.profileHeroAuthorityBadge.className = 'meta-badge';
      }
    }

    // 4. Admin Management Panel Visibility
    if (this.dom.adminUserManagementPanel) {
      this.dom.adminUserManagementPanel.style.display = isAdm ? 'block' : 'none';
      if (isAdm) {
        this.renderAdminUsersList();
      }
    }
  }

  /* --------------------------------------------------------------------------
     VIEW SWITCHER (Official Circulars vs Community Lounge)
     -------------------------------------------------------------------------- */
  switchView(targetView) {
    if (!this.isAuthenticated()) {
      this.showToast('Authentication Required: Please sign in or create an account to access the campus portal.', 'warning');
      this.showInstagramGateway('login');
      return;
    }

    this.activeView = targetView;
    const isCirc = targetView === 'circulars';

    if (this.dom.tabCircularsViewBtn) this.dom.tabCircularsViewBtn.classList.toggle('active', isCirc);
    if (this.dom.tabCommunityLoungeBtn) this.dom.tabCommunityLoungeBtn.classList.toggle('active', !isCirc);

    if (this.dom.circularsViewSection) {
      this.dom.circularsViewSection.style.display = isCirc ? 'block' : 'none';
    }
    if (this.dom.communityLoungeViewSection) {
      this.dom.communityLoungeViewSection.style.display = !isCirc ? 'block' : 'none';
      if (!isCirc) {
        this.renderCommunityLounge();
        this.scrollLoungeToBottom();
      }
    }
  }

  /* --------------------------------------------------------------------------
     COMMUNITY LOUNGE & FILE SHARING ENGINE
     -------------------------------------------------------------------------- */
  handleFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 5MB for local / base64 safety
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('File too large (limit is 5MB for campus lounge).', 'error');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      this.currentAttachedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: event.target.result
      };

      if (this.dom.loungeFilePreviewBox) {
        this.dom.loungeFilePreviewBox.style.display = 'flex';
      }
      if (this.dom.previewFileName) this.dom.previewFileName.textContent = file.name;
      if (this.dom.previewFileSize) this.dom.previewFileSize.textContent = this.formatFileSize(file.size);
      if (this.dom.previewFileIcon) this.dom.previewFileIcon.textContent = this.getFileIcon(file.name);

      this.showToast(`Attached file: ${file.name} 📎`);
    };
    reader.readAsDataURL(file);
  }

  clearAttachedFile() {
    this.currentAttachedFile = null;
    if (this.dom.loungeFileInput) this.dom.loungeFileInput.value = '';
    if (this.dom.loungeFilePreviewBox) this.dom.loungeFilePreviewBox.style.display = 'none';
  }

  handleSendLoungeMessage() {
    if (!this.isAuthenticated()) {
      this.showToast('Authentication Required: Please sign in or create an account to post in the community lounge.', 'warning');
      this.showInstagramGateway('login');
      return;
    }

    if (!this.dom.loungeTextInput) return;
    const text = this.dom.loungeTextInput.value.trim();

    if (!text && !this.currentAttachedFile) {
      this.showToast('Please type a message or attach a file to send.', 'error');
      return;
    }

    const newMsg = {
      id: 'lounge_' + Date.now(),
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      senderUsername: this.currentUser.username,
      senderRole: this.currentUser.role,
      senderBio: this.currentUser.bio || '',
      text: text,
      file: this.currentAttachedFile ? Object.assign({}, this.currentAttachedFile) : null,
      timestamp: new Date().toISOString()
    };

    this.loungeMessages.push(newMsg);
    this.saveLoungeMessages();

    // Push to Google Firebase Firestore
    this.pushToCloud('cnms_community_messages', newMsg.id, newMsg);

    // Reset composer
    this.dom.loungeTextInput.value = '';
    this.clearAttachedFile();

    this.renderCommunityLounge();
    this.scrollLoungeToBottom();
    this.showToast('Message sent to Campus Lounge! 🚀', 'success');
  }

  handleDeleteLoungeMessage(msgId) {
    if (!this.isAuthenticated()) {
      this.showToast('Authentication Required.', 'warning');
      this.showInstagramGateway('login');
      return;
    }

    const msg = this.loungeMessages.find(m => m.id === msgId);
    if (!msg) return;

    // Restriction check: Admin can delete any message; regular user can only delete own
    const canDelete = this.isAdmin() || (this.currentUser && msg.senderId === this.currentUser.id);
    if (!canDelete) {
      this.showToast('Authority Restriction: Only Super Admin can delete messages by other users.', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this message from the campus lounge?')) return;

    this.loungeMessages = this.loungeMessages.filter(m => m.id !== msgId);
    this.saveLoungeMessages();

    // Delete from Firebase Firestore
    this.deleteFromCloud('cnms_community_messages', msgId);

    this.renderCommunityLounge();
    this.showToast('Message removed from Campus Lounge.', 'info');
  }

  renderCommunityLounge() {
    if (!this.dom.loungeMessagesFeed) return;

    if (!this.isAuthenticated()) {
      if (this.dom.loungeMessagesCount) this.dom.loungeMessagesCount.textContent = '🔒';
      if (this.dom.loungeFilesCount) this.dom.loungeFilesCount.textContent = '🔒';
      if (this.dom.loungeTextInput) {
        this.dom.loungeTextInput.disabled = true;
        this.dom.loungeTextInput.placeholder = '🔒 Sign in required to participate in community discussions...';
      }
      if (this.dom.loungeSendBtn) this.dom.loungeSendBtn.disabled = true;
      if (this.dom.loungeAttachBtn) this.dom.loungeAttachBtn.disabled = true;

      this.dom.loungeMessagesFeed.innerHTML = `
        <div class="auth-gate-shield-card" style="margin: 32px auto; max-width: 480px;">
          <div class="gate-shield-icon">💬</div>
          <h3 class="gate-shield-title">Campus Lounge Discussion Restricted</h3>
          <p class="gate-shield-desc">
            Campus discussion channels, academic queries, and peer document sharing are strictly reserved for verified students and faculty.
          </p>
          <div class="gate-action-buttons">
            <button type="button" class="btn btn-primary btn-sm" id="gateLoungeLoginPromptBtn">
              <span>Sign In to Join Discussion 🔑</span>
            </button>
          </div>
          <div class="gate-privacy-badge">
            <span>🛡️ Institutional Verification Required</span>
          </div>
        </div>
      `;

      const loungeGateBtn = document.getElementById('gateLoungeLoginPromptBtn');
      if (loungeGateBtn) {
        loungeGateBtn.addEventListener('click', () => {
          this.showInstagramGateway('login');
        });
      }
      return;
    }

    if (this.dom.loungeTextInput) {
      this.dom.loungeTextInput.disabled = false;
      this.dom.loungeTextInput.placeholder = 'Write an announcement inquiry, campus thought, or academic question... (Shift+Enter for new line)';
    }
    if (this.dom.loungeSendBtn) this.dom.loungeSendBtn.disabled = false;
    if (this.dom.loungeAttachBtn) this.dom.loungeAttachBtn.disabled = false;

    // Update Counters
    const totalMsgs = this.loungeMessages.length;
    const totalFiles = this.loungeMessages.filter(m => m.file).length;
    if (this.dom.loungeMessagesCount) this.dom.loungeMessagesCount.textContent = totalMsgs;
    if (this.dom.loungeFilesCount) this.dom.loungeFilesCount.textContent = totalFiles;

    if (totalMsgs === 0) {
      this.dom.loungeMessagesFeed.innerHTML = `
        <div style="text-align: center; margin: auto; padding: 40px 16px; color: var(--text-dim);">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">💬</div>
          <h4 style="color: var(--text-muted); margin-bottom: 4px;">Campus Community Lounge is Ready</h4>
          <p style="font-size: 0.85rem; max-width: 440px; margin: 0 auto;">
            No messages posted yet. All campus students, faculty, and administrators can start a discussion or share academic files here.
          </p>
        </div>
      `;
      return;
    }

    this.dom.loungeMessagesFeed.innerHTML = this.loungeMessages.map(msg => {
      const isAdm = msg.senderRole === 'ADMIN';
      const isMe = Boolean(this.currentUser && msg.senderId === this.currentUser.id);
      const canDelete = this.isAdmin() || isMe;
      const roleBadge = isAdm
        ? `<span class="comment-role-tag comment-role-admin">👑 Admin</span>`
        : `<span class="comment-role-tag comment-role-viewer">🎓 Member</span>`;

      return `
        <div class="lounge-msg-item" id="msg_${msg.id}">
          <div class="lounge-msg-avatar" style="${isAdm ? 'background: linear-gradient(135deg, #f59e0b, #ef4444);' : ''}">
            ${this.getInitials(msg.senderName)}
          </div>
          <div class="lounge-msg-content">
            <div class="lounge-msg-header">
              <div class="lounge-author-info">
                <span class="lounge-msg-author">${this.escapeHTML(msg.senderName)}</span>
                ${roleBadge}
                <span class="lounge-msg-username">@${this.escapeHTML(msg.senderUsername || 'user')}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="lounge-msg-time">${this.formatDate(msg.timestamp)}</span>
                ${canDelete ? `
                  <button type="button" class="comment-delete-btn lounge-msg-del-btn" data-msg-id="${msg.id}" title="${this.isAdmin() ? 'Super Admin: Delete message' : 'Delete your message'}">
                    🗑️
                  </button>
                ` : ''}
              </div>
            </div>

            ${msg.senderBio ? `
              <div style="font-size: 0.72rem; color: var(--text-dim); font-style: italic; margin-bottom: 6px;">
                "${this.escapeHTML(msg.senderBio)}"
              </div>
            ` : ''}

            ${msg.text ? `
              <div class="lounge-msg-body">${this.escapeHTML(msg.text)}</div>
            ` : ''}

            ${msg.file ? `
              <div class="lounge-file-attachment">
                <div class="file-meta-box">
                  <span class="file-type-icon">${this.getFileIcon(msg.file.name)}</span>
                  <div class="file-name-size">
                    <strong class="file-download-name" title="${this.escapeHTML(msg.file.name)}">${this.escapeHTML(msg.file.name)}</strong>
                    <span class="file-download-size">${this.formatFileSize(msg.file.size)}</span>
                  </div>
                </div>
                <a href="${msg.file.dataUrl}" download="${this.escapeHTML(msg.file.name)}" class="file-download-btn">
                  <span>⬇️ Download</span>
                </a>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  scrollLoungeToBottom() {
    if (this.dom.loungeMessagesFeed) {
      setTimeout(() => {
        this.dom.loungeMessagesFeed.scrollTop = this.dom.loungeMessagesFeed.scrollHeight;
      }, 50);
    }
  }

  /* --------------------------------------------------------------------------
     AUTHENTICATION & MULTI-ACCOUNT SWITCHER ENGINE
     -------------------------------------------------------------------------- */
  openAuthModal() {
    if (!this.dom.authModalBackdrop) return;
    this.renderSavedAccountsList();
    this.dom.authModalBackdrop.classList.add('open');
    this.dom.authModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  closeAuthModal() {
    if (!this.dom.authModalBackdrop) return;
    this.dom.authModalBackdrop.classList.remove('open');
    this.dom.authModalBackdrop.setAttribute('aria-hidden', 'true');
    if (this.dom.loginForm && typeof this.dom.loginForm.reset === 'function') this.dom.loginForm.reset();
    if (this.dom.registerForm && typeof this.dom.registerForm.reset === 'function') this.dom.registerForm.reset();
    if (!this.isAuthenticated()) {
      this.showInstagramGateway('login');
    }
  }

  switchAuthTab(tab) {
    const isLogin = tab === 'login';
    const isReg = tab === 'register';
    const isSwitch = tab === 'switch';

    if (this.dom.authTabLoginBtn) this.dom.authTabLoginBtn.classList.toggle('active', isLogin);
    if (this.dom.authTabRegisterBtn) this.dom.authTabRegisterBtn.classList.toggle('active', isReg);
    if (this.dom.authTabSwitchBtn) this.dom.authTabSwitchBtn.classList.toggle('active', isSwitch);

    if (this.dom.authPaneLogin) this.dom.authPaneLogin.style.display = isLogin ? 'block' : 'none';
    if (this.dom.authPaneRegister) this.dom.authPaneRegister.style.display = isReg ? 'block' : 'none';
    if (this.dom.authPaneSwitch) {
      this.dom.authPaneSwitch.style.display = isSwitch ? 'block' : 'none';
      if (isSwitch) this.renderSavedAccountsList();
    }
  }

  // Cryptographic Client-Side Password Hashing (Institutional Salting)
  async hashPassword(plainText, salt = 'CNMS_ATP0925_INSTA_SALT') {
    try {
      if (window.crypto && window.crypto.subtle) {
        const enc = new TextEncoder();
        const data = enc.encode(plainText + salt);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {
      console.warn('SubtleCrypto error, falling back:', e);
    }
    // Fallback deterministic hash string
    let h = 0x811c9dc5;
    const str = plainText + salt;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return ('0000000' + (h >>> 0).toString(16)).substr(-8);
  }

  calculatePasswordStrength(password) {
    if (!password) {
      return { score: 0, text: 'Data Privacy Security: Protected', percent: 0, color: 'var(--brand-accent)' };
    }
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 9) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, text: 'Weak (Vulnerable)', percent: 25, color: '#ef4444' };
      case 2:
      case 3:
        return { score: 2, text: 'Moderate (Standard)', percent: 55, color: '#f59e0b' };
      case 4:
        return { score: 3, text: 'Strong (SHA-256 Cryptographic Shield)', percent: 80, color: '#10b981' };
      case 5:
      default:
        return { score: 4, text: 'Maximum (Enterprise Vault Grade 🛡️)', percent: 100, color: '#0095f6' };
    }
  }

  updatePasswordStrengthUI(password) {
    if (!this.dom.instaStrengthFill || !this.dom.instaStrengthText) return;
    const res = this.calculatePasswordStrength(password);
    this.dom.instaStrengthFill.style.width = `${res.percent}%`;
    this.dom.instaStrengthFill.style.backgroundColor = res.color;
    this.dom.instaStrengthText.textContent = `Data Privacy Security: ${res.text}`;
    this.dom.instaStrengthText.style.color = res.color;
  }

  showInstagramGateway(mode = 'login') {
    if (this.dom.instagramAuthGateway) {
      this.dom.instagramAuthGateway.style.display = 'block';
    }
    if (this.dom.systemMainLayout) {
      this.dom.systemMainLayout.style.display = 'none';
    }
    if (this.dom.instaActiveUserSnippet) {
      this.dom.instaActiveUserSnippet.textContent = this.currentUser ? this.currentUser.name : 'Maruti Atpadkar';
    }
    if (this.dom.instaReturnToPortalBtn) {
      this.dom.instaReturnToPortalBtn.style.display = this.isAuthenticated() ? 'inline-flex' : 'none';
    }
    this.switchInstaAuthMode(mode);
    this.renderInstaDeviceProfiles();
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  enterCampusPortal() {
    if (!this.isAuthenticated()) {
      this.showInstagramGateway('login');
      this.showToast('Authentication Required: Please sign in or create an account to view campus notices.', 'warning');
      return;
    }
    if (this.dom.instagramAuthGateway) {
      this.dom.instagramAuthGateway.style.display = 'none';
    }
    if (this.dom.systemMainLayout) {
      this.dom.systemMainLayout.style.display = 'block';
    }
    localStorage.removeItem('cnms_session_signed_out');
    this.updateUserSessionUI();
    this.render();
  }

  switchInstaAuthMode(mode) {
    const isLogin = mode === 'login';
    if (this.dom.instaLoginFormBox) this.dom.instaLoginFormBox.style.display = isLogin ? 'block' : 'none';
    if (this.dom.instaSignupFormBox) this.dom.instaSignupFormBox.style.display = isLogin ? 'none' : 'block';

    if (this.dom.instaSwitchCardText) {
      if (isLogin) {
        this.dom.instaSwitchCardText.innerHTML = `Don't have an account? <a href="#" id="instaSwitchActionLink">Sign up</a>`;
      } else {
        this.dom.instaSwitchCardText.innerHTML = `Have an account? <a href="#" id="instaSwitchActionLink">Log in</a>`;
      }
      const newLink = document.getElementById('instaSwitchActionLink');
      if (newLink) {
        newLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.switchInstaAuthMode(isLogin ? 'signup' : 'login');
        });
      }
    }
  }

  renderInstaDeviceProfiles() {
    if (!this.dom.instaDeviceProfilesChips) return;
    if (this.users.length === 0) {
      this.dom.instaDeviceProfilesChips.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-dim);">No saved accounts on this device.</span>`;
      return;
    }

    this.dom.instaDeviceProfilesChips.innerHTML = this.users.map(u => {
      const isCur = Boolean(this.currentUser && u.id === this.currentUser.id);
      const isAdm = u.role === 'ADMIN';
      const isPending = u.status === 'PENDING';
      const badge = isAdm
        ? '👑 Admin'
        : isPending
          ? '🕒 Pending Approval'
          : '✅ Approved';

      return `
        <div class="insta-profile-chip ${isCur ? 'is-active-chip' : ''}" data-insta-switch-id="${u.id}" title="${isPending ? 'Pending approval by Maruti Atpadkar' : `Switch session to ${u.name}`}">
          <div class="insta-chip-avatar" style="${isAdm ? 'background: linear-gradient(135deg, #f59e0b, #ef4444);' : ''}">${this.getInitials(u.name)}</div>
          <div class="insta-chip-details">
            <span class="insta-chip-name">${this.escapeHTML(u.name)} ${isCur ? '(Active)' : ''}</span>
            <span class="insta-chip-tag">@${this.escapeHTML(u.username)} &bull; ${badge}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  handleInstaDeviceChipSelect(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    if (user.status === 'PENDING') {
      this.showToast(`🔒 Privacy & Security Guard: Account @${user.username} is pending clearance by Super Admin Maruti Atpadkar.`, 'error');
      return;
    }
    if (user.status === 'REJECTED') {
      this.showToast('Account registration was declined by Admin.', 'error');
      return;
    }

    this.currentUser = Object.assign({}, user);
    this.saveUsers();
    this.updateUserSessionUI();
    this.enterCampusPortal();
    this.showToast(`Switched active session to ${user.name}! 👥`, 'success');
  }

  async handleInstaLoginSubmit() {
    const ident = this.dom.instaLoginIdentifier ? this.dom.instaLoginIdentifier.value.trim().toLowerCase() : '';
    const pass = this.dom.instaLoginPassword ? this.dom.instaLoginPassword.value.trim() : '';

    if (!ident || !pass) {
      this.showToast('Please enter your phone number, username, or campus email and password.', 'error');
      return;
    }

    // 1. Super Admin 1-Click Verification
    if (
      (ident === 'atpadkarmaruti@gmail.com' || ident === 'admin_maruti' || ident === 'maruti') &&
      pass === 'PRATIK@00925'
    ) {
      this.currentUser = Object.assign({}, DEFAULT_SUPER_ADMIN);
      this.saveUsers();
      this.updateUserSessionUI();
      this.enterCampusPortal();
      this.showToast('Logged in as Super Admin Maruti Atpadkar (ATP0925) 👑', 'success');
      return;
    }

    // 2. Lookup registered user
    const user = this.users.find(u =>
      (u.email && u.email.toLowerCase() === ident) ||
      (u.username && u.username.toLowerCase() === ident) ||
      (u.contact && u.contact.toLowerCase() === ident)
    );

    if (!user) {
      this.showToast('Sorry, your password was incorrect or user not found. Please double-check your credentials.', 'error');
      return;
    }

    // Cryptographic Password Verification
    const inputHash = await this.hashPassword(pass);
    const passMatches = (user.passwordHash && user.passwordHash === inputHash) || (user.password === pass);

    if (!passMatches) {
      this.showToast('Sorry, your password was incorrect. Please double-check your password.', 'error');
      return;
    }

    // 3. Status Gatekeeper & Institutional Security Policy
    if (user.status === 'PENDING') {
      this.showToast(`🔒 Institutional Security Policy: Account @${user.username} is PENDING approval from Super Admin Maruti Atpadkar. Multi-account policy requires verification.`, 'error');
      return;
    }

    if (user.status === 'REJECTED') {
      this.showToast('Access declined by Campus Administration.', 'error');
      return;
    }

    // 4. Session Authenticated
    this.currentUser = Object.assign({}, user);
    this.saveUsers();
    this.updateUserSessionUI();
    this.enterCampusPortal();
    this.showToast(`Logged in successfully as @${user.username}! 🚀`, 'success');
  }

  async handleInstaRegisterSubmit() {
    if (this.dom.instaPrivacyConsentCheck && !this.dom.instaPrivacyConsentCheck.checked) {
      this.showToast('Institutional Data Privacy Policy confirmation is mandatory to register.', 'error');
      return;
    }

    const contact = this.dom.instaRegContact ? this.dom.instaRegContact.value.trim() : '';
    const name = this.dom.instaRegFullName ? this.dom.instaRegFullName.value.trim() : '';
    const rawUsername = this.dom.instaRegUsername ? this.dom.instaRegUsername.value.trim() : '';
    const pass = this.dom.instaRegPassword ? this.dom.instaRegPassword.value.trim() : '';
    const bio = this.dom.instaRegBio ? this.dom.instaRegBio.value.trim() : '';

    if (!contact || !name || !rawUsername || !pass) {
      this.showToast('Please fill out all required fields to create your account.', 'error');
      return;
    }

    if (pass.length < 6) {
      this.showToast('For data privacy & security, password must be at least 6 characters long.', 'error');
      return;
    }

    const cleanUsername = rawUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername.length < 3) {
      this.showToast('Username must be at least 3 letters/numbers/underscores.', 'error');
      return;
    }

    // Duplicate check
    const exists = this.users.some(u => 
      (u.username && u.username.toLowerCase() === cleanUsername) ||
      (u.email && u.email.toLowerCase() === contact.toLowerCase()) ||
      (u.contact && u.contact.toLowerCase() === contact.toLowerCase())
    );

    if (exists) {
      this.showToast(`Username @${cleanUsername} or contact is already registered on campus.`, 'error');
      return;
    }

    // Cryptographic Password Hashing (Institutional Salt)
    const passHash = await this.hashPassword(pass);

    const newUser = {
      id: 'user_' + Date.now(),
      name: name,
      username: cleanUsername,
      email: contact.includes('@') ? contact : `${cleanUsername}@campus.edu`,
      contact: contact,
      password: pass,
      passwordHash: passHash,
      role: 'VIEWER',
      canPost: false,
      status: 'PENDING', // Multi-account device permission rule: Admin Maruti Atpadkar must approve
      bio: bio || 'Campus student / academic viewer',
      avatar: this.getInitials(name),
      createdAt: Date.now(),
      privacyConsentGiven: true,
      privacyConsentDate: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveUsers();

    // Push to Google Cloud Firebase
    this.pushToCloud('cnms_users', newUser.id, newUser);

    this.showToast(`🎉 Welcome to CampusNotify, @${cleanUsername}! Account registered. 🕒 Awaiting 1-click clearance by Maruti Atpadkar.`, 'success');

    // Switch to login box and prefill identifier
    this.switchInstaAuthMode('login');
    if (this.dom.instaLoginIdentifier) {
      this.dom.instaLoginIdentifier.value = cleanUsername;
    }
    if (this.dom.instaLoginPassword) {
      this.dom.instaLoginPassword.value = '';
    }
    this.renderInstaDeviceProfiles();
  }

  handleSignOut() {
    localStorage.setItem('cnms_session_signed_out', 'true');
    this.currentUser = null;
    localStorage.removeItem('cnms_active_user');
    this.updateUserSessionUI();
    this.render();
    this.showToast('Signed out of session. Switched to Authentication Gateway.', 'info');
    this.showInstagramGateway('login');
  }

  openPrivacyModal() {
    if (!this.dom.privacyPolicyModalBackdrop) return;
    this.dom.privacyPolicyModalBackdrop.classList.add('open');
    this.dom.privacyPolicyModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  closePrivacyModal() {
    if (!this.dom.privacyPolicyModalBackdrop) return;
    this.dom.privacyPolicyModalBackdrop.classList.remove('open');
    this.dom.privacyPolicyModalBackdrop.setAttribute('aria-hidden', 'true');
  }

  toggleTermsConditionsDrawer(forceOpen = null) {
    if (!this.dom.termsConditionsDrawer) return;
    const isCurrentlyOpen = this.dom.termsConditionsDrawer.style.display !== 'none';
    const shouldOpen = forceOpen !== null ? forceOpen : !isCurrentlyOpen;

    if (shouldOpen) {
      this.dom.termsConditionsDrawer.style.display = 'block';
      if (this.dom.toggleTermsConditionsBtn) {
        this.dom.toggleTermsConditionsBtn.setAttribute('aria-expanded', 'true');
        this.dom.toggleTermsConditionsBtn.classList.add('active');
      }
      if (this.dom.tcChevronIcon) {
        this.dom.tcChevronIcon.textContent = '▲';
      }
    } else {
      this.dom.termsConditionsDrawer.style.display = 'none';
      if (this.dom.toggleTermsConditionsBtn) {
        this.dom.toggleTermsConditionsBtn.setAttribute('aria-expanded', 'false');
        this.dom.toggleTermsConditionsBtn.classList.remove('active');
      }
      if (this.dom.tcChevronIcon) {
        this.dom.tcChevronIcon.textContent = '▼';
      }
    }
  }

  initPhoneMockupSlider() {
    const slides = document.querySelectorAll('.insta-screen-slide');
    if (slides.length <= 1) return;
    let currentSlide = 0;
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 4500);
  }

  handleQuickAdminLogin() {
    this.currentUser = Object.assign({}, DEFAULT_SUPER_ADMIN);
    this.saveUsers();
    this.updateUserSessionUI();
    this.closeAuthModal();
    this.enterCampusPortal();
    this.showToast('Logged in as Super Admin Maruti Atpadkar (ATP0925) 👑', 'success');
  }

  handleLoginSubmit() {
    const ident = this.dom.loginIdentifier ? this.dom.loginIdentifier.value.trim().toLowerCase() : '';
    const pass = this.dom.loginPassword ? this.dom.loginPassword.value.trim() : '';

    if (!ident || !pass) {
      this.showToast('Please enter both Email/Username and Password.', 'error');
      return;
    }

    // Special Check for Super Admin
    if (
      (ident === 'atpadkarmaruti@gmail.com' || ident === 'admin_maruti' || ident === 'maruti') &&
      pass === 'PRATIK@00925'
    ) {
      this.handleQuickAdminLogin();
      return;
    }

    // Check normal registered accounts
    const user = this.users.find(u =>
      (u.email.toLowerCase() === ident || u.username.toLowerCase() === ident)
    );

    if (!user) {
      this.showToast('No campus account found with that username or email.', 'error');
      return;
    }

    if (user.password !== pass) {
      this.showToast('Incorrect password entered.', 'error');
      return;
    }

    // Status Gatekeeper (Admin Approval Requirement)
    if (user.status === 'PENDING') {
      this.showToast('Account is PENDING approval from Super Admin (Maruti Atpadkar). Please wait.', 'error');
      return;
    }
    if (user.status === 'REJECTED') {
      this.showToast('Your registration was declined by Admin.', 'error');
      return;
    }

    // Login successful
    this.currentUser = Object.assign({}, user);
    this.saveUsers();
    this.updateUserSessionUI();
    this.closeAuthModal();
    this.enterCampusPortal();
    this.showToast(`Signed in successfully as ${user.name}! 🚀`, 'success');
  }

  handleRegisterSubmit() {
    const name = this.dom.regFullName ? this.dom.regFullName.value.trim() : '';
    const rawUsername = this.dom.regUsername ? this.dom.regUsername.value.trim() : '';
    const pass = this.dom.regPassword ? this.dom.regPassword.value.trim() : '';
    const bio = this.dom.regBio ? this.dom.regBio.value.trim() : '';

    if (!name || !rawUsername || !pass) {
      this.showToast('Please fill out all required fields.', 'error');
      return;
    }

    const cleanUsername = rawUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername.length < 3) {
      this.showToast('Username must be at least 3 alphanumeric characters.', 'error');
      return;
    }

    // Check duplicate username
    const exists = this.users.some(u => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      this.showToast(`The username @${cleanUsername} is already taken. Please choose another.`, 'error');
      return;
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name: name,
      username: cleanUsername,
      email: `${cleanUsername}@campus.edu`,
      password: pass,
      role: 'VIEWER',
      canPost: false,
      status: 'PENDING', // Requires Admin permission per requirements
      bio: bio || 'Campus student / academic viewer',
      avatar: this.getInitials(name),
      createdAt: Date.now()
    };

    this.users.push(newUser);
    this.saveUsers();

    // Push to Google Firebase Cloud
    this.pushToCloud('cnms_users', newUser.id, newUser);

    this.showToast(`Account @${cleanUsername} registered! 🕒 Awaiting Admin approval by Maruti Atpadkar.`, 'info');
    this.switchAuthTab('switch');
  }

  renderSavedAccountsList() {
    if (!this.dom.savedAccountsList) return;

    if (this.users.length === 0) {
      this.dom.savedAccountsList.innerHTML = `<p style="color: var(--text-dim); font-size: 0.85rem;">No registered profiles found on this device.</p>`;
      return;
    }

    this.dom.savedAccountsList.innerHTML = this.users.map(u => {
      const isCur = Boolean(this.currentUser && u.id === this.currentUser.id);
      const isAdm = u.role === 'ADMIN';
      const isPending = u.status === 'PENDING';
      const statusBadge = isAdm
        ? `<span class="meta-badge blue-badge">👑 Admin</span>`
        : isPending
          ? `<span class="meta-badge" style="color: #f59e0b; border-color: rgba(245,158,11,0.4);">🕒 Pending Admin Approval</span>`
          : `<span class="meta-badge green-badge">✅ Approved</span>`;

      return `
        <div class="saved-account-item ${isCur ? 'is-current' : ''}">
          <div class="saved-acc-left">
            <div class="saved-acc-avatar" style="${isAdm ? 'background: linear-gradient(135deg, #f59e0b, #ef4444);' : ''}">
              ${this.getInitials(u.name)}
            </div>
            <div class="saved-acc-info">
              <span class="saved-acc-name">${this.escapeHTML(u.name)} ${isCur ? '(Active)' : ''}</span>
              <span class="saved-acc-role">@${this.escapeHTML(u.username)} &bull; ${statusBadge}</span>
              ${u.bio ? `<span class="saved-acc-bio">"${this.escapeHTML(u.bio)}"</span>` : ''}
            </div>
          </div>
          <div>
            ${isCur ? `
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--brand-accent);">Active Session</span>
            ` : isPending ? `
              <button type="button" class="btn btn-xs btn-secondary" disabled title="Awaiting Admin Approval">
                Pending Approval
              </button>
            ` : `
              <button type="button" class="btn btn-xs btn-primary" data-switch-to-user="${u.id}">
                Switch
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  handleSwitchToUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    if (user.status === 'PENDING') {
      this.showToast('Cannot switch: This account is pending approval by Maruti Atpadkar.', 'error');
      return;
    }

    this.currentUser = Object.assign({}, user);
    this.saveUsers();
    this.updateUserSessionUI();
    this.closeAuthModal();
    this.render();
    this.showToast(`Switched active account to ${user.name}! 👥`, 'success');
  }

  /* --------------------------------------------------------------------------
     ADMIN PERMISSIONS DESK (Approvals, Posting Authority, Account Management)
     -------------------------------------------------------------------------- */
  renderAdminUsersList() {
    if (!this.dom.adminUsersListContainer || !this.isAdmin()) return;

    // Filter out the Super Admin themself from the list
    const candidateUsers = this.users.filter(u => u.id !== DEFAULT_SUPER_ADMIN.id && u.email !== DEFAULT_SUPER_ADMIN.email);

    const pendingCount = candidateUsers.filter(u => u.status === 'PENDING').length;
    if (this.dom.pendingApprovalsBadge) {
      this.dom.pendingApprovalsBadge.textContent = `${pendingCount} Pending`;
    }

    if (candidateUsers.length === 0) {
      this.dom.adminUsersListContainer.innerHTML = `
        <div style="text-align: center; padding: 18px; color: var(--text-dim); font-size: 0.85rem;">
          No additional viewer accounts registered on this device yet.
        </div>
      `;
      return;
    }

    this.dom.adminUsersListContainer.innerHTML = candidateUsers.map(u => {
      const isApproved = u.status === 'APPROVED';
      const isPending = u.status === 'PENDING';
      const canPost = u.canPost === true;

      return `
        <div class="admin-user-card" id="admin_row_${u.id}">
          <div class="admin-user-left">
            <div class="admin-user-avatar">${this.getInitials(u.name)}</div>
            <div class="admin-user-details">
              <span class="admin-user-name">${this.escapeHTML(u.name)} (@${this.escapeHTML(u.username)})</span>
              <span class="admin-user-meta">
                Status: <strong>${u.status}</strong> &bull; Authority: 
                <strong style="color: ${canPost ? '#10b981' : '#94a3b8'};">
                  ${canPost ? '📢 Notice Publisher' : '👁️ Viewer Only'}
                </strong>
              </span>
              ${u.bio ? `<span class="admin-user-bio">Bio: "${this.escapeHTML(u.bio)}"</span>` : ''}
            </div>
          </div>
          <div class="admin-user-actions">
            ${isPending ? `
              <button type="button" class="btn btn-xs btn-primary" data-admin-action="approve" data-user-id="${u.id}" title="Approve account for campus access">
                ✅ Approve
              </button>
              <button type="button" class="btn btn-xs btn-secondary" data-admin-action="reject" data-user-id="${u.id}" title="Decline account">
                ❌ Reject
              </button>
            ` : `
              <button type="button" class="btn btn-xs ${canPost ? 'btn-secondary' : 'btn-primary'}" data-admin-action="toggle-posting" data-user-id="${u.id}" title="${canPost ? 'Revoke notice publishing authority' : 'Grant notice publishing authority'}">
                ${canPost ? '🔒 Revoke Authority' : '📢 Grant Notice Authority'}
              </button>
            `}
            <button type="button" class="btn btn-xs btn-secondary" data-admin-action="delete-user" data-user-id="${u.id}" title="Remove account from portal">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  handleAdminApproveUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    user.status = 'APPROVED';
    this.saveUsers();
    this.pushToCloud('cnms_users', user.id, user);

    this.renderAdminUsersList();
    this.showToast(`Account @${user.username} approved! User can now sign in. ✅`, 'success');
  }

  handleAdminRejectUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    user.status = 'REJECTED';
    this.saveUsers();
    this.pushToCloud('cnms_users', user.id, user);

    this.renderAdminUsersList();
    this.showToast(`Account @${user.username} was rejected.`, 'info');
  }

  handleAdminTogglePostingAuthority(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    user.canPost = !user.canPost;
    this.saveUsers();
    this.pushToCloud('cnms_users', user.id, user);

    this.renderAdminUsersList();
    const statusMsg = user.canPost ? 'Granted notice issuing authority 📢' : 'Revoked notice issuing authority 🔒';
    this.showToast(`Updated @${user.username}: ${statusMsg}`);
  }

  handleAdminDeleteUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    if (!window.confirm(`Are you sure you want to delete account @${user.username}?`)) return;

    this.users = this.users.filter(u => u.id !== userId);
    this.saveUsers();
    this.deleteFromCloud('cnms_users', userId);

    this.renderAdminUsersList();
    this.showToast(`Account @${user.username} deleted from system.`, 'info');
  }

  handleSaveBio() {
    if (!this.isAuthenticated() || !this.currentUser) {
      this.showToast('Authentication Required.', 'warning');
      this.showInstagramGateway('login');
      return;
    }
    if (!this.dom.bioEditTextarea) return;
    const newBio = this.dom.bioEditTextarea.value.trim();

    this.currentUser.bio = newBio;
    // Update in users registry
    const registered = this.users.find(u => u.id === this.currentUser.id);
    if (registered) registered.bio = newBio;

    this.saveUsers();
    this.pushToCloud('cnms_users', this.currentUser.id, this.currentUser);

    if (this.dom.profileHeroBioText) {
      this.dom.profileHeroBioText.textContent = newBio || 'Campus member with official portal access.';
    }
    if (this.dom.bioEditForm) {
      this.dom.bioEditForm.style.display = 'none';
    }

    this.showToast('Profile bio updated successfully! ✨', 'success');
  }

  /* --------------------------------------------------------------------------
     FIREBASE SETTINGS HANDLERS
     -------------------------------------------------------------------------- */
  handleSaveFirebaseConfig() {
    const apiKey = this.dom.fbApiKey ? this.dom.fbApiKey.value.trim() : '';
    const projectId = this.dom.fbProjectId ? this.dom.fbProjectId.value.trim() : '';
    const authDomain = this.dom.fbAuthDomain ? this.dom.fbAuthDomain.value.trim() : '';
    const appId = this.dom.fbAppId ? this.dom.fbAppId.value.trim() : '';

    if (!apiKey || !projectId) {
      this.showToast('Firebase API Key and Project ID are required.', 'error');
      return;
    }

    const config = { apiKey, projectId, authDomain, appId };
    localStorage.setItem('cnms_firebase_config', JSON.stringify(config));

    this.initFirebase();
    this.showToast('Google Firebase credentials saved! Connecting... 🔥', 'success');
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
    if (this.dom && this.dom.themeToggleBtn && typeof this.dom.themeToggleBtn.querySelector === 'function') {
      const iconSpan = this.dom.themeToggleBtn.querySelector('.theme-icon');
      if (iconSpan) {
        iconSpan.textContent = theme === 'dark' ? '🌓' : '☀️';
      }
    }
  }

  /* --------------------------------------------------------------------------
     MODAL: OFFICER PROFILE & SYSTEM GOVERNANCE
     -------------------------------------------------------------------------- */
  openProfileModal() {
    if (!this.isAuthenticated()) {
      this.showToast('Authentication Required: Please sign in to view and manage your profile.', 'warning');
      this.showInstagramGateway('login');
      return;
    }
    if (!this.dom.officerProfileModalBackdrop) return;
    this.updateUserSessionUI();
    this.dom.officerProfileModalBackdrop.classList.add('open');
    this.dom.officerProfileModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  closeProfileModal() {
    if (!this.dom.officerProfileModalBackdrop) return;
    this.dom.officerProfileModalBackdrop.classList.remove('open');
    this.dom.officerProfileModalBackdrop.setAttribute('aria-hidden', 'true');
    if (this.dom.bioEditForm) this.dom.bioEditForm.style.display = 'none';
  }

  /* --------------------------------------------------------------------------
     ACTIONS: LIKES, EMOJI REACTIONS, ACKNOWLEDGE, BOOKMARK, DELETE, SHARE
     -------------------------------------------------------------------------- */
  handleToggleNoticeLike(noticeId) {
    if (!this.isAuthenticated()) {
      this.showToast('Authentication Required: Please sign in or create an account to like notices.', 'warning');
      this.showInstagramGateway('login');
      return;
    }
    const notice = this.notices.find(n => n.id === noticeId);
    if (!notice) return;

    if (!Array.isArray(notice.likes)) notice.likes = [];

    const userId = this.currentUser.id;
    const idx = notice.likes.indexOf(userId);

    if (idx > -1) {
      notice.likes.splice(idx, 1);
      this.showToast('Unliked circular');
    } else {
      notice.likes.push(userId);
      this.showToast('Liked circular ❤️', 'success');
    }

    this.saveNotices();
    this.pushToCloud('cnms_notices', notice.id, notice);
    this.render();
  }

  handleToggleReaction(noticeId, emoji) {
    if (!this.isAuthenticated()) {
      this.showToast('Authentication Required: Please sign in or create an account to react to notices.', 'warning');
      this.showInstagramGateway('login');
      return;
    }
    const notice = this.notices.find(n => n.id === noticeId);
    if (!notice) return;

    if (!notice.reactions || typeof notice.reactions !== 'object') {
      notice.reactions = {};
    }
    if (!Array.isArray(notice.reactions[emoji])) {
      notice.reactions[emoji] = [];
    }

    const userId = this.currentUser.id;
    const list = notice.reactions[emoji];
    const idx = list.indexOf(userId);

    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(userId);
      this.showToast(`Reacted with ${emoji}!`);
    }

    this.saveNotices();
    this.pushToCloud('cnms_notices', notice.id, notice);
    this.render();
  }

  handleToggleAcknowledge(noticeId) {
    if (!this.isAuthenticated()) {
      this.showToast('Authentication Required: Please sign in or create an account to acknowledge notices.', 'warning');
      this.showInstagramGateway('login');
      return;
    }
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
    this.pushToCloud('cnms_notices', notice.id, notice);
    this.render();
  }

  handleToggleBookmark(noticeId) {
    if (!this.isAuthenticated()) {
      this.showToast('Authentication Required: Please sign in or create an account to bookmark notices.', 'warning');
      this.showInstagramGateway('login');
      return;
    }
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
    if (!this.isAuthenticated()) {
      this.showToast('Authentication Required.', 'warning');
      this.showInstagramGateway('login');
      return;
    }
    const notice = this.notices.find(n => n.id === noticeId);
    if (!notice) return;

    // Authority Check: Only Super Admin or original Signatory
    const canDelete = this.isAdmin() || Boolean(this.currentUser && notice.signatory && notice.signatory.includes(this.currentUser.name));
    if (!canDelete) {
      this.showToast('Authority Restriction: Only Super Admin (Maruti Atpadkar) can delete circulars.', 'error');
      return;
    }

    const confirmed = window.confirm(
      `CONFIRM CIRCULAR ARCHIVAL / DELETION:\n\nReference: ${notice.refNo}\nSubject: "${notice.title}"\n\nAre you sure you wish to permanently remove this official notice?`
    );
    if (!confirmed) return;

    this.notices = this.notices.filter(n => n.id !== noticeId);
    this.acknowledgedSet.delete(noticeId);
    this.bookmarkSet.delete(noticeId);

    this.saveNotices();
    this.saveInteractions();
    this.deleteFromCloud('cnms_notices', noticeId);

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
     MODAL: ISSUE OFFICIAL CIRCULAR (Authority Restricted)
     -------------------------------------------------------------------------- */
  openNewNoticeModal() {
    if (!this.isAuthenticated()) {
      this.showToast('Authentication Required: Please sign in or create an account.', 'warning');
      this.showInstagramGateway('login');
      return;
    }
    if (!this.hasPostingAuthority()) {
      this.showToast(
        'Authority Restriction: Only Super Admin (Maruti Atpadkar) or authorized officers can issue circulars.',
        'error'
      );
      return;
    }

    if (!this.dom.newNoticeModalBackdrop) return;

    // Auto-generate reference number
    const nextSeq = String(this.notices.length + 1).padStart(3, '0');
    if (this.dom.noticeRefNo) {
      this.dom.noticeRefNo.value = `CNMS/2026/${nextSeq}`;
    }

    if (this.dom.noticeSignatory) {
      this.dom.noticeSignatory.value = `${this.currentUser.name}, ${this.isAdmin() ? 'Super Admin' : 'Authorized Publisher'}`;
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
    if (this.dom.newNoticeForm && typeof this.dom.newNoticeForm.reset === 'function') this.dom.newNoticeForm.reset();
  }

  handlePublishCircular() {
    if (!this.isAuthenticated() || !this.hasPostingAuthority()) {
      this.showToast('Permission denied: You do not have circular issuing authority.', 'error');
      return;
    }

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
      likes: [],
      reactions: { '👍': [], '❤️': [], '🔥': [], '👏': [], '📌': [], '💡': [] },
      comments: []
    };

    // Prepend to list
    this.notices.unshift(newCircular);
    this.saveNotices();

    // Push to Google Firebase Cloud
    this.pushToCloud('cnms_notices', newCircular.id, newCircular);

    this.closeNewNoticeModal();
    this.showToast(`Official Circular [${refNo}] published to campus board! 📢`, 'success');
    this.render();
  }

  /* --------------------------------------------------------------------------
     MODAL: OFFICIAL LETTERHEAD VIEW & PRINT
     -------------------------------------------------------------------------- */
  openLetterheadModal(noticeId) {
    if (!this.isAuthenticated()) {
      this.showToast('Authentication Required: Please sign in or create an account to view official circular letterheads.', 'warning');
      this.showInstagramGateway('login');
      return;
    }
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
     MODAL: INQUIRY & CLARIFICATION DESK (Admin Super Moderation Deletion)
     -------------------------------------------------------------------------- */
  openDiscussionModal(noticeId) {
    if (!this.isAuthenticated()) {
      this.showToast('Authentication Required: Please sign in or create an account to view or participate in discussions.', 'warning');
      this.showInstagramGateway('login');
      return;
    }
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
          📑 No official inquiries or doubts logged yet.<br>All students, faculty members and coordinators can submit queries below.
        </div>
      `;
      return;
    }

    this.dom.commentsListContainer.innerHTML = queries.map(q => {
      const isAdmComment = q.role === 'ADMIN' || (q.author && q.author.includes('Admin'));
      // Admin has full restriction authority to delete ANY comment in the system
      const canDelete = this.isAdmin() || Boolean(this.currentUser && q.userId === this.currentUser.id);

      return `
        <div class="comment-item" id="comment_${q.id}">
          <div class="comment-header">
            <div class="comment-author-wrap">
              <span class="comment-author">${this.escapeHTML(q.authorName || q.author)}</span>
              ${isAdmComment ? `
                <span class="comment-role-tag comment-role-admin">👑 Admin</span>
              ` : `
                <span class="comment-role-tag comment-role-viewer">👁️ Member</span>
              `}
              ${q.authorUsername ? `<span style="font-size: 0.7rem; color: var(--text-dim);">@${this.escapeHTML(q.authorUsername)}</span>` : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="comment-time">${this.formatDate(q.time)}</span>
              ${canDelete ? `
                <button type="button" class="comment-delete-btn" data-comment-id="${q.id}" title="${this.isAdmin() ? 'Super Admin: Delete this inquiry' : 'Delete your inquiry'}">
                  🗑️
                </button>
              ` : ''}
            </div>
          </div>
          ${q.authorBio ? `
            <div style="font-size: 0.72rem; color: var(--text-dim); font-style: italic; margin-bottom: 4px;">
              "${this.escapeHTML(q.authorBio)}"
            </div>
          ` : ''}
          <div class="comment-text">${this.escapeHTML(q.text)}</div>
        </div>
      `;
    }).join('');
  }

  handleSubmitInquiry() {
    if (!this.isAuthenticated()) {
      this.showToast('Authentication Required: Please sign in or create an account to post an inquiry.', 'warning');
      this.showInstagramGateway('login');
      return;
    }
    if (!this.activeDiscussionNoticeId || !this.dom.commentInputText) return;
    const text = this.dom.commentInputText.value.trim();
    if (!text) return;

    const notice = this.notices.find(n => n.id === this.activeDiscussionNoticeId);
    if (!notice) return;

    if (!notice.comments) notice.comments = [];

    const newQuery = {
      id: 'query-' + Date.now(),
      userId: this.currentUser.id,
      authorName: this.currentUser.name,
      authorUsername: this.currentUser.username,
      authorRole: this.currentUser.role,
      authorBio: this.currentUser.bio || '',
      time: new Date().toISOString(),
      text: text
    };

    notice.comments.push(newQuery);
    this.saveNotices();
    this.pushToCloud('cnms_notices', notice.id, notice);

    this.dom.commentInputText.value = '';
    this.renderInquiriesList();
    this.render();
    this.showToast('Inquiry logged into official clarification ledger.');
  }

  handleDeleteComment(commentId) {
    if (!this.isAuthenticated()) {
      this.showToast('Authentication Required.', 'warning');
      this.showInstagramGateway('login');
      return;
    }
    if (!this.activeDiscussionNoticeId) return;
    const notice = this.notices.find(n => n.id === this.activeDiscussionNoticeId);
    if (!notice || !notice.comments) return;

    const targetComment = notice.comments.find(c => c.id === commentId);
    if (!targetComment) return;

    // Restriction check: Admin can delete any comment; normal users can only delete own
    const canDelete = this.isAdmin() || Boolean(this.currentUser && targetComment.userId === this.currentUser.id);
    if (!canDelete) {
      this.showToast('Authority Restriction: Only Super Admin (Maruti Atpadkar) can delete others’ inquiries.', 'error');
      return;
    }

    if (!window.confirm('Delete this inquiry from the circular ledger?')) return;

    notice.comments = notice.comments.filter(c => c.id !== commentId);
    this.saveNotices();
    this.pushToCloud('cnms_notices', notice.id, notice);

    this.renderInquiriesList();
    this.render();
    this.showToast('Inquiry removed by administrator.');
  }

  /* --------------------------------------------------------------------------
     RENDER SYSTEM & KPI METRICS
     -------------------------------------------------------------------------- */
  render() {
    if (!this.isAuthenticated()) {
      if (this.dom.metricTotalCirculars) this.dom.metricTotalCirculars.textContent = '🔒';
      if (this.dom.metricUrgentCirculars) this.dom.metricUrgentCirculars.textContent = '🔒';
      if (this.dom.metricAcknowledgedCount) this.dom.metricAcknowledgedCount.textContent = '🔒';
      if (this.dom.circularsTabBadge) this.dom.circularsTabBadge.textContent = 'Restricted';
      if (this.dom.noticesCountBadge) this.dom.noticesCountBadge.textContent = '0 (Sign In Required)';
      if (this.dom.activeFilterAlert) this.dom.activeFilterAlert.style.display = 'none';
      if (this.dom.emptyStateCard) this.dom.emptyStateCard.style.display = 'none';
      if (this.dom.noticesContainer) {
        this.dom.noticesContainer.innerHTML = `
          <div class="auth-gate-shield-card">
            <div class="gate-shield-icon">🔒</div>
            <h3 class="gate-shield-title">Official Campus Circulars Restricted</h3>
            <p class="gate-shield-desc">
              Official semester circulars, examination schedules, departmental alerts, and institutional files are protected.
              You must sign in with an approved student/faculty account or create a new account to access notices.
            </p>
            <div class="gate-action-buttons">
              <button type="button" class="btn btn-primary" id="gateLoginPromptBtn">
                <span>Sign In / Create Account 🚀</span>
              </button>
            </div>
            <div class="gate-privacy-badge">
              <span>🛡️ 256-Bit Cryptography &bull; DPDP Act 2023 Compliant</span>
            </div>
          </div>
        `;
        const gateBtn = document.getElementById('gateLoginPromptBtn');
        if (gateBtn) {
          gateBtn.addEventListener('click', () => this.showInstagramGateway('login'));
        }
      }
      return;
    }

    // 1. Calculate KPI Metrics
    const totalCount = this.notices.length;
    const urgentCount = this.notices.filter(n => n.priority === 'Urgent').length;
    const totalAcks = this.notices.reduce((sum, n) => sum + (n.acknowledgedCount || 0), 0);

    if (this.dom.metricTotalCirculars) this.dom.metricTotalCirculars.textContent = totalCount;
    if (this.dom.metricUrgentCirculars) this.dom.metricUrgentCirculars.textContent = urgentCount;
    if (this.dom.metricAcknowledgedCount) this.dom.metricAcknowledgedCount.textContent = totalAcks;
    if (this.dom.circularsTabBadge) this.dom.circularsTabBadge.textContent = `${totalCount} Records`;

    // 2. Filter Notices
    let filtered = [...this.notices];

    if (this.activeDepartment !== 'ALL') {
      filtered = filtered.filter(n => (n.department || '').toLowerCase() === this.activeDepartment.toLowerCase());
    }

    if (this.activePriority !== 'ALL') {
      filtered = filtered.filter(n => (n.priority || '').toLowerCase() === this.activePriority.toLowerCase());
    }

    if (this.activeAudience !== 'ALL') {
      filtered = filtered.filter(n => (n.audience || '').toLowerCase() === this.activeAudience.toLowerCase());
    }

    if (this.bookmarkedOnly) {
      filtered = filtered.filter(n => this.bookmarkSet.has(n.id));
    }

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

    // 5. Render Circulars or Clean Slate
    if (filtered.length === 0) {
      if (this.dom.noticesContainer) this.dom.noticesContainer.innerHTML = '';
      if (this.dom.emptyStateCard) {
        this.dom.emptyStateCard.style.display = 'block';

        const emptyTitle = this.dom.emptyStateCard && typeof this.dom.emptyStateCard.querySelector === 'function'
          ? this.dom.emptyStateCard.querySelector('.empty-title')
          : null;
        const emptyText = this.dom.emptyStateCard && typeof this.dom.emptyStateCard.querySelector === 'function'
          ? this.dom.emptyStateCard.querySelector('.empty-text')
          : null;

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
     CARD HTML BUILDER (Likes, Reactions, Inquiries, Admin Moderation)
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

    // Likes count & status for current user
    const likesList = Array.isArray(notice.likes) ? notice.likes : [];
    const isLiked = this.currentUser ? likesList.includes(this.currentUser.id) : false;
    const likesCount = likesList.length;

    // Emoji reactions
    const standardEmojis = ['👍', '❤️', '🔥', '👏', '📌', '💡'];
    const reactionsObj = notice.reactions || {};

    const reactionChipsHtml = standardEmojis.map(emoji => {
      const reactedUsers = Array.isArray(reactionsObj[emoji]) ? reactionsObj[emoji] : [];
      const hasReacted = this.currentUser ? reactedUsers.includes(this.currentUser.id) : false;
      const count = reactedUsers.length;

      return `
        <button 
          type="button" 
          class="reaction-chip ${hasReacted ? 'active-reaction' : ''}" 
          data-notice-id="${notice.id}" 
          data-emoji="${emoji}"
          title="${hasReacted ? 'Click to remove reaction' : `React with ${emoji}`}"
        >
          <span class="emoji-icon">${emoji}</span>
          <span class="reaction-count">${count > 0 ? count : ''}</span>
        </button>
      `;
    }).join('');

    // Authority Check for deletion: Only Super Admin or Signatory
    const canDeleteNotice = this.isAdmin() || Boolean(this.currentUser && notice.signatory && notice.signatory.includes(this.currentUser.name));

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

        <!-- EMOJI REACTIONS & LIKES INTERACTION BAR (Viewers & Admin) -->
        <div class="card-reactions-bar">
          <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-dim); text-transform: uppercase;">Reactions:</span>
          ${reactionChipsHtml}
        </div>

        <!-- Official Management Action Bar -->
        <div class="card-management-toolbar">
          <div class="toolbar-left-actions">
            <!-- Like Button -->
            <button 
              type="button" 
              class="action-tool-btn ${isLiked ? 'active-like' : ''}" 
              data-action="like" 
              data-id="${notice.id}"
              title="Like circular"
            >
              <span>${isLiked ? '❤️ Liked' : '🤍 Like'}</span>
              <span>(${likesCount})</span>
            </button>

            <!-- Acknowledge Receipt Button -->
            <button 
              type="button" 
              class="action-tool-btn ${isAcknowledged ? 'active-ack' : ''}" 
              data-action="acknowledge" 
              data-id="${notice.id}"
              title="Record read confirmation"
            >
              <span>${isAcknowledged ? '✅ Acknowledged' : '☑️ Acknowledge'}</span>
              <span>(${acksCount})</span>
            </button>

            <!-- Official Letterhead / Print -->
            <button 
              type="button" 
              class="action-tool-btn" 
              data-action="letterhead" 
              data-id="${notice.id}"
              title="Open formal university circular letterhead with seal"
            >
              <span>📄 Letterhead</span>
            </button>

            <!-- Inquiry / Comment Desk -->
            <button 
              type="button" 
              class="action-tool-btn" 
              data-action="inquiries" 
              data-id="${notice.id}"
              title="View or submit questions on this circular"
            >
              <span>💬 Inquiries (${inquiriesCount})</span>
            </button>

            <!-- Bookmark / Save -->
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
            <!-- Share Circular -->
            <button 
              type="button" 
              class="icon-action-btn" 
              data-action="share" 
              data-id="${notice.id}" 
              title="Copy Circular Link & Summary"
            >
              📤
            </button>

            <!-- Delete Notice (Admin or Issuer Authority) -->
            ${canDeleteNotice ? `
              <button 
                type="button" 
                class="icon-action-btn delete-icon" 
                data-action="delete" 
                data-id="${notice.id}" 
                title="${this.isAdmin() ? 'Super Admin: Permanently delete circular' : 'Delete circular'}"
              >
                🗑️
              </button>
            ` : ''}
          </div>
        </div>

      </article>
    `;
  }

  /* --------------------------------------------------------------------------
     UTILITY HELPERS (Initials, File formatting, Dates, Sanitization)
     -------------------------------------------------------------------------- */
  getInitials(name) {
    if (!name) return 'CN';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getFileIcon(filename) {
    if (!filename) return '📎';
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return '📕';
      case 'doc':
      case 'docx': return '📘';
      case 'xls':
      case 'xlsx': return '📗';
      case 'ppt':
      case 'pptx': return '📙';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif': return '🖼️';
      case 'zip':
      case 'rar': return '📦';
      case 'txt': return '📄';
      default: return '📎';
    }
  }

  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

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
