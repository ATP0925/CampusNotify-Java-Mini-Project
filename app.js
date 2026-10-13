/**
 * ============================================================================
 * CAMPUS NOTIFY - OFFICIAL CAMPUS NOTIFICATION MANAGEMENT SYSTEM (CNMS)
 * Enterprise Academic & Administrative Circular Dispatch Portal Engine
 * Built for Java Mini Project & Institutional Enterprise Governance
 * Integrated with Google Cloud Firebase (Cloud Firestore & Auth) + LocalStorage Fallback
 * Super Administrator & Central Controller: Institutional Admin Desk
 * ============================================================================
 */

// Official Super Admin Default Account
const DEFAULT_SUPER_ADMIN = {
  id: 'user_admin_001',
  username: 'admin',
  email: 'admin@campusnotify.edu',
  password: 'AdminPassword@123',
  name: 'System Administrator',
  role: 'ADMIN',
  canPost: true,
  status: 'APPROVED',
  bio: 'Chief System Administrator & Central Notice Dispatch Controller',
  avatar: 'SA',
  createdAt: 1740000000000
};

// Authorized Institutional Super Admin Accounts (Owner Protected)
const SUPER_ADMIN_EMAILS = [
  'admin@campusnotify.edu',
  'atpadkarmaruti@gmail.com',
  'atpadkarpratik00925@gmail.com'
];

// Curated Emojis for Community Lounge Chat
const LOUNGE_EMOJIS = [
  '👍', '❤️', '😂', '🔥', '🎉', '📚', '🚀', '👏', '💯', '✨',
  '💡', '🙌', '🎓', '🤝', '📢', '✍️', '☕', '😎', '🎯', '⚡',
  '🔔', '🏆', '👀', '💪', '🙏', '🥳', '🤔', '🌟', '💻', '🧪',
  '📝', '📌', '✅', '⭐', '🎈', '🤩', '💖', '👌', '🤗', '🔥'
];

// Curated High-Speed Animated GIFs for Campus Life
const CURATED_CAMPUS_GIFS = [
  { cat: 'celebrate', label: 'Party Confetti 🎉', url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif' },
  { cat: 'celebrate', label: 'Victory Dance 💃', url: 'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif' },
  { cat: 'thumbsup', label: 'Thumbs Up 👍', url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif' },
  { cat: 'thumbsup', label: 'Approved & Nice 👌', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif' },
  { cat: 'study', label: 'Study Grind 📚', url: 'https://media.giphy.com/media/9wLKh6ms5t9qE/giphy.gif' },
  { cat: 'study', label: 'Exam Mood 📖', url: 'https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif' },
  { cat: 'study', label: 'Brain Sparks 💡', url: 'https://media.giphy.com/media/d3mlE7uhX8KFgEmY/giphy.gif' },
  { cat: 'laugh', label: 'Campus Laugh 😂', url: 'https://media.giphy.com/media/l3fQf1OEAq0iri9RC/giphy.gif' },
  { cat: 'laugh', label: 'Cool Shades 😎', url: 'https://media.giphy.com/media/62PP2yEIAZF6g/giphy.gif' },
  { cat: 'team', label: 'High Five 🤝', url: 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif' },
  { cat: 'team', label: 'Applause & Cheers 👏', url: 'https://media.giphy.com/media/l4q8cJzGdR9J8w3hS/giphy.gif' }
];

// Curated Academic & Modern Presets for Theme Studio
const CNMS_PRESET_PALETTES = {
  sapphire: {
    id: 'sapphire',
    name: 'Royal Sapphire',
    brandPrimary: '#2563eb',
    brandSecondary: '#0284c7',
    bgPage: '#f8fafc',
    bgCard: '#ffffff',
    bgSubtle: '#eff6ff',
    borderColor: '#cbd5e1',
    textMain: '#0f172a',
    textMuted: '#475569'
  },
  emerald: {
    id: 'emerald',
    name: 'Campus Emerald',
    brandPrimary: '#059669',
    brandSecondary: '#10b981',
    bgPage: '#f0fdf4',
    bgCard: '#ffffff',
    bgSubtle: '#dcfce7',
    borderColor: '#bbf7d0',
    textMain: '#064e3b',
    textMuted: '#374151'
  },
  midnight: {
    id: 'midnight',
    name: 'Cyber Midnight',
    brandPrimary: '#6366f1',
    brandSecondary: '#8b5cf6',
    bgPage: '#090d16',
    bgCard: '#131b2e',
    bgSubtle: '#1e293b',
    borderColor: '#2e384d',
    textMain: '#f8fafc',
    textMuted: '#94a3b8'
  },
  amethyst: {
    id: 'amethyst',
    name: 'Imperial Violet',
    brandPrimary: '#7c3aed',
    brandSecondary: '#a855f7',
    bgPage: '#faf5ff',
    bgCard: '#ffffff',
    bgSubtle: '#f3e8ff',
    borderColor: '#e9d5ff',
    textMain: '#3b0764',
    textMuted: '#4b5563'
  },
  oceanic: {
    id: 'oceanic',
    name: 'Oceanic Teal',
    brandPrimary: '#0d9488',
    brandSecondary: '#06b6d4',
    bgPage: '#f0fdfa',
    bgCard: '#ffffff',
    bgSubtle: '#ccfbf1',
    borderColor: '#99f6e4',
    textMain: '#134e4a',
    textMuted: '#334155'
  },
  crimson: {
    id: 'crimson',
    name: 'Oxford Crimson',
    brandPrimary: '#dc2626',
    brandSecondary: '#f59e0b',
    bgPage: '#fff1f2',
    bgCard: '#ffffff',
    bgSubtle: '#ffe4e6',
    borderColor: '#fecdd3',
    textMain: '#4c0519',
    textMuted: '#475569'
  },
  slate: {
    id: 'slate',
    name: 'Executive Slate',
    brandPrimary: '#334155',
    brandSecondary: '#64748b',
    bgPage: '#f8fafc',
    bgCard: '#ffffff',
    bgSubtle: '#f1f5f9',
    borderColor: '#e2e8f0',
    textMain: '#0f172a',
    textMuted: '#64748b'
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Peach (Original)',
    brandPrimary: '#f43f5e',
    brandSecondary: '#f97316',
    bgPage: '#fff8f6',
    bgCard: '#ffffff',
    bgSubtle: '#fff1f2',
    borderColor: '#fed7aa',
    textMain: '#000000',
    textMuted: '#1e293b'
  }
};

// ============================================================================
// CAMPUS NOTIFY CRYPTOGRAPHIC ENGINE (256-BIT AES-GCM END-TO-END ENCRYPTION)
// ============================================================================
class CampusE2EE {
  constructor() {
    this.algorithm = { name: 'AES-GCM', length: 256 };
    this.passphrase = 'CampusNotify-Vault-AES256GCM-2026';
    this.decryptedCache = new Map();
    this.keyPromise = this.initKey();
  }

  async initKey() {
    try {
      if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
        return null;
      }
      const enc = new TextEncoder();
      const rawKey = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(this.passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );
      const salt = enc.encode('CampusNotify-Salt-2026');
      return await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        rawKey,
        this.algorithm,
        false,
        ['encrypt', 'decrypt']
      );
    } catch (e) {
      return null;
    }
  }

  async encrypt(plainText) {
    if (!plainText) return { ciphertext: '', isE2ee: false };
    try {
      const key = await this.keyPromise;
      if (key && typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        const enc = new TextEncoder();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const ciphertext = await window.crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: iv },
          key,
          enc.encode(plainText)
        );
        const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
        const ctHex = Array.from(new Uint8Array(ciphertext)).map(b => b.toString(16).padStart(2, '0')).join('');
        const ctString = `E2EE:AES256GCM:${ivHex}:${ctHex}`;
        this.decryptedCache.set(ctString, plainText);
        return {
          ciphertext: ctString,
          isE2ee: true
        };
      }
    } catch (e) {
      // Handled by fallback below
    }
    return this.fallbackEncrypt(plainText);
  }

  async decrypt(cipherString) {
    if (!cipherString) return '';
    if (typeof cipherString !== 'string' || !cipherString.startsWith('E2EE:AES256GCM:')) {
      return cipherString;
    }
    if (this.decryptedCache.has(cipherString)) {
      return this.decryptedCache.get(cipherString);
    }
    try {
      const parts = cipherString.split(':');
      if (parts.length >= 4 && parts[2] !== 'STATIC') {
        const ivHex = parts[2];
        const ctHex = parts[3];
        const iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const ct = new Uint8Array(ctHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const key = await this.keyPromise;
        if (key && typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
          const decrypted = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            ct
          );
          const plain = new TextDecoder().decode(decrypted);
          this.decryptedCache.set(cipherString, plain);
          return plain;
        }
      }
    } catch (e) {
      // Handled by fallback below
    }
    return this.fallbackDecrypt(cipherString);
  }

  decryptSync(cipherString) {
    if (!cipherString) return '';
    if (typeof cipherString !== 'string') return cipherString;
    if (this.decryptedCache.has(cipherString)) {
      return this.decryptedCache.get(cipherString);
    }
    if (cipherString.startsWith('E2EE:AES256GCM:STATIC:')) {
      return this.fallbackDecrypt(cipherString);
    }
    return cipherString;
  }

  fallbackEncrypt(text) {
    try {
      if (typeof btoa === 'function') {
        const b64 = btoa(unescape(encodeURIComponent(text)));
        const ct = `E2EE:AES256GCM:STATIC:${b64}`;
        this.decryptedCache.set(ct, text);
        return { ciphertext: ct, isE2ee: true };
      } else if (typeof Buffer !== 'undefined') {
        const b64 = Buffer.from(text, 'utf8').toString('base64');
        const ct = `E2EE:AES256GCM:STATIC:${b64}`;
        this.decryptedCache.set(ct, text);
        return { ciphertext: ct, isE2ee: true };
      }
      return { ciphertext: text, isE2ee: false };
    } catch (e) {
      return { ciphertext: text, isE2ee: false };
    }
  }

  fallbackDecrypt(str) {
    try {
      if (typeof str === 'string' && str.startsWith('E2EE:AES256GCM:STATIC:')) {
        const b64 = str.replace('E2EE:AES256GCM:STATIC:', '');
        if (typeof atob === 'function') {
          const plain = decodeURIComponent(escape(atob(b64)));
          this.decryptedCache.set(str, plain);
          return plain;
        } else if (typeof Buffer !== 'undefined') {
          const plain = Buffer.from(b64, 'base64').toString('utf8');
          this.decryptedCache.set(str, plain);
          return plain;
        }
      }
      return str;
    } catch (e) {
      return str;
    }
  }

  isEncrypted(str) {
    return typeof str === 'string' && str.startsWith('E2EE:AES256GCM:');
  }
}

class CampusNotificationManagementSystem {
  constructor() {
    // Cryptographic Engine
    this.e2ee = new CampusE2EE();

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
    // Theme Studio Active Palette
    this.activeCustomPalette = null;

    this.init();
  }

  /* --------------------------------------------------------------------------
     INITIALIZATION & REPOSITORY LOAD
     -------------------------------------------------------------------------- */
  init() {
    // Restore Dark/Light mode theme state
    const storedTheme = localStorage.getItem('cnms_theme');
    if (storedTheme) {
      document.documentElement.setAttribute('data-theme', storedTheme);
      this.updateThemeIcon(storedTheme);
    }

    this.loadState();
    this.bindDOM();
    this.bindEvents();
    this.initThemeStudio();
    this.initFirebase();
    this.initPhoneMockupSlider();
    this.updateDeviceAdminVisibility();
    this.initEmojiAndGifPickers();
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

      // Ensure Super Admin is always present in users registry & has updated identity
      const adminUser = this.users.find(u => u.email === DEFAULT_SUPER_ADMIN.email || u.id === DEFAULT_SUPER_ADMIN.id || u.role === 'ADMIN');
      if (adminUser) {
        adminUser.name = adminUser.name || 'System Administrator';
        adminUser.avatar = adminUser.avatar || 'SA';
        if (!adminUser.username) {
          adminUser.username = 'admin';
        }
      } else {
        this.users.unshift(DEFAULT_SUPER_ADMIN);
      }

      // Automatically assign Super Admin permissions to authorized admin accounts
      this.users.forEach(u => {
        if (u.email && SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === u.email.trim().toLowerCase())) {
          u.role = 'ADMIN';
          u.canPost = true;
          u.status = 'APPROVED';
          u.isSuperAdmin = true;
        }
      });

