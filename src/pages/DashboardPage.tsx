import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  ClipboardCheck,
  Copy,
  FileText,
  Loader2,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  Wrench,
  X,
} from 'lucide-react';
import {
  AIActionPlan,
  CATEGORIES,
  Complaint,
  IssueCategory,
  IssuePriority,
  IssueStatus,
  PRIORITIES,
  UserSession,
} from '../types/civic';
import { PriorityLabel, StatusLabel } from '../components/StatusText';
import { WardHeatmap } from '../components/WardHeatmap';

interface DashboardPageProps {
  complaints: Complaint[];
  user: UserSession | null;
  onUpdateStatus: (id: string, nextStatus: IssueStatus) => void;
  onSaveActionPlan: (id: string, plan: AIActionPlan) => void;
  onPostCitizenUpdate: (id: string, message: string) => void;
  onInspectComplaint: (id: string) => void;
  onResetDemoData: () => void;
}

const STATUS_FILTERS: Array<'All' | IssueStatus> = ['All', 'Pending', 'In Progress', 'Resolved'];

const CATEGORY_BAR_COLORS: Record<IssueCategory, string> = {
  'Roads & Potholes': 'bg-indigo-600',
  'Water & Drainage': 'bg-sky-500',
  'Street Lighting': 'bg-amber-500',
  'Waste & Sanitation': 'bg-emerald-500',
  'Traffic & Signals': 'bg-rose-500',
  'Parks & Public Spaces': 'bg-teal-500',
};

