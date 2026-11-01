/**
 * CampusNotify E2E Test Suite - Authoritative Contract Simulator & Reference Engine
 * Implements exact mathematical formulas, algorithms, security layers, and RFC specs
 * as specified in PROJECT.md and the architectural blueprints.
 */

const crypto = require('crypto');

// --- Helper Utilities ---
function sha256(data) {
  return crypto.createHash('sha256').update(String(data)).digest('hex');
}

function hmacSha256(key, data) {
  return crypto.createHmac('sha256', key).update(String(data)).digest('hex');
}

// Modular exponentiation: (base^exp) % mod
function modPow(base, exp, mod) {
  let res = 1n;
  let b = BigInt(base) % BigInt(mod);
  let e = BigInt(exp);
  const m = BigInt(mod);
  while (e > 0n) {
    if (e % 2n === 1n) res = (res * b) % m;
    b = (b * b) % m;
    e = e / 2n;
  }
  return res;
}

// Extended Euclidean Algorithm for modular inverse
function modInverse(a, m) {
  let [old_r, r] = [BigInt(a), BigInt(m)];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const quotient = old_r / r;
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
  }
  return (old_s % BigInt(m) + BigInt(m)) % BigInt(m);
}

// --- Specification Implementations ---

class ContractSimulator {
  constructor() {
    this.resetState();
  }

  resetState() {
    this.users = new Map();
    this.jtiBlacklist = new Set();
    this.activeSessions = new Map();
    this.writeFencingTokens = new Map();
    this.attendanceRecords = new Map();
    this.defaulterAuditLog = [];
    this.gradeRevisionChains = new Map();
    this.timetableSlots = new Map();
    this.facultySwaps = new Map();
    this.noDuesWorkflows = new Map();
    this.spentFeedbackTokens = new Set();
    this.registeredFeedback = [];
    this.submissions = new Map();
    this.proctoringLogs = [];
    this.crdtWalLogs = new Map();
    this.notices = [];

    // Initialize mock RSA keypair for Chaumian Blind Signatures
    // Small valid RSA parameters for deterministic test verification:
    // p = 61, q = 53 => N = 3233, phi = (p-1)*(q-1) = 3120, e = 17, d = 2753
    this.rsa = {
      N: 3233n,
      e: 17n,
      d: 2753n,
      phi: 3120n
    };
  }

  // ==========================================
  // FEATURE 1: Enterprise Build & Toolchain
  // ==========================================
  validateToolchain(config) {
    const supportedJava = [17, 21];
    const isJavaValid = supportedJava.includes(Number(config.javaVersion));
    const isSpringBoot3 = String(config.springBootVersion).startsWith('3.');
    const isPackagingJar = config.packaging === 'jar';
    return {
      success: isJavaValid && isSpringBoot3 && isPackagingJar,
      javaVersion: config.javaVersion,
      springBootVersion: config.springBootVersion,
      packaging: config.packaging
    };
  }

  // ==========================================
  // FEATURE 2: Core Domain Entities
  // ==========================================
  validateEntityAudit(entity) {
    const requiredAuditFields = ['id', 'createdAt', 'updatedAt', 'version', 'deletedAt'];
    const hasAuditFields = requiredAuditFields.every(field => field in entity && entity[field] !== undefined);
    const versionValid = typeof entity.version === 'number' && entity.version >= 0;
    return {
      valid: hasAuditFields && versionValid,
      hasAuditFields
    };
  }

  // ==========================================
  // FEATURE 3: L1 Sliding JWT & Blacklist
  // ==========================================
  issueToken(payload, expiresInMs = 900000) { // 15 min default
    const jti = crypto.randomUUID();
    const tokenPayload = {
      sub: payload.sub,
      role: payload.role || 'STUDENT',
      dept: payload.dept || 'IT',
      prn: payload.prn || 'PRN12345',
      jti,
      iat: Date.now(),
      exp: Date.now() + expiresInMs
    };
    const encoded = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
    const signature = hmacSha256('CAMPUS_NOTIFY_SECRET_KEY_2026', encoded);
    return `${encoded}.${signature}`;
  }

  verifyToken(tokenStr, options = { checkSliding: true }) {
    if (!tokenStr || typeof tokenStr !== 'string' || !tokenStr.includes('.')) {
      throw new Error('MALFORMED_TOKEN');
    }
    const [encoded, signature] = tokenStr.split('.');
    const expectedSig = hmacSha256('CAMPUS_NOTIFY_SECRET_KEY_2026', encoded);
    if (signature !== expectedSig) {
      throw new Error('INVALID_SIGNATURE');
    }
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (this.jtiBlacklist.has(payload.jti)) {
      throw new Error('TOKEN_REVOKED');
    }
    const now = Date.now();
    if (now > payload.exp) {
      throw new Error('TOKEN_EXPIRED');
    }

    let renewedToken = null;
    // Sliding renewal if remaining lifetime < 5 minutes (300,000 ms)
    if (options.checkSliding && (payload.exp - now < 300000)) {
      renewedToken = this.issueToken({
        sub: payload.sub,
        role: payload.role,
        dept: payload.dept,
        prn: payload.prn
      });
    }

    return { payload, renewedToken };
  }

  revokeToken(jti) {
    this.jtiBlacklist.add(jti);
    return true;
  }

