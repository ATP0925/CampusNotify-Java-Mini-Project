/**
 * Complete End-to-End Test Suite for Campus Notification Management System (CNMS)
 * Validates all 9 core functional pillars and user requirements.
 */

const fs = require('fs');
const path = require('path');

// 1. Mock Browser Environment
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    _dump: () => store
  };
})();

global.localStorage = localStorageMock;
global.window = {
  localStorage: localStorageMock,
  confirm: () => true,
  alert: (msg) => console.log('   [Window Alert]:', msg),
  location: { reload: () => {} },
  scrollTo: () => {},
  innerWidth: 1200
};
global.document = {
  title: 'Campus Notify',
  documentElement: {
    setAttribute: () => {},
    getAttribute: () => 'dark'
  },
  addEventListener: () => {},
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: (id) => {
    return {
      id: id,
      value: '',
      innerHTML: '',
      textContent: '',
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        toggle: () => {},
        contains: () => false
      },
      setAttribute: () => {},
      removeAttribute: () => {},
      getAttribute: () => null,
      addEventListener: () => {},
      focus: () => {}
    };
  },
  createElement: (tag) => {
    return {
      tagName: tag.toUpperCase(),
      className: '',
      innerHTML: '',
      textContent: '',
      style: {},
      dataset: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      setAttribute: () => {},
      appendChild: () => {},
      addEventListener: () => {}
    };
  },
  body: {
    appendChild: () => {},
    style: {}
  }
};

global.crypto = {
  subtle: {
    digest: async (algo, data) => {
      const cryptoNode = require('crypto');
      const hash = cryptoNode.createHash('sha256').update(Buffer.from(data)).digest('hex');
      return Buffer.from(hash, 'hex');
    }
  }
};
global.TextEncoder = require('util').TextEncoder;

// 2. Load app.js
const vm = require('vm');
const appJsPath = path.join(__dirname, 'app.js');
const appCode = fs.readFileSync(appJsPath, 'utf8');

// Run in global context
vm.runInThisContext(appCode);

