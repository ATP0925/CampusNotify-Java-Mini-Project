import { create } from 'zustand';

export interface CampusBuildingNode {
  id: string;
  name: string;
  department: string;
  beaconColor: string;
  position: [number, number, number];
  size: [number, number, number];
  activeSessions: number;
  unreadNotices: number;
  description: string;
}

interface ThreeState {
  viewMode: 'CAMPUS' | 'LAB_DESK';
  activeDepartment: string | null;
  activeBuildingId: string | null;
  isOrbitEnabled: boolean;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  isDayMode: boolean;
  lampLit: boolean;
  buildings: CampusBuildingNode[];
  selectedBuilding: CampusBuildingNode | null;

  setViewMode: (mode: 'CAMPUS' | 'LAB_DESK') => void;
  focusBuilding: (buildingId: string) => void;
  clearSelectedBuilding: () => void;
  toggleDayNight: () => void;
  toggleLamp: () => void;
}

const DEFAULT_BUILDINGS: CampusBuildingNode[] = [
  {
    id: 'b_it',
    name: 'IT Department & Labs (103, 203)',
    department: 'Information Technology',
    beaconColor: '#3b82f6',
    position: [-18, 5, -12],
    size: [14, 10, 16],
    activeSessions: 3,
    unreadNotices: 4,
    description: 'Advanced Cloud & Web Labs, Network Security Sandbox, IoT Edge Cluster',
  },
  {
    id: 'b_comp',
    name: 'Computer Engineering & AI/DS Hub',
    department: 'Computer Engineering',
    beaconColor: '#06b6d4',
    position: [16, 6, -14],
    size: [16, 12, 18],
    activeSessions: 4,
    unreadNotices: 2,
    description: 'High-Performance GPU AI Racks, Deep Learning & Systems Research',
  },
  {
    id: 'b_exam',
    name: 'Examination Cell & COE Tower',
    department: 'Examination Cell',
    beaconColor: '#f43f5e',
    position: [0, 8, -26],
    size: [12, 16, 12],
    activeSessions: 1,
    unreadNotices: 5,
    description: 'Controller of Examinations, University Question Bank Vault, Paper Assessment',
  },
  {
    id: 'b_lib',
    name: 'Central Library & Digital Archives',
    department: 'Library',
    beaconColor: '#10b981',
    position: [-20, 4, 14],
    size: [18, 8, 14],
    activeSessions: 0,
    unreadNotices: 1,
    description: 'IEEE Xplore Terminals, 50,000+ Volumes, Quiet Study Amphitheatre',
  },
  {
    id: 'b_admin',
    name: "Dean's Office & Academic Directorate",
    department: 'Administration',
    beaconColor: '#8b5cf6',
    position: [18, 5, 14],
    size: [14, 10, 14],
    activeSessions: 2,
    unreadNotices: 3,
    description: 'Registrar, Academic Council, Grievance Cell, Faculty Directorate',
  },
  {
    id: 'b_audi',
    name: 'Auditorium & Cultural Innovation Hub',
    department: 'Student Affairs',
    beaconColor: '#ec4899',
    position: [0, 5, 24],
    size: [24, 10, 16],
    activeSessions: 1,
    unreadNotices: 2,
    description: '800-Seater Acoustic Auditorium, Tech Symposium & Hackathon Arena',
  },
];

export const useThreeStore = create<ThreeState>((set, get) => ({
  viewMode: 'CAMPUS',
  activeDepartment: null,
  activeBuildingId: null,
  isOrbitEnabled: true,
  cameraPosition: [0, 45, 60],
  cameraTarget: [0, 0, 0],
  isDayMode: false,
  lampLit: true,
  buildings: DEFAULT_BUILDINGS,
  selectedBuilding: null,

  setViewMode: (mode) => {
    if (mode === 'LAB_DESK') {
      set({
        viewMode: 'LAB_DESK',
        cameraPosition: [0, 1.2, 1.8],
        cameraTarget: [0, 1.0, 0],
      });
    } else {
      set({
        viewMode: 'CAMPUS',
        cameraPosition: [0, 45, 60],
        cameraTarget: [0, 0, 0],
      });
    }
  },

  focusBuilding: (buildingId) => {
    const building = get().buildings.find((b) => b.id === buildingId);
    if (building) {
      set({
        activeBuildingId: buildingId,
        activeDepartment: building.department,
        selectedBuilding: building,
        cameraTarget: [building.position[0], 2, building.position[2]],
      });
    }
  },

  clearSelectedBuilding: () => {
    set({
      activeBuildingId: null,
      activeDepartment: null,
      selectedBuilding: null,
      cameraTarget: [0, 0, 0],
    });
  },

  toggleDayNight: () => {
    set((state) => ({ isDayMode: !state.isDayMode }));
  },

  toggleLamp: () => {
    set((state) => ({ lampLit: !state.lampLit }));
  },
}));
