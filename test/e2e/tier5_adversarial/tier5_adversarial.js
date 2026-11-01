/**
 * Tier 5: Adversarial Coverage Hardening & Integration Suite
 *
 * White-box adversarial testing, edge cases, chaos and stress hardening covering:
 * 1. Steganographic watermark cross-submission & tampering rejection.
 * 2. Sustained multi-window keystroke injection detection.
 * 3. IndexedDB power-cut simulation and decoupled localStorage mirror recovery.
 * 4. Three.js scene unmount / memory disposal verification.
 * 5. Edge-case attendance percentage zero-handling (0 lectures conducted = 100.00% by MU rules).
 */

const {
  assertEqual,
  assertNotEqual,
  assertTrue,
  assertFalse,
  assertRoughlyEqual
} = require('../harness/assertions');

const tests = [
  // ==========================================
  // ADVERSARIAL CATEGORY 1: Steganographic Watermark Cross-Submission & Tampering Rejection
  // ==========================================
  {
    id: 'T5_ADV01',
    name: 'Adversarial 1.1: Recovers authentic student PRN through bitwise zero-width steganographic round-trip',
    fn: async (client) => {
      const prn = 'VU4F2526072_MUMBAI_CAMPUS';
      const encoded = await client.encodeWatermark(prn);
      assertTrue(encoded.length > prn.length);
      assertTrue(encoded.includes('\u200B'), 'Must contain zero-width space for 0 bits');
      assertTrue(encoded.includes('\u200C'), 'Must contain zero-width non-joiner for 1 bits');

      const decoded = await client.decodeWatermark(encoded);
      assertEqual(decoded, prn, 'Steganographically decoded PRN must exactly match original PRN');

      const statement = `Write dynamic memory allocator in C.${encoded}`;
      const verified = await client.verifyWatermark(statement, prn);
      assertTrue(verified, 'Verification against original PRN must pass');
    }
  },
  {
    id: 'T5_ADV02',
    name: 'Adversarial 1.2: Strictly rejects cross-submission of problem statement watermarked for another student',
    fn: async (client) => {
      const studentAPrn = 'PRN_STUDENT_ALICE_2026';
      const studentBPrn = 'PRN_STUDENT_BOB_2026';

      const encodedA = await client.encodeWatermark(studentAPrn);
      const statementA = `Implement B+ Tree indexing algorithm.${encodedA}`;

      // Student A verification succeeds
      assertTrue(await client.verifyWatermark(statementA, studentAPrn));

      // Student B copies Student A's statement and attempts submission -> MUST BE REJECTED
      const crossVerified = await client.verifyWatermark(statementA, studentBPrn);
      assertFalse(crossVerified, 'Cross-submission of problem statement watermarked for Student A must fail verification for Student B');
    }
  },
  {
    id: 'T5_ADV03',
    name: 'Adversarial 1.3: Rejects tampered, truncated, or bit-flipped zero-width watermarks',
    fn: async (client) => {
      const prn = 'VU4F_SECURE_TOKEN_99';
      const encoded = await client.encodeWatermark(prn);

      // Attack: Malicious script strips some zero-width characters to corrupt watermark
      const tamperedEncoded = encoded.substring(0, 15) + '\u200D';
      const tamperedStatement = `Problem statement with altered bitstream.${tamperedEncoded}`;

      const verified = await client.verifyWatermark(tamperedStatement, prn);
      assertFalse(verified, 'Tampered or truncated zero-width bitstream must be rejected');

      // Edge cases: null statement or null expected PRN
      assertFalse(await client.verifyWatermark(null, prn));
      assertFalse(await client.verifyWatermark(tamperedStatement, null));
    }
  },

  // ==========================================
  // ADVERSARIAL CATEGORY 2: Sustained Multi-Window Keystroke Injection Detection
  // ==========================================
  {
    id: 'T5_ADV04',
    name: 'Adversarial 2.1: Flags sustained paste burst across extended window (500 chars in 200ms)',
    fn: async (client) => {
      // 500 characters over 200ms => velocity = 2.5 chars/ms (> 0.5 chars/ms threshold)
      // Even though deltaMs (200) >= 100ms, the velocity exceeds human limits
      const res = await client.evaluateTypingDynamics(500, 200);
      assertTrue(res.violation, 'Sustained injection across 200ms must trigger violation');
      assertEqual(res.type, 'BURST_INJECTION_DETECTED');
      assertRoughlyEqual(res.velocity, 2.5, 0.01);
    }
  },
  {
    id: 'T5_ADV05',
    name: 'Adversarial 2.2: Safely clamps negative deltaChars (rapid backspacing/deletion) with Math.abs',
    fn: async (client) => {
      // Negative delta chars (-400) in 100ms => velocity = 4.0 chars/ms (> 0.5 threshold)
      const res = await client.evaluateTypingDynamics(-400, 100);
      assertTrue(res.violation, 'Rapid bulk deletion must be evaluated with positive velocity and flagged');
      assertEqual(res.type, 'BURST_INJECTION_DETECTED');
      assertRoughlyEqual(res.velocity, 4.0, 0.01);
    }
  },
  {
    id: 'T5_ADV06',
    name: 'Adversarial 2.3: Allows legitimate fast human typing within permissible velocity limits',
    fn: async (client) => {
      // 25 characters in 250ms => velocity = 0.1 chars/ms (well below 0.5 chars/ms)
      const res = await client.evaluateTypingDynamics(25, 250);
      assertFalse(res.violation, 'Normal typing must not be flagged');
      assertEqual(res.type, 'NORMAL_TYPING');
      assertRoughlyEqual(res.velocity, 0.1, 0.01);
    }
  },

  // ==========================================
  // ADVERSARIAL CATEGORY 3: IndexedDB Power-Cut & Decoupled LocalStorage Mirror Recovery
  // ==========================================
  {
    id: 'T5_ADV07',
    name: 'Adversarial 3.1: Decoupled localStorage mirror survives simulated IndexedDB QuotaExceededError',
    fn: async (client) => {
      const record = {
        practicalId: 'prac_os_bankers',
        studentId: 'stud_72',
        content: 'int main() { printf("Bankers Algorithm\\n"); return 0; }',
        cursor: { line: 1, column: 45 }
      };

      // Simulate IndexedDB write failure (quota exceeded / transaction error)
      const result = await client.simulateCrdtWalDecoupledLifecycle({
        idbFails: true,
        storageFails: false,
        record
      });

      assertFalse(result.idbCommitted, 'IndexedDB commit should have failed as simulated');
      assertTrue(result.storageCommitted, 'Decoupled localStorage mirror must succeed despite IndexedDB failure');
      assertTrue(result.survivedIdbCrash, 'System must survive IndexedDB crash via mirror');
      assertEqual(result.recoverySource, 'LOCAL_STORAGE_MIRROR');
      assertEqual(result.recoveredRecord.content, record.content);
    }
  },
  {
    id: 'T5_ADV08',
    name: 'Adversarial 3.2: Full WAL lifecycle restores identical SHA-256 buffer checksum on cold restart',
    fn: async (client) => {
      const record = {
        practicalId: 'prac_compiler_lex',
        studentId: 'stud_99',
        content: '%% \n[0-9]+ { printf("NUMBER\\n"); }\n%%',
        cursor: { line: 3, column: 1 }
      };

      const result = await client.simulateCrdtWalDecoupledLifecycle({
        idbFails: false,
        storageFails: false,
        record
      });

      assertTrue(result.idbCommitted);
      assertTrue(result.storageCommitted);
      assertEqual(result.recoverySource, 'INDEXED_DB');
      assertTrue(result.recoveredRecord.checksum.length === 64, 'Must compute valid 64-char SHA-256 checksum');
      assertEqual(result.recoveredRecord.checksum, result.walRecord.checksum);
    }
  },

  // ==========================================
  // ADVERSARIAL CATEGORY 4: Three.js Scene Unmount & Memory Disposal Verification
  // ==========================================
  {
    id: 'T5_ADV09',
    name: 'Adversarial 4.1: Recursively traverses scene graph to dispose all geometries, materials, and textures',
    fn: async (client) => {
      let geoDisposed = 0;
      let matDisposed = 0;
      let texDisposed = 0;

      // Mock Three.js scene object tree with 5 buildings, monitor canvas texture, and event listeners
      const sceneObjects = [
        {
          geometry: { dispose: () => { geoDisposed++; } },
          material: { dispose: () => { matDisposed++; } },
          listeners: ['mousemove', 'click']
        },
        {
          geometry: { dispose: () => { geoDisposed++; } },
          material: [
            { dispose: () => { matDisposed++; } },
            { dispose: () => { matDisposed++; } }
          ]
        },
        {
          geometry: { dispose: () => { geoDisposed++; } },
          material: { dispose: () => { matDisposed++; } },
          texture: { dispose: () => { texDisposed++; } }
        }
      ];

      const disposalReport = await client.simulateThreeSceneDisposal(sceneObjects);

      assertEqual(disposalReport.disposedGeometries, 3, 'All geometries must be explicitly disposed');
      assertEqual(disposalReport.disposedMaterials, 4, 'All single and array materials must be disposed');
      assertEqual(disposalReport.disposedTextures, 1, 'CanvasTexture must be explicitly disposed');
      assertEqual(disposalReport.listenersDetached, 2, 'Window/canvas listeners must be detached on unmount');
      assertTrue(disposalReport.sceneCleared);
      assertTrue(disposalReport.vramFreed);
    }
  },

  // ==========================================
  // ADVERSARIAL CATEGORY 5: Edge-Case Attendance Zero-Handling (MU Rules)
  // ==========================================
  {
    id: 'T5_ADV10',
    name: 'Adversarial 5.1: 0 lectures conducted evaluates to 100.00% attendance under MU semester start rules',
    fn: async (client) => {
      // At semester start / before lectures commence, student has attended 0 of 0 lectures
      // Under MU Ordinance rules, this evaluates to 100.00% to prevent unlawful defaulter triggering
      const startPct = await client.calculateAttendanceSemesterStart(0, 0);
      assertEqual(startPct, 100.00, '0 lectures conducted must evaluate to 100.00% under MU semester start policy');

      // Defaulter tier at 100% must NOT be in defaulter list
      const defaulter = await client.evaluateDefaulter(startPct, 30);
      assertFalse(defaulter.isDefaulter, 'Student cannot be defaulted before classes commence');
      assertEqual(defaulter.tier, null, 'Safe attendance produces null defaulter tier');
    }
  },
  {
    id: 'T5_ADV11',
    name: 'Adversarial 5.2: Once first lecture is conducted, attendance immediately drops if absent',
    fn: async (client) => {
      // 1 lecture conducted, 0 attended => 0.00%
      const activePct = await client.calculateAttendance(0, 1);
      assertEqual(activePct, 0.00);

      const defaulter = await client.evaluateDefaulter(activePct, 30);
      assertTrue(defaulter.isDefaulter, 'Absent from first conducted lecture falls into defaulter pipeline');
      assertEqual(defaulter.tier, 'D1');
    }
  }
];

module.exports = {
  name: 'Tier 5: Adversarial Coverage Hardening & Final Integration',
  tests
};
