import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Cpu,
  ImagePlus,
  Loader2,
  MapPin,
  Trash2,
} from 'lucide-react';
import {
  AITriageResult,
  CATEGORIES,
  Complaint,
  DEPARTMENT_BY_CATEGORY,
  IssueCategory,
  IssuePriority,
  PRIORITIES,
  UserSession,
} from '../types/civic';
import { PriorityLabel } from '../components/StatusText';

interface ReportIssuePageProps {
  user: UserSession | null;
  onSubmitComplaint: (complaint: Complaint) => void;
  onTrackComplaint: (id: string) => void;
}

const WARDS = [
  'Ward 1',
  'Ward 2',
  'Ward 3',
  'Ward 4',
  'Ward 5',
  'Ward 6',
  'Ward 7',
  'Ward 8',
];

const SAMPLE_ISSUES = [
  {
    label: 'Water Main Leak',
    title: 'Pressurized water leaking from curb valve near Riverside Market',
    location: '420 Riverside Avenue, opposite West Plaza',
    ward: 'Ward 2',
    description:
      'Clean pressurized water has been bubbling up through a cracked pavement seam beside the municipal hydrant since 6:30 AM and is pooling across the bike lane.',
  },
  {
    label: 'Traffic Signal Failure',
    title: 'Intersection traffic lights flashing red in all directions',
    location: 'King St & 9th Ave Intersection',
    ward: 'Ward 5',
    description:
      'All four signal heads at King St & 9th Ave dropped into four-way flashing red mode during morning commute, causing heavy bus backups near the middle school.',
  },
  {
    label: 'Park Lighting Outage',
    title: 'Three walkway lamps out along North Meadow footpath',
    location: 'North Meadow Park Trail, East Gate',
    ward: 'Ward 6',
    description:
      'Three consecutive pedestrian path lamps near the East Gate entrance have gone dark, leaving evening runners and dog walkers in poor visibility.',
  },
];