  // ==========================================
  // FEATURE 4: L2 Replica Lag & Read-Your-Own-Writes
  // ==========================================
  recordWrite(entityId, data) {
    const fencingToken = `WF_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    this.writeFencingTokens.set(fencingToken, {
      entityId,
      timestamp: Date.now(),
      data
    });
    return fencingToken;
  }

  readEntity(entityId, clientFencingToken, options = { replicaLagMs: 1000 }) {
    const now = Date.now();
    if (clientFencingToken && this.writeFencingTokens.has(clientFencingToken)) {
      const record = this.writeFencingTokens.get(clientFencingToken);
      // Read-your-own-writes guarantees consistency: serve from primary
      if (record.entityId === entityId) {
        return { source: 'PRIMARY_CACHE', data: record.data, consistency: 'STRONG' };
      }
    }
    // Otherwise fallback to simulated replica read (subject to replica lag)
    return { source: 'READ_REPLICA', data: { id: entityId, lagged: true }, consistency: 'EVENTUAL' };
  }

  // ==========================================
  // FEATURE 5: L3 Proxy Mitigation & Spatial Delta
  // ==========================================
  calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  verifyAttendanceLocation(scanPayload, classroomTarget) {
    const { studentId, lat, lon, bssid, timestamp, clientIp } = scanPayload;
    const distanceMeters = this.calculateHaversineDistance(lat, lon, classroomTarget.lat, classroomTarget.lon);

    if (classroomTarget.bssid && bssid !== classroomTarget.bssid) {
      return { allowed: false, reason: 'BSSID_MISMATCH', distanceMeters };
    }
    if (distanceMeters > (classroomTarget.maxRadiusMeters || 50)) {
      return { allowed: false, reason: 'OUT_OF_GEOFENCE', distanceMeters };
    }

    // Velocity check if student had previous scan
    const prevScan = this.attendanceRecords.get(studentId);
    if (prevScan) {
      const deltaMs = timestamp - prevScan.timestamp;
      if (deltaMs > 0) {
        const deltaMeters = this.calculateHaversineDistance(prevScan.lat, prevScan.lon, lat, lon);
        const velocityKmH = (deltaMeters / (deltaMs / 1000)) * 3.6;
        if (velocityKmH > 100) { // faster than 100 km/h indicates spatial teleportation / proxy
          return { allowed: false, reason: 'SPATIAL_VELOCITY_CLAMP_VIOLATION', velocityKmH };
        }
      }
    }

    this.attendanceRecords.set(studentId, { lat, lon, bssid, timestamp, clientIp });
    return { allowed: true, distanceMeters };
  }

  // ==========================================
  // FEATURE 6: L4 Dynamic TOTP QR Rotation
  // ==========================================
  generateTotpQr(secretKey, timestamp = Date.now(), windowSeconds = 15) {
    const timeStep = Math.floor(timestamp / (windowSeconds * 1000));
    const hmac = hmacSha256(secretKey, String(timeStep));
    const code = (parseInt(hmac.substring(0, 8), 16) % 1000000).toString().padStart(6, '0');
    return {
      token: code,
      timeStep,
      expiresAt: (timeStep + 1) * windowSeconds * 1000
    };
  }

  verifyTotpQr(secretKey, token, timestamp = Date.now(), windowSeconds = 15) {
    const currentTimeStep = Math.floor(timestamp / (windowSeconds * 1000));
    // Accept current window or -1 drift window
    for (let offset = -1; offset <= 1; offset++) {
      const step = currentTimeStep + offset;
      const hmac = hmacSha256(secretKey, String(step));
      const code = (parseInt(hmac.substring(0, 8), 16) % 1000000).toString().padStart(6, '0');
      if (code === token) {
        return { valid: true, timeStep: step };
      }
    }
    return { valid: false, reason: 'TOTP_EXPIRED_OR_INVALID' };
  }

  // ==========================================
  // FEATURE 7: L5 Soft-Delete Invariants
  // ==========================================
  softDeleteRecord(collection, id, deletedBy) {
    const item = collection.get(id);
    if (!item) return false;
    item.isDeleted = true;
    item.deletedAt = Date.now();
    item.deletedBy = deletedBy;
    return true;
  }

  queryActiveRecords(collection) {
    const results = [];
    for (const [id, record] of collection.entries()) {
      if (!record.isDeleted && record.deletedAt == null) {
        results.push(record);
      }
    }
    return results;
  }

  // ==========================================
  // FEATURE 8: L6 AES-256-GCM Envelope Encryption
  // ==========================================
  encryptAesGcm(plaintext, keyBuffer = crypto.randomBytes(32)) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return {
      ciphertext,
      iv: iv.toString('hex'),
      authTag,
      keyHex: keyBuffer.toString('hex')
    };
  }

  decryptAesGcm(ciphertextHex, ivHex, authTagHex, keyHex) {
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(keyHex, 'hex'), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // ==========================================
  // FEATURE 9: L7 RFC 4180 CSV Formula Neutralization
  // ==========================================
  sanitizeCsvCell(input) {
    if (input == null) return '';
    const str = String(input);
    const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r', '|', '%'];
    if (str.length > 0 && dangerousPrefixes.includes(str.charAt(0))) {
      return `'${str}`;
    }
    return str;
  }

  // ==========================================
  // FEATURE 10: L8 Two-Man Rule Grade Revision Chaining
  // ==========================================
  appendGradeRevision(studentId, subjectId, oldMarks, newMarks, facultyApprover, hodApprover) {
    const chainKey = `${studentId}_${subjectId}`;
    const prevRevisions = this.gradeRevisionChains.get(chainKey) || [];
    const prevHash = prevRevisions.length > 0
      ? prevRevisions[prevRevisions.length - 1].hash
      : '0000000000000000000000000000000000000000000000000000000000000000';

    if (!facultyApprover || !hodApprover) {
      throw new Error('TWO_MAN_RULE_VIOLATION: Both faculty and HOD approvals required');
    }

    const timestamp = Date.now();
    const dataToHash = `${prevHash}|${studentId}|${subjectId}|${oldMarks}|${newMarks}|${facultyApprover}|${hodApprover}|${timestamp}`;
    const hash = sha256(dataToHash);

    const revisionNode = {
      prevHash,
      studentId,
      subjectId,
      oldMarks,
      newMarks,
      facultyApprover,
      hodApprover,
      timestamp,
      hash
    };

    prevRevisions.push(revisionNode);
    this.gradeRevisionChains.set(chainKey, prevRevisions);
    return revisionNode;
  }

  verifyGradeChain(studentId, subjectId) {
    const chainKey = `${studentId}_${subjectId}`;
    const chain = this.gradeRevisionChains.get(chainKey) || [];
    let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
    for (const node of chain) {
      if (node.prevHash !== prevHash) return false;
      const expectedData = `${node.prevHash}|${node.studentId}|${node.subjectId}|${node.oldMarks}|${node.newMarks}|${node.facultyApprover}|${node.hodApprover}|${node.timestamp}`;
      if (sha256(expectedData) !== node.hash) return false;
      prevHash = node.hash;
    }
    return true;
  }

  // ==========================================
  // FEATURE 11: Authentication & User Management
  // ==========================================
  authenticateUser(username, password) {
    if (!username || !password) {
      throw new Error('INVALID_CREDENTIALS');
    }
    const user = this.users.get(username);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    const hash = sha256(password + user.salt);
    if (hash !== user.passwordHash) {
      throw new Error('INVALID_PASSWORD');
    }
    const token = this.issueToken({ sub: user.id, role: user.role, prn: user.prn, dept: user.dept });
    return { token, user: { id: user.id, username: user.username, role: user.role } };
  }

  registerUser(userDto) {
    if (this.users.has(userDto.username)) {
      throw new Error('USERNAME_ALREADY_EXISTS');
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = sha256(userDto.password + salt);
    const user = {
      id: crypto.randomUUID(),
      username: userDto.username,
      passwordHash,
      salt,
      role: userDto.role || 'STUDENT',
      dept: userDto.dept || 'IT',
      prn: userDto.prn || `PRN_${Math.floor(Math.random() * 90000 + 10000)}`,
      createdAt: Date.now()
    };
    this.users.set(userDto.username, user);
    return user;
  }

  // ==========================================
  // FEATURE 12: MU Ordinance 6086 Attendance Engine
  // ==========================================
  calculateAttendanceOrdinance6086(attended, conducted, options = {}) {
    if (conducted <= 0) {
      if (options.policy === 'MU_RULES' || options.semesterStart) {
        return 100.00;
      }
      return 0.00;
    }
    if (attended < 0) attended = 0;
    if (attended > conducted) attended = conducted;
    // Two-decimal strict truncation per Ordinance 6086
    const percentage = Math.floor((attended / conducted) * 10000) / 100;
    return Number(percentage.toFixed(2));
  }

  calculateAttendanceSemesterStart(attended = 0, conducted = 0) {
    return this.calculateAttendanceOrdinance6086(attended, conducted, { semesterStart: true });
  }

  // ==========================================
  // FEATURE 13: Continuous 3-Tier Defaulter Pipeline
  // ==========================================
  evaluateDefaulterTier(attendancePct, dayCheckpoint, medicalLeavePct = 0) {
    let effectivePct = attendancePct;
    // 15% medical grace cap: raw attendance must be >= 60.00% to qualify
    if (attendancePct >= 60.00 && medicalLeavePct > 0) {
      const allowedMedical = Math.min(medicalLeavePct, 15.00);
      effectivePct = Math.min(100.00, Number((attendancePct + allowedMedical).toFixed(2)));
    }

    const isDefaulter = effectivePct < 75.00;
    let tier = null;
    let actions = [];

    if (isDefaulter) {
      if (dayCheckpoint >= 90) {
        tier = 'D3';
        actions = ['DETENTION_HEARING', 'LOCK_EXAM_HALL_TICKET', 'REQUIRE_HOD_UNDERTAKING'];
      } else if (dayCheckpoint >= 60) {
        tier = 'D2';
        actions = ['COLLEGIATE_WARNING', 'DISPATCH_PARENT_INTIMATION'];
      } else if (dayCheckpoint >= 30) {
        tier = 'D1';
        actions = ['STUDENT_IN_APP_WARNING', 'MENTOR_DASHBOARD_FLAG'];
      }
    }

    return {
      attendancePct,
      effectivePct,
      isDefaulter,
      tier,
      actions
    };
  }

  // ==========================================
  // FEATURE 14: Mumbai University 25-Mark TW Formula
  // ==========================================
  calculateTermWork(attendancePct, practicalMarksArray, vivaMark) {
    // Attendance marks (0-5)
    let attendanceMark = 0;
    if (attendancePct >= 90.00) attendanceMark = 5;
    else if (attendancePct >= 85.00) attendanceMark = 4;
    else if (attendancePct >= 80.00) attendanceMark = 3;
    else if (attendancePct >= 75.00) attendanceMark = 2;
    else attendanceMark = 0; // Defaulter receives 0 attendance marks

    // Lab experiments marks (0-15)
    // Scale: each practical is out of 10 marks
    let labMark = 0;
    if (practicalMarksArray && practicalMarksArray.length > 0) {
      const totalScored = practicalMarksArray.reduce((acc, m) => acc + Math.min(10, Math.max(0, m)), 0);
      const maxPossible = practicalMarksArray.length * 10;
      labMark = Math.round(((totalScored / maxPossible) * 15) * 100) / 100;
    }

    // Viva mark (0-5)
    const validViva = Math.min(5, Math.max(0, vivaMark || 0));

    const totalTW = Math.min(25, Number((attendanceMark + labMark + validViva).toFixed(2)));
    return {
      attendanceMark,
      labMark,
      vivaMark: validViva,
      totalTW
    };
  }

  // ==========================================
  // FEATURE 15: Lecture Substitution Engine
  // ==========================================
  findEligibleSubstitutes(slot, availableFacultyList) {
    return availableFacultyList.filter(fac => {
      const isSameDept = fac.dept === slot.dept;
      const isQualified = fac.competencies && fac.competencies.includes(slot.subject);
      const hasNoConflict = !fac.busySlotIds || !fac.busySlotIds.includes(slot.id);
      return isSameDept && isQualified && hasNoConflict;
    });
  }

  requestSwap(slotId, requestingFacultyId, substituteFacultyId) {
    const swapId = crypto.randomUUID();
    const swap = {
      id: swapId,
      slotId,
      requestingFacultyId,
      substituteFacultyId,
      status: 'PENDING_SUBSTITUTE_ACCEPTANCE',
      createdAt: Date.now()
    };
    this.facultySwaps.set(swapId, swap);
    return swap;
  }

  approveSwapByHod(swapId, hodId) {
    const swap = this.facultySwaps.get(swapId);
    if (!swap) throw new Error('SWAP_NOT_FOUND');
    if (swap.status !== 'ACCEPTED_BY_SUBSTITUTE') {
      throw new Error('SWAP_CANNOT_BE_APPROVED: Must be accepted by substitute first');
    }
    swap.status = 'APPROVED_BY_HOD';
    swap.hodId = hodId;
    swap.approvedAt = Date.now();
    return { swap, triggerCachePurge: true };
  }

  // ==========================================
  // FEATURE 16: NAAC/NBA CO-PO Direct Attainment
  // ==========================================
  calculateCoAttainment(coQuestionScores, thresholdPct = 60.00) {
    // scores: array of { studentId, score, maxScore }
    if (!coQuestionScores || coQuestionScores.length === 0) return { attainmentLevel: 0, percentageMeetingThreshold: 0 };
    let meetingCount = 0;
    for (const item of coQuestionScores) {
      const pct = (item.score / item.maxScore) * 100;
      if (pct >= thresholdPct) meetingCount++;
    }
    const percentageMeeting = (meetingCount / coQuestionScores.length) * 100;
    let attainmentLevel = 0;
    if (percentageMeeting >= 70.00) attainmentLevel = 3;
    else if (percentageMeeting >= 60.00) attainmentLevel = 2;
    else if (percentageMeeting >= 50.00) attainmentLevel = 1;
    else attainmentLevel = 0;

    return {
      attainmentLevel,
      percentageMeetingThreshold: Number(percentageMeeting.toFixed(2)),
      totalStudents: coQuestionScores.length,
      meetingCount
    };
  }

  // ==========================================
  // FEATURE 17: Asynchronous 8-Node DAG No-Dues Engine
  // ==========================================
  initiateNoDuesWorkflow(studentId) {
    const nodes = [
      'LIBRARY', 'LAB_103', 'ACCOUNTS', 'EXAM_CELL',
      'TRAINING_PLACEMENT', 'SPORTS', 'HOD', 'PRINCIPAL'
    ];
    // Directed edges: [from, to]
    const edges = [
      ['ACCOUNTS', 'HOD'],
      ['LIBRARY', 'HOD'],
      ['LAB_103', 'HOD'],
      ['SPORTS', 'HOD'],
      ['TRAINING_PLACEMENT', 'HOD'],
      ['HOD', 'EXAM_CELL'],
      ['EXAM_CELL', 'PRINCIPAL']
    ];

    const nodeStatus = {};
    for (const n of nodes) {
      // Root nodes have in-degree 0: ACCOUNTS, LIBRARY, LAB_103, SPORTS, TRAINING_PLACEMENT
      const hasIncoming = edges.some(e => e[1] === n);
      nodeStatus[n] = hasIncoming ? 'LOCKED' : 'PENDING';
    }

    const workflow = {
      id: crypto.randomUUID(),
      studentId,
      nodes,
      edges,
      nodeStatus,
      hallTicketIssued: false,
      createdAt: Date.now()
    };

    this.noDuesWorkflows.set(studentId, workflow);
    return workflow;
  }

  clearNoDuesNode(studentId, nodeName) {
    const workflow = this.noDuesWorkflows.get(studentId);
    if (!workflow) throw new Error('WORKFLOW_NOT_FOUND');
    if (workflow.nodeStatus[nodeName] !== 'PENDING') {
      throw new Error(`NODE_NOT_PENDING: Status is ${workflow.nodeStatus[nodeName]}`);
    }

    workflow.nodeStatus[nodeName] = 'CLEARED';

    // Check newly unblocked downstream nodes
    for (const n of workflow.nodes) {
      if (workflow.nodeStatus[n] === 'LOCKED') {
        const incomingEdges = workflow.edges.filter(e => e[1] === n);
        const allCleared = incomingEdges.every(e => workflow.nodeStatus[e[0]] === 'CLEARED');
        if (allCleared) {
          workflow.nodeStatus[n] = 'PENDING';
        }
      }
    }

    // Terminal node check
    if (workflow.nodeStatus['PRINCIPAL'] === 'CLEARED') {
      workflow.hallTicketIssued = true;
      workflow.hallTicketSignature = sha256(`HALL_TICKET_${studentId}_${Date.now()}`);
    }

    return workflow;
  }

  detectDagCycle(nodes, edges) {
    const inDegree = {};
    const adj = {};
    nodes.forEach(n => { inDegree[n] = 0; adj[n] = []; });
    edges.forEach(([u, v]) => {
      inDegree[v] = (inDegree[v] || 0) + 1;
      adj[u].push(v);
    });

    const queue = nodes.filter(n => inDegree[n] === 0);
    let count = 0;
    while (queue.length > 0) {
      const u = queue.shift();
      count++;
      for (const v of adj[u]) {
        inDegree[v]--;
        if (inDegree[v] === 0) queue.push(v);
      }
    }
    return count < nodes.length; // True if cycle exists
  }

  // ==========================================
  // FEATURE 18: Gale-Shapley Guide Allocation
  // ==========================================
  runGaleShapleyMatching(groups, guides) {
    // groups: [{ id, preferences: [guideId], cgpa, rigor, domainMatch }]
    // guides: [{ id, capacity }]
    const guideRankings = {};
    for (const guide of guides) {
      const scoredGroups = groups.map(g => {
        const score = 0.40 * (g.cgpa || 7.0) + 0.35 * (g.rigor || 5.0) + 0.25 * (g.domainMatch || 5.0);
        return { groupId: g.id, score, hash: sha256(g.id) };
      });
      // Sort desc by score; tie-break deterministically with sha256 hash
      scoredGroups.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.hash < b.hash ? -1 : 1;
      });
      guideRankings[guide.id] = scoredGroups.map(sg => sg.groupId);
    }

    const unassignedGroups = [...groups.map(g => g.id)];
    const groupPrefs = {};
    groups.forEach(g => { groupPrefs[g.id] = [...g.preferences]; });
    const guideMatches = {};
    guides.forEach(g => { guideMatches[g.id] = []; });

    while (unassignedGroups.length > 0) {
      const groupId = unassignedGroups.shift();
      const prefs = groupPrefs[groupId];
      if (!prefs || prefs.length === 0) continue; // Unmatched if no remaining preferences

      const preferredGuideId = prefs.shift();
      const guide = guides.find(g => g.id === preferredGuideId);
      if (!guide) continue;

      const currentMatches = guideMatches[preferredGuideId];
      currentMatches.push(groupId);

      if (currentMatches.length > guide.capacity) {
        // Guide rejects their least preferred group
        const guideRanking = guideRankings[preferredGuideId];
        currentMatches.sort((a, b) => guideRanking.indexOf(a) - guideRanking.indexOf(b));
        const rejectedGroupId = currentMatches.pop();
        unassignedGroups.push(rejectedGroupId);
      }
    }

    return guideMatches;
  }

  // ==========================================
  // FEATURE 19: Chaumian Blind Signature Feedback
  // ==========================================
  blindMessage(messageHashBigInt, blindingFactorBigInt) {
    const { e, N } = this.rsa;
    const rPowE = modPow(blindingFactorBigInt, e, N);
    return (messageHashBigInt * rPowE) % N;
  }

  signBlindedToken(blindedTokenBigInt) {
    const { d, N } = this.rsa;
    return modPow(blindedTokenBigInt, d, N);
  }

  unblindSignature(blindedSignatureBigInt, blindingFactorBigInt) {
    const { N } = this.rsa;
    const rInv = modInverse(blindingFactorBigInt, N);
    return (blindedSignatureBigInt * rInv) % N;
  }

  verifyBlindSignature(messageHashBigInt, unblindedSignatureBigInt) {
    const { e, N } = this.rsa;
    const recoveredHash = modPow(unblindedSignatureBigInt, e, N);
    return recoveredHash === (messageHashBigInt % N);
  }

  submitAnonymousFeedback(tokenUuid, messageHashBigInt, signatureBigInt, facultyId, rating, comment) {
    if (this.spentFeedbackTokens.has(tokenUuid)) {
      throw new Error('DOUBLE_SPEND_DETECTED: Token already used');
    }
    const isValid = this.verifyBlindSignature(messageHashBigInt, signatureBigInt);
    if (!isValid) {
      throw new Error('INVALID_BLIND_SIGNATURE');
    }
    this.spentFeedbackTokens.add(tokenUuid);
    const feedbackRecord = {
      id: crypto.randomUUID(),
      facultyId,
      rating,
      comment,
      submittedAt: Date.now()
    };
    this.registeredFeedback.push(feedbackRecord);
    return feedbackRecord;
  }

  // ==========================================
  // FEATURE 20: Dynamic Test Vector Parameterization
  // ==========================================
  encodeWatermark(prn) {
    const safePrn = prn !== undefined && prn !== null ? String(prn) : 'PRN_DEFAULT';
    const ZW_NO_BREAK = '\uFEFF';
    const ZW_SPACE = '\u200B';
    const ZW_NON_JOINER = '\u200C';
    const ZW_JOINER = '\u200D';
    let res = ZW_NO_BREAK + ZW_SPACE + ZW_NON_JOINER + ZW_JOINER;
    const buf = Buffer.from(safePrn, 'utf8');
    for (const b of buf) {
      for (let i = 7; i >= 0; i--) {
        const bit = (b >> i) & 1;
        res += (bit === 0 ? ZW_SPACE : ZW_NON_JOINER);
      }
    }
    res += ZW_JOINER;
    return res;
  }

  decodeWatermark(watermarkedText) {
    if (!watermarkedText) return '';
    const ZW_NO_BREAK = '\uFEFF';
    const ZW_SPACE = '\u200B';
    const ZW_NON_JOINER = '\u200C';
    const ZW_JOINER = '\u200D';
    let startIdx = watermarkedText.indexOf(ZW_NO_BREAK);
    if (startIdx === -1) startIdx = watermarkedText.indexOf(ZW_SPACE);
    if (startIdx === -1) return '';

    let cursor = startIdx;
    if (cursor < watermarkedText.length && watermarkedText.charAt(cursor) === ZW_NO_BREAK) cursor++;
    if (cursor + 2 < watermarkedText.length &&
        watermarkedText.charAt(cursor) === ZW_SPACE &&
        watermarkedText.charAt(cursor + 1) === ZW_NON_JOINER &&
        watermarkedText.charAt(cursor + 2) === ZW_JOINER) {
      cursor += 3;
    }
    let bits = '';
    for (let i = cursor; i < watermarkedText.length; i++) {
      const c = watermarkedText.charAt(i);
      if (c === ZW_SPACE) bits += '0';
      else if (c === ZW_NON_JOINER) bits += '1';
      else if (c === ZW_JOINER) break;
    }
    if (bits.length < 8 || bits.length % 8 !== 0) return '';
    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      let val = 0;
      for (let j = 0; j < 8; j++) {
        if (bits.charAt(i + j) === '1') val |= (1 << (7 - j));
      }
      bytes.push(val);
    }
    return Buffer.from(bytes).toString('utf8');
  }

  verifyWatermark(problemStatement, expectedPrn) {
    if (!problemStatement || !expectedPrn) return false;
    const decoded = this.decodeWatermark(problemStatement);
    return expectedPrn === decoded;
  }

  generateParameterizedVector(rollNo, prn) {
    const digits = String(rollNo).replace(/\D/g, '');
    const rollInt = digits.length > 0 ? parseInt(digits, 10) : 0;
    const arraySizeN = (rollInt % 50) + 50; // Range: 50 to 99
    const prnHash = parseInt(sha256(String(prn)).substring(0, 8), 16);
    const seedS = prnHash % 10000;

    // Steganographic zero-width watermark embedding
    const watermark = this.encodeWatermark(String(prn));
    const problemStatement = `Sort dynamic array of size ${arraySizeN} initialized with linear congruential seed ${seedS}.${watermark}`;

    return {
      arraySizeN,
      seedS,
      problemStatement,
      watermarkEmbedded: problemStatement.includes('\u200B')
    };
  }

  // ==========================================
  // FEATURE 21: Monaco Typing Dynamics Clamping
  // ==========================================
  evaluateTypingDynamics(deltaChars, deltaMs) {
    const absChars = Math.abs(deltaChars);
    const ms = deltaMs <= 0 ? 1 : deltaMs;
    const velocity = (deltaChars === 0 && deltaMs === 0) ? 0.0 : absChars / ms;
    const burstWindow = deltaMs < 100 && absChars > 50;
    const velocityExcess = absChars > 50 && velocity > 0.5;

    if (burstWindow || velocityExcess) {
      return {
        violation: true,
        type: 'BURST_INJECTION_DETECTED',
        velocity
      };
    }
    return {
      violation: false,
      type: 'NORMAL_TYPING',
      velocity
    };
  }

  // ==========================================
  // FEATURE 22: AI Viva Voce Evaluation Engine
  // ==========================================
  evaluateVivaTranscript(transcript, rubric) {
    // Rubric: { techDepth: 0-10, problemSolving: 0-10, communication: 0-10, codeUnderstanding: 0-10 }
    const tech = Math.min(10, Math.max(0, rubric.techDepth || 0));
    const ps = Math.min(10, Math.max(0, rubric.problemSolving || 0));
    const comm = Math.min(10, Math.max(0, rubric.communication || 0));
    const code = Math.min(10, Math.max(0, rubric.codeUnderstanding || 0));

    const compositeScore10 = (tech * 0.40) + (ps * 0.30) + (code * 0.20) + (comm * 0.10);
    // Scaled to 0-5 for Mumbai University Viva component
    const marksViva5 = Number(((compositeScore10 / 10) * 5).toFixed(2));

    return {
      scores: { tech, ps, comm, code },
      compositeScore10: Number(compositeScore10.toFixed(2)),
      marksViva5,
      attainmentLevel: compositeScore10 >= 7.0 ? 3 : compositeScore10 >= 6.0 ? 2 : compositeScore10 >= 5.0 ? 1 : 0
    };
  }

  // ==========================================
  // FEATURE 23: Lab Practical & Assignment Management
  // ==========================================
  createPractical(title, subject, maxMarks = 10) {
    const id = crypto.randomUUID();
    const practical = { id, title, subject, maxMarks, status: 'PUBLISHED', createdAt: Date.now() };
    return practical;
  }

  // ==========================================
  // FEATURE 24: Faculty SubmissionListModal Backend
  // ==========================================
  synthesizeBatchRoster(enrolledStudents, actualSubmissions) {
    // Virtual missing record synthesis for students who haven't submitted yet
    const submissionMap = new Map();
    actualSubmissions.forEach(sub => submissionMap.set(sub.studentId, sub));

    return enrolledStudents.map(student => {
      if (submissionMap.has(student.id)) {
        return { ...submissionMap.get(student.id), isVirtualMissing: false };
      }
      return {
        id: `virtual_${student.id}`,
        studentId: student.id,
        studentName: student.name,
        rollNo: student.rollNo,
        status: 'UNSUBMITTED',
        submittedAt: null,
        marks: null,
        isVirtualMissing: true
      };
    });
  }

  // ==========================================
  // FEATURE 25: Bulk Grading & Redo Request Dispatch
  // ==========================================
  bulkGradeSubmissions(gradeArray) {
    return gradeArray.map(item => {
      const marks = Math.min(10, Math.max(0, Number(item.marks)));
      return {
        submissionId: item.submissionId,
        marks,
        feedback: item.feedback || '',
        status: 'GRADED'
      };
    });
  }

  dispatchRedoRequest(submissionId, redoReason) {
    return {
      submissionId,
      redoRequested: true,
      reason: redoReason,
      emailDispatched: true,
      dispatchedAt: Date.now()
    };
  }

  // ==========================================
  // FEATURES 26-33: Frontend State & UI Models
  // ==========================================
  validateThreeSceneConfig(config) {
    return {
      orbitalCameraActive: config.cameraMode === 'ORBITAL',
      shaderUniformsValid: config.shaderTimeUniform !== undefined,
      deskWorkbenchLoaded: config.deskLoaded === true
    };
  }

  simulateCrdtWalPersistence(keystrokeDiff, fullSnapshot) {
    const walEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      diff: keystrokeDiff,
      fullSnapshot,
      synced: true
    };
    return walEntry;
  }

  simulateCrdtWalDecoupledLifecycle(options = {}) {
    // Simulates CrdtWalManager decoupled IndexedDB and localStorage mirror
    const { idbFails = false, storageFails = false, record } = options;
    const walRecord = {
      ...record,
      timestamp: Date.now(),
      checksum: sha256(record?.content || '')
    };

    let idbCommitted = false;
    let storageCommitted = false;

    // 1. IndexedDB attempt (isolated try/catch)
    try {
      if (idbFails) {
        throw new Error('QuotaExceededError: IndexedDB disk quota exhausted');
      }
      idbCommitted = true;
    } catch (err) {
      // Caught cleanly without halting execution
    }

    // 2. LocalStorage mirror attempt (isolated try/catch)
    try {
      if (storageFails) {
        throw new Error('StorageQuotaError: localStorage full');
      }
      storageCommitted = true;
    } catch (err) {
      // Caught cleanly
    }

    // Simulate recovery
    let recoveredRecord = null;
    let recoverySource = null;

    if (!idbFails && idbCommitted) {
      recoveredRecord = walRecord;
      recoverySource = 'INDEXED_DB';
    } else if (!storageFails && storageCommitted) {
      recoveredRecord = walRecord;
      recoverySource = 'LOCAL_STORAGE_MIRROR';
    }

    return {
      walRecord,
      idbCommitted,
      storageCommitted,
      recoveredRecord,
      recoverySource,
      survivedIdbCrash: idbFails && storageCommitted && recoveredRecord !== null
    };
  }

  simulateThreeSceneDisposal(sceneObjects = []) {
    // Simulates recursive scene.traverse disposal on unmount
    let disposedGeometries = 0;
    let disposedMaterials = 0;
    let disposedTextures = 0;
    let listenersDetached = 0;

    sceneObjects.forEach((obj) => {
      if (obj.geometry && typeof obj.geometry.dispose === 'function') {
        obj.geometry.dispose();
        disposedGeometries++;
      }
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => {
            if (typeof m.dispose === 'function') {
              m.dispose();
              disposedMaterials++;
            }
          });
        } else if (typeof obj.material.dispose === 'function') {
          obj.material.dispose();
          disposedMaterials++;
        }
      }
      if (obj.texture && typeof obj.texture.dispose === 'function') {
        obj.texture.dispose();
        disposedTextures++;
      }
      if (obj.listeners && Array.isArray(obj.listeners)) {
        listenersDetached += obj.listeners.length;
      }
    });

    return {
      disposedGeometries,
      disposedMaterials,
      disposedTextures,
      listenersDetached,
      sceneCleared: true,
      vramFreed: true
    };
  }

  // ==========================================
  // FEATURE 36: Exam Standing & ATKT Progression
  // ==========================================
  validateExamEligibility({ studentRollNo, targetSemester, backlogs = [] }) {
    let sem1Kts = 0;
    let sem2Kts = 0;
    let sem3Kts = 0;
    let sem4Kts = 0;
    const blocking = [];

    backlogs.forEach((b) => {
      if (b.semester === 1) { sem1Kts++; blocking.push(`Sem 1: ${b.subjectCode}`); }
      else if (b.semester === 2) { sem2Kts++; blocking.push(`Sem 2: ${b.subjectCode}`); }
      else if (b.semester === 3) { sem3Kts++; blocking.push(`Sem 3: ${b.subjectCode}`); }
      else if (b.semester === 4) { sem4Kts++; blocking.push(`Sem 4: ${b.subjectCode}`); }
    });

    let eligible = true;
    let admissionStatus = 'PROMOTED';
    let denialReason = null;

    if (targetSemester === 3) {
      if ((sem1Kts + sem2Kts) > 5) {
        eligible = false;
        admissionStatus = 'YEAR_DOWN_DROP';
        denialReason = `Exceeded max 5 allowable backlogs for SE entry (Active: ${sem1Kts + sem2Kts})`;
      } else if ((sem1Kts + sem2Kts) > 0) {
        admissionStatus = 'PROVISIONALLY_PROMOTED';
      }
    } else if (targetSemester === 5) {
      if ((sem1Kts + sem2Kts) > 0) {
        eligible = false;
        admissionStatus = 'YEAR_DOWN_DROP';
        denialReason = `MU Ordinance: Sem 1 & Sem 2 must be 100% cleared for Sem 5 entry. Active: ${sem1Kts + sem2Kts}`;
      }
    } else if (targetSemester === 7) {
      if ((sem1Kts + sem2Kts + sem3Kts + sem4Kts) > 0) {
        eligible = false;
        admissionStatus = 'YEAR_DOWN_DROP';
        denialReason = `MU Ordinance: Sem 1-4 must be 100% cleared for Sem 7 entry. Active: ${sem1Kts + sem2Kts + sem3Kts + sem4Kts}`;
      }
    }

    return {
      studentRollNo,
      targetSemester,
      eligible,
      admissionStatus,
      denialReason,
      sem1Backlogs: sem1Kts,
      sem2Backlogs: sem2Kts,
      totalDeadKts: backlogs.length,
      blockingSubjects: blocking
    };
  }

  // ==========================================
  // FEATURE 37: Reval Fee & Hall Ticket Auto-Reconciler
  // ==========================================
  reconcileRevalMarks({ studentRollNo, subjectCode, originalMarks, revisedMarks, passingThreshold = 32, ktExamFeePaid = 1050, ktHallTicketId }) {
    const passed = revisedMarks >= passingThreshold;
    const outcome = passed ? 'CLEARED_PASSED' : (revisedMarks > originalMarks ? 'MARKS_IMPROVED_STILL_FAILED' : 'UNCHANGED_FAILED');
    const ktTicketRevoked = passed && !!ktHallTicketId;
    const feeRefundCredit = passed ? ktExamFeePaid : 0;
    const transcriptSha256 = sha256(`${studentRollNo}|${subjectCode}|${revisedMarks}|${outcome}`);

    return {
      studentRollNo,
      subjectCode,
      outcome,
      ktTicketRevoked,
      feeRefundCredit,
      transcriptUpdated: passed,
      transcriptIntegritySha256: transcriptSha256,
      auditMessage: passed ? 'Reval passed. KT hall ticket revoked and fee credited.' : 'Reval failed to meet threshold.'
    };
  }

  // ==========================================
  // FEATURE 38: Mumbai University Ordinance 0.5045 NSS Grace Marks
  // ==========================================
  allocateNssGraceMarks({ studentRollNo, completedNssHours = 0, specialCampAttended = false, sportsGraceAlreadyClaimed = false, failingSubjects = {} }) {
    if (completedNssHours < 120) {
      return {
        studentRollNo,
        eligible: false,
        ineligibilityReason: 'Incomplete NSS hours. Minimum 120 hours required.',
        totalGraceMarksGranted: 0
      };
    }
    if (!specialCampAttended) {
      return {
        studentRollNo,
        eligible: false,
        ineligibilityReason: '7-day residential camp mandatory.',
        totalGraceMarksGranted: 0
      };
    }
    if (sportsGraceAlreadyClaimed) {
      return {
        studentRollNo,
        eligible: false,
        ineligibilityReason: 'Dual grace claim prohibited.',
        totalGraceMarksGranted: 0
      };
    }

    const sortedEntries = Object.entries(failingSubjects).sort((a, b) => {
      const defA = a[1].passingMarks - a[1].currentMarks;
      const defB = b[1].passingMarks - b[1].currentMarks;
      return defA - defB;
    });

    let availableGrace = 10;
    let totalGranted = 0;
    const allocated = {};
    const finalMarks = {};
    let allCleared = true;

    sortedEntries.forEach(([code, def]) => {
      const gap = Math.max(0, def.passingMarks - def.currentMarks);
      if (gap <= availableGrace && gap > 0) {
        allocated[code] = gap;
        finalMarks[code] = def.currentMarks + gap;
        availableGrace -= gap;
        totalGranted += gap;
      } else if (gap > availableGrace) {
        allocated[code] = 0;
        finalMarks[code] = def.currentMarks;
        allCleared = false;
      } else {
        allocated[code] = 0;
        finalMarks[code] = def.currentMarks;
      }
    });

    return {
      studentRollNo,
      eligible: true,
      totalGraceMarksGranted: totalGranted,
      allocatedGraceBySubject: allocated,
      finalSubjectMarks: finalMarks,
      allClearedWithGrace: allCleared,
      ordinanceCitation: 'MU Ordinance 0.5045'
    };
  }

  // ==========================================
  // FEATURE 39: Cryptographic Fee Receipt QR Seal & Verification
  // ==========================================
  generateReceiptQr({ receiptNumber, studentRollNo, amount, feeHead, utrNumber, paymentGateway = 'HDFC_SMART_HUB' }) {
    const rawData = `${receiptNumber}|${studentRollNo}|${amount}|${feeHead}|${utrNumber}|${paymentGateway}`;
    const secret = 'PVPPCOE_FINANCE_DIGITAL_SEAL_SECRET_KEY_2026_ENTERPRISE';
    const signature = hmacSha256(rawData, secret);
    const qrPayload = Buffer.from(`${rawData}|${signature}`).toString('base64url');

    return {
      receiptNumber,
      studentRollNo,
      amount,
      feeHead,
      utrNumber,
      hmacSignature: signature,
      qrEncryptedPayload: qrPayload,
      valid: true,
      timestamp: Date.now()
    };
  }

  verifyReceiptPayload(qrPayload) {
    if (!qrPayload) return false;
    try {
      const decoded = Buffer.from(qrPayload, 'base64url').toString('utf8');
      const lastPipe = decoded.lastIndexOf('|');
      if (lastPipe === -1) return false;
      const data = decoded.substring(0, lastPipe);
      const expected = decoded.substring(lastPipe + 1);
      const secret = 'PVPPCOE_FINANCE_DIGITAL_SEAL_SECRET_KEY_2026_ENTERPRISE';
      const actual = hmacSha256(data, secret);
      return actual === expected;
    } catch {
      return false;
    }
  }

  // ==========================================
  // FEATURE 40: TPO Dream Policy & Discipline Gate
  // ==========================================
  evaluateTpoEligibility({ studentRollNo, currentOfferLpa = 0, drivePackageLpa = 0, unexcusedDriveAbsences = 0, activeDeadKts = 0 }) {
    if (activeDeadKts > 0) {
      return {
        studentRollNo,
        eligible: false,
        statusCategory: 'BLOCKED_KT_POLICY',
        reason: `Ineligible: ${activeDeadKts} active backlogs.`
      };
    }
    if (unexcusedDriveAbsences >= 2) {
      return {
        studentRollNo,
        eligible: false,
        statusCategory: 'BLOCKED_ABSENTEE_DISCIPLINE',
        reason: 'Debarred: 2 or more unexcused absences.',
        suspensionDaysRemaining: 365
      };
    }
    if (unexcusedDriveAbsences === 1) {
      return {
        studentRollNo,
        eligible: false,
        statusCategory: 'BLOCKED_ABSENTEE_DISCIPLINE',
        reason: 'Suspended: 15-day cooldown in effect.',
        suspensionDaysRemaining: 15
      };
    }
    if (currentOfferLpa > 0) {
      const minRequired = currentOfferLpa * 1.5;
      const isDream = drivePackageLpa >= 8.5;
      const meetsMultiplier = drivePackageLpa >= minRequired;
      if (!isDream && !meetsMultiplier) {
        return {
          studentRollNo,
          eligible: false,
          statusCategory: 'BLOCKED_PACKAGE_THRESHOLD',
          reason: `Requires min 1.5x (${minRequired} LPA) or Dream tier (8.5 LPA).`
        };
      }
      return {
        studentRollNo,
        eligible: true,
        statusCategory: 'ELIGIBLE_DREAM',
        reason: 'Approved under Dream Offer policy.'
      };
    }
    return {
      studentRollNo,
      eligible: true,
      statusCategory: 'ELIGIBLE_OPEN',
      reason: 'Open candidate eligible for drive.'
    };
  }

  // ==========================================
  // FEATURE 41: Anti-Plagiarism AST Fingerprint & Injection Defense
  // ==========================================
  analyzePlagiarismAst({ submissionId, studentRollNo, sourceCode = '', peerSubmissions = [] }) {
    const injectionPatterns = [
      /ignore\s+previous\s+instructions/i,
      /\[SYSTEM\s*:\s*/i,
      /award\s+(full|25)\s+marks/i,
      /override\s+(grading|rubric|evaluation)/i
    ];

    let promptInjectionDetected = false;
    let detectedMaliciousPattern = null;

    for (const p of injectionPatterns) {
      const match = sourceCode.match(p);
      if (match) {
        promptInjectionDetected = true;
        detectedMaliciousPattern = match[0];
        break;
      }
    }

    const tokenize = (code) => {
      const cleaned = code.replace(/\/\/.*|\/\*[\s\S]*?\*\/|#.*/g, ' ')
        .replace(/"[^"]*"|'[^']*'/g, ' STR ')
        .replace(/\b\d+\b/g, ' NUM ');
      const keywords = new Set(['if','else','for','while','return','class','public','private','void','int','float','new','def','function']);
      const tokens = cleaned.split(/[\s+;,.(){}\[\]=><!&|%*\-/]+/).filter(Boolean);
      return tokens.map(t => keywords.has(t.toLowerCase()) ? t.toLowerCase() : 'VAR');
    };

    const queryTokens = tokenize(sourceCode);
    const queryGrams = new Set();
    for (let i = 0; i <= queryTokens.length - 4; i++) {
      queryGrams.add(queryTokens.slice(i, i + 4).join('_'));
    }

    let highestSimilarity = 0;
    let highestPeer = null;

    peerSubmissions.forEach((peer) => {
      if (peer.peerRollNo === studentRollNo) return;
      const peerTokens = tokenize(peer.sourceCode || '');
      const peerGrams = new Set();
      for (let i = 0; i <= peerTokens.length - 4; i++) {
        peerGrams.add(peerTokens.slice(i, i + 4).join('_'));
      }

      let intersection = 0;
      queryGrams.forEach((g) => { if (peerGrams.has(g)) intersection++; });
      const union = queryGrams.size + peerGrams.size - intersection;
      const sim = union === 0 ? 0 : (intersection / union);
      if (sim > highestSimilarity) {
        highestSimilarity = sim;
        highestPeer = peer.peerRollNo;
      }
    });

    const highestPercent = Math.round(highestSimilarity * 1000) / 10;
    return {
      submissionId,
      highestSimilarityPercent: highestPercent,
      highestMatchPeerRollNo: highestPeer,
      crossBatchCollusion: highestPercent > 70.0,
      promptInjectionDetected,
      detectedMaliciousPattern,
      astNormalizedFingerprint: sha256([...queryGrams].sort().join(','))
    };
  }

  // ==========================================
  // FEATURE 42: AICTE/UGC Grievance SGRC SLA Escalation
  // ==========================================
  fileGrievanceSgrc({ studentRollNo, category, title, encryptedStatement = '', anonymousWhistleblower = false }) {
    const ticketId = `GRV-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
    const masked = anonymousWhistleblower && studentRollNo.length >= 6
      ? studentRollNo.substring(0, 4) + '******' + studentRollNo.substring(studentRollNo.length - 2)
      : studentRollNo;

    return {
      grievanceTicketId: ticketId,
      studentMaskedRollNo: masked,
      currentEscalationLevel: 'LEVEL_1_MENTOR',
      slaDeadline: Date.now() + (72 * 3600 * 1000),
      slaBreached: false,
      status: 'LOGGED',
      assignedOfficerRole: 'FACULTY_MENTOR',
      encryptedLockerHash: sha256(encryptedStatement || ticketId)
    };
  }

  evaluateGrievanceSla(ticket, currentTime = Date.now()) {
    if (currentTime < ticket.slaDeadline) return ticket;
    let nextLevel = ticket.currentEscalationLevel;
    let nextRole = ticket.assignedOfficerRole;
    let nextDeadline = ticket.slaDeadline;

    if (ticket.currentEscalationLevel === 'LEVEL_1_MENTOR') {
      nextLevel = 'LEVEL_2_HOD';
      nextRole = 'HEAD_OF_DEPARTMENT';
      nextDeadline = currentTime + (120 * 3600 * 1000);
    } else if (ticket.currentEscalationLevel === 'LEVEL_2_HOD') {
      nextLevel = 'LEVEL_3_PRINCIPAL_OMBUDSMAN';
      nextRole = 'CAMPUS_OMBUDSMAN';
      nextDeadline = currentTime + (168 * 3600 * 1000);
    }

    return {
      ...ticket,
      currentEscalationLevel: nextLevel,
      slaDeadline: nextDeadline,
      slaBreached: true,
      status: 'ESCALATED_DUE_TO_SLA',
      assignedOfficerRole: nextRole
    };
  }
}

module.exports = {
  ContractSimulator,
  sha256,
  hmacSha256,
  modPow,
  modInverse
};
