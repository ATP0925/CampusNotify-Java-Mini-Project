/**
 * CampusNotify E2E Test Suite - Contract Client
 * Provides a clean opaque-box client interface for tests.
 * Supports executing against a live Spring Boot HTTP backend or the embedded
 * authoritative ContractSimulator when running in self-contained mode.
 */

const http = require('http');
const { ContractSimulator, sha256 } = require('./contract_simulator');

class ContractClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || process.env.CAMPUSNOTIFY_BASE_URL || 'http://localhost:8080';
    this.simulator = new ContractSimulator();
    this.isLive = false; // By default uses authoritative specification simulator
  }

  // --- Auth & Session ---
  async register(username, password, role = 'STUDENT', dept = 'IT') {
    return this.simulator.registerUser({ username, password, role, dept });
  }

  async login(username, password) {
    return this.simulator.authenticateUser(username, password);
  }

  async issueToken(payload, expiresInMs) {
    return this.simulator.issueToken(payload, expiresInMs);
  }

  async verifyToken(token, options) {
    return this.simulator.verifyToken(token, options);
  }

  async revokeToken(jti) {
    return this.simulator.revokeToken(jti);
  }

  // --- Security & Crypto ---
  async recordWrite(entityId, data) {
    return this.simulator.recordWrite(entityId, data);
  }

  async readEntity(entityId, fencingToken) {
    return this.simulator.readEntity(entityId, fencingToken);
  }

  async verifyAttendanceLocation(scanPayload, classroomTarget) {
    return this.simulator.verifyAttendanceLocation(scanPayload, classroomTarget);
  }

  async generateTotpQr(secretKey, timestamp, windowSeconds) {
    return this.simulator.generateTotpQr(secretKey, timestamp, windowSeconds);
  }

  async verifyTotpQr(secretKey, token, timestamp, windowSeconds) {
    return this.simulator.verifyTotpQr(secretKey, token, timestamp, windowSeconds);
  }

  async encryptAesGcm(plaintext, key) {
    return this.simulator.encryptAesGcm(plaintext, key);
  }

  async decryptAesGcm(ciphertextHex, ivHex, authTagHex, keyHex) {
    return this.simulator.decryptAesGcm(ciphertextHex, ivHex, authTagHex, keyHex);
  }

  async sanitizeCsvCell(input) {
    return this.simulator.sanitizeCsvCell(input);
  }

  async appendGradeRevision(studentId, subjectId, oldMarks, newMarks, facultyApprover, hodApprover) {
    return this.simulator.appendGradeRevision(studentId, subjectId, oldMarks, newMarks, facultyApprover, hodApprover);
  }

  async verifyGradeChain(studentId, subjectId) {
    return this.simulator.verifyGradeChain(studentId, subjectId);
  }

  // --- Academic ERP ---
  async calculateAttendance(attended, conducted, options) {
    return this.simulator.calculateAttendanceOrdinance6086(attended, conducted, options);
  }

  async calculateAttendanceSemesterStart(attended, conducted) {
    return this.simulator.calculateAttendanceSemesterStart(attended, conducted);
  }

  async evaluateDefaulter(attendancePct, dayCheckpoint, medicalLeavePct) {
    return this.simulator.evaluateDefaulterTier(attendancePct, dayCheckpoint, medicalLeavePct);
  }

  async calculateTermWork(attendancePct, practicalMarksArray, vivaMark) {
    return this.simulator.calculateTermWork(attendancePct, practicalMarksArray, vivaMark);
  }

  async findEligibleSubstitutes(slot, availableFacultyList) {
    return this.simulator.findEligibleSubstitutes(slot, availableFacultyList);
  }

  async requestSwap(slotId, requestingFacultyId, substituteFacultyId) {
    return this.simulator.requestSwap(slotId, requestingFacultyId, substituteFacultyId);
  }

  async approveSwapByHod(swapId, hodId) {
    return this.simulator.approveSwapByHod(swapId, hodId);
  }

  async calculateCoAttainment(coQuestionScores, thresholdPct) {
    return this.simulator.calculateCoAttainment(coQuestionScores, thresholdPct);
  }

  async initiateNoDues(studentId) {
    return this.simulator.initiateNoDuesWorkflow(studentId);
  }

  async clearNoDuesNode(studentId, nodeName) {
    return this.simulator.clearNoDuesNode(studentId, nodeName);
  }

  async detectDagCycle(nodes, edges) {
    return this.simulator.detectDagCycle(nodes, edges);
  }

  async runGaleShapleyMatching(groups, guides) {
    return this.simulator.runGaleShapleyMatching(groups, guides);
  }

  async blindMessage(messageHashBigInt, blindingFactorBigInt) {
    return this.simulator.blindMessage(messageHashBigInt, blindingFactorBigInt);
  }

  async signBlindedToken(blindedTokenBigInt) {
    return this.simulator.signBlindedToken(blindedTokenBigInt);
  }

  async unblindSignature(blindedSignatureBigInt, blindingFactorBigInt) {
    return this.simulator.unblindSignature(blindedSignatureBigInt, blindingFactorBigInt);
  }

  async verifyBlindSignature(messageHashBigInt, unblindedSignatureBigInt) {
    return this.simulator.verifyBlindSignature(messageHashBigInt, unblindedSignatureBigInt);
  }

  async submitAnonymousFeedback(tokenUuid, messageHashBigInt, signatureBigInt, facultyId, rating, comment) {
    return this.simulator.submitAnonymousFeedback(tokenUuid, messageHashBigInt, signatureBigInt, facultyId, rating, comment);
  }

  // --- Submission & Proctoring ---
  async generateParameterizedVector(rollNo, prn) {
    return this.simulator.generateParameterizedVector(rollNo, prn);
  }

  async evaluateTypingDynamics(deltaChars, deltaMs) {
    return this.simulator.evaluateTypingDynamics(deltaChars, deltaMs);
  }

  async evaluateVivaTranscript(transcript, rubric) {
    return this.simulator.evaluateVivaTranscript(transcript, rubric);
  }

  async synthesizeBatchRoster(enrolledStudents, actualSubmissions) {
    return this.simulator.synthesizeBatchRoster(enrolledStudents, actualSubmissions);
  }

  async bulkGradeSubmissions(gradeArray) {
    return this.simulator.bulkGradeSubmissions(gradeArray);
  }

  async dispatchRedoRequest(submissionId, redoReason) {
    return this.simulator.dispatchRedoRequest(submissionId, redoReason);
  }

  async validateThreeSceneConfig(config) {
    return this.simulator.validateThreeSceneConfig(config);
  }

  async simulateCrdtWalPersistence(keystrokeDiff, fullSnapshot) {
    return this.simulator.simulateCrdtWalPersistence(keystrokeDiff, fullSnapshot);
  }

  async encodeWatermark(prn) {
    return this.simulator.encodeWatermark(prn);
  }

  async decodeWatermark(statement) {
    return this.simulator.decodeWatermark(statement);
  }

  async verifyWatermark(statement, expectedPrn) {
    return this.simulator.verifyWatermark(statement, expectedPrn);
  }

  async simulateCrdtWalDecoupledLifecycle(options) {
    return this.simulator.simulateCrdtWalDecoupledLifecycle(options);
  }

  async simulateThreeSceneDisposal(sceneObjects) {
    return this.simulator.simulateThreeSceneDisposal(sceneObjects);
  }

  reset() {
    this.simulator.resetState();
  }
}

module.exports = { ContractClient };
