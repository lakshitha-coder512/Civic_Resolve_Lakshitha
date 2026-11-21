import { AlertTriangle, CheckCircle2, Clock, Flame, Info, Wrench } from 'lucide-react';
import { IssuePriority, IssueStatus } from '../types/civic';

export function PriorityLabel({ priority }: { priority: IssuePriority }) {
  if (priority === 'Critical') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 whitespace-nowrap">
        <Flame className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Critical</span>
      </span>
    );
  }
  if (priority === 'High') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>High</span>
      </span>
    );
  }
  if (priority === 'Medium') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-800 whitespace-nowrap">
        <Info className="w-3.5 h-3.5 shrink-0 text-teal-600" aria-hidden="true" />
        <span>Medium</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 whitespace-nowrap">
      <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true" />
      <span>Low</span>
    </span>
  );
}

export function StatusLabel({ status }: { status: IssueStatus }) {
  if (status === 'Resolved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Resolved</span>
      </span>
    );
  }
  if (status === 'In Progress') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-800 whitespace-nowrap">
        <Wrench className="w-3.5 h-3.5 shrink-0 text-teal-600" aria-hidden="true" />
        <span>In Progress</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
      <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>Pending</span>
    </span>
  );
}
