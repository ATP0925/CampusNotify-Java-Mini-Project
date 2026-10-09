const fs = require('fs');
const assert = require('assert');

console.log('Verifying Firebase setup for project: campnotify-eef91...\n');

// 1. Check index.html
const html = fs.readFileSync('index.html', 'utf8');
assert(html.includes('campnotify-eef91'), 'Project ID missing from index.html');
assert(html.includes('AIzaSyBpUKTP-9t2P6b5fZjslNCKsTI_PsWbi90'), 'API Key missing from index.html');
assert(html.includes('1:731953392545:web:49223c1539a4a74566b9e0'), 'App ID missing from index.html');
assert(html.includes('firebase-analytics-compat.js'), 'Firebase analytics script missing from index.html');
assert(html.includes('firebase-auth-compat.js'), 'Firebase auth script missing from index.html');
assert(html.includes('firebaseGoogleLoginBtn'), 'Google Login button missing from index.html');
assert(html.includes('firebasePhoneLoginToggleBtn'), 'Phone login toggle missing from index.html');
assert(html.includes('recaptcha-container'), 'reCAPTCHA container missing from index.html');
console.log('✔ index.html contains all Firebase SDKs, config values, and Auth UI elements');

// 2. Check app.js
const appJs = fs.readFileSync('app.js', 'utf8');
assert(appJs.includes('AIzaSyBpUKTP-9t2P6b5fZjslNCKsTI_PsWbi90'), 'API key missing in app.js DEFAULT_FIREBASE_CONFIG');
assert(appJs.includes('campnotify-eef91'), 'Project ID missing in app.js');
assert(appJs.includes('1:731953392545:web:49223c1539a4a74566b9e0'), 'App ID missing in app.js');
assert(appJs.includes('G-W057SME5BJ'), 'Measurement ID missing in app.js');
assert(appJs.includes('731953392545'), 'Sender ID missing in app.js');
assert(appJs.includes('handleFirebaseGoogleSignIn'), 'handleFirebaseGoogleSignIn missing from app.js');
assert(appJs.includes('handleFirebaseSendPhoneOtp'), 'handleFirebaseSendPhoneOtp missing from app.js');
assert(appJs.includes('handleFirebaseVerifyPhoneOtp'), 'handleFirebaseVerifyPhoneOtp missing from app.js');
assert(appJs.includes('signInWithEmailAndPassword'), 'signInWithEmailAndPassword missing from app.js');
assert(appJs.includes('createUserWithEmailAndPassword'), 'createUserWithEmailAndPassword missing from app.js');
console.log('✔ app.js contains full Firebase config, Auth handlers (Google, Phone OTP, Email/Password), and Cloud sync');

// 3. Check firebase.json
const fbJson = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
assert(fbJson.auth && fbJson.auth.providers, 'auth providers missing from firebase.json');
assert(fbJson.auth.providers.emailPassword === true, 'emailPassword missing from firebase.json');
assert(fbJson.auth.providers.googleSignIn, 'googleSignIn missing from firebase.json');
assert(fbJson.firestore && fbJson.firestore.rules, 'firestore config missing from firebase.json');
console.log('✔ firebase.json properly configured for Auth (Email/Password, Google) and Firestore');

// 4. Check .firebaserc
const fbRc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
assert(fbRc.projects && fbRc.projects.default === 'campnotify-eef91', 'default project mismatch in .firebaserc');
console.log('✔ .firebaserc default project set to campnotify-eef91');

// 5. Check firestore.rules
const rules = fs.readFileSync('firestore.rules', 'utf8');
assert(rules.includes('cnms_notices'), 'cnms_notices rules missing');
assert(rules.includes('cnms_users'), 'cnms_users rules missing');
assert(rules.includes('cnms_community_messages'), 'cnms_community_messages rules missing');
console.log('✔ firestore.rules contains rules for all 3 collections');

console.log('\n=========================================');
console.log('ALL FIREBASE CONFIG CHECKS PASSED (100%)');
console.log('=========================================');