export function ReportIssuePage({
  user,
  onSubmitComplaint,
  onTrackComplaint,
}: ReportIssuePageProps) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [ward, setWard] = useState('Ward 4');
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState(user?.name || '');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);
  const [photoMimeType, setPhotoMimeType] = useState<string | undefined>(undefined);

  const [analyzing, setAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [triage, setTriage] = useState<AITriageResult | null>(null);

  // Manual override controls (populated automatically by AI or selectable manually)
  const [category, setCategory] = useState<IssueCategory>('Roads & Potholes');
  const [priority, setPriority] = useState<IssuePriority>('Medium');
  const [department, setDepartment] = useState<string>(DEPARTMENT_BY_CATEGORY['Roads & Potholes']);
  const [estimatedResolution, setEstimatedResolution] = useState('2–4 business days');
  const [reasoning, setReasoning] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setFormError('Please choose an image smaller than 4 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result);
        setPhotoMimeType(file.type || 'image/jpeg');
        setFormError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const applySample = (sample: (typeof SAMPLE_ISSUES)[number]) => {
    setTitle(sample.title);
    setLocation(sample.location);
    setWard(sample.ward);
    setDescription(sample.description);
    setFormError(null);
    setAiError(null);
    setTriage(null);
  };

  const handleAnalyzeWithAI = async () => {
    if (!title.trim() || !description.trim()) {
      setFormError('Enter an issue title and description before running AI triage.');
      return;
    }

    setFormError(null);
    setAiError(null);
    setAnalyzing(true);

    try {
      const base64Data = photoDataUrl ? photoDataUrl.split(',')[1] : undefined;
      const response = await fetch('/api/analyze-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          location: `${ward} · ${location.trim() || 'Unspecified address'}`,
          imageBase64: base64Data,
          imageMimeType: photoMimeType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'AI classification service returned an error.');
      }

      const result = data as AITriageResult;
      setTriage(result);
      setCategory(result.category);
      setPriority(result.priority);
      setDepartment(result.department);
      setEstimatedResolution(result.estimatedResolution);
      setReasoning(result.reasoning);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Unable to reach AI triage service.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCategoryChange = (nextCategory: IssueCategory) => {
    setCategory(nextCategory);
    setDepartment(DEPARTMENT_BY_CATEGORY[nextCategory]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !description.trim()) {
      setFormError('Please fill in the issue title, street location, and description.');
      return;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const randomSuffix = Math.floor(1100 + Math.random() * 8800);
    const id = `CR-${now.getFullYear()}-${randomSuffix}`;
    const citizenName = reportedBy.trim() || user?.name || 'Anonymous Resident';

    const newComplaint: Complaint = {
      id,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      ward,
      category,
      priority,
      department,
      status: 'Pending',
      reportedBy: citizenName,
      reportedAt: timestamp,
      estimatedResolution,
      aiReasoning:
        reasoning.trim() ||
        `Classified under ${category} (${priority} priority) and routed to ${department}.`,
      photoDataUrl,
      timeline: [
        {
          step: 'Report Submitted',
          timestamp,
          note: `Submitted via CivicResolve citizen portal for ${location.trim()}.`,
          actor: citizenName,
          completed: true,
        },
        {
          step: 'AI Triaged & Routed',
          timestamp,
          note: `Assigned ${priority} priority and queued for ${department}.`,
          actor: triage ? 'CivicResolve AI' : 'Citizen Intake Routing',
          completed: true,
        },
        {
          step: 'Crew Assigned',
          timestamp: 'Awaiting dispatch',
          note: `Pending field crew assignment by ${department}.`,
          actor: department,
          completed: false,
        },
        {
          step: 'Resolved & Verified',
          timestamp: 'Pending',
          note: 'Awaiting completion and municipal quality verification.',
          actor: department,
          completed: false,
        },
      ],
    };

    onSubmitComplaint(newComplaint);
    setSubmittedComplaint(newComplaint);
  };

  const handleResetForm = () => {
    setTitle('');
    setLocation('');
    setDescription('');
    setPhotoDataUrl(undefined);
    setPhotoMimeType(undefined);
    setTriage(null);
    setReasoning('');
    setAiError(null);
    setFormError(null);
    setSubmittedComplaint(null);
  };

  if (submittedComplaint) {
    return (
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="border border-slate-200 rounded-2xl bg-white p-8">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold text-navy-900">
            Complaint Logged &amp; Routed
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Your civic issue has been saved to the public ledger and queued for municipal dispatch.
          </p>

          <div className="mt-6 border border-slate-200 rounded-xl bg-slate-50 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">Tracking Reference ID</p>
              <p className="mt-1 font-mono text-lg font-bold text-navy-900 tabular-nums">
                {submittedComplaint.id}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Assigned Department</p>
              <p className="mt-1 text-sm font-semibold text-navy-900">
                {submittedComplaint.department}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Category &amp; Priority</p>
              <div className="mt-1 flex items-center gap-2 text-sm font-medium text-navy-900">
                <span>{submittedComplaint.category}</span>
                <span aria-hidden="true">·</span>
                <PriorityLabel priority={submittedComplaint.priority} />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500">Target Resolution Window</p>
              <p className="mt-1 text-sm font-semibold text-teal-700 tabular-nums">
                {submittedComplaint.estimatedResolution}
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onTrackComplaint(submittedComplaint.id)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              <span>Track This Complaint</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-navy-900 text-sm font-semibold transition-colors cursor-pointer"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-sky-50/70 to-teal-50/80 p-6 sm:p-7 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-indigo-700">Citizen Intake Portal</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-navy-900">
            Report a Civic Issue
          </h1>
          <p className="mt-1.5 text-sm text-slate-700 max-w-2xl">
            Describe the municipal problem below. Run AI Triage to automatically classify the issue, detect priority severity, and recommend the responsible department before submitting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-600 mr-1">Quick fill:</span>
          {SAMPLE_ISSUES.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => applySample(sample)}
              className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 text-xs font-semibold text-indigo-900 transition-colors cursor-pointer whitespace-nowrap"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Issue Details Form */}
        <div className="lg:col-span-7 border border-indigo-100 rounded-2xl bg-white p-6 sm:p-7 space-y-5 shadow-xs">
          {formError && (
            <div role="alert" className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label htmlFor="issue-title" className="block text-xs font-semibold text-navy-900 mb-1.5">
              Issue Title
            </label>
            <input
              id="issue-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Collapsed storm drain grate at Oakridge Ave"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="issue-location" className="block text-xs font-semibold text-navy-900 mb-1.5">
                Street Address or Intersection
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <input
                  id="issue-location"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., 420 Riverside Ave & 4th St"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
                />
              </div>
            </div>

            <div>
              <label htmlFor="issue-ward" className="block text-xs font-semibold text-navy-900 mb-1.5">
                City Ward
              </label>
              <select
                id="issue-ward"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-navy-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
              >
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="issue-description" className="block text-xs font-semibold text-navy-900 mb-1.5">
              Detailed Description
            </label>
            <textarea
              id="issue-description"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the hazard, affected lanes or walkways, and how long the issue has been present..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div>
              <label htmlFor="reporter-name" className="block text-xs font-semibold text-navy-900 mb-1.5">
                Your Name (Optional)
              </label>
              <input
                id="reporter-name"
                type="text"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                placeholder="Anonymous Resident"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-navy-900 mb-1.5">
                Field Photo (Optional)
              </span>
              {photoDataUrl ? (
                <div className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 bg-slate-50">
                  <img
                    src={photoDataUrl}
                    alt="Uploaded civic issue preview"
                    className="w-11 h-11 rounded object-cover shrink-0"
                  />
                  <span className="text-xs text-slate-600 truncate flex-1">
                    Photo attached for AI inspection
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoDataUrl(undefined);
                      setPhotoMimeType(undefined);
                    }}
                    aria-label="Remove attached photo"
                    className="p-1.5 text-slate-500 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border border-dashed border-slate-300 hover:border-teal-600 bg-slate-50/50 text-xs font-medium text-slate-700 cursor-pointer transition-colors">
                  <ImagePlus className="w-4 h-4 text-teal-700" aria-hidden="true" />
                  <span>Attach photo (PNG/JPG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="sr-only"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              disabled={analyzing}
              onClick={handleAnalyzeWithAI}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 disabled:opacity-60 text-white text-sm font-semibold transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Analyzing Issue...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4 text-amber-300" aria-hidden="true" />
                  <span>Analyze with AI</span>
                </>
              )}
            </button>

            <span className="text-xs text-slate-500">
              AI predicts category, priority, and department routing
            </span>
          </div>
        </div>

        {/* Right: AI Classification & Routing Panel */}
        <aside className="lg:col-span-5 border border-indigo-200/80 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-sky-50/40 to-teal-50/60 p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between gap-2 border-b border-indigo-100 pb-4">
            <div>
              <p className="text-xs font-semibold text-indigo-700">Automated Dispatch Review</p>
              <h2 className="mt-0.5 font-display text-lg font-bold text-navy-900">
                Classification &amp; Routing
              </h2>
            </div>
            {triage && (
              <span className="text-xs font-semibold text-emerald-700">AI Verified</span>
            )}
          </div>

          {aiError && (
            <div role="alert" className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
              <p className="font-semibold">AI Triage Notice</p>
              <p>{aiError}</p>
              <p className="text-rose-700">
                You can still select the category and priority manually below to submit your report.
              </p>
            </div>
          )}

          {triage && (
            <div className="p-4 rounded-xl bg-white border border-indigo-100 space-y-2 shadow-xs">
              <p className="text-xs font-semibold text-indigo-900">AI Triage Rationale</p>
              <p className="text-xs text-slate-600 leading-relaxed">{triage.reasoning}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="triage-category" className="block text-xs font-semibold text-navy-900 mb-1.5">
                Infrastructure Category
              </label>
              <select
                id="triage-category"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as IssueCategory)}
                className="w-full px-3 py-2.5 rounded-lg border border-indigo-200 bg-white text-sm text-navy-900 focus:outline-none focus:border-indigo-600"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="triage-priority" className="block text-xs font-semibold text-navy-900 mb-1.5">
                Priority Level
              </label>
              <select
                id="triage-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full px-3 py-2.5 rounded-lg border border-indigo-200 bg-white text-sm text-navy-900 focus:outline-none focus:border-indigo-600"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-1 space-y-2 text-xs">
              <div className="flex items-start justify-between gap-3 py-2 border-t border-indigo-100">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                  <span>Department</span>
                </span>
                <span className="font-semibold text-navy-900 text-right">{department}</span>
              </div>
              <div className="flex items-center justify-between gap-3 py-2 border-t border-indigo-100">
                <span className="text-slate-600">Target SLA</span>
                <span className="font-mono font-semibold text-teal-700 tabular-nums">
                  {estimatedResolution}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-semibold transition-all shadow-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            <span>Submit Official Complaint</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </aside>
      </form>
    </section>
  );
}
