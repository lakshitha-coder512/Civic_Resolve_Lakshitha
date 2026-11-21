import { ArrowRight, Building2, Gauge, Layers, MapPinned } from 'lucide-react';
import { Complaint, PageRoute } from '../types/civic';
import { SmartCityIllustration } from '../components/SmartCityIllustration';
import { PriorityLabel, StatusLabel } from '../components/StatusText';
import { WardHeatmap } from '../components/WardHeatmap';

interface HomePageProps {
  complaints: Complaint[];
  onNavigate: (page: PageRoute) => void;
  onInspectComplaint: (id: string) => void;
}

const FEATURES = [
  {
    number: '01',
    title: 'AI Classification',
    description:
      'Parses citizen descriptions and optional site photos to sort reports across roadways, drainage, lighting, sanitation, signals, and parks.',
    icon: Layers,
    actionLabel: 'Submit an issue',
    targetPage: 'report' as PageRoute,
    cardBg: 'bg-indigo-50/70 border-indigo-200 hover:border-indigo-300',
    iconBg: 'bg-indigo-600 text-white',
    numColor: 'text-indigo-700',
    linkColor: 'text-indigo-700 hover:text-indigo-900',
  },
  {
    number: '02',
    title: 'Priority Detection',
    description:
      'Evaluates hazard severity, pedestrian safety exposure, and infrastructure impact to assign Low, Medium, High, or Critical urgency.',
    icon: Gauge,
    actionLabel: 'View priority queue',
    targetPage: 'dashboard' as PageRoute,
    cardBg: 'bg-amber-50/70 border-amber-200 hover:border-amber-300',
    iconBg: 'bg-amber-500 text-white',
    numColor: 'text-amber-700',
    linkColor: 'text-amber-800 hover:text-amber-950',
  },
  {
    number: '03',
    title: 'Department Recommendation',
    description:
      'Automatically pairs each verified report with the responsible municipal engineering, utility, or field maintenance authority.',
    icon: Building2,
    actionLabel: 'Inspect routing',
    targetPage: 'dashboard' as PageRoute,
    cardBg: 'bg-sky-50/70 border-sky-200 hover:border-sky-300',
    iconBg: 'bg-sky-600 text-white',
    numColor: 'text-sky-700',
    linkColor: 'text-sky-800 hover:text-sky-950',
  },
  {
    number: '04',
    title: 'Tracking',
    description:
      'Issues a persistent reference code with transparent milestone updates from initial AI triage through crew dispatch and verification.',
    icon: MapPinned,
    actionLabel: 'Track a complaint',
    targetPage: 'track' as PageRoute,
    cardBg: 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300',
    iconBg: 'bg-emerald-600 text-white',
    numColor: 'text-emerald-700',
    linkColor: 'text-emerald-800 hover:text-emerald-950',
  },
];

export function HomePage({ complaints, onNavigate, onInspectComplaint }: HomePageProps) {
  const totalReports = complaints.length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const awaitingCount = complaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const pendingTotal = awaitingCount + inProgressCount;

  return (
    <div className="bg-white">
      {/* Hero Section with vibrant sky-to-teal-to-amber backdrop */}
      <section className="bg-gradient-to-br from-sky-50/80 via-white to-teal-50/70 border-b border-indigo-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-12 lg:pt-14 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-semibold tracking-wide text-indigo-700 mb-3">
                Municipal AI Triage &amp; Civic Operations Network
              </p>
              <h1
                className="font-display font-bold tracking-tight text-navy-900 leading-[1.1] text-balance"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.35rem)' }}
              >
                Your City. Your Voice.{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">
                  Our AI.
                </span>{' '}
                A Better Tomorrow.
              </h1>
              <p className="mt-5 text-base text-slate-600 leading-relaxed max-w-xl">
                Report damaged roads, drainage hazards, streetlight outages, and neighborhood maintenance needs in seconds. CivicResolve classifies every ticket, assesses public safety priority, and routes work orders straight to the right municipal crew.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => onNavigate('report')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white text-sm font-semibold transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                >
                  <span>Report Issue</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('track')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-900 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <span>Track Complaint</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <SmartCityIllustration />
            </div>
          </div>

          {/* Live Stats Row */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-sky-50 px-6 py-5">
              <p className="text-xs font-semibold text-indigo-700">Total Reports</p>
              <p className="mt-1.5 font-display text-3xl font-bold text-indigo-950 tabular-nums">
                {totalReports}
              </p>
              <p className="mt-1 text-xs text-indigo-800/80">
                Verified citizen submissions across all city wards
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 px-6 py-5">
              <p className="text-xs font-semibold text-emerald-700">Resolved</p>
              <p className="mt-1.5 font-display text-3xl font-bold text-emerald-900 tabular-nums">
                {resolvedCount}
              </p>
              <p className="mt-1 text-xs text-emerald-800/80">
                Completed and verified by municipal field crews
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 px-6 py-5">
              <p className="text-xs font-semibold text-amber-700">Pending</p>
              <p className="mt-1.5 font-display text-3xl font-bold text-amber-900 tabular-nums">
                {pendingTotal}
              </p>
              <p className="mt-1 text-xs text-amber-800/80 tabular-nums">
                {awaitingCount} awaiting dispatch · {inProgressCount} in progress
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Capabilities */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-teal-700">Platform Capabilities</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-navy-900 text-balance">
              From citizen report to municipal crew dispatch in four steps
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.number}
                  className={`border rounded-xl p-6 flex flex-col justify-between transition-colors ${feature.cardBg}`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-xs font-bold tabular-nums ${feature.numColor}`}>
                        {feature.number}
                      </span>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm ${feature.iconBg}`}>
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold text-navy-900">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate(feature.targetPage)}
                    className={`mt-6 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer w-fit ${feature.linkColor}`}
                  >
                    <span>{feature.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive City Ward Issue Heatmap */}
      <section className="border-t border-indigo-100 bg-gradient-to-b from-slate-50/60 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <WardHeatmap
            complaints={complaints}
            onInspectComplaint={onInspectComplaint}
          />
        </div>
      </section>

      {/* Recent Civic Reports Preview */}
      <section className="border-t border-indigo-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-indigo-700">Public Ledger</p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-navy-900">
                Recent Municipal Reports
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('track')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer whitespace-nowrap"
            >
              <span>Browse all reports</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 border border-indigo-100 rounded-xl divide-y divide-indigo-100 overflow-hidden bg-white shadow-xs">
            {complaints.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-indigo-50/40 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-semibold text-indigo-700 tabular-nums">
                      {item.id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-teal-700">{item.ward}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.department}</span>
                  </div>
                  <p className="mt-1 font-medium text-sm text-navy-900 truncate">
                    {item.title}
                  </p>
                </div>

                <div className="flex items-center gap-5 shrink-0">
                  <PriorityLabel priority={item.priority} />
                  <StatusLabel status={item.status} />
                  <button
                    type="button"
                    onClick={() => onInspectComplaint(item.id)}
                    className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-xs font-semibold text-indigo-900 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Track
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