export function DashboardPage({
  complaints,
  user,
  onUpdateStatus,
  onSaveActionPlan,
  onPostCitizenUpdate,
  onInspectComplaint,
  onResetDemoData,
}: DashboardPageProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | IssueStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | IssueCategory>('All');
  const [wardFilter, setWardFilter] = useState<string | null>(null);

  const [planComplaintId, setPlanComplaintId] = useState<string | null>(null);
  const [generatingPlanId, setGeneratingPlanId] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<'dispatch' | 'citizen' | null>(null);
  const [postedNoticeId, setPostedNoticeId] = useState<string | null>(null);

  const activePlanComplaint = useMemo(
    () => complaints.find((c) => c.id === planComplaintId) ?? null,
    [complaints, planComplaintId]
  );

  const stats = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;
    const pending = complaints.filter((c) => c.status === 'Pending').length;
    const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
    const urgent = complaints.filter(
      (c) => (c.priority === 'Critical' || c.priority === 'High') && c.status !== 'Resolved'
    ).length;
    return { total, resolved, pending, inProgress, urgent };
  }, [complaints]);

  const categoryBreakdown = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      category: cat,
      count: complaints.filter((c) => c.category === cat).length,
    }));
  }, [complaints]);

  const priorityBreakdown = useMemo(() => {
    return PRIORITIES.map((priority) => ({
      priority,
      count: complaints.filter((c) => c.priority === priority).length,
    }));
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    const q = search.trim().toLowerCase();
    return complaints.filter((c) => {
      const okStatus = statusFilter === 'All' || c.status === statusFilter;
      const okCat = categoryFilter === 'All' || c.category === categoryFilter;
      const okWard = !wardFilter || c.ward === wardFilter;
      const okQuery =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        c.ward.toLowerCase().includes(q);
      return okStatus && okCat && okWard && okQuery;
    });
  }, [complaints, search, statusFilter, categoryFilter, wardFilter]);

  const maxCategoryCount = Math.max(1, ...categoryBreakdown.map((item) => item.count));
  const maxPriorityCount = Math.max(1, ...priorityBreakdown.map((item) => item.count));

  const priorityBarColor = (priority: IssuePriority) => {
    if (priority === 'Critical') return 'bg-rose-600';
    if (priority === 'High') return 'bg-amber-500';
    if (priority === 'Medium') return 'bg-sky-500';
    return 'bg-emerald-500';
  };

  const handleGenerateActionPlan = async (complaint: Complaint, forceRegenerate = false) => {
    setPlanComplaintId(complaint.id);
    setPlanError(null);
    setCopiedKey(null);
    setPostedNoticeId(null);

    if (complaint.actionPlan && !forceRegenerate) {
      return;
    }

    setGeneratingPlanId(complaint.id);
    try {
      const response = await fetch('/api/action-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: complaint.id,
          title: complaint.title,
          description: complaint.description,
          location: complaint.location,
          ward: complaint.ward,
          category: complaint.category,
          priority: complaint.priority,
          department: complaint.department,
          status: complaint.status,
          reportedBy: complaint.reportedBy,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate municipal AI action plan.');
      }

      onSaveActionPlan(complaint.id, data as AIActionPlan);
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Unable to reach AI action plan generator.');
    } finally {
      setGeneratingPlanId(null);
    }
  };

  const handleCopy = async (text: string, key: 'dispatch' | 'citizen') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  };

  const formatDispatchOrderText = (c: Complaint, plan: AIActionPlan) => {
    return [
      `MUNICIPAL CREW DISPATCH ORDER — ${c.id}`,
      `Department: ${c.department}`,
      `Assigned Crew: ${plan.crewUnit}`,
      `Location: ${c.ward} — ${c.location}`,
      `Priority: ${c.priority} · Est. Duration: ${plan.estimatedCrewHours}`,
      '',
      'Equipment & Materials:',
      ...plan.equipmentChecklist.map((item) => `- ${item}`),
      '',
      'Field Instructions:',
      ...plan.fieldInstructions.map((step, i) => `${i + 1}. ${step}`),
      '',
      `Safety Protocol: ${plan.safetyProtocol}`,
    ].join('\n');
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-sky-50/70 to-teal-50/80 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-indigo-700">
            Municipal Operations Console
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-navy-900">
            Civic Dispatch Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-slate-700">
            {user
              ? `Signed in as ${user.name} (${user.role}). Inspect ward hotspots, update ticket statuses, and generate AI crew dispatch orders.`
              : 'Monitor ward hotspots, manage active civic complaints, and generate AI crew dispatch orders and citizen updates.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setWardFilter(null);
            setPlanComplaintId(null);
            onResetDemoData();
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 text-xs font-semibold text-indigo-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Colourful KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 px-5 py-4">
          <p className="text-xs font-semibold text-indigo-700">Total Reports</p>
          <p className="mt-1 font-display text-2xl font-bold text-indigo-950 tabular-nums">
            {stats.total}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-5 py-4">
          <p className="text-xs font-semibold text-amber-700">Pending Dispatch</p>
          <p className="mt-1 font-display text-2xl font-bold text-amber-900 tabular-nums">
            {stats.pending}
          </p>
        </div>
        <div className="rounded-xl border border-sky-200 bg-sky-50/70 px-5 py-4">
          <p className="text-xs font-semibold text-sky-700">In Progress</p>
          <p className="mt-1 font-display text-2xl font-bold text-sky-900 tabular-nums">
            {stats.inProgress}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-5 py-4">
          <p className="text-xs font-semibold text-emerald-700">Resolved</p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-900 tabular-nums">
            {stats.resolved}
          </p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 px-5 py-4 col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold text-rose-700">Open High / Critical</p>
          <p className="mt-1 font-display text-2xl font-bold text-rose-900 tabular-nums">
            {stats.urgent}
          </p>
        </div>
      </div>

      {/* Interactive City Ward Issue Heatmap */}
      <WardHeatmap
        complaints={complaints}
        onInspectComplaint={onInspectComplaint}
        selectedWardFilter={wardFilter}
        onFilterByWard={setWardFilter}
      />

      {/* Colourful Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-indigo-100 rounded-xl bg-white p-6">
          <h2 className="font-display text-base font-bold text-navy-900">
            Reports by Infrastructure Category
          </h2>
          <div className="mt-4 space-y-3">
            {categoryBreakdown.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium">{item.category}</span>
                  <span className="font-mono font-semibold text-navy-900 tabular-nums">
                    {item.count}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${CATEGORY_BAR_COLORS[item.category]}`}
                    style={{ width: `${(item.count / maxCategoryCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-indigo-100 rounded-xl bg-white p-6">
          <h2 className="font-display text-base font-bold text-navy-900">
            AI Priority Distribution
          </h2>
          <div className="mt-4 space-y-3.5">
            {priorityBreakdown.map((item) => (
              <div key={item.priority} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <PriorityLabel priority={item.priority} />
                  <span className="font-mono font-semibold text-navy-900 tabular-nums">
                    {item.count}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${priorityBarColor(item.priority)}`}
                    style={{ width: `${(item.count / maxPriorityCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters & Management Table */}
      <div className="border border-indigo-100 rounded-xl bg-white overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-indigo-100 bg-slate-50/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by ID, issue, or department..."
                aria-label="Filter dashboard reports"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-navy-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'All' | IssueCategory)}
              aria-label="Filter by category"
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-navy-900 focus:outline-none focus:border-indigo-600"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {wardFilter && (
              <button
                type="button"
                onClick={() => setWardFilter(null)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-teal-200 bg-teal-50 text-xs font-semibold text-teal-800 hover:bg-teal-100 cursor-pointer whitespace-nowrap"
              >
                <span>{wardFilter}</span>
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 p-1 bg-indigo-50/70 border border-indigo-100 rounded-lg w-fit overflow-x-auto" role="tablist" aria-label="Filter dashboard by status">
            {STATUS_FILTERS.map((tab) => {
              const active = statusFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-indigo-700'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-indigo-100 bg-indigo-50/40 text-xs font-semibold text-indigo-900">
                <th className="py-3 px-4 whitespace-nowrap">Reference ID</th>
                <th className="py-3 px-4">Issue &amp; Ward</th>
                <th className="py-3 px-4 whitespace-nowrap">Priority</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 px-4 text-center text-slate-500">
                    No complaints match your current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((item) => {
                  const isGeneratingThis = generatingPlanId === item.id;
                  const hasSavedPlan = Boolean(item.actionPlan);
                  return (
                    <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-indigo-700 tabular-nums whitespace-nowrap">
                        {item.id}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-navy-900 truncate">{item.title}</p>
                        <p className="text-slate-500 truncate mt-0.5">
                          <span className="text-teal-700 font-medium">{item.ward}</span> · {item.category}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PriorityLabel priority={item.priority} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[190px] truncate">
                        {item.department}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <StatusLabel status={item.status} />
                          <select
                            aria-label={`Update status for ${item.id}`}
                            value={item.status}
                            onChange={(e) =>
                              onUpdateStatus(item.id, e.target.value as IssueStatus)
                            }
                            className="px-2 py-1 rounded border border-slate-300 bg-white text-xs text-navy-900 focus:outline-none focus:border-teal-600 cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isGeneratingThis}
                            onClick={() => handleGenerateActionPlan(item)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                              hasSavedPlan
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white hover:from-indigo-700 hover:to-teal-700 shadow-xs'
                            }`}
                          >
                            {isGeneratingThis ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                                <span>Drafting...</span>
                              </>
                            ) : (
                              <>
                                <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>
                                  {hasSavedPlan ? 'View Action Plan' : 'Generate AI Action Plan'}
                                </span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => onInspectComplaint(item.id)}
                            className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 font-semibold text-indigo-900 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Action Plan Slide-Over Drawer */}
      {activePlanComplaint && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-indigo-950/40 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="action-plan-title"
        >
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto border-l border-indigo-200 shadow-2xl flex flex-col">
            <div className="px-6 py-5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-sky-50/70 to-teal-50/70 flex items-start justify-between gap-4 sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono font-bold text-indigo-700 tabular-nums">
                    {activePlanComplaint.id}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{activePlanComplaint.ward}</span>
                  <span aria-hidden="true">·</span>
                  <PriorityLabel priority={activePlanComplaint.priority} />
                </div>
                <h2
                  id="action-plan-title"
                  className="mt-1 font-display text-lg font-bold text-navy-900"
                >
                  Municipal AI Action Plan
                </h2>
                <p className="mt-0.5 text-xs text-slate-600 line-clamp-1">
                  {activePlanComplaint.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPlanComplaintId(null)}
                aria-label="Close AI Action Plan drawer"
                className="p-2 rounded-lg text-slate-500 hover:bg-white hover:text-navy-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 space-y-6">
              {generatingPlanId === activePlanComplaint.id ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" aria-hidden="true" />
                  <p className="text-sm font-semibold text-navy-900">
                    Drafting crew dispatch order &amp; citizen update...
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Gemini is reviewing {activePlanComplaint.category.toLowerCase()} protocols for{' '}
                    {activePlanComplaint.department}.
                  </p>
                </div>
              ) : planError ? (
                <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
                  <div className="flex items-start gap-2.5 text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Unable to generate AI Action Plan</p>
                      <p className="mt-1">{planError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGenerateActionPlan(activePlanComplaint, true)}
                    className="px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                  >
                    Retry Generation
                  </button>
                </div>
              ) : activePlanComplaint.actionPlan ? (
                <>
                  <div className="border border-indigo-200 rounded-xl bg-indigo-50/40 p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3 border-b border-indigo-100 pb-3.5">
                      <div>
                        <p className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Official Crew Dispatch Order</span>
                        </p>
                        <h3 className="mt-1 font-display text-base font-bold text-navy-900">
                          {activePlanComplaint.actionPlan.crewUnit}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-600">
                          {activePlanComplaint.department} · Est.{' '}
                          <span className="font-mono font-medium text-indigo-700 tabular-nums">
                            {activePlanComplaint.actionPlan.estimatedCrewHours}
                          </span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            formatDispatchOrderText(
                              activePlanComplaint,
                              activePlanComplaint.actionPlan!
                            ),
                            'dispatch'
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 text-xs font-semibold text-indigo-900 cursor-pointer shrink-0"
                      >
                        {copiedKey === 'dispatch' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Copy Order</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-navy-900 mb-2">
                        Required Equipment &amp; Materials
                      </p>
                      <ul className="space-y-1.5">
                        {activePlanComplaint.actionPlan.equipmentChecklist.map((eq, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                            <ClipboardCheck
                              className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                            <span>{eq}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-navy-900 mb-2">
                        Field Execution Steps
                      </p>
                      <ol className="space-y-2">
                        {activePlanComplaint.actionPlan.fieldInstructions.map((step, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                            <span className="font-mono font-bold text-indigo-700 tabular-nums shrink-0">
                              0{i + 1}.
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="pt-3 border-t border-indigo-100 flex items-start gap-2 text-xs text-amber-900 bg-amber-50/70 rounded-lg p-3">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
                      <div>
                        <span className="font-semibold">Onsite Safety Protocol: </span>
                        <span>{activePlanComplaint.actionPlan.safetyProtocol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-teal-200 rounded-xl bg-teal-50/30 p-5 space-y-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-teal-800 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
                        <span>Citizen Update Message Draft</span>
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            activePlanComplaint.actionPlan!.citizenUpdateMessage,
                            'citizen'
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 bg-white hover:bg-teal-50 text-xs font-semibold text-teal-900 cursor-pointer"
                      >
                        {copiedKey === 'citizen' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Copy Message</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed bg-white rounded-lg p-3.5 border border-teal-100">
                      {activePlanComplaint.actionPlan.citizenUpdateMessage}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                        Drafted {activePlanComplaint.actionPlan.generatedAt}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          onPostCitizenUpdate(
                            activePlanComplaint.id,
                            activePlanComplaint.actionPlan!.citizenUpdateMessage
                          );
                          setPostedNoticeId(activePlanComplaint.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-semibold transition-all cursor-pointer"
                      >
                        {postedNoticeId === activePlanComplaint.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Posted to Ticket Timeline</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Post Update to Ticket Timeline</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="px-6 py-4 border-t border-indigo-100 bg-slate-50 flex items-center justify-between gap-3 sticky bottom-0">
              <button
                type="button"
                disabled={generatingPlanId === activePlanComplaint.id}
                onClick={() => handleGenerateActionPlan(activePlanComplaint, true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 disabled:opacity-50 text-xs font-semibold text-indigo-900 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Regenerate Plan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const id = activePlanComplaint.id;
                  setPlanComplaintId(null);
                  onInspectComplaint(id);
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white text-xs font-semibold cursor-pointer"
              >
                Open Full Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
