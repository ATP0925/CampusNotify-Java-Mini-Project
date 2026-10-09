// Verification test for T&C toggle drawer & removal of device accounts card
const fs = require('fs');
const assert = require('assert');

console.log('Testing removal of "Accounts on this device" and hiding under T&C button...');

const html = fs.readFileSync('index.html', 'utf8');

// 1. Verify "ACCOUNTS ON THIS DEVICE" is completely removed
assert.strictEqual(html.includes('ACCOUNTS ON THIS DEVICE'), false, 'Should NOT contain "ACCOUNTS ON THIS DEVICE"');
assert.strictEqual(html.includes('instaSavedProfilesCard'), false, 'Should NOT contain "instaSavedProfilesCard"');
console.log('✔ Check 1: "ACCOUNTS ON THIS DEVICE" and instaSavedProfilesCard are absent from index.html');

// 2. Verify T&C button and drawer elements exist
assert.strictEqual(html.includes('id="toggleTermsConditionsBtn"'), true, 'Should contain toggleTermsConditionsBtn');
assert.strictEqual(html.includes('id="termsConditionsDrawer"'), true, 'Should contain termsConditionsDrawer');
assert.strictEqual(html.includes('id="tcChevronIcon"'), true, 'Should contain tcChevronIcon');
assert.strictEqual(html.includes('id="openFullPrivacyModalBtn"'), true, 'Should contain openFullPrivacyModalBtn');
console.log('✔ Check 2: T&C button, drawer, chevron, and modal trigger button exist');

// 3. Verify drawer is hidden by default
assert.strictEqual(html.includes('id="termsConditionsDrawer" style="display: none;"'), true, 'Drawer should be hidden by default with display: none;');
console.log('✔ Check 3: Drawer is hidden by default');

// 4. Verify privacy pillars are inside the drawer
const drawerContent = html.split('id="termsConditionsDrawer"')[1].split('<!-- INSTITUTIONAL FOOTER -->')[0];
assert.strictEqual(drawerContent.includes('Campus Data Privacy &amp; Platform Protection'), true, 'Drawer contains privacy header');
assert.strictEqual(drawerContent.includes('Cryptographic Protection'), true, 'Drawer contains Cryptographic Protection');
assert.strictEqual(drawerContent.includes('Zero 3rd-Party Tracking'), true, 'Drawer contains Zero 3rd-Party Tracking');
assert.strictEqual(drawerContent.includes('Admin Approval Shield'), true, 'Drawer contains Admin Approval Shield');
assert.strictEqual(drawerContent.includes('Right to Erasure'), true, 'Drawer contains Right to Erasure');
console.log('✔ Check 4: Privacy pillars & protections are neatly contained inside the hidden drawer');

console.log('\nALL T&C TESTS PASSED SUCCESSFULLY! 🚀');