// 3. Run Test Suite
async function runTests() {
  console.log('================================================================');
  console.log('  RUNNING CNMS COMPREHENSIVE AUTOMATED VERIFICATION SUITE       ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(desc, condition) {
    total++;
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
    }
  }

  // --- TEST PILLAR 1: Cold Start & Zero-Access Wall ---
  console.log('--- PILLAR 1: Zero-Access Authentication Wall ---');
  localStorage.clear();
  localStorage.setItem('cnms_session_signed_out', 'true');
  const cnms = new CampusNotificationManagementSystem();
  cnms.init();

  assert('Cold start currentUser is null', cnms.currentUser === null);
  assert('isAuthenticated() returns false', cnms.isAuthenticated() === false);

  // Calling render() in unauthenticated state
  cnms.render();
  assert('KPI Metric total circulars shows lock icon 🔒', cnms.dom.metricTotalCirculars.textContent === '🔒');
  assert('KPI Metric urgent circulars shows lock icon 🔒', cnms.dom.metricUrgentCirculars.textContent === '🔒');
  assert('Shield card mentions Official Campus Circulars Restricted', cnms.dom.noticesContainer.innerHTML.includes('Official Campus Circulars Restricted'));

  // Verify interactions are blocked when unauthenticated
  let blockedLike = false;
  cnms.showToast = (msg) => { if (msg.includes('Authentication Required')) blockedLike = true; };
  cnms.handleToggleNoticeLike('CNMS-001');
  assert('Toggling like without login is blocked', blockedLike);

  let blockedLounge = false;
  cnms.showToast = (msg) => { if (msg.includes('Authentication Required')) blockedLounge = true; };
  cnms.switchView('lounge');
  assert('Switching to lounge without login is blocked', blockedLounge && cnms.activeView === 'circulars');

  // --- TEST PILLAR 2: Super Admin Login ---
  console.log('\n--- PILLAR 2: Super Admin Authentication ---');
  assert('Default Super Admin email is atpadkarmaruti@gmail.com', DEFAULT_SUPER_ADMIN.email === 'atpadkarmaruti@gmail.com');
  assert('Default Super Admin password is PRATIK@00925', DEFAULT_SUPER_ADMIN.password === 'PRATIK@00925');

  // Login as Super Admin
  cnms.handleQuickAdminLogin();
  assert('Logged in user is Pratik Atpadkar', cnms.currentUser.name === 'Pratik Atpadkar');
  assert('User role is ADMIN', cnms.currentUser.role === 'ADMIN');
  assert('isAuthenticated() returns true', cnms.isAuthenticated() === true);
  assert('isAdmin() returns true', cnms.isAdmin() === true);
  assert('hasPostingAuthority() returns true', cnms.hasPostingAuthority() === true);

  // Render when logged in
  cnms.render();
  assert('KPI metrics display active circulars count', cnms.dom.metricTotalCirculars.textContent !== '🔒');
  assert('Notices list renders actual circulars', !cnms.dom.noticesContainer.innerHTML.includes('auth-gate-shield-card'));

  // --- TEST PILLAR 3: Notice Posting Authority ---
  console.log('\n--- PILLAR 3: Notice Posting Authority ---');
  const initialNoticeCount = cnms.notices.length;
  cnms.dom.noticeRefNo.value = 'CNMS/2026/TEST-01';
  cnms.dom.noticeTitle.value = 'Autonomous Verification Test Notice';
  cnms.dom.noticeDescription.value = 'Automated system health check testing circular dispatch functionality.';
  cnms.dom.noticeDepartment.value = 'IT Administration';
  cnms.dom.noticePriority.value = 'High';
  cnms.dom.noticeAudience.value = 'All Students & Faculty';
  cnms.dom.noticeSignatory.value = 'Pratik Atpadkar, Central Controller';

  cnms.handlePublishCircular();
  assert('Notice count increased by 1 for Super Admin', cnms.notices.length === initialNoticeCount + 1);
  const createdNotice = cnms.notices[0];
  assert('Created notice title matches', createdNotice.title === 'Autonomous Verification Test Notice');

  // Now switch to a normal viewer
  console.log('\n--- PILLAR 4: Viewer Restrictions on Posting ---');
  const viewerUser = {
    id: 'user_viewer_01',
    name: 'Rahul Sharma',
    username: 'rahul_viewer',
    email: 'rahul@campus.edu',
    role: 'VIEWER',
    canPost: false,
    status: 'APPROVED',
    bio: 'B.Tech Student'
  };
  cnms.currentUser = viewerUser;
  assert('Viewer isAuthenticated() is true', cnms.isAuthenticated() === true);
  assert('Viewer isAdmin() is false', cnms.isAdmin() === false);
  assert('Viewer hasPostingAuthority() is false', cnms.hasPostingAuthority() === false);

  let publishBlocked = false;
  cnms.showToast = (msg, type) => { if (type === 'error' && msg.includes('Permission denied')) publishBlocked = true; };
  cnms.handlePublishCircular();
  assert('Viewer cannot publish notice', publishBlocked && cnms.notices.length === initialNoticeCount + 1);

  // Admin grants notice authority to viewer
  console.log('\n--- PILLAR 5: Authority Delegation by Admin ---');
  viewerUser.canPost = true;
  assert('After grant, viewer hasPostingAuthority() is true', cnms.hasPostingAuthority() === true);

  // --- TEST PILLAR 6: Viewer Engagement (Likes, Reactions, Inquiries) ---
  console.log('\n--- PILLAR 6: Viewer Engagement (Likes, Reactions, Comments) ---');
  const testNoticeId = createdNotice.id;
  const initialLikes = (createdNotice.likes || []).length;
  
  cnms.handleToggleNoticeLike(testNoticeId);
  assert('Viewer can like a notice', createdNotice.likes.includes('user_viewer_01'));

  cnms.handleToggleReaction(testNoticeId, '🔥');
  assert('Viewer can react with 🔥 emoji', createdNotice.reactions['🔥'].includes('user_viewer_01'));

  cnms.activeDiscussionNoticeId = testNoticeId;
  cnms.dom.commentInputText.value = 'Is this verification test running live?';
  cnms.handleSubmitInquiry();
  assert('Viewer can submit inquiry/comment', createdNotice.comments.length > 0);
  const comment = createdNotice.comments[0];
  assert('Comment text matches', comment.text === 'Is this verification test running live?');

  // --- TEST PILLAR 7: Comment & Notice Moderation Authority ---
  console.log('\n--- PILLAR 7: Restriction Authority (Comment & Notice Deletion) ---');
  // Another viewer tries to delete Rahul's comment
  cnms.currentUser = {
    id: 'user_viewer_02',
    name: 'Sneha Patel',
    username: 'sneha_viewer',
    role: 'VIEWER',
    canPost: false,
    status: 'APPROVED'
  };

  let deleteCommentBlocked = false;
  cnms.showToast = (msg, type) => { if (type === 'error' && msg.includes('Authority Restriction')) deleteCommentBlocked = true; };
  cnms.handleDeleteComment(comment.id);
  assert('Other viewer cannot delete comment', deleteCommentBlocked && createdNotice.comments.length === 1);

  // Super Admin deletes the comment
  cnms.currentUser = Object.assign({}, DEFAULT_SUPER_ADMIN);
  cnms.handleDeleteComment(comment.id);
  assert('Super Admin can delete any comment', createdNotice.comments.length === 0);

  // Viewer tries to delete notice
  cnms.currentUser = viewerUser;
  let deleteNoticeBlocked = false;
  cnms.showToast = (msg, type) => { if (type === 'error' && msg.includes('Authority Restriction')) deleteNoticeBlocked = true; };
  cnms.handleDeleteNotice(testNoticeId);
  assert('Viewer cannot delete notice', deleteNoticeBlocked && cnms.notices.some(n => n.id === testNoticeId));

  // Super Admin deletes notice
  cnms.currentUser = Object.assign({}, DEFAULT_SUPER_ADMIN);
  cnms.handleDeleteNotice(testNoticeId);
  assert('Super Admin can delete notice', !cnms.notices.some(n => n.id === testNoticeId));

  // --- TEST PILLAR 8: Community Lounge Group Chat & File Sharing ---
  console.log('\n--- PILLAR 8: Community Lounge Group Chat ---');
  cnms.activeView = 'lounge';
  const initialLoungeCount = cnms.loungeMessages.length;
  cnms.dom.loungeTextInput.value = 'Welcome everyone to the official Campus Lounge!';
  cnms.handleSendLoungeMessage();
  assert('Lounge message sent successfully', cnms.loungeMessages.length === initialLoungeCount + 1);

  // --- TEST PILLAR 9: Multi-Account Device Restriction & Approval ---
  console.log('\n--- PILLAR 9: Multi-Account Device Permission Policy ---');
  cnms.dom.instaRegFullName.value = 'Pooja Verma';
  cnms.dom.instaRegUsername.value = 'pooja_verma';
  cnms.dom.instaRegContact.value = 'pooja@campus.edu';
  cnms.dom.instaRegPassword.value = 'Pooja@12345';
  cnms.dom.instaRegBio.value = 'First Year Student';
  cnms.dom.instaPrivacyConsentCheck.checked = true;

  await cnms.handleInstaRegisterSubmit();
  const registeredUser = cnms.users.find(u => u.username === 'pooja_verma');
  assert('New account registered with status PENDING', registeredUser && registeredUser.status === 'PENDING');
  assert('New account canPost is false by default', registeredUser && registeredUser.canPost === false);

  // Attempt login with PENDING account
  let loginBlockedPending = false;
  cnms.showToast = (msg, type) => { if (type === 'error' && msg.includes('PENDING approval from Campus Administration')) loginBlockedPending = true; };
  cnms.dom.instaLoginIdentifier.value = 'pooja_verma';
  cnms.dom.instaLoginPassword.value = 'Pooja@12345';
  await cnms.handleInstaLoginSubmit();
  assert('Pending account cannot log in without Admin approval', loginBlockedPending);

  // Admin approves account
  registeredUser.status = 'APPROVED';
  let loginSuccess = false;
  cnms.showToast = (msg, type) => { if (type === 'success' && msg.includes('Logged in successfully')) loginSuccess = true; };
  await cnms.handleInstaLoginSubmit();
  assert('Approved account logs in successfully', loginSuccess && cnms.currentUser.username === 'pooja_verma');

  console.log('\n================================================================');
  console.log(`  VERIFICATION COMPLETED: ${passed} / ${total} TESTS PASSED (${((passed/total)*100).toFixed(1)}%)`);
  console.log('================================================================\n');

  // Clean up test notice from storage
  localStorage.clear();
}

runTests().catch(err => {
  console.error('Test Suite Error:', err);
});
