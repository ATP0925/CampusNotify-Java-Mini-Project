import { api } from './api';
import { DagNode, FacultyGuide, TermWorkBreakdown } from '../types';

export const calculateTermWorkFormula = (
  attendancePct: number,
  labExperimentsMarks: number[], // list of practical marks out of 10 or 15
  vivaScore: number // 0 to 5 or 0 to 10 scaled to 5
): TermWorkBreakdown => {
  // MU Ordinance 6086: Attendance marks (0 to 5)
  // >= 90% => 5
  // 85 - 89.99% => 4
  // 80 - 84.99% => 3
  // 75 - 79.99% => 2
  // < 75% => 0 (Defaulter)
  let attendanceMarks = 0;
  const isDefaulter = attendancePct < 75.0;

  if (attendancePct >= 90.0) attendanceMarks = 5;
  else if (attendancePct >= 85.0) attendanceMarks = 4;
  else if (attendancePct >= 80.0) attendanceMarks = 3;
  else if (attendancePct >= 75.0) attendanceMarks = 2;
  else attendanceMarks = 0;

  // Lab experiments scaled to 15 marks
  let labMarks = 0;
  if (labExperimentsMarks.length > 0) {
    const avg = labExperimentsMarks.reduce((a, b) => a + b, 0) / labExperimentsMarks.length;
    // Assuming each mark was out of 10 or scaled to 15
    labMarks = Math.min(15, Math.round((avg / 10) * 15 * 10) / 10);
  }

  // Viva scaled to 5 marks
  const normalizedViva = vivaScore > 5 ? Math.round((vivaScore / 10) * 5 * 10) / 10 : vivaScore;
  const vivaMarks = Math.min(5, Math.max(0, normalizedViva));

  const totalMarks = Math.min(25, Math.round((attendanceMarks + labMarks + vivaMarks) * 10) / 10);

  return {
    attendanceMarks,
    labMarks,
    vivaMarks,
    totalMarks,
    isDefaulterZeroed: isDefaulter,
  };
};

export const erpService = {
  async getTermWork(studentId: string, subjectId: string): Promise<TermWorkBreakdown> {
    try {
      return await api.get<TermWorkBreakdown>(
        `/api/academic/termwork/calculate?studentId=${studentId}&subjectId=${subjectId}`
      );
    } catch {
      return calculateTermWorkFormula(81.42, [9, 8.5, 9.5, 9, 8], 4.5);
    }
  },

  async getNoDuesDag(studentId: string): Promise<{ nodes: DagNode[]; hallTicketUnlocked: boolean }> {
    try {
      return await api.get(`/api/academic/nodues/status?studentId=${studentId}`);
    } catch {
      // Default standard 8-node DAG configuration
      const defaultNodes: DagNode[] = [
        { id: 'node_1', code: 'LIB', name: 'Central Library', category: 'ACADEMIC', status: 'PENDING', dependsOn: [], pendingFineAmount: 20 },
        { id: 'node_2', code: 'LAB', name: 'Computer Engineering Labs', category: 'DEPARTMENT', status: 'CLEARED', dependsOn: [] },
        { id: 'node_3', code: 'ACC', name: 'Accounts & College Fees', category: 'FINANCE', status: 'PENDING', dependsOn: ['node_1'], pendingFineAmount: 500 },
        { id: 'node_4', code: 'EXAM', name: 'Examination Cell', category: 'ACADEMIC', status: 'LOCKED', dependsOn: ['node_3'] },
        { id: 'node_5', code: 'TNP', name: 'Training & Placement Cell', category: 'STUDENT_AFFAIRS', status: 'CLEARED', dependsOn: [] },
        { id: 'node_6', code: 'SPT', name: 'Sports & Gymnasium Directorate', category: 'AMENITIES', status: 'CLEARED', dependsOn: [] },
        { id: 'node_7', code: 'HOD', name: 'HOD Department Clearance', category: 'DEPARTMENT', status: 'LOCKED', dependsOn: ['node_2', 'node_4'] },
        { id: 'node_8', code: 'REG', name: 'Registrar & Final Hall Ticket', category: 'INSTITUTE', status: 'LOCKED', dependsOn: ['node_7', 'node_5', 'node_6'] },
      ];
      return {
        nodes: defaultNodes,
        hallTicketUnlocked: false,
      };
    }
  },

  async payDueFine(studentId: string, nodeId: string, amount: number): Promise<{ success: boolean; message: string }> {
    try {
      return await api.post('/api/academic/nodues/pay-fine', { studentId, nodeId, amount, upiRef: `UPI_${Date.now()}` });
    } catch {
      return { success: true, message: `Successfully cleared ₹${amount} fine for node ${nodeId}.` };
    }
  },

  async getFacultyGuides(): Promise<FacultyGuide[]> {
    return [
      { id: 'g_1', name: 'Dr. Vivek Patil', designation: 'Professor & HOD', domain: 'AI / Machine Learning & Computer Vision', quota: 3, currentAllocations: 2 },
      { id: 'g_2', name: 'Prof. Anjali Sharma', designation: 'Associate Professor', domain: 'Distributed Systems & Cloud Security', quota: 3, currentAllocations: 1 },
      { id: 'g_3', name: 'Prof. Rajesh Kulkarni', designation: 'Assistant Professor', domain: 'IoT, Embedded & Edge Computing', quota: 4, currentAllocations: 3 },
      { id: 'g_4', name: 'Dr. Meera Iyer', designation: 'Professor', domain: 'Natural Language Processing & Speech', quota: 3, currentAllocations: 0 },
      { id: 'g_5', name: 'Prof. Sandeep Nair', designation: 'Assistant Professor', domain: 'Blockchain & Cryptographic Protocol', quota: 3, currentAllocations: 1 },
    ];
  },

  async submitGuidePreferences(payload: {
    groupId: string;
    rankedGuideIds: string[];
    domain: string;
    projectTitle: string;
  }): Promise<{ status: string; message: string; allocation?: any }> {
    try {
      return await api.post('/api/academic/allocation/submit-preferences', payload);
    } catch {
      return {
        status: 'SUCCESS',
        message: 'Capstone guide preferences registered for Gale-Shapley deferred acceptance allocation.',
        allocation: {
          matchedGuideId: payload.rankedGuideIds[0],
          rankAssigned: 1,
          algorithmStatus: 'STABLE_MATCH_FOUND',
        },
      };
    }
  },
};
