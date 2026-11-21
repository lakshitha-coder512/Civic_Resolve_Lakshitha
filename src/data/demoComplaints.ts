import { Complaint } from '../types/civic';

export const COMPLAINTS_STORAGE_KEY = 'civicresolve_complaints_v1';
export const USER_STORAGE_KEY = 'civicresolve_user_v1';

export const DEMO_COMPLAINTS: Complaint[] = [
  {
    id: 'CR-2026-1041',
    title: 'Collapsed Storm Drain Grate on Oakridge Avenue',
    description:
      'A heavy cast-iron storm drain cover has caved in near the pedestrian curb at Oakridge Ave & 12th St, creating a deep open hazard and localized street pooling during evening showers.',
    location: 'Oakridge Ave & 12th St',
    ward: 'Ward 4',
    category: 'Water & Drainage',
    priority: 'Critical',
    department: 'Municipal Water & Sewerage Board',
    status: 'In Progress',
    reportedBy: 'Elena Rostova',
    reportedAt: '2026-11-19 08:42',
    estimatedResolution: '12–24 hours',
    aiReasoning:
      'Open structural drainage collapse poses an immediate pedestrian and vehicle hazard with active stormwater obstruction.',
    timeline: [
      {
        step: 'Report Submitted',
        timestamp: '2026-11-19 08:42',
        note: 'Logged via CivicResolve citizen portal with intersection coordinates.',
        actor: 'Elena Rostova',
        completed: true,
      },
      {
        step: 'AI Triaged & Routed',
        timestamp: '2026-11-19 08:42',
        note: 'Classified as Critical Water & Drainage issue; routed to Municipal Water & Sewerage Board.',
        actor: 'CivicResolve AI',
        completed: true,
      },
      {
        step: 'Crew Assigned',
        timestamp: '2026-11-19 11:15',
        note: 'Safety cones deployed and Structural Unit #14 dispatched for steel grate replacement.',
        actor: 'Dispatch Officer K. Patel',
        completed: true,
      },
      {
        step: 'Resolved & Verified',
        timestamp: 'Pending inspection',
        note: 'Awaiting post-installation flow and load verification.',
        actor: 'Municipal Water & Sewerage Board',
        completed: false,
      },
    ],
  },
  {
    id: 'CR-2026-1042',
    title: 'Deep Pothole Cluster Blocking Right Lane',
    description:
      'Three consecutive potholes spanning nearly two meters along Harbor Boulevard northbound are forcing commuter buses to swerve into adjacent lanes.',
    location: 'Harbor Boulevard, Mile 3 Northbound',
    ward: 'Ward 2',
    category: 'Roads & Potholes',
    priority: 'High',
    department: 'Department of Transportation & Roadways',
    status: 'Resolved',
    reportedBy: 'Marcus Vance',
    reportedAt: '2026-11-15 14:20',
    estimatedResolution: '24–48 hours',
    aiReasoning:
      'Multi-pothole arterial lane obstruction creates high-speed swerve risk for transit and commuter traffic.',
    timeline: [
      {
        step: 'Report Submitted',
        timestamp: '2026-11-15 14:20',
        note: 'Citizen submitted location details and lane impact assessment.',
        actor: 'Marcus Vance',
        completed: true,
      },
      {
        step: 'AI Triaged & Routed',
        timestamp: '2026-11-15 14:20',
        note: 'Assigned High priority and routed to Department of Transportation & Roadways.',
        actor: 'CivicResolve AI',
        completed: true,
      },
      {
        step: 'Crew Assigned',
        timestamp: '2026-11-16 07:30',
        note: 'Asphalt patching Crew B scheduled for overnight lane resurfacing.',
        actor: 'Roadways Ops Lead',
        completed: true,
      },
      {
        step: 'Resolved & Verified',
        timestamp: '2026-11-17 06:10',
        note: 'Hot-mix asphalt infill compacted and lane reopened to normal transit flow.',
        actor: 'Department of Transportation & Roadways',
        completed: true,
      },
    ],
  },
  {
    id: 'CR-2026-1043',
    title: 'Streetlight Outage Along Cedar Park Metro Crossing',
    description:
      'Four consecutive LED streetlamps outside Cedar Park Metro Station East Exit have been completely dark since Tuesday, leaving the crosswalk poorly lit after 5:30 PM.',
    location: 'Cedar Park Metro Station, East Crosswalk',
    ward: 'Ward 7',
    category: 'Street Lighting',
    priority: 'High',
    department: 'Electrical & Street Lighting Division',
    status: 'Pending',
    reportedBy: 'Priya Nair',
    reportedAt: '2026-11-20 18:55',
    estimatedResolution: '24–48 hours',
    aiReasoning:
      'Multi-fixture outage directly over a high-footfall transit crosswalk significantly elevates evening pedestrian risk.',
    timeline: [
      {
        step: 'Report Submitted',
        timestamp: '2026-11-20 18:55',
        note: 'Reported dark crosswalk corridor near transit exit.',
        actor: 'Priya Nair',
        completed: true,
      },
      {
        step: 'AI Triaged & Routed',
        timestamp: '2026-11-20 18:55',
        note: 'Flagged High priority Street Lighting outage; queued for Electrical & Street Lighting Division.',
        actor: 'CivicResolve AI',
        completed: true,
      },
      {
        step: 'Crew Assigned',
        timestamp: 'Awaiting dispatch',
        note: 'Queued in Ward 7 electrical bucket-truck schedule.',
        actor: 'Electrical & Street Lighting Division',
        completed: false,
      },
      {
        step: 'Resolved & Verified',
        timestamp: 'Pending',
        note: 'Awaiting circuit relay and fixture restoration.',
        actor: 'Electrical & Street Lighting Division',
        completed: false,
      },
    ],
  },
  {
    id: 'CR-2026-1044',
    title: 'Overflowing Public Recycling & Waste Bins at Civic Plaza',
    description:
      'Smart-compacting refuse and recycling stations on the west promenade of Civic Plaza have reached capacity and bags are accumulating beside the benches.',
    location: 'Civic Plaza West Promenade',
    ward: 'Ward 1',
    category: 'Waste & Sanitation',
    priority: 'Medium',
    department: 'Solid Waste Management Authority',
    status: 'Resolved',
    reportedBy: 'David Chen',
    reportedAt: '2026-11-14 10:12',
    estimatedResolution: '24 hours',
    aiReasoning:
      'High-visibility public plaza waste overflow requires prompt sanitation clearance without immediate structural danger.',
    timeline: [
      {
        step: 'Report Submitted',
        timestamp: '2026-11-14 10:12',
        note: 'Logged overflowing bin bank near west promenade.',
        actor: 'David Chen',
        completed: true,
      },
      {
        step: 'AI Triaged & Routed',
        timestamp: '2026-11-14 10:12',
        note: 'Categorized Medium Waste & Sanitation; routed to Solid Waste Management Authority.',
        actor: 'CivicResolve AI',
        completed: true,
      },
      {
        step: 'Crew Assigned',
        timestamp: '2026-11-14 12:40',
        note: 'Downtown collection vehicle diverted for mid-day pickup.',
        actor: 'Sanitation Route Supervisor',
        completed: true,
      },
      {
        step: 'Resolved & Verified',
        timestamp: '2026-11-14 15:05',
        note: 'Bins emptied, compaction sensors reset, and surrounding walkway sanitized.',
        actor: 'Solid Waste Management Authority',
        completed: true,
      },
    ],
  },
  {
    id: 'CR-2026-1045',
    title: 'Malfunctioning Pedestrian Signal Timer at 5th & Market',
    description:
      'The pedestrian walk phase at 5th Ave & Market St stays stuck on flashing red even when the crosswalk button is pressed, causing school commuters to cross unsafely.',
    location: '5th Ave & Market St Intersection',
    ward: 'Ward 5',
    category: 'Traffic & Signals',
    priority: 'Critical',
    department: 'Traffic Engineering Bureau',
    status: 'In Progress',
    reportedBy: 'Hannah Abbott',
    reportedAt: '2026-11-20 07:50',
    estimatedResolution: '6–12 hours',
    aiReasoning:
      'Pedestrian signal failure at a major school-route intersection represents an acute life-safety traffic hazard.',
    timeline: [
      {
        step: 'Report Submitted',
        timestamp: '2026-11-20 07:50',
        note: 'Reported stuck pedestrian phase during morning school rush.',
        actor: 'Hannah Abbott',
        completed: true,
      },
      {
        step: 'AI Triaged & Routed',
        timestamp: '2026-11-20 07:50',
        note: 'Escalated to Critical Traffic & Signals priority; routed to Traffic Engineering Bureau.',
        actor: 'CivicResolve AI',
        completed: true,
      },
      {
        step: 'Crew Assigned',
        timestamp: '2026-11-20 09:05',
        note: 'Signal technician inspecting controller cabinet relay and push-button loop.',
        actor: 'Traffic Signal Unit 3',
        completed: true,
      },
      {
        step: 'Resolved & Verified',
        timestamp: 'Pending inspection',
        note: 'Awaiting signal timing cycle certification.',
        actor: 'Traffic Engineering Bureau',
        completed: false,
      },
    ],
  },
  {
    id: 'CR-2026-1046',
    title: 'Damaged Playground Swing Chain & Loose Timber Border',
    description:
      'One toddler swing chain at Elmwood Community Park has a frayed S-hook connection and two timber border beams along the mulch pit have come loose.',
    location: 'Elmwood Community Park, North Play Area',
    ward: 'Ward 3',
    category: 'Parks & Public Spaces',
    priority: 'Low',
    department: 'Parks & Urban Forestry',
    status: 'Pending',
    reportedBy: 'Samuel Okafor',
    reportedAt: '2026-11-21 08:15',
    estimatedResolution: '3–5 business days',
    aiReasoning:
      'Localized park equipment wear requires preventive hardware tightening and carpentry maintenance.',
    timeline: [
      {
        step: 'Report Submitted',
        timestamp: '2026-11-21 08:15',
        note: 'Citizen flagged worn swing connector and loose border timber.',
        actor: 'Samuel Okafor',
        completed: true,
      },
      {
        step: 'AI Triaged & Routed',
        timestamp: '2026-11-21 08:15',
        note: 'Assigned Low priority Parks & Public Spaces ticket; routed to Parks & Urban Forestry.',
        actor: 'CivicResolve AI',
        completed: true,
      },
      {
        step: 'Crew Assigned',
        timestamp: 'Awaiting dispatch',
        note: 'Scheduled for Ward 3 park maintenance round.',
        actor: 'Parks & Urban Forestry',
        completed: false,
      },
      {
        step: 'Resolved & Verified',
        timestamp: 'Pending',
        note: 'Awaiting hardware replacement and safety check.',
        actor: 'Parks & Urban Forestry',
        completed: false,
      },
    ],
  },
];

export function loadComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem(COMPLAINTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(DEMO_COMPLAINTS));
      return DEMO_COMPLAINTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as Complaint[];
    }
    localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(DEMO_COMPLAINTS));
    return DEMO_COMPLAINTS;
  } catch {
    return DEMO_COMPLAINTS;
  }
}

export function saveComplaints(complaints: Complaint[]): void {
  try {
    localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(complaints));
  } catch {
    // Ignore storage quota errors silently in restricted environments
  }
}

export function resetDemoComplaints(): Complaint[] {
  saveComplaints(DEMO_COMPLAINTS);
  return DEMO_COMPLAINTS;
}