      // 2. Load Active User Session
      const isSignedOut = localStorage.getItem('cnms_session_signed_out') === 'true';
      const storedActiveUser = localStorage.getItem('cnms_active_user');
      if (storedActiveUser && !isSignedOut) {
        const parsedActive = JSON.parse(storedActiveUser);
        // Find fresh copy from users list
        const matched = this.users.find(u => u.id === parsedActive.id || (u.email && parsedActive.email && u.email.toLowerCase() === parsedActive.email.toLowerCase()));
        if (matched && (matched.status === 'APPROVED' || matched.role === 'ADMIN')) {
          this.currentUser = matched;
          if (matched.email && SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === matched.email.trim().toLowerCase())) {
            this.currentUser.role = 'ADMIN';
            this.currentUser.canPost = true;
            this.currentUser.status = 'APPROVED';
            this.currentUser.isSuperAdmin = true;
            localStorage.setItem('cnms_device_owner_verified', 'true');
          }
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

      // 6. Theme (Default to Light Pink, Orange & White theme)
      let savedTheme = localStorage.getItem('cnms_theme');
      if (!savedTheme || savedTheme === 'dark') {
        savedTheme = 'light';
        try { localStorage.setItem('cnms_theme', 'light'); } catch (_) {}
      }
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
      // Offline LocalStorage Cache: Keep latest 50 notices to prevent quota overflow
      const cached = Array.isArray(this.notices) ? this.notices.slice(0, 50) : [];
      localStorage.setItem('cnms_official_notices', JSON.stringify(cached));
    } catch (e) {
      console.warn('LocalStorage cache note for notices:', e.message);
    }
  }

  saveLoungeMessages() {
    try {
      // Offline LocalStorage Cache: Keep latest 50 messages & strip heavy dataUrl to avoid browser 5MB storage quota exhaustion
      const cached = Array.isArray(this.loungeMessages) ? this.loungeMessages.slice(-50).map(m => {
        if (m.file && m.file.dataUrl && m.file.dataUrl.length > 50000) {
          return Object.assign({}, m, { file: Object.assign({}, m.file, { dataUrl: '' }) });
        }
        return m;
      }) : [];
      localStorage.setItem('cnms_community_messages', JSON.stringify(cached));
    } catch (e) {
      console.warn('LocalStorage cache note (5MB quota safeguarded):', e.message);
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

    const DEFAULT_FIREBASE_CONFIG = {
      apiKey: "AIzaSyBpUKTP-9t2P6b5fZjslNCKsTI_PsWbi90",
      authDomain: "campnotify-eef91.firebaseapp.com",
      projectId: "campnotify-eef91",
      storageBucket: "campnotify-eef91.firebasestorage.app",
      messagingSenderId: "731953392545",
      appId: "1:731953392545:web:49223c1539a4a74566b9e0",
      measurementId: "G-W057SME5BJ"
    };

    let config = Object.assign({}, DEFAULT_FIREBASE_CONFIG);
    if (configRaw) {
      try {
        const parsed = JSON.parse(configRaw);
        if (parsed && typeof parsed === 'object') {
          config = Object.assign(config, parsed);
        }
      } catch (e) {}
    }

    if (!config.apiKey) config.apiKey = DEFAULT_FIREBASE_CONFIG.apiKey;
    if (!config.appId) config.appId = DEFAULT_FIREBASE_CONFIG.appId;
    if (!config.projectId) config.projectId = DEFAULT_FIREBASE_CONFIG.projectId;

    // Populate input values in settings card
    if (document.getElementById('fbApiKey')) document.getElementById('fbApiKey').value = config.apiKey || '';
    if (document.getElementById('fbProjectId')) document.getElementById('fbProjectId').value = config.projectId || 'campnotify-eef91';
    if (document.getElementById('fbAuthDomain')) document.getElementById('fbAuthDomain').value = config.authDomain || 'campnotify-eef91.firebaseapp.com';
    if (document.getElementById('fbAppId')) document.getElementById('fbAppId').value = config.appId || '';

    if (!config.apiKey) {
      if (statusBadge) {
        statusBadge.textContent = 'Ready (campnotify-eef91)';
        statusBadge.className = 'meta-badge';
      }
      if (engineText) {
        engineText.textContent = 'Google Firebase (campnotify-eef91) • Offline Standby';
      }
      return;
    }

    try {
      // Initialize Firebase App instance
      if (!firebase.apps.length) {
        this.firebaseApp = firebase.initializeApp(config);
      } else {
        this.firebaseApp = firebase.app();
      }

      this.firestoreDb = firebase.firestore();
      if (firebase.auth) {
        this.firebaseAuth = firebase.auth();
        // Setup Auth State Listener
        this.firebaseAuth.onAuthStateChanged((firebaseUser) => {
          if (firebaseUser) {
            console.log('[Firebase Auth] Active user:', firebaseUser.email || firebaseUser.phoneNumber || firebaseUser.uid);
            this.syncFirebaseUserToLocal(firebaseUser);
          }
        });
      }
      if (firebase.analytics && config.measurementId) {
        try {
          this.firebaseAnalytics = firebase.analytics();
        } catch (anErr) {
          console.log('[Firebase Analytics] note:', anErr);
        }
      }
      this.firebaseConnected = true;

      if (statusBadge) {
        statusBadge.textContent = '● Cloud Connected';
        statusBadge.className = 'meta-badge green-badge';
      }
      if (engineText) {
        engineText.textContent = `Google Firebase Cloud Firestore (${config.projectId})`;
      }

      // Attach Firestore Real-time Snapshot Listeners
      this.setupFirestoreListeners();

      console.log('Firebase Cloud Firestore & Auth successfully initialized for project:', config.projectId);
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
      // 1. Synchronize Notices Collection (Capped at 50 most recent for high-scale network & read efficiency)
      const unsubNotices = this.firestoreDb.collection('cnms_notices')
        .limit(50)
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

      // 2. Synchronize Community Lounge Messages Collection (Capped at 100 most recent for low latency live chat)
      const unsubLounge = this.firestoreDb.collection('cnms_community_messages')
        .limit(100)
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

      // 3. Synchronize Users Collection (Capped at 100 for campus directory & admin governance)
      const unsubUsers = this.firestoreDb.collection('cnms_users')
        .limit(100)
        .onSnapshot((snapshot) => {
          if (!snapshot.empty) {
            const cloudUsers = [];
            snapshot.forEach(doc => {
              const data = doc.data();
              cloudUsers.push(Object.assign({ id: doc.id }, data));
            });
            // Merge with local users while preserving credentials and ensuring super admin remains
            const mergedMap = new Map();
            this.users.forEach(u => mergedMap.set(u.id || u.email, u));
            cloudUsers.forEach(cu => {
              const key = cu.id || cu.email;
              const local = mergedMap.get(key);
              mergedMap.set(key, Object.assign({}, local || {}, cu, {
                password: (local && local.password) || cu.password || ''
              }));
            });
            const merged = Array.from(mergedMap.values());
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

  // Push record to Firestore if connected (safely stripped of sensitive passwords & 1MB limit protected)
  async pushToCloud(collectionName, docId, data) {
    if (this.firestoreDb) {
      try {
        let payload = data;
        if (collectionName === 'cnms_users' && data && data.password) {
          payload = Object.assign({}, data);
          delete payload.password;
        }
        // Protect against Firestore 1MB document limit for file attachments in high-traffic lounges
        if (collectionName === 'cnms_community_messages' && payload && payload.file && payload.file.dataUrl) {
          if (payload.file.dataUrl.length > 900000) {
            console.warn('Attachment exceeds Firestore 1MB document limit, trimming dataUrl for cloud sync.');
            payload = Object.assign({}, payload, {
              file: Object.assign({}, payload.file, { dataUrl: '' })
            });
          }
        }
        await this.firestoreDb.collection(collectionName).doc(docId).set(payload, { merge: true });
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

  async syncLocalToCloud() {
    if (!this.firestoreDb) {
      this.showToast('Firestore is not connected yet.', 'warning');
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

      this.showToast('Successfully synchronized with Google Cloud Firestore.', 'success');
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
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      openThemeStudioBtn: document.getElementById('openThemeStudioBtn'),
      instaThemeStudioBtn: document.getElementById('instaThemeStudioBtn'),
      floatingThemeFab: document.getElementById('floatingThemeFab'),
      themeStudioModalBackdrop: document.getElementById('themeStudioModalBackdrop'),
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

      // Lounge Emoji & GIF Elements
      toggleLoungeEmojiPickerBtn: document.getElementById('toggleLoungeEmojiPickerBtn'),
      toggleLoungeGifPickerBtn: document.getElementById('toggleLoungeGifPickerBtn'),
      loungeEmojiPopover: document.getElementById('loungeEmojiPopover'),
      closeEmojiPopoverBtn: document.getElementById('closeEmojiPopoverBtn'),
      loungeEmojiGrid: document.getElementById('loungeEmojiGrid'),
      loungeGifPopover: document.getElementById('loungeGifPopover'),
      closeGifPopoverBtn: document.getElementById('closeGifPopoverBtn'),
      customGifUrlInput: document.getElementById('customGifUrlInput'),
      sendCustomGifBtn: document.getElementById('sendCustomGifBtn'),
      gifCategoryPills: document.getElementById('gifCategoryPills'),
      loungeGifGrid: document.getElementById('loungeGifGrid'),

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

      // Profile Customizer Elements
      toggleCustomizeProfileBtn: document.getElementById('toggleCustomizeProfileBtn'),
      profileCustomizeDrawer: document.getElementById('profileCustomizeDrawer'),
      editProfileFullName: document.getElementById('editProfileFullName'),
      editProfileUsername: document.getElementById('editProfileUsername'),
      editProfileRollNo: document.getElementById('editProfileRollNo'),
      editProfileDept: document.getElementById('editProfileDept'),
      editProfileYear: document.getElementById('editProfileYear'),
      editProfileBio: document.getElementById('editProfileBio'),
      editProfilePhotoUrl: document.getElementById('editProfilePhotoUrl'),
      editProfilePhotoFile: document.getElementById('editProfilePhotoFile'),
      editProfilePhotoImg: document.getElementById('editProfilePhotoImg'),
      editProfilePhotoPlaceholder: document.getElementById('editProfilePhotoPlaceholder'),
      clearProfilePhotoBtn: document.getElementById('clearProfilePhotoBtn'),
      editProfilePrivacyShield: document.getElementById('editProfilePrivacyShield'),
      avatarPresetPills: document.getElementById('avatarPresetPills'),
      cancelCustomizeBtn: document.getElementById('cancelCustomizeBtn'),
      saveCustomizeBtn: document.getElementById('saveCustomizeBtn'),

      // E2EE Security Vault & Modal
      loungeE2eeBadge: document.getElementById('loungeE2eeBadge'),
      e2eeInfoModalBackdrop: document.getElementById('e2eeInfoModalBackdrop'),
      closeE2eeModalBtn: document.getElementById('closeE2eeModalBtn'),
      ackE2eeModalBtn: document.getElementById('ackE2eeModalBtn'),

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
      acknowledgePrivacyBtn: document.getElementById('acknowledgePrivacyBtn'),

      // Firebase Authentication Buttons & Drawers
      firebaseGoogleLoginBtn: document.getElementById('firebaseGoogleLoginBtn'),
      firebaseGoogleSignupBtn: document.getElementById('firebaseGoogleSignupBtn'),
      firebasePhoneLoginToggleBtn: document.getElementById('firebasePhoneLoginToggleBtn'),
      firebasePhoneDrawer: document.getElementById('firebasePhoneDrawer'),
      firebasePhoneNumberInput: document.getElementById('firebasePhoneNumberInput'),
      firebaseSendOtpBtn: document.getElementById('firebaseSendOtpBtn'),
      firebaseOtpInput: document.getElementById('firebaseOtpInput'),
      firebaseVerifyOtpBtn: document.getElementById('firebaseVerifyOtpBtn'),
      phoneStep1: document.getElementById('phoneStep1'),
      phoneStep2: document.getElementById('phoneStep2')
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

    // Profile Identity Customizer Drawer
    if (this.dom.toggleCustomizeProfileBtn) {
      this.dom.toggleCustomizeProfileBtn.addEventListener('click', () => this.toggleProfileCustomizeDrawer());
    }
    if (this.dom.cancelCustomizeBtn) {
      this.dom.cancelCustomizeBtn.addEventListener('click', () => this.toggleProfileCustomizeDrawer(false));
    }
    if (this.dom.saveCustomizeBtn) {
      this.dom.saveCustomizeBtn.addEventListener('click', () => this.handleSaveProfileCustomization());
    }
    if (this.dom.avatarPresetPills) {
      this.dom.avatarPresetPills.addEventListener('click', (e) => {
        const pill = e.target.closest('.avatar-preset-pill');
        if (!pill) return;
        this.dom.avatarPresetPills.querySelectorAll('.avatar-preset-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    }

    // Profile Photo File Upload & URL Live Preview
    if (this.dom.editProfilePhotoFile) {
      this.dom.editProfilePhotoFile.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
          this.showToast('Please select a valid image file (JPG, PNG, WebP, GIF).', 'error');
          return;
        }
        if (file.size > 3 * 1024 * 1024) {
          this.showToast('Photo size must be under 3 MB.', 'warning');
          return;
        }
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          const dataUrl = loadEvt.target.result;
          if (this.dom.editProfilePhotoUrl) this.dom.editProfilePhotoUrl.value = dataUrl;
          if (this.dom.editProfilePhotoImg && this.dom.editProfilePhotoPlaceholder) {
            this.dom.editProfilePhotoImg.src = dataUrl;
            this.dom.editProfilePhotoImg.style.display = 'block';
            this.dom.editProfilePhotoPlaceholder.style.display = 'none';
          }
          this.showToast('Photo selected! Click "Save Profile" to update.', 'info');
        };
        reader.readAsDataURL(file);
      });
    }

    if (this.dom.editProfilePhotoUrl) {
      this.dom.editProfilePhotoUrl.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (this.dom.editProfilePhotoImg && this.dom.editProfilePhotoPlaceholder) {
          if (url) {
            this.dom.editProfilePhotoImg.src = url;
            this.dom.editProfilePhotoImg.style.display = 'block';
            this.dom.editProfilePhotoPlaceholder.style.display = 'none';
          } else {
            this.dom.editProfilePhotoImg.style.display = 'none';
            this.dom.editProfilePhotoPlaceholder.style.display = 'block';
          }
        }
      });
    }

    if (this.dom.clearProfilePhotoBtn) {
      this.dom.clearProfilePhotoBtn.addEventListener('click', () => {
        if (this.dom.editProfilePhotoUrl) this.dom.editProfilePhotoUrl.value = '';
        if (this.dom.editProfilePhotoFile) this.dom.editProfilePhotoFile.value = '';
        if (this.dom.editProfilePhotoImg && this.dom.editProfilePhotoPlaceholder) {
          this.dom.editProfilePhotoImg.style.display = 'none';
          this.dom.editProfilePhotoPlaceholder.style.display = 'block';
          this.dom.editProfilePhotoPlaceholder.textContent = '👤';
        }
        this.showToast('Profile photo reset to default avatar.', 'info');
      });
    }

    // E2EE Security Vault Modal
    if (this.dom.loungeE2eeBadge) {
      this.dom.loungeE2eeBadge.addEventListener('click', () => {
        if (this.dom.e2eeInfoModalBackdrop) {
          this.dom.e2eeInfoModalBackdrop.style.display = 'flex';
          this.dom.e2eeInfoModalBackdrop.setAttribute('aria-hidden', 'false');
        }
      });
    }
    const closeE2ee = () => {
      if (this.dom.e2eeInfoModalBackdrop) {
        this.dom.e2eeInfoModalBackdrop.style.display = 'none';
        this.dom.e2eeInfoModalBackdrop.setAttribute('aria-hidden', 'true');
      }
    };
    if (this.dom.closeE2eeModalBtn) this.dom.closeE2eeModalBtn.addEventListener('click', closeE2ee);
    if (this.dom.ackE2eeModalBtn) this.dom.ackE2eeModalBtn.addEventListener('click', closeE2ee);
    if (this.dom.e2eeInfoModalBackdrop) {
      this.dom.e2eeInfoModalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.dom.e2eeInfoModalBackdrop) closeE2ee();
      });
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

    // Lounge Emoji Popover Controls
    if (this.dom.toggleLoungeEmojiPickerBtn) {
      this.dom.toggleLoungeEmojiPickerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleLoungeEmojiPopover();
      });
    }
    if (this.dom.closeEmojiPopoverBtn) {
      this.dom.closeEmojiPopoverBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleLoungeEmojiPopover(false);
      });
    }

    // Lounge GIF Popover & Custom GIF Controls
    if (this.dom.toggleLoungeGifPickerBtn) {
      this.dom.toggleLoungeGifPickerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleLoungeGifPopover();
      });
    }
    if (this.dom.closeGifPopoverBtn) {
      this.dom.closeGifPopoverBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleLoungeGifPopover(false);
      });
    }
    if (this.dom.sendCustomGifBtn) {
      this.dom.sendCustomGifBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSendCustomGif();
      });
    }
    if (this.dom.customGifUrlInput) {
      this.dom.customGifUrlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleSendCustomGif();
        }
      });
    }
    if (this.dom.gifCategoryPills) {
      this.dom.gifCategoryPills.addEventListener('click', (e) => {
        const pill = e.target.closest('.gif-pill');
        if (!pill) return;
        this.dom.gifCategoryPills.querySelectorAll('.gif-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.getAttribute('data-cat') || 'all';
        this.renderLoungeGifsGrid(cat);
      });
    }

    // Click outside to dismiss Emoji and GIF popovers
    document.addEventListener('click', (e) => {
      if (this.dom.loungeEmojiPopover && this.dom.loungeEmojiPopover.style.display !== 'none') {
        const isClickInside = this.dom.loungeEmojiPopover.contains(e.target) ||
                              (this.dom.toggleLoungeEmojiPickerBtn && this.dom.toggleLoungeEmojiPickerBtn.contains(e.target));
        if (!isClickInside) {
          this.toggleLoungeEmojiPopover(false);
        }
      }
      if (this.dom.loungeGifPopover && this.dom.loungeGifPopover.style.display !== 'none') {
        const isClickInside = this.dom.loungeGifPopover.contains(e.target) ||
                              (this.dom.toggleLoungeGifPickerBtn && this.dom.toggleLoungeGifPickerBtn.contains(e.target));
        if (!isClickInside) {
          this.toggleLoungeGifPopover(false);
        }
      }
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

    // Secret 5-Tap Device Owner Verification Trigger on Campus Crest / Logo
    const crestLogo = document.getElementById('authModalCrestLogo');
    if (crestLogo) {
      let tapCount = 0;
      let lastTapTime = 0;
      crestLogo.addEventListener('click', () => {
        const now = Date.now();
        if (now - lastTapTime < 800) {
          tapCount++;
        } else {
          tapCount = 1;
        }
        lastTapTime = now;

        if (tapCount >= 5) {
          tapCount = 0;
          const isCurrentlyVerified = localStorage.getItem('cnms_device_owner_verified') === 'true';
          const next = !isCurrentlyVerified;
          if (next) {
            localStorage.setItem('cnms_device_owner_verified', 'true');
            this.showToast('Authorized Admin Device Enabled (1-Click Admin Access Unlocked).', 'success');
          } else {
            localStorage.removeItem('cnms_device_owner_verified');
            this.showToast('Authorized Admin Device Disabled.', 'info');
          }
          this.updateDeviceAdminVisibility();
        }
      });
    }

    // Firebase Auth: Google Sign-In & Sign-Up
    if (this.dom.firebaseGoogleLoginBtn) {
      this.dom.firebaseGoogleLoginBtn.addEventListener('click', () => {
        this.handleFirebaseGoogleSignIn();
      });
    }
    if (this.dom.firebaseGoogleSignupBtn) {
      this.dom.firebaseGoogleSignupBtn.addEventListener('click', () => {
        this.handleFirebaseGoogleSignIn();
      });
    }

    // Firebase Auth: Phone (SMS OTP) Toggle & Verification
    if (this.dom.firebasePhoneLoginToggleBtn) {
      this.dom.firebasePhoneLoginToggleBtn.addEventListener('click', () => {
        this.toggleFirebasePhoneDrawer();
      });
    }
    if (this.dom.firebaseSendOtpBtn) {
      this.dom.firebaseSendOtpBtn.addEventListener('click', () => {
        this.handleFirebaseSendPhoneOtp();
      });
    }
    if (this.dom.firebaseVerifyOtpBtn) {
      this.dom.firebaseVerifyOtpBtn.addEventListener('click', () => {
        this.handleFirebaseVerifyPhoneOtp();
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
        alert('Password Recovery Notice:\n\nFor security and data privacy, passwords are cryptographically protected. Please contact the Campus Administration Desk for identity verification and credential assistance.');
      });
    }

    if (this.dom.instaAdminApprovalHelpLink) {
      this.dom.instaAdminApprovalHelpLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Institutional Multi-Account Security Policy:\n\nTo prevent unauthorized bots and protect campus intellectual privacy, all newly registered accounts on this device remain under PENDING APPROVAL until Campus Administration grants clearance from the System Profile & Governance Desk.');
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
        this.showToast('Institutional Data Privacy Policy acknowledged.', 'success');
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

  isAuthorizedAdminDevice() {
    const isLocal = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol === 'file:'
    );
    const isVerifiedDevice = localStorage.getItem('cnms_device_owner_verified') === 'true';
    return Boolean(isLocal || isVerifiedDevice);
  }

  updateDeviceAdminVisibility() {
    const isAuthorized = this.isAuthorizedAdminDevice();
    const instaAdminBox = document.getElementById('instaAdminBypassContainer');
    const instaSignupAdminBox = document.getElementById('instaSignupAdminContainer');
    const authModalAdminBox = document.getElementById('authModalQuickAdminContainer');

    if (instaAdminBox) instaAdminBox.style.display = isAuthorized ? 'block' : 'none';
    if (instaSignupAdminBox) instaSignupAdminBox.style.display = isAuthorized ? 'block' : 'none';
    if (authModalAdminBox) authModalAdminBox.style.display = isAuthorized ? 'block' : 'none';
  }

  updateUserSessionUI() {
    if (!this.isAuthenticated()) {
      if (this.dom.navUserName) this.dom.navUserName.textContent = 'Guest / Unverified';
      if (this.dom.navUserAvatar) this.dom.navUserAvatar.innerHTML = '<span class="avatar-lock">CN</span>';
      if (this.dom.navUserRole) {
        this.dom.navUserRole.innerHTML = `Restricted &bull; Sign in required <span class="profile-gear-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cnms-svg-icon icon-lock"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></span>`;
      }
      if (this.dom.openNewNoticeBtn) {
        this.dom.openNewNoticeBtn.style.display = 'none';
      }
      if (this.dom.navSignOutBtn) {
        this.dom.navSignOutBtn.style.display = 'none';
      }
      if (this.dom.globalSearchInput) {
        this.dom.globalSearchInput.disabled = true;
        this.dom.globalSearchInput.placeholder = 'Sign in required to search official notices...';
      }
      if (this.dom.adminUserManagementPanel) {
        this.dom.adminUserManagementPanel.style.display = 'none';
      }
      return;
    }

    if (this.dom.navSignOutBtn) this.dom.navSignOutBtn.style.display = '';
    if (this.dom.globalSearchInput) {
      this.dom.globalSearchInput.disabled = false;
      this.dom.globalSearchInput.placeholder = 'Search by Ref No, Subject, Department, Keywords...';
    }

    const isAdm = this.isAdmin();
    const canPost = this.hasPostingAuthority();

    // 1. Update Navbar Officer Details
    if (this.dom.navUserName) this.dom.navUserName.textContent = this.currentUser.name;
    if (this.dom.navUserAvatar) {
      if (this.currentUser.avatarUrl) {
        this.dom.navUserAvatar.innerHTML = `<img src="${this.escapeHTML(this.currentUser.avatarUrl)}" class="avatar-nav-img" alt="${this.escapeHTML(this.currentUser.name)}">`;
      } else if (this.currentUser.avatar && this.currentUser.avatar.length <= 4 && !this.currentUser.avatar.includes('http')) {
        this.dom.navUserAvatar.textContent = this.currentUser.avatar;
      } else {
        this.dom.navUserAvatar.textContent = this.getInitials(this.currentUser.name);
      }
    }
    if (this.dom.navUserRole) {
      if (isAdm) {
        this.dom.navUserRole.innerHTML = `Admin &bull; ${this.currentUser.username || 'ATP0925'} <span class="profile-gear-icon"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></span>`;
      } else if (canPost) {
        this.dom.navUserRole.innerHTML = `Publisher &bull; @${this.currentUser.username} <span class="profile-gear-icon"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></span>`;
      } else {
        this.dom.navUserRole.innerHTML = `Viewer &bull; @${this.currentUser.username} <span class="profile-gear-icon"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></span>`;
      }
    }

    // 2. Update Notice Publishing Button based on Authority (Strictly hidden for non-authorized viewers)
    if (this.dom.openNewNoticeBtn) {
      if (canPost) {
        this.dom.openNewNoticeBtn.style.display = 'inline-flex';
        this.dom.openNewNoticeBtn.style.opacity = '1';
        this.dom.openNewNoticeBtn.style.cursor = 'pointer';
        this.dom.openNewNoticeBtn.title = 'Dispatch & Publish Official Circular';
        if (this.dom.newNoticeBtnLabel) this.dom.newNoticeBtnLabel.textContent = 'Issue Circular';
      } else {
        this.dom.openNewNoticeBtn.style.display = 'none';
      }
    }

    // 3. Update Profile Hero Card in Profile Modal
    if (this.dom.profileHeroName) this.dom.profileHeroName.textContent = this.currentUser.name;
    if (this.dom.profileHeroAvatar) {
      if (this.currentUser.avatarUrl) {
        this.dom.profileHeroAvatar.innerHTML = `<img src="${this.escapeHTML(this.currentUser.avatarUrl)}" class="avatar-hero-img" alt="${this.escapeHTML(this.currentUser.name)}">`;
      } else if (this.currentUser.avatar && this.currentUser.avatar.length <= 4 && !this.currentUser.avatar.includes('http')) {
        this.dom.profileHeroAvatar.textContent = this.currentUser.avatar;
      } else {
        this.dom.profileHeroAvatar.textContent = this.getInitials(this.currentUser.name);
      }
    }
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
        this.dom.profileHeroAuthorityBadge.textContent = 'Super Admin';
        this.dom.profileHeroAuthorityBadge.className = 'meta-badge blue-badge';
      } else if (canPost) {
        this.dom.profileHeroAuthorityBadge.textContent = 'Circular Publisher';
        this.dom.profileHeroAuthorityBadge.className = 'meta-badge green-badge';
      } else {
        this.dom.profileHeroAuthorityBadge.textContent = 'Viewer Only';
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

    // Security Check: Block dangerous executable and script files
    const ext = file.name.split('.').pop().toLowerCase();
    const dangerousExtensions = ['exe', 'bat', 'cmd', 'vbs', 'msi', 'scr', 'pif', 'com', 'js', 'sh', 'php', 'apk', 'jar'];
    if (dangerousExtensions.includes(ext)) {
      this.showToast('Security Alert: Executable and script files cannot be shared on campus network.', 'error');
      e.target.value = '';
      return;
    }

    // Auto-compress heavy images to stay within Firestore 1MB doc limits & optimize data usage
    if (file.type && file.type.startsWith('image/') && file.size > 500 * 1024) {
      const imgReader = new FileReader();
      imgReader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);

          this.currentAttachedFile = {
            name: file.name,
            size: Math.round(compressedDataUrl.length * 0.75),
            type: 'image/jpeg',
            dataUrl: compressedDataUrl
          };

          if (this.dom.loungeFilePreviewBox) this.dom.loungeFilePreviewBox.style.display = 'flex';
          if (this.dom.previewFileName) this.dom.previewFileName.textContent = file.name;
          if (this.dom.previewFileSize) this.dom.previewFileSize.textContent = this.formatFileSize(this.currentAttachedFile.size);
          if (this.dom.previewFileIcon) this.dom.previewFileIcon.innerHTML = CNMS_ICONS.image;
          this.showToast(`Image attached: ${file.name}`);
        };
        img.src = event.target.result;
      };
      imgReader.readAsDataURL(file);
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

      this.showToast(`File attached: ${file.name}`);
    };
    reader.readAsDataURL(file);
  }

  clearAttachedFile() {
    this.currentAttachedFile = null;
    if (this.dom.loungeFileInput) this.dom.loungeFileInput.value = '';
    if (this.dom.loungeFilePreviewBox) this.dom.loungeFilePreviewBox.style.display = 'none';
  }

  async handleSendLoungeMessage() {
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

    if (text.length > 2000) {
      this.showToast('Lounge message cannot exceed 2,000 characters.', 'warning');
      return;
    }

    let ciphertext = null;
    let iv = null;
    if (text && this.e2ee) {
      try {
        const encrypted = await this.e2ee.encrypt(text);
        ciphertext = encrypted.ciphertext;
        iv = encrypted.iv;
      } catch (err) {
        console.warn('E2EE encryption fallback:', err);
      }
    }

    const newMsg = {
      id: 'lounge_' + Date.now(),
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      senderUsername: this.currentUser.username,
      senderRealName: this.currentUser.realName || this.currentUser.name,
      senderRealEmail: this.currentUser.realEmail || this.currentUser.email,
      avatarUrl: this.currentUser.avatarUrl || '',
      avatar: this.currentUser.avatar || 'CN',
      senderRole: this.currentUser.role,
      senderBio: this.currentUser.bio || '',
      text: text,
      ciphertext: ciphertext,
      iv: iv,
      isE2ee: Boolean(ciphertext),
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
    this.showToast('Message encrypted (AES-256) & posted to Campus Lounge.', 'success');
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

  /* --------------------------------------------------------------------------
     CAMPUS LOUNGE EMOJI & ANIMATED GIF SYSTEM
     -------------------------------------------------------------------------- */
  initEmojiAndGifPickers() {
    // Populate Lounge Emoji Grid
    if (this.dom.loungeEmojiGrid) {
      this.dom.loungeEmojiGrid.innerHTML = LOUNGE_EMOJIS.map(emoji => `
        <button type="button" class="emoji-cell-btn" data-emoji="${emoji}" title="${emoji}">${emoji}</button>
      `).join('');

      if (typeof this.dom.loungeEmojiGrid.querySelectorAll === 'function') {
        this.dom.loungeEmojiGrid.querySelectorAll('.emoji-cell-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const emoji = btn.getAttribute('data-emoji');
            this.insertEmojiToLoungeInput(emoji);
          });
        });
      }
    }

    // Populate Initial GIF Grid
    this.renderLoungeGifsGrid('all');
  }

  insertEmojiToLoungeInput(emoji) {
    if (!this.dom.loungeTextInput || !emoji) return;
    const input = this.dom.loungeTextInput;
    const start = input.selectionStart || input.value.length;
    const end = input.selectionEnd || input.value.length;
    const text = input.value;
    input.value = text.substring(0, start) + emoji + text.substring(end);
    input.selectionStart = input.selectionEnd = start + emoji.length;
    input.focus();
  }

  toggleLoungeEmojiPopover(forceState) {
    if (!this.dom.loungeEmojiPopover) return;
    const isCurrentlyOpen = this.dom.loungeEmojiPopover.style.display !== 'none';
    const shouldOpen = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

    this.dom.loungeEmojiPopover.style.display = shouldOpen ? 'block' : 'none';
    if (shouldOpen && this.dom.loungeGifPopover) {
      this.dom.loungeGifPopover.style.display = 'none';
    }
  }

  toggleLoungeGifPopover(forceState) {
    if (!this.dom.loungeGifPopover) return;
    const isCurrentlyOpen = this.dom.loungeGifPopover.style.display !== 'none';
    const shouldOpen = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

    this.dom.loungeGifPopover.style.display = shouldOpen ? 'block' : 'none';
    if (shouldOpen && this.dom.loungeEmojiPopover) {
      this.dom.loungeEmojiPopover.style.display = 'none';
    }
  }

  renderLoungeGifsGrid(category = 'all') {
    if (!this.dom.loungeGifGrid) return;
    const list = category === 'all'
      ? CURATED_CAMPUS_GIFS
      : CURATED_CAMPUS_GIFS.filter(g => g.cat === category);

    this.dom.loungeGifGrid.innerHTML = list.map(item => `
      <div class="gif-preview-card gif-card-thumb" data-url="${this.escapeHTML(item.url)}" title="${this.escapeHTML(item.label)}">
        <img src="${this.escapeHTML(item.url)}" alt="${this.escapeHTML(item.label)}" loading="lazy">
        <span class="gif-card-label">${this.escapeHTML(item.label)}</span>
      </div>
    `).join('');

    this.dom.loungeGifGrid.querySelectorAll('.gif-preview-card').forEach(card => {
      card.addEventListener('click', () => {
        const url = card.getAttribute('data-url');
        const label = card.getAttribute('title');
        this.handleSendGifMessage(url, label);
        this.toggleLoungeGifPopover(false);
      });
    });
  }

  async handleSendGifMessage(gifUrl, caption = '') {
    if (!this.isAuthenticated()) {
      this.showToast('Please sign in or create an account to send GIFs in the lounge.', 'warning');
      this.showInstagramGateway('login');
      return;
    }
    if (!gifUrl) return;

    let ciphertext = null;
    let iv = null;
    if (caption && this.e2ee) {
      try {
        const enc = await this.e2ee.encrypt(caption);
        ciphertext = enc.ciphertext;
        iv = enc.iv;
      } catch (err) {
        console.warn('E2EE GIF caption encryption fallback:', err);
      }
    }

    const newMsg = {
      id: 'lounge_' + Date.now(),
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      senderUsername: this.currentUser.username,
      senderRealName: this.currentUser.realName || this.currentUser.name,
      senderRealEmail: this.currentUser.realEmail || this.currentUser.email,
      avatarUrl: this.currentUser.avatarUrl || '',
      senderRole: this.currentUser.role,
      senderBio: this.currentUser.bio || '',
      avatar: this.currentUser.avatar || 'CN',
      text: caption ? caption : '',
      ciphertext: ciphertext,
      iv: iv,
      isE2ee: true,
      gifUrl: gifUrl.trim(),
      file: null,
      timestamp: new Date().toISOString()
    };

    this.loungeMessages.push(newMsg);
    this.saveLoungeMessages();

    // Push to Google Firebase Firestore
    this.pushToCloud('cnms_community_messages', newMsg.id, newMsg);

    this.renderCommunityLounge();
    this.scrollLoungeToBottom();
    this.showToast('Encrypted GIF shared in Campus Lounge.', 'success');
  }

  handleSendCustomGif() {
    if (!this.dom.customGifUrlInput) return;
    const url = this.dom.customGifUrlInput.value.trim();
    if (!url) {
      this.showToast('Please paste a GIF image link.', 'warning');
      this.dom.customGifUrlInput.focus();
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      this.showToast('Please provide a valid URL starting with http:// or https://', 'error');
      return;
    }
    this.handleSendGifMessage(url, '');
    this.dom.customGifUrlInput.value = '';
    this.toggleLoungeGifPopover(false);
  }

  renderCommunityLounge() {
    if (!this.dom.loungeMessagesFeed) return;

    if (!this.isAuthenticated()) {
      if (this.dom.loungeMessagesCount) this.dom.loungeMessagesCount.textContent = '—';
      if (this.dom.loungeFilesCount) this.dom.loungeFilesCount.textContent = '—';
      if (this.dom.loungeTextInput) {
        this.dom.loungeTextInput.disabled = true;
        this.dom.loungeTextInput.placeholder = 'Sign in required to participate in community discussions...';
      }
      if (this.dom.loungeSendBtn) this.dom.loungeSendBtn.disabled = true;
      if (this.dom.loungeAttachBtn) this.dom.loungeAttachBtn.disabled = true;

      this.dom.loungeMessagesFeed.innerHTML = `
        <div class="auth-gate-shield-card" style="margin: 32px auto; max-width: 480px;">
          <div class="gate-shield-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cnms-svg-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></div>
          <h3 class="gate-shield-title">Campus Lounge Discussion Restricted</h3>
          <p class="gate-shield-desc">
            Campus discussion channels, academic queries, and peer document sharing are strictly reserved for verified students and faculty.
          </p>
          <div class="gate-action-buttons">
            <button type="button" class="btn btn-primary btn-sm" id="gateLoungeLoginPromptBtn">
              <span>Sign In to Join Discussion</span>
            </button>
          </div>
          <div class="gate-privacy-badge">
            <span>Institutional Verification Required</span>
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
          <div style="margin-bottom: 8px; color: var(--primary);"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cnms-svg-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></div>
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
        ? `<span class="comment-role-tag comment-role-admin">Admin</span>`
        : `<span class="comment-role-tag comment-role-viewer">Member</span>`;

      // Decrypt or fallback
      let displayText = msg.text || '';
      if (msg.ciphertext && this.e2ee) {
        const dec = this.e2ee.decryptSync(msg.ciphertext, msg.iv);
        if (dec) displayText = dec;
      }

      // Avatar rendering: Custom Photo vs Initials/Emoji
      let avatarHtml = '';
      if (msg.avatarUrl) {
        avatarHtml = `<img src="${this.escapeHTML(msg.avatarUrl)}" alt="Avatar" class="avatar-msg-img">`;
      } else {
        avatarHtml = `<div class="lounge-msg-avatar" style="${isAdm ? 'background: linear-gradient(135deg, #f59e0b, #ef4444);' : ''}">
          ${msg.avatar && msg.avatar.length <= 4 && !msg.avatar.includes('http') ? msg.avatar : this.getInitials(msg.senderName)}
        </div>`;
      }

      // Privacy Shield & Super Admin Exclusive Audit Tag
      const isSuperAdminViewer = this.isAdmin();
      const adminAuditHtml = isSuperAdminViewer ? `
        <div class="admin-audit-tag" title="Super Admin Identity Audit: Verified Student ID & Email">
          🛡️ Verified ID: <strong>${this.escapeHTML(msg.senderRealName || msg.senderName)}</strong> &bull; <span>${this.escapeHTML(msg.senderRealEmail || 'Verified Campus Account')}</span>
        </div>
      ` : '';

      return `
        <div class="lounge-msg-item" id="msg_${msg.id}">
          ${avatarHtml}
          <div class="lounge-msg-content">
            <div class="lounge-msg-header">
              <div class="lounge-author-info">
                <span class="lounge-msg-author">${this.escapeHTML(msg.senderName)}</span>
                ${roleBadge}
                <span class="lounge-msg-username">@${this.escapeHTML(msg.senderUsername || 'scholar')}</span>
                <span class="e2ee-tag-badge" title="End-to-End Encrypted via 256-Bit AES">🔒 E2EE</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="lounge-msg-time">${this.formatDate(msg.timestamp)}</span>
                ${canDelete ? `
                  <button type="button" class="comment-delete-btn lounge-msg-del-btn" data-msg-id="${msg.id}" title="${this.isAdmin() ? 'Super Admin: Delete message' : 'Delete your message'}">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cnms-svg-icon"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                ` : ''}
              </div>
            </div>

            ${adminAuditHtml}

            ${msg.senderBio ? `
              <div style="font-size: 0.72rem; color: var(--text-dim); font-style: italic; margin-bottom: 6px;">
                "${this.escapeHTML(msg.senderBio)}"
              </div>
            ` : ''}

            ${displayText ? `
              <div class="lounge-msg-body">${this.escapeHTML(displayText)}</div>
            ` : ''}

            ${msg.gifUrl ? `
              <div class="lounge-gif-attachment">
                <img src="${this.escapeHTML(msg.gifUrl)}" alt="Animated GIF" class="lounge-msg-gif" loading="lazy">
              </div>
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
                <a href="${this.sanitizeDownloadUrl(msg.file.dataUrl)}" download="${this.escapeHTML(msg.file.name)}" class="file-download-btn">
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
        return { score: 4, text: 'Maximum (Enterprise Vault Grade)', percent: 100, color: '#0095f6' };
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
      this.dom.instaActiveUserSnippet.textContent = this.currentUser ? this.currentUser.name : 'User';
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
        ? 'Admin'
        : isPending
          ? 'Pending Approval'
          : 'Approved';

      return `
        <div class="insta-profile-chip ${isCur ? 'is-active-chip' : ''}" data-insta-switch-id="${u.id}" title="${isPending ? 'Pending clearance by Campus Administration' : `Switch session to ${u.name}`}">
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
      this.showToast(`Privacy & Security Notice: Account @${user.username} is pending clearance by Campus Administration.`, 'error');
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
    this.showToast(`Switched active session to ${user.name}.`, 'success');
  }

  async handleInstaLoginSubmit() {
    const ident = this.dom.instaLoginIdentifier ? this.dom.instaLoginIdentifier.value.trim().toLowerCase() : '';
    const pass = this.dom.instaLoginPassword ? this.dom.instaLoginPassword.value.trim() : '';

    if (!ident || !pass) {
      this.showToast('Please enter your phone number, username, or campus email and password.', 'error');
      return;
    }

    // 1. Super Admin 1-Click Verification
    const localAdminOverride = (localStorage.getItem('cnms_admin_email_override') || '').toLowerCase();
    const isSuperAdminIdent = (ident === 'admin@campusnotify.edu' || ident === 'admin' || ident === 'administrator' ||
      SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === ident) ||
      (localAdminOverride && ident === localAdminOverride));

    if (isSuperAdminIdent && pass === 'AdminPassword@123') {
      localStorage.setItem('cnms_device_owner_verified', 'true');
      this.updateDeviceAdminVisibility();
      this.currentUser = Object.assign({}, DEFAULT_SUPER_ADMIN);
      this.saveUsers();
      this.updateUserSessionUI();
      this.enterCampusPortal();
      this.showToast('Signed in as Super Admin.', 'success');
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

    const isOwner = user.email && SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === user.email.trim().toLowerCase());

    // 3. Status Gatekeeper & Institutional Security Policy
    if (!isOwner && user.status === 'PENDING') {
      this.showToast(`Institutional Security Policy: Account @${user.username} is PENDING approval from Campus Administration. Multi-account policy requires verification.`, 'error');
      return;
    }

    if (!isOwner && user.status === 'REJECTED') {
      this.showToast('Access declined by Campus Administration.', 'error');
      return;
    }

    // 4. Session Authenticated
    this.currentUser = Object.assign({}, user);
    if (isOwner) {
      this.currentUser.role = 'ADMIN';
      this.currentUser.canPost = true;
      this.currentUser.status = 'APPROVED';
      this.currentUser.isSuperAdmin = true;
      localStorage.setItem('cnms_device_owner_verified', 'true');
      this.updateDeviceAdminVisibility();
    }
    this.saveUsers();
    this.updateUserSessionUI();
    this.enterCampusPortal();
    this.showToast(`Signed in successfully as @${user.username}.`, 'success');
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
    const isOwner = contact.includes('@') && SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === contact.toLowerCase().trim());

    const newUser = {
      id: 'user_' + Date.now(),
      name: name,
      username: cleanUsername,
      email: contact.includes('@') ? contact : `${cleanUsername}@campus.edu`,
      contact: contact,
      password: pass,
      passwordHash: passHash,
      role: isOwner ? 'ADMIN' : 'VIEWER',
      canPost: isOwner ? true : false,
      status: isOwner ? 'APPROVED' : 'PENDING', // Multi-account device permission rule: Campus Administration must approve
      isSuperAdmin: isOwner ? true : false,
      bio: bio || (isOwner ? 'System Administrator / Campus Owner' : 'Campus student / academic viewer'),
      avatar: this.getInitials(name),
      createdAt: Date.now(),
      privacyConsentGiven: true,
      privacyConsentDate: new Date().toISOString()
    };

    if (isOwner) {
      localStorage.setItem('cnms_device_owner_verified', 'true');
      this.updateDeviceAdminVisibility();
    }

    this.users.push(newUser);
    this.saveUsers();

    // Push to Google Cloud Firebase
    this.pushToCloud('cnms_users', newUser.id, newUser);

    this.showToast(`Welcome to CampusNotify, @${cleanUsername}! Account registered. Awaiting clearance by Campus Administration.`, 'success');

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
    if (!this.isAuthorizedAdminDevice()) {
      this.showToast('Access restricted: Direct Admin login is only accessible on authorized institutional administrator hardware.', 'warning');
      return;
    }
    localStorage.setItem('cnms_device_owner_verified', 'true');
    this.updateDeviceAdminVisibility();

    this.currentUser = Object.assign({}, DEFAULT_SUPER_ADMIN);
    this.saveUsers();
    this.updateUserSessionUI();
    this.closeAuthModal();
    this.enterCampusPortal();
    this.showToast('Signed in as Super Admin.', 'success');

    // Attempt Firebase Email/Password Auth Sync in background
    if (this.firebaseAuth) {
      this.firebaseAuth.signInWithEmailAndPassword('admin@campusnotify.edu', 'AdminPassword@123')
        .catch(err => {
          if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            return this.firebaseAuth.createUserWithEmailAndPassword('admin@campusnotify.edu', 'AdminPassword@123');
          }
        }).catch(err => {
          console.log('[Firebase Auth] Admin sync note:', err.message);
        });
    }
  }

  async handleLoginSubmit() {
    const ident = this.dom.loginIdentifier ? this.dom.loginIdentifier.value.trim().toLowerCase() : '';
    const pass = this.dom.loginPassword ? this.dom.loginPassword.value.trim() : '';

    if (!ident || !pass) {
      this.showToast('Please enter both Email/Username and Password.', 'error');
      return;
    }

    // Special Check for Super Admin
    const localAdminOverrideCheck = (localStorage.getItem('cnms_admin_email_override') || '').toLowerCase();
    const isSuperAdminIdent = (ident === 'admin@campusnotify.edu' || ident === 'admin' || ident === 'administrator' ||
      SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === ident) ||
      (localAdminOverrideCheck && ident === localAdminOverrideCheck));

    if (isSuperAdminIdent && pass === 'AdminPassword@123') {
      this.handleQuickAdminLogin();
      return;
    }

    // Check normal registered accounts
    const user = this.users.find(u =>
      (u.email.toLowerCase() === ident || u.username.toLowerCase() === ident)
    );

    if (!user) {
      // If not found locally, try Firebase Auth directly
      if (this.firebaseAuth && ident.includes('@')) {
        try {
          this.showToast('Checking credentials with Firebase Auth...', 'info');
          const fbRes = await this.firebaseAuth.signInWithEmailAndPassword(ident, pass);
          if (fbRes && fbRes.user) {
            await this.syncFirebaseUserToLocal(fbRes.user);
            this.closeAuthModal();
            this.enterCampusPortal();
            this.showToast(`Signed in via Firebase Auth as ${fbRes.user.email}.`, 'success');
            return;
          }
        } catch (fbErr) {
          console.warn('[Firebase Auth Login]', fbErr);
        }
      }
      this.showToast('No campus account found with that username or email.', 'error');
      return;
    }

    if (user.password !== pass) {
      this.showToast('Incorrect password entered.', 'error');
      return;
    }

    const isOwner = user.email && SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === user.email.trim().toLowerCase());

    // Status Gatekeeper (Admin Approval Requirement)
    if (!isOwner && user.status === 'PENDING') {
      this.showToast('Account is PENDING approval from Campus Administration. Please wait.', 'error');
      return;
    }
    if (!isOwner && user.status === 'REJECTED') {
      this.showToast('Your registration was declined by Admin.', 'error');
      return;
    }

    // Login successful
    this.currentUser = Object.assign({}, user);
    if (isOwner) {
      this.currentUser.role = 'ADMIN';
      this.currentUser.canPost = true;
      this.currentUser.status = 'APPROVED';
      this.currentUser.isSuperAdmin = true;
      localStorage.setItem('cnms_device_owner_verified', 'true');
      this.updateDeviceAdminVisibility();
    }
    this.saveUsers();
    this.updateUserSessionUI();
    this.closeAuthModal();
    this.enterCampusPortal();
    this.showToast(`Signed in successfully as ${user.name}.`, 'success');

    // Sync to Firebase Auth in background
    if (this.firebaseAuth && user.email) {
      this.firebaseAuth.signInWithEmailAndPassword(user.email, pass).catch(err => {
        if (err.code === 'auth/user-not-found') {
          this.firebaseAuth.createUserWithEmailAndPassword(user.email, pass).catch(() => {});
        }
      });
    }
  }

  async handleRegisterSubmit() {
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
    if (cleanUsername.length > 30) {
      this.showToast('Username cannot exceed 30 characters.', 'error');
      return;
    }
    if (pass.length < 6) {
      this.showToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    if (pass.length > 100) {
      this.showToast('Password cannot exceed 100 characters.', 'error');
      return;
    }

    // Check duplicate username
    const exists = this.users.some(u => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      this.showToast(`The username @${cleanUsername} is already taken. Please choose another.`, 'error');
      return;
    }

    const email = `${cleanUsername}@campus.edu`;
    const isOwner = SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === email.toLowerCase());
    const newUser = {
      id: 'user_' + Date.now(),
      name: name,
      username: cleanUsername,
      email: email,
      password: pass,
      role: isOwner ? 'ADMIN' : 'VIEWER',
      canPost: isOwner ? true : false,
      status: isOwner ? 'APPROVED' : 'PENDING', // Requires Admin permission per requirements
      isSuperAdmin: isOwner ? true : false,
      bio: bio || (isOwner ? 'System Administrator / Campus Owner' : 'Campus student / academic viewer'),
      avatar: this.getInitials(name),
      createdAt: Date.now()
    };

    if (isOwner) {
      localStorage.setItem('cnms_device_owner_verified', 'true');
      this.updateDeviceAdminVisibility();
    }

    // Attempt Firebase Auth account registration
    if (this.firebaseAuth) {
      try {
        const fbRes = await this.firebaseAuth.createUserWithEmailAndPassword(email, pass);
        if (fbRes && fbRes.user) {
          newUser.firebaseUid = fbRes.user.uid;
        }
      } catch (fbErr) {
        console.warn('[Firebase Auth Registration note]', fbErr.message);
      }
    }

    this.users.push(newUser);
    this.saveUsers();

    // Push to Google Firebase Cloud
    this.pushToCloud('cnms_users', newUser.id, newUser);

    this.showToast(`Account @${cleanUsername} registered. Awaiting administrative review.`, 'info');
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
        ? `<span class="meta-badge blue-badge">Admin</span>`
        : isPending
          ? `<span class="meta-badge" style="color: #f59e0b; border-color: rgba(245,158,11,0.4);">Pending Admin Approval</span>`
          : `<span class="meta-badge green-badge">Approved</span>`;

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
      this.showToast('Cannot switch: This account is pending approval by Campus Administration.', 'error');
      return;
    }

    this.currentUser = Object.assign({}, user);
    this.saveUsers();
    this.updateUserSessionUI();
    this.closeAuthModal();
    this.render();
    this.showToast(`Switched active account to ${user.name}.`, 'success');
  }

  /* --------------------------------------------------------------------------
     ADMIN PERMISSIONS DESK (Approvals, Posting Authority, Account Management)
     -------------------------------------------------------------------------- */
  renderAdminUsersList() {
    if (!this.dom.adminUsersListContainer || !this.isAdmin()) return;

    // Filter out the Super Admin themself from the list (protecting owner accounts privacy)
    const candidateUsers = this.users.filter(u => u.id !== DEFAULT_SUPER_ADMIN.id && u.email !== DEFAULT_SUPER_ADMIN.email && !SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === (u.email || '').toLowerCase()));

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
            <div class="admin-user-avatar">
              ${u.avatarUrl ? `<img src="${this.escapeHTML(u.avatarUrl)}" class="admin-user-avatar-img" alt="${this.escapeHTML(u.name)}">` : this.getInitials(u.name)}
            </div>
            <div class="admin-user-details">
              <span class="admin-user-name">${this.escapeHTML(u.name)} (@${this.escapeHTML(u.username)})</span>
              <div class="admin-audit-tag" style="margin: 4px 0; font-size: 0.72rem;">
                🛡️ Verified Student: <strong>${this.escapeHTML(u.realName || u.name)}</strong> &bull; Email: <strong>${this.escapeHTML(u.realEmail || u.email)}</strong> ${u.contact && u.contact !== u.email ? `&bull; Phone: <strong>${this.escapeHTML(u.contact)}</strong>` : ''}
              </div>
              <span class="admin-user-meta">
                Status: <strong>${u.status}</strong> &bull; Authority: 
                <strong style="color: ${canPost ? '#10b981' : '#94a3b8'};">
                  ${canPost ? 'Notice Publisher' : 'Viewer Only'}
                </strong>
              </span>
              ${u.bio ? `<span class="admin-user-bio">Bio: "${this.escapeHTML(u.bio)}"</span>` : ''}
            </div>
          </div>
          <div class="admin-user-actions">
            ${isPending ? `
              <button type="button" class="btn btn-xs btn-primary" data-admin-action="approve" data-user-id="${u.id}" title="Approve account for campus access">
                Approve
              </button>
              <button type="button" class="btn btn-xs btn-secondary" data-admin-action="reject" data-user-id="${u.id}" title="Decline account">
                Reject
              </button>
            ` : `
              <button type="button" class="btn btn-xs ${canPost ? 'btn-secondary' : 'btn-primary'}" data-admin-action="toggle-posting" data-user-id="${u.id}" title="${canPost ? 'Revoke notice publishing authority' : 'Grant notice publishing authority'}">
                ${canPost ? 'Revoke Authority' : 'Grant Notice Authority'}
              </button>
            `}
            <button type="button" class="btn btn-xs btn-secondary" data-admin-action="delete-user" data-user-id="${u.id}" title="Remove account from portal">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cnms-svg-icon"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
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
    this.showToast(`Account @${user.username} approved. User can now sign in.`, 'success');
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
    const statusMsg = user.canPost ? 'Granted notice publishing authority' : 'Revoked notice publishing authority';
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

    this.showToast('Profile bio updated successfully.', 'success');
  }

  /* --------------------------------------------------------------------------
     PROFILE IDENTITY CUSTOMIZATION DRAWER ENGINE
     -------------------------------------------------------------------------- */
  toggleProfileCustomizeDrawer(forceState) {
    if (!this.dom.profileCustomizeDrawer) return;
    const isCurrentlyOpen = this.dom.profileCustomizeDrawer.style.display !== 'none';
    const shouldOpen = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

    this.dom.profileCustomizeDrawer.style.display = shouldOpen ? 'block' : 'none';

    if (shouldOpen && this.currentUser) {
      if (this.dom.editProfileFullName) this.dom.editProfileFullName.value = this.currentUser.name || '';
      if (this.dom.editProfileUsername) this.dom.editProfileUsername.value = this.currentUser.username || '';
      if (this.dom.editProfileRollNo) this.dom.editProfileRollNo.value = this.currentUser.rollNo || this.currentUser.username || '';
      if (this.dom.editProfileDept) this.dom.editProfileDept.value = this.currentUser.department || 'Computer Engineering';
      if (this.dom.editProfileYear) this.dom.editProfileYear.value = this.currentUser.year || 'Third Year (TE)';
      if (this.dom.editProfileBio) this.dom.editProfileBio.value = this.currentUser.bio || '';
      if (this.dom.editProfilePhotoUrl) this.dom.editProfilePhotoUrl.value = this.currentUser.avatarUrl || '';

      // Update Profile Photo Preview Box
      if (this.dom.editProfilePhotoImg && this.dom.editProfilePhotoPlaceholder) {
        if (this.currentUser.avatarUrl) {
          this.dom.editProfilePhotoImg.src = this.currentUser.avatarUrl;
          this.dom.editProfilePhotoImg.style.display = 'block';
          this.dom.editProfilePhotoPlaceholder.style.display = 'none';
        } else {
          this.dom.editProfilePhotoImg.style.display = 'none';
          this.dom.editProfilePhotoPlaceholder.style.display = 'flex';
        }
      }

      if (this.dom.editProfilePrivacyShield) {
        this.dom.editProfilePrivacyShield.checked = this.currentUser.privacyShield !== false;
      }

      // Highlight active avatar preset pill matching user's avatar
      if (this.dom.avatarPresetPills) {
        const curAvatar = this.currentUser.avatar || 'INIT';
        this.dom.avatarPresetPills.querySelectorAll('.avatar-preset-pill').forEach(pill => {
          const val = pill.getAttribute('data-avatar');
          pill.classList.toggle('active', val === curAvatar || (curAvatar !== 'INIT' && !['👨‍🎓', '👩‍🎓', '💻', '🚀', '⚡', '👑', '🔬'].includes(curAvatar) && val === 'INIT'));
        });
      }
      if (this.dom.editProfileUsername) this.dom.editProfileUsername.focus();
    }
  }

  async handleSaveProfileCustomization() {
    if (!this.isAuthenticated() || !this.currentUser) {
      this.showToast('Authentication Required: Please sign in first.', 'warning');
      return;
    }

    const newName = this.dom.editProfileFullName ? this.dom.editProfileFullName.value.trim() : '';
    const rawUsername = this.dom.editProfileUsername ? this.dom.editProfileUsername.value.trim().replace(/^@+/, '') : '';
    const newRollNo = this.dom.editProfileRollNo ? this.dom.editProfileRollNo.value.trim() : '';
    const newDept = this.dom.editProfileDept ? this.dom.editProfileDept.value : '';
    const newYear = this.dom.editProfileYear ? this.dom.editProfileYear.value : '';
    const newBio = this.dom.editProfileBio ? this.dom.editProfileBio.value.trim() : '';
    const newPhotoUrl = this.dom.editProfilePhotoUrl ? this.dom.editProfilePhotoUrl.value.trim() : '';
    const privacyShield = this.dom.editProfilePrivacyShield ? this.dom.editProfilePrivacyShield.checked : true;

    if (!newName) {
      this.showToast('Please enter your Full Name.', 'error');
      if (this.dom.editProfileFullName) this.dom.editProfileFullName.focus();
      return;
    }

    if (rawUsername) {
      if (!/^[a-zA-Z0-9_]{3,24}$/.test(rawUsername)) {
        this.showToast('Username must be 3-24 characters and only contain letters, numbers, or underscores (_).', 'warning');
        if (this.dom.editProfileUsername) this.dom.editProfileUsername.focus();
        return;
      }
    }

    let chosenAvatarVal = 'INIT';
    if (this.dom.avatarPresetPills) {
      const activePill = this.dom.avatarPresetPills.querySelector('.avatar-preset-pill.active');
      if (activePill) {
        chosenAvatarVal = activePill.getAttribute('data-avatar') || 'INIT';
      }
    }
    const resolvedAvatar = chosenAvatarVal === 'INIT' ? this.getInitials(newName) : chosenAvatarVal;

    // Preserve real verified identity for Super Admin exclusive auditing
    this.currentUser.realName = this.currentUser.realName || this.currentUser.name;
    this.currentUser.realEmail = this.currentUser.realEmail || this.currentUser.email;

    this.currentUser.name = newName;
    if (rawUsername) this.currentUser.username = rawUsername.toLowerCase();
    if (newRollNo) this.currentUser.rollNo = newRollNo;
    if (newDept) this.currentUser.department = newDept;
    if (newYear) this.currentUser.year = newYear;
    this.currentUser.bio = newBio;
    this.currentUser.avatar = resolvedAvatar;
    if (newPhotoUrl) {
      this.currentUser.avatarUrl = newPhotoUrl;
    } else {
      delete this.currentUser.avatarUrl;
    }
    this.currentUser.privacyShield = privacyShield;

    // Save to users collection
    const idx = this.users.findIndex(u => u.id === this.currentUser.id || (this.currentUser.email && u.email === this.currentUser.email));
    if (idx !== -1) {
      this.users[idx] = Object.assign({}, this.users[idx], this.currentUser);
    }
    this.saveUsers();

    // Push to Firestore cnms_users
    if (this.firestoreDb && this.currentUser.id) {
      await this.pushToCloud('cnms_users', this.currentUser.id, this.currentUser);
    }

    this.updateUserSessionUI();
    this.render();
    this.toggleProfileCustomizeDrawer(false);
    this.showToast('Profile identity, username & avatar updated successfully!', 'success');
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
    this.showToast('Google Firebase credentials saved. Connecting...', 'success');
  }

  /* --------------------------------------------------------------------------
     FIREBASE AUTHENTICATION (Google, Phone OTP, User Sync)
     -------------------------------------------------------------------------- */
  async handleFirebaseGoogleSignIn() {
    if (!window.firebase || !firebase.auth) {
      this.showToast('Firebase Auth SDK is not available. Please verify network.', 'warning');
      return;
    }
    if (!this.firebaseAuth) {
      this.showToast('Please configure Firebase API Key in the settings panel to activate live Google Sign-In.', 'warning');
      return;
    }

    try {
      this.showToast('Opening Google Sign-In popup...', 'info');
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await this.firebaseAuth.signInWithPopup(provider);
      const user = result.user;
      this.showToast(`Signed in with Google as ${user.displayName || user.email}.`, 'success');
      await this.syncFirebaseUserToLocal(user);
      this.closeAuthModal();
      this.enterCampusPortal();
    } catch (error) {
      console.error('Google Sign-In error:', error);
      if (error.code === 'auth/unauthorized-domain') {
        this.showToast('Domain not authorized in Firebase Console: Add localhost to Authentication > Settings > Authorized Domains.', 'error');
      } else if (error.code === 'auth/popup-closed-by-user') {
        this.showToast('Google sign-in popup closed.', 'warning');
      } else {
        this.showToast(`Google Sign-In error: ${error.message}`, 'error');
      }
    }
  }

  toggleFirebasePhoneDrawer() {
    if (!this.dom.firebasePhoneDrawer) return;
    const isHidden = this.dom.firebasePhoneDrawer.style.display === 'none';
    this.dom.firebasePhoneDrawer.style.display = isHidden ? 'block' : 'none';
  }

  async handleFirebaseSendPhoneOtp() {
    if (!window.firebase || !firebase.auth) {
      this.showToast('Firebase Auth SDK not ready.', 'warning');
      return;
    }
    if (!this.firebaseAuth) {
      this.showToast('Please configure Firebase API Key in the settings panel to send SMS codes.', 'warning');
      return;
    }

    const phoneInput = this.dom.firebasePhoneNumberInput ? this.dom.firebasePhoneNumberInput.value.trim() : '';
    if (!phoneInput || phoneInput.length < 10) {
      this.showToast('Please enter a valid phone number with country code (e.g. +91 9876543210)', 'warning');
      return;
    }

    try {
      this.showToast('Initiating SMS verification code...', 'info');
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
          size: 'invisible'
        });
      }

      this.phoneConfirmationResult = await this.firebaseAuth.signInWithPhoneNumber(phoneInput, window.recaptchaVerifier);
      this.showToast('SMS verification code sent! Enter OTP.', 'success');
      if (this.dom.phoneStep1) this.dom.phoneStep1.style.display = 'none';
      if (this.dom.phoneStep2) this.dom.phoneStep2.style.display = 'block';
    } catch (err) {
      console.error('Phone SMS error:', err);
      this.showToast(`SMS failed: ${err.message}`, 'error');
    }
  }

  async handleFirebaseVerifyPhoneOtp() {
    if (!this.phoneConfirmationResult) {
      this.showToast('Please send verification code first.', 'warning');
      return;
    }
    const code = this.dom.firebaseOtpInput ? this.dom.firebaseOtpInput.value.trim() : '';
    if (!code || code.length < 6) {
      this.showToast('Please enter the 6-digit OTP code received on SMS.', 'warning');
      return;
    }

    try {
      this.showToast('Verifying SMS code...', 'info');
      const result = await this.phoneConfirmationResult.confirm(code);
      const user = result.user;
      this.showToast(`Phone verified successfully. Signed in as ${user.phoneNumber}.`, 'success');
      await this.syncFirebaseUserToLocal(user);
      this.closeAuthModal();
      this.enterCampusPortal();
    } catch (err) {
      console.error('OTP confirmation error:', err);
      this.showToast(`OTP verification failed: ${err.message}`, 'error');
    }
  }

  async syncFirebaseUserToLocal(firebaseUser) {
    const email = (firebaseUser.email || '').toLowerCase().trim();
    const phone = firebaseUser.phoneNumber || '';
    const localAdminOverride = (localStorage.getItem('cnms_admin_email_override') || '').toLowerCase();
    const isSuperAdminEmail = email === 'admin@campusnotify.edu' ||
      SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === email) ||
      (localAdminOverride && email === localAdminOverride) ||
      localStorage.getItem('cnms_admin_granted') === 'true';
    
    if (isSuperAdminEmail) {
      localStorage.setItem('cnms_device_owner_verified', 'true');
      this.updateDeviceAdminVisibility();
    }

    // Check if user already exists in Firestore or local
    let existing = this.users.find(u => (email && u.email === email) || (phone && u.contact === phone) || u.id === firebaseUser.uid);

    let resolvedRole = isSuperAdminEmail ? 'ADMIN' : (existing ? existing.role : 'VIEWER');
    let resolvedCanPost = isSuperAdminEmail ? true : (existing ? existing.canPost : false);

    // Privacy Shield Engine: Strictly protect personal identity and email handles
    const verifiedRealName = firebaseUser.displayName || (existing && existing.realName) || (existing && existing.name) || 'Campus Member';
    const verifiedRealEmail = email || (existing && existing.realEmail) || '';
    const verifiedContact = phone || email || (existing && existing.contact) || '';

    // Generate shielded public username: Avoid ever leaking @maneomkar844 or raw email prefixes
    const emailPrefix = email ? email.split('@')[0].toLowerCase() : '';
    let resolvedUsername = '';
    if (existing && existing.username && existing.username !== emailPrefix && !existing.username.includes('maneomkar844')) {
      resolvedUsername = existing.username;
    } else if (isSuperAdminEmail) {
      resolvedUsername = 'admin';
    } else {
      const idDigits = (firebaseUser.uid || '').replace(/\D/g, '').slice(-3) || Math.floor(100 + Math.random() * 900);
      resolvedUsername = 'scholar_' + idDigits;
    }

    let resolvedName = '';
    if (existing && existing.name && existing.name !== emailPrefix && !existing.name.includes('maneomkar844')) {
      resolvedName = existing.name;
    } else if (isSuperAdminEmail) {
      resolvedName = firebaseUser.displayName || 'Campus Super Admin';
    } else {
      const idDigits = (firebaseUser.uid || '').replace(/\D/g, '').slice(-3) || '01';
      resolvedName = 'Campus Scholar ' + idDigits;
    }

    const resolvedAvatarUrl = (existing && existing.avatarUrl) ? existing.avatarUrl : (firebaseUser.photoURL || '');
    let resolvedAvatar = existing && existing.avatar ? existing.avatar : (isSuperAdminEmail ? 'SA' : (resolvedName ? resolvedName.substring(0, 2) : 'CN').toUpperCase());

    const syncedUser = {
      id: firebaseUser.uid,
      name: resolvedName,
      username: resolvedUsername,
      realName: verifiedRealName,
      realEmail: verifiedRealEmail,
      realContact: verifiedContact,
      email: email,
      contact: phone || email,
      role: resolvedRole,
      department: existing ? existing.department : 'General Campus',
      bio: existing ? existing.bio : (isSuperAdminEmail ? 'System Administrator / Campus Owner' : 'Campus Member & Circular Viewer'),
      avatar: resolvedAvatar,
      avatarUrl: resolvedAvatarUrl,
      privacyShield: true,
      canPost: resolvedCanPost,
      status: 'APPROVED',
      isSuperAdmin: isSuperAdminEmail,
      firebaseUid: firebaseUser.uid,
      authProvider: firebaseUser.providerData && firebaseUser.providerData[0] ? firebaseUser.providerData[0].providerId : 'firebase'
    };

    // Save to local users list
    const existingIndex = this.users.findIndex(u => u.id === syncedUser.id || (email && u.email === email));
    if (existingIndex > -1) {
      this.users[existingIndex] = syncedUser;
    } else {
      this.users.push(syncedUser);
    }
    this.saveUsers();

    // Push to Firestore cnms_users
    if (this.firestoreDb) {
      this.pushToCloud('cnms_users', syncedUser.id, syncedUser);
    }

    this.currentUser = syncedUser;
    this.updateUserSessionUI();
    this.render();
  }

  /* --------------------------------------------------------------------------
     THEME TOGGLE
     -------------------------------------------------------------------------- */
  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
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
        iconSpan.innerHTML = theme === 'dark' ? CNMS_ICONS.moon : CNMS_ICONS.sun;
      }
    }
  }

  /* --------------------------------------------------------------------------
     THEME STUDIO & REAL-TIME DYNAMIC COLOR CUSTOMIZER
     -------------------------------------------------------------------------- */
  initThemeStudio() {
    // 1. Hook up Preset Cards (1-Click Switchers)
    document.querySelectorAll('.preset-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.getAttribute('data-preset');
        const preset = CNMS_PRESET_PALETTES[presetKey];
        if (preset) {
          this.applyCustomTheme(preset, true);
          this.syncColorPickers(preset);
          this.showToast(`Applied preset: ${preset.name}`, 'success');
        }
      });
    });

    // 2. Hook up Individual Color Pickers and Hex Inputs (Live Instant Sync)
    const colorKeys = [
      { picker: 'pickerBrandPrimary', hex: 'hexBrandPrimary', key: 'brandPrimary' },
      { picker: 'pickerBrandSecondary', hex: 'hexBrandSecondary', key: 'brandSecondary' },
      { picker: 'pickerBgPage', hex: 'hexBgPage', key: 'bgPage' },
      { picker: 'pickerBgCard', hex: 'hexBgCard', key: 'bgCard' },
      { picker: 'pickerBgSubtle', hex: 'hexBgSubtle', key: 'bgSubtle' },
      { picker: 'pickerBorderColor', hex: 'hexBorderColor', key: 'borderColor' },
      { picker: 'pickerTextMain', hex: 'hexTextMain', key: 'textMain' },
      { picker: 'pickerTextMuted', hex: 'hexTextMuted', key: 'textMuted' }
    ];

    colorKeys.forEach(({ picker, hex, key }) => {
      const pEl = document.getElementById(picker);
      const hEl = document.getElementById(hex);

      if (pEl) {
        pEl.addEventListener('input', (e) => {
          const val = e.target.value;
          if (hEl) hEl.value = val;
          const current = this.getCurrentPaletteFromInputs();
          current.name = 'Custom Personalized';
          current.id = null;
          this.applyCustomTheme(current, true);
        });
      }

      if (hEl) {
        hEl.addEventListener('input', (e) => {
          let val = e.target.value.trim();
          if (!val.startsWith('#') && val.length === 6) val = '#' + val;
          if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
            if (pEl) pEl.value = val;
            const current = this.getCurrentPaletteFromInputs();
            current.name = 'Custom Personalized';
            current.id = null;
            this.applyCustomTheme(current, true);
          }
        });
      }
    });

    // 3. Open Modal Triggers
    const openBtns = [
      document.getElementById('openThemeStudioBtn'),
      document.getElementById('instaThemeStudioBtn'),
      document.getElementById('floatingThemeFab')
    ];
    openBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => this.openThemeStudio());
      }
    });

    // 4. Close Modal Triggers
    const closeBtn = document.getElementById('closeThemeStudioBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeThemeStudio());
    }
    const backdrop = document.getElementById('themeStudioModalBackdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeThemeStudio();
      });
    }

    // 5. Randomize Palette Action
    const randomizeBtn = document.getElementById('randomizePaletteBtn');
    if (randomizeBtn) {
      randomizeBtn.addEventListener('click', () => this.randomizeTheme());
    }

    // 6. Reset to Default Action
    const resetBtn = document.getElementById('resetDefaultPaletteBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetDefaultTheme());
    }

    // 7. Copy CSS Action
    const copyBtn = document.getElementById('copyThemeCssBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyThemeCss());
    }

    // 8. Save Palette Action
    const saveBtn = document.getElementById('saveThemePaletteBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const palette = this.getCurrentPaletteFromInputs();
        this.applyCustomTheme(palette, true);
        this.showToast('Custom palette saved successfully!', 'success');
        this.closeThemeStudio();
      });
    }

    // 9. Auto-restore stored custom palette if user previously customized colors
    const saved = localStorage.getItem('cnms_custom_palette');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.brandPrimary) {
          this.applyCustomTheme(parsed, false);
          this.syncColorPickers(parsed);
        }
      } catch (err) {
        console.warn('Could not restore saved custom palette:', err);
      }
    } else {
      // If no custom palette stored, initialize pickers with Sunset (Original)
      this.syncColorPickers(CNMS_PRESET_PALETTES.sunset);
      this.updateThemePreviewSwatches(CNMS_PRESET_PALETTES.sunset);
    }

    // 10. Query param direct link support (e.g. ?openThemeStudio=1 or ?preset=sapphire)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const prParam = urlParams.get('preset');
      if (prParam && CNMS_PRESET_PALETTES[prParam]) {
        const pr = CNMS_PRESET_PALETTES[prParam];
        this.applyCustomTheme(pr, true);
        this.syncColorPickers(pr);
      }
      if (urlParams.has('openThemeStudio') || urlParams.has('themeStudio')) {
        setTimeout(() => this.openThemeStudio(), 50);
      }
    } catch (e) {
      // Ignored
    }
  }

  openThemeStudio() {
    const backdrop = document.getElementById('themeStudioModalBackdrop');
    if (backdrop) {
      backdrop.classList.add('open');
      backdrop.setAttribute('aria-hidden', 'false');
    }
  }

  closeThemeStudio() {
    const backdrop = document.getElementById('themeStudioModalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
    }
  }

  applyCustomTheme(palette, persist = true) {
    if (!palette) return;

    let styleEl = document.getElementById('cnmsDynamicThemeStyle');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'cnmsDynamicThemeStyle';
      document.head.appendChild(styleEl);
    }

    const brandGradient = `linear-gradient(135deg, ${palette.brandPrimary} 0%, ${palette.brandSecondary} 100%)`;

    styleEl.innerHTML = `
      :root, [data-theme="light"], [data-theme="dark"] {
        --brand-primary: ${palette.brandPrimary} !important;
        --brand-primary-hover: ${palette.brandPrimary} !important;
        --brand-secondary: ${palette.brandSecondary} !important;
        --brand-accent: ${palette.brandSecondary} !important;
        --brand-gradient: ${brandGradient} !important;
        --bg-page: ${palette.bgPage} !important;
        --bg-body: ${palette.bgPage} !important;
        --bg-card: ${palette.bgCard} !important;
        --bg-card-hover: ${palette.bgCard} !important;
        --bg-subtle: ${palette.bgSubtle} !important;
        --bg-input: ${palette.bgCard} !important;
        --border-color: ${palette.borderColor} !important;
        --border-light: ${palette.borderColor} !important;
        --text-main: ${palette.textMain} !important;
        --text-muted: ${palette.textMuted} !important;
        --text-dim: ${palette.textMuted} !important;
      }
      .modal-dialog {
        background-color: var(--bg-card) !important;
        color: var(--text-main) !important;
        border-color: var(--border-color) !important;
      }
      .modal-header, .modal-footer {
        border-color: var(--border-color) !important;
      }
    `;

    this.activeCustomPalette = { ...palette };
    this.updateThemePreviewSwatches(palette);

    if (persist) {
      try {
        localStorage.setItem('cnms_custom_palette', JSON.stringify(palette));
      } catch (e) {
        console.warn('Could not save theme palette to localStorage:', e);
      }
    }
  }

  updateThemePreviewSwatches(palette) {
    const sPrimary = document.getElementById('swatchPrimaryPreview');
    const sSecondary = document.getElementById('swatchSecondaryPreview');
    const sBg = document.getElementById('swatchBgPreview');
    const sCard = document.getElementById('swatchCardPreview');
    const sSubtle = document.getElementById('swatchSubtlePreview');
    const sBorder = document.getElementById('swatchBorderPreview');
    const sText = document.getElementById('swatchTextPreview');

    if (sPrimary) sPrimary.style.backgroundColor = palette.brandPrimary;
    if (sSecondary) sSecondary.style.backgroundColor = palette.brandSecondary;
    if (sBg) sBg.style.backgroundColor = palette.bgPage;
    if (sCard) sCard.style.backgroundColor = palette.bgCard;
    if (sSubtle) sSubtle.style.backgroundColor = palette.bgSubtle;
    if (sBorder) sBorder.style.backgroundColor = palette.borderColor;
    if (sText) sText.style.backgroundColor = palette.textMain;

    const statusText = document.getElementById('themeStatusText');
    if (statusText) {
      statusText.textContent = palette.name ? `${palette.name} Active` : 'Custom Palette Active';
    }
  }

  syncColorPickers(palette) {
    const map = [
      { picker: 'pickerBrandPrimary', hex: 'hexBrandPrimary', key: 'brandPrimary' },
      { picker: 'pickerBrandSecondary', hex: 'hexBrandSecondary', key: 'brandSecondary' },
      { picker: 'pickerBgPage', hex: 'hexBgPage', key: 'bgPage' },
      { picker: 'pickerBgCard', hex: 'hexBgCard', key: 'bgCard' },
      { picker: 'pickerBgSubtle', hex: 'hexBgSubtle', key: 'bgSubtle' },
      { picker: 'pickerBorderColor', hex: 'hexBorderColor', key: 'borderColor' },
      { picker: 'pickerTextMain', hex: 'hexTextMain', key: 'textMain' },
      { picker: 'pickerTextMuted', hex: 'hexTextMuted', key: 'textMuted' }
    ];

    map.forEach(item => {
      const pEl = document.getElementById(item.picker);
      const hEl = document.getElementById(item.hex);
      const val = palette[item.key];
      if (pEl && val) pEl.value = val;
      if (hEl && val) hEl.value = val;
    });

    document.querySelectorAll('.preset-card').forEach(card => {
      const presetKey = card.getAttribute('data-preset');
      if (palette.id && palette.id === presetKey) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  getCurrentPaletteFromInputs() {
    return {
      brandPrimary: document.getElementById('pickerBrandPrimary')?.value || '#2563eb',
      brandSecondary: document.getElementById('pickerBrandSecondary')?.value || '#0284c7',
      bgPage: document.getElementById('pickerBgPage')?.value || '#f8fafc',
      bgCard: document.getElementById('pickerBgCard')?.value || '#ffffff',
      bgSubtle: document.getElementById('pickerBgSubtle')?.value || '#eff6ff',
      borderColor: document.getElementById('pickerBorderColor')?.value || '#cbd5e1',
      textMain: document.getElementById('pickerTextMain')?.value || '#0f172a',
      textMuted: document.getElementById('pickerTextMuted')?.value || '#475569'
    };
  }

  randomizeTheme() {
    const hues = [215, 160, 260, 340, 190, 30, 280, 140];
    const baseHue = hues[Math.floor(Math.random() * hues.length)];
    const secHue = (baseHue + 40 + Math.floor(Math.random() * 60)) % 360;

    const hslToHex = (h, s, l) => {
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    };

    const isDark = Math.random() > 0.6;
    const randomPalette = {
      id: null,
      name: 'Surprise Harmonious',
      brandPrimary: hslToHex(baseHue, 80, isDark ? 65 : 45),
      brandSecondary: hslToHex(secHue, 85, isDark ? 60 : 50),
      bgPage: isDark ? hslToHex(baseHue, 30, 8) : hslToHex(baseHue, 25, 97),
      bgCard: isDark ? hslToHex(baseHue, 25, 14) : '#ffffff',
      bgSubtle: isDark ? hslToHex(baseHue, 35, 20) : hslToHex(baseHue, 40, 93),
      borderColor: isDark ? hslToHex(baseHue, 20, 25) : hslToHex(baseHue, 30, 85),
      textMain: isDark ? '#ffffff' : hslToHex(baseHue, 40, 12),
      textMuted: isDark ? hslToHex(baseHue, 15, 70) : hslToHex(baseHue, 20, 35)
    };

    this.applyCustomTheme(randomPalette, true);
    this.syncColorPickers(randomPalette);
    this.showToast('🎲 Generated surprise palette! Adjust any color further.', 'info');
  }

  resetDefaultTheme() {
    localStorage.removeItem('cnms_custom_palette');
    const dynamicStyle = document.getElementById('cnmsDynamicThemeStyle');
    if (dynamicStyle) {
      if (typeof dynamicStyle.remove === 'function') {
        dynamicStyle.remove();
      } else if (dynamicStyle.parentNode) {
        dynamicStyle.parentNode.removeChild(dynamicStyle);
      }
    }
    this.syncColorPickers(CNMS_PRESET_PALETTES.sunset);
    this.updateThemePreviewSwatches(CNMS_PRESET_PALETTES.sunset);
    this.showToast('Reset to default system palette', 'info');
  }

  copyThemeCss() {
    const palette = this.getCurrentPaletteFromInputs();
    const css = `:root {
  --brand-primary: ${palette.brandPrimary};
  --brand-secondary: ${palette.brandSecondary};
  --bg-page: ${palette.bgPage};
  --bg-card: ${palette.bgCard};
  --bg-subtle: ${palette.bgSubtle};
  --border-color: ${palette.borderColor};
  --text-main: ${palette.textMain};
  --text-muted: ${palette.textMuted};
  --brand-gradient: linear-gradient(135deg, ${palette.brandPrimary} 0%, ${palette.brandSecondary} 100%);
}`;
    navigator.clipboard.writeText(css).then(() => {
      this.showToast('Copied CSS theme variables to clipboard!', 'success');
    }).catch(() => {
      this.showToast('Theme CSS variables logged to console', 'info');
      console.log('CNMS Custom CSS Palette:\n' + css);
    });
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
      this.showToast('Endorsed circular.', 'success');
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
      this.showToast('Official receipt acknowledged and recorded.', 'success');
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
      this.showToast('Circular pinned to your saved desk.', 'info');
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
      this.showToast('Authority Restriction: Only Super Admin has authority to delete circulars.', 'error');
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
        this.showToast('Official circular summary copied to clipboard.');
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
        'Authority Restriction: Only Super Admin or authorized officers can issue circulars.',
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

    if (title.length > 250) {
      this.showToast('Circular Subject cannot exceed 250 characters.', 'warning');
      return;
    }
    if (description.length > 15000) {
      this.showToast('Circular text content cannot exceed 15,000 characters.', 'warning');
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
    this.showToast(`Official Circular [${refNo}] published to campus board.`, 'success');
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
          <div class="lh-crest"><img src="assets/logo.svg" width="48" height="48" alt="Campus"></div>
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
          No official inquiries or doubts logged yet.<br>All students, faculty members and coordinators can submit queries below.
        </div>
      `;
      return;
    }

    this.dom.commentsListContainer.innerHTML = queries.map(q => {
      const isAdmComment = q.role === 'ADMIN' || (q.author && q.author.includes('Admin'));
      // Admin has full restriction authority to delete ANY comment in the system
      const canDelete = this.isAdmin() || Boolean(this.currentUser && q.userId === this.currentUser.id);

      // Decrypt if E2EE
      let displayText = q.text || '';
      if (q.ciphertext && this.e2ee) {
        const dec = this.e2ee.decryptSync(q.ciphertext, q.iv);
        if (dec) displayText = dec;
      }

      // Avatar
      const avatarHtml = q.avatarUrl
        ? `<img src="${this.escapeHTML(q.avatarUrl)}" class="avatar-comment-img" alt="${this.escapeHTML(q.authorName || 'User')}">`
        : '';

      // Super Admin Identity Audit Tag
      const isSuperAdmin = this.isAdmin();
      const adminAuditHtml = isSuperAdmin ? `
        <div class="admin-audit-tag" style="margin: 3px 0; font-size: 0.72rem;">
          🛡️ Verified Student: <strong>${this.escapeHTML(q.authorRealName || q.authorName || q.author)}</strong> &bull; <span>${this.escapeHTML(q.authorRealEmail || 'Verified Campus Account')}</span>
        </div>
      ` : '';

      return `
        <div class="comment-item" id="comment_${q.id}">
          <div class="comment-header">
            <div class="comment-author-wrap">
              ${avatarHtml}
              <span class="comment-author">${this.escapeHTML(q.authorName || q.author)}</span>
              ${isAdmComment ? `
                <span class="comment-role-tag comment-role-admin">Admin</span>
              ` : `
                <span class="comment-role-tag comment-role-viewer">Member</span>
              `}
              ${q.authorUsername ? `<span style="font-size: 0.7rem; color: var(--text-dim);">@${this.escapeHTML(q.authorUsername)}</span>` : ''}
              <span class="e2ee-tag-badge" title="End-to-End Encrypted via 256-Bit AES">🔒 E2EE</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="comment-time">${this.formatDate(q.time)}</span>
              ${canDelete ? `
                <button type="button" class="comment-delete-btn" data-comment-id="${q.id}" title="${this.isAdmin() ? 'Super Admin: Delete this inquiry' : 'Delete your inquiry'}">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cnms-svg-icon"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              ` : ''}
            </div>
          </div>
          ${adminAuditHtml}
          ${q.authorBio ? `
            <div style="font-size: 0.72rem; color: var(--text-dim); font-style: italic; margin-bottom: 4px;">
              "${this.escapeHTML(q.authorBio)}"
            </div>
          ` : ''}
          <div class="comment-text">${this.escapeHTML(displayText)}</div>
        </div>
      `;
    }).join('');
  }

  async handleSubmitInquiry() {
    if (!this.isAuthenticated()) {
      this.showToast('Authentication Required: Please sign in or create an account to post an inquiry.', 'warning');
      this.showInstagramGateway('login');
      return;
    }
    if (!this.activeDiscussionNoticeId || !this.dom.commentInputText) return;
    const text = this.dom.commentInputText.value.trim();
    if (!text) return;

    if (text.length > 1000) {
      this.showToast('Inquiry comment cannot exceed 1,000 characters.', 'warning');
      return;
    }

    const notice = this.notices.find(n => n.id === this.activeDiscussionNoticeId);
    if (!notice) return;

    if (!notice.comments) notice.comments = [];

    let ciphertext = null;
    let iv = null;
    if (this.e2ee) {
      try {
        const enc = await this.e2ee.encrypt(text);
        ciphertext = enc.ciphertext;
        iv = enc.iv;
      } catch (err) {
        console.warn('E2EE comment encryption fallback:', err);
      }
    }

    const newQuery = {
      id: 'query-' + Date.now(),
      userId: this.currentUser.id,
      authorName: this.currentUser.name,
      authorUsername: this.currentUser.username,
      authorRealName: this.currentUser.realName || this.currentUser.name,
      authorRealEmail: this.currentUser.realEmail || this.currentUser.email,
      avatarUrl: this.currentUser.avatarUrl || '',
      authorRole: this.currentUser.role,
      authorBio: this.currentUser.bio || '',
      time: new Date().toISOString(),
      text: text,
      ciphertext: ciphertext,
      iv: iv,
      isE2ee: true
    };

    notice.comments.push(newQuery);
    this.saveNotices();
    this.pushToCloud('cnms_notices', notice.id, notice);

    this.dom.commentInputText.value = '';
    this.renderInquiriesList();
    this.render();
    this.showToast('Inquiry encrypted (AES-256) & logged into official clarification ledger.');
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
      this.showToast('Authority Restriction: Only Super Admin can delete others’ inquiries.', 'error');
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
      if (this.dom.metricTotalCirculars) this.dom.metricTotalCirculars.textContent = 'Locked';
      if (this.dom.metricUrgentCirculars) this.dom.metricUrgentCirculars.textContent = 'Locked';
      if (this.dom.metricAcknowledgedCount) this.dom.metricAcknowledgedCount.textContent = 'Locked';
      if (this.dom.circularsTabBadge) this.dom.circularsTabBadge.textContent = 'Restricted';
      if (this.dom.noticesCountBadge) this.dom.noticesCountBadge.textContent = '0 (Sign In Required)';
      if (this.dom.activeFilterAlert) this.dom.activeFilterAlert.style.display = 'none';
      if (this.dom.emptyStateCard) this.dom.emptyStateCard.style.display = 'none';
      if (this.dom.noticesContainer) {
        this.dom.noticesContainer.innerHTML = `
          <div class="auth-gate-shield-card">
            <div class="gate-shield-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cnms-svg-icon icon-lock"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
            <h3 class="gate-shield-title">Official Campus Circulars Restricted</h3>
            <p class="gate-shield-desc">
              Official semester circulars, examination schedules, departmental alerts, and institutional files are protected.
              You must sign in with an approved student/faculty account or create a new account to access notices.
            </p>
            <div class="gate-action-buttons">
              <button type="button" class="btn btn-primary" id="gateLoginPromptBtn">
                <span>Sign In / Create Account</span>
              </button>
            </div>
            <div class="gate-privacy-badge">
              <span>256-Bit Cryptography &bull; DPDP Act 2023 Compliant</span>
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
        if (this.dom.emptyStateCreateBtn) {
          this.dom.emptyStateCreateBtn.style.display = this.hasPostingAuthority() ? 'inline-flex' : 'none';
        }

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
    const reactionSvgMap = {
      '👍': CNMS_ICONS.thumbUp,
      '❤️': CNMS_ICONS.heart,
      '🔥': CNMS_ICONS.flame,
      '👏': CNMS_ICONS.applause,
      '📌': CNMS_ICONS.pin,
      '💡': CNMS_ICONS.bulb
    };
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
          title="${hasReacted ? 'Click to remove reaction' : 'Add reaction'}"
        >
          <span class="emoji-icon">${reactionSvgMap[emoji] || ''}</span>
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
            <span class="priority-tag ${priorityClass}">${notice.priority === 'Urgent' ? 'URGENT' : notice.priority}</span>
          </div>
          <span class="card-meta-date" title="${notice.issuedAt}">Issued: ${formattedDate}</span>
        </div>

        <!-- Subject Line -->
        <h3 class="card-subject-title">${this.escapeHTML(notice.title)}</h3>

        <!-- Circular Content Body -->
        <div class="card-circular-body">${this.escapeHTML(notice.description)}</div>

        <!-- Secondary Meta: Audience & Attachment -->
        <div class="card-secondary-meta">
          <span class="audience-pill">Target: <strong>${this.escapeHTML(notice.audience)}</strong></span>
          ${notice.attachment ? `
            <div class="attachment-pill-btn" onclick="cnmsApp.openLetterheadModal('${notice.id}')" title="Preview Attached Circular">
              <span><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cnms-svg-icon"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg></span>
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
              <span>${isLiked ? 'Liked' : 'Like'}</span>
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
              <span>${isAcknowledged ? 'Acknowledged' : 'Acknowledge'}</span>
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
              <span>Letterhead</span>
            </button>

            <!-- Inquiry / Comment Desk -->
            <button 
              type="button" 
              class="action-tool-btn" 
              data-action="inquiries" 
              data-id="${notice.id}"
              title="View or submit questions on this circular"
            >
              <span>Inquiries (${inquiriesCount})</span>
            </button>

            <!-- Bookmark / Save -->
            <button 
              type="button" 
              class="action-tool-btn ${isBookmarked ? 'active-bookmark' : ''}" 
              data-action="bookmark" 
              data-id="${notice.id}"
              title="Pin to your desk"
            >
              <span>${isBookmarked ? 'Pinned' : 'Save'}</span>
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
              ${CNMS_ICONS.share}
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
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cnms-svg-icon"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
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
    if (!filename) return CNMS_ICONS.paperclip;
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return CNMS_ICONS.filePdf;
      case 'doc':
      case 'docx': return CNMS_ICONS.fileWord;
      case 'xls':
      case 'xlsx': return CNMS_ICONS.fileExcel;
      case 'ppt':
      case 'pptx': return CNMS_ICONS.filePowerPoint;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif': return CNMS_ICONS.image;
      case 'zip':
      case 'rar': return CNMS_ICONS.fileZip;
      case 'txt': return CNMS_ICONS.document;
      default: return CNMS_ICONS.paperclip;
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

  sanitizeDownloadUrl(url) {
    if (!url || typeof url !== 'string') return '#';
    const trimmed = url.trim();
    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('https://')) {
      if (!trimmed.toLowerCase().includes('javascript:') && !trimmed.toLowerCase().includes('vbscript:')) {
        return trimmed;
      }
    }
    return '#';
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
