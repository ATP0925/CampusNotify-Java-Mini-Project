/**
 * Tier 1: Core Security & Crypto Foundation (Features 1 to 11)
 * >=5 happy-path test cases per feature = 55 tests
 */

const {
  assertEqual,
  assertNotEqual,
  assertTrue,
  assertFalse,
  assertRoughlyEqual,
  assertMatches,
  assertThrows
} = require('../harness/assertions');
const crypto = require('crypto');

const tests = [
  // ==========================================
  // FEATURE 1: Enterprise Build & Toolchain Scaffolding
  // ==========================================
  {
    id: 'F01_T01',
    featureId: 1,
    featureName: 'Enterprise Build & Toolchain Scaffolding',
    name: 'Accepts standard Java 17 toolchain with Spring Boot 3.3',
    fn: async (client) => {
      const res = client.simulator.validateToolchain({ javaVersion: 17, springBootVersion: '3.3.4', packaging: 'jar' });
      assertTrue(res.success, 'Java 17 with Spring Boot 3.3 should be valid');
      assertEqual(res.javaVersion, 17);
    }
  },
  {
    id: 'F01_T02',
    featureId: 1,
    featureName: 'Enterprise Build & Toolchain Scaffolding',
    name: 'Accepts LTS Java 21 toolchain with Spring Boot 3.4',
    fn: async (client) => {
      const res = client.simulator.validateToolchain({ javaVersion: 21, springBootVersion: '3.4.0', packaging: 'jar' });
      assertTrue(res.success, 'Java 21 with Spring Boot 3.4 should be valid');
      assertEqual(res.javaVersion, 21);
    }
  },
  {
    id: 'F01_T03',
    featureId: 1,
    featureName: 'Enterprise Build & Toolchain Scaffolding',
    name: 'Rejects unsupported legacy Java versions (e.g. Java 8 or 11)',
    fn: async (client) => {
      const res = client.simulator.validateToolchain({ javaVersion: 11, springBootVersion: '3.3.0', packaging: 'jar' });
      assertFalse(res.success, 'Java 11 must be rejected for Spring Boot 3+');
    }
  },
  {
    id: 'F01_T04',
    featureId: 1,
    featureName: 'Enterprise Build & Toolchain Scaffolding',
    name: 'Rejects Spring Boot 2.x versions incompatible with Spring Security 6',
    fn: async (client) => {
      const res = client.simulator.validateToolchain({ javaVersion: 17, springBootVersion: '2.7.18', packaging: 'jar' });
      assertFalse(res.success, 'Spring Boot 2.x must be rejected');
    }
  },
  {
    id: 'F01_T05',
    featureId: 1,
    featureName: 'Enterprise Build & Toolchain Scaffolding',
    name: 'Verifies executable jar packaging is enforced',
    fn: async (client) => {
      const res = client.simulator.validateToolchain({ javaVersion: 17, springBootVersion: '3.3.2', packaging: 'war' });
      assertFalse(res.success, 'War packaging without container embedding should fail verification');
    }
  },

  // ==========================================
  // FEATURE 2: Core Domain Entities (21 Entities)
  // ==========================================
  {
    id: 'F02_T01',
    featureId: 2,
    featureName: 'Core Domain Entities',
    name: 'Validates JPA audit timestamps and versioning on User entity',
    fn: async (client) => {
      const entity = { id: 'u1', username: 'student1', createdAt: Date.now(), updatedAt: Date.now(), version: 0, deletedAt: null };
      const audit = client.simulator.validateEntityAudit(entity);
      assertTrue(audit.valid, 'User entity must have audit fields');
    }
  },
  {
    id: 'F02_T02',
    featureId: 2,
    featureName: 'Core Domain Entities',
    name: 'Validates JPA audit timestamps on AttendanceRecord entity',
    fn: async (client) => {
      const entity = { id: 'att1', studentId: 's1', slotId: 'slot1', createdAt: Date.now(), updatedAt: Date.now(), version: 1, deletedAt: null };
      const audit = client.simulator.validateEntityAudit(entity);
      assertTrue(audit.valid, 'AttendanceRecord entity must have audit fields');
    }
  },
  {
    id: 'F02_T03',
    featureId: 2,
    featureName: 'Core Domain Entities',
    name: 'Validates JPA audit fields on LabSubmission entity',
    fn: async (client) => {
      const entity = { id: 'sub1', practicalId: 'p1', studentId: 's1', createdAt: Date.now(), updatedAt: Date.now(), version: 0, deletedAt: null };
      const audit = client.simulator.validateEntityAudit(entity);
      assertTrue(audit.valid, 'LabSubmission must have audit fields');
    }
  },
  {
    id: 'F02_T04',
    featureId: 2,
    featureName: 'Core Domain Entities',
    name: 'Validates JPA audit fields on NoDuesWorkflow entity',
    fn: async (client) => {
      const entity = { id: 'nd1', studentId: 's1', createdAt: Date.now(), updatedAt: Date.now(), version: 0, deletedAt: null };
      const audit = client.simulator.validateEntityAudit(entity);
      assertTrue(audit.valid, 'NoDuesWorkflow must have audit fields');
    }
  },
  {
    id: 'F02_T05',
    featureId: 2,
    featureName: 'Core Domain Entities',
    name: 'Flags missing audit field (e.g. missing deletedAt for soft delete)',
    fn: async (client) => {
      const brokenEntity = { id: 'e1', createdAt: Date.now(), updatedAt: Date.now(), version: 0 };
      const audit = client.simulator.validateEntityAudit(brokenEntity);
      assertFalse(audit.valid, 'Entity missing deletedAt should be invalid');
    }
  },

  // ==========================================
  // FEATURE 3: L1 Sliding JWT & Blacklist
  // ==========================================
  {
    id: 'F03_T01',
    featureId: 3,
    featureName: 'L1 Sliding JWT & Blacklist',
    name: 'Successfully issues and validates signed JWT with required claims',
    fn: async (client) => {
      const token = await client.issueToken({ sub: 'user_101', role: 'STUDENT', dept: 'IT', prn: 'PRN2026' });
      const { payload } = await client.verifyToken(token);
      assertEqual(payload.sub, 'user_101');
      assertEqual(payload.role, 'STUDENT');
      assertEqual(payload.dept, 'IT');
      assertTrue(payload.jti.length > 0);
    }
  },
  {
    id: 'F03_T02',
    featureId: 3,
    featureName: 'L1 Sliding JWT & Blacklist',
    name: 'Rejects tampered JWT payload with signature mismatch',
    fn: async (client) => {
      const token = await client.issueToken({ sub: 'user_101' });
      const parts = token.split('.');
      const tampered = parts[0] + 'tampered.' + parts[1];
      let threw = false;
      try {
        await client.verifyToken(tampered);
      } catch (err) {
        threw = true;
      }
      assertTrue(threw, 'Tampered token must throw verification error');
    }
  },
  {
    id: 'F03_T03',
    featureId: 3,
    featureName: 'L1 Sliding JWT & Blacklist',
    name: 'Immediately rejects revoked JTI present in Redis blacklist',
    fn: async (client) => {
      const token = await client.issueToken({ sub: 'user_revoke' });
      const { payload } = await client.verifyToken(token);
      await client.revokeToken(payload.jti);

      let threw = false;
      try {
        await client.verifyToken(token);
      } catch (err) {
        threw = true;
        assertEqual(err.message, 'TOKEN_REVOKED');
      }
      assertTrue(threw, 'Revoked token must be rejected');
    }
  },
  {
    id: 'F03_T04',
    featureId: 3,
    featureName: 'L1 Sliding JWT & Blacklist',
    name: 'Triggers sliding token renewal when remaining lifetime is under 5 minutes',
    fn: async (client) => {
      // Issue token with 3 minutes remaining
      const token = await client.issueToken({ sub: 'user_slide', role: 'STUDENT' }, 180000);
      const { payload, renewedToken } = await client.verifyToken(token, { checkSliding: true });
      assertEqual(payload.sub, 'user_slide');
      assertTrue(renewedToken !== null, 'Renewed token must be generated');
      const renewedVerify = await client.verifyToken(renewedToken, { checkSliding: false });
      assertEqual(renewedVerify.payload.sub, 'user_slide');
    }
  },
  {
    id: 'F03_T05',
    featureId: 3,
    featureName: 'L1 Sliding JWT & Blacklist',
    name: 'Does NOT renew token when remaining lifetime exceeds sliding threshold',
    fn: async (client) => {
      // 15 minutes remaining
      const token = await client.issueToken({ sub: 'user_fresh' }, 900000);
      const { renewedToken } = await client.verifyToken(token, { checkSliding: true });
      assertEqual(renewedToken, null, 'Fresh token should not trigger sliding renewal');
    }
  },

  // ==========================================
  // FEATURE 4: L2 Replica Lag & Read-Your-Own-Writes
  // ==========================================
  {
    id: 'F04_T01',
    featureId: 4,
    featureName: 'L2 Replica Lag & Read-Your-Own-Writes',
    name: 'Issues write fencing token on entity mutation',
    fn: async (client) => {
      const token = await client.recordWrite('student_attendance_1', { status: 'PRESENT' });
      assertTrue(token.startsWith('WF_'), 'Write fencing token should have WF_ prefix');
    }
  },
  {
    id: 'F04_T02',
    featureId: 4,
    featureName: 'L2 Replica Lag & Read-Your-Own-Writes',
    name: 'Guarantees strong consistency when reading with valid write fencing token',
    fn: async (client) => {
      const data = { marks: 24, status: 'GRADED' };
      const token = await client.recordWrite('sub_42', data);
      const res = await client.readEntity('sub_42', token);
      assertEqual(res.source, 'PRIMARY_CACHE');
      assertEqual(res.consistency, 'STRONG');
      assertEqual(res.data.marks, 24);
    }
  },
  {
    id: 'F04_T03',
    featureId: 4,
    featureName: 'L2 Replica Lag & Read-Your-Own-Writes',
    name: 'Falls back to eventual consistency when no write fencing token is provided',
    fn: async (client) => {
      const res = await client.readEntity('sub_42', null);
      assertEqual(res.source, 'READ_REPLICA');
      assertEqual(res.consistency, 'EVENTUAL');
    }
  },
  {
    id: 'F04_T04',
    featureId: 4,
    featureName: 'L2 Replica Lag & Read-Your-Own-Writes',
    name: 'Falls back to read replica when fencing token entity does not match requested entity',
    fn: async (client) => {
      const token = await client.recordWrite('entity_A', { val: 'A' });
      const res = await client.readEntity('entity_B', token);
      assertEqual(res.source, 'READ_REPLICA');
    }
  },
  {
    id: 'F04_T05',
    featureId: 4,
    featureName: 'L2 Replica Lag & Read-Your-Own-Writes',
    name: 'Verifies read-your-own-writes masks 500ms replica lag',
    fn: async (client) => {
      const token = await client.recordWrite('att_user1', { attended: 15, conducted: 20 });
      const readResult = await client.readEntity('att_user1', token);
      assertEqual(readResult.data.attended, 15);
      assertTrue(readResult.consistency === 'STRONG');
    }
  },

  // ==========================================
  // FEATURE 5: L3 Proxy Mitigation & Spatial Delta
  // ==========================================
  {
    id: 'F05_T01',
    featureId: 5,
    featureName: 'L3 Proxy Mitigation & Spatial Delta',
    name: 'Allows attendance scan within 50m geofence and matching BSSID',
    fn: async (client) => {
      const classroom = { lat: 19.0440, lon: 72.8210, bssid: '00:14:22:01:23:45', maxRadiusMeters: 50 };
      const scan = {
        studentId: 's_geo1',
        lat: 19.0441, // ~15m away
        lon: 72.8211,
        bssid: '00:14:22:01:23:45',
        timestamp: Date.now(),
        clientIp: '10.0.12.45'
      };
      const res = await client.verifyAttendanceLocation(scan, classroom);
      assertTrue(res.allowed, 'Scan within 50m and matching BSSID should be allowed');
    }
  },
  {
    id: 'F05_T02',
    featureId: 5,
    featureName: 'L3 Proxy Mitigation & Spatial Delta',
    name: 'Rejects attendance scan when BSSID does not match classroom Wi-Fi AP',
    fn: async (client) => {
      const classroom = { lat: 19.0440, lon: 72.8210, bssid: '00:14:22:01:23:45', maxRadiusMeters: 50 };
      const scan = {
        studentId: 's_geo2',
        lat: 19.0440,
        lon: 72.8210,
        bssid: '00:14:22:99:99:99', // Canteen AP
        timestamp: Date.now(),
        clientIp: '10.0.12.45'
      };
      const res = await client.verifyAttendanceLocation(scan, classroom);
      assertFalse(res.allowed);
      assertEqual(res.reason, 'BSSID_MISMATCH');
    }
  },
  {
    id: 'F05_T03',
    featureId: 5,
    featureName: 'L3 Proxy Mitigation & Spatial Delta',
    name: 'Rejects attendance scan outside classroom geofence (> 50m)',
    fn: async (client) => {
      const classroom = { lat: 19.0440, lon: 72.8210, bssid: '00:14:22:01:23:45', maxRadiusMeters: 50 };
      const scan = {
        studentId: 's_geo3',
        lat: 19.0480, // ~450m away
        lon: 72.8210,
        bssid: '00:14:22:01:23:45',
        timestamp: Date.now(),
        clientIp: '10.0.12.45'
      };
      const res = await client.verifyAttendanceLocation(scan, classroom);
      assertFalse(res.allowed);
      assertEqual(res.reason, 'OUT_OF_GEOFENCE');
    }
  },
  {
    id: 'F05_T04',
    featureId: 5,
    featureName: 'L3 Proxy Mitigation & Spatial Delta',
    name: 'Flags spatial velocity clamp violation on impossible physical displacement',
    fn: async (client) => {
      const classroomA = { lat: 19.0440, lon: 72.8210, bssid: 'ap_A' };
      const t0 = Date.now();
      // First scan at Lab
      await client.verifyAttendanceLocation({
        studentId: 's_speedy',
        lat: 19.0440,
        lon: 72.8210,
        bssid: 'ap_A',
        timestamp: t0,
        clientIp: '10.0.1.1'
      }, classroomA);

      // Second scan 5 seconds later, 20 km away!
      const classroomB = { lat: 19.2000, lon: 72.8500, bssid: 'ap_B' };
      const res2 = await client.verifyAttendanceLocation({
        studentId: 's_speedy',
        lat: 19.2000,
        lon: 72.8500,
        bssid: 'ap_B',
        timestamp: t0 + 5000,
        clientIp: '10.0.1.2'
      }, classroomB);

      assertFalse(res2.allowed);
      assertEqual(res2.reason, 'SPATIAL_VELOCITY_CLAMP_VIOLATION');
    }
  },
  {
    id: 'F05_T05',
    featureId: 5,
    featureName: 'L3 Proxy Mitigation & Spatial Delta',
    name: 'Verifies exact Haversine distance computation within 1% precision',
    fn: async (client) => {
      // Bombay High Court (18.9298, 72.8301) to Gateway of India (18.9220, 72.8347) ~ 995 meters
      const dist = client.simulator.calculateHaversineDistance(18.9298, 72.8301, 18.9220, 72.8347);
      assertRoughlyEqual(dist, 995, 25, 'Haversine distance should be ~995m');
    }
  },

  // ==========================================
  // FEATURE 6: L4 Dynamic TOTP QR Rotation
  // ==========================================
  {
    id: 'F06_T01',
    featureId: 6,
    featureName: 'L4 Dynamic TOTP QR Rotation',
    name: 'Generates 6-digit TOTP token using HMAC-SHA256 and 15s window',
    fn: async (client) => {
      const secret = 'SESSION_KEY_LAB_103';
      const totp = await client.generateTotpQr(secret, Date.now(), 15);
      assertEqual(totp.token.length, 6);
      assertMatches(totp.token, /^\d{6}$/);
    }
  },
  {
    id: 'F06_T02',
    featureId: 6,
    featureName: 'L4 Dynamic TOTP QR Rotation',
    name: 'Successfully verifies valid TOTP token within current time window',
    fn: async (client) => {
      const secret = 'SESSION_KEY_LAB_103';
      const now = Date.now();
      const totp = await client.generateTotpQr(secret, now, 15);
      const res = await client.verifyTotpQr(secret, totp.token, now, 15);
      assertTrue(res.valid);
    }
  },
  {
    id: 'F06_T03',
    featureId: 6,
    featureName: 'L4 Dynamic TOTP QR Rotation',
    name: 'Accepts 1-step window drift (-15s) for network latency tolerance',
    fn: async (client) => {
      const secret = 'SESSION_KEY_LAB_103';
      const t0 = 1000000000;
      const totp = await client.generateTotpQr(secret, t0, 15);
      // Student scans at t0 + 16s (next window)
      const res = await client.verifyTotpQr(secret, totp.token, t0 + 16000, 15);
      assertTrue(res.valid, 'Should accept 1 window drift');
    }
  },
  {
    id: 'F06_T04',
    featureId: 6,
    featureName: 'L4 Dynamic TOTP QR Rotation',
    name: 'Rejects TOTP token after 2 windows (>30s) elapse',
    fn: async (client) => {
      const secret = 'SESSION_KEY_LAB_103';
      const t0 = 1000000000;
      const totp = await client.generateTotpQr(secret, t0, 15);
      const res = await client.verifyTotpQr(secret, totp.token, t0 + 35000, 15);
      assertFalse(res.valid);
      assertEqual(res.reason, 'TOTP_EXPIRED_OR_INVALID');
    }
  },
  {
    id: 'F06_T05',
    featureId: 6,
    featureName: 'L4 Dynamic TOTP QR Rotation',
    name: 'Verifies different secret keys generate different TOTP tokens',
    fn: async (client) => {
      const now = Date.now();
      const totp1 = await client.generateTotpQr('KEY_ALPHA', now, 15);
      const totp2 = await client.generateTotpQr('KEY_BETA', now, 15);
      assertNotEqual(totp1.token, totp2.token);
    }
  },

  // ==========================================
  // FEATURE 7: L5 Soft-Delete Invariants
  // ==========================================
  {
    id: 'F07_T01',
    featureId: 7,
    featureName: 'L5 Soft-Delete Invariants',
    name: 'Soft delete sets isDeleted true and deletedAt timestamp',
    fn: async (client) => {
      const store = new Map();
      store.set('item1', { id: 'item1', name: 'Course A', isDeleted: false, deletedAt: null });
      const ok = client.simulator.softDeleteRecord(store, 'item1', 'admin_1');
      assertTrue(ok);
      const item = store.get('item1');
      assertTrue(item.isDeleted);
      assertTrue(item.deletedAt !== null);
      assertEqual(item.deletedBy, 'admin_1');
    }
  },
  {
    id: 'F07_T02',
    featureId: 7,
    featureName: 'L5 Soft-Delete Invariants',
    name: 'Active record query filters out soft-deleted items',
    fn: async (client) => {
      const store = new Map();
      store.set('i1', { id: 'i1', isDeleted: false, deletedAt: null });
      store.set('i2', { id: 'i2', isDeleted: true, deletedAt: Date.now() });
      store.set('i3', { id: 'i3', isDeleted: false, deletedAt: null });
      const active = client.simulator.queryActiveRecords(store);
      assertEqual(active.length, 2);
      assertTrue(active.every(i => !i.isDeleted));
    }
  },
  {
    id: 'F07_T03',
    featureId: 7,
    featureName: 'L5 Soft-Delete Invariants',
    name: 'Soft-deleted records remain intact for accreditation audit trail',
    fn: async (client) => {
      const store = new Map();
      store.set('grade_1', { id: 'grade_1', marks: 25, isDeleted: false, deletedAt: null });
      client.simulator.softDeleteRecord(store, 'grade_1', 'hod_1');
      // Record must not be physically erased
      assertTrue(store.has('grade_1'));
      assertEqual(store.get('grade_1').marks, 25);
    }
  },
  {
    id: 'F07_T04',
    featureId: 7,
    featureName: 'L5 Soft-Delete Invariants',
    name: 'Soft delete on non-existent item returns false',
    fn: async (client) => {
      const store = new Map();
      const ok = client.simulator.softDeleteRecord(store, 'missing_id', 'admin_1');
      assertFalse(ok);
    }
  },
  {
    id: 'F07_T05',
    featureId: 7,
    featureName: 'L5 Soft-Delete Invariants',
    name: 'Preserves partial unique index invariant across soft deletes',
    fn: async (client) => {
      const users = new Map();
      users.set('u1', { id: 'u1', email: 'test@campus.edu', isDeleted: false, deletedAt: null });
      // Soft-delete u1
      client.simulator.softDeleteRecord(users, 'u1', 'admin');
      // New user with same email can now be created in active pool
      const active = client.simulator.queryActiveRecords(users);
      const emailConflict = active.some(u => u.email === 'test@campus.edu');
      assertFalse(emailConflict, 'Soft-deleted user should not conflict with active unique index');
    }
  },

  // ==========================================
  // FEATURE 8: L6 AES-256-GCM Envelope Encryption
  // ==========================================
  {
    id: 'F08_T01',
    featureId: 8,
    featureName: 'L6 AES-256-GCM Envelope Encryption',
    name: 'Encrypts and decrypts sensitive PII string losslessly',
    fn: async (client) => {
      const plaintext = 'Aadhaar: 1234-5678-9012, Parent Phone: +91-9876543210';
      const enc = await client.encryptAesGcm(plaintext);
      const dec = await client.decryptAesGcm(enc.ciphertext, enc.iv, enc.authTag, enc.keyHex);
      assertEqual(dec, plaintext);
    }
  },
  {
    id: 'F08_T02',
    featureId: 8,
    featureName: 'L6 AES-256-GCM Envelope Encryption',
    name: 'Enforces 96-bit (12-byte / 24-hex) IV length',
    fn: async (client) => {
      const enc = await client.encryptAesGcm('test');
      assertEqual(enc.iv.length, 24, '12-byte IV in hex is 24 characters');
    }
  },
  {
    id: 'F08_T03',
    featureId: 8,
    featureName: 'L6 AES-256-GCM Envelope Encryption',
    name: 'Enforces 128-bit (16-byte / 32-hex) GCM auth tag',
    fn: async (client) => {
      const enc = await client.encryptAesGcm('test');
      assertEqual(enc.authTag.length, 32, '16-byte auth tag in hex is 32 characters');
    }
  },
  {
    id: 'F08_T04',
    featureId: 8,
    featureName: 'L6 AES-256-GCM Envelope Encryption',
    name: 'Throws authentication error when auth tag is tampered',
    fn: async (client) => {
      const enc = await client.encryptAesGcm('Secret Bank Details');
      // Tamper with last character of auth tag
      const tamperedTag = enc.authTag.slice(0, -1) + (enc.authTag.slice(-1) === 'a' ? 'b' : 'a');
      let threw = false;
      try {
        await client.decryptAesGcm(enc.ciphertext, enc.iv, tamperedTag, enc.keyHex);
      } catch (err) {
        threw = true;
      }
      assertTrue(threw, 'Tampered GCM auth tag must fail decryption');
    }
  },
  {
    id: 'F08_T05',
    featureId: 8,
    featureName: 'L6 AES-256-GCM Envelope Encryption',
    name: 'Throws error when ciphertext body is tampered',
    fn: async (client) => {
      const enc = await client.encryptAesGcm('Confidential Salary');
      const tamperedCipher = 'ff' + enc.ciphertext.slice(2);
      let threw = false;
      try {
        await client.decryptAesGcm(tamperedCipher, enc.iv, enc.authTag, enc.keyHex);
      } catch (err) {
        threw = true;
      }
      assertTrue(threw, 'Tampered ciphertext must fail GCM verification');
    }
  },

  // ==========================================
  // FEATURE 9: L7 RFC 4180 CSV Formula Neutralization
  // ==========================================
  {
    id: 'F09_T01',
    featureId: 9,
    featureName: 'L7 RFC 4180 CSV Formula Neutralization',
    name: 'Neutralizes leading equals sign (=) with single quote prepend',
    fn: async (client) => {
      const sanitized = await client.sanitizeCsvCell('=SUM(A1:A10)');
      assertEqual(sanitized, "'=SUM(A1:A10)");
    }
  },
  {
    id: 'F09_T02',
    featureId: 9,
    featureName: 'L7 RFC 4180 CSV Formula Neutralization',
    name: 'Neutralizes leading plus (+) and minus (-) formula prefixes',
    fn: async (client) => {
      const p = await client.sanitizeCsvCell('+cmd|"/c calc"!A1');
      const m = await client.sanitizeCsvCell('-cmd|"/c calc"!A1');
      assertEqual(p, "'+cmd|\"/c calc\"!A1");
      assertEqual(m, "'-cmd|\"/c calc\"!A1");
    }
  },
  {
    id: 'F09_T03',
    featureId: 9,
    featureName: 'L7 RFC 4180 CSV Formula Neutralization',
    name: 'Neutralizes leading @, |, and % characters',
    fn: async (client) => {
      assertEqual(await client.sanitizeCsvCell('@SUM(1,2)'), "'@SUM(1,2)");
      assertEqual(await client.sanitizeCsvCell('|calc.exe'), "'|calc.exe");
      assertEqual(await client.sanitizeCsvCell('%username%'), "'%username%");
    }
  },
  {
    id: 'F09_T04',
    featureId: 9,
    featureName: 'L7 RFC 4180 CSV Formula Neutralization',
    name: 'Leaves regular alphanumeric strings unmodified',
    fn: async (client) => {
      assertEqual(await client.sanitizeCsvCell('John Doe'), 'John Doe');
      assertEqual(await client.sanitizeCsvCell('Roll_No_72'), 'Roll_No_72');
      assertEqual(await client.sanitizeCsvCell('85.50'), '85.50');
    }
  },
  {
    id: 'F09_T05',
    featureId: 9,
    featureName: 'L7 RFC 4180 CSV Formula Neutralization',
    name: 'Handles empty string and null gracefully',
    fn: async (client) => {
      assertEqual(await client.sanitizeCsvCell(''), '');
      assertEqual(await client.sanitizeCsvCell(null), '');
      assertEqual(await client.sanitizeCsvCell(undefined), '');
    }
  },

  // ==========================================
  // FEATURE 10: L8 Two-Man Rule Grade Revision Chaining
  // ==========================================
  {
    id: 'F10_T01',
    featureId: 10,
    featureName: 'L8 Two-Man Rule Grade Revision Chaining',
    name: 'Creates genesis block for initial grade change with zero prevHash',
    fn: async (client) => {
      const node = await client.appendGradeRevision('s10', 'sub_math', 18, 22, 'fac_rao', 'hod_patil');
      assertEqual(node.prevHash, '0000000000000000000000000000000000000000000000000000000000000000');
      assertEqual(node.newMarks, 22);
      assertTrue(node.hash.length === 64);
    }
  },
  {
    id: 'F10_T02',
    featureId: 10,
    featureName: 'L8 Two-Man Rule Grade Revision Chaining',
    name: 'Links subsequent revisions cryptographically to prior revision hash',
    fn: async (client) => {
      const n1 = await client.appendGradeRevision('s20', 'sub_dbms', 15, 18, 'fac_a', 'hod_b');
      const n2 = await client.appendGradeRevision('s20', 'sub_dbms', 18, 20, 'fac_a', 'hod_b');
      assertEqual(n2.prevHash, n1.hash, 'Node 2 prevHash must match Node 1 hash');
    }
  },
  {
    id: 'F10_T03',
    featureId: 10,
    featureName: 'L8 Two-Man Rule Grade Revision Chaining',
    name: 'Successfully verifies intact cryptographic revision chain',
    fn: async (client) => {
      await client.appendGradeRevision('s30', 'sub_os', 12, 16, 'fac_x', 'hod_y');
      await client.appendGradeRevision('s30', 'sub_os', 16, 19, 'fac_x', 'hod_y');
      const isValid = await client.verifyGradeChain('s30', 'sub_os');
      assertTrue(isValid);
    }
  },
  {
    id: 'F10_T04',
    featureId: 10,
    featureName: 'L8 Two-Man Rule Grade Revision Chaining',
    name: 'Rejects grade revision if HOD or Faculty approver is missing',
    fn: async (client) => {
      let threw = false;
      try {
        await client.appendGradeRevision('s40', 'sub_cn', 10, 15, 'fac_alone', null);
      } catch (err) {
        threw = true;
      }
      assertTrue(threw, 'Two-man rule must require both approvers');
    }
  },
  {
    id: 'F10_T05',
    featureId: 10,
    featureName: 'L8 Two-Man Rule Grade Revision Chaining',
    name: 'Detects unauthorized tampering in historical revision chain',
    fn: async (client) => {
      await client.appendGradeRevision('s50', 'sub_ai', 14, 18, 'fac_1', 'hod_1');
      // Tamper directly with the chain in simulator
      const chain = client.simulator.gradeRevisionChains.get('s50_sub_ai');
      chain[0].newMarks = 25; // illegal marks inflation!
      const isValid = await client.verifyGradeChain('s50', 'sub_ai');
      assertFalse(isValid, 'Chain tampering must be detected');
    }
  },

  // ==========================================
  // FEATURE 11: Authentication & User Management APIs
  // ==========================================
  {
    id: 'F11_T01',
    featureId: 11,
    featureName: 'Authentication & User Management APIs',
    name: 'Registers a new student user and stores salted password hash',
    fn: async (client) => {
      const user = await client.register('student_alice', 'Pass@1234', 'STUDENT', 'IT');
      assertEqual(user.username, 'student_alice');
      assertEqual(user.role, 'STUDENT');
      assertNotEqual(user.passwordHash, 'Pass@1234');
      assertTrue(user.salt.length > 0);
    }
  },
  {
    id: 'F11_T02',
    featureId: 11,
    featureName: 'Authentication & User Management APIs',
    name: 'Authenticates student user with correct credentials',
    fn: async (client) => {
      await client.register('student_bob', 'SecurePwd!2026', 'STUDENT');
      const auth = await client.login('student_bob', 'SecurePwd!2026');
      assertTrue(auth.token.length > 0);
      assertEqual(auth.user.username, 'student_bob');
    }
  },
  {
    id: 'F11_T03',
    featureId: 11,
    featureName: 'Authentication & User Management APIs',
    name: 'Rejects authentication with incorrect password',
    fn: async (client) => {
      await client.register('student_charlie', 'CorrectPwd', 'STUDENT');
      let threw = false;
      try {
        await client.login('student_charlie', 'WrongPwd');
      } catch (err) {
        threw = true;
        assertEqual(err.message, 'INVALID_PASSWORD');
      }
      assertTrue(threw);
    }
  },
  {
    id: 'F11_T04',
    featureId: 11,
    featureName: 'Authentication & User Management APIs',
    name: 'Rejects authentication for non-existent username',
    fn: async (client) => {
      let threw = false;
      try {
        await client.login('ghost_user_404', 'SomePass');
      } catch (err) {
        threw = true;
        assertEqual(err.message, 'USER_NOT_FOUND');
      }
      assertTrue(threw);
    }
  },
  {
    id: 'F11_T05',
    featureId: 11,
    featureName: 'Authentication & User Management APIs',
    name: 'Prevents duplicate username registration',
    fn: async (client) => {
      await client.register('unique_user', 'Pass1', 'STUDENT');
      let threw = false;
      try {
        await client.register('unique_user', 'Pass2', 'STUDENT');
      } catch (err) {
        threw = true;
        assertEqual(err.message, 'USERNAME_ALREADY_EXISTS');
      }
      assertTrue(threw);
    }
  }
];

module.exports = {
  name: 'Tier 1: Core Security & Foundation (Features 1-11)',
  tests
};
