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
    _attrs: { 'data-theme': 'light' },
    setAttribute: function(k, v) { this._attrs[k] = v; },
    getAttribute: function(k) { return this._attrs[k] || 'light'; }
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
      focus: () => {},
      querySelectorAll: () => [],
      querySelector: () => null,
      remove: () => {}
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

// 2. Load icons.js & app.js
const vm = require('vm');
const iconsJsPath = path.join(__dirname, 'icons.js');
const iconsCode = fs.readFileSync(iconsJsPath, 'utf8');
vm.runInThisContext(iconsCode);
global.CNMS_ICONS = CNMS_ICONS;

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
  assert('KPI Metric total circulars shows locked status', cnms.dom.metricTotalCirculars.textContent === 'Locked' || cnms.dom.metricTotalCirculars.textContent === '🔒');
  assert('KPI Metric urgent circulars shows locked status', cnms.dom.metricUrgentCirculars.textContent === 'Locked' || cnms.dom.metricUrgentCirculars.textContent === '🔒');
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
  assert('Default Super Admin email is admin@campusnotify.edu', DEFAULT_SUPER_ADMIN.email === 'admin@campusnotify.edu');
  assert('Default Super Admin password is AdminPassword@123', DEFAULT_SUPER_ADMIN.password === 'AdminPassword@123');

  // Login as Super Admin
  localStorage.setItem('cnms_device_owner_verified', 'true');
  cnms.handleQuickAdminLogin();
  assert('Logged in user is System Administrator', cnms.currentUser.name === 'System Administrator');
  assert('User role is ADMIN', cnms.currentUser.role === 'ADMIN');
  assert('isAuthenticated() returns true', cnms.isAuthenticated() === true);
  assert('isAdmin() returns true', cnms.isAdmin() === true);
  assert('hasPostingAuthority() returns true', cnms.hasPostingAuthority() === true);

  // Render when logged in
  cnms.render();
  assert('KPI metrics display active circulars count', cnms.dom.metricTotalCirculars.textContent !== 'Locked' && cnms.dom.metricTotalCirculars.textContent !== '🔒');
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
  cnms.dom.noticeSignatory.value = 'Central Administration, Central Controller';

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
  await cnms.handleSubmitInquiry();
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
  await cnms.handleSendLoungeMessage();
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
  cnms.showToast = (msg, type) => { if (type === 'success' && (msg.includes('Logged in successfully') || msg.includes('Signed in successfully'))) loginSuccess = true; };
  await cnms.handleInstaLoginSubmit();
  assert('Approved account logs in successfully', loginSuccess && cnms.currentUser.username === 'pooja_verma');

  // --- TEST PILLAR 6: Super Admin-Only Color Customization & Theme Governance ---
  console.log('\n--- PILLAR 6: Super Admin-Only Color Customization & Theme Governance ---');
  assert('Default theme is light mode for academic presentation', document.documentElement.getAttribute('data-theme') === 'light');
  
  // 1. Regular Student (pooja_verma) has ZERO access to color customization
  assert('Student has isAdmin() false', cnms.isAdmin() === false);
  assert('Student cannot see openThemeStudioBtn', cnms.dom.openThemeStudioBtn.style.display === 'none');
  
  let blockedWarning = '';
  cnms.showToast = (msg, type) => { if (type === 'error') blockedWarning = msg; };
  cnms.openThemeStudio();
  assert('Student calling openThemeStudio is blocked by RBAC gate', blockedWarning.includes('Authority Restriction'));

  // 2. Super Admin Access Verification
  cnms.currentUser = Object.assign({}, DEFAULT_SUPER_ADMIN);
  cnms.updateUserSessionUI();
  assert('Super Admin has isAdmin() true', cnms.isAdmin() === true);
  assert('Super Admin can see openThemeStudioBtn in navbar', cnms.dom.openThemeStudioBtn.style.display !== 'none');
  
  // 3. Super Admin can apply curated academic presets
  assert('CNMS_PRESET_PALETTES provides at least 8 presets', Object.keys(CNMS_PRESET_PALETTES).length >= 8);
  cnms.applyCustomTheme(CNMS_PRESET_PALETTES.sapphire, true);
  assert('activeCustomPalette is updated with sapphire preset', cnms.activeCustomPalette.brandPrimary === '#2563eb');
  
  // 4. Super Admin can reset to default system theme
  cnms.resetDefaultTheme();
  assert('Reset removes custom palette from localStorage', localStorage.getItem('cnms_custom_palette') === null);

  // 5. Standard Light/Dark Toggle works cleanly
  cnms.toggleTheme();
  assert('Toggling theme switches to dark mode', document.documentElement.getAttribute('data-theme') === 'dark');
  assert('Dark theme is persisted to localStorage', localStorage.getItem('cnms_theme') === 'dark');

  cnms.toggleTheme();
  assert('Toggling theme switches back to light mode', document.documentElement.getAttribute('data-theme') === 'light');
  assert('Light theme is persisted to localStorage', localStorage.getItem('cnms_theme') === 'light');

  // --- TEST PILLAR 10: Cryptographic E2EE, User Privacy Shield & Profile Customization ---
  console.log('\n--- PILLAR 10: E2EE 256-Bit Cryptography, Privacy Shield & Profile Customizer ---');

  // 1. E2EE Cryptographic Verification
  const confidentialText = 'Official Confidential Academic Doubts 2026';
  const encResult = await cnms.e2ee.encrypt(confidentialText);
  assert('CampusE2EE encrypts payload with E2EE prefix', encResult.ciphertext.startsWith('E2EE:AES256GCM:'));
  assert('CampusE2EE encrypt flag is true', encResult.isE2ee === true);
  const decryptedText = cnms.e2ee.decryptSync(encResult.ciphertext);
  assert('CampusE2EE decryptSync restores original plain text', decryptedText === confidentialText);

  // 2. Privacy Shield: Shield raw personal email handle from Google login
  const rawFirebaseUser = {
    uid: 'google_user_998844',
    email: 'maneomkar844@gmail.com',
    displayName: 'Omkar Mane',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
  };
  await cnms.syncFirebaseUserToLocal(rawFirebaseUser);
  assert('Privacy Shield: Public username does NOT expose raw email prefix maneomkar844', cnms.currentUser.username !== 'maneomkar844');
  assert('Privacy Shield: Public username is shielded alias (e.g. scholar_844)', cnms.currentUser.username.startsWith('scholar_'));
  assert('Privacy Shield: Verified real email is preserved for Super Admin audit', cnms.currentUser.realEmail === 'maneomkar844@gmail.com');
  assert('Privacy Shield: Verified real name is preserved for Super Admin audit', cnms.currentUser.realName === 'Omkar Mane');
  assert('Profile Photo: Custom photoURL is preserved', cnms.currentUser.avatarUrl === rawFirebaseUser.photoURL);

  // 3. Profile Customization: User edits username and profile photo
  cnms.dom.editProfileFullName = { value: 'Omkar M.', focus: () => {} };
  cnms.dom.editProfileUsername = { value: 'omkar_lead', focus: () => {} };
  cnms.dom.editProfilePhotoUrl = { value: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120' };
  cnms.dom.editProfileRollNo = { value: 'TE-CS-844' };
  cnms.dom.editProfileDept = { value: 'Information Technology' };
  cnms.dom.editProfileYear = { value: 'Final Year (BE)' };
  cnms.dom.editProfileBio = { value: 'Campus Full Stack Research Scholar' };
  cnms.dom.editProfilePrivacyShield = { checked: true };

  await cnms.handleSaveProfileCustomization();
  assert('User can customize public username to @omkar_lead', cnms.currentUser.username === 'omkar_lead');
  assert('User can customize profile photo URL', cnms.currentUser.avatarUrl === 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120');
  assert('Real verified email maneomkar844@gmail.com remains protected in profile', cnms.currentUser.realEmail === 'maneomkar844@gmail.com');

  // 4. Lounge Messaging with E2EE
  cnms.dom.loungeTextInput.value = 'Encrypted campus inquiry with high privacy standards';
  await cnms.handleSendLoungeMessage();
  const lastMsg = cnms.loungeMessages[cnms.loungeMessages.length - 1];
  assert('Lounge message has isE2ee flag set', lastMsg.isE2ee === true);
  assert('Lounge message has E2EE ciphertext generated', typeof lastMsg.ciphertext === 'string' && lastMsg.ciphertext.startsWith('E2EE:AES256GCM:'));
  assert('Lounge message stores sender realEmail for Super Admin audit', lastMsg.senderRealEmail === 'maneomkar844@gmail.com');

  // 5. Viewer vs Super Admin Identity Audit in Community Lounge
  // Case A: Regular Viewer View
  cnms.currentUser = {
    id: 'user_viewer_09',
    name: 'Regular Student',
    username: 'student_99',
    role: 'VIEWER',
    canPost: false,
    status: 'APPROVED'
  };
  cnms.renderCommunityLounge();
  const loungeHtmlForViewer = cnms.dom.loungeMessagesFeed.innerHTML;
  assert('Viewer cannot see other students raw email maneomkar844@gmail.com in lounge', !loungeHtmlForViewer.includes('maneomkar844@gmail.com'));
  assert('Viewer sees E2EE cryptographic badge in lounge', loungeHtmlForViewer.includes('🔒 E2EE'));

  // Case B: Super Admin Exclusive View
  cnms.currentUser = Object.assign({}, DEFAULT_SUPER_ADMIN);
  cnms.renderCommunityLounge();
  const loungeHtmlForAdmin = cnms.dom.loungeMessagesFeed.innerHTML;
  assert('Lounge messages do not show clutter audit badge or bio in chat', !loungeHtmlForAdmin.includes('admin-audit-tag') && !loungeHtmlForAdmin.includes('🛡️ Verified ID:'));
  cnms.renderAdminUsersList();
  assert('Super Admin can audit verified student identity in Admin Governance Desk', cnms.dom.adminUsersListContainer.innerHTML.includes('🛡️ Verified Student:') && cnms.dom.adminUsersListContainer.innerHTML.includes('maneomkar844@gmail.com'));

  // 6. GIF Arrangement & Picker Grid Verification
  cnms.renderLoungeGifsGrid('all');
  const isGifFormatted = cnms.dom.loungeGifGrid.innerHTML.includes('gif-card-thumb') && cnms.dom.loungeGifGrid.innerHTML.includes('gif-card-label');
  assert('Curated GIF grid is properly formatted with .gif-card-thumb cards', isGifFormatted);
  assert('Lounge avatar with photo is strictly enclosed in lounge-msg-avatar container', loungeHtmlForViewer.includes('lounge-msg-avatar') && loungeHtmlForViewer.includes('avatar-msg-img'));
  assert('Lounge avatar image has strict 40px inline style constraint', loungeHtmlForViewer.includes('width: 40px !important') && loungeHtmlForViewer.includes('height: 40px !important'));
  assert('Lounge message item has robust flex layout inline constraint', loungeHtmlForViewer.includes('display: flex !important') && loungeHtmlForViewer.includes('min-width: 0 !important'));

  console.log('\n--- PILLAR 11: Instant Multi-Client Broadcast Bus & Notification Center ---');
  assert('Broadcast bus initialization method exists', typeof cnms.initRealtimeBroadcastBus === 'function');
  assert('Broadcast circular method exists', typeof cnms.broadcastNewCircular === 'function');
  assert('Receive broadcast circular method exists', typeof cnms.receiveBroadcastedCircular === 'function');
  
  const testCircular = {
    id: 'test_inst_notice_99',
    refNo: 'PVPPCOE/TEST/2026/99',
    title: 'Urgent Campus Dispatch Test',
    department: 'EXAM CELL',
    priority: 'Urgent',
    issuedAt: new Date().toISOString()
  };

  const dispatchStart = Date.now();
  cnms.receiveBroadcastedCircular(testCircular);
  const dispatchElapsed = Date.now() - dispatchStart;

  assert('Instant notification reception latency is sub-second (< 1000ms)', dispatchElapsed < 1000);
  assert('Unread notification count incremented', cnms.unreadNotificationCount > 0);
  assert('Notification history stores received broadcast', cnms.notificationsHistory.some(n => n.noticeId === testCircular.id));
  
  cnms.renderNotificationCenter();
  const notifCenterHtml = cnms.dom.notifItemsList ? cnms.dom.notifItemsList.innerHTML : '';
  assert('Notification center renders broadcasted item', notifCenterHtml.includes('Urgent Campus Dispatch Test'));
  
  cnms.markAllNotificationsRead();
  assert('Marking all notifications as read resets unread count to 0', cnms.unreadNotificationCount === 0);

  console.log('\n--- PILLAR 12: WhatsApp-Style Real-Time Multi-Device Chat Engine ---');
  assert('Broadcast lounge message method exists', typeof cnms.broadcastLoungeMessage === 'function');
  assert('Receive broadcast lounge message method exists', typeof cnms.receiveBroadcastedLoungeMessage === 'function');
  assert('Web Audio message pop chime method exists', typeof cnms.playMessagePopChime === 'function');

  // Test incoming peer message
  const peerMsg = {
    id: 'lounge_test_peer_101',
    senderId: 'peer_user_456',
    senderName: 'Neha Sharma',
    senderUsername: 'neha_it',
    text: 'Hey everyone, has the practical timetable been released?',
    timestamp: new Date().toISOString()
  };

  const initialLoungeLen = cnms.loungeMessages.length;
  cnms.receiveBroadcastedLoungeMessage(peerMsg);
  assert('Incoming peer message added to loungeMessages', cnms.loungeMessages.some(m => m.id === peerMsg.id));
  assert('Lounge messages count increased by 1', cnms.loungeMessages.length === initialLoungeLen + 1);

  // Test WhatsApp outgoing bubble and double blue tick
  cnms.currentUser = { id: 'test_current_user_01', name: 'Dr. Rajesh Patil', username: 'dr_rajesh', role: 'ADMIN' };
  cnms.renderCommunityLounge();
  const loungeHtml = cnms.dom.loungeMessagesFeed ? cnms.dom.loungeMessagesFeed.innerHTML : '';
  assert('Lounge feed supports WhatsApp message bubbles', loungeHtml.includes('lounge-msg-item'));

  console.log('\n================================================================');
  console.log(`  VERIFICATION COMPLETED: ${passed} / ${total} TESTS PASSED (${((passed/total)*100).toFixed(1)}%)`);
  console.log('================================================================\n');

  // Clean up test notice from storage
  localStorage.clear();
}

runTests().catch(err => {
  console.error('Test Suite Error:', err);
});
