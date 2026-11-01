// ==========================================
// Shared TypeScript Types for CampusNotify ERP
// ==========================================

export type Role = 'STUDENT' | 'FACULTY' | 'HOD' | 'MENTOR' | 'EXAM_CELL' | 'ADMIN' | 'ANONYMOUS';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  prn?: string;
  rollNo?: string;
  batch?: string;
  semester?: number;
}

// --- Attendance & Defaulter ---
export type DefaulterTier = 'SAFE' | 'D1_WARNING' | 'D2_PARENT_ALERT' | 'D3_DEBARRED';

export interface SubjectAttendance {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  conducted: number;
  attended: number;
  percentage: number; // 2-decimal precision (e.g. 74.68)
  defaulterTier: DefaulterTier;
}

export interface AttendanceSummary {
  overallPercentage: number;
  defaulterTier: DefaulterTier;
  totalConducted: number;
  totalAttended: number;
  subjects: SubjectAttendance[];
  medicalGraceEligible: boolean;
  medicalGracePercentage?: number;
  projectedPercentageWithGrace?: number;
}

// --- Term Work (MU 25-Mark Formula) ---
export interface TermWorkBreakdown {
  attendanceMarks: number; // 0 to 5
  labMarks: number;        // 0 to 15
  vivaMarks: number;       // 0 to 5
  totalMarks: number;      // 0 to 25
  isDefaulterZeroed: boolean;
}

// --- No-Dues DAG Engine ---
export type DagNodeStatus = 'CLEARED' | 'PENDING' | 'BLOCKED' | 'LOCKED';

export interface DagNode {
  id: string;
  code: string;
  name: string;
  category: string;
  status: DagNodeStatus;
  dependsOn: string[];
  pendingFineAmount?: number;
  clearedAt?: string;
  remarks?: string;
}

// --- Gale-Shapley Guide Allocation ---
export interface FacultyGuide {
  id: string;
  name: string;
  designation: string;
  domain: string;
  quota: number;
  currentAllocations: number;
}

export interface CapstonePreferenceSubmission {
  groupId: string;
  groupLeaderPrn: string;
  groupMembers: string[];
  projectTitle: string;
  domain: string;
  rankedGuideIds: string[];
}

// --- AI Viva Voce ---
export type VivaExaminerState = 'IDLE' | 'SPEAKING' | 'LISTENING' | 'EVALUATING';

export interface VivaQuestion {
  id: string;
  index: number;
  text: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  expectedConcepts: string[];
  codeReferenceSnippet?: string;
}

export interface VivaRubricScores {
  technicalDepth: number;     // 0-10
  problemSolving: number;     // 0-10
  communication: number;      // 0-10
  codeUnderstanding: number;  // 0-10
  overallScore: number;       // 0-10
  normalizedVivaMark: number; // 0-5 for MU TW
  feedbackSummary: string;
}

// --- Monaco & Proctoring ---
export type ViolationType = 'FOCUS_LOST' | 'WINDOW_BLUR' | 'BURST_INJECTION' | 'DEVTOOLS_OPENED' | 'CLIPBOARD_PASTE';

export interface ViolationLog {
  id: string;
  type: ViolationType;
  timestamp: string;
  durationMs?: number;
  details?: string;
}

export interface CrdtWalRecord {
  practicalId: string;
  studentId: string;
  content: string;
  language: string;
  cursor: { lineNumber: number; column: number };
  timestamp: number;
  checksum: string;
}

export interface ParameterizedSpec {
  n: number;
  seed: number;
  rollNo: string;
  steganographicWatermark: string;
}

// --- Faculty Submissions ---
export type SubmissionStatus = 'NOT_SUBMITTED' | 'SUBMITTED' | 'EVALUATED' | 'REDO_REQUESTED';

export interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  rollNo?: string;
  prn?: string;
  status: SubmissionStatus;
  isVirtualMissing: boolean;
  submittedAt?: string;
  isLate?: boolean;
  marks?: number;
  feedback?: string;
  codeSnippet?: string;
  language?: string;
  violationsCount?: number;
  aiVivaScore?: number;
}

// --- Notices ---
export type NoticeCategory = 'ACADEMIC' | 'EXAM' | 'PLACEMENT' | 'CULTURAL' | 'ADMIN';
export type NoticePriority = 'URGENT' | 'HIGH' | 'ROUTINE';

export interface Notice {
  id: string;
  refNo: string;
  title: string;
  body: string;
  category: NoticeCategory;
  priority: NoticePriority;
  issuingAuthority: string;
  timestamp: string;
  attachments?: { name: string; url: string; size: string }[];
  readCount?: number;
}
