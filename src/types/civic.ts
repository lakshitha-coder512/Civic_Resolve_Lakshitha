export type IssueCategory =
  | 'Roads & Potholes'
  | 'Water & Drainage'
  | 'Street Lighting'
  | 'Waste & Sanitation'
  | 'Traffic & Signals'
  | 'Parks & Public Spaces';

export type IssuePriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type IssueStatus = 'Pending' | 'In Progress' | 'Resolved';

export type PageRoute = 'home' | 'report' | 'track' | 'dashboard' | 'login';

export interface TimelineEvent {
  step: string;
  timestamp: string;
  note: string;
  actor: string;
  completed: boolean;
}

export interface AIActionPlan {
  crewUnit: string;
  equipmentChecklist: string[];
  fieldInstructions: string[];
  safetyProtocol: string;
  estimatedCrewHours: string;
  citizenUpdateMessage: string;
  generatedAt: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  location: string;
  ward: string;
  category: IssueCategory;
  priority: IssuePriority;
  department: string;
  status: IssueStatus;
  reportedBy: string;
  reportedAt: string;
  estimatedResolution: string;
  aiReasoning: string;
  photoDataUrl?: string;
  actionPlan?: AIActionPlan;
  timeline: TimelineEvent[];
}

export interface AITriageResult {
  category: IssueCategory;
  priority: IssuePriority;
  department: string;
  estimatedResolution: string;
  reasoning: string;
}

export interface UserSession {
  name: string;
  email: string;
  role: 'Citizen' | 'Municipal Official';
  department?: string;
}

export const CATEGORIES: IssueCategory[] = [
  'Roads & Potholes',
  'Water & Drainage',
  'Street Lighting',
  'Waste & Sanitation',
  'Traffic & Signals',
  'Parks & Public Spaces',
];

export const PRIORITIES: IssuePriority[] = ['Critical', 'High', 'Medium', 'Low'];

export const WARDS = [
  'Ward 1',
  'Ward 2',
  'Ward 3',
  'Ward 4',
  'Ward 5',
  'Ward 6',
  'Ward 7',
  'Ward 8',
] as const;

export const WARD_DISTRICTS: Record<string, string> = {
  'Ward 1': 'Civic Plaza & Downtown',
  'Ward 2': 'Harbor & Waterfront',
  'Ward 3': 'Elmwood Residential',
  'Ward 4': 'Oakridge Corridor',
  'Ward 5': 'Midtown & Market St',
  'Ward 6': 'North Meadow',
  'Ward 7': 'Cedar Park Transit',
  'Ward 8': 'Eastside Industrial',
};

export const DEPARTMENT_BY_CATEGORY: Record<IssueCategory, string> = {
  'Roads & Potholes': 'Department of Transportation & Roadways',
  'Water & Drainage': 'Municipal Water & Sewerage Board',
  'Street Lighting': 'Electrical & Street Lighting Division',
  'Waste & Sanitation': 'Solid Waste Management Authority',
  'Traffic & Signals': 'Traffic Engineering Bureau',
  'Parks & Public Spaces': 'Parks & Urban Forestry',
};
