import { useEffect, useState } from 'react';
import {
  loadComplaints,
  resetDemoComplaints,
  saveComplaints,
  USER_STORAGE_KEY,
} from './data/demoComplaints';
import {
  AIActionPlan,
  Complaint,
  IssueStatus,
  PageRoute,
  UserSession,
} from './types/civic';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';

function loadUserSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
}

function getFormattedTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [complaints, setComplaints] = useState<Complaint[]>(() => loadComplaints());
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
    () => loadComplaints()[0]?.id ?? null
  );
  const [user, setUser] = useState<UserSession | null>(() => loadUserSession());

  useEffect(() => {
    saveComplaints(complaints);
  }, [complaints]);

  const navigate = (page: PageRoute) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitComplaint = (newComplaint: Complaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
    setSelectedComplaintId(newComplaint.id);
  };

  const handleInspectComplaint = (id: string) => {
    setSelectedComplaintId(id);
    navigate('track');
  };

  const handleUpdateStatus = (id: string, nextStatus: IssueStatus) => {
    const timestamp = getFormattedTimestamp();
    const actorName = user?.name || 'Municipal Operations Desk';

    setComplaints((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updatedTimeline = item.timeline.map((step, index) => {
          if (index <= 1) return step;
          if (index === 2) {
            if (nextStatus === 'In Progress' || nextStatus === 'Resolved') {
              return {
                ...step,
                completed: true,
                timestamp: step.completed ? step.timestamp : timestamp,
                note: step.completed
                  ? step.note
                  : `Field crew dispatched by ${actorName}.`,
                actor: step.completed ? step.actor : actorName,
              };
            }
            return {
              ...step,
              completed: false,
              timestamp: 'Awaiting dispatch',
              note: `Returned to dispatch queue for ${item.department}.`,
            };
          }
          if (index === 3) {
            if (nextStatus === 'Resolved') {
              return {
                ...step,
                completed: true,
                timestamp,
                note: `Marked resolved and verified by ${actorName}.`,
                actor: actorName,
              };
            }
            return {
              ...step,
              completed: false,
              timestamp: 'Pending',
              note: 'Awaiting field completion and verification.',
            };
          }
          return step;
        });

        return {
          ...item,
          status: nextStatus,
          timeline: updatedTimeline,
        };
      })
    );
  };

  const handleSaveActionPlan = (id: string, plan: AIActionPlan) => {
    setComplaints((prev) =>
      prev.map((item) => (item.id === id ? { ...item, actionPlan: plan } : item))
    );
  };

  const handlePostCitizenUpdate = (id: string, message: string) => {
    const timestamp = getFormattedTimestamp();
    const actorName = user?.name || 'Municipal Operations Desk';

    setComplaints((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextStatus: IssueStatus =
          item.status === 'Pending' ? 'In Progress' : item.status;
        const updatedTimeline = item.timeline.map((step, index) => {
          if (index === 2) {
            return {
              ...step,
              completed: true,
              timestamp,
              note: message,
              actor: actorName,
            };
          }
          return step;
        });
        return {
          ...item,
          status: nextStatus,
          timeline: updatedTimeline,
        };
      })
    );
  };

  const handleResetDemoData = () => {
    const fresh = resetDemoComplaints();
    setComplaints(fresh);
    setSelectedComplaintId(fresh[0]?.id ?? null);
  };

  const handleLogin = (session: UserSession) => {
    setUser(session);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage error
    }
    navigate(session.role === 'Municipal Official' ? 'dashboard' : 'home');
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignore storage error
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy-900">
      <Navbar
        currentPage={currentPage}
        onNavigate={navigate}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            complaints={complaints}
            onNavigate={navigate}
            onInspectComplaint={handleInspectComplaint}
          />
        )}
        {currentPage === 'report' && (
          <ReportIssuePage
            user={user}
            onSubmitComplaint={handleSubmitComplaint}
            onTrackComplaint={handleInspectComplaint}
          />
        )}
        {currentPage === 'track' && (
          <TrackComplaintPage
            complaints={complaints}
            selectedId={selectedComplaintId}
            onSelectId={setSelectedComplaintId}
            onGoReport={() => navigate('report')}
          />
        )}
        {currentPage === 'dashboard' && (
          <DashboardPage
            complaints={complaints}
            user={user}
            onUpdateStatus={handleUpdateStatus}
            onSaveActionPlan={handleSaveActionPlan}
            onPostCitizenUpdate={handlePostCitizenUpdate}
            onInspectComplaint={handleInspectComplaint}
            onResetDemoData={handleResetDemoData}
          />
        )}
        {currentPage === 'login' && <LoginPage onLogin={handleLogin} />}
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
}
