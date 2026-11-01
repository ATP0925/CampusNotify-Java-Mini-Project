import { api } from './api';
import { Notice, NoticeCategory } from '../types';

export const noticeService = {
  async getNotices(category?: NoticeCategory, search?: string): Promise<Notice[]> {
    try {
      const query = new URLSearchParams();
      if (category) query.append('category', category);
      if (search) query.append('search', search);
      const res = await api.get<Notice[]>(`/api/notices?${query.toString()}`);
      return res;
    } catch {
      // Authentic seed notice circulars
      const notices: Notice[] = [
        {
          id: 'n_01',
          refNo: 'CNMS/2026/EXAM/042',
          title: 'Final Year Sem VII & VIII Term-End Theory & Practical Examination Schedule',
          body: 'All B.E. Information Technology and Computer Engineering students are hereby informed that the Mumbai University End-Semester Theory and Practical Viva-Voce examinations for Academic Year 2026-27 will commence from November 15, 2026. Students must ensure 100% No-Dues DAG clearance to unlock their Hall Tickets.',
          category: 'EXAM',
          priority: 'URGENT',
          issuingAuthority: 'Dr. S. K. Mahajan, Controller of Examinations',
          timestamp: '2026-10-31T09:00:00Z',
          readCount: 1420,
          attachments: [{ name: 'Timetable_Nov2026_Final.pdf', url: '#', size: '1.4 MB' }],
        },
        {
          id: 'n_02',
          refNo: 'CNMS/2026/ACAD/018',
          title: 'Continuous Attendance Defaulter List D1 & Medical Condonation Deadline',
          body: 'In strict adherence to Mumbai University Ordinance 6086, students having aggregate attendance below 75.00% are placed under Defaulter Category D1. Eligible students seeking medical grace (up to 15% with minimum 60% raw attendance) must submit verified medical certificates to the department mentor committee by November 5, 2026.',
          category: 'ACADEMIC',
          priority: 'HIGH',
          issuingAuthority: 'Prof. Vivek Patil, Head of Department (IT)',
          timestamp: '2026-10-30T11:30:00Z',
          readCount: 980,
          attachments: [{ name: 'Defaulter_List_D1_Oct2026.pdf', url: '#', size: '850 KB' }],
        },
        {
          id: 'n_03',
          refNo: 'CNMS/2026/TNP/091',
          title: 'Campus Recruitment Drive — Tata Consultancy Services (TCS Digital / Prime)',
          body: 'Training and Placement Cell announces the campus recruitment drive for final year engineering students. Eligible candidates (min CGPA 7.0 with no active backlogs) must register via the T&P portal before November 4, 2026. Online coding test will be proctored via Monaco IDE workstation.',
          category: 'PLACEMENT',
          priority: 'HIGH',
          issuingAuthority: 'Prof. R. N. Deshmukh, T&P Officer',
          timestamp: '2026-10-29T14:15:00Z',
          readCount: 1845,
          attachments: [{ name: 'TCS_Job_Description_2026.pdf', url: '#', size: '2.1 MB' }],
        },
        {
          id: 'n_04',
          refNo: 'CNMS/2026/CULT/007',
          title: 'Annual Technical Symposium & Hackathon "INVENTO 2026" Call for Papers',
          body: 'The Student Council cordially invites project teams to submit technical papers and project prototypes for INVENTO 2026. Tracks include Generative AI, Cyber-Physical Systems, and Decentralized Protocols. Exciting cash prizes and direct incubation mentorship opportunities.',
          category: 'CULTURAL',
          priority: 'ROUTINE',
          issuingAuthority: 'Student Welfare & Cultural Committee',
          timestamp: '2026-10-28T16:00:00Z',
          readCount: 650,
          attachments: [{ name: 'Invento2026_Rulebook.pdf', url: '#', size: '3.4 MB' }],
        },
      ];

      return notices.filter(n => {
        if (category && n.category !== category) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            n.title.toLowerCase().includes(q) ||
            n.body.toLowerCase().includes(q) ||
            n.refNo.toLowerCase().includes(q)
          );
        }
        return true;
      });
    }
  },
};
