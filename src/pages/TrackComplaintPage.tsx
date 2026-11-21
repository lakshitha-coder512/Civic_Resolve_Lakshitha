import { useMemo, useState } from 'react';
import { Building2, CheckCircle2, Circle, MapPin, Search, User } from 'lucide-react';
import { Complaint, IssueStatus } from '../types/civic';
import { PriorityLabel, StatusLabel } from '../components/StatusText';

interface TrackComplaintPageProps {
  complaints: Complaint[];
  selectedId: string | null;
  onSelectId: (id: string) => void;
  onGoReport: () => void;
}

const STATUS_TABS: Array<'All' | IssueStatus> = ['All', 'Pending', 'In Progress', 'Resolved'];

export function TrackComplaintPage({
  complaints,
  selectedId,
  onSelectId,
  onGoReport,
}: TrackComplaintPageProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | IssueStatus>('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return complaints.filter((c) => {
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesQuery =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.ward.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [complaints, query, statusFilter]);

  const activeComplaint = useMemo(() => {
    if (selectedId) {
      const exact = complaints.find((c) => c.id === selectedId);
      if (exact) return exact;
    }
    return filtered[0] ?? complaints[0] ?? null;
  }, [complaints, filtered, selectedId]);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-sky-50/70 to-teal-50/80 p-6 sm:p-7 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-indigo-700">Live Case Lookup</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-navy-900">
            Track Civic Complaint
          </h1>
          <p className="mt-1.5 text-sm text-slate-700">
            Search by reference ID (for example <span className="font-mono font-semibold text-indigo-800">CR-2026-1041</span>), street, or ward to inspect department routing and repair milestones.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoReport}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white text-xs font-semibold transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
        >
          Report New Issue
        </button>
      </div>

      {/* Search & Status Tabs */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ID, street, ward, or department..."
            aria-label="Search complaints"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-indigo-200 bg-white text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-indigo-50/70 border border-indigo-100 rounded-lg w-fit overflow-x-auto" role="tablist" aria-label="Filter complaints by status">
          {STATUS_TABS.map((tab) => {
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

      {/* Split Layout: Ticket Queue + Dossier */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ticket List */}
        <div className="lg:col-span-5 border border-indigo-100 rounded-xl bg-white divide-y divide-slate-200 overflow-hidden shadow-xs">
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-semibold text-navy-900">No matching complaints</p>
              <p className="mt-1 text-xs text-slate-500">
                Adjust your search term or clear the status filter to see all logged reports.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setStatusFilter('All');
                }}
                className="mt-4 px-4 py-2 rounded-lg border border-indigo-200 text-xs font-semibold text-indigo-900 hover:bg-indigo-50 cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = activeComplaint?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectId(item.id)}
                  className={`w-full text-left px-4 py-3.5 transition-colors cursor-pointer ${
                    isSelected ? 'bg-gradient-to-r from-indigo-50/80 to-teal-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-semibold text-indigo-700 tabular-nums">
                      {item.id}
                    </span>
                    <StatusLabel status={item.status} />
                  </div>
                  <p className="mt-1 text-sm font-semibold text-navy-900 line-clamp-1">
                    {item.title}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="truncate">
                      <span className="text-teal-700 font-medium">{item.ward}</span> · {item.category}
                    </span>
                    <PriorityLabel priority={item.priority} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Active Complaint Dossier & Timeline */}
        <div className="lg:col-span-7">
          {activeComplaint ? (
            <div className="border border-slate-200 rounded-2xl bg-white p-6 sm:p-7 space-y-6">
              <div className="border-b border-slate-200 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-bold text-navy-900 tabular-nums">
                      {activeComplaint.id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{activeComplaint.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">Reported {activeComplaint.reportedAt}</span>
                  </div>
                  <StatusLabel status={activeComplaint.status} />
                </div>

                <h2 className="mt-2.5 font-display text-xl font-bold text-navy-900">
                  {activeComplaint.title}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
                    <span>
                      {activeComplaint.ward} — {activeComplaint.location}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
                    <span>{activeComplaint.department}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    <span>{activeComplaint.reportedBy}</span>
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-navy-900">Citizen Description</h3>
                  <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">
                    {activeComplaint.description}
                  </p>
                </div>

                {activeComplaint.photoDataUrl && (
                  <div>
                    <h3 className="text-xs font-semibold text-navy-900 mb-2">Submitted Photo</h3>
                    <img
                      src={activeComplaint.photoDataUrl}
                      alt={`Submitted field photo for ${activeComplaint.title}`}
                      className="w-full max-h-60 object-cover rounded-xl border border-slate-200"
                    />
                  </div>
                )}

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-navy-900">AI Triage Assessment</p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {activeComplaint.aiReasoning}
                    </p>
                  </div>
                  <div className="shrink-0 flex sm:flex-col items-start sm:items-end gap-2">
                    <PriorityLabel priority={activeComplaint.priority} />
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      SLA: {activeComplaint.estimatedResolution}
                    </span>
                  </div>
                </div>
              </div>

              {/* Milestone Timeline */}
              <div className="pt-2 border-t border-slate-200">
                <h3 className="text-xs font-semibold text-navy-900 mb-4">
                  Resolution Milestones
                </h3>
                <ol className="space-y-4">
                  {activeComplaint.timeline.map((event, idx) => (
                    <li key={event.step} className="flex gap-3.5">
                      <div className="flex flex-col items-center">
                        {event.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" aria-hidden="true" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 shrink-0" aria-hidden="true" />
                        )}
                        {idx < activeComplaint.timeline.length - 1 && (
                          <div
                            className={`w-px flex-1 mt-1.5 ${
                              event.completed ? 'bg-teal-200' : 'bg-slate-200'
                            }`}
                          />
                        )}
                      </div>
                      <div className="pb-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              event.completed ? 'text-navy-900' : 'text-slate-500'
                            }`}
                          >
                            {event.step}
                          </span>
                          <span className="font-mono text-xs text-slate-500 tabular-nums">
                            {event.timestamp}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                          {event.note}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {event.actor}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl bg-white p-10 text-center">
              <p className="text-sm font-semibold text-navy-900">Select a complaint to view details</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
